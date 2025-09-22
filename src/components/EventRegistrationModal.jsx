'use client';

import { useEffect, useState } from 'react';
import { X, User, Mail, AlertCircle, CheckCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

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

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await fetch('/api/registrations', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    eventId: event.id,
                    name: formData.name.trim(),
                    email: formData.email.trim().toLowerCase(),
                    transactionId: formData.transactionId.trim()
                })
            });

            const data = await response.json();

            if (response.ok) {
                setSuccess(true);
                setTimeout(() => {
                    onRegistrationSuccess();
                    onClose();
                }, 2000);
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
                            <p>📅 {event.date} at {event.time}</p>
                            <p>📍 {event.venue}</p>
                            <p>🏢 {event.department}</p>
                            {event.isPaid && (
                                <p className="text-primary font-medium">
                                    💰 Paid Event - Payment Required
                                </p>
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
                    +
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

                        {event.isPaid && (
                            <>
                                <div className="mt-4 p-4 bg-background-soft rounded-lg border border-border">
                                    <h5 className="font-audiowide text-white text-sm mb-3">Payment Information</h5>
                                    <p className="text-sm text-muted-text mb-3">
                                        This is a paid event. Please complete the payment to register.
                                    </p>
                                    {event.upiQrCode && (
                                        <div className="flex flex-col items-center mb-4">
                                            <div className="mb-3 p-2 bg-white rounded">
                                                <img
                                                    src={event.upiQrCode}
                                                    alt="UPI QR Code"
                                                    className="w-40 h-40 object-contain"
                                                />
                                            </div>
                                            <p className="text-xs text-muted-text text-center mb-3">
                                                Scan the QR code to make payment
                                            </p>
                                        </div>
                                    )}
                                    <div>
                                        <label className="block text-sm font-audiowide text-muted-text mb-2">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="inline mr-2">
                                                <rect x="2" y="6" width="20" height="12" rx="2" ry="2"></rect>
                                                <line x1="12" y1="12" x2="12" y2="12.01"></line>
                                            </svg>
                                            UPI Transaction ID
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            value={formData.transactionId}
                                            onChange={(e) => setFormData(prev => ({ ...prev, transactionId: e.target.value }))}
                                            className="w-full bg-background-soft border border-border rounded-lg px-3 py-2 text-white font-space focus:border-primary focus:outline-none"
                                            placeholder="Enter your UPI transaction reference ID"
                                        />
                                        <p className="text-xs text-muted-text mt-1">
                                            Please enter the UPI transaction reference ID after payment
                                        </p>
                                    </div>
                                </div>
                            </>
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
                                disabled={loading}
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
        </div>
    );
}
