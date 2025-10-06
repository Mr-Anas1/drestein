export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getFirestore, FieldValue } from "firebase-admin/firestore";
import crypto from "crypto";

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

// Verify Firebase Auth
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

// AES-128-CBC encryption with PKCS#7 padding
function encryptCCAvenue(plainText, workingKey) {
  const key = Buffer.from(workingKey, "hex");
  const iv = Buffer.alloc(16, 0); // zero IV

  // PKCS#7 padding
  const blockSize = 16;
  const padLength = blockSize - (plainText.length % blockSize);
  const paddedText = plainText + String.fromCharCode(padLength).repeat(padLength);

  const cipher = crypto.createCipheriv("aes-128-cbc", key, iv);
  let encrypted = cipher.update(paddedText, "utf8", "hex");
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

    // CCAvenue environment variables
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

    const AMOUNT = "1.00"; // test amount
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

    // Build plaintext exactly as CCAvenue requires
    let plainText =
      `merchant_id=${MERCHANT_ID}` +
      `&order_id=${orderId}` +
      `&currency=INR` +
      `&amount=${AMOUNT}` +
      `&redirect_url=${REDIRECT_URL}` +
      `&cancel_url=${CANCEL_URL}` +
      `&language=EN`;

    if (decoded?.email) plainText += `&billing_email=${decoded.email}`;

    const encRequest = encryptCCAvenue(plainText, WORKING_KEY);

    const actionUrl = `${BASE_URL}/transaction.do?command=initiateTransaction`;
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
