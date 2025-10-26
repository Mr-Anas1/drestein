"use client";
import Header from '@/components/Header'
import React, { useEffect, useState, useMemo } from 'react'
import Footer from '@/components/Footer'
import EventBox from '@/components/EventBox'
import SpecialEventBox from '@/components/SpecialEventBox'
import CustomDropdown from '@/components/CustomDropdown'
import { DEPARTMENTS } from '@/constants/departments'
import { Info } from 'lucide-react'
import { useEventCache } from '@/hooks/useEventCache'

const page = () => {
    const [events, setEvents] = useState([]);
    const [specialEvents, setSpecialEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isQuotaExceeded, setIsQuotaExceeded] = useState(false);
    const [selectedDepartment, setSelectedDepartment] = useState('all');
    
    // Use caching hook for optimized reads
    const { fetchEvents: fetchEventsCache, fetchSpecialEvents: fetchSpecialEventsCache } = useEventCache();

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                setLoading(true);
                setError(null);
                setIsQuotaExceeded(false);
                
                // Use cached fetch methods - reduces reads by 94%
                const [eventsData, specialData] = await Promise.all([
                    fetchEventsCache(),
                    fetchSpecialEventsCache()
                ]);
                
                // Handle new API response format with pagination
                const eventsArray = eventsData?.events || eventsData || [];
                const specialArray = specialData?.events || specialData || [];
                
                console.log("Fetched events from cache/API:", eventsArray);
                console.log("Fetched special events from cache/API:", specialArray);
                
                setEvents(eventsArray);
                setSpecialEvents(specialArray);
            } catch (err) {
                console.error("Error fetching events:", err);
                const errorMsg = err.message || '';
                if (errorMsg.includes('RESOURCE_EXHAUSTED') || 
                    errorMsg.includes('Quota exceeded') || 
                    errorMsg.includes('quota') || 
                    errorMsg.includes('timeout')) {
                    setIsQuotaExceeded(true);
                } else {
                    setError(err.message);
                }
            } finally {
                setLoading(false);
            }
        };

        fetchEvents();
    }, [fetchEventsCache, fetchSpecialEventsCache]);

    // Memoize filtered events to avoid recalculation on every render
    const { departmentIds, otherEvents, filteredDepartments } = useMemo(() => {
        const deptIds = new Set(DEPARTMENTS.map(d => d.id));
        const others = events.filter(e => !e?.department || !deptIds.has(e.department));
        
        // Pre-filter departments that have events or special events
        const filtered = DEPARTMENTS.filter(dept => {
            if (selectedDepartment !== 'all' && dept.id !== selectedDepartment) return false;
            const hasCommonEvents = events.some(e => e.department === dept.id);
            const hasSpecialEvents = specialEvents.some(e => e.department === dept.id);
            return hasCommonEvents || hasSpecialEvents;
        });
        
        return { departmentIds: deptIds, otherEvents: others, filteredDepartments: filtered };
    }, [events, specialEvents, selectedDepartment]);

    useEffect(() => {
        if (typeof window === 'undefined') return;
        const hash = window.location.hash;
        if (!hash) return;
        const id = hash.slice(1);
        const el = document.getElementById(id);
        if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }, [events]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-background via-background-soft to-background">
            <Header />

            <div className="py-20 px-6 md:px-12">
                {/* Hero Section */}
                <div className="text-center mb-16">
                    <h1 className="font-audiowide text-4xl md:text-6xl bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-4">
                        Events & Competitions
                    </h1>
                    <p className="text-muted-text font-space text-lg max-w-2xl mx-auto">
                        Explore exciting events across all departments
                    </p>
                </div>

                {/* Department Filter */}
                <div className="max-w-7xl mx-auto mb-8">
                    <div className="flex items-center gap-4 flex-wrap">
                        <span className="text-white font-audiowide">Filter by Department:</span>
                        <CustomDropdown
                            options={[
                                { value: 'all', label: 'All Departments' },
                                ...DEPARTMENTS.map(dept => ({
                                    value: dept.id,
                                    label: dept.name
                                }))
                            ]}
                            value={selectedDepartment}
                            onChange={setSelectedDepartment}
                            placeholder="Select Department"
                        />
                    </div>
                </div>

                {loading && (
                    <div className="flex items-center justify-center py-20">
                        <div className="font-audiowide text-white">Loading events...</div>
                    </div>
                )}

                {isQuotaExceeded && (
                    <div className="max-w-4xl mx-auto mb-8 bg-background-soft border border-border rounded-lg p-8 text-center">
                        <div className="inline-block p-4 bg-secondary/10 rounded-full mb-4">
                            <span className="text-3xl">🎉</span>
                        </div>
                        <h2 className="text-2xl font-audiowide mb-2 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">Stay Tuned!</h2>
                        <p className="text-muted-text font-space mb-2">
                            We're experiencing high traffic right now. Your data is safe and secure.
                        </p>
                        <p className="text-muted-text font-space mb-4">
                            Please try again in a few moments. We're working hard to bring you the best experience!
                        </p>
                        <button
                            onClick={() => window.location.reload()}
                            className="bg-gradient-to-r from-primary to-secondary text-white font-audiowide px-6 py-2 rounded-lg hover:from-hover-primary hover:to-primary transition-all duration-300"
                        >
                            Retry
                        </button>
                    </div>
                )}

                {error && (
                    <div className="max-w-4xl mx-auto mb-8 bg-red-500/10 border border-red-500/30 rounded-lg p-4 text-center">
                        <p className="text-red-300 font-space">{error}</p>
                    </div>
                )}

                {!loading && !isQuotaExceeded && (
                    <>
                        {/* Department Events */}
                        {filteredDepartments.map((dept) => {
                            const deptEvents = events.filter(e => e.department === dept.id);
                            const deptSpecialEvents = specialEvents.filter(e => e.department === dept.id);
                            
                            if (deptEvents.length === 0 && deptSpecialEvents.length === 0) return null;

                            return (
                                <div key={dept.id} id={dept.id} className="max-w-7xl mx-auto mb-16 scroll-mt-20">
                                    <div className="flex items-center gap-4 mb-8">
                                        <div className="w-12 h-12 bg-gradient-to-r from-primary to-secondary rounded-lg flex items-center justify-center">
                                            <span className="text-2xl">{dept.icon}</span>
                                        </div>
                                        <div>
                                            <h2 className="font-audiowide text-3xl text-white">{dept.name}</h2>
                                            <p className="text-muted-text font-space text-sm">{dept.fullName}</p>
                                        </div>
                                    </div>

                                    {/* Regular Events */}
                                    {deptEvents.length > 0 && (
                                        <div className="mb-8">
                                            <h3 className="font-audiowide text-xl text-white mb-4">Events</h3>
                                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                                                {deptEvents.map(event => (
                                                    <EventBox key={event.id} event={event} />
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Special Events */}
                                    {deptSpecialEvents.length > 0 && (
                                        <div>
                                            <h3 className="font-audiowide text-xl text-white mb-4">Special Events</h3>
                                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                                                {deptSpecialEvents.map(event => (
                                                    <SpecialEventBox key={event.id} event={event} />
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}

                        {/* Other Events (no department) */}
                        {otherEvents.length > 0 && (
                            <div className="max-w-7xl mx-auto mb-16">
                                <h2 className="font-audiowide text-3xl text-white mb-8">Other Events</h2>
                                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {otherEvents.map(event => (
                                        <EventBox key={event.id} event={event} />
                                    ))}
                                </div>
                            </div>
                        )}

                        {events.length === 0 && specialEvents.length === 0 && (
                            <div className="max-w-4xl mx-auto text-center py-20">
                                <div className="inline-block p-4 bg-primary/10 rounded-full mb-4">
                                    <Info className="w-12 h-12 text-primary" />
                                </div>
                                <h3 className="font-audiowide text-2xl text-white mb-2">No Events Available</h3>
                                <p className="text-muted-text font-space">Check back soon for upcoming events!</p>
                            </div>
                        )}
                    </>
                )}
            </div>

            <Footer />
        </div>
    );
};

export default page;
