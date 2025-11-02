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

// Get all passes (admin only)
export async function GET(request) {
  try {
    const decoded = await verifyAuth(request);
    if (!decoded) {
      return NextResponse.json({ error: "Auth required" }, { status: 401 });
    }

    const isAdmin = await checkAdminRole(decoded.uid);
    if (!isAdmin) {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    const db = getAdminDB();
    // Support both new and legacy docs:
    // - New: paymentStatus == "approved"
    // - Legacy: paymentVerified == true
    const [approvedSnap, verifiedSnap] = await Promise.all([
      db.collection("passes").where("paymentStatus", "==", "approved").get(),
      db.collection("passes").where("paymentVerified", "==", true).get(),
    ]);
    const passesSnapshot = await db.collection("passes")
      .orderBy("purchasedAt", "desc")
      .limit(50)
      .get();

    const passMap = new Map();

    const collect = async (snap) => {
      for (const doc of snap.docs) {
        const passData = doc.data();
        // Enrich with userEmail/userName
        let userEmail = null;
        let userName = null;
        if (passData.userUid) {
          try {
            const studentDoc = await db.collection("students").doc(passData.userUid).get();
            if (studentDoc.exists) {
              const studentData = studentDoc.data();
              userEmail = studentData.email;
              userName = studentData.name || studentData.displayName || null;
            }
          } catch (e) {
            console.error("Error fetching user email:", e);
          }
        }
        passMap.set(doc.id, {
          id: doc.id,
          ...passData,
          userEmail,
          userName,
        });
      }
    };

    await collect(approvedSnap);
    await collect(verifiedSnap);

    // Convert to array and sort by purchasedAt desc
    const passes = Array.from(passMap.values()).sort((a, b) => {
      const aTime = a.purchasedAt?.toMillis ? a.purchasedAt.toMillis() : (a.purchasedAt ? new Date(a.purchasedAt).getTime() : 0);
      const bTime = b.purchasedAt?.toMillis ? b.purchasedAt.toMillis() : (b.purchasedAt ? new Date(b.purchasedAt).getTime() : 0);
      return bTime - aTime;
    });

    return NextResponse.json({ passes });
  } catch (e) {
    console.error("[ADMIN PASSES GET] Error:", e);
    return NextResponse.json(
      { error: e?.message || "Failed to fetch passes" },
      { status: 500 }
    );
  }
}

// Add a new pass (admin only)
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

    const { userName, userEmail, userUid, orderId, passType, passName, passPrice, paymentVerified, paymentStatus, status, customEvents } = await request.json();

    if (!userName || !userEmail || !userUid || !orderId || !passPrice) {
      return NextResponse.json(
        { error: "User name, email, user ID, order ID, and price are required" },
        { status: 400 }
      );
    }

    const db = getAdminDB();
    
    const passData = {
      userName,
      userEmail: userEmail.toLowerCase().trim(),
      userUid,
      orderId,
      passType: passType || "general",
      passName: passName || "General Pass",
      passPrice: parseFloat(passPrice),
      paymentVerified: paymentVerified !== false,
      paymentStatus: paymentStatus || "approved",
      status: status || "active",
      purchasedAt: FieldValue.serverTimestamp(),
      createdBy: decoded.uid,
      createdAt: FieldValue.serverTimestamp(),
    };

    // Add custom events if provided
    if (customEvents && customEvents.length > 0) {
      passData.customEvents = customEvents;
    }

    const docRef = await db.collection("passes").add(passData);

    return NextResponse.json(
      { id: docRef.id, message: "Pass added successfully", ...passData },
      { status: 201 }
    );
  } catch (e) {
    console.error("[ADMIN PASSES POST] Error:", e);
    return NextResponse.json(
      { error: e?.message || "Failed to add pass" },
      { status: 500 }
    );
  }
}

// Delete a pass (admin only)
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
    const passId = searchParams.get("id");

    if (!passId) {
      return NextResponse.json({ error: "Pass ID is required" }, { status: 400 });
    }

    const db = getAdminDB();
    await db.collection("passes").doc(passId).delete();

    return NextResponse.json({ message: "Pass deleted successfully" });
  } catch (e) {
    console.error("[ADMIN PASSES DELETE] Error:", e);
    return NextResponse.json(
      { error: e?.message || "Failed to delete pass" },
      { status: 500 }
    );
  }
}
