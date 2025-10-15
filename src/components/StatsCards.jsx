'use client';

import { Calendar, Users, Eye } from 'lucide-react';

export default function StatsCards({ events }) {
    const totalEvents = events.length;
    const totalParticipants = events.reduce((sum, event) => sum + (event.participationCount || 0), 0);
    const activeEvents = events.filter(event => new Date(event.date) > new Date()).length;

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-background-soft border border-border rounded-xl p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-muted-text font-space text-sm">Total Events</p>
                        <p className="text-3xl font-audiowide text-white">{totalEvents}</p>
                    </div>
                    <Calendar className="text-primary" size={32} />
                </div>
            </div>

            <div className="bg-background-soft border border-border rounded-xl p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-muted-text font-space text-sm">Total Participants</p>
                        <p className="text-3xl font-audiowide text-white">{totalParticipants}</p>
                    </div>
                    <Users className="text-secondary" size={32} />
                </div>
            </div>

            <div className="bg-background-soft border border-border rounded-xl p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-muted-text font-space text-sm">Active Events</p>
                        <p className="text-3xl font-audiowide text-white">{activeEvents}</p>
                    </div>
                    <Eye className="text-accent" size={32} />
                </div>
            </div>
        </div>
    );
}
