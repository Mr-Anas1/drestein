export const runtime = 'nodejs';

import { NextResponse } from "next/server";
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

// Initialize Firebase Admin SDK once per runtime
function getAdminDB() {
  if (!getApps().length) {
    const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || process.env.FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    let privateKey = process.env.FIREBASE_PRIVATE_KEY;

    // Validate presence
    if (!projectId || !clientEmail || !privateKey) {
      throw new Error(
        'Missing Firebase Admin credentials. Please set FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, and FIREBASE_PRIVATE_KEY in .env.local (PRIVATE KEY must be quoted and include \\n for newlines).'
      );
    }

    // Convert escaped newlines to real newlines
    if (privateKey.includes('\\n')) {
      privateKey = privateKey.replace(/\\n/g, '\n');
    }

    // Ensure key looks like a PEM
    if (!privateKey.includes('BEGIN PRIVATE KEY')) {
      throw new Error('FIREBASE_PRIVATE_KEY is not a valid PEM string. Ensure it is wrapped in quotes and preserves newlines.');
    }

    initializeApp({
      credential: cert({
        projectId,
        clientEmail,
        privateKey,
      }),
    });
  }
  return getFirestore();
}

async function verifyAuth(request) {
  // Ensure Admin SDK is initialized before verifying tokens
  getAdminDB();
  const authHeader = request.headers.get('authorization') || request.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
  const idToken = authHeader.split(' ')[1];
  const { getAuth } = await import('firebase-admin/auth');
  try {
    const decoded = await getAuth().verifyIdToken(idToken);
    return decoded; // contains uid, email, etc.
  } catch (e) {
    console.error('ID token verification failed:', e);
    return null;
  }
}

export async function POST(request) {
  try {
    const decoded = await verifyAuth(request);
    if (!decoded) {
      return NextResponse.json({ error: 'Authentication required. Please sign in with Google to register.' }, { status: 401 });
    }

    const { eventId, name, email, transactionId, userUid } = await request.json();

    // Make transactionId optional
    if (!eventId || !name || !email || !userUid) {
      return NextResponse.json({ error: 'Event ID, name, email, and authentication are required' }, { status: 400 });
    }

    if (decoded.uid !== userUid) {
      return NextResponse.json({ error: 'Unauthorized: UID mismatch' }, { status: 403 });
    }

    const db = getAdminDB();

    // Duplicate check by uid per event
    const dupSnap = await db
      .collection('registrations')
      .where('eventId', '==', eventId)
      .where('userUid', '==', userUid)
      .get();

    if (!dupSnap.empty) {
      return NextResponse.json({
        error: 'You are already registered for this event. Check your email for confirmation details.',
      }, { status: 409 });
    }

    const registrationData = {
      eventId,
      name: name.trim(),
      email: email.toLowerCase().trim(),
      // Only store transactionId if provided and non-empty
      ...(transactionId && String(transactionId).trim() ? { transactionId: String(transactionId).trim() } : {}),
      userUid,
      registeredAt: new Date(),
      status: 'pending_payment',
      paymentStatus: 'pending',
      paymentVerified: false,
    };

    const regRef = await db.collection('registrations').add(registrationData);

    // Update event participation count (increment)
    const eventRef = db.collection('events').doc(eventId);
    await db.runTransaction(async (tx) => {
      const snap = await tx.get(eventRef);
      if (!snap.exists) return;
      const current = snap.data()?.participationCount || 0;
      tx.update(eventRef, { participationCount: current + 1 });
    });

    return NextResponse.json({
      id: regRef.id,
      message: 'Registration successful! You will receive confirmation details via email.',
      ...registrationData,
    }, { status: 201 });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json({ error: error?.message || 'Registration failed. Please try again.' }, { status: 500 });
  }
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get('eventId');
    const userUid = searchParams.get('userUid');

    const db = getAdminDB();

    let qRef;
    if (userUid) {
      qRef = db.collection('registrations').where('userUid', '==', userUid);
    } else if (eventId) {
      qRef = db.collection('registrations').where('eventId', '==', eventId);
    } else {
      return NextResponse.json({ error: 'userUid or eventId is required' }, { status: 400 });
    }

    const registrationsSnap = await qRef.get();
    const participants = registrationsSnap.docs.map((d) => ({ id: d.id, ...d.data() }));

    // Sort by registration date (newest first)
    participants.sort((a, b) => new Date(a.registeredAt) < new Date(b.registeredAt) ? 1 : -1);

    return NextResponse.json({
      participants,
      totalCount: participants.length,
    });
  } catch (error) {
    console.error('Error fetching participants:', error);
    return NextResponse.json({ error: error?.message || 'Failed to fetch participants' }, { status: 500 });
  }
}

export async function PATCH(request) {
  try {
    const { registrationId, status, adminNotes } = await request.json();

    if (!registrationId || !status) {
      return NextResponse.json(
        { error: 'Registration ID and status are required' },
        { status: 400 },
      );
    }

    const db = getAdminDB();

    const registrationRef = db.collection('registrations').doc(registrationId);
    const registrationSnap = await registrationRef.get();

    if (!registrationSnap.exists) {
      return NextResponse.json(
        { error: 'Registration not found' },
        { status: 404 },
      );
    }

    const updateData = {
      status: status === 'approved' ? 'active' : 'rejected',
      paymentStatus: status,
      paymentVerified: status === 'approved',
      updatedAt: new Date().toISOString(),
    };

    if (adminNotes) {
      updateData.adminNotes = adminNotes;
    }

    await registrationRef.update(updateData);

    // If approved, update event's participation count (idempotent-ish check)
    if (status === 'approved') {
      const registrationData = registrationSnap.data();
      const eventRef = db.collection('events').doc(registrationData.eventId);
      await db.runTransaction(async (tx) => {
        const eventSnap = await tx.get(eventRef);
        if (!eventSnap.exists) return;
        // Only increment if previously not active
        if (registrationData.status !== 'active') {
          const current = eventSnap.data()?.participationCount || 0;
          tx.update(eventRef, { participationCount: current + 1 });
        }
      });
    }

    return NextResponse.json({
      message: `Registration ${status} successfully`,
      registrationId,
      status: updateData.status,
    });
  } catch (error) {
    console.error('Error updating registration status:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to update registration status' },
      { status: 500 },
    );
  }
}
