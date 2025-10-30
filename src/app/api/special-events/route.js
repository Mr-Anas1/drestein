export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getFirestore, FieldValue } from "firebase-admin/firestore";

// In-memory cache with request deduplication
const cache = {
  allEvents: { data: null, timestamp: null },
  byCategory: new Map(), // category -> { data, timestamp }
  byDept: new Map(), // dept -> { data, timestamp }
  byCategoryAndDept: new Map(), // "category-dept" -> { data, timestamp }
  pendingRequests: new Map(), // key -> Promise
};

const CACHE_DURATION = 30 * 1000; // 30 seconds

function getCacheKey(category, department) {
  if (category && department) return `${category}-${department}`;
  if (category) return `cat-${category}`;
  if (department) return `dept-${department}`;
  return 'all';
}

function isCacheValid(key) {
  let cached = null;
  if (key === 'all') cached = cache.allEvents;
  else if (key.startsWith('cat-')) cached = cache.byCategory.get(key.slice(4));
  else if (key.startsWith('dept-')) cached = cache.byDept.get(key.slice(5));
  else cached = cache.byCategoryAndDept.get(key);
  
  if (!cached || !cached.data) return false;
  return Date.now() - cached.timestamp < CACHE_DURATION;
}

function getFromCache(key) {
  if (key === 'all') return cache.allEvents.data;
  if (key.startsWith('cat-')) return cache.byCategory.get(key.slice(4))?.data;
  if (key.startsWith('dept-')) return cache.byDept.get(key.slice(5))?.data;
  return cache.byCategoryAndDept.get(key)?.data;
}

function setCache(key, data) {
  const entry = { data, timestamp: Date.now() };
  if (key === 'all') cache.allEvents = entry;
  else if (key.startsWith('cat-')) cache.byCategory.set(key.slice(4), entry);
  else if (key.startsWith('dept-')) cache.byDept.set(key.slice(5), entry);
  else cache.byCategoryAndDept.set(key, entry);
}

