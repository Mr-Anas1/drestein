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
  const [isQuotaExceeded, setIsQuotaExceeded] = useState(false);

  useEffect(() => {
    const fetchPremiumEvents = async () => {
      try {
        setLoading(true);
        setError(null);
        setIsQuotaExceeded(false);
        
        // Simple direct API call
        const res = await fetch('/api/special-events?category=competition');
        if (!res.ok) throw new Error('Failed to fetch special events');
        
        const data = await res.json();
        const eventsArray = data?.events || data || [];
        
        if (!Array.isArray(eventsArray)) {
          throw new Error('Invalid events format');
        }
        
        console.log('Fetched events:', eventsArray);
        setPremiumEvents(eventsArray);
      } catch (err) {
        console.error("Error fetching premium events:", err);
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

    fetchPremiumEvents();
  }, []);


  // Group events by department (handle both array and string formats)
  const eventsByDepartment = useMemo(() => {
    const grouped = {};
    premiumEvents.forEach(event => {
      // Handle new departments array format
      if (Array.isArray(event.departments) && event.departments.length > 0) {
        event.departments.forEach(dept => {
          if (!grouped[dept]) {
            grouped[dept] = [];
          }
          grouped[dept].push(event);
        });
      }
      // Handle old department string format (backward compatibility)
      else if (event.department) {
        if (!grouped[event.department]) {
          grouped[event.department] = [];
        }
        grouped[event.department].push(event);
      }
      // Handle events without department info - add to 'COMMON'
      else {
        if (!grouped['COMMON']) {
          grouped['COMMON'] = [];
        }
        grouped['COMMON'].push(event);
      }
    });
    return grouped;
  }, [premiumEvents]);

  // Get departments that have competition events (including COMMON)
  const departmentsWithEvents = DEPARTMENTS.filter(dept => eventsByDepartment[dept.id]);
  
  // Check if there are events without department info
  const hasCommonEvents = eventsByDepartment['COMMON'] && eventsByDepartment['COMMON'].length > 0;

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

        {isQuotaExceeded && (
          <div className="max-w-2xl mx-auto bg-background-soft border border-border rounded-2xl p-12 text-center">
            <div className="inline-block p-6 bg-secondary/10 rounded-full mb-6">
              <span className="text-5xl">🏆</span>
            </div>
            <h2 className="text-3xl font-audiowide mb-4 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">Stay Tuned!</h2>
            <p className="text-muted-text font-space mb-4 text-lg">
              We're experiencing high traffic right now. Special events are loading soon!
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

        {!loading && !error && !isQuotaExceeded && premiumEvents.length === 0 && !hasCommonEvents && (
          <div className="flex justify-center items-center py-20">
            <div className="text-muted-text text-lg font-space">No premium competitions available yet</div>
          </div>
        )}

        {!loading && !error && !isQuotaExceeded && (premiumEvents.length > 0 || hasCommonEvents) && (
          <>
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
              
              {hasCommonEvents && (
                <section className="space-y-6">
                  <div className="text-center md:text-left">
                    <h2 className="font-audiowide text-3xl md:text-4xl bg-gradient-to-r from-secondary to-primary bg-clip-text text-transparent mb-2">
                      General Competitions
                    </h2>
                    <div className="h-1 w-24 bg-gradient-to-r from-secondary to-primary rounded-full mx-auto md:mx-0"></div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 justify-items-center">
                    {eventsByDepartment['COMMON'].map((event) => (
                      <SpecialEventBox
                        key={event.id}
                        event={event}
                      />
                    ))}
                  </div>
                </section>
              )}
            </div>
            
          </>
        )}
      </div>
      <Footer />
    </div>
  );
}

export default SpecialEventsPage;
