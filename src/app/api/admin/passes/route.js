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

async function checkIsSuperAdmin(uid) {
  const db = getAdminDB();
  const userDoc = await db.collection("users").doc(uid).get();
  if (!userDoc.exists) return false;
  const userData = userDoc.data();
  return userData.role === "super_admin";
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

    const { searchParams } = new URL(request.url);
    const statsOnly = searchParams.get("stats") === "true";
    const q = searchParams.get("q");
    const emailParam = searchParams.get("email");
    const nameParam = searchParams.get("name");

    let passes = [];

    if (statsOnly) {
      // Compute overall stats across the entire collection
      const totalSnap = await db.collection("passes").get();
      const approvedVerifiedSnap = await db
        .collection("passes")
        .where("paymentVerified", "==", true)
        .where("paymentStatus", "==", "approved")
        .get();

      let revenue = 0;
      for (const doc of approvedVerifiedSnap.docs) {
        const data = doc.data();
        const amount = Number(data.passPrice || data.amount || 0);
        if (!Number.isNaN(amount)) revenue += amount;
      }

      const total = totalSnap.size;
      const verified = approvedVerifiedSnap.size; // verified = approved + verified
      const pending = Math.max(0, total - verified);

      return NextResponse.json({
        stats: { total, verified, pending, revenue },
      });
    }

    async function enrichPass(doc, studentCache) {
      const passData = doc.data();
      const userUid = passData.userUid;
      let userEmail = passData.userEmail || null;
      let userName = passData.userName || null;

      if (userUid && (!userEmail || !userName)) {
        try {
          if (!studentCache.has(userUid)) {
            const studentDoc = await db.collection("students").doc(userUid).get();
            studentCache.set(userUid, studentDoc.exists ? studentDoc.data() : null);
          }
          const studentData = studentCache.get(userUid);
          if (studentData) {
            userEmail = userEmail || studentData.email || null;
            userName = userName || studentData.name || studentData.displayName || null;
          }
        } catch (e) {
          console.error("Error fetching user info:", e);
        }
      }

      return {
        id: doc.id,
        ...passData,
        userEmail,
        userName,
      };
    }

    // Helper to fetch passes by an array of userUids in batches of 10
    async function fetchPassesByUserUids(userUids) {
      const batches = [];
      for (let i = 0; i < userUids.length; i += 10) {
        batches.push(userUids.slice(i, i + 10));
      }
      const studentCache = new Map();
      const results = [];
      for (const batch of batches) {
        const snap = await db
          .collection("passes")
          .where("userUid", "in", batch)
          .get();
        for (const doc of snap.docs) {
          results.push(await enrichPass(doc, studentCache));
        }
      }
      // Sort newest first
      results.sort((a, b) => (b.purchasedAt?.toMillis?.() || 0) - (a.purchasedAt?.toMillis?.() || 0));
      return results;
    }

    const searchEmail = (emailParam || (q && q.includes("@") ? q : null));
    const searchName = nameParam || (q && !q.includes("@") ? q : null);

    if (searchEmail) {
      const normalizedEmail = searchEmail.toLowerCase().trim();

      // 1) Find student by email to get uid
      const studentsSnap = await db
        .collection("students")
        .where("email", "==", normalizedEmail)
        .get();

      const studentCache = new Map();
      const foundUids = studentsSnap.docs.map((d) => {
        studentCache.set(d.id, d.data());
        return d.id;
      });

      const results = [];
      if (foundUids.length > 0) {
        results.push(...(await fetchPassesByUserUids(foundUids)));
      }

      // 2) Also look for passes that directly store userEmail
      const emailPassesSnap = await db
        .collection("passes")
        .where("userEmail", "==", normalizedEmail)
        .get();
      for (const doc of emailPassesSnap.docs) {
        results.push(await enrichPass(doc, studentCache));
      }

      // De-duplicate by id
      const unique = new Map();
      for (const p of results) unique.set(p.id, p);
      passes = Array.from(unique.values());

      return NextResponse.json({ passes });
    }

    if (searchName) {
      const nameQuery = searchName.trim();
      if (!nameQuery) {
        return NextResponse.json({ passes: [] });
      }

      const studentsSnap = await db
        .collection("students")
        .orderBy("name")
        .startAt(nameQuery)
        .endAt(nameQuery + "\uf8ff")
        .limit(50)
        .get();

      if (studentsSnap.empty) {
        return NextResponse.json({ passes: [] });
      }

      const userUids = studentsSnap.docs.map((d) => d.id);
      passes = await fetchPassesByUserUids(userUids);
      return NextResponse.json({ passes });
    }

    // Default: recent 50
    const passesSnapshot = await db
      .collection("passes")
      .orderBy("purchasedAt", "desc")
      .limit(50)
      .get();

    const studentCache = new Map();
    for (const doc of passesSnapshot.docs) {
      passes.push(await enrichPass(doc, studentCache));
    }

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

    // Only super admin can delete passes
    const isSuper = await checkIsSuperAdmin(decoded.uid);
    if (!isSuper) {
      return NextResponse.json({ error: "Super admin access required" }, { status: 403 });
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