// Helper to clear all caches after bulk updates
function clearAllCaches() {
  cache.allEvents = { data: null, timestamp: null };
  cache.byCategory.clear();
  cache.byDept.clear();
  cache.byCategoryAndDept.clear();
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

async function verifyAuth(request) {
  getAdminDB();
  const authHeader =
    request.headers.get("authorization") ||
    request.headers.get("Authorization");
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

async function checkAdminRole(uid) {
  const db = getAdminDB();
  const userDoc = await db.collection("users").doc(uid).get();
  if (!userDoc.exists) return false;
  const userData = userDoc.data();
  return (
    userData.role === "super_admin" || userData.role === "department_admin"
  );
}

async function checkIsSuperAdmin(uid) {
  const db = getAdminDB();
  const userDoc = await db.collection("users").doc(uid).get();
  if (!userDoc.exists) return false;
  const userData = userDoc.data();
  return userData.role === "super_admin";
}

// GET - Fetch all special events
export async function GET(request) {
  try {
    const db = getAdminDB();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const category = searchParams.get("category");
    const department = searchParams.get("department");

    // Get single special event by ID (never cache)
    if (id) {
      const doc = await db.collection("specialEvents").doc(id).get();
      if (!doc.exists) {
        return NextResponse.json(
          { error: "Special event not found" },
          { status: 404 }
        );
      }
      return NextResponse.json({ id: doc.id, ...doc.data() });
    }

    // Request deduplication
    const cacheKey = getCacheKey(category, department);
    if (cache.pendingRequests.has(cacheKey)) {
      const cachedData = await cache.pendingRequests.get(cacheKey);
      return NextResponse.json(
        { events: cachedData },
        { headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120' } }
      );
    }

    // Check cache validity
    if (isCacheValid(cacheKey)) {
      const data = getFromCache(cacheKey);
      return NextResponse.json(
        { events: data },
        { headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120' } }
      );
    }

    // Create promise for this request
    const requestPromise = (async () => {
      try {
        let baseQuery = db.collection("specialEvents");
        if (category) {
          baseQuery = baseQuery.where("category", "==", category);
        }
        
        // If department filter is present, handle both array and string formats
        if (department) {
          const norm = String(department).trim().toUpperCase();
          const acceptable = new Set([norm]);
          if (norm === 'CSE-CYB') acceptable.add('CYB');
          if (norm === 'CSE-IOT') acceptable.add('IOT');
          if (norm === 'MED-ELE') acceptable.add('MED');

          const snapshotAll = await baseQuery.get();
          let docs = snapshotAll.docs.filter((d) => {
            const data = d.data();
            // Support both new array format and old string format
            if (Array.isArray(data?.departments)) {
              return data.departments.some(dep => acceptable.has(String(dep).trim().toUpperCase()));
            }
            const dep = String(data?.department || '').trim().toUpperCase();
            return acceptable.has(dep);
          });
          docs = docs.sort((a, b) => {
            const aTime = a.data().createdAt?.toDate?.() || new Date(0);
            const bTime = b.data().createdAt?.toDate?.() || new Date(0);
            return bTime - aTime;
          });
          const specialEvents = docs.map((doc) => ({ id: doc.id, ...doc.data() }));
          setCache(cacheKey, specialEvents);
          return specialEvents;
        }

        // If category filter is present (without department), fetch all and sort in-memory
        if (category) {
          const snapshot = await baseQuery.get();
          let docs = snapshot.docs;
          docs = docs.sort((a, b) => {
            const aTime = a.data().createdAt?.toDate?.() || new Date(0);
            const bTime = b.data().createdAt?.toDate?.() || new Date(0);
            return bTime - aTime;
          });
          const specialEvents = docs.map((doc) => ({ id: doc.id, ...doc.data() }));
          setCache(cacheKey, specialEvents);
          return specialEvents;
        }

        // No filters; safe to orderBy createdAt
        baseQuery = baseQuery.orderBy("createdAt", "desc");
        const snapshot = await baseQuery.get();
        const specialEvents = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setCache(cacheKey, specialEvents);
        return specialEvents;
      } finally {
        cache.pendingRequests.delete(cacheKey);
      }
    })();

    cache.pendingRequests.set(cacheKey, requestPromise);
    const specialEvents = await requestPromise;
    return NextResponse.json(
      { events: specialEvents },
      { headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120' } }
    );
  } catch (error) {
    console.error("Error fetching special events:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch special events" },
      { status: 500 }
    );
  }
}

// POST - Create new special event (Admin only)
export async function POST(request) {
  try {
    const decoded = await verifyAuth(request);
    if (!decoded) {
      return NextResponse.json({ error: "Auth required" }, { status: 401 });
    }

    const isSuper = await checkIsSuperAdmin(decoded.uid);
    if (!isSuper) {
      return NextResponse.json(
        { error: "Super admin access required" },
        { status: 403 }
      );
    }

    const data = await request.json();
    const {
      title,
      description,
      price,
      category,
      department,
      departments,
      type,
      maxTeamSize,
      mode,
      img,
      venue,
      date,
      time,
      rules,
      prizes,
      contactEmail,
      contactPhone,
      expiryDate,
      competitionPptUrl,
      competitionGformLink,
      competitionCustomHeading,
      competitionCustomText,
      competitionCustomSections,
    } = data;

    if (!title || !description || !price || !category) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Validate departments array
    const deptArray = Array.isArray(departments) ? departments : (department ? [department] : []);
    if (deptArray.length === 0) {
      return NextResponse.json(
        { error: "At least one department must be selected" },
        { status: 400 }
      );
    }

    const db = getAdminDB();
    let normalizedExpiry = null;
    if (expiryDate) {
      const raw = String(expiryDate);
      const d = new Date(raw);
      if (!isNaN(d.getTime())) {
        normalizedExpiry = raw.length <= 10 ? raw : d.toISOString();
      }
    }

    // Normalize startDate and endDate for multi-day events
    let normalizedStartDate = null;
    if (data.startDate) {
      const raw = String(data.startDate);
      const d = new Date(raw);
      if (!isNaN(d.getTime())) {
        normalizedStartDate = raw.length <= 10 ? raw : d.toISOString();
      }
    }
    let normalizedEndDate = null;
    if (data.endDate) {
      const raw = String(data.endDate);
      const d = new Date(raw);
      if (!isNaN(d.getTime())) {
        normalizedEndDate = raw.length <= 10 ? raw : d.toISOString();
      }
    }

    // Normalize custom sections
    let normalizedSections = [];
    if (Array.isArray(competitionCustomSections)) {
      normalizedSections = competitionCustomSections
        .filter((s) => s && (String(s.heading || '').trim() || String(s.text || '').trim()))
        .map((s) => ({
          heading: String(s.heading || '').trim(),
          text: String(s.text || '').trim(),
          afterRegistration: !!s.afterRegistration,
          isLink: !!s.isLink,
          linkUrl: String(s.linkUrl || '').trim(),
        }));
    } else if (competitionCustomHeading || competitionCustomText) {
      normalizedSections = [
        {
          heading: String(competitionCustomHeading || '').trim(),
          text: String(competitionCustomText || '').trim(),
          afterRegistration: false,
          isLink: false,
          linkUrl: '',
        },
      ];
    }

    const docRef = await db.collection("specialEvents").add({
      title,
      description,
      price: parseFloat(price),
      category, // competition, workshop, event
      departments: deptArray, // Array of departments
      type: type || "individual", // individual, team
      maxTeamSize: maxTeamSize ? parseInt(maxTeamSize) : null,
      mode: mode || "offline", // online, offline, hybrid
      img: img || "/images/default-event.jpg",
      venue: venue || "",
      date: date || "",
      time: time || "",
      endTime: data.endTime || "",
      isMultiDay: data.isMultiDay || false,
      startDate: normalizedStartDate,
      endDate: normalizedEndDate,
      // visibility flags
      isForStudents: data.isForStudents !== false, // default true
      isForNonStudents: !!data.isForNonStudents, // default false
      rules: rules || [],
      prizes: prizes || [],
      contactEmail: contactEmail || "",
      contactPhone: contactPhone || "",
      studentCoordinators: data.studentCoordinators || [],
      facultyCoordinators: data.facultyCoordinators || [],
      expiryDate: normalizedExpiry,
      competitionPptUrl: competitionPptUrl || "",
      competitionGformLink: competitionGformLink || "",
      competitionCustomHeading: competitionCustomHeading || "",
      competitionCustomText: competitionCustomText || "",
      competitionCustomSections: normalizedSections,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });

    return NextResponse.json(
      { id: docRef.id, message: "Special event created successfully" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating special event:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create special event" },
      { status: 500 }
    );
  }
}

// PUT - Update special event (Admin only)
export async function PUT(request) {
  try {
    const decoded = await verifyAuth(request);
    if (!decoded) {
      return NextResponse.json({ error: "Auth required" }, { status: 401 });
    }

    const isAdmin = await checkAdminRole(decoded.uid);
    if (!isAdmin) {
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "Event ID required" }, { status: 400 });
    }

    const data = await request.json();
    if (data.expiryDate) {
      const raw = String(data.expiryDate);
      const d = new Date(raw);
      if (!isNaN(d.getTime())) {
        data.expiryDate = raw.length <= 10 ? raw : d.toISOString();
      }
    }
    // Normalize startDate and endDate for multi-day events
    if (data.startDate) {
      const raw = String(data.startDate);
      const d = new Date(raw);
      if (!isNaN(d.getTime())) {
        data.startDate = raw.length <= 10 ? raw : d.toISOString();
      }
    }
    if (data.endDate) {
      const raw = String(data.endDate);
      const d = new Date(raw);
      if (!isNaN(d.getTime())) {
        data.endDate = raw.length <= 10 ? raw : d.toISOString();
      }
    }
    const db = getAdminDB();
    const docRef = db.collection("specialEvents").doc(id);

    const doc = await docRef.get();
    if (!doc.exists) {
      return NextResponse.json(
        { error: "Special event not found" },
        { status: 404 }
      );
    }

    const updateData = { ...data };
    if (data.price) updateData.price = parseFloat(data.price);
    if (data.maxTeamSize) updateData.maxTeamSize = parseInt(data.maxTeamSize);
    
    // Handle departments array
    if (data.departments) {
      const deptArray = Array.isArray(data.departments) ? data.departments : (data.department ? [data.department] : []);
      if (deptArray.length === 0) {
        return NextResponse.json(
          { error: "At least one department must be selected" },
          { status: 400 }
        );
      }
      updateData.departments = deptArray;
    }
    
    updateData.updatedAt = FieldValue.serverTimestamp();

    await docRef.update(updateData);

    return NextResponse.json({ message: "Special event updated successfully" });
  } catch (error) {
    console.error("Error updating special event:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update special event" },
      { status: 500 }
    );
  }
}

// DELETE - Delete special event (Admin only)
export async function DELETE(request) {
  try {
    const decoded = await verifyAuth(request);
    if (!decoded) {
      return NextResponse.json({ error: "Auth required" }, { status: 401 });
    }

    const isAdmin = await checkAdminRole(decoded.uid);
    if (!isAdmin) {
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "Event ID required" }, { status: 400 });
    }

    const db = getAdminDB();
    await db.collection("specialEvents").doc(id).delete();

    return NextResponse.json({ message: "Special event deleted successfully" });
  } catch (error) {
    console.error("Error deleting special event:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete special event" },
      { status: 500 }
    );
  }
}

