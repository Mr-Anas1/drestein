export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getFirestore, FieldValue } from "firebase-admin/firestore";

// Initialize Firebase Admin SDK once per runtime
function getAdminDB() {
  if (!getApps().length) {
    const projectId =
      process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ||
      process.env.FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    let privateKey = process.env.FIREBASE_PRIVATE_KEY;

    console.log("Firebase Admin SDK initialization:");
    console.log("Project ID:", projectId ? "✓ Set" : "✗ Missing");
    console.log("Client Email:", clientEmail ? "✓ Set" : "✗ Missing");
    console.log("Private Key:", privateKey ? "✓ Set" : "✗ Missing");

    // Validate presence
    if (!projectId || !clientEmail || !privateKey) {
      const missing = [];
      if (!projectId) missing.push("FIREBASE_PROJECT_ID");
      if (!clientEmail) missing.push("FIREBASE_CLIENT_EMAIL");
      if (!privateKey) missing.push("FIREBASE_PRIVATE_KEY");

      throw new Error(
        `Missing Firebase Admin credentials: ${missing.join(
          ", "
        )}. Please set these in .env.local (PRIVATE KEY must be quoted and include \\n for newlines).`
      );
    }

    // Convert escaped newlines to real newlines
    if (privateKey.includes("\\n")) {
      privateKey = privateKey.replace(/\\n/g, "\n");
    }

    // Ensure key looks like a PEM
    if (!privateKey.includes("BEGIN PRIVATE KEY")) {
      throw new Error(
        "FIREBASE_PRIVATE_KEY is not a valid PEM string. Ensure it is wrapped in quotes and preserves newlines."
      );
    }

    try {
      initializeApp({
        credential: cert({
          projectId,
          clientEmail,
          privateKey,
        }),
      });
      console.log("Firebase Admin SDK initialized successfully");
    } catch (initError) {
      console.error("Firebase Admin SDK initialization failed:", initError);
      throw new Error(
        `Firebase Admin SDK initialization failed: ${initError.message}`
      );
    }
  }
  return getFirestore();
}

