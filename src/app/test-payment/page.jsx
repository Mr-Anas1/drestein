"use client";

import { useState } from 'react';
import Header from '@/components/Header';
import { useAuth } from '@/contexts/AuthContext';
import { auth } from '@/lib/firebase';

export default function TestPaymentPage() {
  const { user, isAuthenticated } = useAuth();
  const [results, setResults] = useState({});
  const [loading, setLoading] = useState({});
  const [error, setError] = useState('');

  // Different parameter formats to test
  const testVariants = [
    { 
      key: 'minimal', 
      name: 'Minimal Required', 
      desc: 'Only essential parameters',
      params: ['merchant_id', 'order_id', 'currency', 'amount', 'redirect_url', 'cancel_url']
    },
    { 
      key: 'standard', 
      name: 'Current Format', 
      desc: 'Your current implementation',
      params: ['merchant_id', 'order_id', 'currency', 'amount', 'redirect_url', 'cancel_url', 'language', 'merchant_param1', 'merchant_param2']
    },
    { 
      key: 'nomerchantparams', 
      name: 'No Extra Params', 
      desc: 'Without merchant_param1/2',
      params: ['merchant_id', 'order_id', 'currency', 'amount', 'redirect_url', 'cancel_url', 'language']
    },
    { 
      key: 'withbilling', 
      name: 'With Billing Info', 
      desc: 'Includes billing details',
      params: ['merchant_id', 'order_id', 'currency', 'amount', 'redirect_url', 'cancel_url', 'language', 'billing_name', 'billing_email', 'billing_tel']
    }
  ];

  const testPayment = async (variant) => {
    if (!user) {
      setError('Please login to test payments');
      return;
    }

    try {
      setLoading(prev => ({ ...prev, [variant]: true }));
      setError('');

      const token = await auth.currentUser?.getIdToken?.();
      if (!token) throw new Error('Unable to get auth token');

      // Create test transaction
      const response = await fetch('/api/payments/ccavenue/initiate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          userUid: user.uid,
          passType: 'general',
          passPrice: 1.00,
          passName: `Test Payment - ${variant}`,
          testVariant: variant // Pass variant to backend
        })
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to initiate payment');
      }

      setResults(prev => ({ 
        ...prev, 
        [variant]: {
          ...data,
          timestamp: new Date().toLocaleTimeString()
        }
      }));

      // Auto-redirect to test the payment
      if (data.directUrl) {
        window.open(data.directUrl, '_blank');
      }

    } catch (err) {
      setError(`${variant}: ${err.message}`);
    } finally {
      setLoading(prev => ({ ...prev, [variant]: false }));
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background text-white">
        <Header />
        <div className="max-w-4xl mx-auto px-4 py-20 text-center">
          <h1 className="text-3xl font-audiowide mb-6">Payment Testing</h1>
          <p className="text-muted-text mb-8">Please login to access payment testing tools.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-white">
      <Header />
      <div className="max-w-6xl mx-auto px-4 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-audiowide mb-4">🧪 CCAvenue Payment Testing</h1>
          <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
            <p className="text-yellow-400 text-sm">
              <strong>⚠️ Testing Environment:</strong> This page is for debugging payment issues. 
              Each test creates a ₹1.00 transaction to identify the correct parameter format.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {testVariants.map((variant) => (
            <div key={variant.key} className="bg-background-soft border border-border rounded-lg p-6">
              <div className="mb-4">
                <h3 className="font-audiowide text-lg mb-2">{variant.name}</h3>
                <p className="text-sm text-muted-text mb-3">{variant.desc}</p>
                <div className="text-xs text-muted-text">
                  <strong>Parameters:</strong> {variant.params.join(', ')}
                </div>
              </div>

              <div className="space-y-3">
                <button
                  onClick={() => testPayment(variant.key)}
                  disabled={loading[variant.key]}
                  className="w-full px-4 py-3 bg-primary hover:bg-hover-primary disabled:bg-background-soft disabled:text-muted-text text-white font-audiowide rounded-lg transition-colors"
                >
                  {loading[variant.key] ? 'Testing...' : `🚀 Test ${variant.name}`}
                </button>

                {results[variant.key] && (
                  <div className="bg-background border border-border rounded p-3">
                    <div className="text-xs text-muted-text mb-2">
                      Test Result ({results[variant.key].timestamp})
                    </div>
                    <div className="space-y-1 text-xs">
                      <div><strong>Order ID:</strong> {results[variant.key].orderId}</div>
                      <div><strong>Amount:</strong> ₹1.00</div>
                      <div className="text-green-400">✅ Transaction initiated successfully</div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
            <p className="text-red-400">Error: {error}</p>
          </div>
        )}

        {/* Instructions */}
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-6">
          <h2 className="text-xl font-audiowide mb-4 text-blue-400">Testing Instructions</h2>
          <div className="space-y-3 text-sm">
            <div><strong>1. Test Each Format:</strong> Click the test buttons to try different parameter combinations</div>
            <div><strong>2. Check Results:</strong> Each test opens CCAvenue in a new tab</div>
            <div><strong>3. Note the Outcome:</strong> Record which format works or gives different errors</div>
            <div><strong>4. Expected Results:</strong></div>
            <ul className="list-disc list-inside ml-4 space-y-1 text-muted-text">
              <li>✅ <strong>Success:</strong> Redirects to CCAvenue payment page</li>
              <li>🔄 <strong>Different Error:</strong> New error message (progress!)</li>
              <li>❌ <strong>Same Error:</strong> "Something went wrong" (try next format)</li>
            </ul>
          </div>
        </div>

        {/* Current Status */}
        <div className="mt-6 bg-background-soft border border-border rounded-lg p-6">
          <h2 className="text-xl font-audiowide mb-4">Current Status</h2>
          <div className="space-y-2 text-sm">
            <div>✅ <strong>Credentials:</strong> LIVE environment configured correctly</div>
            <div>✅ <strong>Authentication:</strong> Merchant authentication working</div>
            <div>✅ <strong>Encryption:</strong> Method 1 (Custom IV) is correct</div>
            <div>🔄 <strong>Parameters:</strong> Testing different parameter formats</div>
          </div>
        </div>

        {/* Quick Access */}
        <div className="mt-6 text-center">
          <p className="text-sm text-muted-text mb-4">
            Direct URL for this testing page: <code className="bg-background-soft px-2 py-1 rounded">/test-payment</code>
          </p>
          <p className="text-xs text-muted-text">
            This page is hidden from navigation and only accessible via direct URL
          </p>
        </div>
      </div>
    </div>
  );
}
