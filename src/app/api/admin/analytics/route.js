export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

function getAdminDB() {
  if (!getApps().length) {
    const projectId =
      process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ||
      process.env.FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    let privateKey = process.env.FIREBASE_PRIVATE_KEY;

    if (!projectId || !clientEmail || !privateKey) {
      throw new Error("Missing Firebase Admin credentials");
    }
    if (privateKey.includes("\\n")) privateKey = privateKey.replace(/\\n/g, "\n");

    initializeApp({
      credential: cert({ projectId, clientEmail, privateKey }),
    });
  }
  return getFirestore();
}

async function verifyAuth(request) {
  getAdminDB();
  const authHeader =
    request.headers.get("authorization") || request.headers.get("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) return null;
  const idToken = authHeader.split(" ")[1];
  const { getAuth } = await import("firebase-admin/auth");
  try {
    const decoded = await getAuth().verifyIdToken(idToken);
    return decoded;
  } catch {
    return null;
  }
}

async function checkSuperAdmin(uid) {
  const db = getAdminDB();
  const userDoc = await db.collection("users").doc(uid).get();
  const userData = userDoc.data();
  return userData?.role === "super_admin";
}

// Helper function to check if college is outer college
function isOuterCollege(college) {
  if (!college || typeof college !== 'string') return false;
  const collegeLower = college.toLowerCase().trim();
  
  // List of keywords that indicate it's NOT an outer college (it's SEC)
  const secKeywords = [
    'saveetha engineering college',
    'saveetha',
    'sec',
  ];
  
  // If college contains any SEC keyword, it's NOT outer college
  for (const keyword of secKeywords) {
    if (collegeLower.includes(keyword)) {
      return false;
    }
  }
  
  // If it doesn't match SEC keywords and has some value, it's outer college
  return collegeLower.length > 0;
}

export async function GET(request) {
  try {
    const decoded = await verifyAuth(request);
    if (!decoded) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const isSuperAdmin = await checkSuperAdmin(decoded.uid);
    if (!isSuperAdmin) {
      return NextResponse.json(
        { error: "Super admin access required" },
        { status: 403 }
      );
    }

    const db = getAdminDB();

    // Fetch all events and special events to get department info
    const eventsSnap = await db.collection("events").get();
    const specialEventsSnap = await db.collection("specialEvents").get();

    // Create event maps for quick lookup
    const eventMap = {};
    const specialEventMap = {};

    eventsSnap.docs.forEach(doc => {
      const data = doc.data();
      eventMap[doc.id] = {
        title: data.title || data.name || 'Unknown Event',
        category: data.category,
        departments: data.departments || (data.department ? [data.department] : []),
      };
    });

    specialEventsSnap.docs.forEach(doc => {
      const data = doc.data();
      specialEventMap[doc.id] = {
        title: data.title || data.name || 'Unknown Event',
        category: data.category,
        departments: data.departments || (data.department ? [data.department] : []),
      };
    });

    // Fetch all registrations (both events and special events)
    const registrationsSnap = await db.collection("registrations").get();

    // Initialize analytics data
    const analytics = {
      overall: {
        totalParticipants: 0,
        totalAmount: 0,
        events: 0,
        workshops: 0,
      },
      departmentWise: {},
      outerCollege: {
        totalParticipants: 0,
        totalAmount: 0,
        students: [], // Store outer college student details
      },
      passes: {
        generalPass: 0,
        customPass: 0,
        generalPassAmount: 0,
        customPassAmount: 0,
      },
    };

    // Track event/workshop counts to avoid duplicates
    const eventCounts = {
      events: new Set(),
      workshops: new Set(),
    };

    // Track which users registered for which departments (for revenue calculation)
    const userDepartments = {}; // { userUid: Set of department IDs }
    const userDeptEvents = {}; // { userUid: { deptId: Set of eventIds } }

    // Process registrations
    registrationsSnap.docs.forEach(doc => {
      const data = doc.data();
      
      // Only count confirmed/paid registrations
      if (data.paymentStatus !== 'paid' && data.status !== 'confirmed') {
        return;
      }

      const eventId = data.eventId;
      const isSpecial = data.isSpecialEvent === true;
      const eventInfo = isSpecial ? specialEventMap[eventId] : eventMap[eventId];
      
      if (!eventInfo) return; // Skip if event not found

      const isWorkshop = eventInfo.category?.toLowerCase() === 'workshop';
      const college = data.college || '';
      const userUid = data.userUid;

      // Overall stats - count each registration once
      analytics.overall.totalParticipants += 1;
      
      // Track unique event/workshop IDs to count each only once
      if (isWorkshop) {
        eventCounts.workshops.add(eventId);
      } else {
        eventCounts.events.add(eventId);
      }

      // Department-wise stats - count participants per department
      const departments = eventInfo.departments || [];
      departments.forEach(deptId => {
        if (!analytics.departmentWise[deptId]) {
          analytics.departmentWise[deptId] = {
            totalParticipants: 0,
            totalAmount: 0,
            events: {}, // Track event-wise details: { eventId: { name, participants, outerParticipants, innerParticipants, revenue } }
          };
        }
        analytics.departmentWise[deptId].totalParticipants += 1;

        // Track event-wise details
        if (!analytics.departmentWise[deptId].events[eventId]) {
          analytics.departmentWise[deptId].events[eventId] = {
            name: eventInfo.title || 'Unknown Event',
            category: eventInfo.category || 'Event',
            participants: 0,
            outerParticipants: 0,
            innerParticipants: 0,
            revenue: 0,
          };
        }
        analytics.departmentWise[deptId].events[eventId].participants += 1;
        
        // Track outer vs inner college participants
        if (isOuterCollege(college)) {
          analytics.departmentWise[deptId].events[eventId].outerParticipants += 1;
        } else {
          analytics.departmentWise[deptId].events[eventId].innerParticipants += 1;
        }

        // Track user-department relationship for revenue calculation
        if (userUid) {
          if (!userDepartments[userUid]) {
            userDepartments[userUid] = new Set();
          }
          userDepartments[userUid].add(deptId);

          // Track user-department-event relationship
          if (!userDeptEvents[userUid]) {
            userDeptEvents[userUid] = {};
          }
          if (!userDeptEvents[userUid][deptId]) {
            userDeptEvents[userUid][deptId] = new Set();
          }
          userDeptEvents[userUid][deptId].add(eventId);
        }
      });

      // Outer college stats
      if (isOuterCollege(college)) {
        analytics.outerCollege.totalParticipants += 1;
        // Store student details for outer college students
        analytics.outerCollege.students.push({
          name: data.name || 'N/A',
          email: data.email || 'N/A',
          college: college,
          rollNo: data.rollNo || 'N/A',
          phone: data.phone || 'N/A',
          eventId: eventId,
          registeredAt: data.registeredAt,
        });
      }
    });

    // Set final event/workshop counts
    analytics.overall.events = eventCounts.events.size;
    analytics.overall.workshops = eventCounts.workshops.size;

    // Fetch all passes to calculate revenue
    const passesSnap = await db.collection("passes").get();

    passesSnap.docs.forEach(doc => {
      const data = doc.data();
      
      // Only count verified/active passes
      if (data.paymentVerified !== true || data.status !== 'active') {
        return;
      }

      const passType = data.passType || 'general';
      const passPrice = parseFloat(data.passPrice) || 0;
      const userUid = data.userUid;

      if (passType === 'general') {
        // General pass: count totals, distribute ONLY at department level based on user's departments
        analytics.passes.generalPass += 1;
        analytics.passes.generalPassAmount += passPrice;

        if (userUid && userDepartments[userUid]) {
          const depts = Array.from(userDepartments[userUid]);
          const revenuePerDept = depts.length > 0 ? passPrice / depts.length : 0;
          depts.forEach(deptId => {
            if (analytics.departmentWise[deptId]) {
              analytics.departmentWise[deptId].totalAmount += revenuePerDept;
            }
          });
        }
      } else if (passType === 'custom') {
        // Custom pass: count totals, distribute to events in customEvents and their departments
        analytics.passes.customPass += 1;
        analytics.passes.customPassAmount += passPrice;

        const customEvents = Array.isArray(data.customEvents) ? data.customEvents : [];
        if (customEvents.length > 0) {
          const revenuePerEvent = passPrice / customEvents.length;

          customEvents.forEach(eventId => {
            const info = eventMap[eventId] || specialEventMap[eventId];
            if (!info) return;

            // Attribute to each department that owns this event
            const depts = info.departments || [];
            const revenuePerDeptForThisEvent = depts.length > 0 ? revenuePerEvent / depts.length : 0;
            depts.forEach(deptId => {
              if (!analytics.departmentWise[deptId]) {
                analytics.departmentWise[deptId] = { totalParticipants: 0, totalAmount: 0, events: {} };
              }
              analytics.departmentWise[deptId].totalAmount += revenuePerDeptForThisEvent;

              // Attribute event-level revenue ONLY for custom pass events
              if (!analytics.departmentWise[deptId].events[eventId]) {
                analytics.departmentWise[deptId].events[eventId] = {
                  name: info.title || 'Unknown Event',
                  category: info.category || 'Event',
                  participants: 0,
                  outerParticipants: 0,
                  innerParticipants: 0,
                  revenue: 0,
                };
              }
              analytics.departmentWise[deptId].events[eventId].revenue += revenuePerDeptForThisEvent;
            });
          });
        } else {
          // If no explicit custom events recorded, fallback to department-only distribution via user departments
          if (userUid && userDepartments[userUid]) {
            const depts = Array.from(userDepartments[userUid]);
            const revenuePerDept = depts.length > 0 ? passPrice / depts.length : 0;
            depts.forEach(deptId => {
              if (analytics.departmentWise[deptId]) {
                analytics.departmentWise[deptId].totalAmount += revenuePerDept;
              }
            });
          }
        }
      }
    });

    // Note: Registration revenue comes from passes, not from individual registrations
    // So overall.totalAmount is 0 (registrations are free after pass purchase)
    // All revenue is tracked in passes section

    return NextResponse.json(analytics, { status: 200 });
  } catch (error) {
    console.error("Error fetching analytics:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to fetch analytics" },
      { status: 500 }
    );
  }
}
