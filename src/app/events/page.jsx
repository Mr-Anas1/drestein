"use client";
import Header from '@/components/Header'
import React, { useEffect, useState, useMemo } from 'react'
import Footer from '@/components/Footer'
import EventBox from '@/components/EventBox'
import CustomDropdown from '@/components/CustomDropdown'
import { DEPARTMENTS } from '@/constants/departments'
import { Info } from 'lucide-react'

const page = () => {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedDepartment, setSelectedDepartment] = useState('all');

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                setLoading(true);
                const response = await fetch('/api/events');

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const data = await response.json();
                console.log("Fetched events from Firestore:", data);
                setEvents(data);
            } catch (err) {
                console.error("Error fetching events:", err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchEvents();
    }, []);

    // Memoize filtered events to avoid recalculation on every render
    const { departmentIds, otherEvents, filteredDepartments } = useMemo(() => {
        const deptIds = new Set(DEPARTMENTS.map(d => d.id));
        const others = events.filter(e => !e?.department || !deptIds.has(e.department));
        
        // Pre-filter departments that have events
        const filtered = DEPARTMENTS.filter(dept => {
            if (selectedDepartment !== 'all' && dept.id !== selectedDepartment) return false;
            return events.some(e => e.department === dept.id);
        });
        
        return { departmentIds: deptIds, otherEvents: others, filteredDepartments: filtered };
    }, [events, selectedDepartment]);

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

                {/* Info Box for Common Pass */}
                <div className="max-w-4xl mx-auto mb-12 bg-gradient-to-r from-primary/10 via-secondary/10 to-primary/10 border-2 border-primary/30 rounded-2xl p-6 backdrop-blur-sm">
                    <div className="flex items-start gap-4">
                        <div className="flex-shrink-0 mt-1">
                            <div className="bg-primary/20 p-3 rounded-full">
                                <Info className="w-6 h-6 text-primary" />
                            </div>
                        </div>
                        <div className="flex-1">
                            <h3 className="font-audiowide text-xl text-white mb-3 flex items-center gap-2">
                                💳 Common Pass Access
                            </h3>
                            <p className="text-muted-text font-space leading-relaxed mb-3">
                                Purchase the <span className="text-primary font-semibold">Common Pass (₹250)</span> to get unlimited access to <span className="text-white font-semibold">all these events</span> during the fest!
                            </p>
                            <p className="text-muted-text font-space leading-relaxed text-sm">
                                ✨ One pass, all events • Valid for Nov 7-8, 2025 • Best value for money
                            </p>
                        </div>
                    </div>
                </div>

                {loading && (
                    <div className="flex justify-center items-center py-20">
                        <div className="text-primary text-lg">Loading events...</div>
                    </div>
                )}

                {error && (
                    <div className="flex justify-center items-center py-20">
                        <div className="text-red-500 text-lg">Error: {error}</div>
                    </div>
                )}

                {!loading && !error && (
                    <div className="w-full pt-10 space-y-16">
                        {filteredDepartments.map((dept) => {
                            const deptEvents = events.filter(e => e.department === dept.id);
                            return (
                                <section key={dept.id} id={`dept-${dept.id}`} className="space-y-6">
                                    {/* Department Header */}
                                    <div className="text-center md:text-left">
                                        <h2 className="font-audiowide text-3xl md:text-4xl bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-2">
                                            {dept.name}
                                        </h2>
                                        <div className="h-1 w-24 bg-gradient-to-r from-primary to-secondary rounded-full mx-auto md:mx-0"></div>
                                    </div>
                                    
                                    {/* Events Grid */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 justify-items-center">
                                        {deptEvents.map((event) => (
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