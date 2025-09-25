'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, signOut, GoogleAuthProvider, signInWithPopup, signInWithRedirect, setPersistence, browserLocalPersistence } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';

const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [userRole, setUserRole] = useState(null);
    const [loading, setLoading] = useState(true);
    const [studentProfile, setStudentProfile] = useState(null);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                setUser(user);
                // Fetch user role from Firestore (admins)
                try {
                    const adminDocRef = doc(db, 'users', user.uid);
                    const adminDoc = await getDoc(adminDocRef);
                    if (adminDoc.exists()) {
                        const adminData = adminDoc.data();
                        setUserRole(adminData);
                        // If this is a student user (stored in users collection), also populate student profile
                        if (adminData?.role === 'student') {
                            try {
                                const studentDocRef = doc(db, 'students', user.uid);
                                const studentDoc = await getDoc(studentDocRef);
                                if (studentDoc.exists()) {
                                    setStudentProfile(studentDoc.data());
                                } else {
                                    setStudentProfile(null);
                                }
                            } catch (e) {
                                console.error('Error fetching student profile for user:', e);
                                setStudentProfile(null);
                            }
                        } else {
                            setStudentProfile(null);
                        }
                    } else {
                        // If not an admin, check if student profile exists
                        const studentDocRef = doc(db, 'students', user.uid);
                        const studentDoc = await getDoc(studentDocRef);
                        if (studentDoc.exists()) {
                            setStudentProfile(studentDoc.data());
                            setUserRole({ role: 'student' });
                        } else {
                            // Default role for new users
                            setUserRole({ role: 'pending', department: null });
                            setStudentProfile(null);
                        }
                    }
                } catch (error) {
                    console.error('Error fetching auth profile:', error);
                    setUserRole({ role: 'pending', department: null });
                    setStudentProfile(null);
                }
            } else {
                setUser(null);
                setUserRole(null);
                setStudentProfile(null);
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    let googleLoginInFlight = false;

    const logout = async () => {
        try {
            await signOut(auth);
        } catch (error) {
            console.error('Error signing out:', error);
        }
    };

    const loginWithGoogleStudent = async () => {
        try {
            if (googleLoginInFlight) return { ok: false, error: new Error('login-in-progress') };
            googleLoginInFlight = true;
            setLoading(true);
            await setPersistence(auth, browserLocalPersistence);
            const provider = new GoogleAuthProvider();
            provider.setCustomParameters({ prompt: 'select_account' });
            const result = await signInWithPopup(auth, provider);
            const u = result.user;

            // Create or update student profile
            const studentRef = doc(db, 'students', u.uid);
            const existing = await getDoc(studentRef);
            const profile = {
                uid: u.uid,
                name: u.displayName || '',
                email: (u.email || '').toLowerCase(),
                photoURL: u.photoURL || '',
                provider: 'google',
                updatedAt: serverTimestamp(),
                // createdAt only on first write
            };
            if (!existing.exists()) {
                await setDoc(studentRef, { ...profile, createdAt: serverTimestamp() }, { merge: true });
            } else {
                await setDoc(studentRef, profile, { merge: true });
            }

            // Also ensure a record exists in users/{uid} for unified management
            const usersRef = doc(db, 'users', u.uid);
            await setDoc(
                usersRef,
                {
                    uid: u.uid,
                    email: (u.email || '').toLowerCase(),
                    name: u.displayName || '',
                    role: 'student',
                    department: null,
                    updatedAt: serverTimestamp(),
                    createdAt: serverTimestamp(), // merge will keep first-created timestamp if present
                },
                { merge: true }
            );

            // State will be updated by onAuthStateChanged
            return { ok: true };
        } catch (error) {
            // Handle common popup errors and fallback to redirect sign-in when blocked
            const code = error?.code || '';
            if (code === 'auth/popup-closed-by-user' || code === 'auth/cancelled-popup-request') {
                // User closed the popup or another request in flight; do not treat as hard error
                console.warn('Google sign-in popup closed or cancelled by user.');
                return { ok: false, error };
            }
            if (code === 'auth/popup-blocked' || code === 'auth/operation-not-supported-in-this-environment') {
                try {
                    const provider = new GoogleAuthProvider();
                    provider.setCustomParameters({ prompt: 'select_account' });
                    await signInWithRedirect(auth, provider);
                    return { ok: true, redirect: true };
                } catch (redirErr) {
                    console.error('Google redirect sign-in failed:', redirErr);
                    return { ok: false, error: redirErr };
                }
            }
            console.error('Google sign-in failed:', error);
            return { ok: false, error };
        } finally {
            googleLoginInFlight = false;
            setLoading(false);
        }
    };

    const value = {
        user,
        userRole,
        loading,
        logout,
        isAuthenticated: !!user,
        isSuperAdmin: userRole?.role === 'super_admin',
        isDepartmentAdmin: userRole?.role === 'department_admin',
        userDepartment: userRole?.department,
        // student-specific
        isStudent: userRole?.role === 'student',
        studentProfile,
        loginWithGoogleStudent,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};
