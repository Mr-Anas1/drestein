export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getFirestore, FieldValue } from "firebase-admin/firestore";

function getAdminDB() {
  if (!getApps().length) {
    const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || process.env.FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    let privateKey = process.env.FIREBASE_PRIVATE_KEY;
    if (!projectId || !clientEmail || !privateKey) throw new Error("Missing Firebase Admin credentials");
    if (privateKey.includes("\\n")) privateKey = privateKey.replace(/\\n/g, "\n");
    initializeApp({ credential: cert({ projectId, clientEmail, privateKey }) });
  }
  return getFirestore();
}

async function verifyAuth(request) {
  getAdminDB();
  const authHeader = request.headers.get("authorization") || request.headers.get("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) return null;
  const idToken = authHeader.split(" ")[1];
  const { getAuth } = await import("firebase-admin/auth");
  try {
    return await getAuth().verifyIdToken(idToken);
  } catch {
    return null;
  }
}

export async function POST(request) {
  try {
    const decoded = await verifyAuth(request);
    if (!decoded) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const { name, isStudent, rollNo, college, phone } = await request.json();

    // Validation
    if (!name || !name.trim()) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    if (isStudent && (!rollNo || !rollNo.trim())) {
      return NextResponse.json({ error: "Roll number is required for students" }, { status: 400 });
    }

    if (isStudent && (!college || !college.trim())) {
      return NextResponse.json({ error: "College name is required for students" }, { status: 400 });
    }

    if (!phone || !String(phone).trim()) {
      return NextResponse.json({ error: "Phone number is required" }, { status: 400 });
    }

    const db = getAdminDB();
    const studentRef = db.collection("students").doc(decoded.uid);

    // Update student document
    const updateData = {
      name: name.trim(),
      isStudent: isStudent === true,
      phone: String(phone).trim(),
      profileCompleted: true,
      profileCompletedAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    };

    if (isStudent) {
      updateData.rollNo = rollNo.trim();
      updateData.college = college.trim();
    } else {
      // Clear student fields if not a student
      updateData.rollNo = null;
      updateData.college = null;
    }

    await studentRef.set(updateData, { merge: true });

    return NextResponse.json({
      success: true,
      message: "Profile completed successfully",
    });
  } catch (error) {
    console.error("[COMPLETE PROFILE] Error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to complete profile" },
      { status: 500 }
    );
  }
}
