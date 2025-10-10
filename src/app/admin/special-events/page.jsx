"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import { useAuth } from '@/contexts/AuthContext';
import { Plus, Edit, Trash2, Eye } from 'lucide-react';
import AddSpecialEventModal from '@/components/AddSpecialEventModal';
import EditSpecialEventModal from '@/components/EditSpecialEventModal';

const AdminSpecialEventsPage = () => {
  const { user, userRole, loading: authLoading, isSuperAdmin, isDepartmentAdmin } = useAuth();
  const router = useRouter();
  const [specialEvents, setSpecialEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

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
      fetchSpecialEvents();
    }
  }, [user, isSuperAdmin, isDepartmentAdmin]);

  const fetchSpecialEvents = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/special-events');
      const data = await response.json();
      setSpecialEvents(data);
    } catch (error) {
      console.error('Error fetching special events:', error);
    } finally {
      setLoading(false);
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

          <button
            onClick={() => setShowAddModal(true)}
            className="bg-gradient-to-r from-primary to-secondary text-white px-6 py-3 rounded-lg font-audiowide hover:from-hover-primary hover:to-primary transition-all duration-300 flex items-center gap-2 mt-4 md:mt-0"
          >
            <Plus size={20} />
            Add Special Event
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-background-soft border border-border rounded-xl p-6">
            <div className="text-3xl font-audiowide text-white mb-2">{specialEvents.length}</div>
            <p className="text-muted-text font-space text-sm">Total Special Events</p>
          </div>
          <div className="bg-background-soft border border-border rounded-xl p-6">
            <div className="text-3xl font-audiowide text-white mb-2">
              {specialEvents.filter(e => e.category === 'competition').length}
            </div>
            <p className="text-muted-text font-space text-sm">Competitions</p>
          </div>
          <div className="bg-background-soft border border-border rounded-xl p-6">
            <div className="text-3xl font-audiowide text-white mb-2">
              {specialEvents.filter(e => e.category === 'workshop').length}
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
                {specialEvents.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-8 text-center text-muted-text font-space">
                      No special events yet. Click "Add Special Event" to create one.
                    </td>
                  </tr>
                ) : (
                  specialEvents.map((event) => (
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
                            onClick={() => router.push(`/special-events/${event.id}`)}
                            className="text-primary hover:text-hover-primary transition-colors"
                            title="View"
                          >
                            <Eye className="w-5 h-5" />
                          </button>
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

      {/* Add Modal */}
      {showAddModal && (
        <AddSpecialEventModal
          onClose={() => setShowAddModal(false)}
          onSuccess={() => {
            setShowAddModal(false);
            fetchSpecialEvents();
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
            fetchSpecialEvents();
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
