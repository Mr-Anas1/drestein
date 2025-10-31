export const runtime = "nodejs";

import { NextResponse } from "next/server";
import crypto from "crypto";
import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

// ✅ Initialize Firebase Admin once
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
    return await getAuth().verifyIdToken(idToken);
  } catch {
    return null;
  }
}

// ✅ AES-128-CBC Encryption for CCAvenue
function encryptCCAvenue(plainText, workingKey) {
  const md5Key = crypto.createHash("md5").update(workingKey).digest();
  const key = Buffer.from(md5Key);
  const iv = Buffer.from([
    0x00, 0x01, 0x02, 0x03,
    0x04, 0x05, 0x06, 0x07,
    0x08, 0x09, 0x0a, 0x0b,
    0x0c, 0x0d, 0x0e, 0x0f
  ]);
  const cipher = crypto.createCipheriv("aes-128-cbc", key, iv);
  let encrypted = cipher.update(plainText, "utf8", "hex");
  encrypted += cipher.final("hex");
  return encrypted;
}

export async function POST(request) {
  try {
    const decoded = await verifyAuth(request);
    if (!decoded) return NextResponse.json({ error: "Auth required" }, { status: 401 });

    const { userUid, passType = 'general', passPrice, passName, customEvents, includesGeneralPass } = await request.json();
    if (!userUid) return NextResponse.json({ error: "userUid required" }, { status: 400 });
    if (decoded.uid !== userUid) return NextResponse.json({ error: "UID mismatch" }, { status: 403 });

    const MERCHANT_ID = process.env.CCAVENUE_MERCHANT_ID;
    const ACCESS_CODE = process.env.CCAVENUE_ACCESS_CODE;
    const WORKING_KEY = process.env.CCAVENUE_WORKING_KEY;
    const REDIRECT_URL = process.env.CCAVENUE_REDIRECT_URL;
    const CANCEL_URL = process.env.CCAVENUE_CANCEL_URL;
    const BASE_URL = process.env.CCAVENUE_BASE_URL || "https://test.ccavenue.com";

    // Safeguard: Only allow LIVE payments from drestein.in host
    const requestHost = new URL(request.url).host;
    const isLive = BASE_URL.includes('secure.ccavenue.com');
    if (isLive && !requestHost.endsWith('drestein.in')) {
      return NextResponse.json(
        { error: "Live payments must be initiated from drestein.in", host: requestHost },
        { status: 400 }
      );
    }

    const missing = [];
    if (!MERCHANT_ID) missing.push("CCAVENUE_MERCHANT_ID");
    if (!ACCESS_CODE) missing.push("CCAVENUE_ACCESS_CODE");
    if (!WORKING_KEY) missing.push("CCAVENUE_WORKING_KEY");
    if (!REDIRECT_URL) missing.push("CCAVENUE_REDIRECT_URL");
    if (!CANCEL_URL) missing.push("CCAVENUE_CANCEL_URL");
    if (missing.length) return NextResponse.json({ error: `Missing env: ${missing.join(", ")}` }, { status: 500 });

    // Use actual price or default to 1.00 for testing
    const AMOUNT = passPrice ? passPrice.toFixed(2) : "1.00";
    const orderId = `${Date.now()}${Math.floor(Math.random() * 10000)}`;

    // Save pending order in Firestore
    const db = getAdminDB();
    const { FieldValue } = await import("firebase-admin/firestore");
    
    // Generate sequential passId (drestein1000, drestein1001, etc.)
    let passId = "drestein1000"; // Default starting ID
    try {
      // Query for passes with IDs starting with "drestein" to find the highest number
      const passesSnapshot = await db.collection("passes")
        .orderBy("__name__", "desc")
        .limit(100)
        .get();
      
      let maxNumber = 999; // Start from 999 so first ID will be 1000
      passesSnapshot.forEach(doc => {
        const id = doc.id;
        if (id.startsWith("drestein")) {
          const numPart = parseInt(id.replace("drestein", ""), 10);
          if (!isNaN(numPart) && numPart > maxNumber) {
            maxNumber = numPart;
          }
        }
      });
      
      passId = `drestein${maxNumber + 1}`;
      console.log(`[CCA INIT] Generated passId: ${passId}`);
    } catch (err) {
      console.error(`[CCA INIT] Error generating passId, using default:`, err);
    }
    
    console.log(`[CCA INIT] Creating pass for userUid: ${userUid}, orderId: ${orderId}, passType: ${passType}, passId: ${passId}`);
    
    const passData = {
      userUid,
      passType,
      passName: passName || (passType === 'general' ? 'General Pass' : 'Custom Pass'),
      passPrice: parseFloat(AMOUNT),
      gateway: "ccavenue",
      orderId,
      amount: AMOUNT,
      currency: "INR",
      status: "pending_payment",
      paymentStatus: "pending",
      paymentVerified: false,
      purchasedAt: FieldValue.serverTimestamp(),
    };

    // Add custom events if it's a custom pass
    if (passType === "custom" && customEvents && customEvents.length > 0) {
      passData.customEvents = customEvents;
    }
    
    // Add flag if general pass is included in custom pass
    if (includesGeneralPass) {
      passData.includesGeneralPass = true;
    }

    // Use set() with custom passId instead of add()
    const passRef = db.collection("passes").doc(passId);
    await passRef.set(passData);
    console.log(`[CCA INIT] ✅ Pass created with ID: ${passId}, userUid: ${userUid}, passType: ${passType}`);

    // Build plaintext (MUST match CCAvenue format)
    // ✅ Include merchant_param1 as fallback for sandbox obfuscation bug
    let plainText =
      `merchant_id=${MERCHANT_ID}` +
      `&order_id=${orderId}` +
      `&currency=INR` +
      `&amount=${AMOUNT}` +
      `&redirect_url=${REDIRECT_URL}` +
      `&cancel_url=${CANCEL_URL}` +
      `&language=EN` +
      `&merchant_param1=${passId}` +    // Pass ID for callback lookup
      `&merchant_param2=${userUid}`;    // Track user in callback

    // Encrypt using corrected method
    const encRequest = encryptCCAvenue(plainText, WORKING_KEY);

    // Construct transaction URL
    const actionUrl = `${BASE_URL}/transaction/transaction.do?command=initiateTransaction`;
    const directUrl = `${actionUrl}&access_code=${ACCESS_CODE}&encRequest=${encRequest}`;

    return NextResponse.json({
      actionUrl,
      encRequest,
      accessCode: ACCESS_CODE,
      orderId,
      merchantId: MERCHANT_ID,
      directUrl,
    });
  } catch (e) {
    console.error("[CCA INIT] Error", e);
    return NextResponse.json({ error: e?.message || "Failed to initiate payment" }, { status: 500 });
  }
}

