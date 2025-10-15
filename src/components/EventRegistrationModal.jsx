'use client';

import { useEffect, useState } from 'react';
import { X, User, Mail, AlertCircle, CheckCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { auth } from '@/lib/firebase';
import PassPurchaseModal from '@/components/PassPurchaseModal';

export default function EventRegistrationModal({ event, onClose, onRegistrationSuccess, showCloseButton = true, allowBackdropClose = true }) {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        transactionId: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const { isAuthenticated, studentProfile, loginWithGoogleStudent, user } = useAuth();
    const [checkingPass, setCheckingPass] = useState(false);
    const [hasVerifiedPass, setHasVerifiedPass] = useState(false);
    const [showPassModal, setShowPassModal] = useState(false);

    // Close on Escape key
    useEffect(() => {
        const onKeyDown = (e) => {
            if (e.key === 'Escape') {
                onClose();
            }
        };
        window.addEventListener('keydown', onKeyDown);
        return () => window.removeEventListener('keydown', onKeyDown);
    }, [onClose]);

    // Prefill from student profile when available
    useEffect(() => {
        if (isAuthenticated) {
            const name = studentProfile?.name || user?.displayName || '';
            const email = (studentProfile?.email || user?.email || '').toLowerCase();
            setFormData((prev) => ({ ...prev, name, email }));
        }
    }, [isAuthenticated, studentProfile, user]);

    // If event is not a Workshop, check if user has an approved Event Pass
    useEffect(() => {
        const run = async () => {
            const isWorkshop = String(event?.category || '').toLowerCase() === 'workshop';
            if (!isAuthenticated || !user?.uid || isWorkshop) {
                setHasVerifiedPass(false);
                return;
            }
            setCheckingPass(true);
            setError('');
            try {
                const res = await fetch(`/api/passes?userUid=${encodeURIComponent(user.uid)}`);
                if (!res.ok) throw new Error('Failed to check pass');
                const data = await res.json();
                const pass = data?.pass || null;
                setHasVerifiedPass(!!pass && pass.paymentVerified === true);
            } catch (e) {
                // Don't hard fail the modal, just show CTA
                setHasVerifiedPass(false);
            } finally {
                setCheckingPass(false);
            }
        };
        run();
    }, [isAuthenticated, user, event, showPassModal]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        // Require authentication for registration
        if (!isAuthenticated) {
            setLoading(false);
            setError('Please sign in with Google to register for events.');
            return;
        }

        // If not a Workshop, require verified pass before submitting
        const isWorkshop = String(event?.category || '').toLowerCase() === 'workshop';
        if (!isWorkshop && !hasVerifiedPass) {
            setLoading(false);
            setError('An active Event Pass is required to register for events.');
            return;
        }

        try {
            // Get Firebase ID token for server verification
            const token = await auth.currentUser?.getIdToken?.();
            if (!token) {
                throw new Error('Unable to retrieve auth token');
            }
            const response = await fetch('/api/registrations', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({
                    eventId: event.id,
                    name: formData.name.trim(),
                    email: formData.email.trim().toLowerCase(),
                    transactionId: formData.transactionId.trim(),
                    userUid: auth.currentUser?.uid,
                })
            });

            const data = await response.json();

            if (response.ok) {
                setSuccess(true);
                setTimeout(() => {
                    onRegistrationSuccess();
                    onClose();
                }, 2000);
            } else if (response.status === 401) {
                setError('Authentication required. Please sign in with Google to register.');
            } else {
                setError(data.error || 'Registration failed');
            }
        } catch (error) {
            console.error('Registration error:', error);
            setError('Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={allowBackdropClose ? onClose : undefined}>
                <div className="bg-background border border-border rounded-xl p-6 max-w-md w-full text-center relative" onClick={(e) => e.stopPropagation()}>
                    {showCloseButton && (
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 text-muted-text hover:text-white transition-colors"
                            aria-label="Close"
                        >
                            <X size={20} />
                        </button>
                    )}
                    <div className="flex justify-center mb-4">
                        <CheckCircle className="text-green-500" size={48} />
                    </div>
                    <h3 className="font-audiowide text-xl text-white mb-2">Registration Successful!</h3>
                    <p className="text-muted-text font-space mb-4">
                        You have successfully registered for "{event.title}".
                        We'll contact you with further details.
                    </p>
                    <div className="flex items-center justify-center gap-3">
                        <div className="animate-pulse text-primary font-space text-sm">Closing automatically...</div>
                        {showCloseButton && (
                            <button
                                onClick={onClose}
                                className="px-4 py-1 bg-background-soft border border-border text-white rounded-lg font-audiowide hover:bg-background transition-colors duration-300 text-xs"
                            >
                                Close now
                            </button>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={allowBackdropClose ? onClose : undefined}>
            <div className="bg-background border border-border rounded-xl p-6 max-w-md w-full max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
                {/* Header */}
                <div className="flex justify-between items-center mb-6 flex-shrink-0">
                    <h3 className="font-audiowide text-xl text-white">Register for Event</h3>
                    {showCloseButton && (
                        <button
                            onClick={onClose}
                            className="text-muted-text hover:text-white transition-colors"
                            aria-label="Close"
                        >
                            <X size={24} />
                        </button>
                    )}
                </div>

                {/* Scrollable Content */}
                <div className="overflow-y-auto pr-2 -mr-2 flex-grow custom-scrollbar">

                    <div className="mb-6">
                        <h4 className="font-audiowide text-primary text-lg mb-2">{event.title}</h4>
                        <div className="text-muted-text font-space text-sm space-y-1">
                            <p> {event.date} at {event.time}</p>
                            <p> {event.venue}</p>
                            <p> {event.department}</p>
                            {String(event?.category || '').toLowerCase() === 'workshop' ? (
                                event.isPaid && (
                                    <p className="text-primary font-medium">Paid Workshop - Payment Required</p>
                                )
                            ) : (
                                <p className="text-primary font-medium">Event Pass Required</p>
                            )}
                        </div>
                    </div>

                    {!isAuthenticated && (
                        <div className="mb-4 p-3 rounded-lg border border-border bg-background-soft">
                            <div className="text-sm text-white font-audiowide mb-2">Sign in to autofill your details</div>
                            <div className="flex gap-2">
                                <button
                                    type="button"
                                    onClick={loginWithGoogleStudent}
                                    className="bg-primary text-white px-4 py-2 rounded-lg font-audiowide hover:bg-hover-primary transition"
                                >
                                    Continue with Google
                                </button>
                            </div>
                        </div>
                    )}
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-audiowide text-muted-text mb-2">
                                <User size={16} className="inline mr-2" />
                                Full Name
                            </label>
                            <input
                                type="text"
                                required
                                value={formData.name}
                                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                className="w-full bg-background-soft border border-border rounded-lg px-3 py-2 text-white font-space focus:border-primary focus:outline-none disabled:opacity-70"
                                placeholder="Enter your full name"
                                disabled={isAuthenticated}
                            />
                            {isAuthenticated && (
                                <p className="text-xs text-muted-text mt-1">Prefilled from your profile</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-audiowide text-muted-text mb-2">
                                <Mail size={16} className="inline mr-2" />
                                Email Address
                            </label>
                            <input
                                type="email"
                                required
                                value={formData.email}
                                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                                className="w-full bg-background-soft border border-border rounded-lg px-3 py-2 text-white font-space focus:border-primary focus:outline-none disabled:opacity-70"
                                placeholder="Enter your email address"
                                disabled={isAuthenticated}
                            />
                            {isAuthenticated && (
                                <p className="text-xs text-muted-text mt-1">Prefilled from your profile</p>
                            )}
                        </div>

                        {/* Workshops are free - no payment required */}
                        {String(event?.category || '').toLowerCase() === 'workshop' && (
                            <div className="mt-4 p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                                <p className="text-sm text-green-400 font-space">
                                    <strong className="font-audiowide">Free Workshop:</strong> This workshop is free to attend. No event pass or payment required!
                                </p>
                            </div>
                        )}

                        {/* Event Pass CTA for non-Workshop */}
                        {String(event?.category || '').toLowerCase() !== 'workshop' && (
                            <div className="mt-4 p-4 bg-background-soft rounded-lg border border-border">
                                {!checkingPass && !hasVerifiedPass ? (
                                    <div className="space-y-3">
                                        <div className="text-sm text-yellow-300">Event Pass required to register. Purchase once and register any events.</div>
                                        <button type="button" onClick={() => setShowPassModal(true)} className="w-full bg-primary text-white px-4 py-2 rounded-lg font-audiowide hover:bg-hover-primary">Buy Event Pass</button>
                                    </div>
                                ) : (
                                    <div className="text-sm text-muted-text">{checkingPass ? 'Checking pass status...' : 'Active Pass detected ✓'}</div>
                                )}
                            </div>
                        )}


                        {error && (
                            <div className="flex items-center gap-2 text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                                <AlertCircle size={16} />
                                {error}
                            </div>
                        )}

                        <div className="flex gap-4 pt-4">
                            <button
                                type="submit"
                                disabled={loading || (String(event?.category || '').toLowerCase() !== 'workshop' && !hasVerifiedPass)}
                                className="flex-1 bg-gradient-to-r from-primary to-secondary text-white px-6 py-2 rounded-lg font-audiowide hover:from-hover-primary hover:to-primary transition-all duration-300 disabled:opacity-50"
                            >
                                {loading ? 'Registering...' : 'Register Now'}
                            </button>
                            {showCloseButton && (
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="px-6 py-2 bg-background-soft border border-border text-white rounded-lg font-audiowide hover:bg-background transition-colors duration-300"
                                >
                                    Cancel
                                </button>
                            )}
                        </div>
                    </form>

                </div>

                {/* Footer */}
                <div className="mt-4 text-xs text-muted-text text-center pt-4 border-t border-border/50 flex-shrink-0">
                    By registering, you agree to receive event-related communications.
                </div>
            </div>
            {showPassModal && (
                <PassPurchaseModal
                    onClose={() => setShowPassModal(false)}
                    onPurchased={() => setShowPassModal(false)}
                    showCloseButton={true}
                    allowBackdropClose={true}
                    upiQrImage={undefined}
                />
            )}
        </div>
    );
}
