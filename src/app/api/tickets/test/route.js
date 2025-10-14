export const runtime = "nodejs";

import { NextResponse } from "next/server";
import puppeteer from "puppeteer";
import QRCode from "qrcode";
import { generateTicketHTML } from "../../../../lib/ticketTemplate.js";

// Test endpoint to verify ticket generation works
export async function GET() {
  try {
    // Generate test QR code
    const testQRData = JSON.stringify({
      passId: "TEST123",
      userUid: "test-user-uid",
      orderId: "TEST-ORDER-123",
      timestamp: Date.now()
    });
    
    const qrCodeDataURL = await QRCode.toDataURL(testQRData, {
      width: 300,
      margin: 2,
      color: {
        dark: "#000000",
        light: "#FFFFFF"
      }
    });

    // Test ticket data
    const ticketData = {
      passId: "TEST-PASS-12345",
      name: "John Doe",
      email: "john.doe@example.com",
      orderId: "ORD-2025-001",
      purchaseDate: "15 Jan, 2025",
      amount: "6000.00",
      qrCodeData: qrCodeDataURL
    };

    // Generate HTML
    const htmlContent = generateTicketHTML(ticketData);

    // Generate PDF
    const browser = await puppeteer.launch({
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
    
    await browser.close();

    // Return PDF
    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="TEST_TICKET.pdf"',
        'Content-Length': pdfBuffer.length.toString()
      }
    });

  } catch (e) {
    console.error("[TEST TICKET] Error:", e);
    return NextResponse.json({ 
      error: e?.message || "Failed to generate test ticket",
      stack: e?.stack 
    }, { status: 500 });
  }
}
