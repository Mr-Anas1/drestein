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

    const { userUid, transactionId } = await request.json();
    if (!userUid) return NextResponse.json({ error: "userUid required" }, { status: 400 });
    if (decoded.uid !== userUid) return NextResponse.json({ error: "UID mismatch" }, { status: 403 });

    const db = getAdminDB();

    // Idempotency: if there is already an approved pass, return it
    const approvedSnap = await db
      .collection("passes")
      .where("userUid", "==", userUid)
      .where("paymentVerified", "==", true)
      .limit(1)
      .get();
    if (!approvedSnap.empty) {
      const d = approvedSnap.docs[0];
      return NextResponse.json({ id: d.id, ...d.data() }, { status: 200 });
    }

    // Otherwise create pending pass record
    const docRef = await db.collection("passes").add({
      userUid,
      transactionId: transactionId ? String(transactionId).trim() : undefined,
      status: "pending_payment",
      paymentStatus: "pending",
      paymentVerified: false,
      purchasedAt: FieldValue.serverTimestamp(),
    });

    return NextResponse.json({ id: docRef.id, message: "Pass created" }, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: e?.message || "Failed to create pass" }, { status: 500 });
  }
}

// Get pass by userUid (latest or approved)
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userUid = searchParams.get("userUid");
    if (!userUid) return NextResponse.json({ error: "userUid required" }, { status: 400 });

    const db = getAdminDB();

    const snap = await db
      .collection("passes")
      .where("userUid", "==", userUid)
      .orderBy("purchasedAt", "desc")
      .limit(1)
      .get();

    if (snap.empty) return NextResponse.json({ pass: null });

    const d = snap.docs[0];
    return NextResponse.json({ pass: { id: d.id, ...d.data() } });
  } catch (e) {
    return NextResponse.json({ error: e?.message || "Failed to fetch pass" }, { status: 500 });
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
