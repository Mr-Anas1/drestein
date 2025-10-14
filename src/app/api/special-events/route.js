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

async function checkAdminRole(uid) {
  const db = getAdminDB();
  const userDoc = await db.collection("users").doc(uid).get();
  if (!userDoc.exists) return false;
  const userData = userDoc.data();
  return userData.role === "super_admin" || userData.role === "department_admin";
}

// GET - Fetch all special events
export async function GET(request) {
  try {
    const db = getAdminDB();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    // Get single special event by ID
    if (id) {
      const doc = await db.collection("specialEvents").doc(id).get();
      if (!doc.exists) {
        return NextResponse.json({ error: "Special event not found" }, { status: 404 });
      }
      return NextResponse.json({ id: doc.id, ...doc.data() });
    }

    // Get all special events
    const snapshot = await db.collection("specialEvents").orderBy("createdAt", "desc").get();
    const specialEvents = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return NextResponse.json(specialEvents);
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

    const isAdmin = await checkAdminRole(decoded.uid);
    if (!isAdmin) {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    const data = await request.json();
    const {
      title,
      description,
      price,
      category,
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
    } = data;

    if (!title || !description || !price || !category) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const db = getAdminDB();
    const docRef = await db.collection("specialEvents").add({
      title,
      description,
      price: parseFloat(price),
      category, // competition, workshop, event
      type: type || "individual", // individual, team
      maxTeamSize: maxTeamSize ? parseInt(maxTeamSize) : null,
      mode: mode || "offline", // online, offline, hybrid
      img: img || "/images/default-event.jpg",
      venue: venue || "",
      date: date || "",
      time: time || "",
      rules: rules || [],
      prizes: prizes || [],
      contactEmail: contactEmail || "",
      contactPhone: contactPhone || "",
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
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "Event ID required" }, { status: 400 });
    }

    const data = await request.json();
    const db = getAdminDB();
    const docRef = db.collection("specialEvents").doc(id);
    
    const doc = await docRef.get();
    if (!doc.exists) {
      return NextResponse.json({ error: "Special event not found" }, { status: 404 });
    }

    const updateData = { ...data };
    if (data.price) updateData.price = parseFloat(data.price);
    if (data.maxTeamSize) updateData.maxTeamSize = parseInt(data.maxTeamSize);
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
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
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
