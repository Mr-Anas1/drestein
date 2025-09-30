# CCAvenue Payment Integration Setup

## Overview
This project uses CCAvenue payment gateway for Event Pass purchases (Rs. 250). The integration follows CCAvenue's official API documentation.

## Required Environment Variables

Add these to your `.env.local` (local) and Vercel Environment Variables (production):

```bash
# CCAvenue Merchant Credentials (from M.A.R.S dashboard)
CCAVENUE_MERCHANT_ID=2831331
CCAVENUE_ACCESS_CODE=ATAC06MI57BJ34CAJB
CCAVENUE_WORKING_KEY=92C4125E3E77DE78741C507A54BF57E7

# Environment (test vs production)
CCAVENUE_BASE_URL=https://test.ccavenue.com
# For production: https://secure.ccavenue.com

# Callback URLs (must be HTTPS and publicly accessible)
CCAVENUE_REDIRECT_URL=https://drestein.vercel.app/api/payments/ccavenue/callback
CCAVENUE_CANCEL_URL=https://drestein.vercel.app/api/payments/ccavenue/callback

# Your site base URL
NEXT_PUBLIC_BASE_URL=https://drestein.vercel.app

# Optional: AES encryption mode (default: aes-128-cbc)
# CCAVENUE_AES_MODE=aes-128-cbc

# Optional: For server-to-server API calls (DoWebTrans)
# CCAVENUE_STAGE=true
# CCAVENUE_STAGE_API_URL=https://apitest.ccavenue.com/apis/servlet/DoWebTrans
# CCAVENUE_PROD_API_URL=https://api.ccavenue.com/apis/servlet/DoWebTrans
```

## Getting Credentials from CCAvenue

1. **Login to M.A.R.S** (Merchant Account & Reporting System)
   - URL: https://mars.ccavenue.com/

2. **Get Merchant ID**
   - Dashboard → Account Details → Merchant ID

3. **Get Access Code & Working Key**
   - Dashboard → Generate Working Key
   - Access Code and Working Key (encryption key) will be displayed
   - **Important**: Save the Working Key securely - it cannot be retrieved later

4. **Register Your Server IP**
   - Dashboard → API Configuration → Register IP Address
   - Add your server's public IP address
   - For Vercel: Contact Vercel support for static IP or use their IP ranges
   - **Critical**: API calls will fail if IP is not registered

5. **Configure Return URLs**
   - Dashboard → Return URL Configuration
   - Add your callback URL domain: `drestein.vercel.app`
   - Must be HTTPS

## Encryption Details

### Standard CCAvenue Encryption (Browser Redirect Flow)
- **Algorithm**: AES-128-CBC
- **Key Derivation**: MD5 hash of Working Key
- **IV**: 16 zero bytes (`Buffer.alloc(16, 0)`)
- **Input Encoding**: UTF-8
- **Output Encoding**: Hexadecimal

### Implementation Files
- `src/app/api/payments/ccavenue/initiate/route.js` - Payment initiation
- `src/app/api/payments/ccavenue/callback/route.js` - Payment callback
- `lib/ccav/crypto.js` - Encryption/decryption utilities
- `lib/ccav/api.js` - Server-to-server API client (DoWebTrans)

## Testing

### Test Environment
- Base URL: `https://test.ccavenue.com`
- Use test credentials from CCAvenue
- Test payment option: NetBanking → "AvenuesTest" (returns SUCCESS/FAILURE)

### Local Testing
```bash
# 1. Set environment variables in .env.local
# 2. Start dev server
npm run dev

# 3. For callback testing, use ngrok or similar tunnel
ngrok http 3000
# Update CCAVENUE_REDIRECT_URL and CCAVENUE_CANCEL_URL to ngrok URL
```

### Production Deployment
1. Set all environment variables in Vercel Project Settings
2. Update `CCAVENUE_BASE_URL` to `https://secure.ccavenue.com` for production
3. Use production credentials from M.A.R.S
4. Ensure production domain is allowlisted in CCAvenue

