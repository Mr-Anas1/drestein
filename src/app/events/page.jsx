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
                // Check if it's a quota exceeded error or timeout (likely quota issue)
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
            <div className='py-20 px-6 md:px-12 max-w-12xl mx-auto '>
                <h1 className="font-audiowide text-4xl md:text-6xl lg:text-7xl bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-6 text-center">
                    Events
                </h1>

                <p className='text-muted-text text-center font-space text-lg mb-8'>Discover all the Events and Workshops</p>

                {/* Department Filter Dropdown */}
                <div className="flex justify-center mb-8">
                    <CustomDropdown
                        value={selectedDepartment}
                        onChange={setSelectedDepartment}
                        options={[
                            { id: 'all', name: 'All Departments', short: 'ALL' },
                            ...DEPARTMENTS
                        ]}
                        placeholder="Select Department"
                    />
                </div>

                {/* Info Box for Events */}
                <div className="max-w-4xl mx-auto mb-12 bg-gradient-to-r from-primary/10 via-secondary/10 to-primary/10 border-2 border-primary/30 rounded-2xl p-6 backdrop-blur-sm">
                    <div className="flex items-start gap-4">
                        <div className="flex-shrink-0 mt-1">
                            <div className="bg-primary/20 p-3 rounded-full">
                                <Info className="w-6 h-6 text-primary" />
                            </div>
                        </div>
                        <div className="flex-1">
                            <h3 className="font-audiowide text-xl text-white mb-3 flex items-center gap-2">
                                🎫 Events Overview
                            </h3>
                            <p className="text-muted-text font-space leading-relaxed mb-3 text-md md:text-lg">
                                This page features two types of events:
                            </p>
                            <div className="space-y-2 text-sm">
                                <p className="text-muted-text text-lg font-space leading-relaxed">
                                    <span className="text-primary font-semibold">Common Events:</span> Included in the <span className="text-primary font-semibold">Common Pass (₹300)</span> • Valid for Nov 7-8, 2025
                                </p>
                                <p className="text-muted-text font-space leading-relaxed text-md md:text-lg">
                                    <span className="text-secondary font-semibold">Premium Events:</span> Individual pricing • Add to cart and purchase separately
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {loading && (
                    <div className="flex justify-center items-center py-20">
                        <div className="text-primary text-lg">Loading events...</div>
                    </div>
                )}

                {isQuotaExceeded && (
                    <div className="max-w-2xl mx-auto bg-background-soft border border-border rounded-2xl p-12 text-center">
                        <div className="inline-block p-6 bg-secondary/10 rounded-full mb-6">
                            <span className="text-5xl">🎉</span>
                        </div>
                        <h2 className="text-3xl font-audiowide mb-4 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">Stay Tuned!</h2>
                        <p className="text-muted-text font-space mb-4 text-lg">
                            We're experiencing high traffic right now. Events are loading soon!
                        </p>
                        <p className="text-muted-text font-space mb-8">
                            Please try again in a few moments. We're working hard to bring you the best experience!
                        </p>
                        <button
                            onClick={() => window.location.reload()}
                            className="bg-gradient-to-r from-primary to-secondary text-white font-audiowide px-8 py-3 rounded-lg hover:from-hover-primary hover:to-primary transition-all duration-300"
                        >
                            Retry
                        </button>
                    </div>
                )}

                {error && (
                    <div className="flex justify-center items-center py-20">
                        <div className="text-red-500 text-lg">Error: {error}</div>
                    </div>
                )}

                {!loading && !error && !isQuotaExceeded && (
                    <div className="w-full pt-10 space-y-16">
                        {filteredDepartments.map((dept) => {
                            const deptCommonEvents = events.filter(e => e.department === dept.id);
                            const deptSpecialEvents = specialEvents.filter(e => e.department === dept.id);
                            return (
                                <section key={dept.id} id={`dept-${dept.id}`} className="space-y-6">
                                    {/* Department Header */}
                                    <div className="text-center md:text-left">
                                        <h2 className="font-audiowide text-3xl md:text-4xl bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-2">
                                            {dept.name}
                                        </h2>
                                        <div className="h-1 w-24 bg-gradient-to-r from-primary to-secondary rounded-full mx-auto md:mx-0"></div>
                                    </div>
                                    
                                    {/* Premium Events - Shown First */}
                                    {deptSpecialEvents.length > 0 && (
                                        <div className="space-y-4">
                                            <h3 className="font-audiowide text-lg text-secondary">Premium Events</h3>
                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 justify-items-center">
                                                {deptSpecialEvents.map((event) => (
                                                    <SpecialEventBox
                                                        key={event.id}
                                                        event={event}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                    
                                    {/* Common Events - Shown Second */}
                                    {deptCommonEvents.length > 0 && (
                                        <div className="space-y-4">
                                            <h3 className="font-audiowide text-lg text-primary">Common Events</h3>
                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 justify-items-center">
                                                {deptCommonEvents.map((event) => (
                                                    <EventBox
                                                        key={event.id}
                                                        img={event.img}
                                                        title={event.title}
                                                        description={event.description}
                                                        link={`/events/${event.id}`}
                                                        id={event.id}
                                                        event={event}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </section>
                            );
                        })}

                        {selectedDepartment === 'all' && otherEvents.length > 0 && (
                            <section key="others" id="dept-others" className="space-y-6">
                                {/* Department Header */}
                                <div className="text-center md:text-left">
                                    <h2 className="font-audiowide text-3xl md:text-4xl bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-2">
                                        Others
                                    </h2>
                                    <div className="h-1 w-24 bg-gradient-to-r from-primary to-secondary rounded-full mx-auto md:mx-0"></div>
                                </div>
                                
                                {/* Events Grid */}
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 justify-items-center">
                                    {otherEvents.map((event) => (
                                        <EventBox
                                            key={event.id}
                                            img={event.img}
                                            title={event.title}
                                            description={event.description}
                                            link={`/events/${event.id}`}
                                            id={event.id}
                                            event={event}
                                        />
                                    ))}
                                </div>
                            </section>
                        )}
                    </div>
                )}

            </div>

            <Footer />
        </div>
    )
}

export default page