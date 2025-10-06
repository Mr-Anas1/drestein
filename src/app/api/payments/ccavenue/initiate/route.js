export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getFirestore, FieldValue } from "firebase-admin/firestore";
import crypto from "crypto";

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
  try { return await getAuth().verifyIdToken(idToken); } catch { return null; }
}

function encryptCCAvenue(plainText, workingKey) {
  // CCAvenue standard: AES-128-CBC with MD5(workingKey) and zero IV
  const key = crypto.createHash('md5').update(workingKey, 'utf8').digest();
  const iv = Buffer.alloc(16, 0); // 16 zero bytes IV
  const cipher = crypto.createCipheriv('aes-128-cbc', key, iv);
  let encrypted = cipher.update(plainText, 'utf8', 'hex');
  encrypted += cipher.final('hex');
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
    const REDIRECT_URL = process.env.CCAVENUE_REDIRECT_URL; // should point to our callback route
    const CANCEL_URL = process.env.CCAVENUE_CANCEL_URL;     // can be same as redirect
    const BASE_URL = process.env.CCAVENUE_BASE_URL || 'https://test.ccavenue.com';

    // Mask helper (keeps last 4 chars)
    const mask = (val) => (typeof val === 'string' && val.length > 4 ? `${'*'.repeat(Math.max(0, val.length - 4))}${val.slice(-4)}` : val);

    // Runtime diagnostics (masked)
    console.log('[CCA INIT] Env presence:', {
      merchantIdSet: !!MERCHANT_ID,
      accessCodeSet: !!ACCESS_CODE,
      workingKeySet: !!WORKING_KEY,
      redirectSet: !!REDIRECT_URL,
      cancelSet: !!CANCEL_URL,
      baseUrl: BASE_URL,
    });
    console.log('[CCA INIT] Env tails:', {
      merchantIdTail: MERCHANT_ID ? MERCHANT_ID.slice(-4) : null,
      accessCodeTail: ACCESS_CODE ? ACCESS_CODE.slice(-4) : null,
      // Never log working key
    });

    const missing = [];
    if (!MERCHANT_ID) missing.push('CCAVENUE_MERCHANT_ID');
    if (!ACCESS_CODE) missing.push('CCAVENUE_ACCESS_CODE');
    if (!WORKING_KEY) missing.push('CCAVENUE_WORKING_KEY');
    if (!REDIRECT_URL) missing.push('CCAVENUE_REDIRECT_URL');
    if (!CANCEL_URL) missing.push('CCAVENUE_CANCEL_URL');
    if (missing.length) return NextResponse.json({ error: `Missing env: ${missing.join(', ')}` }, { status: 500 });

    const AMOUNT = '250.00'; // Event Pass price in INR

    // Some gateways are picky about allowed chars. Use numeric-only order id.
    const orderId = `${Date.now()}${Math.floor(Math.random()*10000)}`; // digits only
    console.log('[CCA INIT] Creating order', { orderId });

    // Create a pending pass record linked to this orderId
    const db = getAdminDB();
    await db.collection('passes').add({
      userUid,
      gateway: 'ccavenue',
      orderId,
      amount: AMOUNT,
      currency: 'INR',
      status: 'pending_payment',
      paymentStatus: 'pending',
      paymentVerified: false,
      purchasedAt: FieldValue.serverTimestamp(),
    });

    // Build CCAvenue request params
    const params = new URLSearchParams();
    params.append('merchant_id', MERCHANT_ID);
    params.append('order_id', orderId);
    params.append('currency', 'INR');
    params.append('amount', AMOUNT);
    params.append('redirect_url', REDIRECT_URL);
    params.append('cancel_url', CANCEL_URL);
    params.append('language', 'EN');

    // Optional but recommended billing info
    if (decoded?.email) params.append('billing_email', decoded.email);
    // params.append('billing_name', '');
    // params.append('billing_tel', '');

    const plainText = params.toString();
    const encRequest = encryptCCAvenue(plainText, WORKING_KEY);
    console.log('[CCA INIT] Payload built', {
      actionBase: BASE_URL,
      plainTextLength: plainText.length,
      plainText: plainText, // Log for debugging
      encRequestLength: encRequest.length,
      encRequestPreview: encRequest.substring(0, 50) + '...',
    });
    
    // CCAvenue endpoint - note: single /transaction.do not /transaction/transaction.do
    const actionUrl = `${BASE_URL}/transaction.do?command=initiateTransaction`;
    
    // Also construct direct URL (can be used for GET redirect)
    const directUrl = `${actionUrl}&access_code=${ACCESS_CODE}&encRequest=${encRequest}`;
    
    console.log('[CCA INIT] Redirecting to gateway', { actionUrl, directUrlLength: directUrl.length });

    return NextResponse.json({ 
      actionUrl, 
      encRequest, 
      accessCode: ACCESS_CODE, 
      orderId, 
      merchantId: MERCHANT_ID,
      directUrl // Include direct URL for testing/alternative redirect
    });
  } catch (e) {
    console.error('[CCA INIT] Error', { message: e?.message });
    return NextResponse.json({ error: e?.message || 'Failed to initiate payment' }, { status: 500 });
  }
}
