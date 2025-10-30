"use client";

import { useState } from 'react';
import Header from '@/components/Header';

export default function CCAvenueTransactionDebugPage() {
  const [debugInfo, setDebugInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [testAmount, setTestAmount] = useState('1.00');

  const generateDebugTransaction = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await fetch('/api/debug/ccavenue-transaction', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ testAmount: parseFloat(testAmount) })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate debug transaction');
      }
      
      setDebugInfo(data.debugInfo);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const testEncryption = (method) => {
    if (!debugInfo) return;
    
    const url = method === 1 
      ? debugInfo.encryptionResults.method1.directUrl 
      : debugInfo.encryptionResults.method2.directUrl;
    
    // Open in new tab to test
    window.open(url, '_blank');
  };

  return (
    <div className="min-h-screen bg-background text-white">
      <Header />
      <div className="max-w-6xl mx-auto px-4 py-10">
        <h1 className="text-3xl font-audiowide mb-6">CCAvenue Transaction Debug</h1>
        
        <div className="mb-6 bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
          <p className="text-blue-400 text-sm">
            This tool generates a debug transaction with detailed encryption info to help identify the exact issue.
          </p>
        </div>

        {/* Controls */}
        <div className="bg-background-soft border border-border rounded-lg p-6 mb-6">
          <h2 className="text-xl font-audiowide mb-4">Generate Debug Transaction</h2>
          <div className="flex items-center gap-4">
            <div>
              <label className="block text-sm text-muted-text mb-2">Test Amount (₹)</label>
              <input
                type="number"
                step="0.01"
                min="1"
                value={testAmount}
                onChange={(e) => setTestAmount(e.target.value)}
                className="bg-background border border-border rounded px-3 py-2 text-white w-24"
              />
            </div>
            <button
              onClick={generateDebugTransaction}
              disabled={loading}
              className="px-6 py-2 bg-primary hover:bg-hover-primary disabled:bg-background-soft disabled:text-muted-text text-white font-audiowide rounded-lg transition-colors"
            >
              {loading ? 'Generating...' : 'Generate Debug Transaction'}
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
            <p className="text-red-400">Error: {error}</p>
          </div>
        )}

        {debugInfo && (
          <div className="space-y-6">
            {/* Transaction Info */}
            <div className="bg-background-soft border border-border rounded-lg p-6">
              <h2 className="text-xl font-audiowide mb-4">Transaction Details</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <div className="text-sm text-muted-text">Order ID</div>
                  <div className="font-mono text-sm">{debugInfo.orderId}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-text">Amount</div>
                  <div className="font-mono text-sm">₹{debugInfo.amount}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-text">PlainText Length</div>
                  <div className="font-mono text-sm">{debugInfo.plainTextLength} chars</div>
                </div>
              </div>
              <div className="mt-4">
                <div className="text-sm text-muted-text">PlainText Preview</div>
                <div className="font-mono text-xs bg-background border border-border rounded p-2 mt-1 break-all">
                  {debugInfo.plainTextPreview}
                </div>
              </div>
            </div>

            {/* Encryption Methods Comparison */}
            <div className="bg-background-soft border border-border rounded-lg p-6">
              <h2 className="text-xl font-audiowide mb-4">Encryption Methods Test</h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {Object.entries(debugInfo.encryptionResults).map(([key, method], index) => (
                  <div key={key} className="bg-background border border-border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-audiowide text-lg">Method {index + 1}</h3>
                        <p className="text-sm text-muted-text">{method.name}</p>
                      </div>
                      <button
                        onClick={() => testEncryption(index + 1)}
                        className="px-3 py-1 bg-green-500 hover:bg-green-600 text-white text-sm rounded transition-colors"
                      >
                        Test This Method
                      </button>
                    </div>
                    
                    <div className="space-y-2">
                      <div>
                        <div className="text-xs text-muted-text">Encrypted Length</div>
                        <div className="font-mono text-sm">{method.length} chars</div>
                      </div>
                      <div>
                        <div className="text-xs text-muted-text">Encrypted Preview</div>
                        <div className="font-mono text-xs bg-background-soft border border-border rounded p-2 break-all">
                          {method.preview}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* URL Configuration */}
            <div className="bg-background-soft border border-border rounded-lg p-6">
              <h2 className="text-xl font-audiowide mb-4">URL Configuration</h2>
              <div className="space-y-3">
                <div>
                  <div className="text-sm text-muted-text">Action URL</div>
                  <div className="font-mono text-sm break-all">{debugInfo.urls.actionUrl}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-text">Base URL</div>
                  <div className="font-mono text-sm">{debugInfo.urls.baseUrl}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-text">Access Code</div>
                  <div className="font-mono text-sm">{debugInfo.urls.accessCode}</div>
                </div>
              </div>
            </div>

            {/* Parameters */}
            <div className="bg-background-soft border border-border rounded-lg p-6">
              <h2 className="text-xl font-audiowide mb-4">Parameters</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(debugInfo.parameters).map(([key, value]) => (
                  <div key={key}>
                    <div className="text-sm text-muted-text capitalize">{key.replace(/([A-Z])/g, ' $1')}</div>
                    <div className="font-mono text-sm break-all">{value}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recommendations */}
            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-6">
              <h2 className="text-xl font-audiowide mb-4 text-yellow-400">Testing Instructions</h2>
              <div className="space-y-3 text-sm">
                <div><strong>1. Test Method 1:</strong> Click "Test This Method" for the first encryption method</div>
                <div><strong>2. Test Method 2:</strong> Click "Test This Method" for the second encryption method</div>
                <div><strong>3. Check Results:</strong> See which one works or gives a different error</div>
                <div><strong>4. Report Back:</strong> Let me know which method works or what new error you get</div>
              </div>
              
              <div className="mt-4 space-y-2">
                <div className="text-yellow-400 font-semibold">Expected Outcomes:</div>
                <div className="text-sm">✅ <strong>Success:</strong> Redirects to CCAvenue payment page</div>
                <div className="text-sm">❌ <strong>Same Error:</strong> "Something went wrong while processing your request"</div>
                <div className="text-sm">🔄 <strong>Different Error:</strong> New error message (progress!)</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