// PATCH - Bulk update visibility flags for all special events (Super Admin only)
export async function PATCH(request) {
  try {
    const decoded = await verifyAuth(request);
    if (!decoded) {
      return NextResponse.json({ error: "Auth required" }, { status: 401 });
    }

    const isSuper = await checkIsSuperAdmin(decoded.uid);
    if (!isSuper) {
      return NextResponse.json(
        { error: "Super admin access required" },
        { status: 403 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const { isForStudents = true, isForNonStudents = true } = body || {};

    const db = getAdminDB();
    const snapshot = await db.collection("specialEvents").get();
    const docs = snapshot.docs;
    let updated = 0;
    for (let i = 0; i < docs.length; i += 400) {
      const batch = db.batch();
      const slice = docs.slice(i, i + 400);
      slice.forEach((doc) => {
        batch.update(doc.ref, {
          isForStudents: !!isForStudents,
          isForNonStudents: !!isForNonStudents,
          updatedAt: FieldValue.serverTimestamp(),
        });
      });
      await batch.commit();
      updated += slice.length;
    }

    // Invalidate caches
    clearAllCaches();

    return NextResponse.json({ updated, isForStudents: !!isForStudents, isForNonStudents: !!isForNonStudents });
  } catch (error) {
    console.error("Error bulk-updating special events:", error);
    return NextResponse.json(
      { error: error.message || "Failed to bulk update special events" },
      { status: 500 }
    );
  }
}
