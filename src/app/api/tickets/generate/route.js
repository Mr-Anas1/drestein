export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import puppeteer from "puppeteer";
import QRCode from "qrcode";
import { generateTicketHTML } from "../../../../lib/ticketTemplate.js";

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

// Generate PDF ticket using Puppeteer
async function generatePDFTicket(htmlContent) {
  let browser;
  try {
    browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu'
      ]
    });
    
    const page = await browser.newPage();
    await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
    
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '20px',
        right: '20px',
        bottom: '20px',
        left: '20px'
      }
    });
    
    return pdfBuffer;
  } finally {
    if (browser) await browser.close();
  }
}

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

    // Prepare ticket data
    const ticketData = {
      passId: passId,
      name: decoded.name || decoded.email?.split('@')[0] || "Event Attendee",
      email: decoded.email || passData.email || "N/A",
      orderId: passData.orderId || "N/A",
      purchaseDate: purchaseDate,
      amount: passData.amount || "6000.00",
      qrCodeData: qrCodeDataURL
    };

    // Generate HTML
    const htmlContent = generateTicketHTML(ticketData);

    // Generate PDF
    const pdfBuffer = await generatePDFTicket(htmlContent);

    // Return PDF as downloadable file
    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="DRESTEIN_Pass_${passId}.pdf"`,
        'Content-Length': pdfBuffer.length.toString()
      }
    });

  } catch (e) {
    console.error("[TICKET GEN] Error:", e);
    return NextResponse.json({ 
      error: e?.message || "Failed to generate ticket" 
    }, { status: 500 });
  }
}
