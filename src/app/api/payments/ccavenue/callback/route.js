export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getFirestore, FieldValue } from "firebase-admin/firestore";
import crypto from "crypto";

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

// Decrypt CCAvenue response
function decryptCCAvenue(encResp, workingKey) {
  const key = crypto.createHash("md5").update(workingKey).digest();
  const iv = Buffer.alloc(16, "\0");
  const decipher = crypto.createDecipheriv("aes-128-cbc", key, iv);
  let decrypted = decipher.update(encResp, "hex", "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
}

export async function POST(req) {
  try {
    const formData = await req.formData();
    const encResp = formData.get("encResp");

    if (!encResp) {
      return NextResponse.json({ error: "Missing encResp" }, { status: 400 });
    }

    const workingKey = process.env.CCAVENUE_WORKING_KEY;
    if (!workingKey) {
      return NextResponse.json({ error: "Missing CCAVENUE_WORKING_KEY" }, { status: 500 });
    }

    // Decrypt the response
    const decrypted = decryptCCAvenue(encResp, workingKey);

    // Extract details
    const params = new URLSearchParams(decrypted);
    const orderStatus = params.get("order_status");
    const orderId = params.get("order_id");
    const trackingId = params.get("tracking_id");
    const amount = params.get("amount");

    console.log("[CCA CALLBACK] Order:", orderId, "Status:", orderStatus);

    // Update pass in Firestore
    const db = getAdminDB();
    if (orderId) {
      const snap = await db.collection("passes").where("orderId", "==", orderId).limit(1).get();
      
      if (!snap.empty) {
        const passRef = snap.docs[0].ref;
        const passId = snap.docs[0].id;
        const passData = snap.docs[0].data();
        const success = orderStatus?.toLowerCase() === "success";

        await passRef.update({
          status: success ? "active" : orderStatus || "failed",
          paymentStatus: success ? "approved" : "rejected",
          paymentVerified: success,
          trackingId: trackingId || null,
          gatewayResponse: Object.fromEntries(params),
          updatedAt: FieldValue.serverTimestamp(),
        });

        console.log(`[CCA CALLBACK] Pass ${passId} updated:`, success ? "ACTIVE" : "FAILED");

        // Update student's hasEventPass flag if payment successful
        if (success && passData.userUid) {
          try {
            console.log(`[CCA CALLBACK] Attempting to update student ${passData.userUid}...`);
            const studentRef = db.collection("students").doc(passData.userUid);
            
            // Check if student document exists
            const studentDoc = await studentRef.get();
            console.log(`[CCA CALLBACK] Student document exists:`, studentDoc.exists);
            
            await studentRef.set(
              {
                hasEventPass: true,
                eventPassId: passId,
                eventPassPurchasedAt: FieldValue.serverTimestamp(),
              },
              { merge: true }
            );
            console.log(`[CCA CALLBACK] ✅ Student ${passData.userUid} hasEventPass set to true`);
          } catch (studentErr) {
            console.error("[CCA CALLBACK] ❌ Failed to update student:", studentErr);
            console.error("[CCA CALLBACK] Error code:", studentErr.code);
            console.error("[CCA CALLBACK] Error message:", studentErr.message);
          }
        } else {
          console.log(`[CCA CALLBACK] Skipping student update - success: ${success}, userUid: ${passData.userUid}`);
        }
      } else {
        console.warn("[CCA CALLBACK] No pass found for orderId:", orderId);
      }
    }

    // Redirect user to frontend result page
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://drestein.vercel.app";
    return NextResponse.redirect(
      `${baseUrl}/payment/result?orderId=${encodeURIComponent(orderId || "")}&status=${encodeURIComponent(orderStatus || "")}`,
      302
    );
  } catch (err) {
    console.error("[CCA CALLBACK] Error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
