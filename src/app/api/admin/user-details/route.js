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
    const name = searchParams.get("name");

    const db = getAdminDB();

    async function buildDetailsForStudentDoc(studentDoc, fallbackEmail) {
      const userUid = studentDoc.id;
      const studentData = studentDoc.data();

      let userData = {};
      try {
        const userDocSnap = await db.collection("users").doc(userUid).get();
        if (userDocSnap.exists) {
          userData = userDocSnap.data();
        }
      } catch {}

      const normalizedEmailInner = (studentData.email || fallbackEmail || "").toLowerCase().trim();

      let registrationsSnap = await db
        .collection("registrations")
        .where("userUid", "==", userUid)
        .get();

      if (registrationsSnap.empty && normalizedEmailInner) {
        registrationsSnap = await db
          .collection("registrations")
          .where("email", "==", normalizedEmailInner)
          .get();
      }

      const registrations = registrationsSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      const regularRegistrations = registrations.filter((r) => !r.isSpecialEvent);
      const specialEventRegistrations = registrations.filter((r) => r.isSpecialEvent);

      const passesSnap = await db
        .collection("passes")
        .where("userUid", "==", userUid)
        .get();
      const passes = passesSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

      const eventIds = [...new Set(regularRegistrations.map((r) => r.eventId))];
      const eventDetailsMap = {};
      for (const eventId of eventIds) {
        const eventDoc = await db.collection("events").doc(eventId).get();
        if (eventDoc.exists) {
          eventDetailsMap[eventId] = { id: eventId, ...eventDoc.data() };
        }
      }

      const specialEventIds = [...new Set(specialEventRegistrations.map((r) => r.eventId))];
      const specialEventDetailsMap = {};
      for (const specialEventId of specialEventIds) {
        const specialEventDoc = await db.collection("specialEvents").doc(specialEventId).get();
        if (specialEventDoc.exists) {
          specialEventDetailsMap[specialEventId] = { id: specialEventId, ...specialEventDoc.data() };
        }
      }

      const enrichedRegistrations = regularRegistrations.map((reg) => ({
        ...reg,
        eventDetails: eventDetailsMap[reg.eventId] || null,
      }));
      const enrichedSpecialEventRegistrations = specialEventRegistrations.map((reg) => ({
        ...reg,
        specialEventDetails: specialEventDetailsMap[reg.eventId] || null,
      }));

      const totalAmount = [
        ...enrichedRegistrations.map((r) => r.amount || 0),
        ...enrichedSpecialEventRegistrations.map((r) => r.amount || 0),
        ...passes.map((p) => p.passPrice || 0),
      ].reduce((sum, amount) => sum + amount, 0);

      return {
        user: {
          id: userUid,
          uid: userUid,
          email: normalizedEmailInner || null,
          name: studentData.name || "",
          rollNo: studentData.rollNo || null,
          college: studentData.college || null,
          photoURL: studentData.photoURL || null,
          isStudent: studentData.isStudent || false,
          hasEventPass: studentData.hasEventPass || false,
          profileCompleted: studentData.profileCompleted || false,
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
      };
    }

    if (email) {
      const normalizedEmail = email.toLowerCase().trim();

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

      const studentDoc = studentsSnap.docs[0];
      const details = await buildDetailsForStudentDoc(studentDoc, normalizedEmail);
      return NextResponse.json(details);
    }

    if (name) {
      const nameQuery = name.trim();
      if (!nameQuery) {
        return NextResponse.json(
          { error: "Name parameter is empty" },
          { status: 400 }
        );
      }

      const studentsSnap = await db
        .collection("students")
        .orderBy("name")
        .startAt(nameQuery)
        .endAt(nameQuery + "\uf8ff")
        .limit(20)
        .get();

      if (studentsSnap.empty) {
        return NextResponse.json({ results: [] });
      }

      const results = [];
      for (const doc of studentsSnap.docs) {
        const details = await buildDetailsForStudentDoc(doc);
        results.push(details);
      }
      return NextResponse.json({ results });
    }

    return NextResponse.json(
      { error: "Email or name parameter is required" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Error fetching user details:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to fetch user details" },
      { status: 500 }
    );
  }
}
