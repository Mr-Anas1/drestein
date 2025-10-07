"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Download, Ticket, CheckCircle, XCircle, Loader2 } from "lucide-react";

export default function MyTicketPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [pass, setPass] = useState(null);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    checkAuthAndFetchPass();
  }, []);

  async function checkAuthAndFetchPass() {
    try {
      // Get Firebase auth (assuming you have Firebase initialized in your app)
      const { getAuth, onAuthStateChanged } = await import("firebase/auth");
      const auth = getAuth();

      onAuthStateChanged(auth, async (currentUser) => {
        if (!currentUser) {
          router.push("/login");
          return;
        }

        setUser(currentUser);

        // Fetch user's pass
        const idToken = await currentUser.getIdToken();
        const response = await fetch(`/api/passes?userUid=${currentUser.uid}`, {
          headers: {
            Authorization: `Bearer ${idToken}`,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch pass");
        }

        const data = await response.json();
        
        if (data.pass) {
          setPass(data.pass);
        } else {
          setError("No event pass found. Please purchase a pass first.");
        }

        setLoading(false);
      });
    } catch (err) {
      console.error("Error:", err);
      setError(err.message);
      setLoading(false);
    }
  }

  async function downloadTicket() {
    if (!pass || !user) return;

    setDownloading(true);
    try {
      const idToken = await user.getIdToken();
      const response = await fetch("/api/tickets/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({ passId: pass.id }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to generate ticket");
      }

      // Download the PDF
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `DRESTEIN_Pass_${pass.id}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error("Download error:", err);
      alert(err.message);
    } finally {
      setDownloading(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-600 via-violet-600 to-indigo-700 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-white animate-spin mx-auto mb-4" />
          <p className="text-white text-lg">Loading your ticket...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-600 via-violet-600 to-indigo-700 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center">
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Oops!</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => router.push("/")}
            className="bg-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-purple-700 transition"
          >
            Go to Home
          </button>
        </div>
      </div>
    );
  }

  if (!pass) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-600 via-violet-600 to-indigo-700 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center">
          <Ticket className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">No Ticket Found</h1>
          <p className="text-gray-600 mb-6">
            You don't have an event pass yet. Purchase one to access all DRESTEIN events!
          </p>
          <button
            onClick={() => router.push("/buy-pass")}
            className="bg-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-purple-700 transition"
          >
            Buy Event Pass
          </button>
        </div>
      </div>
    );
  }

  const isActive = pass.status === "active" && pass.paymentVerified;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-violet-600 to-indigo-700 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-8 text-center">
            <Ticket className="w-16 h-16 text-white mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-white mb-2">DRESTEIN Event Pass</h1>
            <p className="text-purple-100">Your Official Event Ticket</p>
          </div>

          {/* Pass Details */}
          <div className="p-8">
            {/* Status Badge */}
            <div className="flex items-center justify-center mb-6">
              {isActive ? (
                <div className="flex items-center gap-2 bg-green-100 text-green-800 px-4 py-2 rounded-full">
                  <CheckCircle className="w-5 h-5" />
                  <span className="font-semibold">Active & Verified</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 bg-yellow-100 text-yellow-800 px-4 py-2 rounded-full">
                  <XCircle className="w-5 h-5" />
                  <span className="font-semibold">
                    {pass.status === "pending_payment" ? "Payment Pending" : "Inactive"}
                  </span>
                </div>
              )}
            </div>

            {/* Pass Information */}
            <div className="space-y-4 mb-8">
              <div className="border-l-4 border-purple-600 pl-4">
                <p className="text-sm text-gray-500 font-semibold uppercase tracking-wide">Pass ID</p>
                <p className="text-lg font-mono text-gray-900">{pass.id}</p>
              </div>

              <div className="border-l-4 border-purple-600 pl-4">
                <p className="text-sm text-gray-500 font-semibold uppercase tracking-wide">Order ID</p>
                <p className="text-lg font-mono text-gray-900">{pass.orderId || "N/A"}</p>
              </div>

              <div className="border-l-4 border-purple-600 pl-4">
                <p className="text-sm text-gray-500 font-semibold uppercase tracking-wide">Amount</p>
                <p className="text-lg font-semibold text-gray-900">₹{pass.amount || "6000.00"}</p>
              </div>

              <div className="border-l-4 border-purple-600 pl-4">
                <p className="text-sm text-gray-500 font-semibold uppercase tracking-wide">Status</p>
                <p className="text-lg font-semibold text-gray-900 capitalize">{pass.status}</p>
              </div>

              {pass.purchasedAt && (
                <div className="border-l-4 border-purple-600 pl-4">
                  <p className="text-sm text-gray-500 font-semibold uppercase tracking-wide">
                    Purchase Date
                  </p>
                  <p className="text-lg text-gray-900">
                    {new Date(pass.purchasedAt.seconds * 1000).toLocaleDateString("en-IN", {
                      day: "2-digit",
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                </div>
              )}
            </div>

            {/* Download Button */}
            {isActive && (
              <button
                onClick={downloadTicket}
                disabled={downloading}
                className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-4 rounded-xl font-bold text-lg hover:from-purple-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
              >
                {downloading ? (
                  <>
                    <Loader2 className="w-6 h-6 animate-spin" />
                    Generating Ticket...
                  </>
                ) : (
                  <>
                    <Download className="w-6 h-6" />
                    Download Ticket PDF
                  </>
                )}
              </button>
            )}

            {!isActive && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-center">
                <p className="text-yellow-800 font-medium">
                  Your pass is not active yet. Complete the payment to download your ticket.
                </p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="bg-gray-50 px-8 py-4 border-t border-gray-200">
            <p className="text-sm text-gray-600 text-center">
              Present this ticket at the event venue for entry
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
