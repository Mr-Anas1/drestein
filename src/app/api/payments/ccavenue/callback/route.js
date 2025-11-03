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

// Helper function to auto-register user for special events in custom pass
async function autoRegisterSpecialEvents(db, userUid, customEvents, passId) {
  if (!customEvents || customEvents.length === 0) {
    console.log(`[CCA CALLBACK] No custom events to register`);
    return;
  }

  console.log(`[CCA CALLBACK] Auto-registering ${customEvents.length} special events for user ${userUid}`);

  try {
    // Fetch user's profile data from students collection
    const studentDoc = await db.collection("students").doc(userUid).get();
    let userName = "Unknown";
    let userEmail = "unknown@example.com";
    let userRollNo = null;
    let userCollege = null;
    let isStudent = false;

    if (studentDoc.exists) {
      const studentData = studentDoc.data();
      userName = studentData.name || studentData.displayName || "Unknown";
      userEmail = studentData.email || "unknown@example.com";
      userRollNo = studentData.rollNo || null;
      userCollege = studentData.college || null;
      isStudent = studentData.isStudent || false;
      var userPhone = studentData.phone || null;
      console.log(`[CCA CALLBACK] ✅ Fetched user data - Name: ${userName}, Email: ${userEmail}, Roll: ${userRollNo}, College: ${userCollege}`);
    } else {
      console.warn(`[CCA CALLBACK] ⚠️ Student document not found for ${userUid}, using defaults`);
    }

    // Get user's cart items to extract team member info
    const cartSnapshot = await db
      .collection("specialEventCart")
      .where("userUid", "==", userUid)
      .where("status", "==", "pending")
      .get();

    const cartMap = {};
    cartSnapshot.docs.forEach(doc => {
      const data = doc.data();
      cartMap[data.eventId] = {
        cartItemId: doc.id,
        teamMembers: data.teamMembers
      };
    });

    // Register each event
    for (const eventId of customEvents) {
      try {
        // Get event details
        const eventDoc = await db.collection("specialEvents").doc(eventId).get();
        if (!eventDoc.exists) {
          console.warn(`[CCA CALLBACK] Special event ${eventId} not found, skipping`);
          continue;
        }

        const eventData = eventDoc.data();
        const cartItem = cartMap[eventId];

        // Create registration with complete user data
        const registrationData = {
          userUid,
          name: userName,
          email: userEmail,
          eventId,
          eventTitle: eventData.title,
          eventType: "special", // Mark as special event
          isSpecialEvent: true,
          passId, // Link to the pass
          teamMembers: cartItem?.teamMembers || null,
          registeredAt: FieldValue.serverTimestamp(),
          status: "confirmed",
          paymentStatus: "paid",
        };

        // Add student-specific fields if user is a student
        if (isStudent) {
          registrationData.rollNo = userRollNo;
          registrationData.college = userCollege;
          registrationData.isStudent = true;
        }

        // Include phone if available
        if (userPhone) {
          registrationData.phone = String(userPhone);
        }

        await db.collection("registrations").add(registrationData);

        console.log(`[CCA CALLBACK] ✅ Registered user for special event: ${eventData.title}`);

        // Update cart item status to purchased
        if (cartItem?.cartItemId) {
          await db.collection("specialEventCart").doc(cartItem.cartItemId).update({
            status: "purchased",
            purchasedAt: FieldValue.serverTimestamp(),
          });
          console.log(`[CCA CALLBACK] ✅ Updated cart item ${cartItem.cartItemId} to purchased`);
        }
      } catch (eventErr) {
        console.error(`[CCA CALLBACK] ❌ Failed to register event ${eventId}:`, eventErr);
      }
    }

    console.log(`[CCA CALLBACK] ✅ Completed auto-registration for all special events`);
  } catch (err) {
    console.error("[CCA CALLBACK] ❌ Error in autoRegisterSpecialEvents:", err);
  }
}

