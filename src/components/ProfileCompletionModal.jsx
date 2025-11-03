'use client';

import { useState } from 'react';
import { X, User, Mail, Building2, Hash, Phone as PhoneIcon, Loader2 } from 'lucide-react';
import { auth } from '@/lib/firebase';

export default function ProfileCompletionModal({ onComplete }) {
    const [formData, setFormData] = useState({
        name: '',
        isStudent: 'yes',
        rollNo: '',
        college: '',
        phone: '',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        // Validation
        if (!formData.name.trim()) {
            setError('Name is required');
            return;
        }

        if (formData.isStudent === 'yes') {
            if (!formData.rollNo.trim()) {
                setError('Roll number is required for students');
                return;
            }
            if (!formData.college.trim()) {
                setError('College name is required for students');
                return;
            }
        }

        if (!formData.phone.trim()) {
            setError('Phone number is required');
            return;
        }

        try {
            setLoading(true);
            const user = auth.currentUser;
            if (!user) {
                setError('Not authenticated');
                return;
            }

            const idToken = await user.getIdToken();

            const response = await fetch('/api/students/complete-profile', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${idToken}`,
                },
                body: JSON.stringify({
                    name: formData.name.trim(),
                    isStudent: formData.isStudent === 'yes',
                    rollNo: formData.isStudent === 'yes' ? formData.rollNo.trim() : null,
                    college: formData.isStudent === 'yes' ? formData.college.trim() : null,
                    phone: formData.phone.trim(),
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to update profile');
            }

            // Call the onComplete callback
            onComplete();
        } catch (err) {
            console.error('Error completing profile:', err);
            setError(err.message || 'Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
            <div className="bg-background border-2 border-primary rounded-2xl p-8 max-w-md w-full shadow-2xl">
                <div className="text-center mb-6">
                    <div className="bg-gradient-to-r from-primary to-secondary w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                        <User size={32} className="text-white" />
                    </div>
                    <h2 className="font-audiowide text-2xl text-white mb-2">
                        Complete Your Profile
                    </h2>
                    <p className="text-muted-text font-space text-sm">
                        We need a few details to get you started
                    </p>
                </div>

                {error && (
                    <div className="bg-red-500/10 border border-red-500 text-red-500 px-4 py-3 rounded-lg mb-4 font-space text-sm">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Name */}
                    <div>
                        <label className="block text-white font-audiowide text-sm mb-2">
                            Full Name *
                        </label>
                        <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-text" size={20} />
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="Enter your full name"
                                className="w-full bg-background-soft border border-border rounded-lg pl-10 pr-4 py-3 text-white font-space focus:outline-none focus:border-primary transition-colors"
                                disabled={loading}
                            />
                        </div>
                    </div>

                    {/* Are you a student? */}
                    <div>
                        <label className="block text-white font-audiowide text-sm mb-2">
                            Are you a student? *
                        </label>
                        <div className="flex gap-4">
                            <label className="flex-1 cursor-pointer">
                                <input
                                    type="radio"
                                    name="isStudent"
                                    value="yes"
                                    checked={formData.isStudent === 'yes'}
                                    onChange={(e) => setFormData({ ...formData, isStudent: e.target.value })}
                                    className="sr-only"
                                    disabled={loading}
                                />
                                <div className={`border-2 rounded-lg p-3 text-center font-audiowide transition-all ${
                                    formData.isStudent === 'yes'
                                        ? 'border-primary bg-primary/10 text-primary'
                                        : 'border-border text-muted-text hover:border-primary/50'
                                }`}>
                                    Yes
                                </div>
                            </label>
                            <label className="flex-1 cursor-pointer">
                                <input
                                    type="radio"
                                    name="isStudent"
                                    value="no"
                                    checked={formData.isStudent === 'no'}
                                    onChange={(e) => setFormData({ ...formData, isStudent: e.target.value })}
                                    className="sr-only"
                                    disabled={loading}
                                />
                                <div className={`border-2 rounded-lg p-3 text-center font-audiowide transition-all ${
                                    formData.isStudent === 'no'
                                        ? 'border-primary bg-primary/10 text-primary'
                                        : 'border-border text-muted-text hover:border-primary/50'
                                }`}>
                                    No
                                </div>
                            </label>
                        </div>
                    </div>

                    {/* Student Fields */}
                    {formData.isStudent === 'yes' && (
                        <>
                            {/* Roll Number */}
                            <div>
                                <label className="block text-white font-audiowide text-sm mb-2">
                                    Roll Number *
                                </label>
                                <div className="relative">
                                    <Hash className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-text" size={20} />
                                    <input
                                        type="text"
                                        value={formData.rollNo}
                                        onChange={(e) => setFormData({ ...formData, rollNo: e.target.value })}
                                        placeholder="Enter your roll number"
                                        className="w-full bg-background-soft border border-border rounded-lg pl-10 pr-4 py-3 text-white font-space focus:outline-none focus:border-primary transition-colors"
                                        disabled={loading}
                                    />
                                </div>
                            </div>

                            {/* College */}
                            <div>
                                <label className="block text-white font-audiowide text-sm mb-2">
                                    College Name *
                                </label>
                                <div className="relative">
                                    <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-text" size={20} />
                                    <input
                                        type="text"
                                        value={formData.college}
                                        onChange={(e) => setFormData({ ...formData, college: e.target.value })}
                                        placeholder="Enter your college name"
                                        className="w-full bg-background-soft border border-border rounded-lg pl-10 pr-4 py-3 text-white font-space focus:outline-none focus:border-primary transition-colors"
                                        disabled={loading}
                                    />
                                </div>
                            </div>
                        </>
                    )}

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-gradient-to-r from-primary to-secondary text-white py-3 rounded-lg font-audiowide hover:from-hover-primary hover:to-primary transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="animate-spin" size={20} />
                                Saving...
                            </>
                        ) : (
                            'Continue'
                        )}
                    </button>
                </form>

                <p className="text-muted-text font-space text-xs text-center mt-4">
                    * Required fields
                </p>
            </div>
        </div>
    );
}
