export const runtime = "nodejs";

import { NextResponse } from "next/server";
import crypto from "crypto";

// ✅ Correct encryption method (Method 1 from previous test)
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
    const { testAmount = "1.00", variant = "standard" } = await request.json();

    const MERCHANT_ID = process.env.CCAVENUE_MERCHANT_ID;
    const ACCESS_CODE = process.env.CCAVENUE_ACCESS_CODE;
    const WORKING_KEY = process.env.CCAVENUE_WORKING_KEY;
    const REDIRECT_URL = process.env.CCAVENUE_REDIRECT_URL;
    const CANCEL_URL = process.env.CCAVENUE_CANCEL_URL;
    const BASE_URL = process.env.CCAVENUE_BASE_URL || "https://secure.ccavenue.com";

    const orderId = `TEST_${Date.now()}`;
    const amount = parseFloat(testAmount).toFixed(2);

    // Different parameter combinations to test
    const variants = {
      // Your current format
      standard: 
        `merchant_id=${MERCHANT_ID}` +
        `&order_id=${orderId}` +
        `&currency=INR` +
        `&amount=${amount}` +
        `&redirect_url=${REDIRECT_URL}` +
        `&cancel_url=${CANCEL_URL}` +
        `&language=EN` +
        `&merchant_param1=${orderId}` +
        `&merchant_param2=DEBUG_USER`,

      // Minimal required parameters only
      minimal:
        `merchant_id=${MERCHANT_ID}` +
        `&order_id=${orderId}` +
        `&currency=INR` +
        `&amount=${amount}` +
        `&redirect_url=${REDIRECT_URL}` +
        `&cancel_url=${CANCEL_URL}`,

      // Different parameter order (some gateways are sensitive to order)
      reordered:
        `merchant_id=${MERCHANT_ID}` +
        `&amount=${amount}` +
        `&order_id=${orderId}` +
        `&currency=INR` +
        `&language=EN` +
        `&redirect_url=${REDIRECT_URL}` +
        `&cancel_url=${CANCEL_URL}`,

      // With billing info (sometimes required)
      withBilling:
        `merchant_id=${MERCHANT_ID}` +
        `&order_id=${orderId}` +
        `&currency=INR` +
        `&amount=${amount}` +
        `&redirect_url=${REDIRECT_URL}` +
        `&cancel_url=${CANCEL_URL}` +
        `&language=EN` +
        `&billing_name=Test User` +
        `&billing_email=test@example.com` +
        `&billing_tel=9999999999` +
        `&delivery_name=Test User` +
        `&delivery_tel=9999999999`,

      // CCAvenue documentation standard format
      documentation:
        `merchant_id=${MERCHANT_ID}` +
        `&order_id=${orderId}` +
        `&amount=${amount}` +
        `&currency=INR` +
        `&redirect_url=${REDIRECT_URL}` +
        `&cancel_url=${CANCEL_URL}` +
        `&language=EN` +
        `&billing_name=Test` +
        `&billing_address=Test Address` +
        `&billing_city=Test City` +
        `&billing_state=Test State` +
        `&billing_zip=123456` +
        `&billing_country=India` +
        `&billing_tel=9999999999` +
        `&billing_email=test@test.com`,

      // Without merchant_param (some setups don't like extra params)
      noMerchantParams:
        `merchant_id=${MERCHANT_ID}` +
        `&order_id=${orderId}` +
        `&currency=INR` +
        `&amount=${amount}` +
        `&redirect_url=${REDIRECT_URL}` +
        `&cancel_url=${CANCEL_URL}` +
        `&language=EN`
    };

    const plainText = variants[variant] || variants.standard;
    const encRequest = encryptCCAvenue(plainText, WORKING_KEY);
    const actionUrl = `${BASE_URL}/transaction/transaction.do?command=initiateTransaction`;
    const directUrl = `${actionUrl}&access_code=${ACCESS_CODE}&encRequest=${encRequest}`;

    // Log for debugging
    console.log(`[DEBUG PARAMS] Testing variant: ${variant}`);
    console.log(`[DEBUG PARAMS] PlainText: ${plainText}`);
    console.log(`[DEBUG PARAMS] Encrypted length: ${encRequest.length}`);

    return NextResponse.json({
      success: true,
      variant,
      orderId,
      amount,
      plainText,
      encRequest: encRequest.substring(0, 50) + '...',
      directUrl,
      testUrl: directUrl,
      availableVariants: Object.keys(variants)
    });

  } catch (error) {
    console.error('[DEBUG PARAMS] Error:', error);
    return NextResponse.json(
      { error: 'Failed to generate parameter test', details: error.message },
      { status: 500 }
    );
  }
}
