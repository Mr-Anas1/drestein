export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getFirestore, FieldValue } from "firebase-admin/firestore";

// Initialize Firebase Admin
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

// Admin endpoint to sync hasEventPass flag for all students with active passes
export async function POST(request) {
  try {
    // Simple admin key check (you should implement proper admin auth)
    const { adminKey } = await request.json();
    if (adminKey !== process.env.ADMIN_SECRET_KEY) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const db = getAdminDB();
    
    // Get all active, verified passes
    const passesSnap = await db
      .collection("passes")
      .where("paymentVerified", "==", true)
      .where("status", "==", "active")
      .get();
    
    let updated = 0;
    let errors = 0;
    
    const batch = db.batch();
    
    for (const passDoc of passesSnap.docs) {
      const passData = passDoc.data();
      if (passData.userUid) {
        try {
          const studentRef = db.collection("students").doc(passData.userUid);
          batch.set(
            studentRef,
            {
              hasEventPass: true,
              eventPassId: passDoc.id,
              eventPassPurchasedAt: passData.purchasedAt || FieldValue.serverTimestamp(),
            },
            { merge: true }
          );
          updated++;
        } catch (err) {
          console.error(`Failed to update student ${passData.userUid}:`, err);
          errors++;
        }
      }
    }
    
    await batch.commit();
    
    return NextResponse.json({
      success: true,
      message: `Synced ${updated} students with event passes`,
      updated,
      errors,
      totalPasses: passesSnap.size
    });
    
  } catch (e) {
    console.error("[SYNC PASSES] Error:", e);
    return NextResponse.json({ 
      error: e?.message || "Failed to sync passes" 
    }, { status: 500 });
  }
}
