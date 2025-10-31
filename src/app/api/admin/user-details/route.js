export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getFirestore, FieldValue } from "firebase-admin/firestore";

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

async function checkIsSuperAdmin(uid) {
  const db = getAdminDB();
  try {
    const userDoc = await db.collection("users").doc(uid).get();
    if (!userDoc.exists) return false;
    const userData = userDoc.data();
    return userData?.role === "super_admin";
  } catch {
    return false;
  }
}

// Get user details by email (super admin only)
export async function GET(request) {
  try {
    const decoded = await verifyAuth(request);
    if (!decoded) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Check if user is super admin
    const isSuperAdmin = await checkIsSuperAdmin(decoded.uid);
    if (!isSuperAdmin) {
      return NextResponse.json(
        { error: "Super admin access required" },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email");

    if (!email) {
      return NextResponse.json(
        { error: "Email parameter is required" },
        { status: 400 }
      );
    }

    const db = getAdminDB();

    // Normalize email
    const normalizedEmail = email.toLowerCase().trim();

    // Fetch student from students collection first
    const studentsSnap = await db
      .collection("students")
      .where("email", "==", normalizedEmail)
      .get();

    if (studentsSnap.empty) {
      return NextResponse.json(
        { error: "No student found with this email" },
        { status: 404 }
      );
    }

    // Get userUid and student data from students collection
    const studentDoc = studentsSnap.docs[0];
    const userUid = studentDoc.id;
    const studentData = studentDoc.data();

    // Try to find user in users collection for additional info (admin role, etc)
    let userData = {};
    try {
      const userDocSnap = await db.collection("users").doc(userUid).get();
      if (userDocSnap.exists) {
        userData = userDocSnap.data();
      }
    } catch (e) {
      // User might not exist in users collection, that's okay
      console.log("User not found in users collection, continuing with student data");
    }

    // Fetch all registrations for this userUid
    let registrationsSnap = await db
      .collection("registrations")
      .where("userUid", "==", userUid)
      .get();

    // If no registrations found by userUid, try by email (for admin-added participants)
    if (registrationsSnap.empty) {
      registrationsSnap = await db
        .collection("registrations")
        .where("email", "==", normalizedEmail)
        .get();
    }

    // Map registrations from the already fetched data
    const registrations = registrationsSnap.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    // Separate regular and special event registrations
    const regularRegistrations = registrations.filter((r) => !r.isSpecialEvent);
    const specialEventRegistrations = registrations.filter((r) => r.isSpecialEvent);

    // Fetch all passes for this user
    const passesSnap = await db
      .collection("passes")
      .where("userUid", "==", userUid)
      .get();

    const passes = passesSnap.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    // Fetch event details for regular registrations
    const eventIds = [...new Set(regularRegistrations.map((r) => r.eventId))];
    const eventDetailsMap = {};

    for (const eventId of eventIds) {
      const eventDoc = await db.collection("events").doc(eventId).get();
      if (eventDoc.exists) {
        eventDetailsMap[eventId] = {
          id: eventId,
          ...eventDoc.data(),
        };
      }
    }

    // Fetch special event details
    const specialEventIds = [...new Set(specialEventRegistrations.map((r) => r.eventId))];
    const specialEventDetailsMap = {};

    for (const specialEventId of specialEventIds) {
      const specialEventDoc = await db.collection("specialEvents").doc(specialEventId).get();
      if (specialEventDoc.exists) {
        specialEventDetailsMap[specialEventId] = {
          id: specialEventId,
          ...specialEventDoc.data(),
        };
      }
    }

    // Enrich registrations with event details
    const enrichedRegistrations = regularRegistrations.map((reg) => ({
      ...reg,
      eventDetails: eventDetailsMap[reg.eventId] || null,
    }));

    // Enrich special event registrations with event details
    const enrichedSpecialEventRegistrations = specialEventRegistrations.map((reg) => ({
      ...reg,
      specialEventDetails: specialEventDetailsMap[reg.eventId] || null,
    }));

    // Calculate totals
    const totalAmount = [
      ...enrichedRegistrations.map((r) => r.amount || 0),
      ...enrichedSpecialEventRegistrations.map((r) => r.amount || 0),
      ...passes.map((p) => p.passPrice || 0),
    ].reduce((sum, amount) => sum + amount, 0);

    return NextResponse.json({
      user: {
        id: userUid,
        uid: userUid,
        email: normalizedEmail,
        // Student data from students collection
        name: studentData.name || '',
        rollNo: studentData.rollNo || null,
        college: studentData.college || null,
        photoURL: studentData.photoURL || null,
        isStudent: studentData.isStudent || false,
        hasEventPass: studentData.hasEventPass || false,
        profileCompleted: studentData.profileCompleted || false,
        // Admin/user data from users collection
        ...userData,
      },
      registrations: enrichedRegistrations,
      specialEventRegistrations: enrichedSpecialEventRegistrations,
      passes,
      summary: {
        totalRegistrations: enrichedRegistrations.length,
        totalSpecialEventRegistrations: enrichedSpecialEventRegistrations.length,
        totalPasses: passes.length,
        totalAmount,
      },
    });
  } catch (error) {
    console.error("Error fetching user details:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to fetch user details" },
      { status: 500 }
    );
  }
}
