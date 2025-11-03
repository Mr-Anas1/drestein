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

async function checkIsSuperAdmin(uid) {
  const db = getAdminDB();
  const doc = await db.collection("users").doc(uid).get();
  const data = doc.data();
  return data && data.role === 'super_admin';
}

export async function POST(request) {
  try {
    const decoded = await verifyAuth(request);
    if (!decoded) return NextResponse.json({ error: "Auth required" }, { status: 401 });
    const isSuper = await checkIsSuperAdmin(decoded.uid);
    if (!isSuper) return NextResponse.json({ error: "Super admin access required" }, { status: 403 });

    const db = getAdminDB();

    // Find registrations missing phone
    const regsSnap = await db.collection('registrations').get();
    let updated = 0;
    let skipped = 0;
    let errors = 0;

    // Cache student lookups
    const studentCache = new Map();

    const batchSize = 400; // keep headroom under 500
    let batch = db.batch();
    let opsInBatch = 0;

    for (const doc of regsSnap.docs) {
      const data = doc.data() || {};
      if (data.phone) { skipped++; continue; }
      const userUid = data.userUid;
      if (!userUid) { skipped++; continue; }

      try {
        if (!studentCache.has(userUid)) {
          const sDoc = await db.collection('students').doc(userUid).get();
          studentCache.set(userUid, sDoc.exists ? sDoc.data() : null);
        }
        const student = studentCache.get(userUid);
        const phone = student && student.phone ? String(student.phone).trim() : null;
        if (!phone) { skipped++; continue; }

        batch.update(doc.ref, { phone, updatedAt: FieldValue.serverTimestamp() });
        opsInBatch++;
        updated++;

        if (opsInBatch >= batchSize) {
          await batch.commit();
          batch = db.batch();
          opsInBatch = 0;
        }
      } catch (e) {
        console.error('[BACKFILL PHONES] Failed for registration', doc.id, e);
        errors++;
      }
    }

    if (opsInBatch > 0) {
      await batch.commit();
    }

    return NextResponse.json({ success: true, updated, skipped, errors, total: regsSnap.size });
  } catch (e) {
    console.error('[BACKFILL PHONES] Error:', e);
    return NextResponse.json({ error: e?.message || 'Failed to backfill phones' }, { status: 500 });
  }
}


