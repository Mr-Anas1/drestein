'use client';

import { useEffect, useState } from 'react';
import { X, CheckCircle, AlertCircle, CreditCard } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { auth } from '@/lib/firebase';

export default function PassPurchaseModal({ onClose, onPurchased, showCloseButton = true, allowBackdropClose = true, upiQrImage }) {
  const { isAuthenticated, loginWithGoogleStudent, user, studentProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [transactionId, setTransactionId] = useState('');
  const [gatewayData, setGatewayData] = useState(null); // { actionUrl, encRequest, accessCode, merchantId }

  const uid = studentProfile?.uid || user?.uid;

  const submit = async () => {
    setLoading(true);
    setError('');
    try {
      if (!isAuthenticated || !uid) {
        setError('Please sign in with Google first.');
        setLoading(false);
        return;
      }
      const token = await auth.currentUser?.getIdToken?.();
      if (!token) throw new Error('Unable to retrieve auth token');

      // Initiate CCAvenue transaction (server will create a pending pass record)
      const res = await fetch('/api/payments/ccavenue/initiate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ userUid: uid })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Failed to initiate payment');
      setGatewayData({ actionUrl: data.actionUrl, encRequest: data.encRequest, accessCode: data.accessCode, merchantId: data.merchantId });
    } catch (e) {
      setError(e?.message || 'Failed to create pass');
    } finally {
      setLoading(false);
    }
  };

  // Auto-submit hidden form to CCAvenue when gatewayData present
  useEffect(() => {
    if (!gatewayData) return;
    const form = document.getElementById('ccavenuePaymentForm');
    if (form) form.submit();
  }, [gatewayData]);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={allowBackdropClose ? onClose : undefined}>
      <div className="bg-background border border-border rounded-xl p-6 max-w-md w-full" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-audiowide text-xl text-white flex items-center gap-2"><CreditCard size={18}/> Buy Event Pass</h3>
          {showCloseButton && (
            <button onClick={onClose} className="text-muted-text hover:text-white" aria-label="Close"><X size={20}/></button>
          )}
        </div>

        <div className="space-y-4">
          <div className="text-muted-text font-space text-sm">
            Purchase a single Event Pass to register for any number of events. Workshops do not require the pass.
          </div>

          {!isAuthenticated && (
            <div className="p-3 rounded-lg border border-border bg-background-soft">
              <div className="text-white font-audiowide text-sm mb-2">Sign in to continue</div>
              <button onClick={loginWithGoogleStudent} className="bg-primary text-white px-4 py-2 rounded-lg font-audiowide hover:bg-hover-primary">Continue with Google</button>
            </div>
          )}

          {error && (
            <div className="flex items-center gap-2 text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg p-3">
              <AlertCircle size={16} /> {error}
            </div>
          )}

          <button onClick={submit} disabled={loading || !isAuthenticated} className="w-full bg-gradient-to-r from-primary to-secondary text-white px-6 py-2 rounded-lg font-audiowide hover:from-hover-primary hover:to-primary disabled:opacity-50">
            {loading ? 'Redirecting...' : 'Pay ₹250 and Buy Pass'}
          </button>

          {/* Hidden form to CCAvenue gateway */}
          {gatewayData && (
            <form id="ccavenuePaymentForm" method="post" action={gatewayData.actionUrl} className="hidden">
              {/* Some CCAvenue setups expect merchant_id along with encRequest and access_code */}
              {gatewayData.merchantId && <input type="hidden" name="merchant_id" value={gatewayData.merchantId} />}
              <input type="hidden" name="encRequest" value={gatewayData.encRequest} />
              <input type="hidden" name="access_code" value={gatewayData.accessCode} />
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