async function verifyAuth(request) {
  // Ensure Admin SDK is initialized before verifying tokens
  getAdminDB();
  const authHeader =
    request.headers.get("authorization") ||
    request.headers.get("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) return null;
  const idToken = authHeader.split(" ")[1];
  const { getAuth } = await import("firebase-admin/auth");
  try {
    const decoded = await getAuth().verifyIdToken(idToken);
    return decoded; // contains uid, email, etc.
  } catch (e) {
    console.error("ID token verification failed:", e);
    return null;
  }
}

export async function POST(request) {
  try {
    const decoded = await verifyAuth(request);
    if (!decoded) {
      return NextResponse.json(
        {
          error:
            "Authentication required. Please sign in with Google to register.",
        },
        { status: 401 }
      );
    }

    const { eventId, name, email, transactionId, userUid, isSpecialEvent, isAdminAdding, rollNo, college, teamMembers } =
      await request.json();

    // Make transactionId optional
    if (!eventId || !name || !email || !userUid) {
      return NextResponse.json(
        { error: "Event ID, name, email, and authentication are required" },
        { status: 400 }
      );
    }

    // Verify the userUid matches the authenticated user
    // This ensures users can only register themselves, unless they're an admin
    if (decoded.uid !== userUid && !isAdminAdding) {
      // Check if the authenticated user is an admin
      const db = getAdminDB();
      const userDoc = await db.collection("users").doc(decoded.uid).get();
      const userData = userDoc.data();
      
      // Only allow if user is admin or super_admin
      if (!userData || (userData.role !== 'admin' && userData.role !== 'super_admin')) {
        return NextResponse.json(
          { error: "Unauthorized: You can only register yourself" },
          { status: 403 }
        );
      }
    }

    const db = getAdminDB();

    // Fetch the event to determine category (event vs workshop)
    let eventSnap;
    try {
      // Check if this is a special event or regular event
      const collectionName = isSpecialEvent ? "specialEvents" : "events";
      eventSnap = await db.collection(collectionName).doc(eventId).get();
      if (!eventSnap.exists) {
        return NextResponse.json({ error: "Event not found" }, { status: 404 });
      }
    } catch (e) {
      console.error("Failed to fetch event for registration:", e);
      return NextResponse.json(
        { error: "Failed to fetch event" },
        { status: 500 }
      );
    }

    const eventData = eventSnap.data() || {};

    // Enforce expiry date if provided on the event
    try {
      const expiryRaw = eventData.expiryDate;
      if (expiryRaw) {
        const expiry = new Date(expiryRaw);
        // If the stored date has no time, consider end of day local
        if (!isNaN(expiry.getTime())) {
          const now = new Date();
          // Treat the expiry as inclusive end-of-day when only a date is provided
          const expiryEndOfDay = new Date(expiry);
          if (
            expiryRaw.length <= 10 &&
            /\d{4}-\d{2}-\d{2}/.test(String(expiryRaw))
          ) {
            expiryEndOfDay.setHours(23, 59, 59, 999);
          }
          if (now > expiryEndOfDay) {
            return NextResponse.json(
              { error: "Registration closed: Event has expired." },
              { status: 403 }
            );
          }
        }
      }
    } catch (e) {
      // If parsing fails, do not block; treat as no expiry
    }
    const isWorkshop =
      String(eventData.category || "").toLowerCase() === "workshop";

    // Check if the current user is an admin (admin adding participant for someone else)
    const isAdminAddingParticipant = isAdminAdding === true || decoded.uid !== userUid;

    // If not a workshop and not admin-added, require a verified Event Pass
    // Also capture the active pass id to mark registration as confirmed
    let activePassId = null;
    if (!isWorkshop && !isAdminAddingParticipant) {
      try {
        // Check student's hasEventPass flag first (fast path)
        const studentDoc = await db.collection("students").doc(userUid).get();
        const studentData = studentDoc.data();

        let hasEventPass = !!studentData?.hasEventPass;

        // Fallback: if flag not set, verify directly against passes collection
        if (!hasEventPass) {
          const passSnap = await db
            .collection("passes")
            .where("userUid", "==", userUid)
            .where("paymentVerified", "==", true)
            .where("status", "==", "active")
            .get();
          hasEventPass = !passSnap.empty;
          if (hasEventPass) {
            // Prefer general pass if present
            const generalDoc = passSnap.docs.find(d => d.data()?.passType === 'general');
            activePassId = (generalDoc || passSnap.docs[0])?.id || null;
          }
        } else {
          // If flag set, try to pull pass id from student document
          activePassId = studentData?.eventPassId || null;
          if (!activePassId) {
            const passSnap = await db
              .collection("passes")
              .where("userUid", "==", userUid)
              .where("paymentVerified", "==", true)
              .where("status", "==", "active")
              .get();
            if (!passSnap.empty) {
              const generalDoc = passSnap.docs.find(d => d.data()?.passType === 'general');
              activePassId = (generalDoc || passSnap.docs[0])?.id || null;
            }
          }
        }

        if (!hasEventPass) {
          return NextResponse.json(
            {
              error:
                "An active Event Pass is required to register for events. Please purchase a pass first.",
              code: "PASS_REQUIRED",
            },
            { status: 403 }
          );
        }
      } catch (e) {
        console.error("Error checking event pass:", e);
        return NextResponse.json(
          { error: "Failed to verify Event Pass status" },
          { status: 500 }
        );
      }
    }

    // Duplicate check - by email for admin-added participants, by uid for regular registrations
    let dupSnap;
    try {
      console.log("Attempting to query registrations collection...");
      
      if (isAdminAddingParticipant) {
        // For admin-added participants, check by email to prevent duplicates
        console.log("Query parameters (admin adding):", { eventId, email });
        dupSnap = await db
          .collection("registrations")
          .where("eventId", "==", eventId)
          .where("email", "==", email.toLowerCase().trim())
          .get();
      } else {
        // For regular registrations, check by userUid
        console.log("Query parameters (regular):", { eventId, userUid });
        dupSnap = await db
          .collection("registrations")
          .where("eventId", "==", eventId)
          .where("userUid", "==", userUid)
          .get();
      }

      console.log(
        "Query successful, found",
        dupSnap.size,
        "existing registrations"
      );
    } catch (firestoreError) {
      console.error("Firestore query error details:");
      console.error("Error code:", firestoreError.code);
      console.error("Error message:", firestoreError.message);
      console.error("Error details:", firestoreError.details);
      console.error("Full error:", firestoreError);

      return NextResponse.json(
        {
          error: "Database access error. Please check Firebase configuration.",
          details: firestoreError.message,
          code: firestoreError.code,
          debug: {
            eventId,
            userUid,
            errorType: firestoreError.constructor.name,
          },
        },
        { status: 500 }
      );
    }

    if (!dupSnap.empty) {
      return NextResponse.json(
        {
          error:
            "You are already registered for this event. Check your email for confirmation details.",
        },
        { status: 409 }
      );
    }

    // For admin-added participants, set status to confirmed and paid
    // Fetch student profile to enrich registration details (rollNo, college)
    let studentRollNo = rollNo && String(rollNo).trim() ? String(rollNo).trim() : undefined;
    let studentCollege = college && String(college).trim() ? String(college).trim() : undefined;
    try {
      if (!studentRollNo || !studentCollege) {
        const studentDoc = await db.collection("students").doc(userUid).get();
        if (studentDoc.exists) {
          const s = studentDoc.data() || {};
          if (!studentRollNo && s.rollNo) studentRollNo = String(s.rollNo).trim();
          if (!studentCollege && s.college) studentCollege = String(s.college).trim();
        }
      }
    } catch (e) {
      // Non-fatal: continue without enrichment
      console.warn("Could not enrich registration with student profile:", e?.message);
    }

    const registrationData = {
      eventId,
      name: name.trim(),
      email: email.toLowerCase().trim(),
      // Only store transactionId if provided and non-empty
      ...(transactionId && String(transactionId).trim()
        ? { transactionId: String(transactionId).trim() }
        : {}),
      userUid,
      registeredAt: FieldValue.serverTimestamp(),
      status: isAdminAddingParticipant
        ? "confirmed"
        : (!isWorkshop && activePassId ? "confirmed" : "pending_payment"),
      paymentStatus: isAdminAddingParticipant
        ? "paid"
        : (!isWorkshop && activePassId ? "paid" : "pending"),
      paymentVerified: isAdminAddingParticipant ? true : (!isWorkshop && !!activePassId),
      ...(activePassId ? { passId: activePassId } : {}),
      ...(isSpecialEvent && { isSpecialEvent: true }),
      ...(studentRollNo ? { rollNo: studentRollNo } : {}),
      ...(studentCollege ? { college: studentCollege } : {}),
      ...(teamMembers && Array.isArray(teamMembers) && { teamMembers }),
    };

    let regRef;
    try {
      regRef = await db.collection("registrations").add(registrationData);
      console.log("Registration created successfully:", regRef.id);
    } catch (createError) {
      console.error("Failed to create registration:", createError);
      return NextResponse.json(
        {
          error: "Failed to create registration. Please try again.",
          details: createError.message,
        },
        { status: 500 }
      );
    }

    // Note: Do not increment participationCount on pending creation.
    // Counts will be incremented only when payment is approved (see PATCH handler).

    return NextResponse.json(
      {
        id: regRef.id,
        message:
          "Registration successful! You will receive confirmation details via email.",
        ...registrationData,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: error?.message || "Registration failed. Please try again." },
      { status: 500 }
    );
  }
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get("eventId");
    const userUid = searchParams.get("userUid");
    const isSpecialEvent = searchParams.get("isSpecialEvent");

    const db = getAdminDB();

    let qRef;
    if (userUid) {
      qRef = db.collection("registrations").where("userUid", "==", userUid);
    } else if (eventId) {
      qRef = db.collection("registrations").where("eventId", "==", eventId);

      // Optional: Filter for special events only
      if (isSpecialEvent === "true") {
        // Note: Firestore doesn't support chaining where clauses on different fields without an index
        // So we'll filter in memory after fetching
      }
    } else {
      return NextResponse.json(
        { error: "userUid or eventId is required" },
        { status: 400 }
      );
    }

    const registrationsSnap = await qRef.get();
    let participants = registrationsSnap.docs.map((d) => ({
      id: d.id,
      ...d.data(),
    }));

    // Filter for special events if requested
    if (isSpecialEvent === "true") {
      participants = participants.filter(
        (p) => p.isSpecialEvent === true || p.eventType === "special"
      );
    }

    // Sort by registration date (newest first)
    participants.sort((a, b) =>
      new Date(a.registeredAt) < new Date(b.registeredAt) ? 1 : -1
    );

    return NextResponse.json({
      participants,
      totalCount: participants.length,
    });
  } catch (error) {
    console.error("Error fetching participants:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to fetch participants" },
      { status: 500 }
    );
  }
}

