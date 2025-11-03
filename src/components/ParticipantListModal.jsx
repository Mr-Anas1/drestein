'use client';

import { useState, useEffect } from 'react';
import { X, Users, Mail, User, Download, UserCheck, Edit2, Trash2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { getAuth } from 'firebase/auth';

export default function ParticipantListModal({ event, onClose }) {
    const [participants, setParticipants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [editingParticipant, setEditingParticipant] = useState(null);
    const [deleteConfirm, setDeleteConfirm] = useState(null);
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const { isSuperAdmin } = useAuth();

    useEffect(() => {
        fetchParticipants();
    }, [event.id]);

    const fetchParticipants = async () => {
        try {
            setLoading(true);
            const response = await fetch(`/api/registrations?eventId=${event.id}`);
            const data = await response.json();

            if (response.ok) {
                const list = data.participants || [];
                const confirmed = list.filter(p => (p?.status === 'confirmed') || (p?.paymentStatus === 'paid'));
                setParticipants(confirmed);
            } else {
                setError(data.error || 'Failed to fetch participants');
            }
        } catch (error) {
            console.error('Error fetching participants:', error);
            setError('Failed to load participants');
        } finally {
            setLoading(false);
        }
    };

    const exportToCSV = () => {
        if (participants.length === 0) return;

        const headers = ['Name', 'Phone', 'Roll No', 'College', 'Team Members', 'Status'];
        const csvContent = [
            headers.join(','),
            ...participants.map(p => [
                `"${p.name || 'N/A'}"`,
                `"${p.phone || 'N/A'}"`,
                `"${p.rollNo || 'N/A'}"`,
                `"${p.college || 'N/A'}"`,
                `"${p.teamMembers ? p.teamMembers.join('; ') : 'Individual'}"`,
                `"${p.status || 'confirmed'}"`
            ].join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${event.title.replace(/[^a-zA-Z0-9]/g, '_')}_participants.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
    };

    // Edit participant submit
    const submitEdit = async () => {
        if (!editingParticipant) return;
        setSaving(true);
        try {
            const auth = getAuth();
            const token = await auth.currentUser?.getIdToken?.();
            const response = await fetch('/api/registrations', {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    registrationId: editingParticipant.id,
                    name: editingParticipant.name,
                    email: editingParticipant.email,
                    rollNo: editingParticipant.rollNo,
                    college: editingParticipant.college,
                    teamMembers: editingParticipant.teamMembers || [],
                }),
            });
            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Failed to update participant');
            }
            setEditingParticipant(null);
            await fetchParticipants();
        } catch (e) {
            alert(e.message);
        } finally {
            setSaving(false);
        }
    };

    const confirmDelete = async () => {
        if (!deleteConfirm) return;
        setDeleting(true);
        try {
            const auth = getAuth();
            const token = await auth.currentUser?.getIdToken?.();
            const response = await fetch(`/api/registrations?id=${deleteConfirm.id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Failed to delete');
            }
            setDeleteConfirm(null);
            await fetchParticipants();
        } catch (e) {
            alert(e.message);
        } finally {
            setDeleting(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-background border border-border rounded-xl p-6 max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h3 className="font-audiowide text-xl text-white flex items-center gap-2">
                            <Users size={24} />
                            Event Participants
                        </h3>
                        <p className="text-muted-text font-space text-sm mt-1">{event.title}</p>
                    </div>
                    <div className="flex items-center gap-2">
                        {participants.length > 0 && (
                            <button
                                onClick={exportToCSV}
                                className="bg-secondary hover:bg-secondary/80 text-white px-4 py-2 rounded-lg font-audiowide transition-colors duration-300 flex items-center gap-2"
                            >
                                <Download size={16} />
                                Export CSV
                            </button>
                        )}
                        <button
                            onClick={onClose}
                            className="text-muted-text hover:text-white transition-colors"
                        >
                            <X size={24} />
                        </button>
                    </div>
                </div>

                <div className="flex-1 overflow-hidden">
                    {loading ? (
                        <div className="flex items-center justify-center h-64">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                        </div>
                    ) : error ? (
                        <div className="flex items-center justify-center h-64 text-red-400">
                            {error}
                        </div>
                    ) : participants.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-64 text-muted-text">
                            <Users size={48} className="mb-4 opacity-50" />
                            <p className="font-audiowide text-lg">No participants yet</p>
                            <p className="font-space text-sm">Registrations will appear here once users sign up</p>
                        </div>
                    ) : (
                        <div className="bg-background-soft border border-border rounded-xl overflow-hidden">
                            <div className="p-4 border-b border-border bg-background">
                                <div className="flex justify-between items-center">
                                    <h4 className="font-audiowide text-white">
                                        Total Participants: {participants.length}
                                    </h4>
                                </div>
                            </div>

                            <div className="overflow-y-auto max-h-96 custom-scrollbar">
                                <table className="w-full">
                                    <thead className="bg-background sticky top-0">
                                        <tr>
                                            <th className="text-left p-4 font-audiowide text-sm text-muted-text">#</th>
                                            <th className="text-left p-4 font-audiowide text-sm text-muted-text">Name</th>
                                            <th className="text-left p-4 font-audiowide text-sm text-muted-text">Phone</th>
                                            <th className="text-left p-4 font-audiowide text-sm text-muted-text">Roll No</th>
                                            <th className="text-left p-4 font-audiowide text-sm text-muted-text">College</th>
                                            <th className="text-left p-4 font-audiowide text-sm text-muted-text">Team Members</th>
                                            <th className="text-left p-4 font-audiowide text-sm text-muted-text">Status</th>
                                            {isSuperAdmin && (
                                                <th className="text-left p-4 font-audiowide text-sm text-muted-text">Actions</th>
                                            )}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {participants.map((participant, index) => (
                                            <tr key={participant.id} className="border-t border-border hover:bg-background/50">
                                                <td className="p-4 text-muted-text font-space text-sm">
                                                    {index + 1}
                                                </td>
                                                <td className="p-4">
                                                    <div className="flex items-center gap-2">
                                                        <User size={16} className="text-primary" />
                                                        <span className="text-white font-space">{participant.name || 'N/A'}</span>
                                                    </div>
                                                </td>
                                                <td className="p-4">
                                                    <span className="text-white font-space text-sm">{participant.phone || '-'}</span>
                                                </td>
                                                <td className="p-4">
                                                    <span className="text-white font-space text-sm">{participant.rollNo || '-'}</span>
                                                </td>
                                                <td className="p-4">
                                                    <span className="text-white font-space text-sm">{participant.college || '-'}</span>
                                                </td>
                                                <td className="p-4">
                                                    {participant.teamMembers && participant.teamMembers.length > 0 ? (
                                                        <div className="flex flex-col gap-1">
                                                            {participant.teamMembers.map((member, idx) => (
                                                                <div key={idx} className="flex items-center gap-1">
                                                                    <UserCheck size={12} className="text-accent" />
                                                                    <span className="text-muted-text font-space text-xs">{member}</span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    ) : (
                                                        <span className="text-muted-text font-space text-xs italic">Individual</span>
                                                    )}
                                                </td>
                                                <td className="p-4">
                                                    <span className={`px-2 py-1 rounded-full text-xs font-audiowide ${
                                                        participant.status === 'confirmed' || participant.paymentStatus === 'paid'
                                                            ? 'bg-green-500/20 text-green-500'
                                                            : 'bg-yellow-500/20 text-yellow-500'
                                                    }`}>
                                                        {participant.status === 'confirmed' || participant.paymentStatus === 'paid' ? 'Confirmed' : 'Pending'}
                                                    </span>
                                                </td>
                                                {isSuperAdmin && (
                                                    <td className="p-4">
                                                        <div className="flex items-center gap-2">
                                                            <button
                                                                className="text-muted-text hover:text-white"
                                                                onClick={() => setEditingParticipant({ ...participant })}
                                                                title="Edit"
                                                            >
                                                                <Edit2 size={16} />
                                                            </button>
                                                            <button
                                                                className="text-red-500 hover:text-red-400"
                                                                onClick={() => setDeleteConfirm(participant)}
                                                                title="Delete"
                                                            >
                                                                <Trash2 size={16} />
                                                            </button>
                                                        </div>
                                                    </td>
                                                )}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>

                <div className="mt-6 flex justify-end">
                    <button
                        onClick={onClose}
                        className="bg-background-soft border border-border text-white px-6 py-2 rounded-lg font-audiowide hover:bg-background transition-colors duration-300"
                    >
                        Close
                    </button>
                </div>

                {/* Edit Modal */}
                {editingParticipant && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setEditingParticipant(null)}>
                        <div className="bg-background border border-border rounded-xl p-6 max-w-md w-full" onClick={(e) => e.stopPropagation()}>
                            <h3 className="font-audiowide text-xl text-white mb-4">Edit Participant</h3>
                            <div className="space-y-3">
                                <input
                                    className="w-full bg-background-soft border border-border text-white px-3 py-2 rounded"
                                    placeholder="Name"
                                    value={editingParticipant.name || ''}
                                    onChange={(e) => setEditingParticipant({ ...editingParticipant, name: e.target.value })}
                                />
                                <input
                                    className="w-full bg-background-soft border border-border text-white px-3 py-2 rounded"
                                    placeholder="Email"
                                    value={editingParticipant.email || ''}
                                    onChange={(e) => setEditingParticipant({ ...editingParticipant, email: e.target.value })}
                                />
                                <input
                                    className="w-full bg-background-soft border border-border text-white px-3 py-2 rounded"
                                    placeholder="Roll No"
                                    value={editingParticipant.rollNo || ''}
                                    onChange={(e) => setEditingParticipant({ ...editingParticipant, rollNo: e.target.value })}
                                />
                                <input
                                    className="w-full bg-background-soft border border-border text-white px-3 py-2 rounded"
                                    placeholder="College"
                                    value={editingParticipant.college || ''}
                                    onChange={(e) => setEditingParticipant({ ...editingParticipant, college: e.target.value })}
                                />
                                <textarea
                                    className="w-full bg-background-soft border border-border text-white px-3 py-2 rounded"
                                    placeholder="Team members (comma separated)"
                                    value={(editingParticipant.teamMembers || []).join(', ')}
                                    onChange={(e) => setEditingParticipant({ ...editingParticipant, teamMembers: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })}
                                />
                                <div className="flex gap-3 pt-2">
                                    <button
                                        onClick={submitEdit}
                                        disabled={saving}
                                        className="flex-1 bg-gradient-to-r from-primary to-secondary text-white px-4 py-2 rounded-lg font-audiowide hover:from-hover-primary hover:to-primary disabled:opacity-50"
                                    >
                                        {saving ? 'Saving...' : 'Save'}
                                    </button>
                                    <button
                                        onClick={() => setEditingParticipant(null)}
                                        className="flex-1 bg-background-soft border border-border text-white px-4 py-2 rounded-lg font-audiowide hover:bg-background"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Delete Confirm */}
                {deleteConfirm && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setDeleteConfirm(null)}>
                        <div className="bg-background border border-border rounded-xl p-6 max-w-sm w-full" onClick={(e) => e.stopPropagation()}>
                            <h3 className="font-audiowide text-xl text-white mb-3">Delete Participant</h3>
                            <p className="text-muted-text font-space mb-5">Are you sure you want to remove {deleteConfirm.name || 'this user'}?</p>
                            <div className="flex gap-3">
                                <button
                                    onClick={confirmDelete}
                                    disabled={deleting}
                                    className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg font-audiowide hover:bg-red-500 disabled:opacity-50"
                                >
                                    {deleting ? 'Deleting...' : 'Delete'}
                                </button>
                                <button
                                    onClick={() => setDeleteConfirm(null)}
                                    className="flex-1 bg-background-soft border border-border text-white px-4 py-2 rounded-lg font-audiowide hover:bg-background"
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
}
