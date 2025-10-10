"use client";
import Header from '@/components/Header';
import React, { useEffect, useState } from 'react';
import Footer from '@/components/Footer';
import SpecialEventBox from '@/components/SpecialEventBox';

const SpecialEventsPage = () => {
  const [specialEvents, setSpecialEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all'); // all, competition, workshop, event

  useEffect(() => {
    const fetchSpecialEvents = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/special-events');

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log("Fetched special events:", data);
        setSpecialEvents(data);
      } catch (err) {
        console.error("Error fetching special events:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchSpecialEvents();
  }, []);

  const filteredEvents = filter === 'all'
    ? specialEvents
    : specialEvents.filter(event => event.category === filter);

  const categories = [
    { id: 'all', name: 'All Events' },
    { id: 'competition', name: 'Competitions' },
    { id: 'workshop', name: 'Workshops' },
    { id: 'event', name: 'Special Events' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background-soft to-background">
      <Header />
      <div className='py-20 px-6 md:px-12 max-w-7xl mx-auto'>
        <h1 className="font-audiowide text-4xl md:text-6xl lg:text-7xl bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-6 text-center">
          Special Events & Workshops
        </h1>

        <p className='text-muted-text text-center font-space text-lg mb-8'>
          Premium competitions, workshops, and exclusive events with custom pricing
        </p>

        {/* Category Filter */}
        <div className="flex justify-center gap-4 mb-12 flex-wrap">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setFilter(cat.id)}
              className={`px-6 py-3 rounded-lg font-audiowide transition-all duration-300 ${filter === cat.id
                ? 'bg-gradient-to-r from-primary to-secondary text-white'
                : 'bg-background-soft border border-border text-muted-text hover:border-primary'
                }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {loading && (
          <div className="flex justify-center items-center py-20">
            <div className="text-primary text-lg font-audiowide">Loading special events...</div>
          </div>
        )}

        {error && (
          <div className="flex justify-center items-center py-20">
            <div className="text-red-500 text-lg">Error: {error}</div>
          </div>
        )}

        {!loading && !error && filteredEvents.length === 0 && (
          <div className="flex justify-center items-center py-20">
            <div className="text-muted-text text-lg font-space">No special events available yet</div>
          </div>
        )}

        {!loading && !error && filteredEvents.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 justify-items-center ">
            {filteredEvents.map((event) => (
              <SpecialEventBox
                key={event.id}
                event={event}
              />
            ))}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default SpecialEventsPage;
