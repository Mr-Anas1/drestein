"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Ticket, CheckCircle, Download, Loader2 } from "lucide-react";

export default function ViewTicketPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [ticket, setTicket] = useState(null);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    fetchTicket();
  }, []);

  async function fetchTicket() {
    try {
      const { getAuth, onAuthStateChanged } = await import("firebase/auth");
      const auth = getAuth();

      onAuthStateChanged(auth, async (currentUser) => {
        if (!currentUser) {
          router.push("/");
          return;
        }

        setUser(currentUser);

        // Get passId from URL if provided
        const urlParams = new URLSearchParams(window.location.search);
        const passIdFromUrl = urlParams.get('passId');

        const idToken = await currentUser.getIdToken();
        
        let passToUse = null;

        if (passIdFromUrl) {
          // Fetch specific pass by ID
          const passResponse = await fetch(`/api/passes?passId=${passIdFromUrl}`, {
            headers: { Authorization: `Bearer ${idToken}` },
          });

          if (!passResponse.ok) {
            throw new Error("Failed to fetch pass");
          }

          const passData = await passResponse.json();
          passToUse = passData.pass;
        } else {
          // Fetch user's passes (fallback to first verified pass)
          const passResponse = await fetch(`/api/passes?userUid=${currentUser.uid}`, {
            headers: { Authorization: `Bearer ${idToken}` },
          });

          if (!passResponse.ok) {
            throw new Error("Failed to fetch pass");
          }

          const passData = await passResponse.json();
          
          // Get first verified pass or first pass
          if (passData.passes && passData.passes.length > 0) {
            passToUse = passData.passes.find(p => p.paymentVerified) || passData.passes[0];
          } else if (passData.pass) {
            passToUse = passData.pass;
          }
        }
        
        if (!passToUse) {
          setError("No event pass found. Please purchase a pass first.");
          setLoading(false);
          return;
        }

        // Generate ticket data
        const ticketResponse = await fetch("/api/tickets/generate-simple", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${idToken}`,
          },
          body: JSON.stringify({ passId: passToUse.id }),
        });

        if (!ticketResponse.ok) {
          const errorData = await ticketResponse.json();
          throw new Error(errorData.error || "Failed to generate ticket");
        }

        const ticketData = await ticketResponse.json();
        setTicket(ticketData.ticket);
        setLoading(false);
      });
    } catch (err) {
      console.error("Error:", err);
      setError(err.message);
      setLoading(false);
    }
  }

  function printTicket() {
    window.print();
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
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Error</h1>
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

  if (!ticket) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-violet-600 to-indigo-700 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Print Button */}
        <div className="mb-6 flex justify-end print:hidden">
          <button
            onClick={printTicket}
            className="bg-white text-purple-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition flex items-center gap-2"
          >
            <Download className="w-5 h-5" />
            Print / Save as PDF
          </button>
        </div>

        {/* Ticket */}
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-12 text-center relative overflow-hidden">
            <div className="absolute inset-0 opacity-10">
              <div className="absolute inset-0" style={{
                backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
                backgroundSize: '30px 30px'
              }}></div>
            </div>
            <Ticket className="w-20 h-20 text-white mx-auto mb-4 relative z-10" />
            <h1 className="text-5xl font-bold text-white mb-2 relative z-10">DRESTEIN</h1>
            <p className="text-purple-100 text-xl relative z-10">Official Event Pass 2025</p>
          </div>

          {/* Body */}
          <div className="p-12">
            {/* Status Badge */}
            <div className="flex items-center justify-center mb-8">
              <div className="flex items-center gap-2 bg-green-100 text-green-800 px-6 py-3 rounded-full">
                <CheckCircle className="w-6 h-6" />
                <span className="font-bold text-lg">Active & Verified</span>
              </div>
            </div>

            {/* Ticket Info Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
              <div className="border-l-4 border-purple-600 pl-6">
                <p className="text-sm text-gray-500 font-semibold uppercase tracking-wide mb-2">Pass Holder</p>
                <p className="text-2xl font-bold text-gray-900">{ticket.name}</p>
              </div>

              <div className="border-l-4 border-purple-600 pl-6">
                <p className="text-sm text-gray-500 font-semibold uppercase tracking-wide mb-2">Email Address</p>
                <p className="text-xl text-gray-900">{ticket.email}</p>
              </div>

              {ticket.rollNo && (
                <div className="border-l-4 border-purple-600 pl-6">
                  <p className="text-sm text-gray-500 font-semibold uppercase tracking-wide mb-2">Roll Number</p>
                  <p className="text-xl text-gray-900">{ticket.rollNo}</p>
                </div>
              )}

              {ticket.college && (
                <div className="border-l-4 border-purple-600 pl-6">
                  <p className="text-sm text-gray-500 font-semibold uppercase tracking-wide mb-2">College</p>
                  <p className="text-xl text-gray-900">{ticket.college}</p>
                </div>
              )}

              <div className="border-l-4 border-purple-600 pl-6">
                <p className="text-sm text-gray-500 font-semibold uppercase tracking-wide mb-2">Order ID</p>
                <p className="text-xl font-mono text-gray-900">{ticket.orderId}</p>
              </div>

              <div className="border-l-4 border-purple-600 pl-6">
                <p className="text-sm text-gray-500 font-semibold uppercase tracking-wide mb-2">Purchase Date</p>
                <p className="text-xl text-gray-900">{ticket.purchaseDate}</p>
              </div>

              <div className="border-l-4 border-purple-600 pl-6">
                <p className="text-sm text-gray-500 font-semibold uppercase tracking-wide mb-2">Amount Paid</p>
                <p className="text-2xl font-bold text-gray-900">₹{ticket.amount}</p>
              </div>

              <div className="border-l-4 border-purple-600 pl-6">
                <p className="text-sm text-gray-500 font-semibold uppercase tracking-wide mb-2">Status</p>
                <p className="text-xl font-bold text-green-600">✓ Verified</p>
              </div>

              {ticket.passType && (
                <div className="border-l-4 border-purple-600 pl-6">
                  <p className="text-sm text-gray-500 font-semibold uppercase tracking-wide mb-2">Pass Type</p>
                  <p className="text-xl text-gray-900">{ticket.passType}</p>
                </div>
              )}

              {ticket.validDates && (
                <div className="border-l-4 border-purple-600 pl-6">
                  <p className="text-sm text-gray-500 font-semibold uppercase tracking-wide mb-2">Valid Dates</p>
                  <p className="text-xl text-gray-900">{ticket.validDates}</p>
                </div>
              )}

              {ticket.access && (
                <div className="border-l-4 border-purple-600 pl-6 md:col-span-2">
                  <p className="text-sm text-gray-500 font-semibold uppercase tracking-wide mb-2">Access To</p>
                  <p className="text-lg text-gray-900">{ticket.access}</p>
                </div>
              )}
            </div>

            {/* Custom Events List */}
            {ticket.customEvents && ticket.customEvents.length > 0 && (
              <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl p-6 mb-12">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Included Special Events:</h3>
                <div className="grid gap-3">
                  {ticket.customEvents.map((eventTitle, index) => (
                    <div key={index} className="flex items-center gap-3 bg-white rounded-lg p-3 shadow-sm">
                      <div className="bg-purple-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm">
                        {index + 1}
                      </div>
                      <span className="text-gray-900 font-medium">{eventTitle}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* QR Code Section */}
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-8 text-center">
              <div className="bg-white p-6 rounded-xl inline-block shadow-lg">
                <img src={ticket.qrCode} alt="QR Code" className="w-64 h-64" />
              </div>
              <p className="mt-6 text-gray-600 font-medium text-lg">
                Scan this code at the event entrance
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="bg-gray-50 px-12 py-6 border-t-2 border-dashed border-gray-300 text-center">
            <p className="text-lg font-mono text-gray-700 font-bold mb-2">
              PASS ID: {ticket.passId}
            </p>
            <p className="text-sm text-gray-500">
              This pass is valid for all DRESTEIN 2025 events. Please present this ticket at the venue.
            </p>
          </div>
        </div>

        {/* Back Button */}
        <div className="mt-6 text-center print:hidden">
          <button
            onClick={() => router.push("/")}
            className="text-white hover:text-purple-200 transition"
          >
            ← Back to Home
          </button>
        </div>
      </div>

      <style jsx global>{`
        @media print {
          body {
            background: white !important;
          }
          .print\\:hidden {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}
