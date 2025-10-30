"use client";

import { useState } from 'react';
import Header from '@/components/Header';

export default function CCAvenueParamsDebugPage() {
  const [results, setResults] = useState({});
  const [loading, setLoading] = useState({});
  const [error, setError] = useState('');

  const variants = [
    { key: 'minimal', name: 'Minimal Required', desc: 'Only essential parameters' },
    { key: 'standard', name: 'Current Format', desc: 'Your current implementation' },
    { key: 'reordered', name: 'Reordered Params', desc: 'Different parameter order' },
    { key: 'noMerchantParams', name: 'No Extra Params', desc: 'Without merchant_param1/2' },
    { key: 'withBilling', name: 'With Billing Info', desc: 'Includes billing details' },
    { key: 'documentation', name: 'Documentation Format', desc: 'CCAvenue docs standard' }
  ];

  const testVariant = async (variantKey) => {
    try {
      setLoading(prev => ({ ...prev, [variantKey]: true }));
      setError('');
      
      const response = await fetch('/api/debug/ccavenue-params', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ variant: variantKey, testAmount: '1.00' })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate test');
      }
      
      setResults(prev => ({ ...prev, [variantKey]: data }));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(prev => ({ ...prev, [variantKey]: false }));
    }
  };

  const openTestUrl = (variantKey) => {
    const result = results[variantKey];
    if (result?.testUrl) {
      window.open(result.testUrl, '_blank');
    }
  };

  return (
    <div className="min-h-screen bg-background text-white">
      <Header />
      <div className="max-w-6xl mx-auto px-4 py-10">
        <h1 className="text-3xl font-audiowide mb-6">CCAvenue Parameter Format Test</h1>
        
        <div className="mb-6 bg-green-500/10 border border-green-500/20 rounded-lg p-4">
          <h2 className="text-green-400 font-semibold mb-2">✅ Progress Update</h2>
          <p className="text-sm">
            <strong>Method 1 encryption is CORRECT!</strong> Now we're testing different parameter formats 
            to find the exact combination CCAvenue expects.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {variants.map((variant) => (
            <div key={variant.key} className="bg-background-soft border border-border rounded-lg p-6">
              <div className="mb-4">
                <h3 className="font-audiowide text-lg mb-2">{variant.name}</h3>
                <p className="text-sm text-muted-text mb-3">{variant.desc}</p>
              </div>

              <div className="space-y-3">
                <button
                  onClick={() => testVariant(variant.key)}
                  disabled={loading[variant.key]}
                  className="w-full px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-background-soft disabled:text-muted-text text-white font-audiowide rounded transition-colors"
                >
                  {loading[variant.key] ? 'Generating...' : 'Generate Test'}
                </button>

                {results[variant.key] && (
                  <div className="space-y-2">
                    <div className="text-xs text-muted-text">Order ID:</div>
                    <div className="font-mono text-xs bg-background border border-border rounded p-2">
                      {results[variant.key].orderId}
                    </div>
                    
                    <div className="text-xs text-muted-text">Parameters Preview:</div>
                    <div className="font-mono text-xs bg-background border border-border rounded p-2 max-h-20 overflow-y-auto">
                      {results[variant.key].plainText?.substring(0, 200)}...
                    </div>

                    <button
                      onClick={() => openTestUrl(variant.key)}
                      className="w-full px-4 py-2 bg-green-500 hover:bg-green-600 text-white font-audiowide rounded transition-colors"
                    >
                      🚀 Test This Format
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {error && (
          <div className="mt-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
            <p className="text-red-400">Error: {error}</p>
          </div>
        )}

        {/* Instructions */}
        <div className="mt-8 bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-6">
          <h2 className="text-xl font-audiowide mb-4 text-yellow-400">Testing Instructions</h2>
          <div className="space-y-3 text-sm">
            <div><strong>1. Generate Tests:</strong> Click "Generate Test" for each format</div>
            <div><strong>2. Test Each Format:</strong> Click "🚀 Test This Format" to open in new tab</div>
            <div><strong>3. Check Results:</strong> Look for which one works or gives different errors</div>
            <div><strong>4. Report Back:</strong> Tell me which format works best</div>
          </div>
          
          <div className="mt-4 space-y-2">
            <div className="text-yellow-400 font-semibold">What to Look For:</div>
            <div className="text-sm">✅ <strong>Success:</strong> Redirects to CCAvenue payment page</div>
            <div className="text-sm">🔄 <strong>Different Error:</strong> New error message (progress!)</div>
            <div className="text-sm">❌ <strong>Same Error:</strong> "Something went wrong" (try next format)</div>
          </div>
        </div>

        {/* Quick Results Summary */}
        {Object.keys(results).length > 0 && (
          <div className="mt-6 bg-background-soft border border-border rounded-lg p-6">
            <h2 className="text-xl font-audiowide mb-4">Generated Tests Summary</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(results).map(([key, result]) => (
                <div key={key} className="bg-background border border-border rounded p-3">
                  <div className="text-sm font-semibold">{variants.find(v => v.key === key)?.name}</div>
                  <div className="text-xs text-muted-text mt-1">Order: {result.orderId}</div>
                  <button
                    onClick={() => openTestUrl(key)}
                    className="mt-2 text-xs px-2 py-1 bg-primary hover:bg-hover-primary text-white rounded transition-colors"
                  >
                    Test
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
