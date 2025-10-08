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

// ✅ AES-128-CBC Decryption (MD5(workingKey) + fixed IV)
function decryptCCAvenue(encText, workingKey) {
  const md5Key = crypto.createHash("md5").update(workingKey).digest();
  const key = Buffer.from(md5Key);
  const iv = Buffer.from([
    0x00, 0x01, 0x02, 0x03,
    0x04, 0x05, 0x06, 0x07,
    0x08, 0x09, 0x0a, 0x0b,
    0x0c, 0x0d, 0x0e, 0x0f
  ]);
  const decipher = crypto.createDecipheriv("aes-128-cbc", key, iv);
  let decrypted = decipher.update(encText, "hex", "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
}

// ✅ Helper: Convert CCAvenue response string to object
function parseCCAResponse(str) {
  const pairs = str.split("&");
  const params = {};
  for (const pair of pairs) {
    const [key, value] = pair.split("=");
    if (key) params[key.trim()] = value ? decodeURIComponent(value.trim()) : "";
  }
  return params;
}

export async function POST(request) {
  const db = getAdminDB();
  try {
    const body = await request.text();
    const searchParams = new URLSearchParams(body);
    const encResp = searchParams.get("encResp");
    if (!encResp) return NextResponse.json({ error: "Missing encResp" }, { status: 400 });

    const WORKING_KEY = process.env.CCAVENUE_WORKING_KEY;
    if (!WORKING_KEY) throw new Error("Missing CCAVENUE_WORKING_KEY");

    // ✅ Step 1: Decrypt response
    const decryptedData = decryptCCAvenue(encResp, WORKING_KEY);
    console.log("[CCA CALLBACK] Decrypted response:", decryptedData);

    // ✅ Step 2: Parse response string
    const params = parseCCAResponse(decryptedData);
    console.log("[CCA CALLBACK] All params:", params);

    // ✅ Step 3: Extract identifiers safely
    const orderId = params.order_id || params.merchant_param1;
    const trackingId = params.tracking_id;
    const orderStatus = params.order_status;

    if (!orderId) {
      console.error("[CCA CALLBACK] ❌ CRITICAL: orderId is null/undefined!");
      return NextResponse.json({ error: "orderId missing" }, { status: 400 });
    }

    // ✅ Step 4: Find and update matching pass in Firestore
    const snapshot = await db.collection("passes").where("orderId", "==", orderId).limit(1).get();

    if (snapshot.empty) {
      console.error(`[CCA CALLBACK] ❌ No pass found for orderId ${orderId}`);
      return NextResponse.json({ error: "No matching order found" }, { status: 404 });
    }

    const passRef = snapshot.docs[0].ref;

    if (orderStatus === "Success") {
      await passRef.update({
        paymentStatus: "paid",
        paymentVerified: true,
        status: "completed",
        trackingId: trackingId,
        paymentMode: params.payment_mode,
        transDate: params.trans_date,
        updatedAt: new Date(),
      });
      console.log(`[CCA CALLBACK] ✅ Order ${orderId} marked as paid.`);
    } else {
      await passRef.update({
        paymentStatus: "failed",
        paymentVerified: false,
        status: "failed",
        failureMessage: params.failure_message || "Unknown error",
        updatedAt: new Date(),
      });
      console.warn(`[CCA CALLBACK] ⚠️ Order ${orderId} failed.`);
    }

    // ✅ Step 5: Respond to CCAvenue
    return NextResponse.json({ success: true, orderId, orderStatus });
  } catch (err) {
    console.error("[CCA CALLBACK] ❌ Error:", err);
    return NextResponse.json({ error: err.message || "Callback processing failed" }, { status: 500 });
  }
}

