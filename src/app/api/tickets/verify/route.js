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

// Verify ticket QR code at event entrance
export async function POST(request) {
  try {
    const { qrData } = await request.json();
    
    if (!qrData) {
      return NextResponse.json({ error: "QR data required" }, { status: 400 });
    }

    // Parse QR code data
    let parsedData;
    try {
      parsedData = JSON.parse(qrData);
    } catch (e) {
      return NextResponse.json({ 
        valid: false, 
        error: "Invalid QR code format" 
      }, { status: 400 });
    }

    const { passId, userUid, orderId } = parsedData;

    if (!passId) {
      return NextResponse.json({ 
        valid: false, 
        error: "Missing pass ID in QR code" 
      }, { status: 400 });
    }

    // Fetch pass from Firestore
    const db = getAdminDB();
    const passDoc = await db.collection("passes").doc(passId).get();

    if (!passDoc.exists) {
      return NextResponse.json({ 
        valid: false, 
        error: "Pass not found" 
      }, { status: 404 });
    }

    const passData = passDoc.data();

    // Verify pass details match QR code
    if (passData.userUid !== userUid || passData.orderId !== orderId) {
      return NextResponse.json({ 
        valid: false, 
        error: "Pass details do not match" 
      }, { status: 403 });
    }

    // Check if pass is active and verified
    if (passData.status !== "active" || !passData.paymentVerified) {
      return NextResponse.json({ 
        valid: false, 
        error: "Pass is not active or payment not verified",
        status: passData.status,
        paymentVerified: passData.paymentVerified
      }, { status: 403 });
    }

    // Check if pass has been used (optional - you can track entry)
    const alreadyUsed = passData.entryScanned || false;

    // Mark as scanned (optional - uncomment to track entry)
    // await db.collection("passes").doc(passId).update({
    //   entryScanned: true,
    //   scannedAt: FieldValue.serverTimestamp()
    // });

    // Return success with pass holder details
    return NextResponse.json({ 
      valid: true,
      alreadyUsed,
      passHolder: {
        passId: passId,
        orderId: passData.orderId,
        amount: passData.amount,
        purchaseDate: passData.purchasedAt,
        status: passData.status
      },
      message: alreadyUsed ? "Pass already scanned - re-entry" : "Valid pass - entry granted"
    });

  } catch (e) {
    console.error("[TICKET VERIFY] Error:", e);
    return NextResponse.json({ 
      valid: false,
      error: e?.message || "Verification failed" 
    }, { status: 500 });
  }
}
