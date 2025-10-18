"use client";
import Header from '@/components/Header'
import React, { useEffect, useState } from 'react'
import Footer from '@/components/Footer'
import EventBox from '@/components/EventBox'
import { DEPARTMENTS } from '@/constants/departments'

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

    const departmentIds = new Set(DEPARTMENTS.map(d => d.id));
    const otherEvents = events.filter(e => !e?.department || !departmentIds.has(e.department));

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
                <div className="flex justify-center mb-12">
                    <div className="relative min-w-[320px] max-w-md">
                        {/* <label className="block text-white font-audiowide text-xs mb-2 text-center">
                            Filter by Department
                        </label> */}
                        <select
                            value={selectedDepartment}
                            onChange={(e) => setSelectedDepartment(e.target.value)}
                            className="w-full bg-background-soft border-2 border-border text-white px-4 py-3 rounded-xl font-space text-sm focus:outline-none focus:border-primary hover:border-primary transition-all duration-300 cursor-pointer appearance-none"
                            style={{ paddingRight: '2.5rem' }}
                        >
                            <option value="all" className="bg-background text-white py-2">All Departments</option>
                            {DEPARTMENTS.map((dept) => (
                                <option key={dept.id} value={dept.id} className="bg-background text-white py-2">
                                    {dept.short} - {dept.name}
                                </option>
                            ))}
                        </select>
                        <div className="absolute right-4 top-[calc(50%+0.5rem)] -translate-y-1/2 pointer-events-none text-primary">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
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
                        {DEPARTMENTS.map((dept) => {
                            // Filter by selected department
                            if (selectedDepartment !== 'all' && dept.id !== selectedDepartment) return null;
                            
                            const deptEvents = events.filter(e => e.department === dept.id);
                            if (deptEvents.length === 0) return null;
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