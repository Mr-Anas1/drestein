'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getDepartmentName } from '@/constants/departments';
import { Eye, Edit, Trash2, Users } from 'lucide-react';
import Image from 'next/image';
import ParticipantListModal from './ParticipantListModal';

export default function EventsTable({ events, loading, onEdit, onDelete, onView }) {
    const [showParticipantModal, setShowParticipantModal] = useState(false);
    const [selectedEventForParticipants, setSelectedEventForParticipants] = useState(null);
    const { isSuperAdmin, isDepartmentAdmin, userDepartment } = useAuth();
    const [countsByEvent, setCountsByEvent] = useState({});

    const canEditEvent = (event) => {
        // Only super admins can edit/delete events
        // Department admins can only view participants
        if (isSuperAdmin) return true;
        return false;
    };

    const handleViewParticipants = (event) => {
        setSelectedEventForParticipants(event);
        setShowParticipantModal(true);
    };

    // Fetch confirmed participant counts per event
    useEffect(() => {
        let cancelled = false;
        async function loadCounts() {
            const ids = Array.from(new Set((events || []).map(e => e.id).filter(Boolean)));
            const results = await Promise.allSettled(ids.map(async (id) => {
                try {
                    const res = await fetch(`/api/registrations?eventId=${encodeURIComponent(id)}`);
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
        if (events && events.length) {
            loadCounts();
        } else {
            setCountsByEvent({});
        }
        return () => { cancelled = true; };
    }, [events]);

    if (loading) {
        return (
            <div className="bg-background-soft border border-border rounded-xl overflow-hidden">
                <div className="p-6 border-b border-border">
                    <h2 className="font-audiowide text-xl text-white">All Events</h2>
                </div>
                <div className="p-12 text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-muted-text font-space">Loading events...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-background-soft border border-border rounded-xl overflow-hidden">
            <div className="p-6 border-b border-border">
                <h2 className="font-audiowide text-xl text-white">All Events</h2>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-background">
                        <tr>
                            <th className="text-left p-4 font-audiowide text-sm text-muted-text">Event</th>
                            <th className="text-left p-4 font-audiowide text-sm text-muted-text">Date</th>
                            <th className="text-left p-4 font-audiowide text-sm text-muted-text">Department</th>
                            <th className="text-left p-4 font-audiowide text-sm text-muted-text">Category</th>
                            <th className="text-left p-4 font-audiowide text-sm text-muted-text">Participants</th>
                            <th className="text-left p-4 font-audiowide text-sm text-muted-text">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {events.map((event) => (
                            <tr key={event.id} className="border-t border-border hover:bg-background/50">
                                <td className="p-4">
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
                                            <p className="text-muted-text font-space text-xs">{event.venue}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="p-4">
                                    {event.isMultiDay && event.startDate && event.endDate ? (
                                        <>
                                            <p className="text-white font-space text-sm">
                                                {new Date(event.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {new Date(event.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                            </p>
                                            <p className="text-muted-text font-space text-xs">{event.time || 'Multi-day'}</p>
                                        </>
                                    ) : (
                                        <>
                                            <p className="text-white font-space text-sm">{event.date}</p>
                                            <p className="text-muted-text font-space text-xs">{event.time}</p>
                                        </>
                                    )}
                                </td>
                                <td className="p-4">
                                    <p className="text-white font-space text-sm">
                                        {getDepartmentName(event.department)}
                                    </p>
                                </td>
                                <td className="p-4">
                                    <span className={`px-2 py-1 rounded-full text-xs font-audiowide ${event.category === 'Technical'
                                        ? 'bg-primary/20 text-primary'
                                        : 'bg-secondary/20 text-secondary'
                                        }`}>
                                        {event.category}
                                    </span>
                                </td>
                                <td className="p-4">
                                    <p className="text-white font-audiowide text-sm">
                                        {countsByEvent[event.id] ?? 0}
                                    </p>
                                </td>
                                <td className="p-4">
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => handleViewParticipants(event)}
                                            className="p-2 text-muted-text hover:text-accent transition-colors duration-300"
                                            title="View Participants"
                                        >
                                            <Users size={16} />
                                        </button>
                                        {isSuperAdmin && (
                                            <button
                                                onClick={() => onView(event)}
                                                className="p-2 text-muted-text hover:text-primary transition-colors duration-300"
                                                title="View Details"
                                            >
                                                <Eye size={16} />
                                            </button>
                                        )}
                                        {canEditEvent(event) && (
                                            <button
                                                onClick={() => onEdit(event)}
                                                className="p-2 text-muted-text hover:text-secondary transition-colors duration-300"
                                                title="Edit Event"
                                            >
                                                <Edit size={16} />
                                            </button>
                                        )}
                                        {canEditEvent(event) && (
                                            <button
                                                onClick={() => onDelete(event)}
                                                className="p-2 text-muted-text hover:text-red-500 transition-colors duration-300"
                                                title="Delete Event"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Participant List Modal */}
            {showParticipantModal && selectedEventForParticipants && (
                <ParticipantListModal
                    event={selectedEventForParticipants}
                    onClose={() => {
                        setShowParticipantModal(false);
                        setSelectedEventForParticipants(null);
                    }}
                />
            )}
        </div>
    );
}
