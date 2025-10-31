'use client';

import React, { useState } from 'react';
import { X, Search, Loader, AlertCircle, CheckCircle, Clock, XCircle, Trash2, RefreshCw } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { getAuth } from 'firebase/auth';

const ViewUserDetailsModal = ({ onClose }) => {
  const { user } = useAuth();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [userDetails, setUserDetails] = useState(null);
  const [searched, setSearched] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchUserDetails = async (emailToSearch) => {
    setLoading(true);
    setError('');

    try {
      // Get the ID token from the current Firebase user
      const auth = getAuth();
      const currentUser = auth.currentUser;
      if (!currentUser) {
        throw new Error('You must be logged in to use this feature');
      }

      const token = await currentUser.getIdToken();
      const response = await fetch(
        `/api/admin/user-details?email=${encodeURIComponent(emailToSearch)}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to fetch user details');
      }

      const data = await response.json();
      setUserDetails(data);
      setSearched(true);
    } catch (err) {
      setError(err.message);
      setSearched(true);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!email.trim()) {
      setError('Please enter an email address');
      return;
    }

    setUserDetails(null);
    setSearched(false);
    await fetchUserDetails(email);
  };

  const handleRefresh = async () => {
    if (email.trim()) {
      await fetchUserDetails(email);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      active: { bg: 'bg-green-900', text: 'text-green-200', icon: CheckCircle, label: 'Active' },
      pending_payment: { bg: 'bg-yellow-900', text: 'text-yellow-200', icon: Clock, label: 'Pending Payment' },
      rejected: { bg: 'bg-red-900', text: 'text-red-200', icon: XCircle, label: 'Rejected' },
      approved: { bg: 'bg-green-900', text: 'text-green-200', icon: CheckCircle, label: 'Approved' },
    };

    const config = statusConfig[status] || statusConfig.pending_payment;
    const Icon = config.icon;

    return (
      <div className={`${config.bg} ${config.text} px-3 py-1 rounded-full text-sm font-space flex items-center gap-1 w-fit`}>
        <Icon size={14} />
        {config.label}
      </div>
    );
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    if (typeof date === 'object' && date.toDate) {
      return date.toDate().toLocaleDateString();
    }
    return new Date(date).toLocaleDateString();
  };

  const formatAmount = (amount) => {
    return `₹${(amount || 0).toFixed(2)}`;
  };

  const handleDeleteRegistration = async (registrationId) => {
    setDeleting(true);
    try {
      const auth = getAuth();
      const token = await auth.currentUser?.getIdToken?.();

      const response = await fetch(`/api/registrations?id=${registrationId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        // Refresh user details after deletion
        setUserDetails(prev => ({
          ...prev,
          registrations: prev.registrations.filter(r => r.id !== registrationId),
          specialEventRegistrations: prev.specialEventRegistrations.filter(r => r.id !== registrationId),
          summary: {
            ...prev.summary,
            totalRegistrations: prev.summary.totalRegistrations - 1,
          }
        }));
        setDeleteConfirm(null);
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to delete registration');
      }
    } catch (err) {
      console.error('Error deleting registration:', err);
      setError('Failed to delete registration');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-background-soft border border-border rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-background-soft border-b border-border p-6 flex justify-between items-center">
          <h2 className="text-2xl font-audiowide text-white">View User Details</h2>
          <button
            onClick={onClose}
            className="text-muted-text hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Search Form */}
          <form onSubmit={handleSearch} className="space-y-4">
            <div>
              <label className="block text-white font-audiowide text-sm mb-2">
                Enter User Email
              </label>
              <div className="flex gap-2">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="user@example.com"
                  className="flex-1 bg-background border border-border text-white px-4 py-2 rounded-lg font-space focus:outline-none focus:border-primary"
                  disabled={loading}
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-gradient-to-r from-primary to-secondary text-white px-6 py-2 rounded-lg font-audiowide hover:from-hover-primary hover:to-primary transition-all duration-300 flex items-center gap-2 disabled:opacity-50"
                >
                  {loading ? <Loader size={18} className="animate-spin" /> : <Search size={18} />}
                  Search
                </button>
                {searched && userDetails && (
                  <button
                    type="button"
                    onClick={handleRefresh}
                    disabled={loading}
                    className="bg-background border border-border text-white px-4 py-2 rounded-lg font-audiowide hover:bg-background-soft transition-all duration-300 flex items-center gap-2 disabled:opacity-50"
                    title="Refresh data"
                  >
                    {loading ? <Loader size={18} className="animate-spin" /> : <RefreshCw size={18} />}
                  </button>
                )}
              </div>
            </div>

            {error && (
              <div className="bg-red-900 bg-opacity-30 border border-red-700 text-red-200 px-4 py-3 rounded-lg flex items-center gap-2 font-space">
                <AlertCircle size={18} />
                {error}
              </div>
            )}
          </form>

          {/* Results */}
          {searched && userDetails && (
            <div className="space-y-6">
              {/* User Info */}
              <div className="bg-background border border-border rounded-lg p-4">
                <h3 className="text-lg font-audiowide text-white mb-4">User Information</h3>
                <div className="grid grid-cols-2 gap-4 font-space text-sm">
                  <div>
                    <p className="text-muted-text">Name</p>
                    <p className="text-white">{userDetails.user.name || userDetails.user.displayName || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-muted-text">Email</p>
                    <p className="text-white">{userDetails.user.email}</p>
                  </div>
                  <div>
                    <p className="text-muted-text">User ID (UID)</p>
                    <p className="text-white text-xs break-all">{userDetails.user.uid}</p>
                  </div>
                  <div>
                    <p className="text-muted-text">Roll Number</p>
                    <p className="text-white">{userDetails.user.rollNo || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-muted-text">College</p>
                    <p className="text-white">{userDetails.user.college || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-muted-text">Is Student</p>
                    <p className="text-white">{userDetails.user.isStudent ? 'Yes' : 'No'}</p>
                  </div>
                  <div>
                    <p className="text-muted-text">Has Event Pass</p>
                    <p className="text-white">{userDetails.user.hasEventPass ? 'Yes' : 'No'}</p>
                  </div>
                  <div>
                    <p className="text-muted-text">Profile Completed</p>
                    <p className="text-white">{userDetails.user.profileCompleted ? 'Yes' : 'No'}</p>
                  </div>
                  {userDetails.user.role && (
                    <div>
                      <p className="text-muted-text">Role</p>
                      <p className="text-white capitalize">{userDetails.user.role}</p>
                    </div>
                  )}
                  {userDetails.user.department && (
                    <div>
                      <p className="text-muted-text">Department</p>
                      <p className="text-white">{userDetails.user.department}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Summary Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-background border border-border rounded-lg p-4">
                  <p className="text-muted-text font-space text-sm">Total Registrations</p>
                  <p className="text-2xl font-audiowide text-primary">{userDetails.summary.totalRegistrations}</p>
                </div>
                <div className="bg-background border border-border rounded-lg p-4">
                  <p className="text-muted-text font-space text-sm">Special Events</p>
                  <p className="text-2xl font-audiowide text-secondary">{userDetails.summary.totalSpecialEventRegistrations}</p>
                </div>
                <div className="bg-background border border-border rounded-lg p-4">
                  <p className="text-muted-text font-space text-sm">Passes</p>
                  <p className="text-2xl font-audiowide text-primary">{userDetails.summary.totalPasses}</p>
                </div>
                <div className="bg-background border border-border rounded-lg p-4">
                  <p className="text-muted-text font-space text-sm">Total Amount</p>
                  <p className="text-2xl font-audiowide text-secondary">{formatAmount(userDetails.summary.totalAmount)}</p>
                </div>
              </div>

              {/* Event Registrations */}
              {userDetails.registrations.length > 0 && (
                <div className="bg-background border border-border rounded-lg p-4">
                  <h3 className="text-lg font-audiowide text-white mb-4">Event Registrations ({userDetails.registrations.length})</h3>
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {userDetails.registrations.map((reg) => (
                      <div key={reg.id} className="bg-background-soft border border-border rounded p-3">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex-1">
                            <p className="font-audiowide text-white">{reg.eventDetails?.title || 'Unknown Event'}</p>
                            <p className="text-muted-text font-space text-sm">{reg.eventDetails?.venue || 'N/A'}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            {getStatusBadge(reg.status)}
                            <button
                              onClick={() => setDeleteConfirm({ id: reg.id, title: reg.eventDetails?.title || 'Event' })}
                              className="text-red-500 hover:text-red-400 transition-colors p-1"
                              title="Delete"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2 font-space text-sm text-muted-text">
                          <p>Pass ID: <span className="text-white">{reg.id}</span></p>
                          <p>Amount: <span className="text-white">{formatAmount(reg.amount)}</span></p>
                          <p>Registered: <span className="text-white">{formatDate(reg.registeredAt)}</span></p>
                          <p>Payment: <span className="text-white capitalize">{reg.paymentStatus}</span></p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Special Event Registrations */}
              {userDetails.specialEventRegistrations.length > 0 && (
                <div className="bg-background border border-border rounded-lg p-4">
                  <h3 className="text-lg font-audiowide text-white mb-4">Special Event Registrations ({userDetails.specialEventRegistrations.length})</h3>
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {userDetails.specialEventRegistrations.map((reg) => (
                      <div key={reg.id} className="bg-background-soft border border-border rounded p-3">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex-1">
                            <p className="font-audiowide text-white">{reg.specialEventDetails?.title || 'Unknown Event'}</p>
                            <p className="text-muted-text font-space text-sm">{reg.specialEventDetails?.location || 'N/A'}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            {getStatusBadge(reg.status)}
                            <button
                              onClick={() => setDeleteConfirm({ id: reg.id, title: reg.specialEventDetails?.title || 'Event' })}
                              className="text-red-500 hover:text-red-400 transition-colors p-1"
                              title="Delete"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2 font-space text-sm text-muted-text">
                          <p>Pass ID: <span className="text-white">{reg.id}</span></p>
                          <p>Amount: <span className="text-white">{formatAmount(reg.amount)}</span></p>
                          <p>Registered: <span className="text-white">{formatDate(reg.registeredAt)}</span></p>
                          <p>Payment: <span className="text-white capitalize">{reg.paymentStatus}</span></p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Passes */}
              {userDetails.passes.length > 0 && (
                <div className="bg-background border border-border rounded-lg p-4">
                  <h3 className="text-lg font-audiowide text-white mb-4">Passes ({userDetails.passes.length})</h3>
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {userDetails.passes.map((pass) => (
                      <div key={pass.id} className="bg-background-soft border border-border rounded p-3">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <p className="font-audiowide text-white">{pass.passName}</p>
                            <p className="text-muted-text font-space text-sm">{pass.passType}</p>
                          </div>
                          {getStatusBadge(pass.status)}
                        </div>
                        <div className="grid grid-cols-2 gap-2 font-space text-sm text-muted-text">
                          <p>Pass ID: <span className="text-white">{pass.id}</span></p>
                          <p>Price: <span className="text-white">{formatAmount(pass.passPrice)}</span></p>
                          <p>Purchased: <span className="text-white">{formatDate(pass.purchasedAt)}</span></p>
                          <p>Payment: <span className="text-white capitalize">{pass.paymentStatus}</span></p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* No Data Message */}
              {userDetails.registrations.length === 0 &&
                userDetails.specialEventRegistrations.length === 0 &&
                userDetails.passes.length === 0 && (
                  <div className="bg-background border border-border rounded-lg p-6 text-center">
                    <p className="text-muted-text font-space">No registrations or passes found for this user.</p>
                  </div>
                )}
            </div>
          )}

          {/* Empty State */}
          {searched && !userDetails && !error && (
            <div className="text-center py-8">
              <p className="text-muted-text font-space">No results found</p>
            </div>
          )}

          {!searched && (
            <div className="text-center py-8">
              <p className="text-muted-text font-space">Enter an email address and click search to view user details</p>
            </div>
          )}
        </div>

        {/* Delete Confirmation Modal */}
        {deleteConfirm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4" onClick={() => setDeleteConfirm(null)}>
            <div className="bg-background border border-border rounded-xl p-6 max-w-md w-full" onClick={(e) => e.stopPropagation()}>
              <h3 className="font-audiowide text-xl text-white mb-4">Confirm Delete</h3>
              <p className="text-muted-text font-space mb-6">
                Are you sure you want to delete the registration for "{deleteConfirm.title}"? This action cannot be undone.
              </p>
              <div className="flex gap-4">
                <button
                  onClick={() => handleDeleteRegistration(deleteConfirm.id)}
                  disabled={deleting}
                  className="flex-1 bg-red-500 text-white px-4 py-2 rounded-lg font-audiowide hover:bg-red-600 transition-colors disabled:opacity-50"
                >
                  {deleting ? 'Deleting...' : 'Delete'}
                </button>
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="flex-1 bg-background-soft border border-border text-white px-4 py-2 rounded-lg font-audiowide hover:bg-background transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ViewUserDetailsModal;
