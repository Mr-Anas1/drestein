"use client";

import { useState, useEffect } from 'react';
import Header from '@/components/Header';

export default function CCAvenueDebugPage() {
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/debug/ccavenue-config');
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch config');
      }
      
      setConfig(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-white">
        <Header />
        <div className="max-w-4xl mx-auto px-4 py-10">
          <div className="text-center">Loading configuration...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-white">
      <Header />
      <div className="max-w-4xl mx-auto px-4 py-10">
        <h1 className="text-3xl font-audiowide mb-6">CCAvenue Configuration Debug</h1>
        
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
            <p className="text-red-400">Error: {error}</p>
          </div>
        )}

        {config && (
          <div className="space-y-6">
            {/* Environment Status */}
            <div className="bg-background-soft border border-border rounded-lg p-6">
              <h2 className="text-xl font-audiowide mb-4">Environment Status</h2>
              <div className={`inline-block px-4 py-2 rounded-lg font-mono text-sm ${
                config.environment.includes('LIVE') 
                  ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                  : 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
              }`}>
                {config.environment}
              </div>
            </div>

            {/* Credentials */}
            <div className="bg-background-soft border border-border rounded-lg p-6">
              <h2 className="text-xl font-audiowide mb-4">Credentials (Masked)</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(config.credentials).map(([key, value]) => (
                  <div key={key} className="bg-background border border-border rounded p-3">
                    <div className="text-sm text-muted-text capitalize">{key.replace(/([A-Z])/g, ' $1')}</div>
                    <div className="font-mono text-sm mt-1">{value}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Validation */}
            <div className="bg-background-soft border border-border rounded-lg p-6">
              <h2 className="text-xl font-audiowide mb-4">Validation</h2>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${
                    config.validation.allCredentialsSet ? 'bg-green-500' : 'bg-red-500'
                  }`}></div>
                  <span>All credentials set: {config.validation.allCredentialsSet ? 'Yes' : 'No'}</span>
                </div>
                
                {config.validation.missingCredentials.length > 0 && (
                  <div className="mt-3">
                    <div className="text-red-400 text-sm mb-2">Missing credentials:</div>
                    <ul className="list-disc list-inside space-y-1 text-sm text-muted-text">
                      {config.validation.missingCredentials.map((cred, index) => (
                        <li key={index} className="font-mono">{cred}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>

            {/* Recommendations */}
            {config.recommendations.length > 0 && (
              <div className="bg-background-soft border border-border rounded-lg p-6">
                <h2 className="text-xl font-audiowide mb-4">Recommendations</h2>
                <div className="space-y-2">
                  {config.recommendations.map((rec, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <div className="text-lg mt-0.5">
                        {rec.startsWith('✅') ? '✅' : rec.startsWith('⚠️') ? '⚠️' : '❌'}
                      </div>
                      <div className="text-sm">{rec.replace(/^[✅⚠️❌]\s*/, '')}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Action Items */}
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-6">
              <h2 className="text-xl font-audiowide mb-4 text-blue-400">Next Steps</h2>
              <div className="space-y-3 text-sm">
                <div>1. <strong>If you see "TEST" environment:</strong> Update your environment variables to use LIVE credentials</div>
                <div>2. <strong>If you see "LIVE" environment:</strong> The issue might be with the encryption key or request format</div>
                <div>3. <strong>Check Vercel environment variables:</strong> Ensure they match your CCAvenue dashboard exactly</div>
                <div>4. <strong>Verify credentials:</strong> Test them directly in CCAvenue's test tool if available</div>
              </div>
            </div>

            {/* Refresh Button */}
            <div className="text-center">
              <button
                onClick={fetchConfig}
                className="px-6 py-3 bg-primary hover:bg-hover-primary text-white font-audiowide rounded-lg transition-colors"
              >
                Refresh Configuration
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
