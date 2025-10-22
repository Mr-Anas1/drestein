export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getFirestore, FieldValue } from "firebase-admin/firestore";

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
    if (privateKey.includes("\\n"))
      privateKey = privateKey.replace(/\\n/g, "\n");

    initializeApp({
      credential: cert({ projectId, clientEmail, privateKey }),
    });
  }
  return getFirestore();
}

export async function GET() {
  try {
    const db = getAdminDB();
    const snapshot = await db
      .collection("events")
      .orderBy("createdAt", "desc")
      .get();
    const events = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));

    return NextResponse.json(events);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const eventData = await request.json();
    // Normalize expiryDate to ISO if provided (accepts YYYY-MM-DD or ISO)
    if (eventData.expiryDate) {
      const raw = String(eventData.expiryDate);
      const d = new Date(raw);
      if (!isNaN(d.getTime())) {
        eventData.expiryDate = raw.length <= 10 ? raw : d.toISOString();
      }
    }

    // Normalize startDate and endDate for multi-day events
    if (eventData.startDate) {
      const raw = String(eventData.startDate);
      const d = new Date(raw);
      if (!isNaN(d.getTime())) {
        eventData.startDate = raw.length <= 10 ? raw : d.toISOString();
      }
    }
    if (eventData.endDate) {
      const raw = String(eventData.endDate);
      const d = new Date(raw);
      if (!isNaN(d.getTime())) {
        eventData.endDate = raw.length <= 10 ? raw : d.toISOString();
      }
    }

    // Validate required fields including department
    if (!eventData.department) {
      return NextResponse.json(
        { error: "Department is required" },
        { status: 400 }
      );
    }

    const db = getAdminDB();
    const docRef = await db.collection("events").add({
      ...eventData,
      createdAt: FieldValue.serverTimestamp(),
      participationCount: 0,
    });

    return NextResponse.json({
      id: docRef.id,
      ...eventData,
      createdAt: new Date().toISOString(),
      participationCount: 0,
    });
  } catch (error) {
    console.error("Error adding event:", error);
    return NextResponse.json({ error: "Failed to add event" }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const { id, ...eventData } = await request.json();
    if (eventData.expiryDate) {
      const raw = String(eventData.expiryDate);
      const d = new Date(raw);
      if (!isNaN(d.getTime())) {
        eventData.expiryDate = raw.length <= 10 ? raw : d.toISOString();
      }
    }
    // Normalize startDate and endDate for multi-day events
    if (eventData.startDate) {
      const raw = String(eventData.startDate);
      const d = new Date(raw);
      if (!isNaN(d.getTime())) {
        eventData.startDate = raw.length <= 10 ? raw : d.toISOString();
      }
    }
    if (eventData.endDate) {
      const raw = String(eventData.endDate);
      const d = new Date(raw);
      if (!isNaN(d.getTime())) {
        eventData.endDate = raw.length <= 10 ? raw : d.toISOString();
      }
    }

    if (!id) {
      return NextResponse.json(
        { error: "Event ID is required" },
        { status: 400 }
      );
    }

    const db = getAdminDB();
    const eventRef = db.collection("events").doc(id);
    await eventRef.update({
      ...eventData,
      updatedAt: FieldValue.serverTimestamp(),
    });

    return NextResponse.json({ message: "Event updated successfully" });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Event ID is required" },
        { status: 400 }
      );
    }

    const db = getAdminDB();
    await db.collection("events").doc(id).delete();

    return NextResponse.json({ message: "Event deleted successfully" });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
