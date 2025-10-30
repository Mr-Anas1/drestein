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

async function checkAdminRole(uid) {
  const db = getAdminDB();
  const userDoc = await db.collection("users").doc(uid).get();
  if (!userDoc.exists) return false;
  const userData = userDoc.data();
  return userData.role === "super_admin" || userData.role === "department_admin";
}

// Get all passes (admin only)
export async function GET(request) {
  try {
    const decoded = await verifyAuth(request);
    if (!decoded) {
      return NextResponse.json({ error: "Auth required" }, { status: 401 });
    }

    const isAdmin = await checkAdminRole(decoded.uid);
    if (!isAdmin) {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    const db = getAdminDB();
    const passesSnapshot = await db.collection("passes").get();

    const passes = [];
    for (const doc of passesSnapshot.docs) {
      const passData = doc.data();
      
      // Try to get user email, name and roll number
      let userEmail = null;
      let userName = null;
      let rollNo = null;
      if (passData.userUid) {
        try {
          const studentDoc = await db.collection("students").doc(passData.userUid).get();
          if (studentDoc.exists) {
            const studentData = studentDoc.data();
            userEmail = studentData.email;
            userName = studentData.name || studentData.displayName || null;
            rollNo = studentData.rollNo || null;
          }
        } catch (e) {
          console.error(`[ADMIN PASSES] Error fetching user data for ${passData.userUid}:`, e);
        }
      }

      passes.push({
        id: doc.id,
        ...passData,
        userEmail,
        userName,
        rollNo,
      });
    }

    // Sort by purchasedAt in memory (descending order - newest first)
    passes.sort((a, b) => {
      const aTime = a.purchasedAt?.toMillis?.() || 0;
      const bTime = b.purchasedAt?.toMillis?.() || 0;
      return bTime - aTime;
    });

    return NextResponse.json({ passes });
  } catch (e) {
    console.error("[ADMIN PASSES GET] Error:", e);
    console.error("[ADMIN PASSES GET] Error code:", e?.code);
    console.error("[ADMIN PASSES GET] Error message:", e?.message);
    return NextResponse.json(
      { error: e?.message || "Failed to fetch passes", code: e?.code },
      { status: 500 }
    );
  }
}
