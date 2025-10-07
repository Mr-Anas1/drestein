'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { CheckCircle, XCircle, Ticket, Download } from 'lucide-react';

function PaymentResultInner() {
  const params = useSearchParams();
  const router = useRouter();
  const status = (params.get('status') || '').toLowerCase();
  const orderId = params.get('orderId') || '';

  const [message, setMessage] = useState('Processing...');
  const isSuccess = status === 'success';

  useEffect(() => {
    if (!status) return;
    if (status === 'success') setMessage('Payment successful! Your Event Pass is now active.');
    else if (status === 'failure') setMessage('Payment failed. Please try again.');
    else if (status === 'aborted') setMessage('Payment cancelled.');
    else setMessage(`Payment status: ${status}`);
  }, [status]);

  return (
    <div className="max-w-2xl mx-auto px-4 py-16">
      <div className="text-center mb-8">
        {isSuccess ? (
          <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-4" />
        ) : (
          <XCircle className="w-20 h-20 text-red-500 mx-auto mb-4" />
        )}
        <h1 className="text-4xl font-audiowide mb-4">
          {isSuccess ? 'Payment Successful!' : 'Payment Failed'}
        </h1>
      </div>

      <div className={`p-6 rounded-xl border ${isSuccess ? 'border-green-500/40 bg-green-500/10' : status==='failure' ? 'border-red-500/40 bg-red-500/10' : 'border-border bg-background-soft'}`}>
        <div className="font-space text-lg mb-4 text-center">{message}</div>
        {orderId && (
          <div className="text-sm text-muted-text text-center font-mono">
            Order ID: {orderId}
          </div>
        )}
      </div>

      {isSuccess && (
        <div className="mt-8 p-6 bg-background-soft border border-border rounded-xl">
          <div className="flex items-center gap-3 mb-4">
            <Ticket className="w-6 h-6 text-primary" />
            <h2 className="text-xl font-audiowide">Your Event Pass</h2>
          </div>
          <p className="text-muted-text font-space mb-6">
            Your event pass is now active! Download your ticket to access all DRESTEIN events.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={() => router.push('/my-ticket')}
              className="flex-1 bg-primary hover:bg-hover-primary text-white font-audiowide px-6 py-3 rounded-lg flex items-center justify-center gap-2 transition-colors"
            >
              <Download className="w-5 h-5" />
              Download Ticket
            </button>
            <button
              onClick={() => router.push('/events')}
              className="flex-1 bg-background-soft border border-border hover:bg-background text-white font-audiowide px-6 py-3 rounded-lg transition-colors"
            >
              Browse Events
            </button>
          </div>
        </div>
      )}

      {!isSuccess && (
        <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => router.push('/events')}
            className="bg-primary hover:bg-hover-primary text-white font-audiowide px-6 py-3 rounded-lg transition-colors"
          >
            Back to Events
          </button>
          {status === 'failure' && (
            <button
              onClick={() => router.push('/buy-pass')}
              className="bg-background-soft border border-border hover:bg-background text-white font-audiowide px-6 py-3 rounded-lg transition-colors"
            >
              Try Again
            </button>
          )}
        </div>
      )}
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