// Helper function to update pass and student documents
async function updatePassAndStudent(db, passRef, passId, passData, success, orderStatus, trackingId, params) {
  await passRef.update({
    status: success ? "active" : orderStatus || "failed",
    paymentStatus: success ? "approved" : "rejected",
    paymentVerified: success,
    trackingId: trackingId || null,
    gatewayResponse: Object.fromEntries(params),
    updatedAt: FieldValue.serverTimestamp(),
  });

  console.log(`[CCA CALLBACK] Pass ${passId} updated:`, success ? "ACTIVE" : "FAILED");
  console.log(`[CCA CALLBACK] Pass data:`, JSON.stringify(passData, null, 2));

  // Update student's hasEventPass flag if payment successful
  const userUid = passData.userUid || passData.merchant_param2;
  
  if (success && userUid) {
    try {
      const studentRef = db.collection("students").doc(userUid);
      const studentDoc = await studentRef.get();
      const studentData = studentDoc.data() || {};
      
      // Store user email and roll number in pass document (avoid N+1 queries later)
      const passUpdateData = {
        userEmail: studentData.email || null,
        rollNo: studentData.rollNo || null,
      };
      
      await passRef.update(passUpdateData);
      
      // Update student's hasEventPass flag
      await studentRef.set(
        {
          hasEventPass: true,
          eventPassId: passId,
          eventPassPurchasedAt: FieldValue.serverTimestamp(),
        },
        { merge: true }
      );

      // Auto-register for special events if this is a custom pass
      if (passData.passType === "custom" && passData.customEvents) {
        await autoRegisterSpecialEvents(db, userUid, passData.customEvents, passId);
      }
    } catch (studentErr) {
      console.error("[CCA CALLBACK] Error updating student:", studentErr);
    }
  } else {
    console.log(`[CCA CALLBACK] ⚠️ Skipping student update - success: ${success}, userUid: ${userUid || 'MISSING'}`);
    if (!success) {
      console.log(`[CCA CALLBACK] Payment was not successful, status: ${orderStatus}`);
    }
    if (!userUid) {
      console.error(`[CCA CALLBACK] ❌ CRITICAL: userUid is missing from pass document and merchant_param2!`);
    }
  }
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
    console.log("[CCA CALLBACK] Decrypted response:", decrypted);

    // Extract details
    const params = new URLSearchParams(decrypted);
    const orderStatus = params.get("order_status");
    const trackingId = params.get("tracking_id");
    const amount = params.get("amount");
    
    // ✅ Extract orderId with multiple fallbacks for CCAvenue sandbox bug
    let orderId = params.get("order_id");
    let orderIdSource = "order_id";
    
    if (!orderId) {
      orderId = params.get("merchant_param1");
      orderIdSource = "merchant_param1";
    }
    
    // ✅ Fallback: Find any value that looks like an order ID (13+ digits)
    if (!orderId) {
      const allParams = Object.fromEntries(params);
      orderId = Object.values(allParams).find(v => /^\d{13,}$/.test(v));
      if (orderId) {
        orderIdSource = "regex_pattern_match";
        console.log(`[CCA CALLBACK] ⚠️ Found orderId via regex pattern match: ${orderId}`);
      }
    }
    
    // ✅ Also extract userUid from merchant_param2 if available
    const userUidFromParams = params.get("merchant_param2");

    console.log(`[CCA CALLBACK] Order: ${orderId} (source: ${orderIdSource}), Status: ${orderStatus}`);
    console.log("[CCA CALLBACK] All params:", Object.fromEntries(params));

    // Update pass in Firestore
    const db = getAdminDB();
    if (!orderId) {
      console.error("[CCA CALLBACK] ❌ CRITICAL: orderId is null/undefined!");
      console.error("[CCA CALLBACK] This means CCAvenue didn't return order_id in the response");
      console.error("[CCA CALLBACK] Check if the parameter name is different or if encryption is wrong");
      
      // Try to find pass by tracking_id as fallback
      if (trackingId) {
        console.log(`[CCA CALLBACK] Attempting fallback: searching by trackingId: ${trackingId}`);
        const snapByTracking = await db.collection("passes").where("trackingId", "==", trackingId).limit(1).get();
        if (!snapByTracking.empty) {
          console.log(`[CCA CALLBACK] ✅ Found pass by trackingId`);
          // Continue with this pass
          const passRef = snapByTracking.docs[0].ref;
          const passId = snapByTracking.docs[0].id;
          const passData = snapByTracking.docs[0].data();
          const success = orderStatus?.toLowerCase() === "success";
          
          await updatePassAndStudent(db, passRef, passId, passData, success, orderStatus, trackingId, params);
        } else {
          console.error(`[CCA CALLBACK] ❌ No pass found by trackingId either`);
        }
      }
      
      // Redirect anyway to show status to user
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://drestein.vercel.app";
      return NextResponse.redirect(
        `${baseUrl}/payment/result?orderId=${encodeURIComponent(trackingId || "unknown")}&status=${encodeURIComponent(orderStatus || "")}`,
        302
      );
    }
    
    if (orderId) {
      console.log(`[CCA CALLBACK] Searching for pass with orderId: ${orderId}`);
      const snap = await db.collection("passes").where("orderId", "==", orderId).limit(1).get();
      
      if (!snap.empty) {
        const passRef = snap.docs[0].ref;
        const passId = snap.docs[0].id;
        const passData = snap.docs[0].data();
        const success = orderStatus?.toLowerCase() === "success";
        
        console.log(`[CCA CALLBACK] Found pass ${passId} with userUid: ${passData.userUid || 'MISSING'}`);
        await updatePassAndStudent(db, passRef, passId, passData, success, orderStatus, trackingId, params);
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
