"use client";
import EventBox from "@/components/EventBox";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Reveal from "@/components/Reveal";
import LoadingSpinner from "@/components/LoadingSpinner";

const Events = () => {
  const router = useRouter();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/events');
        const data = await response.json();
        // Get the first 4 events to display on home page
        setEvents(data.slice(0, 4));
      } catch (error) {
        console.error('Error fetching events:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  return (
    <div className="mt-24 md:mt-38">
      <Reveal effect="fade-up">
        <h1 className="font-audiowide text-[32px]  text-center md:text-[64px] bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
          Events
        </h1>
      </Reveal>
      <div className="flex md:flex-row flex-col mx-12 mt-10  justify-center items-center gap-12">
        {loading ? (
          <div className="py-12">
            <LoadingSpinner size="lg" text="Loading events..." />
          </div>
        ) : events.length > 0 ? (
          events.map((event, index) => (
            <Reveal effect="fade-up" delay={index * 100} key={event.id || index}>
              <EventBox
                img={event.img}
                title={event.title}
                description={event.description}
                link={`/events/${event.id}`}
                id={event.id}
                event={event}
              />
            </Reveal>
          ))
        ) : (
          <div className="py-12">
            <p className="text-muted-text font-space text-center">No events available at the moment</p>
          </div>
        )}
      </div>

      <div className="flex justify-center items-center my-12">
        <Reveal effect="fade-up" delay={100}>
          <button
            className="bg-primary w-[150px] text-white rounded-lg hover:bg-hover-primary transition duration-300 py-2 md:py-3 cursor-pointer font-audiowide"
            onClick={() => router.push("/events")}
          >
            Explore More
          </button>
        </Reveal>
      </div>
    </div>
  );
};

export default Events;
