"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import CustomDropdown from '@/components/CustomDropdown';
import { DEPARTMENTS } from '@/constants/departments';
import { useAuth } from '@/contexts/AuthContext';
import { Plus, Edit, Trash2, Eye, Users, ArrowLeft, Download } from 'lucide-react';
import Image from 'next/image';
import { getDepartmentName } from '@/constants/departments';
import { exportSpecialEventsToCSV } from '@/lib/csvExport';
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
  const [pagination, setPagination] = useState({ total: 0, offset: 0, limit: 500, hasMore: false });
  const [loadingMore, setLoadingMore] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [countsByEvent, setCountsByEvent] = useState({});
  const totalEvents = filteredSpecialEvents.length;
  const totalParticipants = Object.values(countsByEvent).reduce((a, b) => a + (Number(b) || 0), 0);
  const competitionsCount = filteredSpecialEvents.filter(e => String(e.category).toLowerCase() === 'competition').length;
  const workshopsCount = filteredSpecialEvents.filter(e => String(e.category).toLowerCase() === 'workshop').length;

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

  // Fetch confirmed participant counts per special event
  useEffect(() => {
    let cancelled = false;
    async function loadCounts() {
      const ids = Array.from(new Set((filteredSpecialEvents || []).map(e => e.id).filter(Boolean)));
      const results = await Promise.allSettled(ids.map(async (id) => {
        try {
          const res = await fetch(`/api/registrations?eventId=${encodeURIComponent(id)}&isSpecialEvent=true`);
          if (!res.ok) throw new Error('failed');
          const data = await res.json();
          const list = Array.isArray(data?.participants) ? data.participants : [];
          const confirmed = list.filter(p => (p?.status === 'confirmed' || p?.paymentStatus === 'approved' || p?.paymentStatus === 'paid'));
          return { id, count: confirmed.length };
        } catch {
          return { id, count: 0 };
        }
      }));
      if (cancelled) return;
      const map = {};
      for (const r of results) {
        if (r.status === 'fulfilled' && r.value) {
          map[r.value.id] = r.value.count;
        }
      }
      setCountsByEvent(map);
    }
    if (filteredSpecialEvents && filteredSpecialEvents.length) {
      loadCounts();
    } else {
      setCountsByEvent({});
    }
    return () => { cancelled = true; };
  }, [filteredSpecialEvents]);

  const fetchSpecialEvents = async ({ offset = 0, append = false, limit = 500 } = {}) => {
    try {
      if (append) setLoadingMore(true); else setLoading(true);

      // Fetch fresh from API (no-store) to reflect latest admin writes
      const res = await fetch(`/api/special-events?offset=${offset}&limit=${limit}`, { cache: 'no-store' });
      if (!res.ok) throw new Error('Failed to fetch special events');
      const data = await res.json();
      let events = Array.isArray(data?.events) ? data.events : (Array.isArray(data) ? data : []);

      // Helper: event belongs to department (supports array/string)
      const belongsToDept = (event, deptId) => {
        if (!deptId) return false;
        if (Array.isArray(event.departments)) return event.departments.includes(deptId);
        return event.department === deptId;
      };

      // Apply department filtering client-side
      if (isDepartmentAdmin && userRole?.department) {
        events = events.filter(event => belongsToDept(event, userRole.department));
      } else if (isSuperAdmin && selectedDepartment && selectedDepartment !== 'all') {
        events = events.filter(event => belongsToDept(event, selectedDepartment));
      }

      if (append) {
        setSpecialEvents((prev) => [...prev, ...events]);
      } else {
        setSpecialEvents(events);
      }

      const apiPag = data?.pagination || {};
      const total = typeof apiPag.total === 'number' ? apiPag.total : (append ? (specialEvents.length + events.length) : events.length);
      setPagination({
        total,
        offset,
        limit,
        hasMore: false,
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

          <div className="flex items-center gap-4 mt-4 md:mt-0 flex-wrap">
            {/* Only super admins can add special events */}
            {isSuperAdmin && (
              <button
                onClick={() => setShowAddModal(true)}
                className="bg-gradient-to-r from-primary to-secondary text-white px-6 py-3 rounded-lg font-audiowide hover:from-hover-primary hover:to-primary transition-all duration-300 flex items-center gap-2"
              >
                <Plus size={20} />
                Add Special Event
              </button>
            )}

            <button
              onClick={() => exportSpecialEventsToCSV(filteredSpecialEvents)}
              className="bg-background-soft border border-border text-white px-4 py-3 rounded-lg font-audiowide hover:bg-background transition-colors duration-300 flex items-center gap-2"
            >
              <Download size={20} />
              Export CSV
            </button>
          </div>
        </div>

        {/* Department Filter for Super Admin */}
        {isSuperAdmin && (
          <div className="mb-6">
            <label className="block text-white font-audiowide text-sm mb-2">Filter by Department</label>
            <div className="max-w-sm">
              <CustomDropdown
                value={selectedDepartment}
                onChange={setSelectedDepartment}
                options={[{ id: 'all', name: 'All Departments', short: 'ALL' }, ...DEPARTMENTS]}
                placeholder="Select Department"
              />
            </div>
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
        {/* <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
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
        </div> */}



        {/* Events Table */}
        <div className="bg-background-soft border border-border rounded-xl overflow-hidden">
          <div className="p-6 border-b border-border">
            <h2 className="font-audiowide text-xl text-white">Special Events Overview</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
              <div className="bg-background rounded-lg border border-border p-4">
                <p className="text-muted-text text-xs font-space">Total Special Events</p>
                <p className="text-white font-audiowide text-2xl mt-1">{totalEvents}</p>
              </div>
              <div className="bg-background rounded-lg border border-border p-4">
                <p className="text-muted-text text-xs font-space">Total Participants</p>
                <p className="text-white font-audiowide text-2xl mt-1">{totalParticipants}</p>
              </div>
              <div className="bg-background rounded-lg border border-border p-4">
                <p className="text-muted-text text-xs font-space">Competitions</p>
                <p className="text-white font-audiowide text-2xl mt-1">{competitionsCount}</p>
              </div>
              <div className="bg-background rounded-lg border border-border p-4">
                <p className="text-muted-text text-xs font-space">Workshops</p>
                <p className="text-white font-audiowide text-2xl mt-1">{workshopsCount}</p>
              </div>
            </div>
          </div>
          <div className="p-6 border-b border-border">
            <div className="flex items-center justify-between">
              <h2 className="font-audiowide text-xl text-white">All Special Events</h2>
            </div>
            <table className="w-full">
              <thead className="bg-background border-b border-border">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-audiowide text-muted-text uppercase">Event</th>
                  <th className="px-6 py-4 text-left text-xs font-audiowide text-muted-text uppercase">Date</th>
                  <th className="px-6 py-4 text-left text-xs font-audiowide text-muted-text uppercase">Department</th>
                  <th className="px-6 py-4 text-left text-xs font-audiowide text-muted-text uppercase">Category</th>
                  <th className="px-6 py-4 text-left text-xs font-audiowide text-muted-text uppercase">Participants</th>
                  <th className="px-6 py-4 text-left text-xs font-audiowide text-muted-text uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredSpecialEvents.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-8 text-center text-muted-text font-space">
                      No special events yet. Click "Add Special Event" to create one.
                    </td>
                  </tr>
                ) : (
                  filteredSpecialEvents.map((event) => (
                    <tr key={event.id} className="hover:bg-background transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <Image
                            src={event.img || "/square.png"}
                            alt={event.title}
                            width={48}
                            height={48}
                            loading="lazy"
                            className="w-12 h-12 rounded-lg object-cover"
                          />
                          <div>
                            <p className="font-audiowide text-white text-sm">{event.title}</p>
                            <p className="text-muted-text font-space text-xs">{event.venue || 'TBA'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {event.isMultiDay && event.startDate && event.endDate ? (
                          <>
                            <p className="text-white font-space text-sm">
                              {new Date(event.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {new Date(event.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                            </p>
                            <p className="text-muted-text font-space text-xs">{event.time || 'Multi-day'}</p>
                          </>
                        ) : (
                          <>
                            <p className="text-white font-space text-sm">{event.date || 'TBA'}</p>
                            <p className="text-muted-text font-space text-xs">{event.time || 'TBA'}</p>
                          </>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-white font-space text-sm">
                          {event.department ? getDepartmentName(event.department) : (event.departments && event.departments.length > 0 ? getDepartmentName(event.departments[0]) : 'All')}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-audiowide ${event.category === 'competition' ? 'bg-primary/20 text-primary' :
                          event.category === 'workshop' ? 'bg-secondary/20 text-secondary' :
                            'bg-green-500/20 text-green-500'
                          }`}>
                          {event.category}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-white font-audiowide text-sm">
                          {countsByEvent[event.id] ?? 0}
                        </p>
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

        {/* Pagination removed as per requirement */}
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
