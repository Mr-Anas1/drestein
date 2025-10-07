import { NextResponse } from "next/server";
import crypto from "crypto";

const workingKey = process.env.CCAVENUE_WORKING_KEY; // same used for encryption

export async function POST(req) {
  try {
    const formData = await req.formData();
    const encResp = formData.get("encResp");

    if (!encResp) {
      return NextResponse.json({ error: "Missing encResp" }, { status: 400 });
    }

    // --- Decrypt the response ---
    const key = crypto.createHash("md5").update(workingKey).digest(); // AES-128 key
    const iv = Buffer.alloc(16, "\0"); // 16 null bytes
    const decipher = crypto.createDecipheriv("aes-128-cbc", key, iv);
    let decrypted = decipher.update(encResp, "hex", "utf8");
    decrypted += decipher.final("utf8");

    // --- Extract details ---
    const params = new URLSearchParams(decrypted);
    const orderStatus = params.get("order_status");
    const orderId = params.get("order_id");

    // --- Redirect user to frontend result page ---
    return NextResponse.redirect(
      `https://drestein.vercel.app/payment/result?orderId=${orderId}&status=${orderStatus}`,
      302
    );
  } catch (err) {
    console.error("Error in CCAvenue callback:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
