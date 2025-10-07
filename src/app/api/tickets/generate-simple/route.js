export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import QRCode from "qrcode";

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

// Generate QR Code as Data URL
async function generateQRCode(data) {
  try {
    return await QRCode.toDataURL(data, {
      width: 300,
      margin: 2,
      color: {
        dark: "#000000",
        light: "#FFFFFF"
      }
    });
  } catch (err) {
    console.error("QR Code generation error:", err);
    throw err;
  }
}

// Simple ticket data endpoint (returns JSON instead of PDF)
export async function POST(request) {
  try {
    const decoded = await verifyAuth(request);
    if (!decoded) return NextResponse.json({ error: "Auth required" }, { status: 401 });

    const { passId } = await request.json();
    if (!passId) return NextResponse.json({ error: "passId required" }, { status: 400 });

    const db = getAdminDB();
    
    // Fetch pass details
    const passDoc = await db.collection("passes").doc(passId).get();
    if (!passDoc.exists) {
      return NextResponse.json({ error: "Pass not found" }, { status: 404 });
    }

    const passData = passDoc.data();
    
    // Verify ownership
    if (passData.userUid !== decoded.uid) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Only generate tickets for verified/active passes
    if (!passData.paymentVerified || passData.status !== "active") {
      return NextResponse.json({ 
        error: "Pass is not active or payment not verified" 
      }, { status: 400 });
    }

    // Generate QR code with pass verification data
    const qrData = JSON.stringify({
      passId: passId,
      userUid: passData.userUid,
      orderId: passData.orderId,
      timestamp: Date.now()
    });
    
    const qrCodeDataURL = await generateQRCode(qrData);

    // Format purchase date
    const purchaseDate = passData.purchasedAt?.toDate 
      ? new Date(passData.purchasedAt.toDate()).toLocaleDateString('en-IN', {
          day: '2-digit',
          month: 'short',
          year: 'numeric'
        })
      : new Date().toLocaleDateString('en-IN', {
          day: '2-digit',
          month: 'short',
          year: 'numeric'
        });

    // Return ticket data as JSON
    return NextResponse.json({
      success: true,
      ticket: {
        passId: passId,
        name: decoded.name || decoded.email?.split('@')[0] || "Event Attendee",
        email: decoded.email || passData.email || "N/A",
        orderId: passData.orderId || "N/A",
        purchaseDate: purchaseDate,
        amount: passData.amount || "1.00",
        qrCode: qrCodeDataURL,
        status: "active"
      }
    });

  } catch (e) {
    console.error("[TICKET GEN SIMPLE] Error:", e);
    return NextResponse.json({ 
      error: e?.message || "Failed to generate ticket" 
    }, { status: 500 });
  }
}
