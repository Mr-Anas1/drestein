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

// Cleanup old pending passes (older than 24 hours)
// This endpoint can be called by a cron job or manually
export async function POST(request) {
  try {
    // Check if request is from Vercel Cron (automatically authenticated)
    const authHeader = request.headers.get("authorization");
    const isVercelCron = authHeader?.startsWith("Bearer ") && process.env.CRON_SECRET;
    
    // For manual calls, check secret key
    if (!isVercelCron) {
      const { secret } = await request.json().catch(() => ({}));
      const CLEANUP_SECRET = process.env.CLEANUP_SECRET;
      
      if (!CLEANUP_SECRET || secret !== CLEANUP_SECRET) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
    }

    const db = getAdminDB();
    
    // Calculate timestamp for 24 hours ago
    const oneDayAgo = new Date();
    oneDayAgo.setHours(oneDayAgo.getHours() - 24);
    
    // Find all pending passes older than 24 hours
    const snapshot = await db
      .collection("passes")
      .where("status", "==", "pending_payment")
      .where("paymentVerified", "==", false)
      .get();
    
    let deletedCount = 0;
    const batch = db.batch();
    
    snapshot.docs.forEach(doc => {
      const data = doc.data();
      const purchasedAt = data.purchasedAt?.toDate();
      
      // Only delete if older than 24 hours
      if (purchasedAt && purchasedAt < oneDayAgo) {
        batch.delete(doc.ref);
        deletedCount++;
      }
    });
    
    if (deletedCount > 0) {
      await batch.commit();
    }
    
    console.log(`[CLEANUP] Deleted ${deletedCount} old pending passes`);
    
    return NextResponse.json({ 
      success: true, 
      deletedCount,
      message: `Cleaned up ${deletedCount} old pending passes`
    });
    
  } catch (e) {
    console.error("[CLEANUP] Error:", e);
    return NextResponse.json({ 
      error: e?.message || "Cleanup failed" 
    }, { status: 500 });
  }
}

// GET endpoint to check how many pending passes would be deleted
export async function GET(request) {
  try {
    const db = getAdminDB();
    
    // Calculate timestamp for 24 hours ago
    const oneDayAgo = new Date();
    oneDayAgo.setHours(oneDayAgo.getHours() - 24);
    
    const snapshot = await db
      .collection("passes")
      .where("status", "==", "pending_payment")
      .where("paymentVerified", "==", false)
      .get();
    
    let oldCount = 0;
    let recentCount = 0;
    
    snapshot.docs.forEach(doc => {
      const data = doc.data();
      const purchasedAt = data.purchasedAt?.toDate();
      
      if (purchasedAt && purchasedAt < oneDayAgo) {
        oldCount++;
      } else {
        recentCount++;
      }
    });
    
    return NextResponse.json({ 
      totalPending: snapshot.size,
      oldPending: oldCount,
      recentPending: recentCount,
      message: `${oldCount} passes ready for cleanup, ${recentCount} recent pending passes`
    });
    
  } catch (e) {
    console.error("[CLEANUP CHECK] Error:", e);
    return NextResponse.json({ 
      error: e?.message || "Check failed" 
    }, { status: 500 });
  }
}
