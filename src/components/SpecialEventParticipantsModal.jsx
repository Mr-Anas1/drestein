'use client';

import { useState, useEffect } from 'react';
import { X, Users, Mail, User, Calendar, Download, UserCheck, Search, Plus, Trash2, Edit2 } from 'lucide-react';
import { getAuth } from 'firebase/auth';

export default function SpecialEventParticipantsModal({ event, onClose }) {
    const [participants, setParticipants] = useState([]);
    const [filteredParticipants, setFilteredParticipants] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showAddModal, setShowAddModal] = useState(false);
    const [deleteConfirm, setDeleteConfirm] = useState(null);
    const [deleting, setDeleting] = useState(false);
    const [editingParticipant, setEditingParticipant] = useState(null);

    useEffect(() => {
        fetchParticipants();
    }, [event.id]);

    const fetchParticipants = async () => {
        try {
            setLoading(true);
            // Fetch registrations where eventId matches and isSpecialEvent is true
            const response = await fetch(`/api/registrations?eventId=${event.id}&isSpecialEvent=true`);
            const data = await response.json();

            if (response.ok) {
                const participantsList = data.participants || [];
                const confirmed = participantsList.filter(p => (p?.status === 'confirmed') || (p?.paymentStatus === 'paid'));
                setParticipants(confirmed);
                setFilteredParticipants(confirmed);
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

    // Search filter effect
    useEffect(() => {
        if (!searchQuery.trim()) {
            setFilteredParticipants(participants);
            return;
        }

        const query = searchQuery.toLowerCase();
        const filtered = participants.filter(p => {
            const name = (p.name || '').toLowerCase();
            const email = (p.email || '').toLowerCase();
            const rollNo = (p.rollNo || '').toLowerCase();
            const college = (p.college || '').toLowerCase();
            const teamMembers = (p.teamMembers || []).join(' ').toLowerCase();

            return name.includes(query) ||
                email.includes(query) ||
                rollNo.includes(query) ||
                college.includes(query) ||
                teamMembers.includes(query);
        });

        setFilteredParticipants(filtered);
    }, [searchQuery, participants]);

    const exportToCSV = () => {
        if (participants.length === 0) return;

        const headers = ['Name', 'Email', 'Roll No', 'College', 'Team Members', 'Status'];
        const csvContent = [
            headers.join(','),
            ...participants.map(p => [
                `"${p.name || 'N/A'}"`,
                `"${p.email || 'N/A'}"`,
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

    const deleteParticipant = async (participantId) => {
        setDeleting(true);
        try {
            const auth = getAuth();
            const token = await auth.currentUser?.getIdToken?.();

            const response = await fetch(`/api/registrations?id=${participantId}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` },
            });

            if (response.ok) {
                setParticipants(participants.filter(p => p.id !== participantId));
                setDeleteConfirm(null);
            } else {
                const data = await response.json();
                alert(data.error || 'Failed to delete participant');
            }
        } catch (err) {
            console.error('Error deleting participant:', err);
            alert('Failed to delete participant');
        } finally {
            setDeleting(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-background border border-border rounded-xl p-6 max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h3 className="font-audiowide text-xl text-white flex items-center gap-2">
                            <Users size={24} className="text-secondary" />
                            Special Event Participants
                        </h3>
                        <p className="text-muted-text font-space text-sm mt-1">{event.title}</p>
                        <p className="text-accent font-space text-xs mt-1">
                            {event.category} • {event.type} • ₹{event.price}
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setShowAddModal(true)}
                            className="bg-primary hover:bg-primary/80 text-white px-4 py-2 rounded-lg font-audiowide transition-colors duration-300 flex items-center gap-2"
                        >
                            <Plus size={16} />
                            Add
                        </button>
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
                            <p className="font-space text-sm">Registrations will appear here once users purchase this event</p>
                        </div>
                    ) : (
                        <div className="bg-background-soft border border-border rounded-xl overflow-hidden">
                            <div className="p-4 border-b border-border bg-background">
                                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                    <div>
                                        <h4 className="font-audiowide text-white">
                                            Total Participants: {participants.length}
                                        </h4>
                                        {searchQuery && (
                                            <p className="text-sm text-muted-text font-space mt-1">
                                                Showing {filteredParticipants.length} of {participants.length} results
                                            </p>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-4 text-sm">
                                        <span className="text-muted-text font-space">
                                            Revenue: <span className="text-secondary font-audiowide">₹{participants.length * event.price}</span>
                                        </span>
                                    </div>
                                </div>

                                {/* Search Bar */}
                                <div className="mt-4">
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-text" size={20} />
                                        <input
                                            type="text"
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            placeholder="Search by name, roll no, college, or team member..."
                                            className="w-full bg-background border border-border rounded-lg pl-10 pr-4 py-2 text-white font-space placeholder:text-muted-text focus:outline-none focus:border-primary transition-colors"
                                        />
                                        {searchQuery && (
                                            <button
                                                onClick={() => setSearchQuery('')}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-text hover:text-white"
                                            >
                                                <X size={16} />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="overflow-y-auto max-h-[50vh] custom-scrollbar">
                                <table className="w-full">
                                    <thead className="bg-background sticky top-0">
                                        <tr>
                                            <th className="text-left p-4 font-audiowide text-sm text-muted-text">#</th>
                                            <th className="text-left p-4 font-audiowide text-sm text-muted-text">Name</th>
                                            <th className="text-left p-4 font-audiowide text-sm text-muted-text">Roll No</th>
                                            <th className="text-left p-4 font-audiowide text-sm text-muted-text">College</th>
                                            <th className="text-left p-4 font-audiowide text-sm text-muted-text">Team Members</th>
                                            <th className="text-left p-4 font-audiowide text-sm text-muted-text">Status</th>
                                            <th className="text-left p-4 font-audiowide text-sm text-muted-text">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredParticipants.length === 0 ? (
                                            <tr>
                                                <td colSpan="7" className="p-8 text-center">
                                                    <div className="flex flex-col items-center text-muted-text">
                                                        <Search size={48} className="mb-4 opacity-50" />
                                                        <p className="font-audiowide text-lg">No results found</p>
                                                        <p className="font-space text-sm">Try a different search term</p>
                                                    </div>
                                                </td>
                                            </tr>
                                        ) : (
                                            filteredParticipants.map((participant, index) => (
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
                                                        <span className={`px-2 py-1 rounded-full text-xs font-audiowide ${participant.status === 'confirmed' || participant.paymentStatus === 'paid'
                                                            ? 'bg-green-500/20 text-green-500'
                                                            : 'bg-yellow-500/20 text-yellow-500'
                                                            }`}>
                                                            {participant.status === 'confirmed' || participant.paymentStatus === 'paid' ? 'Confirmed' : 'Pending'}
                                                        </span>
                                                    </td>
                                                    <td className="p-4">
                                                        <div className="flex gap-2">
                                                            <button
                                                                onClick={() => setEditingParticipant(participant)}
                                                                className="text-blue-500 hover:text-blue-400 transition-colors"
                                                                title="Edit"
                                                            >
                                                                <Edit2 size={16} />
                                                            </button>
                                                            <button
                                                                onClick={() => setDeleteConfirm(participant)}
                                                                className="text-red-500 hover:text-red-400 transition-colors"
                                                                title="Delete"
                                                            >
                                                                <Trash2 size={16} />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            )))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>

                {/* <div className="mt-6 flex justify-end">
                    <button
                        onClick={onClose}
                        className="bg-background-soft border border-border text-white px-6 py-2 rounded-lg font-audiowide hover:bg-background transition-colors duration-300"
                    >
                        Close
                    </button>
                </div> */}

                {/* Delete Confirmation Modal */}
                {deleteConfirm && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4" onClick={() => setDeleteConfirm(null)}>
                        <div className="bg-background border border-border rounded-xl p-6 max-w-md w-full" onClick={(e) => e.stopPropagation()}>
                            <h3 className="font-audiowide text-xl text-white mb-4">Confirm Delete</h3>
                            <p className="text-muted-text font-space mb-6">
                                Are you sure you want to delete "{deleteConfirm.name}" from this event? This action cannot be undone.
                            </p>
                            <div className="flex gap-4">
                                <button
                                    onClick={() => deleteParticipant(deleteConfirm.id)}
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

                {/* Add Participant Modal */}
                {showAddModal && (
                    <AddParticipantModal
                        event={event}
                        onClose={() => setShowAddModal(false)}
                        onAdded={async () => {
                            setShowAddModal(false);
                            // Small delay to ensure backend has processed the addition
                            await new Promise(resolve => setTimeout(resolve, 500));
                            await fetchParticipants();
                        }}
                    />
                )}

                {/* Edit Participant Modal */}
                {editingParticipant && (
                    <EditParticipantModal
                        participant={editingParticipant}
                        onClose={() => setEditingParticipant(null)}
                        onUpdated={async () => {
                            setEditingParticipant(null);
                            await new Promise(resolve => setTimeout(resolve, 500));
                            await fetchParticipants();
                        }}
                    />
                )}
            </div>
        </div>
    );
}

// Add Participant Modal Component
function AddParticipantModal({ event, onClose, onAdded }) {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        rollNo: '',
        college: '',
        teamMembers: '',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.name || !formData.email) {
            setError('Name and email are required');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const auth = getAuth();
            const token = await auth.currentUser?.getIdToken?.();
            const adminUid = auth.currentUser?.uid;

            const response = await fetch('/api/registrations', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    eventId: event.id,
                    name: formData.name,
                    email: formData.email,
                    userUid: adminUid,
                    isSpecialEvent: true,
                    isAdminAdding: true,
                    rollNo: formData.rollNo || undefined,
                    college: formData.college || undefined,
                    teamMembers: formData.teamMembers ? formData.teamMembers.split(',').map(m => m.trim()) : undefined,
                }),
            });

            if (response.ok) {
                const data = await response.json();
                console.log('Participant added successfully:', data);
                onAdded();
            } else {
                const data = await response.json();
                console.error('Failed to add participant:', data);
                setError(data.error || 'Failed to add participant');
            }
        } catch (err) {
            console.error('Error adding participant:', err);
            setError('Failed to add participant');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4" onClick={onClose}>
            <div className="bg-background border border-border rounded-xl p-6 max-w-md w-full" onClick={(e) => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-6">
                    <h3 className="font-audiowide text-xl text-white">Add Participant</h3>
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
                    <div>
                        <label className="block text-white font-audiowide text-sm mb-2">Name *</label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="w-full bg-background-soft border border-border text-white px-4 py-2 rounded-lg font-space focus:outline-none focus:border-primary"
                            disabled={loading}
                        />
                    </div>

                    <div>
                        <label className="block text-white font-audiowide text-sm mb-2">Email *</label>
                        <input
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            className="w-full bg-background-soft border border-border text-white px-4 py-2 rounded-lg font-space focus:outline-none focus:border-primary"
                            disabled={loading}
                        />
                    </div>

                    <div>
                        <label className="block text-white font-audiowide text-sm mb-2">Roll No</label>
                        <input
                            type="text"
                            value={formData.rollNo}
                            onChange={(e) => setFormData({ ...formData, rollNo: e.target.value })}
                            className="w-full bg-background-soft border border-border text-white px-4 py-2 rounded-lg font-space focus:outline-none focus:border-primary"
                            disabled={loading}
                        />
                    </div>

                    <div>
                        <label className="block text-white font-audiowide text-sm mb-2">College</label>
                        <input
                            type="text"
                            value={formData.college}
                            onChange={(e) => setFormData({ ...formData, college: e.target.value })}
                            className="w-full bg-background-soft border border-border text-white px-4 py-2 rounded-lg font-space focus:outline-none focus:border-primary"
                            disabled={loading}
                        />
                    </div>

                    <div>
                        <label className="block text-white font-audiowide text-sm mb-2">Team Members (comma-separated)</label>
                        <input
                            type="text"
                            value={formData.teamMembers}
                            onChange={(e) => setFormData({ ...formData, teamMembers: e.target.value })}
                            placeholder="Member1, Member2, Member3"
                            className="w-full bg-background-soft border border-border text-white px-4 py-2 rounded-lg font-space focus:outline-none focus:border-primary"
                            disabled={loading}
                        />
                    </div>

                    <div className="flex gap-4 pt-4">
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 bg-gradient-to-r from-primary to-secondary text-white px-4 py-2 rounded-lg font-audiowide hover:from-hover-primary hover:to-primary transition-all disabled:opacity-50"
                        >
                            {loading ? 'Adding...' : 'Add Participant'}
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

// Edit Participant Modal Component
function EditParticipantModal({ participant, onClose, onUpdated }) {
    const [formData, setFormData] = useState({
        name: participant.name || '',
        email: participant.email || '',
        rollNo: participant.rollNo || '',
        college: participant.college || '',
        teamMembers: participant.teamMembers ? participant.teamMembers.join(', ') : '',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.name || !formData.email) {
            setError('Name and email are required');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const auth = getAuth();
            const token = await auth.currentUser?.getIdToken?.();

            const response = await fetch(`/api/registrations/${participant.id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    name: formData.name,
                    email: formData.email,
                    rollNo: formData.rollNo || undefined,
                    college: formData.college || undefined,
                    teamMembers: formData.teamMembers ? formData.teamMembers.split(',').map(m => m.trim()) : undefined,
                }),
            });

            if (response.ok) {
                try {
                    const data = await response.json();
                    console.log('Participant updated successfully:', data);
                    onUpdated();
                } catch (parseErr) {
                    console.error('Error parsing response:', parseErr);
                    console.log('Response status:', response.status);
                    console.log('Response text:', await response.text());
                    setError('Failed to parse server response');
                }
            } else {
                try {
                    const data = await response.json();
                    console.error('Failed to update participant:', data);
                    setError(data.error || 'Failed to update participant');
                } catch (parseErr) {
                    console.error('Error parsing error response:', parseErr);
                    setError('Server error - please try again');
                }
            }
        } catch (err) {
            console.error('Error updating participant:', err);
            setError('Failed to update participant');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4" onClick={onClose}>
            <div className="bg-background border border-border rounded-xl p-6 max-w-md w-full" onClick={(e) => e.stopPropagation()}>
                <h3 className="font-audiowide text-xl text-white mb-4">Edit Participant</h3>

                {error && (
                    <div className="bg-red-500/20 border border-red-500 text-red-200 px-4 py-2 rounded-lg mb-4 text-sm font-space">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-white font-audiowide text-sm mb-2">Name *</label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            placeholder="Participant name"
                            className="w-full bg-background-soft border border-border text-white px-4 py-2 rounded-lg font-space focus:outline-none focus:border-primary"
                            disabled={loading}
                        />
                    </div>

                    <div>
                        <label className="block text-white font-audiowide text-sm mb-2">Email *</label>
                        <input
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            placeholder="participant@example.com"
                            className="w-full bg-background-soft border border-border text-white px-4 py-2 rounded-lg font-space focus:outline-none focus:border-primary"
                            disabled={loading}
                        />
                    </div>

                    <div>
                        <label className="block text-white font-audiowide text-sm mb-2">Roll No</label>
                        <input
                            type="text"
                            value={formData.rollNo}
                            onChange={(e) => setFormData({ ...formData, rollNo: e.target.value })}
                            placeholder="Roll number"
                            className="w-full bg-background-soft border border-border text-white px-4 py-2 rounded-lg font-space focus:outline-none focus:border-primary"
                            disabled={loading}
                        />
                    </div>

                    <div>
                        <label className="block text-white font-audiowide text-sm mb-2">College</label>
                        <input
                            type="text"
                            value={formData.college}
                            onChange={(e) => setFormData({ ...formData, college: e.target.value })}
                            placeholder="College name"
                            className="w-full bg-background-soft border border-border text-white px-4 py-2 rounded-lg font-space focus:outline-none focus:border-primary"
                            disabled={loading}
                        />
                    </div>

                    <div>
                        <label className="block text-white font-audiowide text-sm mb-2">Team Members (comma-separated)</label>
                        <input
                            type="text"
                            value={formData.teamMembers}
                            onChange={(e) => setFormData({ ...formData, teamMembers: e.target.value })}
                            placeholder="Member1, Member2, Member3"
                            className="w-full bg-background-soft border border-border text-white px-4 py-2 rounded-lg font-space focus:outline-none focus:border-primary"
                            disabled={loading}
                        />
                    </div>

                    <div className="flex gap-4 pt-4">
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 bg-gradient-to-r from-primary to-secondary text-white px-4 py-2 rounded-lg font-audiowide hover:from-hover-primary hover:to-primary transition-all disabled:opacity-50"
                        >
                            {loading ? 'Updating...' : 'Update Participant'}
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
