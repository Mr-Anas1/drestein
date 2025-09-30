# CCAvenue Integration - Diagnosis & Fix

## Problem Summary

You've been getting two errors:
1. **"Merchant Authentication failed (10002)"** - Initially
2. **"decryption of encRequest failed"** - After trying hex key mode

## Root Cause

The encryption implementation was **correct from the start**. The issue is likely:

1. **Environment variable mismatch** - Credentials not matching between test/prod
2. **Return URL not allowlisted** - CCAvenue requires domain allowlisting
3. **IP not registered** - CCAvenue requires server IP registration in M.A.R.S

## What I've Fixed

### 1. Standardized Encryption (Reverted to CCAvenue Standard)
```javascript
// CORRECT: CCAvenue standard encryption
function encryptCCAvenue(plainText, workingKey) {
  const key = crypto.createHash('md5').update(workingKey, 'utf8').digest(); // MD5 of working key
  const iv = Buffer.alloc(16, 0); // 16 zero bytes
  const cipher = crypto.createCipheriv('aes-128-cbc', key, iv);
  let encrypted = cipher.update(plainText, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return encrypted;
}
```

**Key Points**:
- Algorithm: AES-128-CBC
- Key: MD5 hash of working key (16 bytes)
- IV: 16 zero bytes
- Input: UTF-8 string
- Output: Hexadecimal string

### 2. Added Comprehensive Documentation
- `CCAVENUE_SETUP.md` - Complete setup guide
- `lib/ccav/crypto.js` - Reusable encryption module
- `lib/ccav/api.js` - Server-to-server API client (for future use)
- Unit tests for encryption/decryption

### 3. Removed Experimental Code
- Removed `CCAVENUE_KEY_MODE=hex` logic (was causing decryption failure)
- Simplified to single, standard CCAvenue encryption method

## Required Actions (In Order)

### Step 1: Verify Environment Variables on Vercel

Go to Vercel Project Settings → Environment Variables and ensure:

```bash
CCAVENUE_MERCHANT_ID=2831331
CCAVENUE_ACCESS_CODE=ATAC06MI57BJ34CAJB
CCAVENUE_WORKING_KEY=92C4125E3E77DE78741C507A54BF57E7
CCAVENUE_BASE_URL=https://test.ccavenue.com
CCAVENUE_REDIRECT_URL=https://drestein.vercel.app/api/payments/ccavenue/callback
CCAVENUE_CANCEL_URL=https://drestein.vercel.app/api/payments/ccavenue/callback
NEXT_PUBLIC_BASE_URL=https://drestein.vercel.app
```

**Critical Checks**:
- No extra spaces before/after values
- No quotes around values
- Exact match with CCAvenue email credentials
- `CCAVENUE_BASE_URL` is test URL (not production)

### Step 2: Remove CCAVENUE_KEY_MODE

If you added `CCAVENUE_KEY_MODE=hex` on Vercel:
1. Go to Environment Variables
2. Delete `CCAVENUE_KEY_MODE`
3. Redeploy

### Step 3: Allowlist Return URL in CCAvenue

1. Login to CCAvenue M.A.R.S: https://mars.ccavenue.com/
2. Go to: Account → Return URL Configuration
3. Add domain: `drestein.vercel.app`
4. Save and wait 5-10 minutes for propagation

### Step 4: Register Server IP (Critical for API Calls)

**Note**: This is required for DoWebTrans API calls, but NOT for browser redirect flow.

If using server-to-server API:
1. Login to M.A.R.S
2. Go to: API Configuration → Register IP
3. Add your server's public IP
4. For Vercel: Contact Vercel support for static IP or IP ranges

### Step 5: Test Again

1. Commit and push the updated code
2. Wait for Vercel deployment
3. Try buying Event Pass
4. Check Vercel logs for `[CCA INIT]` messages

## Expected Behavior After Fix

### Success Flow
1. User clicks "Buy Event Pass"
2. Logs show:
   ```
   [CCA INIT] Env presence: all true
   [CCA INIT] Env tails: merchantIdTail: '1331', accessCodeTail: 'CAJB'
   [CCA INIT] Creating order { orderId: '...' }
   [CCA INIT] Payload built { payloadLength: 291, hasEncRequest: true }
   [CCA INIT] Redirecting to gateway
   ```
3. Redirects to CCAvenue test page
4. User selects: NetBanking → "AvenuesTest"
5. Chooses SUCCESS or FAILURE
6. Redirects back to `/payment/result`
7. Pass record updated with `paymentVerified: true`

### If Still Fails

**"Merchant Authentication failed (10002)"**:
- Double-check credentials match CCAvenue email EXACTLY
- Verify test base URL: `https://test.ccavenue.com`
- Confirm return URL allowlisted

**"decryption of encRequest failed"**:
- Ensure `CCAVENUE_KEY_MODE` is NOT set
- Verify working key is correct
- Check no extra characters in working key env var

**No callback received**:
- Ensure callback URL is HTTPS
- Check Vercel function logs for errors
- Verify domain allowlisted in CCAvenue

## Testing Checklist

- [ ] All env vars set on Vercel (no `CCAVENUE_KEY_MODE`)
- [ ] Code deployed to Vercel
- [ ] Return URL `drestein.vercel.app` allowlisted in M.A.R.S
- [ ] Try Event Pass purchase
- [ ] Check Vercel logs for `[CCA INIT]` messages
- [ ] Redirects to CCAvenue without 10002 error
- [ ] Can complete test payment with "AvenuesTest"
- [ ] Callback received and pass updated
- [ ] Can register for non-Workshop event after pass verified

## Files Changed

### Updated
- `src/app/api/payments/ccavenue/initiate/route.js` - Simplified encryption
- `src/app/api/payments/ccavenue/callback/route.js` - Simplified decryption

### Created
- `lib/ccav/crypto.js` - Reusable encryption module
- `lib/ccav/api.js` - Server-to-server API client
- `lib/ccav/__tests__/crypto.test.js` - Unit tests
- `CCAVENUE_SETUP.md` - Setup documentation
- `CCAVENUE_DIAGNOSIS.md` - This file

## Next Steps After Success

1. **Test thoroughly** with "AvenuesTest" option
2. **Switch to production** when ready:
   - Update `CCAVENUE_BASE_URL` to `https://secure.ccavenue.com`
   - Use production credentials from M.A.R.S
   - Allowlist production domain
3. **Add order verification** - Use DoWebTrans `orderStatusTracker` API in callback for extra security
4. **Monitor logs** - Watch for any payment failures

## Support Contacts

If issues persist after following all steps:
- **CCAvenue Support**: service@ccavenue.com
- **Phone**: +918801033323
- **Include in email**:
  - Merchant ID: 2831331
  - Order ID from logs: `[CCA INIT] Creating order { orderId: '...' }`
  - Timestamp of attempt
  - Error message/screenshot
  - Confirm: Return URL allowlisted, using test credentials with test base URL

## Summary

The encryption was correct. The issue is almost certainly:
1. Environment variable mismatch or typo
2. Return URL not allowlisted in M.A.R.S
3. Experimental `CCAVENUE_KEY_MODE=hex` causing decryption failure

Follow the steps above in order, and it should work.
