export const runtime = "nodejs";

import { NextResponse } from "next/server";
import crypto from "crypto";

// ✅ AES-128-CBC Encryption for CCAvenue (same as your main code)
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

// Alternative encryption method (CCAvenue sometimes expects different IV)
function encryptCCAvenueAlt(plainText, workingKey) {
  const key = crypto.createHash('md5').update(workingKey, 'utf8').digest();
  const iv = Buffer.alloc(16, 0); // All zeros IV
  const cipher = crypto.createCipheriv('aes-128-cbc', key, iv);
  let encrypted = cipher.update(plainText, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return encrypted;
}

export async function POST(request) {
  try {
    const { testAmount = "1.00" } = await request.json();

    const MERCHANT_ID = process.env.CCAVENUE_MERCHANT_ID;
    const ACCESS_CODE = process.env.CCAVENUE_ACCESS_CODE;
    const WORKING_KEY = process.env.CCAVENUE_WORKING_KEY;
    const REDIRECT_URL = process.env.CCAVENUE_REDIRECT_URL;
    const CANCEL_URL = process.env.CCAVENUE_CANCEL_URL;
    const BASE_URL = process.env.CCAVENUE_BASE_URL || "https://secure.ccavenue.com";

    const orderId = `DEBUG_${Date.now()}`;
    const amount = parseFloat(testAmount).toFixed(2);

    // Build the exact same plaintext as your main code
    const plainText =
      `merchant_id=${MERCHANT_ID}` +
      `&order_id=${orderId}` +
      `&currency=INR` +
      `&amount=${amount}` +
      `&redirect_url=${REDIRECT_URL}` +
      `&cancel_url=${CANCEL_URL}` +
      `&language=EN` +
      `&merchant_param1=${orderId}` +
      `&merchant_param2=DEBUG_USER`;

    // Try both encryption methods
    const encRequest1 = encryptCCAvenue(plainText, WORKING_KEY);
    const encRequest2 = encryptCCAvenueAlt(plainText, WORKING_KEY);

    const actionUrl = `${BASE_URL}/transaction/transaction.do?command=initiateTransaction`;
    const directUrl1 = `${actionUrl}&access_code=${ACCESS_CODE}&encRequest=${encRequest1}`;
    const directUrl2 = `${actionUrl}&access_code=${ACCESS_CODE}&encRequest=${encRequest2}`;

    // Log everything for debugging
    console.log('[DEBUG TRANSACTION] ===================');
    console.log('PlainText:', plainText);
    console.log('PlainText Length:', plainText.length);
    console.log('Working Key (first 8 chars):', WORKING_KEY?.substring(0, 8) + '...');
    console.log('Encrypted Method 1:', encRequest1.substring(0, 50) + '...');
    console.log('Encrypted Method 2:', encRequest2.substring(0, 50) + '...');
    console.log('Action URL:', actionUrl);
    console.log('===================');

    const debugInfo = {
      orderId,
      amount,
      plainTextLength: plainText.length,
      plainTextPreview: plainText.substring(0, 100) + '...',
      encryptionResults: {
        method1: {
          name: "Custom IV (0x00-0x0f)",
          encRequest: encRequest1,
          length: encRequest1.length,
          preview: encRequest1.substring(0, 50) + '...',
          directUrl: directUrl1
        },
        method2: {
          name: "Zero IV (all 0x00)",
          encRequest: encRequest2,
          length: encRequest2.length,
          preview: encRequest2.substring(0, 50) + '...',
          directUrl: directUrl2
        }
      },
      urls: {
        actionUrl,
        baseUrl: BASE_URL,
        accessCode: ACCESS_CODE?.substring(0, 8) + '...'
      },
      parameters: {
        merchantId: MERCHANT_ID?.substring(0, 8) + '...',
        redirectUrl: REDIRECT_URL,
        cancelUrl: CANCEL_URL
      },
      recommendations: [
        "Try both encryption methods to see which works",
        "Check if CCAvenue expects different parameter order",
        "Verify the working key is exactly as provided by CCAvenue",
        "Test with minimal parameters first"
      ]
    };

    return NextResponse.json({
      success: true,
      debugInfo,
      testUrls: {
        method1: directUrl1,
        method2: directUrl2
      }
    });

  } catch (error) {
    console.error('[DEBUG TRANSACTION] Error:', error);
    return NextResponse.json(
      { error: 'Failed to generate debug transaction', details: error.message },
      { status: 500 }
    );
  }
}
