export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getFirestore, FieldValue } from "firebase-admin/firestore";

// In-memory cache with request deduplication
const cache = {
  events: { data: null, timestamp: null },
  eventsByDept: new Map(), // dept -> { data, timestamp }
  pendingRequests: new Map(), // key -> Promise
};

const CACHE_DURATION = 30 * 1000; // 30 seconds

function isCacheValid(type, key = null) {
  if (type === 'events') {
    if (!cache.events.data) return false;
    return Date.now() - cache.events.timestamp < CACHE_DURATION;
  }
  if (type === 'eventsByDept' && key) {
    const cached = cache.eventsByDept.get(key);
    if (!cached) return false;
    return Date.now() - cached.timestamp < CACHE_DURATION;
  }
  return false;
}

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

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const department = searchParams.get("department");
    const id = searchParams.get("id");

    const db = getAdminDB();

    // Get single event by ID (never cache)
    if (id) {
      const doc = await db.collection("events").doc(id).get();
      if (!doc.exists) {
        return NextResponse.json(
          { error: "Event not found" },
          { status: 404 }
        );
      }
      return NextResponse.json({ id: doc.id, ...doc.data() });
    }

    // Request deduplication - check if same request is pending
    const cacheKey = department ? `dept-${department}` : 'all';
    if (cache.pendingRequests.has(cacheKey)) {
      const cachedData = await cache.pendingRequests.get(cacheKey);
      return NextResponse.json(
        { events: cachedData },
        { headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120' } }
      );
    }

    // Check cache validity
    if (department && isCacheValid('eventsByDept', department)) {
      return NextResponse.json(
        { events: cache.eventsByDept.get(department).data },
        { headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120' } }
      );
    }
    if (!department && isCacheValid('events')) {
      return NextResponse.json(
        { events: cache.events.data },
        { headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120' } }
      );
    }

    // Create promise for this request
    const requestPromise = (async () => {
      try {
        let query = db.collection("events");
        if (department) {
          query = query.where("department", "==", department);
        }

        const countSnapshot = await query.get();
        let docs = countSnapshot.docs;
        
        docs = docs.sort((a, b) => {
          const aTime = a.data().createdAt?.toDate?.() || new Date(0);
          const bTime = b.data().createdAt?.toDate?.() || new Date(0);
          return bTime - aTime;
        });
        
        const events = docs.map((d) => ({ id: d.id, ...d.data() }));

        // Cache the result
        if (department) {
          cache.eventsByDept.set(department, { data: events, timestamp: Date.now() });
        } else {
          cache.events = { data: events, timestamp: Date.now() };
        }

        return events;
      } finally {
        cache.pendingRequests.delete(cacheKey);
      }
    })();

    cache.pendingRequests.set(cacheKey, requestPromise);
    const events = await requestPromise;
    return NextResponse.json(
      { events },
      { headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120' } }
    );
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
