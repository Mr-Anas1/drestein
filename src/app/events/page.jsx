"use client";
import Header from '@/components/Header'
import React, { useEffect, useState, useMemo } from 'react'
import Footer from '@/components/Footer'
import EventBox from '@/components/EventBox'
import SpecialEventBox from '@/components/SpecialEventBox'
import CustomDropdown from '@/components/CustomDropdown'
import { DEPARTMENTS } from '@/constants/departments'
import { Info } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'

const page = () => {
    const { studentProfile } = useAuth();
    const [events, setEvents] = useState([]);
    const [specialEvents, setSpecialEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isQuotaExceeded, setIsQuotaExceeded] = useState(false);
    const [selectedDepartment, setSelectedDepartment] = useState('all');

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                setLoading(true);
                setError(null);
                setIsQuotaExceeded(false);
                
                // Simple direct API calls without pagination/caching
                const [eventsRes, specialEventsRes] = await Promise.all([
                    fetch('/api/events'),
                    fetch('/api/special-events')
                ]);
                
                if (!eventsRes.ok || !specialEventsRes.ok) {
                    throw new Error('Failed to fetch events');
                }
                
                const eventsData = await eventsRes.json();
                const specialEventsData = await specialEventsRes.json();
                
                // Get all events (both common and premium)
                const allEvents = eventsData?.events || eventsData || [];
                const specialArray = specialEventsData?.events || specialEventsData || [];
                
                // Separate common events (non-premium). Do not rely on category filter.
                const commonEvents = allEvents.filter(event => !event.isPremium);
                
                console.log('[EVENTS DEBUG] Total events fetched:', allEvents.length);
                console.log('[EVENTS DEBUG] Common events (non-premium):', commonEvents.length);
                console.log('[EVENTS DEBUG] Sample event:', allEvents[0]);
                
                // For the events page, we'll show common events
                // and use premium events for department filtering
                const eventsArray = [...commonEvents];
                
                // Normalize department ids to canonical DEPARTMENTS ids
                const normalizeDept = (val) => {
                    const raw = String(val || '').trim();
                    if (!raw) return raw;
                    const upper = raw.toUpperCase();
                    const alias = {
                        CYB: 'CSE-CYB',
                        IOT: 'CSE-IOT',
                        MED: 'MED-ELE',
                        BME: 'BIO-MED',
                        OTH: 'OTHERS',
                        SH: 'S&H',
                        'S & H': 'S&H',
                    };
                    const aliasMapped = alias[upper] || upper;
                    const match = DEPARTMENTS.find(
                        d => d.id === aliasMapped || String(d.code || '').toUpperCase() === aliasMapped
                    );
                    return match ? match.id : aliasMapped;
                };

                // Helper to check if event is expired
                const isEventExpired = (event) => {
                    if (!event.expiryDate) return false;
                    const expiryDate = new Date(event.expiryDate);
                    return expiryDate < new Date();
                };

                // Filter events based on user's student status
                const userIsStudent = studentProfile?.isStudent !== false; // Default to true if not specified
                
                const filteredEvents = eventsArray.filter(e => {
                    const forStudents = e.isForStudents !== false; // Default true if not specified
                    const forNonStudents = e.isForNonStudents === true;
                    
                    // If both checkboxes are checked or neither is checked, show to everyone
                    if ((forStudents && forNonStudents) || (!forStudents && !forNonStudents)) {
                        return true;
                    }
                    
                    // If only one checkbox is checked, filter based on user status
                    if (userIsStudent) {
                        return forStudents;
                    } else {
                        return forNonStudents;
                    }
                });
                
                const filteredSpecial = specialArray.filter(e => {
                    const forStudents = e.isForStudents !== false; // Default true if not specified
                    const forNonStudents = e.isForNonStudents === true;
                    
                    // If both checkboxes are checked or neither is checked, show to everyone
                    if ((forStudents && forNonStudents) || (!forStudents && !forNonStudents)) {
                        return true;
                    }
                    
                    // If only one checkbox is checked, filter based on user status
                    if (userIsStudent) {
                        return forStudents;
                    } else {
                        return forNonStudents;
                    }
                });

                const normalizedEvents = filteredEvents.map(e => ({
                    ...e,
                    department: normalizeDept(e.department),
                    departments: Array.isArray(e.departments) ? e.departments.map(normalizeDept) : undefined,
                    isExpired: isEventExpired(e),
                }));
                const normalizedSpecial = filteredSpecial.map(e => ({
                    ...e,
                    department: normalizeDept(e.department),
                    departments: Array.isArray(e.departments) ? e.departments.map(normalizeDept) : undefined,
                    isExpired: isEventExpired(e),
                }));

                console.log('[EVENTS DEBUG] After filtering by student status:', filteredEvents.length);
                console.log('[EVENTS DEBUG] After normalization:', normalizedEvents.length);
                console.log('[EVENTS DEBUG] Sample normalized event:', normalizedEvents[0]);

                setEvents(normalizedEvents);
                setSpecialEvents(normalizedSpecial);
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
    }, [studentProfile]);


    // Memoize filtered events to avoid recalculation on every render
    const { departmentIds, otherEvents, otherSpecialEvents, filteredDepartments } = useMemo(() => {
        console.log('[EVENTS DEBUG] useMemo - events state:', events.length);
        const deptIds = new Set(DEPARTMENTS.map(d => d.id));
        const others = events.filter(e => !e?.department || !deptIds.has(e.department));

        // Specials categorized as 'other' that don't belong to any known department
        const specialsOther = specialEvents.filter(e => {
            const cat = String(e.category || '').toLowerCase();
            const inArray = Array.isArray(e.departments) ? e.departments.some(d => deptIds.has(d)) : false;
            const inString = e.department && deptIds.has(e.department);
            const hasKnownDept = inArray || inString;
            return cat === 'other' && !hasKnownDept;
        });
        
        // Helper to check if event belongs to department
        const eventBelongsToDept = (event, deptId) => {
            // Check new departments array format
            if (Array.isArray(event.departments)) {
                return event.departments.includes(deptId);
            }
            // Check old department string format
            return event.department === deptId;
        };
        
        // Pre-filter departments that have events or special events
        const filtered = DEPARTMENTS.filter(dept => {
            if (selectedDepartment !== 'all' && dept.id !== selectedDepartment) return false;
            const hasCommonEvents = events.some(e => eventBelongsToDept(e, dept.id));
            const hasSpecialEvents = specialEvents.some(e => eventBelongsToDept(e, dept.id));
            return hasCommonEvents || hasSpecialEvents;
        });
        
        console.log('[EVENTS DEBUG] Filtered departments with events:', filtered.length);
        console.log('[EVENTS DEBUG] Filtered department IDs:', filtered.map(d => d.id));
        
        return { departmentIds: deptIds, otherEvents: others, otherSpecialEvents: specialsOther, filteredDepartments: filtered };
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

                <p className='text-muted-text text-center font-space text-lg mb-8'>Discover all the Events happening at the fest</p>

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
                                This page features events included in the Common Pass. For workshops and competitions, please visit the <a href="/special-events" className="text-primary hover:underline">Special Events</a> page.
                            </p>
                            <div className="space-y-2 text-sm">
                                <p className="text-muted-text text-lg font-space leading-relaxed">
                                    <span className="text-primary font-semibold">All Events:</span> Included in the <span className="text-primary font-semibold">Common Pass (₹300)</span> • Valid for Nov 7-8, 2025
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
                            // Helper to filter events by department (handles both array and string formats)
                            const filterByDept = (eventList, deptId) => {
                                return eventList.filter(e => {
                                    if (Array.isArray(e.departments)) {
                                        return e.departments.includes(deptId);
                                    }
                                    return e.department === deptId;
                                });
                            };
                            const deptCommonEvents = filterByDept(events, dept.id);
                            const deptSpecialEvents = filterByDept(specialEvents, dept.id);
                            return (
                                <section key={dept.id} id={`dept-${dept.id}`} className="space-y-6">
                                    {/* Department Header */}
                                    <div className="text-center md:text-left">
                                        <h2 className="font-audiowide text-3xl md:text-4xl bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-2">
                                            {dept.id === 'OTHERS' ? 'Other Events' : dept.name}
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

                        {selectedDepartment === 'all' && (otherEvents.length > 0 || otherSpecialEvents.length > 0) && (
                            <section key="others" id="dept-others" className="space-y-6">
                                {/* Department Header */}
                                <div className="text-center md:text-left">
                                    <h2 className="font-audiowide text-3xl md:text-4xl bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-2">
                                        Other Events
                                    </h2>
                                    <div className="h-1 w-24 bg-gradient-to-r from-primary to-secondary rounded-full mx-auto md:mx-0"></div>
                                </div>
                                
                                {/* Premium Events (category: other) */}
                                {otherSpecialEvents.length > 0 && (
                                    <div className="space-y-4">
                                        <h3 className="font-audiowide text-lg text-secondary">Premium Events</h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 justify-items-center">
                                            {otherSpecialEvents.map((event) => (
                                                <SpecialEventBox key={event.id} event={event} />
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Common Events */}
                                {otherEvents.length > 0 && (
                                    <div className="space-y-4">
                                        <h3 className="font-audiowide text-lg text-primary">Common Events</h3>
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
                                    </div>
                                )}
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