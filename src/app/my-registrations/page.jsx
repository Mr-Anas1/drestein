'use client';

import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function MyRegistrationsPage() {
    const { isAuthenticated, user, studentProfile, loginWithGoogleStudent, loading: authLoading } = useAuth();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [registrations, setRegistrations] = useState([]);
    const [eventsMap, setEventsMap] = useState({});
    const [specialEventsMap, setSpecialEventsMap] = useState({});

    const uid = useMemo(() => studentProfile?.uid || user?.uid || null, [studentProfile, user]);

    useEffect(() => {
        const run = async () => {
            if (authLoading) return; // wait for auth
            if (!isAuthenticated || !uid) {
                setLoading(false);
                return;
            }
            setLoading(true);
            setError('');
            try {
                // Fetch registrations for this user
                const regRes = await fetch(`/api/registrations?userUid=${encodeURIComponent(uid)}`);
                if (!regRes.ok) throw new Error('Failed to fetch registrations');
                const regData = await regRes.json();
                const regs = regData.participants || [];
                setRegistrations(regs);

                // Fetch all events once to map titles (simple approach; optimize later if needed)
                const evRes = await fetch('/api/events');
                if (evRes.ok) {
                    const events = await evRes.json();
                    const map = {};
                    for (const ev of events) map[ev.id] = ev;
                    setEventsMap(map);
                }

                // Fetch all special events
                const specialEvRes = await fetch('/api/special-events');
                if (specialEvRes.ok) {
                    const specialEvents = await specialEvRes.json();
                    const specialMap = {};
                    for (const ev of specialEvents) specialMap[ev.id] = ev;
                    setSpecialEventsMap(specialMap);
                }
            } catch (e) {
                console.error(e);
                setError('Failed to load your registrations. Please try again later.');
            } finally {
                setLoading(false);
            }
        };
        run();
    }, [authLoading, isAuthenticated, uid]);

    if (authLoading || loading) {
        return (
            <div className="min-h-screen bg-background text-white">
                <Header />
                <div className="flex items-center justify-center py-20">
                    <div className="font-audiowide">Loading...</div>
                </div>
                <Footer />
            </div>
        );
    }

    if (!isAuthenticated || !uid) {
        return (
            <div className="min-h-screen bg-background text-white">
                <Header />
                <div className="flex items-center justify-center px-4 py-20">
                    <div className="bg-background-soft border border-border rounded-lg p-8 w-full max-w-lg text-center">
                        <h1 className="text-2xl font-audiowide mb-2">My Registrations</h1>
                        <p className="text-muted-text font-space mb-6">
                            Please sign in with Google to view your registrations.
                        </p>
                        <button
                            onClick={loginWithGoogleStudent}
                            className="bg-primary hover:bg-hover-primary text-white font-audiowide px-6 py-2 rounded-lg"
                        >
                            Continue with Google
                        </button>
                    </div>
                </div>
                <Footer />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background text-white">
            <Header />
            <div className="max-w-4xl mx-auto px-4 py-8">
                <div className="mb-6">
                    <h1 className="text-3xl font-audiowide">My Registrations</h1>
                    <p className="text-sm text-muted-text mt-2">
                        View all your event and workshop registrations here.
                    </p>
                </div>

                <div className="mb-6 p-4 border border-yellow-500/30 bg-yellow-500/10 rounded-lg">
                    <div className="font-audiowide text-yellow-400">Important</div>
                    <div className="text-sm text-yellow-200 mt-1">
                        Registrations are non-cancellable. Once registered, you cannot cancel your participation.
                    </div>
                </div>

                {error && (
                    <div className="mb-4 p-3 border border-red-500/30 bg-red-500/10 text-red-300 rounded-lg text-sm">
                        {error}
                    </div>
                )}

                {registrations.length === 0 ? (
                    <div className="bg-background-soft border border-border rounded-lg p-6 text-center">
                        <div className="font-audiowide text-lg mb-2">No registrations found</div>
                        <div className="text-muted-text text-sm">Explore upcoming events and register to see them here.</div>
                        <div className="mt-4">
                            <Link href="/events" className="bg-primary hover:bg-hover-primary text-white font-audiowide px-5 py-2 rounded-lg inline-block">
                                Browse Events
                            </Link>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {registrations.map((r) => {
                            const isSpecialEvent = r.isSpecialEvent || r.eventType === 'special';
                            const event = isSpecialEvent ? specialEventsMap[r.eventId] : eventsMap[r.eventId];
                            
                            return (
                                <div key={r.id} className={`bg-background-soft border rounded-lg p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 ${
                                    isSpecialEvent ? 'border-secondary' : 'border-border'
                                }`}>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <div className="font-audiowide text-white">
                                                {event?.title || r.eventTitle || 'Event'}
                                            </div>
                                            {isSpecialEvent && (
                                                <span className="bg-secondary/20 text-secondary px-2 py-0.5 rounded text-xs font-audiowide">
                                                    SPECIAL
                                                </span>
                                            )}
                                        </div>
                                        <div className="text-xs text-muted-text mt-1">
                                            {event ? (
                                                <>
                                                    {isSpecialEvent ? (
                                                        <>
                                                            <span className="capitalize">{event.category}</span>
                                                            <span className="mx-2">•</span>
                                                            <span>₹{event.price}</span>
                                                            {event.date && (
                                                                <>
                                                                    <span className="mx-2">•</span>
                                                                    <span>{event.date}</span>
                                                                </>
                                                            )}
                                                            {event.venue && (
                                                                <>
                                                                    <span className="mx-2">•</span>
                                                                    <span>{event.venue}</span>
                                                                </>
                                                            )}
                                                        </>
                                                    ) : (
                                                        <>
                                                            <span>Dept: {event.department}</span>
                                                            <span className="mx-2">•</span>
                                                            <span>{event.date} {event.time}</span>
                                                            <span className="mx-2">•</span>
                                                            <span>{event.venue}</span>
                                                        </>
                                                    )}
                                                </>
                                            ) : (
                                                <span>Event ID: {r.eventId}</span>
                                            )}
                                        </div>
                                        {r.teamMembers && r.teamMembers.length > 0 && (
                                            <div className="text-xs text-muted-text mt-2">
                                                <span className="font-audiowide text-white">Team:</span> {r.teamMembers.join(', ')}
                                            </div>
                                        )}
                                    </div>
                                    <div className="text-right">
                                        <div className="text-xs text-muted-text">Registered on</div>
                                        <div className="text-sm">
                                            {new Date(r.registeredAt).toLocaleString()}
                                        </div>
                                        <div className="mt-1 text-xs">
                                            Status: <span className={
                                                r.status === 'confirmed' || r.paymentVerified || r.paymentStatus === 'paid' 
                                                    ? 'text-green-400' 
                                                    : r.paymentStatus === 'rejected' 
                                                    ? 'text-red-400' 
                                                    : 'text-yellow-300'
                                            }>
                                                {r.status === 'confirmed' || r.paymentVerified || r.paymentStatus === 'paid' 
                                                    ? 'Confirmed' 
                                                    : r.paymentStatus === 'rejected' 
                                                    ? 'Rejected' 
                                                    : 'Pending'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
            <Footer />
        </div>
    );
}
