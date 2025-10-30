export const runtime = "nodejs";

import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    // Get all CCAvenue environment variables
    const MERCHANT_ID = process.env.CCAVENUE_MERCHANT_ID;
    const ACCESS_CODE = process.env.CCAVENUE_ACCESS_CODE;
    const WORKING_KEY = process.env.CCAVENUE_WORKING_KEY;
    const BASE_URL = process.env.CCAVENUE_BASE_URL;
    const REDIRECT_URL = process.env.CCAVENUE_REDIRECT_URL;
    const CANCEL_URL = process.env.CCAVENUE_CANCEL_URL;

    // Helper function to mask sensitive data (show first 4 and last 4 chars)
    const maskSensitive = (value) => {
      if (!value) return 'NOT_SET';
      if (value.length <= 8) return '***masked***';
      return `${value.substring(0, 4)}...${value.substring(value.length - 4)}`;
    };

    // Helper to determine environment based on patterns
    const detectEnvironment = () => {
      if (!BASE_URL) return 'TEST (default)';
      if (BASE_URL.includes('test.ccavenue.com')) return 'TEST';
      if (BASE_URL.includes('secure.ccavenue.com')) return 'LIVE';
      return 'UNKNOWN';
    };

    const config = {
      environment: detectEnvironment(),
      credentials: {
        merchantId: maskSensitive(MERCHANT_ID),
        accessCode: maskSensitive(ACCESS_CODE),
        workingKey: maskSensitive(WORKING_KEY),
        baseUrl: BASE_URL || 'https://test.ccavenue.com (default)',
        redirectUrl: REDIRECT_URL || 'NOT_SET',
        cancelUrl: CANCEL_URL || 'NOT_SET'
      },
      validation: {
        allCredentialsSet: !!(MERCHANT_ID && ACCESS_CODE && WORKING_KEY && REDIRECT_URL && CANCEL_URL),
        missingCredentials: [
          !MERCHANT_ID && 'CCAVENUE_MERCHANT_ID',
          !ACCESS_CODE && 'CCAVENUE_ACCESS_CODE', 
          !WORKING_KEY && 'CCAVENUE_WORKING_KEY',
          !REDIRECT_URL && 'CCAVENUE_REDIRECT_URL',
          !CANCEL_URL && 'CCAVENUE_CANCEL_URL'
        ].filter(Boolean)
      },
      recommendations: []
    };

    // Add recommendations based on findings
    if (config.environment === 'TEST (default)' || config.environment === 'TEST') {
      config.recommendations.push('⚠️ You are using TEST environment. For live payments, set CCAVENUE_BASE_URL=https://secure.ccavenue.com');
    }

    if (config.validation.missingCredentials.length > 0) {
      config.recommendations.push(`❌ Missing: ${config.validation.missingCredentials.join(', ')}`);
    }

    if (config.environment === 'LIVE' && config.validation.allCredentialsSet) {
      config.recommendations.push('✅ All LIVE credentials appear to be set');
    }

    // Log to server console for debugging
    console.log('[DEBUG] CCAvenue Configuration Check:');
    console.log(`Environment: ${config.environment}`);
    console.log(`All credentials set: ${config.validation.allCredentialsSet}`);
    if (config.validation.missingCredentials.length > 0) {
      console.log(`Missing: ${config.validation.missingCredentials.join(', ')}`);
    }

    return NextResponse.json(config);
  } catch (error) {
    console.error('[DEBUG] Error checking CCAvenue config:', error);
    return NextResponse.json(
      { error: 'Failed to check configuration', details: error.message },
      { status: 500 }
    );
  }
}
