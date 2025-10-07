# Authentication & User Creation Troubleshooting

## Issue: Users Not Being Added to Collections

### Step 1: Check Browser Console Logs

After logging in with Google, open browser DevTools (F12) and check the Console tab for these messages:

#### ✅ **Success Logs** (What you should see):
```
[AUTH] Creating/updating student profile for: user@example.com
[AUTH] ✅ Student profile created
[AUTH] Creating/updating users collection for: user@example.com
[AUTH] User data: {uid: "...", email: "...", hasEventPass: false, ...}
[AUTH] ✅ Users collection updated
```

#### ❌ **Error Logs** (What indicates a problem):
```
[AUTH] ❌ Failed to write student profile: FirebaseError: ...
[AUTH] ❌ Failed to write users collection: FirebaseError: ...
```

---

### Step 2: Check Firestore Security Rules

The most common issue is **Firestore security rules blocking writes**.

#### Open Firebase Console:
1. Go to https://console.firebase.google.com
2. Select your project
3. Go to **Firestore Database** → **Rules** tab

#### Required Rules for Users/Students Collections:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Allow authenticated users to read/write their own user document
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Allow authenticated users to read/write their own student document
    match /students/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
    
    // ... other rules
  }
}
```

#### If your rules are too restrictive, update them to:

**Option 1: Allow authenticated users to write their own documents**
```javascript
match /users/{userId} {
  allow read, write: if request.auth != null && request.auth.uid == userId;
}

match /students/{userId} {
  allow read, write: if request.auth != null && request.auth.uid == userId;
}
```

**Option 2: Temporarily allow all writes (for testing only)**
```javascript
match /users/{userId} {
  allow read, write: if request.auth != null;
}

match /students/{userId} {
  allow read, write: if request.auth != null;
}
```

---

### Step 3: Verify Firebase Configuration

Check `src/lib/firebase.js` (or wherever your Firebase config is):

```javascript
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "...",
  authDomain: "...",
  projectId: "...",
  storageBucket: "...",
  messagingSenderId: "...",
  appId: "..."
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
```

Make sure:
- ✅ Config values are correct
- ✅ `db` is exported and imported correctly in `AuthContext.js`

---

### Step 4: Test with Console Logs

1. **Log out** from your app
2. **Open browser DevTools** (F12) → Console tab
3. **Clear console** (trash icon)
4. **Sign in with Google**
5. **Watch for logs** starting with `[AUTH]`

#### What to look for:

**Scenario A: No logs appear**
- Problem: `loginWithGoogleStudent` not being called
- Solution: Check if button is wired correctly

**Scenario B: Logs show errors with "permission-denied"**
- Problem: Firestore security rules blocking writes
- Solution: Update security rules (see Step 2)

**Scenario C: Logs show "✅ Student profile created" but no data in Firestore**
- Problem: Possible Firebase project mismatch
- Solution: Verify you're checking the correct Firebase project

---

### Step 5: Manual Firestore Check

1. Go to Firebase Console → Firestore Database
2. Look for these collections:
   - `users` collection
   - `students` collection
3. Check if your user document exists:
   - Collection: `users`
   - Document ID: Your Firebase Auth UID
   - Fields: `email`, `hasEventPass`, `role`, etc.

---

### Step 6: Test User Creation Manually

Run this in browser console after logging in:

```javascript
// Get current user
const user = auth.currentUser;
console.log('Current user:', user);

// Try to create user document manually
const { doc, setDoc, serverTimestamp } = await import('firebase/firestore');
const { db } = await import('@/lib/firebase');

const userRef = doc(db, 'users', user.uid);
await setDoc(userRef, {
  uid: user.uid,
  email: user.email,
  displayName: user.displayName,
  hasEventPass: false,
  role: 'student',
  createdAt: serverTimestamp(),
  updatedAt: serverTimestamp()
}, { merge: true });

console.log('✅ User document created manually');
```

If this works → Security rules are fine, issue is in AuthContext  
If this fails → Security rules are blocking writes

---

### Step 7: Common Errors & Solutions

#### Error: "Missing or insufficient permissions"
**Cause**: Firestore security rules blocking write  
**Fix**: Update security rules to allow authenticated users to write their own documents

#### Error: "Cannot read properties of undefined (reading 'uid')"
**Cause**: User object not available yet  
**Fix**: Ensure `loginWithGoogleStudent` waits for auth to complete

#### Error: "Firebase: Error (auth/popup-blocked)"
**Cause**: Browser blocking popup  
**Fix**: Already handled with redirect fallback in code

#### No error but no data in Firestore
**Cause**: Writing to wrong Firebase project  
**Fix**: Verify Firebase config matches your project

---

### Step 8: Quick Fix - Update Security Rules Now

**Recommended Rules for Development:**

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Users collection - allow users to manage their own document
    match /users/{userId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null && request.auth.uid == userId;
      allow update: if request.auth != null && 
                       (request.auth.uid == userId || 
                        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role in ['super_admin']);
      allow delete: if request.auth != null && 
                       get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'super_admin';
    }
    
    // Students collection - allow users to manage their own document
    match /students/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Passes collection
    match /passes/{passId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
      allow update: if request.auth != null;
    }
    
    // Registrations collection
    match /registrations/{regId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
      allow update: if request.auth != null;
    }
    
    // Events collection
    match /events/{eventId} {
      allow read: if true; // Public read
      allow write: if request.auth != null && 
                      get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role in ['super_admin', 'department_admin'];
    }
  }
}
```

**Copy these rules to Firebase Console → Firestore → Rules tab → Publish**

---

### Step 9: After Fixing Rules

1. **Clear browser cache** (Ctrl+Shift+Delete)
2. **Log out** from your app
3. **Sign in again** with a new Google account
4. **Check console logs** for success messages
5. **Verify in Firestore** that documents were created

---

### Still Not Working?

Share these details:
1. Console logs (screenshot or copy-paste)
2. Current Firestore security rules
3. Firebase project ID
4. Any error messages in browser console

The issue is almost certainly **Firestore security rules** blocking the writes. Update the rules and it should work! 🎯
