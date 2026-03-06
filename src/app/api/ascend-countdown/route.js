export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getFirestore, FieldValue } from "firebase-admin/firestore";

const DOC_PATH = { collection: "settings", docId: "aiascendCountdown24h" };
const DURATION_HOURS = 24;
const DURATION_MS = DURATION_HOURS * 60 * 60 * 1000;

function getAdminDB() {
  if (!getApps().length) {
    const projectId =
      process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ||
      process.env.FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    let privateKey = process.env.FIREBASE_PRIVATE_KEY;

    if (!projectId || !clientEmail || !privateKey) {
      throw new Error("Missing Firebase Admin credentials");
    }
    if (privateKey.includes("\\n")) privateKey = privateKey.replace(/\\n/g, "\n");

    initializeApp({
      credential: cert({ projectId, clientEmail, privateKey }),
    });
  }
  return getFirestore();
}

async function verifyAuth(request) {
  getAdminDB();
  const authHeader =
    request.headers.get("authorization") || request.headers.get("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) return null;
  const idToken = authHeader.split(" ")[1];
  const { getAuth } = await import("firebase-admin/auth");
  try {
    const decoded = await getAuth().verifyIdToken(idToken);
    return decoded;
  } catch {
    return null;
  }
}

async function checkIsSuperAdmin(uid) {
  const db = getAdminDB();
  const userDoc = await db.collection("users").doc(uid).get();
  if (!userDoc.exists) return false;
  const userData = userDoc.data();
  return userData?.role === "super_admin";
}

function normalizeDoc(data) {
  const status = data?.status;
  if (status !== "idle" && status !== "running" && status !== "stopped") {
    return { status: "idle", startAtMs: null, pausedRemainingMs: null };
  }

  const startAtMs = typeof data?.startAtMs === "number" ? data.startAtMs : null;
  const pausedRemainingMs =
    typeof data?.pausedRemainingMs === "number" ? data.pausedRemainingMs : null;

  return {
    status,
    startAtMs,
    pausedRemainingMs,
  };
}

export async function GET() {
  try {
    const db = getAdminDB();
    const docRef = db.collection(DOC_PATH.collection).doc(DOC_PATH.docId);
    const snap = await docRef.get();

    const state = snap.exists ? normalizeDoc(snap.data()) : { status: "idle" };

    return NextResponse.json({
      ok: true,
      durationHours: DURATION_HOURS,
      ...state,
      serverNowMs: Date.now(),
    });
  } catch (error) {
    console.error("[ascend-countdown] GET error:", error);
    return NextResponse.json(
      { ok: false, error: error.message || "Failed to get countdown" },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const decoded = await verifyAuth(request);
    if (!decoded) {
      return NextResponse.json({ ok: false, error: "Auth required" }, { status: 401 });
    }

    const isSuper = await checkIsSuperAdmin(decoded.uid);
    if (!isSuper) {
      return NextResponse.json(
        { ok: false, error: "Super admin access required" },
        { status: 403 }
      );
    }

    const payload = await request.json();
    const action = String(payload?.action || "").toLowerCase();

    if (!action || !["start", "stop", "reset"].includes(action)) {
      return NextResponse.json(
        { ok: false, error: "Invalid action" },
        { status: 400 }
      );
    }

    const db = getAdminDB();
    const docRef = db.collection(DOC_PATH.collection).doc(DOC_PATH.docId);
    const snap = await docRef.get();
    const current = snap.exists ? normalizeDoc(snap.data()) : { status: "idle" };

    let next;
    const nowMs = Date.now();

    if (action === "reset") {
      next = { status: "idle", startAtMs: null, pausedRemainingMs: null };
    }

    if (action === "start") {
      if (current?.status === "stopped" && typeof current?.pausedRemainingMs === "number") {
        const startAtMs = nowMs - (DURATION_MS - Math.max(0, current.pausedRemainingMs));
        next = { status: "running", startAtMs, pausedRemainingMs: null };
      } else {
        next = { status: "running", startAtMs: nowMs, pausedRemainingMs: null };
      }
    }

    if (action === "stop") {
      if (current?.status === "running" && typeof current?.startAtMs === "number") {
        const end = current.startAtMs + DURATION_MS;
        const pausedRemainingMs = Math.max(0, end - nowMs);
        next = { status: "stopped", startAtMs: null, pausedRemainingMs };
      } else {
        next = { status: "stopped", startAtMs: null, pausedRemainingMs: DURATION_MS };
      }
    }

    await docRef.set(
      {
        ...next,
        durationHours: DURATION_HOURS,
        updatedAt: FieldValue.serverTimestamp(),
        updatedBy: decoded.uid,
      },
      { merge: true }
    );

    return NextResponse.json({ ok: true, ...next, durationHours: DURATION_HOURS });
  } catch (error) {
    console.error("[ascend-countdown] POST error:", error);
    return NextResponse.json(
      { ok: false, error: error.message || "Failed to update countdown" },
      { status: 500 }
    );
  }
}
