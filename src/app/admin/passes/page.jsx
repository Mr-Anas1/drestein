"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import { useAuth } from '@/contexts/AuthContext';
import { Ticket, Users, DollarSign, CheckCircle, XCircle, Clock, Eye, Filter, ArrowLeft } from 'lucide-react';
import { CUSTOM_PASS_EVENTS } from '@/constants/customPassEvents';

const AdminPassesPage = () => {
  const { user, userRole, loading: authLoading, isSuperAdmin, isDepartmentAdmin } = useAuth();
  const router = useRouter();
  const [passes, setPasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, general, custom, pending, verified
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPass, setSelectedPass] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

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
        <div className="mb-8">
          <h1 className="font-audiowide text-4xl md:text-6xl bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-4">
            Pass Management
          </h1>
          <p className="text-muted-text font-space text-lg">
            View and manage all event passes
          </p>
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
                  className={`px-4 py-2 rounded-lg font-audiowide text-sm transition-all duration-300 ${
                    filter === f
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
                          <span className={`px-3 py-1 rounded-full text-xs font-audiowide ${
                            pass.passType === 'custom'
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
                        <button
                          onClick={() => viewPassDetails(pass)}
                          className="text-primary hover:text-hover-primary transition-colors"
                        >
                          <Eye className="w-5 h-5" />
                        </button>
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
    </div>
  );
};

export default AdminPassesPage;
