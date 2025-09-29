'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

function PaymentResultInner() {
  const params = useSearchParams();
  const router = useRouter();
  const status = (params.get('status') || '').toLowerCase();
  const orderId = params.get('orderId') || '';

  const [message, setMessage] = useState('Processing...');

  useEffect(() => {
    if (!status) return;
    if (status === 'success') setMessage('Payment successful. Your Event Pass is now active.');
    else if (status === 'failure') setMessage('Payment failed. Please try again.');
    else if (status === 'aborted') setMessage('Payment cancelled.');
    else setMessage(`Payment status: ${status}`);
  }, [status]);

  return (
    <div className="max-w-xl mx-auto px-4 py-16 text-center">
      <h1 className="text-3xl font-audiowide mb-4">Payment Result</h1>
      <div className={`p-4 rounded-lg border ${status==='success' ? 'border-green-500/40 bg-green-500/10' : status==='failure' ? 'border-red-500/40 bg-red-500/10' : 'border-border bg-background-soft'}`}>
        <div className="font-space mb-2">{message}</div>
        {orderId && <div className="text-xs text-muted-text">Order ID: {orderId}</div>}
      </div>
      <button onClick={() => router.push('/events')} className="mt-6 bg-primary hover:bg-hover-primary text-white font-audiowide px-6 py-2 rounded-lg">Back to Events</button>
    </div>
  );
}

export default function PaymentResultPage() {
  return (
    <div className="min-h-screen bg-background text-white">
      <Header />
      <Suspense fallback={<div className="max-w-xl mx-auto px-4 py-16 text-center">Loading...</div>}>
        <PaymentResultInner />
      </Suspense>
      <Footer />
    </div>
  );
}
