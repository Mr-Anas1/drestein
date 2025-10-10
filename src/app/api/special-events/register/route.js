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

// POST - Add special event to user's cart
export async function POST(request) {
  try {
    const decoded = await verifyAuth(request);
    if (!decoded) {
      return NextResponse.json({ error: "Auth required" }, { status: 401 });
    }

    const { eventId, eventTitle, eventPrice, userUid, teamMembers } = await request.json();

    if (!eventId || !userUid) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    if (decoded.uid !== userUid) {
      return NextResponse.json({ error: "UID mismatch" }, { status: 403 });
    }

    const db = getAdminDB();

    // Check if user already has this event in cart
    const existingCart = await db
      .collection("specialEventCart")
      .where("userUid", "==", userUid)
      .where("eventId", "==", eventId)
      .where("status", "==", "pending")
      .limit(1)
      .get();

    if (!existingCart.empty) {
      return NextResponse.json(
        { error: "Event already in cart" },
        { status: 400 }
      );
    }

    // Add to cart
    const cartRef = await db.collection("specialEventCart").add({
      userUid,
      eventId,
      eventTitle,
      eventPrice: parseFloat(eventPrice),
      teamMembers: teamMembers || null,
      status: "pending", // pending, purchased
      addedAt: FieldValue.serverTimestamp(),
    });

    return NextResponse.json({
      id: cartRef.id,
      message: "Event added to cart successfully",
    });
  } catch (error) {
    console.error("Error adding to cart:", error);
    return NextResponse.json(
      { error: error.message || "Failed to add event to cart" },
      { status: 500 }
    );
  }
}

// GET - Get user's cart
export async function GET(request) {
  try {
    const decoded = await verifyAuth(request);
    if (!decoded) {
      return NextResponse.json({ error: "Auth required" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const userUid = searchParams.get("userUid");

    if (!userUid || decoded.uid !== userUid) {
      return NextResponse.json({ error: "Invalid request" }, { status: 403 });
    }

    const db = getAdminDB();
    const cartSnapshot = await db
      .collection("specialEventCart")
      .where("userUid", "==", userUid)
      .where("status", "==", "pending")
      .get();

    const cartItems = cartSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    const total = cartItems.reduce((sum, item) => sum + (item.eventPrice || 0), 0);

    return NextResponse.json({ cartItems, total });
  } catch (error) {
    console.error("Error fetching cart:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch cart" },
      { status: 500 }
    );
  }
}

// DELETE - Remove item from cart
export async function DELETE(request) {
  try {
    const decoded = await verifyAuth(request);
    if (!decoded) {
      return NextResponse.json({ error: "Auth required" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const cartItemId = searchParams.get("id");

    if (!cartItemId) {
      return NextResponse.json({ error: "Cart item ID required" }, { status: 400 });
    }

    const db = getAdminDB();
    const cartItemRef = db.collection("specialEventCart").doc(cartItemId);
    const cartItem = await cartItemRef.get();

    if (!cartItem.exists) {
      return NextResponse.json({ error: "Cart item not found" }, { status: 404 });
    }

    const cartData = cartItem.data();
    if (cartData.userUid !== decoded.uid) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    await cartItemRef.delete();

    return NextResponse.json({ message: "Item removed from cart" });
  } catch (error) {
    console.error("Error removing from cart:", error);
    return NextResponse.json(
      { error: error.message || "Failed to remove item from cart" },
      { status: 500 }
    );
  }
}
