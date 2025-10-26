import { useState, useEffect, useRef } from 'react';

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export const useEventCache = () => {
  const [events, setEvents] = useState(null);
  const [specialEvents, setSpecialEvents] = useState(null);
  const [loading, setLoading] = useState(false);
  const cacheRef = useRef({
    events: { data: null, timestamp: null },
    specialEvents: { data: null, timestamp: null },
  });

  const isCacheValid = (type) => {
    const cache = cacheRef.current[type];
    if (!cache.data) return false;
    return Date.now() - cache.timestamp < CACHE_DURATION;
  };

  const fetchEvents = async () => {
    if (isCacheValid('events')) {
      setEvents(cacheRef.current.events.data);
      return cacheRef.current.events.data;
    }

    try {
      setLoading(true);
      const res = await fetch('/api/events');
      if (!res.ok) throw new Error('Failed to fetch events');
      const data = await res.json();
      
      cacheRef.current.events = { data, timestamp: Date.now() };
      setEvents(data);
      return data;
    } catch (error) {
      console.error('Error fetching events:', error);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const fetchSpecialEvents = async () => {
    if (isCacheValid('specialEvents')) {
      setSpecialEvents(cacheRef.current.specialEvents.data);
      return cacheRef.current.specialEvents.data;
    }

    try {
      setLoading(true);
      const res = await fetch('/api/special-events');
      if (!res.ok) throw new Error('Failed to fetch special events');
      const data = await res.json();
      
      cacheRef.current.specialEvents = { data, timestamp: Date.now() };
      setSpecialEvents(data);
      return data;
    } catch (error) {
      console.error('Error fetching special events:', error);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const clearCache = () => {
    cacheRef.current = {
      events: { data: null, timestamp: null },
      specialEvents: { data: null, timestamp: null },
    };
    setEvents(null);
    setSpecialEvents(null);
  };

  return {
    events,
    specialEvents,
    loading,
    fetchEvents,
    fetchSpecialEvents,
    clearCache,
  };
};
