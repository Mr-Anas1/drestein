export const runtime = "nodejs";

import { NextResponse } from "next/server";
import crypto from "crypto";

function encryptCCAvenue(plainText, workingKey) {
  const key = crypto.createHash("md5").update(workingKey, "utf8").digest();
  const iv = Buffer.alloc(16, 0);
  const cipher = crypto.createCipheriv("aes-128-cbc", key, iv);
  let encrypted = cipher.update(plainText, "utf8", "hex");
  encrypted += cipher.final("hex");
  return encrypted;
}

export async function POST(request) {
  try {
    const MERCHANT_ID = process.env.CCAVENUE_MERCHANT_ID;
    const ACCESS_CODE = process.env.CCAVENUE_ACCESS_CODE;
    const WORKING_KEY = process.env.CCAVENUE_WORKING_KEY;
    const BASE_URL = process.env.CCAVENUE_BASE_URL || "https://test.ccavenue.com";

    const missing = [];
    if (!MERCHANT_ID) missing.push("CCAVENUE_MERCHANT_ID");
    if (!ACCESS_CODE) missing.push("CCAVENUE_ACCESS_CODE");
    if (!WORKING_KEY) missing.push("CCAVENUE_WORKING_KEY");
    if (missing.length) return NextResponse.json({ error: `Missing env: ${missing.join(", ")}` }, { status: 500 });

    const { amount } = await request.json().catch(() => ({ amount: undefined }));
    const normalized = typeof amount === "number" ? amount : 500;
    const AMOUNT = Number.isFinite(normalized) ? normalized.toFixed(2) : "500.00";

    const origin = new URL(request.url).origin;
    const redirectUrl = `${origin}/api/payments/ccavenue/mba/callback`;
    const cancelUrl = `${origin}/api/payments/ccavenue/mba/callback`;

    const orderId = `${Date.now()}${Math.floor(Math.random() * 10000)}`;

    const params = new URLSearchParams();
    params.append("merchant_id", MERCHANT_ID);
    params.append("order_id", orderId);
    params.append("currency", "INR");
    params.append("amount", AMOUNT);
    params.append("redirect_url", redirectUrl);
    params.append("cancel_url", cancelUrl);
    params.append("language", "EN");
    params.append("merchant_param1", "mba_marketing_analytics");

    const encRequest = encryptCCAvenue(params.toString(), WORKING_KEY);
    const actionUrl = `${BASE_URL}/transaction/transaction.do?command=initiateTransaction`;
    const directUrl = `${actionUrl}&access_code=${ACCESS_CODE}&encRequest=${encRequest}`;

    return NextResponse.json({ actionUrl, encRequest, accessCode: ACCESS_CODE, orderId, merchantId: MERCHANT_ID, directUrl });
  } catch (e) {
    console.error("[MBA CCA INIT] Error", e);
    return NextResponse.json({ error: e?.message || "Failed to initiate payment" }, { status: 500 });
  }
}
