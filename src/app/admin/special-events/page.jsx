"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import { DEPARTMENTS } from '@/constants/departments';
import { useAuth } from '@/contexts/AuthContext';
import { Plus, Edit, Trash2, Eye, Users, ArrowLeft } from 'lucide-react';
import AddSpecialEventModal from '@/components/AddSpecialEventModal';
import EditSpecialEventModal from '@/components/EditSpecialEventModal';
import SpecialEventParticipantsModal from '@/components/SpecialEventParticipantsModal';

const AdminSpecialEventsPage = () => {
  const { user, userRole, loading: authLoading, isSuperAdmin, isDepartmentAdmin } = useAuth();
  const router = useRouter();
  const [specialEvents, setSpecialEvents] = useState([]);
  const [filteredSpecialEvents, setFilteredSpecialEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [showParticipantsModal, setShowParticipantsModal] = useState(false);
  const [participantsEvent, setParticipantsEvent] = useState(null);
  const [pagination, setPagination] = useState({ total: 0, offset: 0, limit: 20, hasMore: false });
  const [loadingMore, setLoadingMore] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

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

  useEffect(() => {
    if (user && (isSuperAdmin || isDepartmentAdmin)) {
      // reset pagination on role/department change
      setPagination((prev) => ({ ...prev, offset: 0 }));
      fetchSpecialEvents({ offset: 0, append: false, limit: pagination.limit });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, isSuperAdmin, isDepartmentAdmin, userRole, selectedDepartment]);

  // Apply client-side search filtering
  useEffect(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) {
      setFilteredSpecialEvents(specialEvents);
      return;
    }
    const filtered = specialEvents.filter(ev => {
      const title = String(ev.title || '').toLowerCase();
      const venue = String(ev.venue || '').toLowerCase();
      const category = String(ev.category || '').toLowerCase();
      return title.includes(q) || venue.includes(q) || category.includes(q);
    });
    setFilteredSpecialEvents(filtered);
  }, [specialEvents, searchQuery]);

  const fetchSpecialEvents = async ({ offset = 0, append = false, limit = 50 } = {}) => {
    try {
      if (append) setLoadingMore(true); else setLoading(true);
      
      // Fetch fresh from API (no-store) to reflect latest admin writes
      const res = await fetch(`/api/special-events?offset=${offset}&limit=${limit}`, { cache: 'no-store' });
      if (!res.ok) throw new Error('Failed to fetch special events');
      const data = await res.json();
      let events = Array.isArray(data?.events) ? data.events : (Array.isArray(data) ? data : []);
      
      // Apply department filtering client-side
      if (isDepartmentAdmin && userRole?.department) {
        events = events.filter(event => event.department === userRole.department);
      } else if (isSuperAdmin && selectedDepartment && selectedDepartment !== 'all') {
        events = events.filter(event => event.department === selectedDepartment);
      }

      if (append) {
        setSpecialEvents((prev) => [...prev, ...events]);
      } else {
        setSpecialEvents(events);
      }

      const apiPag = data?.pagination || {};
      const total = typeof apiPag.total === 'number' ? apiPag.total : (append ? (specialEvents.length + events.length) : events.length);
      const hasMore = typeof apiPag.hasMore === 'boolean' ? apiPag.hasMore : (offset + limit < total);
      setPagination({
        total,
        offset,
        limit,
        hasMore,
      });
    } catch (error) {
      console.error('Error fetching special events:', error);
    } finally {
      if (append) setLoadingMore(false); else setLoading(false);
    }
  };

  const handleDelete = async (eventId) => {
    try {
      const { auth } = await import('@/lib/firebase');
      const token = await auth.currentUser?.getIdToken?.();
      
      const response = await fetch(`/api/special-events?id=${eventId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        fetchSpecialEvents();
        setDeleteConfirm(null);
      }
    } catch (error) {
      console.error('Error deleting event:', error);
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
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="font-audiowide text-4xl md:text-6xl bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-4">
              Special Events Management
            </h1>
            <p className="text-muted-text font-space text-lg">
              Manage competitions, workshops, and premium events
            </p>
          </div>

          

          {/* Only super admins can add special events */}
          {isSuperAdmin && (
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-gradient-to-r from-primary to-secondary text-white px-6 py-3 rounded-lg font-audiowide hover:from-hover-primary hover:to-primary transition-all duration-300 flex items-center gap-2 mt-4 md:mt-0"
            >
              <Plus size={20} />
              Add Special Event
            </button>
          )}
        </div>

{/* Department Filter for Super Admin */}
          {isSuperAdmin && (
            <div className="mb-6">
              <label className="block text-white font-audiowide text-sm mb-2">Filter by Department</label>
              <select
                value={selectedDepartment}
                onChange={(e) => setSelectedDepartment(e.target.value)}
                className="bg-background-soft border border-border text-white px-4 py-2 rounded-lg font-space focus:outline-none focus:border-primary"
              >
                <option value="all">All Departments</option>
                {DEPARTMENTS.map(dept => (
                  <option key={dept.id} value={dept.id}>{dept.name}</option>
                ))}
              </select>
            </div>
          )}
        {/* Search */}
        <div className="mb-6">
          <label className="block text-white font-audiowide text-sm mb-2">Search</label>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by title, venue, or category"
            className="w-full bg-background-soft border border-border text-white px-4 py-2 rounded-lg font-space focus:outline-none focus:border-primary"
          />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-background-soft border border-border rounded-xl p-6">
            <div className="text-3xl font-audiowide text-white mb-2">{filteredSpecialEvents.length}</div>
            <p className="text-muted-text font-space text-sm">Total Special Events</p>
          </div>
          <div className="bg-background-soft border border-border rounded-xl p-6">
            <div className="text-3xl font-audiowide text-white mb-2">
              {filteredSpecialEvents.filter(e => e.category === 'competition').length}
            </div>
            <p className="text-muted-text font-space text-sm">Competitions</p>
          </div>
          <div className="bg-background-soft border border-border rounded-xl p-6">
            <div className="text-3xl font-audiowide text-white mb-2">
              {filteredSpecialEvents.filter(e => e.category === 'workshop').length}
            </div>
            <p className="text-muted-text font-space text-sm">Workshops</p>
          </div>
        </div>

        

        {/* Events Table */}
        <div className="bg-background-soft border border-border rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-background border-b border-border">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-audiowide text-muted-text uppercase">Title</th>
                  <th className="px-6 py-4 text-left text-xs font-audiowide text-muted-text uppercase">Category</th>
                  <th className="px-6 py-4 text-left text-xs font-audiowide text-muted-text uppercase">Price</th>
                  <th className="px-6 py-4 text-left text-xs font-audiowide text-muted-text uppercase">Type</th>
                  <th className="px-6 py-4 text-left text-xs font-audiowide text-muted-text uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredSpecialEvents.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-8 text-center text-muted-text font-space">
                      No special events yet. Click "Add Special Event" to create one.
                    </td>
                  </tr>
                ) : (
                  filteredSpecialEvents.map((event) => (
                    <tr key={event.id} className="hover:bg-background transition-colors">
                      <td className="px-6 py-4">
                        <div className="text-white font-space">{event.title}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-audiowide ${
                          event.category === 'competition' ? 'bg-primary/20 text-primary' :
                          event.category === 'workshop' ? 'bg-secondary/20 text-secondary' :
                          'bg-green-500/20 text-green-500'
                        }`}>
                          {event.category}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-white font-audiowide">₹{event.price}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-muted-text font-space text-sm">{event.type}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              setParticipantsEvent(event);
                              setShowParticipantsModal(true);
                            }}
                            className="text-accent hover:text-accent/80 transition-colors"
                            title="View Participants"
                          >
                            <Users className="w-5 h-5" />
                          </button>
                          {isSuperAdmin && (
                            <button
                              onClick={() => router.push(`/special-events/${event.id}`)}
                              className="text-primary hover:text-hover-primary transition-colors"
                              title="View"
                            >
                              <Eye className="w-5 h-5" />
                            </button>
                          )}
                          {/* Only super admins can edit/delete special events */}
                          {isSuperAdmin && (
                            <>
                              <button
                                onClick={() => {
                                  setSelectedEvent(event);
                                  setShowEditModal(true);
                                }}
                                className="text-secondary hover:text-secondary/80 transition-colors"
                                title="Edit"
                              >
                                <Edit className="w-5 h-5" />
                              </button>
                              <button
                                onClick={() => setDeleteConfirm(event)}
                                className="text-red-500 hover:text-red-400 transition-colors"
                                title="Delete"
                              >
                                <Trash2 className="w-5 h-5" />
                              </button>
                            </>
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

        {pagination.hasMore && (
          <div className="mt-6 flex justify-center">
            <button
              onClick={() => fetchSpecialEvents({ offset: pagination.offset + pagination.limit, append: true, limit: pagination.limit })}
              disabled={loadingMore}
              className="px-6 py-3 rounded-lg font-audiowide bg-background-soft border border-border text-white hover:bg-background transition-colors disabled:opacity-60"
            >
              {loadingMore ? 'Loading...' : 'Load more'}
            </button>
          </div>
        )}
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <AddSpecialEventModal
          onClose={() => setShowAddModal(false)}
          onSuccess={() => {
            setShowAddModal(false);
            fetchSpecialEvents({ offset: 0, append: false, limit: pagination.limit });
          }}
        />
      )}

      {/* Edit Modal */}
      {showEditModal && selectedEvent && (
        <EditSpecialEventModal
          event={selectedEvent}
          onClose={() => {
            setShowEditModal(false);
            setSelectedEvent(null);
          }}
          onSuccess={() => {
            setShowEditModal(false);
            setSelectedEvent(null);
            fetchSpecialEvents({ offset: 0, append: false, limit: pagination.limit });
          }}
        />
      )}

      {/* Participants Modal */}
      {showParticipantsModal && participantsEvent && (
        <SpecialEventParticipantsModal
          event={participantsEvent}
          onClose={() => {
            setShowParticipantsModal(false);
            setParticipantsEvent(null);
          }}
        />
      )}

      {/* Delete Confirmation */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setDeleteConfirm(null)}>
          <div className="bg-background border border-border rounded-xl p-6 max-w-md w-full" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-audiowide text-xl text-white mb-4">Confirm Delete</h3>
            <p className="text-muted-text font-space mb-6">
              Are you sure you want to delete "{deleteConfirm.title}"? This action cannot be undone.
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => handleDelete(deleteConfirm.id)}
                className="flex-1 bg-red-500 text-white px-4 py-2 rounded-lg font-audiowide hover:bg-red-600 transition-colors"
              >
                Delete
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
  );
};

export default AdminSpecialEventsPage;
