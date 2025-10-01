'use client';

import { useState } from 'react';

export default function CCAvenueTestPaymentPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [gatewayData, setGatewayData] = useState(null); // { actionUrl, encRequest, accessCode, orderId, merchantId, amount }

  const startTestPayment = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/payments/ccavenue/initiate-test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: '1.00' }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Failed to initiate test payment');
      setGatewayData(data);
      // Auto submit the hidden form
      setTimeout(() => {
        const form = document.getElementById('ccavenueTestForm');
        if (form) form.submit();
      }, 100);
    } catch (e) {
      setError(e?.message || 'Failed to start test payment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-white flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-background-soft border border-border rounded-xl p-6">
        <h1 className="text-2xl font-audiowide mb-3">CCAvenue Test Payment</h1>
        <p className="text-sm text-muted-text mb-4">This page initiates a ₹1.00 test transaction on CCAvenue staging.</p>

        {error && (
          <div className="mb-4 text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded p-3">{error}</div>
        )}

        <button
          onClick={startTestPayment}
          disabled={loading}
          className="w-full bg-primary hover:bg-hover-primary text-white font-audiowide px-6 py-2 rounded-lg disabled:opacity-50"
        >
          {loading ? 'Starting...' : 'Pay ₹1.00 (Test)'}
        </button>

        {/* Hidden form to CCAvenue gateway */}
        {gatewayData && (
          <form id="ccavenueTestForm" method="post" action={gatewayData.actionUrl} className="hidden">
            {gatewayData.merchantId && <input type="hidden" name="merchant_id" value={gatewayData.merchantId} />}
            <input type="hidden" name="encRequest" value={gatewayData.encRequest} />
            <input type="hidden" name="access_code" value={gatewayData.accessCode} />
          </form>
        )}

        <div className="mt-4 text-xs text-muted-text">
          After redirection, choose NetBanking → AvenuesTest to simulate SUCCESS/FAILURE.
        </div>
      </div>
    </div>
  );
}
