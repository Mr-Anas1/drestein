# Pass Purchase Fix - hasEventPass Not Updating

## Problem
After purchasing an event pass successfully, the `hasEventPass` field in the student collection was not being updated to `true`, causing issues with event registration.

## Root Causes Identified

### 1. **CRITICAL: Missing orderId in Callback**
CCAvenue is not returning the `order_id` parameter in the callback response, causing the pass lookup to fail. The logs show:
```
[CCA INIT] orderId: 17598947838522988  ✅ Created
[CCA CALLBACK] Order: null              ❌ Missing!
```

This prevents the system from finding the pass document and updating the student.

### 2. **Backend Update Logic**
The callback route (`/api/payments/ccavenue/callback/route.js`) was correctly attempting to update the student document, but lacked comprehensive logging to debug failures.

### 3. **Frontend State Management**
The `AuthContext` was only loading the student profile on initial authentication. After a successful payment, the context was not refreshing, so the UI still showed `hasEventPass: false` even if the backend had updated it.

## Changes Made

### 1. Enhanced Logging in Payment Callback (`callback/route.js`)
**Lines 60, 69, 78, 83-107, 115-121**

Added comprehensive logging to track:
- Pass document lookup by `orderId`
- Verification that `userUid` exists in pass data
- Student document existence check
- Confirmation of `hasEventPass` update
- Detailed error messages with stack traces

**Key additions:**
```javascript
console.log(`[CCA CALLBACK] Pass data:`, JSON.stringify(passData, null, 2));
console.log(`[CCA CALLBACK] Found pass ${passId} with userUid: ${passData.userUid || 'MISSING'}`);
console.log(`[CCA CALLBACK] ✅ Payment successful, updating student ${passData.userUid}...`);

// Verify the update
const updatedDoc = await studentRef.get();
const updatedData = updatedDoc.data();
console.log(`[CCA CALLBACK] ✅ Verified - hasEventPass is now:`, updatedData?.hasEventPass);
```

### 2. Enhanced Logging in Payment Initiation (`initiate/route.js`)
**Lines 85-97**

Added logging to confirm `userUid` is properly saved when creating the pass document:
```javascript
console.log(`[CCA INIT] Creating pass for userUid: ${userUid}, orderId: ${orderId}`);
const passRef = await db.collection("passes").add({...});
console.log(`[CCA INIT] ✅ Pass created with ID: ${passRef.id}, userUid: ${userUid}`);
```

### 3. Added Profile Refresh Function to AuthContext (`AuthContext.js`)
**Lines 183-199**

Created a new function to manually refresh the student profile from Firestore:
```javascript
const refreshStudentProfile = async () => {
    if (!user?.uid) return;
    try {
        console.log('[AUTH] Refreshing student profile...');
        const studentDocRef = doc(db, 'students', user.uid);
        const studentDoc = await getDoc(studentDocRef);
        if (studentDoc.exists()) {
            const studentData = studentDoc.data();
            setStudentProfile(studentData);
            setUserRole({ role: 'student', hasEventPass: studentData?.hasEventPass || false });
            console.log('[AUTH] ✅ Student profile refreshed, hasEventPass:', studentData?.hasEventPass);
        }
    } catch (error) {
        console.error('[AUTH] Error refreshing student profile:', error);
    }
};
```

Exposed this function in the context value (line 214).

### 4. Auto-Refresh on Payment Success (`payment/result/page.jsx`)
**Lines 8, 13, 20-34**

Modified the payment result page to:
1. Import `useAuth` hook
2. Call `refreshStudentProfile()` 2 seconds after successful payment
3. This ensures the UI reflects the updated `hasEventPass` status

```javascript
const { refreshStudentProfile } = useAuth();

useEffect(() => {
    if (status === 'success') {
        setMessage('Payment successful! Your Event Pass is now active.');
        if (refreshStudentProfile) {
            setTimeout(() => {
                refreshStudentProfile();
            }, 2000); // Wait 2 seconds to ensure backend has updated
        }
    }
}, [status, refreshStudentProfile]);
```

## How It Works Now

1. **User initiates payment** → `userUid` is stored in pass document
2. **Payment gateway callback** → Backend updates pass status to "active"
3. **Backend updates student** → Sets `hasEventPass: true` in students collection
4. **User redirected to result page** → Frontend waits 2 seconds
5. **Profile refresh triggered** → `refreshStudentProfile()` fetches latest data
6. **UI updates** → User can now register for events without being asked for a pass

## URGENT: Next Steps to Fix orderId Issue

The callback is receiving `orderId: null`. To diagnose:

1. **Check the decrypted response** - Look for the log:
   ```
   [CCA CALLBACK] Decrypted response: ...
   [CCA CALLBACK] All params: {...}
   ```
   This will show what CCAvenue is actually sending.

2. **Possible causes:**
   - CCAvenue uses a different parameter name (e.g., `merchant_order_id`, `reference_no`)
   - Encryption/decryption mismatch
   - CCAvenue test environment behaves differently

3. **Temporary workaround implemented:**
   - If `orderId` is null, the system tries to find the pass by `trackingId`
   - This is a fallback mechanism until we identify the correct parameter

4. **Permanent fix needed:**
   - Once you see the actual parameters in the logs, update line 52 to use the correct field name
   - Example: `const orderId = params.get("merchant_order_id") || params.get("order_id");`

## Testing Checklist

- [ ] Complete a test payment and verify logs show:
  - `[CCA INIT] Creating pass for userUid: ...`
  - `[CCA CALLBACK] Found pass ... with userUid: ...`
  - `[CCA CALLBACK] ✅ Student ... hasEventPass set to true`
  - `[CCA CALLBACK] ✅ Verified - hasEventPass is now: true`
  - `[AUTH] ✅ Student profile refreshed, hasEventPass: true`

- [ ] After payment success, verify:
  - Student document in Firestore has `hasEventPass: true`
  - Event registration no longer asks for pass
  - User can view their ticket

## Debugging Tips

If `hasEventPass` is still not updating:

1. **Check server logs** for the callback route - look for:
   - "CRITICAL: userUid is missing from pass document"
   - "Failed to update student" errors
   
2. **Check Firestore directly**:
   - Verify pass document has `userUid` field
   - Verify student document exists with correct UID
   - Check if `hasEventPass` field exists and is `true`

3. **Check browser console** for:
   - "[AUTH] Refreshing student profile..."
   - "[AUTH] ✅ Student profile refreshed, hasEventPass: true"

4. **Verify timing**: The 2-second delay might not be enough if there's network latency. Increase if needed.

## Files Modified

1. `src/app/api/payments/ccavenue/callback/route.js`
2. `src/app/api/payments/ccavenue/initiate/route.js`
3. `src/contexts/AuthContext.js`
4. `src/app/payment/result/page.jsx`
