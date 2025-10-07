export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

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

// Verify Firebase Authentication
async function verifyAuth(request) {
  getAdminDB();
  const authHeader = request.headers.get("authorization") || request.headers.get("Authorization");
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

// Check if student has an active event pass
export async function GET(request) {
  try {
    const decoded = await verifyAuth(request);
    if (!decoded) return NextResponse.json({ error: "Auth required" }, { status: 401 });

    const db = getAdminDB();
    
    // Check student document first
    const studentDoc = await db.collection("students").doc(decoded.uid).get();
    const studentData = studentDoc.data();
    
    if (studentData?.hasEventPass) {
      // Fetch pass details
      let passDetails = null;
      if (studentData.eventPassId) {
        const passDoc = await db.collection("passes").doc(studentData.eventPassId).get();
        if (passDoc.exists) {
          passDetails = { id: passDoc.id, ...passDoc.data() };
        }
      }
      
      return NextResponse.json({ 
        hasEventPass: true,
        passDetails 
      });
    }
    
    // Fallback: check passes collection
    const passSnap = await db
      .collection("passes")
      .where("userUid", "==", decoded.uid)
      .where("paymentVerified", "==", true)
      .where("status", "==", "active")
      .limit(1)
      .get();
    
    if (!passSnap.empty) {
      const passDoc = passSnap.docs[0];
      const passDetails = { id: passDoc.id, ...passDoc.data() };
      
      // Update student flag
      await db.collection("students").doc(decoded.uid).set(
        { 
          hasEventPass: true, 
          eventPassId: passDoc.id 
        },
        { merge: true }
      );
      
      return NextResponse.json({ 
        hasEventPass: true,
        passDetails 
      });
    }
    
    return NextResponse.json({ 
      hasEventPass: false,
      passDetails: null 
    });
    
  } catch (e) {
    console.error("[CHECK PASS] Error:", e);
    return NextResponse.json({ 
      error: e?.message || "Failed to check pass status" 
    }, { status: 500 });
  }
}
