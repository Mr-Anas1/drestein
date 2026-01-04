export const runtime = "nodejs";

import { NextResponse } from "next/server";
import crypto from "crypto";

function encryptCCAvenue(plainText, workingKey) {
  const md5Key = crypto.createHash("md5").update(workingKey).digest();
  const key = Buffer.from(md5Key);
  const iv = Buffer.from([
    0x00, 0x01, 0x02, 0x03,
    0x04, 0x05, 0x06, 0x07,
    0x08, 0x09, 0x0a, 0x0b,
    0x0c, 0x0d, 0x0e, 0x0f,
  ]);
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
    const REDIRECT_URL_ENV = process.env.CCAVENUE_REDIRECT_URL;
    const CANCEL_URL_ENV = process.env.CCAVENUE_CANCEL_URL;
    const BASE_URL = process.env.CCAVENUE_BASE_URL || "https://test.ccavenue.com";

    // Safeguard: Only allow LIVE payments from drestein.in host
    const requestHost = new URL(request.url).host;
    const isLive = BASE_URL.includes("secure.ccavenue.com");
    if (isLive && !requestHost.endsWith("drestein.in")) {
      return NextResponse.json(
        { error: "Live payments must be initiated from drestein.in", host: requestHost },
        { status: 400 }
      );
    }

    const missing = [];
    if (!MERCHANT_ID) missing.push("CCAVENUE_MERCHANT_ID");
    if (!ACCESS_CODE) missing.push("CCAVENUE_ACCESS_CODE");
    if (!WORKING_KEY) missing.push("CCAVENUE_WORKING_KEY");
    if (missing.length) return NextResponse.json({ error: `Missing env: ${missing.join(", ")}` }, { status: 500 });

    const { amount } = await request.json().catch(() => ({ amount: undefined }));
    const normalized = typeof amount === "number" ? amount : 500;
    const AMOUNT = Number.isFinite(normalized) ? normalized.toFixed(2) : "500.00";

    const origin = new URL(request.url).origin;
    const redirectUrl = REDIRECT_URL_ENV || `${origin}/api/payments/ccavenue/mba/callback`;
    const cancelUrl = CANCEL_URL_ENV || `${origin}/api/payments/ccavenue/mba/callback`;

    const orderId = `${Date.now()}${Math.floor(Math.random() * 10000)}`;

    const plainText =
      `merchant_id=${MERCHANT_ID}` +
      `&order_id=${orderId}` +
      `&currency=INR` +
      `&amount=${AMOUNT}` +
      `&redirect_url=${redirectUrl}` +
      `&cancel_url=${cancelUrl}` +
      `&language=EN` +
      `&merchant_param1=${orderId}` +
      `&merchant_param2=mba_marketing_analytics`;

    const encRequest = encryptCCAvenue(plainText, WORKING_KEY);
    const actionUrl = `${BASE_URL}/transaction/transaction.do?command=initiateTransaction`;

    return NextResponse.json({ actionUrl, encRequest, accessCode: ACCESS_CODE, orderId, merchantId: MERCHANT_ID });
  } catch (e) {
    console.error("[MBA CCA INIT] Error", e);
    return NextResponse.json({ error: e?.message || "Failed to initiate payment" }, { status: 500 });
  }
}
