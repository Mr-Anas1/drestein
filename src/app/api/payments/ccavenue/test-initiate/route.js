export const runtime = "nodejs";

import { NextResponse } from "next/server";
import crypto from "crypto";

function encryptCCAvenue(plainText, workingKey) {
  // CCAvenue standard: AES-128-CBC with MD5(workingKey) and zero IV
  const key = crypto.createHash('md5').update(workingKey, 'utf8').digest();
  const iv = Buffer.alloc(16, 0); // 16 zero bytes IV
  const cipher = crypto.createCipheriv('aes-128-cbc', key, iv);
  let encrypted = cipher.update(plainText, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return encrypted;
}

export async function GET() {
  try {
    const MERCHANT_ID = process.env.CCAVENUE_MERCHANT_ID;
    const ACCESS_CODE = process.env.CCAVENUE_ACCESS_CODE;
    const WORKING_KEY = process.env.CCAVENUE_WORKING_KEY;
    const REDIRECT_URL = process.env.CCAVENUE_REDIRECT_URL; // points to our callback route
    const CANCEL_URL = process.env.CCAVENUE_CANCEL_URL;     // can be same as redirect
    const BASE_URL = process.env.CCAVENUE_BASE_URL || 'https://test.ccavenue.com';

    const missing = [];
    if (!MERCHANT_ID) missing.push('CCAVENUE_MERCHANT_ID');
    if (!ACCESS_CODE) missing.push('CCAVENUE_ACCESS_CODE');
    if (!WORKING_KEY) missing.push('CCAVENUE_WORKING_KEY');
    if (!REDIRECT_URL) missing.push('CCAVENUE_REDIRECT_URL');
    if (!CANCEL_URL) missing.push('CCAVENUE_CANCEL_URL');
    if (missing.length) return NextResponse.json({ error: `Missing env: ${missing.join(', ')}` }, { status: 500 });

    // Tiny amount for sandbox testing
    const AMOUNT = '5.00';

    // numeric-only order id
    const orderId = `${Date.now()}${Math.floor(Math.random()*10000)}`;

    const params = new URLSearchParams();
    params.append('merchant_id', MERCHANT_ID);
    params.append('order_id', orderId);
    params.append('currency', 'INR');
    params.append('amount', AMOUNT);
    params.append('redirect_url', REDIRECT_URL);
    params.append('cancel_url', CANCEL_URL);
    params.append('language', 'EN');

    const encRequest = encryptCCAvenue(params.toString(), WORKING_KEY);
    const actionUrl = `${BASE_URL}/transaction/transaction.do?command=initiateTransaction`;

    return NextResponse.json({ actionUrl, encRequest, accessCode: ACCESS_CODE, orderId, merchantId: MERCHANT_ID });
  } catch (e) {
    return NextResponse.json({ error: e?.message || 'Failed to build test payload' }, { status: 500 });
  }
}
