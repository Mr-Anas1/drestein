export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

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

async function checkAdminRole(uid) {
  const db = getAdminDB();
  const userDoc = await db.collection("users").doc(uid).get();
  const userData = userDoc.data();
  return userData && (userData.role === 'super_admin' || userData.role === 'department_admin');
}

export async function GET(request) {
  try {
    const decoded = await verifyAuth(request);
    if (!decoded) return NextResponse.json({ error: "Auth required" }, { status: 401 });
    const isAdmin = await checkAdminRole(decoded.uid);
    if (!isAdmin) return NextResponse.json({ error: "Admin access required" }, { status: 403 });

    const db = getAdminDB();

    // Count confirmed/paid regular event registrations
    const regsSnap = await db.collection('registrations').get();
    let totalParticipants = 0;
    for (const doc of regsSnap.docs) {
      const r = doc.data() || {};
      const isRegular = !r.isSpecialEvent;
      const isConfirmed = r.status === 'confirmed' || r.paymentStatus === 'paid' || r.paymentVerified === true;
      if (isRegular && isConfirmed) totalParticipants++;
    }

    // Count distinct purchasers of verified active general passes
    const passesSnap = await db
      .collection('passes')
      .where('paymentVerified', '==', true)
      .where('status', '==', 'active')
      .get();
    const purchaserSet = new Set();
    for (const doc of passesSnap.docs) {
      const p = doc.data() || {};
      if ((p.passType || 'general') === 'general' && p.userUid) purchaserSet.add(p.userUid);
      // If includesGeneralPass in custom pass, optionally include — but user asked only common pass purchasers, so skip
    }

    const totalCommonPassPurchasers = purchaserSet.size;

    return NextResponse.json({ totalParticipants, totalCommonPassPurchasers });
  } catch (e) {
    console.error('[ADMIN OVERVIEW STATS] Error:', e);
    return NextResponse.json({ error: e?.message || 'Failed to fetch overview stats' }, { status: 500 });
  }
}


