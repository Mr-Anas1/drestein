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

// Create a pass purchase request
export async function POST(request) {
  try {
    const decoded = await verifyAuth(request);
    if (!decoded) return NextResponse.json({ error: "Auth required" }, { status: 401 });

    const { userUid, transactionId, passType, passPrice, passName, customEvents } = await request.json();
    if (!userUid) return NextResponse.json({ error: "userUid required" }, { status: 400 });
    if (decoded.uid !== userUid) return NextResponse.json({ error: "UID mismatch" }, { status: 403 });

    const db = getAdminDB();

    // Check if user already has a pass of the same type that's verified
    // Allow multiple passes, but prevent duplicate pending passes of same type
    const existingSnap = await db
      .collection("passes")
      .where("userUid", "==", userUid)
      .where("passType", "==", passType || "general")
      .where("status", "in", ["pending_payment", "active"])
      .limit(1)
      .get();
    
    if (!existingSnap.empty) {
      const existing = existingSnap.docs[0];
      const existingData = existing.data();
      // If there's already a pending or active pass of this type, return it
      if (existingData.status === "pending_payment" || existingData.paymentVerified) {
        return NextResponse.json({ id: existing.id, ...existingData }, { status: 200 });
      }
    }

    // Create new pass record
    const passData = {
      userUid,
      transactionId: transactionId ? String(transactionId).trim() : undefined,
      passType: passType || "general",
      passName: passName || "General Pass",
      passPrice: passPrice || 250,
      status: "pending_payment",
      paymentStatus: "pending",
      paymentVerified: false,
      purchasedAt: FieldValue.serverTimestamp(),
    };

    // Add custom events if it's a custom pass
    if (passType === "custom" && customEvents && customEvents.length > 0) {
      passData.customEvents = customEvents;
    }

    const docRef = await db.collection("passes").add(passData);

    return NextResponse.json({ id: docRef.id, message: "Pass created" }, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: e?.message || "Failed to create pass" }, { status: 500 });
  }
}

// Get passes by userUid (all passes for the user)
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userUid = searchParams.get("userUid");
    const passId = searchParams.get("passId");

    const db = getAdminDB();

    // If passId is provided, return specific pass
    if (passId) {
      const doc = await db.collection("passes").doc(passId).get();
      if (!doc.exists) return NextResponse.json({ error: "Pass not found" }, { status: 404 });
      return NextResponse.json({ pass: { id: doc.id, ...doc.data() } });
    }

    // Otherwise, return all passes for the user
    if (!userUid) return NextResponse.json({ error: "userUid or passId required" }, { status: 400 });

    // Get only verified/active passes for this user
    const snap = await db
      .collection("passes")
      .where("userUid", "==", userUid)
      .where("paymentVerified", "==", true)
      .get();

    if (snap.empty) return NextResponse.json({ passes: [] });

    // Sort by purchasedAt in memory (to avoid Firestore index requirement)
    const passes = snap.docs
      .map(d => ({ id: d.id, ...d.data() }))
      .sort((a, b) => {
        const aTime = a.purchasedAt?.toMillis?.() || 0;
        const bTime = b.purchasedAt?.toMillis?.() || 0;
        return bTime - aTime; // Descending order (newest first)
      });
    
    return NextResponse.json({ passes });
  } catch (e) {
    console.error("[PASSES GET] Error:", e);
    console.error("[PASSES GET] Error code:", e.code);
    console.error("[PASSES GET] Error message:", e.message);
    return NextResponse.json({ 
      error: e?.message || "Failed to fetch passes",
      code: e?.code 
    }, { status: 500 });
  }
}

// Admin: verify/reject a pass
export async function PATCH(request) {
  try {
    const { passId, status, adminNotes } = await request.json();
    if (!passId || !status) return NextResponse.json({ error: "passId and status required" }, { status: 400 });

    const db = getAdminDB();
    const ref = db.collection("passes").doc(passId);
    const snap = await ref.get();
    if (!snap.exists) return NextResponse.json({ error: "Pass not found" }, { status: 404 });

    const update = {
      status: status === "approved" ? "active" : "rejected",
      paymentStatus: status,
      paymentVerified: status === "approved",
      updatedAt: FieldValue.serverTimestamp(),
    };
    if (adminNotes) update.adminNotes = adminNotes;

    await ref.update(update);

    return NextResponse.json({ message: `Pass ${status}`, status: update.status });
  } catch (e) {
    return NextResponse.json({ error: e?.message || "Failed to update pass" }, { status: 500 });
  }
}
