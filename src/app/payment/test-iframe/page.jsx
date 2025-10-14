'use client';

import { useEffect, useRef, useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function CCAvenueIframeTestPage() {
  const [gatewayData, setGatewayData] = useState(null); // { actionUrl, encRequest, accessCode, merchantId, orderId }
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const formRef = useRef(null);

  const startTestPayment = async () => {
    setLoading(true);
    setError('');
    setGatewayData(null);
    try {
      const res = await fetch('/api/payments/ccavenue/test-initiate');
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Failed to get test payload');
      setGatewayData(data);
    } catch (e) {
      setError(e?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (gatewayData && formRef.current) {
      // auto submit into iframe
      formRef.current.submit();
    }
  }, [gatewayData]);

  return (
    <div className="min-h-screen bg-background text-white">
      <Header />
      <div className="max-w-3xl mx-auto px-4 py-10">
        <h1 className="text-2xl font-audiowide mb-4">CCAvenue Iframe Test</h1>
        <p className="text-sm text-muted-text mb-6">
          This page posts a small test transaction (₹5.00) to CCAvenue inside an iframe using our sandbox credentials.
          It does not touch your existing purchase flow.
        </p>

        {error && (
          <div className="mb-4 p-3 rounded-lg border border-red-500/30 bg-red-500/10 text-sm">{error}</div>
        )}

        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={startTestPayment}
            disabled={loading}
            className="bg-primary hover:bg-hover-primary disabled:opacity-50 text-white font-audiowide px-5 py-2 rounded-lg"
          >
            {loading ? 'Preparing…' : 'Start Test Payment (₹5)'}
          </button>
          {gatewayData?.orderId && (
            <span className="text-xs text-muted-text">Order ID: {gatewayData.orderId}</span>
          )}
        </div>

        {/* Iframe container */}
        <div className="border border-border rounded-lg overflow-hidden bg-background-soft">
          <iframe
            name="ccavenue_iframe"
            title="CCAvenue Payment"
            className="w-full h-[560px] bg-white"
          />
        </div>

        {/* Hidden form to post into iframe */}
        {gatewayData && (
          <form
            ref={formRef}
            method="post"
            action={gatewayData.actionUrl}
            target="ccavenue_iframe"
            className="hidden"
          >
            {gatewayData.merchantId && (
              <input type="hidden" name="merchant_id" value={gatewayData.merchantId} />
            )}
            <input type="hidden" name="encRequest" value={gatewayData.encRequest} />
            <input type="hidden" name="access_code" value={gatewayData.accessCode} />
          </form>
        )}
      </div>
      <Footer />
    </div>
  );
}
