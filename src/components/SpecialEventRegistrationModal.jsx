"use client";
import React, { useState } from 'react';
import { X, CheckCircle, AlertCircle, Users } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { auth } from '@/lib/firebase';

const SpecialEventRegistrationModal = ({ event, onClose, onSuccess }) => {
  const { user, isAuthenticated, loginWithGoogleStudent } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [teamMembers, setTeamMembers] = useState(['']);

  const isTeamEvent = event.type === 'team';
  const maxTeamSize = event.maxTeamSize || 4;

  const addTeamMember = () => {
    if (teamMembers.length < maxTeamSize - 1) {
      setTeamMembers([...teamMembers, '']);
    }
  };

  const removeTeamMember = (index) => {
    setTeamMembers(teamMembers.filter((_, i) => i !== index));
  };

  const updateTeamMember = (index, value) => {
    const updated = [...teamMembers];
    updated[index] = value;
    setTeamMembers(updated);
  };

  const handleRegister = async () => {
    if (!isAuthenticated || !user) {
      setError('Please sign in to register');
      return;
    }

    if (isTeamEvent && teamMembers.some(member => !member.trim())) {
      setError('Please fill in all team member names');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const token = await auth.currentUser?.getIdToken?.();
      if (!token) throw new Error('Unable to retrieve auth token');

      // Add to cart (this will be used for custom pass creation)
      const response = await fetch('/api/special-events/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          eventId: event.id,
          eventTitle: event.title,
          eventPrice: event.price,
          userUid: user.uid,
          teamMembers: isTeamEvent ? [user.displayName || user.email, ...teamMembers.filter(m => m.trim())] : null,
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Registration failed');
      }

      setSuccess(true);
      setTimeout(() => {
        onSuccess?.();
      }, 2000);
    } catch (err) {
      console.error('Registration error:', err);
      setError(err.message || 'Failed to register');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-background border border-border rounded-xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-audiowide text-xl text-white">Register for Event</h3>
          <button onClick={onClose} className="text-muted-text hover:text-white">
            <X size={24} />
          </button>
        </div>

        {success ? (
          <div className="text-center py-8">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h4 className="font-audiowide text-xl text-white mb-2">Added to Cart!</h4>
            <p className="text-muted-text font-space">
              This event has been added to your custom pass cart. Proceed to checkout to complete payment.
            </p>
          </div>
        ) : (
          <>
            {/* Event Summary */}
            <div className="bg-background-soft border border-border rounded-lg p-4 mb-6">
              <h4 className="font-audiowide text-white mb-2">{event.title}</h4>
              <p className="text-muted-text font-space text-sm mb-3">{event.description}</p>
              <div className="flex items-center justify-between">
                <span className="text-muted-text font-space text-sm">Registration Fee:</span>
                <span className="text-2xl font-audiowide text-primary">₹{event.price}</span>
              </div>
            </div>

            {!isAuthenticated ? (
              <div className="p-4 rounded-lg border border-border bg-background-soft">
                <div className="text-white font-audiowide text-sm mb-3">Sign in to register</div>
                <button
                  onClick={loginWithGoogleStudent}
                  className="w-full bg-primary text-white px-4 py-2 rounded-lg font-audiowide hover:bg-hover-primary transition-colors"
                >
                  Continue with Google
                </button>
              </div>
            ) : (
              <>
                {/* Team Members Input (if team event) */}
                {isTeamEvent && (
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-3">
                      <label className="text-white font-audiowide text-sm flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        Team Members (Max {maxTeamSize})
                      </label>
                      {teamMembers.length < maxTeamSize - 1 && (
                        <button
                          onClick={addTeamMember}
                          className="text-primary hover:text-hover-primary text-sm font-space"
                        >
                          + Add Member
                        </button>
                      )}
                    </div>

                    <div className="space-y-2">
                      <div className="bg-background-soft border border-border rounded-lg p-3">
                        <p className="text-white font-space text-sm">You (Team Leader)</p>
                        <p className="text-muted-text text-xs">{user.displayName || user.email}</p>
                      </div>

                      {teamMembers.map((member, index) => (
                        <div key={index} className="flex gap-2">
                          <input
                            type="text"
                            value={member}
                            onChange={(e) => updateTeamMember(index, e.target.value)}
                            placeholder={`Team Member ${index + 2} Name`}
                            className="flex-1 bg-background-soft border border-border text-white px-4 py-2 rounded-lg font-space focus:outline-none focus:border-primary"
                          />
                          <button
                            onClick={() => removeTeamMember(index)}
                            className="text-red-500 hover:text-red-400 px-3"
                          >
                            <X size={20} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {error && (
                  <div className="flex items-center gap-2 text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg p-3 mb-4">
                    <AlertCircle size={16} />
                    {error}
                  </div>
                )}

                <div className="space-y-3">
                  <button
                    onClick={handleRegister}
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-primary to-secondary text-white px-6 py-3 rounded-lg font-audiowide hover:from-hover-primary hover:to-primary disabled:opacity-50 transition-all"
                  >
                    {loading ? 'Processing...' : 'Add to Cart'}
                  </button>

                  <p className="text-muted-text font-space text-xs text-center">
                    This event will be added to your custom pass cart. You can add multiple events and pay once.
                  </p>
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default SpecialEventRegistrationModal;