export async function PATCH(request) {
  try {
    const url = new URL(request.url);
    const pathSegments = url.pathname.split('/');
    const registrationIdFromPath = pathSegments[pathSegments.length - 1];
    
    let body = {};
    try {
      body = await request.json();
    } catch (parseErr) {
      console.error("Error parsing request body:", parseErr);
      return NextResponse.json(
        { error: "Invalid JSON in request body" },
        { status: 400 }
      );
    }
    
    const { registrationId, status, adminNotes, name, email, rollNo, college, teamMembers } = body;

    // Determine registration ID from either path or body
    const actualRegistrationId = registrationIdFromPath !== 'registrations' ? registrationIdFromPath : registrationId;

    if (!actualRegistrationId) {
      return NextResponse.json(
        { error: "Registration ID is required" },
        { status: 400 }
      );
    }

    const db = getAdminDB();

    const registrationRef = db.collection("registrations").doc(actualRegistrationId);
    const registrationSnap = await registrationRef.get();

    if (!registrationSnap.exists) {
      return NextResponse.json(
        { error: "Registration not found" },
        { status: 404 }
      );
    }

    // If updating participant details (name, email, rollNo, college, teamMembers)
    if (name || email || rollNo || college || teamMembers !== undefined) {
      const updateData = {};
      
      if (name && typeof name === 'string') {
        updateData.name = name.trim();
      }
      if (email && typeof email === 'string') {
        updateData.email = email.toLowerCase().trim();
      }
      if (rollNo && typeof rollNo === 'string') {
        updateData.rollNo = rollNo.trim();
      }
      if (college && typeof college === 'string') {
        updateData.college = college.trim();
      }
      if (Array.isArray(teamMembers)) {
        updateData.teamMembers = teamMembers;
      }
      
      updateData.updatedAt = FieldValue.serverTimestamp();

      await registrationRef.update(updateData);
      
      return NextResponse.json({
        id: actualRegistrationId,
        message: "Participant updated successfully",
        ...updateData,
      }, { status: 200 });
    }

    // Otherwise, update status (for payment approval/rejection)
    if (!status) {
      return NextResponse.json(
        { error: "Status is required for status updates" },
        { status: 400 }
      );
    }

    const updateData = {
      status: status === "approved" ? "active" : "rejected",
      paymentStatus: status,
      paymentVerified: status === "approved",
      updatedAt: FieldValue.serverTimestamp(),
    };

    if (adminNotes) {
      updateData.adminNotes = adminNotes;
    }

    await registrationRef.update(updateData);

    // If approved, update event's participation count (idempotent-ish check)
    if (status === "approved") {
      const registrationData = registrationSnap.data();
      const eventRef = db.collection("events").doc(registrationData.eventId);
      await db.runTransaction(async (tx) => {
        const eventSnap = await tx.get(eventRef);
        if (!eventSnap.exists) return;
        // Only increment if previously not active
        if (registrationData.status !== "active") {
          const current = eventSnap.data()?.participationCount || 0;
          tx.update(eventRef, { participationCount: current + 1 });
        }
      });
    }

    return NextResponse.json({
      message: `Registration ${status} successfully`,
      registrationId: actualRegistrationId,
      status: updateData.status,
    });
  } catch (error) {
    console.error("Error in PATCH handler:", error);
    console.error("Error stack:", error?.stack);
    return NextResponse.json(
      { error: error?.message || "Failed to update registration" },
      { status: 500 }
    );
  }
}

export async function DELETE(request) {
  try {
    const decoded = await verifyAuth(request);
    if (!decoded) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const registrationId = searchParams.get("id");

    if (!registrationId) {
      return NextResponse.json(
        { error: "Registration ID is required" },
        { status: 400 }
      );
    }

    const db = getAdminDB();
    const registrationRef = db.collection("registrations").doc(registrationId);
    const registrationSnap = await registrationRef.get();

    if (!registrationSnap.exists) {
      return NextResponse.json(
        { error: "Registration not found" },
        { status: 404 }
      );
    }

    // Delete the registration
    await registrationRef.delete();

    return NextResponse.json({
      message: "Registration deleted successfully",
      registrationId,
    });
  } catch (error) {
    console.error("Error deleting registration:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to delete registration" },
      { status: 500 }
    );
  }
}
