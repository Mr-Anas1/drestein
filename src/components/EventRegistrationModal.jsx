'use client';

import { useEffect, useState } from 'react';
import { X, User, Mail, AlertCircle, CheckCircle } from 'lucide-react';

export default function EventRegistrationModal({ event, onClose, onRegistrationSuccess, showCloseButton = true, allowBackdropClose = true }) {
    const [formData, setFormData] = useState({
        name: '',
        email: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

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
                    email: formData.email.trim().toLowerCase()
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
            <div className="bg-background border border-border rounded-xl p-6 max-w-md w-full" onClick={(e) => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-6">
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

                <div className="mb-6">
                    <h4 className="font-audiowide text-primary text-lg mb-2">{event.title}</h4>
                    <div className="text-muted-text font-space text-sm space-y-1">
                        <p>📅 {event.date} at {event.time}</p>
                        <p>📍 {event.venue}</p>
                        <p>🏢 {event.department}</p>
                    </div>
                </div>

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
                            className="w-full bg-background-soft border border-border rounded-lg px-3 py-2 text-white font-space focus:border-primary focus:outline-none"
                            placeholder="Enter your full name"
                        />
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
                            className="w-full bg-background-soft border border-border rounded-lg px-3 py-2 text-white font-space focus:border-primary focus:outline-none"
                            placeholder="Enter your email address"
                        />
                    </div>

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

                <div className="mt-4 text-xs text-muted-text text-center">
                    By registering, you agree to receive event-related communications.
                </div>
            </div>
        </div>
    );
}
