/**
 * CCAvenue DoWebTrans API Client
 * 
 * API URLs per documentation:
 * - Staging: https://apitest.ccavenue.com/apis/servlet/DoWebTrans
 * - Production: https://api.ccavenue.com/apis/servlet/DoWebTrans
 * 
 * Note: Merchant must register public IP in M.A.R.S before API calls work
 */

const { encryptRequest, decryptResponse } = require('./crypto');

/**
 * Get API configuration
 */
function getApiConfig() {
  const isStaging = process.env.CCAVENUE_STAGE !== 'false'; // default true
  const merchantId = process.env.CCAVENUE_MERCHANT_ID;
  const accessCode = process.env.CCAVENUE_ACCESS_CODE;
  
  const apiUrl = isStaging
    ? (process.env.CCAVENUE_STAGE_API_URL || 'https://apitest.ccavenue.com/apis/servlet/DoWebTrans')
    : (process.env.CCAVENUE_PROD_API_URL || 'https://api.ccavenue.com/apis/servlet/DoWebTrans');

  if (!merchantId || !accessCode) {
    throw new Error('CCAVENUE_MERCHANT_ID and CCAVENUE_ACCESS_CODE are required');
  }

  return { apiUrl, merchantId, accessCode, isStaging };
}

/**
 * Call CCAvenue DoWebTrans API
 * @param {Object} params
 * @param {string} params.command - API command (e.g., 'orderStatusTracker')
 * @param {string} params.encRequest - Encrypted request payload
 * @param {string} params.requestType - Request type (default: 'STRING')
 * @param {string} params.responseType - Response type (default: 'STRING')
 * @param {string} params.version - API version (default: '1.2')
 * @returns {Promise<Object>} - Parsed response
 */
async function doWebTrans({
  command,
  encRequest,
  requestType = 'STRING',
  responseType = 'STRING',
  version = '1.2'
}) {
  const { apiUrl, accessCode } = getApiConfig();

  const formBody = new URLSearchParams({
    enc_request: encRequest,
    access_code: accessCode,
    command,
    request_type: requestType,
    response_type: responseType,
    version
  });

  console.log('[CCAvenue API] Calling DoWebTrans:', { command, apiUrl, requestType, responseType });

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formBody.toString(),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const text = await response.text();
    console.log('[CCAvenue API] Raw response:', text.substring(0, 200));

    // Parse response based on status
    // Per doc: if status=1, enc_response contains plain error text
    // if status=0, enc_response is encrypted
    const statusMatch = text.match(/status=(\d+)/);
    const status = statusMatch ? statusMatch[1] : null;

    if (status === '1') {
      // Error response - plain text
      const errorMatch = text.match(/enc_response=([^&]+)/);
      const errorText = errorMatch ? decodeURIComponent(errorMatch[1]) : text;
      return { status: 'error', error: errorText, raw: text };
    }

    // Extract enc_response
    const encResponseMatch = text.match(/enc_response=([^&]+)/);
    if (!encResponseMatch) {
      throw new Error('No enc_response in API response');
    }

    const encResponse = decodeURIComponent(encResponseMatch[1]);
    const decrypted = decryptResponse(encResponse);
    
    console.log('[CCAvenue API] Decrypted response:', decrypted.substring(0, 200));

    // Parse decrypted response (STRING format: key=value&key=value)
    const parsed = {};
    decrypted.split('&').forEach(pair => {
      const [key, value] = pair.split('=');
      if (key) parsed[key] = decodeURIComponent(value || '');
    });

    return { status: 'success', data: parsed, raw: text };
  } catch (error) {
    console.error('[CCAvenue API] Request failed:', error.message);
    throw error;
  }
}

/**
 * Check order status
 * @param {string} orderId - Order/reference number
 * @returns {Promise<Object>} - Order status response
 */
async function checkOrderStatus(orderId) {
  const { merchantId } = getApiConfig();
  
  // Build plain request string
  const plainRequest = `merchant_id=${merchantId}&order_no=${orderId}`;
  const encRequest = encryptRequest(plainRequest);

  return doWebTrans({
    command: 'orderStatusTracker',
    encRequest,
    requestType: 'STRING',
    responseType: 'STRING',
  });
}

module.exports = {
  doWebTrans,
  checkOrderStatus,
  getApiConfig,
};
