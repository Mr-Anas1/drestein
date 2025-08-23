'use client';

import { useState, useEffect } from 'react';
import { X, Users, Mail, User, Calendar, Download } from 'lucide-react';

export default function ParticipantListModal({ event, onClose }) {
    const [participants, setParticipants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchParticipants();
    }, [event.id]);

    const fetchParticipants = async () => {
        try {
            setLoading(true);
            const response = await fetch(`/api/registrations?eventId=${event.id}`);
            const data = await response.json();

            if (response.ok) {
                setParticipants(data.participants || []);
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

        const headers = ['Name', 'Email', 'Registration Date'];
        const csvContent = [
            headers.join(','),
            ...participants.map(p => [
                `"${p.name}"`,
                `"${p.email}"`,
                `"${new Date(p.registeredAt.seconds * 1000).toLocaleString()}"`
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

    const formatDate = (timestamp) => {
        if (!timestamp) return 'N/A';
        
        // Handle Firestore timestamp
        const date = timestamp.seconds 
            ? new Date(timestamp.seconds * 1000)
            : new Date(timestamp);
            
        return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
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
                                            <th className="text-left p-4 font-audiowide text-sm text-muted-text">Email</th>
                                            <th className="text-left p-4 font-audiowide text-sm text-muted-text">Registration Date</th>
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
                                                        <span className="text-white font-space">{participant.name}</span>
                                                    </div>
                                                </td>
                                                <td className="p-4">
                                                    <div className="flex items-center gap-2">
                                                        <Mail size={16} className="text-secondary" />
                                                        <span className="text-white font-space">{participant.email}</span>
                                                    </div>
                                                </td>
                                                <td className="p-4">
                                                    <div className="flex items-center gap-2">
                                                        <Calendar size={16} className="text-accent" />
                                                        <span className="text-muted-text font-space text-sm">
                                                            {formatDate(participant.registeredAt)}
                                                        </span>
                                                    </div>
                                                </td>
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
            </div>
        </div>
    );
}
