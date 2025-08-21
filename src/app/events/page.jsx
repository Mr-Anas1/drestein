"use client";
import Header from '@/components/Header'
import React, { useEffect, useState } from 'react'
import Footer from '@/components/Footer'
import EventBox from '@/components/EventBox'

const page = () => {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

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

    return (
        <div className="min-h-screen bg-gradient-to-br from-background via-background-soft to-background">
            <Header />
            <div className='py-20 px-6 md:px-12 max-w-12xl mx-auto '>
                <h1 className="font-audiowide text-4xl md:text-6xl lg:text-7xl bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-6 text-center">
                    Events
                </h1>

                <p className='text-muted-text text-center font-space text-lg'>Discover all the Events and Workshops</p>
                
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
                    <div className="w-full pt-10">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4  gap-12 justify-items-center">
                            {events.map((event) => (
                                <EventBox
                                    key={event.id}
                                    img={event.img}
                                    title={event.title}
                                    description={event.description}
                                    link={`/events/${event.id}`}
                                    id={event.id}
                                />
                            ))}
                        </div>
                    </div>
                )}

            </div>

            <Footer />
        </div>
    )
}

export default page