"use client";

import { useState } from "react";
import { Calendar, Clock, ExternalLink, IndianRupee } from "lucide-react";

export default function MbaMarketingAnalyticsCard({ paymentStatus = "", orderId = "", googleFormUrl = "" }) {
    const [payLoading, setPayLoading] = useState(false);
    const [payError, setPayError] = useState("");

    const startPayment = async () => {
        try {
            setPayLoading(true);
            setPayError("");
            const res = await fetch("/api/payments/ccavenue/mba/initiate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ amount: 500 }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data?.error || "Failed to initiate payment");
            if (data.directUrl) {
                window.location.href = data.directUrl;
                return;
            }
            throw new Error("Missing payment redirect URL");
        } catch (e) {
            setPayError(e?.message || "Failed to start payment");
        } finally {
            setPayLoading(false);
        }
    };

    return (
        <div className="bg-background-soft border border-border rounded-2xl p-6 space-y-4">
            <div className="flex flex-wrap gap-4">
                <div className="flex items-center gap-2 text-muted-text font-space">
                    <Calendar className="w-5 h-5 text-secondary" />
                    <span>19th - 23rd Jan 2026</span>
                </div>
                <div className="flex items-center gap-2 text-muted-text font-space">
                    <Clock className="w-5 h-5 text-secondary" />
                    <span>6.00 PM to 8.00 PM</span>
                </div>
            </div>

            <div className="flex items-center justify-between gap-4 flex-wrap">
                <div>
                    <div className="text-muted-text font-space text-sm">Registration Fees</div>
                    <div className="text-white font-audiowide text-3xl flex items-center gap-1">
                        <IndianRupee className="w-6 h-6 text-primary" />
                        500
                    </div>
                    <div className="text-muted-text font-space text-xs">(inclusive of GST)</div>
                </div>

                <button
                    type="button"
                    onClick={startPayment}
                    disabled={payLoading}
                    className="bg-gradient-to-r from-primary to-secondary text-white font-audiowide px-6 py-3 rounded-lg hover:from-hover-primary hover:to-primary transition-all duration-300 disabled:opacity-60"
                >
                    {payLoading ? "Redirecting..." : "Pay Now"}
                </button>
            </div>

            {payError && (
                <div className="text-red-400 font-space text-sm bg-red-500/10 border border-red-500/20 rounded-lg p-3">{payError}</div>
            )}

            <div className="bg-background border border-border rounded-xl p-4">
                <div className="text-white font-audiowide mb-2">Step 2: Register after payment</div>
                <div className="text-muted-text font-space text-sm">
                    After completing the ₹500 payment, open the registration form and upload your payment screenshot to confirm participation.
                </div>

                <div className="mt-3">
                    {googleFormUrl ? (
                        <a
                            href={googleFormUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-2 bg-background-soft border border-border text-white font-audiowide px-5 py-3 rounded-lg hover:border-primary transition-colors"
                        >
                            <ExternalLink className="w-5 h-5 text-secondary" />
                            Open Registration Form
                        </a>
                    ) : (
                        <div className="text-muted-text font-space text-sm">Google Form link is not configured yet.</div>
                    )}
                </div>
            </div>

            {paymentStatus === "failed" && (
                <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4">
                    <div className="text-yellow-200 font-audiowide mb-1">Payment not completed</div>
                    <div className="text-muted-text font-space text-xs">
                        If amount was deducted, please retry after some time or contact coordinators.
                    </div>
                </div>
            )}

            {paymentStatus === "success" && orderId && (
                <div className="text-muted-text font-space text-xs">Order: {orderId}</div>
            )}
        </div>
    );
}
