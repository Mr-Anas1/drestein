export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getFirestore, FieldValue } from "firebase-admin/firestore";
import crypto from "crypto";

// Initialize Firebase Admin if not already initialized
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

// ✅ Correct AES-128-CBC encryption for CCAvenue
function encryptCCAvenue(plainText, workingKey) {
  // Step 1: Derive AES key = MD5(workingKey)
  const md5Key = crypto.createHash("md5").update(workingKey).digest();
  const key = Buffer.from(md5Key);

  // Step 2: Fixed IV bytes (00 to 0F)
  const iv = Buffer.from([
    0x00, 0x01, 0x02, 0x03,
    0x04, 0x05, 0x06, 0x07,
    0x08, 0x09, 0x0a, 0x0b,
    0x0c, 0x0d, 0x0e, 0x0f
  ]);

  // Step 3: Encrypt plaintext
  const cipher = crypto.createCipheriv("aes-128-cbc", key, iv);
  let encrypted = cipher.update(plainText, "utf8", "hex");
  encrypted += cipher.final("hex");
  return encrypted;
}

export async function POST(request) {
  try {
    const decoded = await verifyAuth(request);
    if (!decoded) return NextResponse.json({ error: "Auth required" }, { status: 401 });

    const { userUid } = await request.json();
    if (!userUid) return NextResponse.json({ error: "userUid required" }, { status: 400 });
    if (decoded.uid !== userUid) return NextResponse.json({ error: "UID mismatch" }, { status: 403 });

    const MERCHANT_ID = process.env.CCAVENUE_MERCHANT_ID;
    const ACCESS_CODE = process.env.CCAVENUE_ACCESS_CODE;
    const WORKING_KEY = process.env.CCAVENUE_WORKING_KEY;
    const REDIRECT_URL = process.env.CCAVENUE_REDIRECT_URL;
    const CANCEL_URL = process.env.CCAVENUE_CANCEL_URL;
    const BASE_URL = process.env.CCAVENUE_BASE_URL || "https://test.ccavenue.com";

    const missing = [];
    if (!MERCHANT_ID) missing.push("CCAVENUE_MERCHANT_ID");
    if (!ACCESS_CODE) missing.push("CCAVENUE_ACCESS_CODE");
    if (!WORKING_KEY) missing.push("CCAVENUE_WORKING_KEY");
    if (!REDIRECT_URL) missing.push("CCAVENUE_REDIRECT_URL");
    if (!CANCEL_URL) missing.push("CCAVENUE_CANCEL_URL");
    if (missing.length) return NextResponse.json({ error: `Missing env: ${missing.join(", ")}` }, { status: 500 });

    const AMOUNT = "250.00"; // For testing
    const orderId = `${Date.now()}${Math.floor(Math.random() * 10000)}`;

    // Save pending order in Firestore
    const db = getAdminDB();
    await db.collection("passes").add({
      userUid,
      gateway: "ccavenue",
      orderId,
      amount: AMOUNT,
      currency: "INR",
      status: "pending_payment",
      paymentStatus: "pending",
      paymentVerified: false,
      purchasedAt: FieldValue.serverTimestamp(),
    });

    // Build plaintext (MUST match CCAvenue format)
    let plainText =
      `merchant_id=${MERCHANT_ID}` +
      `&order_id=${orderId}` +
      `&currency=INR` +
      `&amount=${AMOUNT}` +
      `&redirect_url=${REDIRECT_URL}` +
      `&cancel_url=${CANCEL_URL}` +
      `&language=EN`;

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