## Troubleshooting

### Error: "Merchant Authentication failed (10002)"
**Causes**:
- Wrong Merchant ID, Access Code, or Working Key
- Using test credentials with production URL (or vice versa)
- Access Code doesn't belong to the Merchant ID
- Return URL domain not allowlisted in CCAvenue

**Solutions**:
- Verify all credentials match your M.A.R.S account
- Ensure `CCAVENUE_BASE_URL` matches your environment (test vs prod)
- Check CCAvenue dashboard for allowlisted return URLs
- Confirm no extra spaces/quotes in environment variables

### Error: "decryption of encRequest failed"
**Causes**:
- Wrong encryption key derivation method
- Incorrect Working Key
- Mismatch between AES mode used and expected by CCAvenue

**Solutions**:
- Verify `CCAVENUE_WORKING_KEY` is correct
- Ensure using MD5(workingKey) for key derivation (standard)
- Check that IV is 16 zero bytes
- Try setting `CCAVENUE_AES_MODE=aes-128-cbc` explicitly

### Callback Not Received
**Causes**:
- Callback URL not publicly accessible
- Callback URL not HTTPS
- Callback URL domain not allowlisted

**Solutions**:
- Use ngrok or similar for local testing
- Ensure production callback URL is HTTPS
- Add domain to CCAvenue allowlist
- Check Vercel function logs for errors

## Payment Flow

1. **User clicks "Buy Event Pass"**
   - `PassPurchaseModal` component opens

2. **Initiate Payment**
   - POST `/api/payments/ccavenue/initiate`
   - Creates pending pass record in Firestore
   - Builds encrypted request with order details
   - Returns `encRequest`, `accessCode`, `actionUrl`

3. **Redirect to CCAvenue**
   - Hidden form auto-submits to CCAvenue gateway
   - User completes payment on CCAvenue page

4. **Payment Callback**
   - CCAvenue POSTs encrypted response to `/api/payments/ccavenue/callback`
   - Decrypt response and parse order status
   - Update pass record: `paymentVerified: true` on success
   - Redirect user to `/payment/result` page

5. **Event Registration**
   - Non-Workshop events check for verified pass
   - If pass exists and verified, allow registration
   - Workshops don't require pass (can have per-event payment)

## API Reference

### Browser Redirect Flow (Current Implementation)
- **Initiate**: POST to `https://test.ccavenue.com/transaction/transaction.do?command=initiateTransaction`
- **Form Fields**: `encRequest`, `access_code`, optionally `merchant_id`
- **Callback**: CCAvenue POSTs `encResp` to your callback URL

### Server-to-Server API (DoWebTrans)
- **Staging**: `https://apitest.ccavenue.com/apis/servlet/DoWebTrans`
- **Production**: `https://api.ccavenue.com/apis/servlet/DoWebTrans`
- **Commands**: `orderStatusTracker`, `Status`, etc.
- **Note**: Requires IP registration in M.A.R.S

## Security Notes

- **Never expose `CCAVENUE_WORKING_KEY` to client**
- Store in server-only environment variables
- Use HTTPS for all callback URLs
- Validate order amounts and IDs in callback
- Consider implementing order status verification via DoWebTrans API

## Support

- CCAvenue Documentation: https://www.ccavenue.com/developers.jsp
- CCAvenue Support: service@ccavenue.com
- Phone: +918801033323

## Current Status

✅ Encryption/decryption implemented (AES-128-CBC, MD5 key derivation)
✅ Payment initiation API
✅ Payment callback handling
✅ Pass purchase modal UI
✅ Event registration gating (pass required for non-Workshop events)
✅ Payment result page
✅ Firestore integration for pass records

⚠️ Pending: IP registration in M.A.R.S (required for API calls to work)
⚠️ Pending: Production credentials and domain allowlist
