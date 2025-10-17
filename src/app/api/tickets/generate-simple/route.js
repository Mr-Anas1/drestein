export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import QRCode from "qrcode";

// Initialize Firebase Admin
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

// Verify Firebase Authentication
async function verifyAuth(request) {
  getAdminDB();
  const authHeader = request.headers.get("authorization") || request.headers.get("Authorization");
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

// Generate QR Code as Data URL
async function generateQRCode(data) {
  try {
    return await QRCode.toDataURL(data, {
      width: 300,
      margin: 2,
      color: {
        dark: "#000000",
        light: "#FFFFFF"
      }
    });
  } catch (err) {
    console.error("QR Code generation error:", err);
    throw err;
  }
}

// Simple ticket data endpoint (returns JSON instead of PDF)
export async function POST(request) {
  try {
    const decoded = await verifyAuth(request);
    if (!decoded) return NextResponse.json({ error: "Auth required" }, { status: 401 });

    const { passId } = await request.json();
    if (!passId) return NextResponse.json({ error: "passId required" }, { status: 400 });

    const db = getAdminDB();
    
    // Fetch pass details
    const passDoc = await db.collection("passes").doc(passId).get();
    if (!passDoc.exists) {
      return NextResponse.json({ error: "Pass not found" }, { status: 404 });
    }

    const passData = passDoc.data();

    // Fetch student profile (for name, rollNo, college)
    const studentSnap = await db.collection("students").doc(decoded.uid).get();
    const student = studentSnap.exists ? studentSnap.data() : null;
    
    // Verify ownership
    if (passData.userUid !== decoded.uid) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Only generate tickets for verified/active passes
    if (!passData.paymentVerified || passData.status !== "active") {
      return NextResponse.json({ 
        error: "Pass is not active or payment not verified" 
      }, { status: 400 });
    }

    // Generate QR code with pass verification data
    const qrData = JSON.stringify({
      passId: passId,
      userUid: passData.userUid,
      orderId: passData.orderId,
      timestamp: Date.now()
    });
    
    const qrCodeDataURL = await generateQRCode(qrData);

    // Format purchase date
    const purchaseDate = passData.purchasedAt?.toDate 
      ? new Date(passData.purchasedAt.toDate()).toLocaleDateString('en-IN', {
          day: '2-digit',
          month: 'short',
          year: 'numeric'
        })
      : new Date().toLocaleDateString('en-IN', {
          day: '2-digit',
          month: 'short',
          year: 'numeric'
        });

    // Get pass type information
    const passType = passData.passType || 'general';
    let typeInfo = {
      name: 'General Pass',
      validDates: 'November 7-8, 2025',
      eventDate: 'November 7-8, 2025',
      access: 'All technical, non-technical, and cultural events'
    };

    // Handle custom pass with special events
    if (passType === 'custom' && passData.customEvents && passData.customEvents.length > 0) {
      // Fetch special event details
      const eventPromises = passData.customEvents.map(eventId => 
        db.collection('specialEvents').doc(eventId).get()
      );
      const eventDocs = await Promise.all(eventPromises);
      const events = eventDocs
        .filter(doc => doc.exists)
        .map(doc => ({ title: doc.data().title, date: doc.data().date }));
      
      const eventTitles = events.map(e => e.title);
      
      // Extract unique dates from events
      const eventDates = [...new Set(events.map(e => e.date).filter(d => d))]
        .sort((a, b) => new Date(a) - new Date(b));
      
      // Format dates for display
      let formattedDates = 'November 7-8, 2025'; // fallback
      if (eventDates.length > 0) {
        formattedDates = eventDates.map(date => {
          const d = new Date(date);
          return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
        }).join(', ');
      }
      
      // Check if general pass is included
      const includesGeneralPass = passData.includesGeneralPass || false;
      let accessText = '';
      
      if (includesGeneralPass) {
        // General pass + custom events
        accessText = `General Pass (All events) + ${eventTitles.length} Special Event${eventTitles.length > 1 ? 's' : ''}: ${eventTitles.join(', ')}`;
      } else {
        // Only custom events
        accessText = eventTitles.length > 0 
          ? eventTitles.join(', ') 
          : `${passData.customEvents.length} premium events`;
      }

      typeInfo = {
        name: passData.passName || 'Custom Pass',
        validDates: includesGeneralPass ? 'November 7-8, 2025' : formattedDates,
        eventDate: includesGeneralPass ? 'November 7-8, 2025' : formattedDates,
        access: accessText,
        customEvents: eventTitles,
        includesGeneralPass: includesGeneralPass
      };
    } else if (passType === 'workshop') {
      typeInfo = {
        name: 'Workshop Pass',
        validDates: 'November 7-8, 2025',
        eventDate: 'November 7-8, 2025',
        access: 'All workshop sessions'
      };
    }

    // Return ticket data as JSON
    return NextResponse.json({
      success: true,
      ticket: {
        passId: passId,
        name: (student?.name && student.name.trim()) || decoded.name || decoded.email?.split('@')[0] || "Event Attendee",
        email: decoded.email || passData.email || "N/A",
        orderId: passData.orderId || "N/A",
        purchaseDate: purchaseDate,
        amount: passData.passPrice || passData.amount || "250",
        qrCode: qrCodeDataURL,
        status: "active",
        passType: typeInfo.name,
        validDates: typeInfo.validDates,
        eventDate: typeInfo.eventDate,
        access: typeInfo.access,
        customEvents: typeInfo.customEvents || null,
        rollNo: student?.rollNo || null,
        college: student?.college || null
      }
    });

  } catch (e) {
    console.error("[TICKET GEN SIMPLE] Error:", e);
    return NextResponse.json({ 
      error: e?.message || "Failed to generate ticket" 
    }, { status: 500 });
  }
}
