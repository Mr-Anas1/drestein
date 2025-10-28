"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Image from "next/image";
import Link from "next/link";
import { getDepartmentById } from "@/constants/departments";
import { Calendar, MapPin, Users, Clock, ArrowRight } from "lucide-react";

export default function DepartmentPage() {
  const params = useParams();
  const deptId = params.id?.toUpperCase();
  const department = getDepartmentById(deptId);

  const [events, setEvents] = useState([]);
  const [specialEvents, setSpecialEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isQuotaExceeded, setIsQuotaExceeded] = useState(false);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        setError(null);
        setIsQuotaExceeded(false);
        
        // Simple direct API calls with department filter
        const [eventsRes, specialRes] = await Promise.all([
          fetch(`/api/events?department=${deptId}`),
          fetch(`/api/special-events?department=${deptId}`)
        ]);
        
        if (!eventsRes.ok || !specialRes.ok) {
          throw new Error('Failed to fetch events');
        }
        
        const eventsData = await eventsRes.json();
        const specialData = await specialRes.json();
        
        const eventsArray = eventsData?.events || eventsData || [];
        const specialArray = specialData?.events || specialData || [];
        
        if (!Array.isArray(eventsArray)) {
          throw new Error('Invalid events format');
        }
        if (!Array.isArray(specialArray)) {
          throw new Error('Invalid special events format');
        }
        
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

    if (deptId) {
      fetchEvents();
    }
  }, [deptId]);

  if (!department) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background-soft to-background">
        <Header />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <h1 className="font-audiowide text-4xl text-white mb-4">
              Department Not Found
            </h1>
            <Link
              href="/departments"
              className="text-primary hover:text-hover-primary font-space"
            >
              ← Back to Departments
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background-soft to-background">
      <Header />

      {/* Department Poster - Full Width, 80vh */}
      <div className="relative w-full h-[80vh] overflow-hidden">
        <Image
          src={department.image}
          alt={department.name}
          fill
          className="object-cover"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-transparent"></div>
        
        {/* Department Info Overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12">
          <div className="max-w-7xl mx-auto">
            <div className="inline-block px-4 py-2 rounded-lg bg-gradient-to-r from-primary/80 to-secondary/80 backdrop-blur-sm border border-white/20 mb-4">
              <span className="font-audiowide text-white text-sm">
                {department.code}
              </span>
            </div>
            <h1 className="font-audiowide text-4xl md:text-6xl lg:text-7xl text-white mb-4">
              {department.name}
            </h1>
            <p className="text-muted-text font-space text-lg max-w-3xl">
              Explore all events organized by the {department.name} department
            </p>
          </div>
        </div>
      </div>

      {/* Events Section */}
      <div className="py-16 px-6 md:px-12 max-w-7xl mx-auto">
        {loading ? (
          <div className="text-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-text font-space">Loading events...</p>
          </div>
        ) : isQuotaExceeded ? (
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
        ) : error ? (
          <div className="text-center py-20">
            <div className="text-red-500 text-lg mb-4">Error loading events</div>
            <p className="text-muted-text font-space">{error}</p>
          </div>
        ) : (
          <>
            {/* Premium Events - Shown First */}
            {specialEvents.length > 0 && (
              <div className="mb-16">
                <h2 className="font-audiowide text-3xl md:text-4xl bg-gradient-to-r from-secondary to-primary bg-clip-text text-transparent mb-8">
                  Premium Events (3/11/25 - 6/11/25)
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {specialEvents.map((event) => (
                    <Link
                      key={event.id}
                      href={`/special-events/${event.id}`}
                      className="group"
                    >
                      <div className="rounded-2xl p-[1px] bg-gradient-to-r from-secondary/30 to-primary/30 hover:from-secondary/60 hover:to-primary/60 transition-all duration-300 hover:-translate-y-1 h-full">
                        <div className="rounded-2xl bg-background-soft border border-border/60 overflow-hidden h-full flex flex-col">
                          {event.img && (
                            <div className="relative w-full h-48 overflow-hidden">
                              <Image
                                src={event.img}
                                alt={event.title}
                                fill
                                loading="lazy"
                                className="object-cover group-hover:scale-110 transition-transform duration-300"
                              />
                            </div>
                          )}
                          <div className="p-6 flex flex-col flex-1">
                            <div className="flex items-start justify-between mb-3">
                              <h3 className="font-audiowide text-xl text-white group-hover:text-secondary transition-colors flex-1">
                                {event.title}
                              </h3>
                              <span className="text-primary font-audiowide text-lg ml-2">
                                ₹{event.price}
                              </span>
                            </div>
                            <p className="text-muted-text font-space text-sm mb-4 line-clamp-2 flex-1">
                              {event.description}
                            </p>
                            <div className="space-y-2 text-sm">
                              {event.date && (
                                <div className="flex items-center gap-2 text-muted-text">
                                  <Calendar className="w-4 h-4 text-secondary" />
                                  <span className="font-space">{event.date}</span>
                                </div>
                              )}
                              {event.time && (
                                <div className="flex items-center gap-2 text-muted-text">
                                  <Clock className="w-4 h-4 text-secondary" />
                                  <span className="font-space">{event.time}</span>
                                </div>
                              )}
                              {event.venue && (
                                <div className="flex items-center gap-2 text-muted-text">
                                  <MapPin className="w-4 h-4 text-secondary" />
                                  <span className="font-space">{event.venue}</span>
                                </div>
                              )}
                              {event.type && (
                                <div className="flex items-center gap-2 text-muted-text">
                                  <Users className="w-4 h-4 text-secondary" />
                                  <span className="font-space capitalize">{event.type}</span>
                                </div>
                              )}
                            </div>
                            <div className="mt-4 flex items-center justify-between gap-2">
                              <div className="flex gap-2">
                                <span className="text-xs px-3 py-1 rounded-full bg-secondary/10 text-secondary border border-secondary/20 font-space capitalize">
                                  {event.category}
                                </span>
                                <span className="text-xs px-3 py-1 rounded-full bg-secondary/20 text-secondary border border-secondary/30 font-audiowide">
                                  Premium Event
                                </span>
                              </div>
                              <ArrowRight className="w-5 h-5 text-secondary group-hover:translate-x-1 transition-transform" />
                            </div>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Common Events - Shown Second */}
            {events.length > 0 && (
              <div>
                <h2 className="font-audiowide text-3xl md:text-4xl bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-8">
                  Common Events (7/11/25 - 8/11/25)
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {events.map((event) => (
                    <Link
                      key={event.id}
                      href={`/events/${event.id}`}
                      className="group"
                    >
                      <div className="rounded-2xl p-[1px] bg-gradient-to-r from-primary/30 to-secondary/30 hover:from-primary/60 hover:to-secondary/60 transition-all duration-300 hover:-translate-y-1 h-full">
                        <div className="rounded-2xl bg-background-soft border border-border/60 overflow-hidden h-full flex flex-col">
                          {event.img && (
                            <div className="relative w-full h-48 overflow-hidden">
                              <Image
                                src={event.img}
                                alt={event.title}
                                fill
                                loading="lazy"
                                className="object-cover group-hover:scale-110 transition-transform duration-300"
                              />
                            </div>
                          )}
                          <div className="p-6 flex flex-col flex-1">
                            <h3 className="font-audiowide text-xl text-white group-hover:text-primary transition-colors mb-3">
                              {event.title}
                            </h3>
                            <p className="text-muted-text font-space text-sm mb-4 line-clamp-2 flex-1">
                              {event.description}
                            </p>
                            <div className="space-y-2 text-sm">
                              {event.date && (
                                <div className="flex items-center gap-2 text-muted-text">
                                  <Calendar className="w-4 h-4 text-primary" />
                                  <span className="font-space">{event.date}</span>
                                </div>
                              )}
                              {event.time && (
                                <div className="flex items-center gap-2 text-muted-text">
                                  <Clock className="w-4 h-4 text-primary" />
                                  <span className="font-space">{event.time}</span>
                                </div>
                              )}
                              {event.venue && (
                                <div className="flex items-center gap-2 text-muted-text">
                                  <MapPin className="w-4 h-4 text-primary" />
                                  <span className="font-space">{event.venue}</span>
                                </div>
                              )}
                            </div>
                            <div className="mt-4 flex items-center justify-between gap-2">
                              <div className="flex gap-2">
                                <span className="text-xs px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 font-space">
                                  {event.category}
                                </span>
                                <span className="text-xs px-3 py-1 rounded-full bg-primary/20 text-primary border border-primary/30 font-audiowide">
                                  Common Event
                                </span>
                              </div>
                              <ArrowRight className="w-5 h-5 text-primary group-hover:translate-x-1 transition-transform" />
                            </div>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* No Events Message */}
            {events.length === 0 && specialEvents.length === 0 && (
              <div className="text-center py-20">
                <div className="text-6xl mb-4">📅</div>
                <h3 className="font-audiowide text-2xl text-white mb-2">
                  No Events Yet
                </h3>
                <p className="text-muted-text font-space mb-6">
                  There are currently no events for this department.
                </p>
                <Link
                  href="/departments"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-gradient-to-r from-primary to-secondary text-white font-audiowide hover:from-hover-primary hover:to-primary transition-all"
                >
                  ← Back to Departments
                </Link>
              </div>
            )}
          </>
        )}
      </div>

      <Footer />
    </div>
  );
}
