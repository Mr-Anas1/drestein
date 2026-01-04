export const runtime = "nodejs";

import { NextResponse } from "next/server";
import crypto from "crypto";

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

    const decrypted = decryptCCAvenue(encResp, workingKey);
    const params = new URLSearchParams(decrypted);

    const orderStatus = String(params.get("order_status") || "");
    const trackingId = String(params.get("tracking_id") || "");
    const orderId = String(params.get("order_id") || params.get("merchant_param1") || "");

    const statusLower = orderStatus.toLowerCase();
    const success = statusLower === "success";

    const origin = new URL(req.url).origin;
    const redirectTo = `${origin}/mba?status=${success ? "success" : "failed"}&orderId=${encodeURIComponent(orderId || trackingId || "")}`;

    return NextResponse.redirect(redirectTo, 302);
  } catch (err) {
    console.error("[MBA CCA CALLBACK] Error:", err);
    const origin = new URL(req.url).origin;
    return NextResponse.redirect(`${origin}/mba?status=failed`, 302);
  }
}
