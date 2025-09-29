export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getFirestore, FieldValue } from "firebase-admin/firestore";
import crypto from "crypto";

function getAdminDB() {
  if (!getApps().length) {
    const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || process.env.FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    let privateKey = process.env.FIREBASE_PRIVATE_KEY;
    if (!projectId || !clientEmail || !privateKey) throw new Error("Missing Firebase Admin credentials");
    if (privateKey.includes("\\n")) privateKey = privateKey.replace(/\\n/g, "\n");
    initializeApp({ credential: cert({ projectId, clientEmail, privateKey }) });
  }
  return getFirestore();
}

function decryptCCAvenue(encResp, workingKey) {
  const key = crypto.createHash('md5').update(workingKey).digest();
  const iv = Buffer.alloc(16, 0);
  const decipher = crypto.createDecipheriv('aes-128-cbc', key, iv);
  let decrypted = decipher.update(encResp, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}

export async function POST(request) {
  try {
    const formData = await request.formData();
    const encResp = formData.get('encResp');
    if (!encResp) return NextResponse.json({ error: 'Missing encResp' }, { status: 400 });

    const WORKING_KEY = process.env.CCAVENUE_WORKING_KEY;
    if (!WORKING_KEY) return NextResponse.json({ error: 'Missing CCAVENUE_WORKING_KEY' }, { status: 500 });

    const plain = decryptCCAvenue(encResp, WORKING_KEY);
    // Parse key=value pairs joined by &
    const params = Object.fromEntries(new URLSearchParams(plain));

    const orderId = params.order_id || params.orderId;
    const orderStatus = (params.order_status || '').toLowerCase();

    const db = getAdminDB();
    if (orderId) {
      const snap = await db.collection('passes').where('orderId', '==', orderId).limit(1).get();
      if (!snap.empty) {
        const ref = snap.docs[0].ref;
        const success = orderStatus === 'success';
        await ref.update({
          status: success ? 'active' : orderStatus || 'failed',
          paymentStatus: success ? 'approved' : 'rejected',
          paymentVerified: success,
          gatewayResponse: params,
          updatedAt: FieldValue.serverTimestamp(),
        });
      }
    }

    // Redirect user to client page with result
    const redirectTo = `${process.env.NEXT_PUBLIC_BASE_URL || ''}/payment/result?orderId=${encodeURIComponent(orderId || '')}&status=${encodeURIComponent(orderStatus || '')}`;
    return NextResponse.redirect(redirectTo);
  } catch (e) {
    return NextResponse.json({ error: e?.message || 'Callback error' }, { status: 500 });
  }
}
