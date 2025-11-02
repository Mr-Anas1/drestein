"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import { useAuth } from '@/contexts/AuthContext';
import { Ticket, Users, DollarSign, CheckCircle, XCircle, Clock, Eye, Filter, ArrowLeft, Plus, Trash2, X, Download } from 'lucide-react';
import { CUSTOM_PASS_EVENTS } from '@/constants/customPassEvents';
import { getAuth } from '@/lib/firebase';
import { exportPassesToCSV } from '@/lib/csvExport';

const AdminPassesPage = () => {
  const { user, userRole, loading: authLoading, isSuperAdmin, isDepartmentAdmin } = useAuth();
  const router = useRouter();
  const [passes, setPasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, general, custom, pending, verified
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPass, setSelectedPass] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Authentication check
  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push('/admin/login');
      } else if (userRole && userRole.role === 'student') {
        router.push('/');
      } else if (userRole && !isSuperAdmin && !isDepartmentAdmin) {
        router.push('/');
      }
    }
  }, [user, authLoading, userRole, isSuperAdmin, isDepartmentAdmin, router]);

  // Fetch passes
  useEffect(() => {
    if (user && (isSuperAdmin || isDepartmentAdmin)) {
      fetchPasses();
    }
  }, [user, isSuperAdmin, isDepartmentAdmin]);

  const fetchPasses = async () => {
    try {
      setLoading(true);
      const { auth } = await import('@/lib/firebase');
      const token = await auth.currentUser?.getIdToken?.();
      const response = await fetch('/api/admin/passes', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (response.ok) {
        setPasses(data.passes || []);
      }
    } catch (error) {
      console.error('Error fetching passes:', error);
    } finally {
      setLoading(false);
    }
  };

  // Apply filters based on selection
  const filteredPasses = passes
    .filter(pass => {
      if (filter === 'verified') return !!pass.paymentVerified;
      if (filter === 'pending') return !pass.paymentVerified;
      if (filter === 'general') return pass.passType === 'general';
      if (filter === 'custom') return pass.passType === 'custom';
      return true; // 'all'
    })
    .filter(pass => {
      const q = searchQuery.trim().toLowerCase();
      if (!q) return true;
      const email = String(pass.userEmail || '').toLowerCase();
      const uid = String(pass.userUid || '').toLowerCase();
      const passName = String(pass.passName || pass.passType || '').toLowerCase();
      const orderId = String(pass.orderId || '').toLowerCase();
      const passId = String(pass.id || '').toLowerCase();
      const userName = String(pass.userName || '').toLowerCase();
      return (
        email.includes(q) ||
        uid.includes(q) ||
        passName.includes(q) ||
        orderId.includes(q) ||
        passId.includes(q) ||
        userName.includes(q)
      );
    });

  const stats = {
    total: passes.length,
    verified: passes.filter(p => p.paymentVerified).length,
    pending: passes.filter(p => !p.paymentVerified).length,
    revenue: passes.filter(p => p.paymentVerified).reduce((sum, p) => sum + (p.passPrice || 0), 0),
  };

  const viewPassDetails = (pass) => {
    setSelectedPass(pass);
    setShowDetailsModal(true);
  };

  const deletePass = async (passId) => {
    setDeleting(true);
    try {
      const { auth } = await import('@/lib/firebase');
      const token = await auth.currentUser?.getIdToken?.();

      const response = await fetch(`/api/admin/passes?id=${passId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        setPasses(passes.filter(p => p.id !== passId));
        setDeleteConfirm(null);
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to delete pass');
      }
    } catch (err) {
      console.error('Error deleting pass:', err);
      alert('Failed to delete pass');
    } finally {
      setDeleting(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-white font-audiowide">Loading...</div>
      </div>
    );
  }

  if (!user || !userRole || (!isSuperAdmin && !isDepartmentAdmin)) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background-soft to-background">
      <Header />

      <div className="py-20 px-6 md:px-12 max-w-7xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => router.push('/admin')}
          className="mb-6 flex items-center gap-2 text-muted-text hover:text-white transition-colors duration-300 font-space"
        >
          <ArrowLeft size={20} />
          Back to Admin Dashboard
        </button>

        {/* Header */}
        <div className="mb-8 flex justify-between items-start">
          <div>
            <h1 className="font-audiowide text-4xl md:text-6xl bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-4">
              Pass Management
            </h1>
            <p className="text-muted-text font-space text-lg">
              View and manage all event passes
            </p>
          </div>
          <div className="flex items-center gap-4 mt-4 md:mt-0 flex-wrap">
            {isSuperAdmin && (
              <button
                onClick={() => setShowAddModal(true)}
                className="bg-gradient-to-r from-primary to-secondary text-white px-6 py-3 rounded-lg font-audiowide hover:from-hover-primary hover:to-primary transition-all duration-300 flex items-center gap-2"
              >
                <Plus size={20} />
                Add Pass
              </button>
            )}

            <button
              onClick={() => exportPassesToCSV(filteredPasses)}
              className="bg-background-soft border border-border text-white px-4 py-3 rounded-lg font-audiowide hover:bg-background transition-colors duration-300 flex items-center gap-2"
            >
              <Download size={20} />
              Export CSV
            </button>
          </div>
        </div>

        {/* Stats Cards - hidden for department admins */}
        {!isDepartmentAdmin && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-background-soft border border-border rounded-xl p-6">
              <div className="flex items-center justify-between mb-2">
                <Ticket className="w-8 h-8 text-primary" />
                <span className="text-3xl font-audiowide text-white">{stats.total}</span>
              </div>
              <p className="text-muted-text font-space text-sm">Total Passes</p>
            </div>

            <div className="bg-background-soft border border-border rounded-xl p-6">
              <div className="flex items-center justify-between mb-2">
                <CheckCircle className="w-8 h-8 text-green-500" />
                <span className="text-3xl font-audiowide text-white">{stats.verified}</span>
              </div>
              <p className="text-muted-text font-space text-sm">Verified</p>
            </div>

            <div className="bg-background-soft border border-border rounded-xl p-6">
              <div className="flex items-center justify-between mb-2">
                <Clock className="w-8 h-8 text-yellow-500" />
                <span className="text-3xl font-audiowide text-white">{stats.pending}</span>
              </div>
              <p className="text-muted-text font-space text-sm">Pending</p>
            </div>

            <div className="bg-background-soft border border-border rounded-xl p-6">
              <div className="flex items-center justify-between mb-2">
                <DollarSign className="w-8 h-8 text-secondary" />
                <span className="text-3xl font-audiowide text-white">₹{stats.revenue}</span>
              </div>
              <p className="text-muted-text font-space text-sm">Total Revenue</p>
            </div>
          </div>
        )}

        {/* Filters + Search */}
        <div className="mb-6 flex flex-col gap-4">
          <div className="flex items-center gap-4">
            <Filter className="w-5 h-5 text-muted-text" />
            <div className="flex gap-2 flex-wrap">
              {['all', 'general', 'custom', 'verified', 'pending'].map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-4 py-2 rounded-lg font-audiowide text-sm transition-all duration-300 ${filter === f
                    ? 'bg-gradient-to-r from-primary to-secondary text-white'
                    : 'bg-background-soft border border-border text-muted-text hover:border-primary'
                    }`}
                >
                  {f.charAt(0).toUpperCase() + f.slice(1)}
                </button>
              ))}
            </div>
          </div>
          <div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by pass id, name, email, user id, pass name or order id"
              className="w-full bg-background-soft border border-border text-white px-4 py-2 rounded-lg font-space focus:outline-none focus:border-primary"
            />
          </div>
        </div>

        {/* Passes Table */}
        <div className="bg-background-soft border border-border rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-background border-b border-border">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-audiowide text-muted-text uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-audiowide text-muted-text uppercase tracking-wider">
                    Pass Type
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-audiowide text-muted-text uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-audiowide text-muted-text uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-audiowide text-muted-text uppercase tracking-wider">
                    Pass ID
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-audiowide text-muted-text uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredPasses.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-8 text-center text-muted-text font-space">
                      No passes found
                    </td>
                  </tr>
                ) : (
                  filteredPasses.map((pass) => (
                    <tr key={pass.id} className="hover:bg-background transition-colors">
                      <td className="px-6 py-4">
                        <div className="text-white font-space text-sm">{pass.userName || '—'}</div>
                        <div className="text-muted-text font-space text-xs">{pass.userEmail || pass.userUid}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className={`px-3 py-1 rounded-full text-xs font-audiowide ${pass.passType === 'custom'
                              ? 'bg-secondary/20 text-secondary'
                              : 'bg-primary/20 text-primary'
                            }`}>
                            {pass.passName || pass.passType}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-white font-audiowide">₹{pass.passPrice || pass.amount || 0}</span>
                      </td>
                      <td className="px-6 py-4">
                        {pass.paymentVerified ? (
                          <span className="flex items-center gap-1 text-green-500 text-sm font-space">
                            <CheckCircle className="w-4 h-4" />
                            Verified
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-yellow-500 text-sm font-space">
                            <Clock className="w-4 h-4" />
                            Pending
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-white font-mono text-xs">{pass.id}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => viewPassDetails(pass)}
                            className="text-primary hover:text-hover-primary transition-colors"
                          >
                            <Eye className="w-5 h-5" />
                          </button>
                          {isSuperAdmin && (
                            <button
                              onClick={() => setDeleteConfirm(pass)}
                              className="text-red-500 hover:text-red-400 transition-colors"
                              title="Delete"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Pass Details Modal */}
      {showDetailsModal && selectedPass && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowDetailsModal(false)}>
          <div className="bg-background border border-border rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-audiowide text-2xl text-white">Pass Details</h3>
              <button onClick={() => setShowDetailsModal(false)} className="text-muted-text hover:text-white">
                <XCircle size={24} />
              </button>
            </div>

            <div className="space-y-4">
              <div className="bg-background-soft border border-border rounded-lg p-4">
                <p className="text-muted-text text-sm mb-1">User ID</p>
                <p className="text-white font-space">{selectedPass.userUid}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-background-soft border border-border rounded-lg p-4">
                  <p className="text-muted-text text-sm mb-1">Pass Type</p>
                  <p className="text-white font-audiowide">{selectedPass.passName || selectedPass.passType}</p>
                </div>

                <div className="bg-background-soft border border-border rounded-lg p-4">
                  <p className="text-muted-text text-sm mb-1">Amount</p>
                  <p className="text-white font-audiowide">₹{selectedPass.passPrice || selectedPass.amount}</p>
                </div>
              </div>

              <div className="bg-background-soft border border-border rounded-lg p-4">
                <p className="text-muted-text text-sm mb-1">Status</p>
                <p className={`font-audiowide ${selectedPass.paymentVerified ? 'text-green-500' : 'text-yellow-500'}`}>
                  {selectedPass.paymentVerified ? 'Verified' : 'Pending'}
                </p>
              </div>

              {selectedPass.orderId && (
                <div className="bg-background-soft border border-border rounded-lg p-4">
                  <p className="text-muted-text text-sm mb-1">Order ID</p>
                  <p className="text-white font-space">{selectedPass.orderId}</p>
                </div>
              )}

              {selectedPass.passType === 'custom' && selectedPass.customEvents && selectedPass.customEvents.length > 0 && (
                <div className="bg-background-soft border border-border rounded-lg p-4">
                  <p className="text-muted-text text-sm mb-3">Custom Events</p>
                  <div className="space-y-2">
                    {selectedPass.customEvents.map((eventId) => {
                      const event = CUSTOM_PASS_EVENTS.find(e => e.id === eventId);
                      if (!event) return null;
                      return (
                        <div key={eventId} className="flex items-center justify-between bg-background rounded-lg p-3">
                          <div className="flex items-center gap-2">
                            <span className="text-xl">{event.icon}</span>
                            <span className="text-white font-space text-sm">{event.name}</span>
                          </div>
                          <span className="text-primary font-audiowide text-sm">₹{event.price}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="bg-background-soft border border-border rounded-lg p-4">
                <p className="text-muted-text text-sm mb-1">Pass ID</p>
                <p className="text-white font-mono text-sm">{selectedPass.id}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setDeleteConfirm(null)}>
          <div className="bg-background border border-border rounded-xl p-6 max-w-md w-full" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-audiowide text-xl text-white mb-4">Confirm Delete</h3>
            <p className="text-muted-text font-space mb-6">
              Are you sure you want to delete this pass (₹{deleteConfirm.passPrice || deleteConfirm.amount})? This action cannot be undone.
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => deletePass(deleteConfirm.id)}
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

      {/* Add Pass Modal */}
      {showAddModal && (
        <AddPassModal
          onClose={() => setShowAddModal(false)}
          onAdded={() => {
            setShowAddModal(false);
            fetchPasses();
          }}
        />
      )}
    </div>
  );
};

// Add Pass Modal Component
function AddPassModal({ onClose, onAdded }) {
  const [passType, setPassType] = React.useState('general');
  const [formData, setFormData] = React.useState({
    userName: '',
    userEmail: '',
    userUid: '',
    orderId: '',
    passPrice: '300',
  });
  const [selectedEvents, setSelectedEvents] = React.useState([]);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [searchResults, setSearchResults] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const [searching, setSearching] = React.useState(false);
  const [error, setError] = React.useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.userName || !formData.userEmail || !formData.userUid || !formData.orderId) {
      setError('User name, email, user ID, and order ID are required');
      return;
    }

    if (passType === 'custom' && selectedEvents.length === 0) {
      setError('Please select at least one event for custom pass');
      return;
    }

    if (passType === 'general' && !formData.passPrice) {
      setError('Price is required for general pass');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const { auth } = await import('@/lib/firebase');
      const token = await auth.currentUser?.getIdToken?.();

      // Calculate total price based on pass type
      let totalPrice = 0;
      if (passType === 'custom') {
        totalPrice = selectedEvents.reduce((sum, eventId) => {
          const event = searchResults.find(e => e.id === eventId);
          return sum + (event?.price || 0);
        }, 0);
      } else {
        totalPrice = parseFloat(formData.passPrice) || 0;
      }

      const response = await fetch('/api/admin/passes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          userName: formData.userName,
          userEmail: formData.userEmail,
          userUid: formData.userUid,
          orderId: formData.orderId,
          passType: passType,
          passName: passType === 'general' ? 'General Pass' : 'Custom Pass',
          passPrice: totalPrice,
          paymentVerified: true,
          paymentStatus: 'approved',
          status: 'active',
          ...(passType === 'custom' && { customEvents: selectedEvents }),
        }),
      });

      if (response.ok) {
        onAdded();
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to add pass');
      }
    } catch (err) {
      console.error('Error adding pass:', err);
      setError('Failed to add pass');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchEvents = async (query) => {
    setSearchQuery(query);

    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setSearching(true);
    try {
      const { auth } = await import('@/lib/firebase');
      const token = await auth.currentUser?.getIdToken?.();

      const response = await fetch(`/api/admin/special-events/search?q=${encodeURIComponent(query)}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setSearchResults(data.events || []);
      } else {
        setSearchResults([]);
      }
    } catch (err) {
      console.error('Error searching events:', err);
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  };

  const toggleEvent = (eventId) => {
    setSelectedEvents(prev =>
      prev.includes(eventId)
        ? prev.filter(id => id !== eventId)
        : [...prev, eventId]
    );
  };

  const getSelectedEventDetails = () => {
    return selectedEvents.map(eventId => {
      const event = searchResults.find(e => e.id === eventId);
      return event;
    }).filter(Boolean);
  };

  const totalCustomPrice = getSelectedEventDetails().reduce((sum, event) => {
    return sum + (event?.price || 0);
  }, 0);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto" onClick={onClose}>
      <div className="bg-background border border-border rounded-xl p-6 max-w-2xl w-full my-8" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-audiowide text-xl text-white">Add Pass</h3>
          <button onClick={onClose} className="text-muted-text hover:text-white">
            <X size={24} />
          </button>
        </div>

        {error && (
          <div className="bg-red-900/30 border border-red-700 text-red-200 px-4 py-3 rounded-lg mb-4 font-space text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-white font-audiowide text-sm mb-2">User Name *</label>
              <input
                type="text"
                value={formData.userName}
                onChange={(e) => setFormData({ ...formData, userName: e.target.value })}
                className="w-full bg-background-soft border border-border text-white px-4 py-2 rounded-lg font-space focus:outline-none focus:border-primary"
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-white font-audiowide text-sm mb-2">Email *</label>
              <input
                type="email"
                value={formData.userEmail}
                onChange={(e) => setFormData({ ...formData, userEmail: e.target.value })}
                className="w-full bg-background-soft border border-border text-white px-4 py-2 rounded-lg font-space focus:outline-none focus:border-primary"
                disabled={loading}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-white font-audiowide text-sm mb-2">User ID *</label>
              <input
                type="text"
                placeholder="Firebase UID"
                value={formData.userUid}
                onChange={(e) => setFormData({ ...formData, userUid: e.target.value })}
                className="w-full bg-background-soft border border-border text-white px-4 py-2 rounded-lg font-space focus:outline-none focus:border-primary placeholder-muted-text text-xs"
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-white font-audiowide text-sm mb-2">Order ID *</label>
              <input
                type="text"
                placeholder="e.g., ORD-12345"
                value={formData.orderId}
                onChange={(e) => setFormData({ ...formData, orderId: e.target.value })}
                className="w-full bg-background-soft border border-border text-white px-4 py-2 rounded-lg font-space focus:outline-none focus:border-primary placeholder-muted-text"
                disabled={loading}
              />
            </div>
          </div>

          <div>
            <label className="block text-white font-audiowide text-sm mb-2">Pass Type *</label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  value="general"
                  checked={passType === 'general'}
                  onChange={(e) => {
                    setPassType(e.target.value);
                    setSelectedEvents([]);
                  }}
                  disabled={loading}
                  className="w-4 h-4"
                />
                <span className="text-white font-space">General Pass (₹300)</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  value="custom"
                  checked={passType === 'custom'}
                  onChange={(e) => {
                    setPassType(e.target.value);
                    setSelectedEvents([]);
                  }}
                  disabled={loading}
                  className="w-4 h-4"
                />
                <span className="text-white font-space">Custom Pass</span>
              </label>
            </div>
          </div>

          {passType === 'custom' && (
            <div>
              <label className="block text-white font-audiowide text-sm mb-3">Search & Select Events *</label>

              <div className="mb-4">
                <input
                  type="text"
                  placeholder="Search events by name..."
                  value={searchQuery}
                  onChange={(e) => handleSearchEvents(e.target.value)}
                  className="w-full bg-background-soft border border-border text-white px-4 py-2 rounded-lg font-space focus:outline-none focus:border-primary placeholder-muted-text"
                  disabled={loading || searching}
                />
                {searching && (
                  <div className="text-muted-text text-xs mt-2">Searching...</div>
                )}
              </div>

              {searchQuery && searchResults.length > 0 && (
                <div className="max-h-64 overflow-y-auto space-y-2 bg-background-soft border border-border rounded-lg p-4 mb-4">
                  {searchResults.map((event) => (
                    <label key={event.id} className="flex items-center gap-3 p-2 hover:bg-background rounded cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedEvents.includes(event.id)}
                        onChange={() => toggleEvent(event.id)}
                        disabled={loading}
                        className="w-4 h-4"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="text-white font-audiowide text-sm">{event.title || event.name}</div>
                        <div className="text-muted-text font-space text-xs">{event.category || event.description}</div>
                      </div>
                      <div className="text-primary font-audiowide text-sm whitespace-nowrap">₹{event.price || 0}</div>
                    </label>
                  ))}
                </div>
              )}

              {searchQuery && searchResults.length === 0 && !searching && (
                <div className="text-muted-text text-xs text-center py-4 bg-background-soft border border-border rounded-lg mb-4">
                  No events found matching "{searchQuery}"
                </div>
              )}

              {selectedEvents.length > 0 && (
                <div className="space-y-3">
                  <div className="text-white font-audiowide text-sm mb-2">Selected Events ({selectedEvents.length}):</div>
                  <div className="space-y-2 bg-background-soft border border-border rounded-lg p-3 max-h-40 overflow-y-auto">
                    {getSelectedEventDetails().map((event) => (
                      <div key={event.id} className="flex items-center justify-between p-2 bg-background rounded">
                        <div className="flex-1 min-w-0">
                          <div className="text-white font-audiowide text-xs">{event.title || event.name}</div>
                          <div className="text-muted-text font-space text-xs">₹{event.price || 0}</div>
                        </div>
                        <button
                          type="button"
                          onClick={() => toggleEvent(event.id)}
                          className="text-red-400 hover:text-red-300 text-sm ml-2"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                  <div className="p-3 bg-primary/10 border border-primary/30 rounded-lg">
                    <div className="text-primary font-audiowide text-sm">Total: ₹{totalCustomPrice}</div>
                  </div>
                </div>
              )}
            </div>
          )}

          {passType === 'general' && (
            <div>
              <label className="block text-white font-audiowide text-sm mb-2">Price (₹)</label>
              <input
                type="number"
                value={formData.passPrice}
                onChange={(e) => setFormData({ ...formData, passPrice: e.target.value })}
                className="w-full bg-background-soft border border-border text-white px-4 py-2 rounded-lg font-space focus:outline-none focus:border-primary"
                disabled={loading}
              />
            </div>
          )}

          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-gradient-to-r from-primary to-secondary text-white px-4 py-2 rounded-lg font-audiowide hover:from-hover-primary hover:to-primary transition-all disabled:opacity-50"
            >
              {loading ? 'Adding...' : 'Add Pass'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-background-soft border border-border text-white px-4 py-2 rounded-lg font-audiowide hover:bg-background transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AdminPassesPage;
