"use client";
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import SpecialEventBox from '@/components/SpecialEventBox';
import { useEffect, useState, useMemo } from 'react';
import { DEPARTMENTS } from '@/constants/departments';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

const SpecialEventsPage = () => {
  const [premiumEvents, setPremiumEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPremiumEvents = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/special-events');

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        // Filter only competition category events
        const competitionEvents = data.filter(event => event.category === 'competition');
        console.log("Fetched premium competition events:", competitionEvents);
        setPremiumEvents(competitionEvents);
      } catch (err) {
        console.error("Error fetching premium events:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPremiumEvents();
  }, []);

  // Group events by department
  const eventsByDepartment = useMemo(() => {
    const grouped = {};
    premiumEvents.forEach(event => {
      if (!grouped[event.department]) {
        grouped[event.department] = [];
      }
      grouped[event.department].push(event);
    });
    return grouped;
  }, [premiumEvents]);

  // Get departments that have competition events
  const departmentsWithEvents = DEPARTMENTS.filter(dept => eventsByDepartment[dept.id]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background-soft to-background">
      <Header />
      <div className='py-20 px-6 md:px-12 max-w-7xl mx-auto'>
        <h1 className="font-audiowide text-4xl md:text-6xl lg:text-7xl bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-6 text-center">
          Special Events & Competitions
        </h1>

        <p className='text-muted-text text-center font-space text-lg mb-8'>
          Special competitions, workshops, and exclusive events
        </p>

        {loading && (
          <div className="flex justify-center items-center py-20">
            <div className="text-primary text-lg font-audiowide">Loading competitions...</div>
          </div>
        )}

        {error && (
          <div className="flex justify-center items-center py-20">
            <div className="text-red-500 text-lg">Error: {error}</div>
          </div>
        )}

        {!loading && !error && premiumEvents.length === 0 && (
          <div className="flex justify-center items-center py-20">
            <div className="text-muted-text text-lg font-space">No premium competitions available yet</div>
          </div>
        )}

        {!loading && !error && premiumEvents.length > 0 && (
          <div className="space-y-16">
            {departmentsWithEvents.map((dept) => {
              const deptEvents = eventsByDepartment[dept.id];
              return (
                <section key={dept.id} className="space-y-6">
                  {/* Department Header */}
                  <div className="text-center md:text-left">
                    <h2 className="font-audiowide text-3xl md:text-4xl bg-gradient-to-r from-secondary to-primary bg-clip-text text-transparent mb-2">
                      {dept.name}
                    </h2>
                    <div className="h-1 w-24 bg-gradient-to-r from-secondary to-primary rounded-full mx-auto md:mx-0"></div>
                  </div>
                  
                  {/* Events Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 justify-items-center">
                    {deptEvents.map((event) => (
                      <SpecialEventBox
                        key={event.id}
                        event={event}
                      />
                    ))}
                  </div>
                </section>
              );
            })}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}

export default SpecialEventsPage;
