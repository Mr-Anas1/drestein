import { useState, useEffect, useRef, useCallback } from 'react';

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
const CACHE_VERSION = '5'; // Increment to invalidate old cache (v5: events page deduplication fix)
const STORAGE_KEY_EVENTS = `drestein_cache_events_v${CACHE_VERSION}`;
const STORAGE_KEY_SPECIAL_EVENTS = `drestein_cache_special_events_v${CACHE_VERSION}`;

export const useEventCache = () => {
  const [events, setEvents] = useState(null);
  const [specialEvents, setSpecialEvents] = useState(null);
  const [loading, setLoading] = useState(false);
  const cacheRef = useRef({
    events: { data: null, timestamp: null, key: '' },
    specialEvents: { data: null, timestamp: null, key: '' },
  });
  const pendingRequests = useRef({
    events: new Map(),
    specialEvents: new Map(),
  });

  // Initialize cache from localStorage on mount
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    try {
      // Clear old cache versions
      Object.keys(localStorage).forEach(key => {
        if ((key.startsWith('drestein_cache_events') || key.startsWith('drestein_cache_special_events')) 
            && key !== STORAGE_KEY_EVENTS && key !== STORAGE_KEY_SPECIAL_EVENTS) {
          localStorage.removeItem(key);
        }
      });
      
      const cachedEvents = localStorage.getItem(STORAGE_KEY_EVENTS);
      const cachedSpecialEvents = localStorage.getItem(STORAGE_KEY_SPECIAL_EVENTS);
      
      if (cachedEvents) {
        const parsed = JSON.parse(cachedEvents);
        cacheRef.current.events = {
          data: parsed.data ?? null,
          timestamp: parsed.timestamp ?? null,
          key: parsed.key ?? '',
        };
      }
      if (cachedSpecialEvents) {
        const parsed = JSON.parse(cachedSpecialEvents);
        cacheRef.current.specialEvents = {
          data: parsed.data ?? null,
          timestamp: parsed.timestamp ?? null,
          key: parsed.key ?? '',
        };
      }
    } catch (error) {
      console.error('Error loading cache from localStorage:', error);
    }
  }, []);

  const saveToLocalStorage = (type, data, key = '') => {
    if (typeof window === 'undefined') return;
    try {
      const key = type === 'events' ? STORAGE_KEY_EVENTS : STORAGE_KEY_SPECIAL_EVENTS;
      localStorage.setItem(key, JSON.stringify({ data, timestamp: Date.now(), key }));
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  };

  const isCacheValid = (type, key = '') => {
    const cache = cacheRef.current[type];
    if (!cache.data) return false;
    if (key && cache.key && cache.key !== key) return false;
    return Date.now() - cache.timestamp < CACHE_DURATION;
  };

  const fetchEvents = useCallback(async (offset = 0, limit = 50) => {
    // Only use cache for first page (offset = 0)
    if (offset === 0 && isCacheValid('events')) {
      setEvents(cacheRef.current.events.data);
      return cacheRef.current.events.data;
    }

    // Request deduplication - check if same request is already pending
    const requestKey = `${offset}-${limit}`;
    if (pendingRequests.current.events.has(requestKey)) {
      return pendingRequests.current.events.get(requestKey);
    }

    const requestPromise = (async () => {
      try {
        setLoading(true);
        const url = `/api/events?limit=${limit}&offset=${offset}`;
        const res = await fetch(url);
        if (!res.ok) throw new Error('Failed to fetch events');
        const data = await res.json();
        
        // Only cache first page
        if (offset === 0) {
          cacheRef.current.events = { data, timestamp: Date.now(), key: '' };
          saveToLocalStorage('events', data, '');
        }
        setEvents(data);
        return data;
      } catch (error) {
        console.error('Error fetching events:', error);
        return null;
      } finally {
        setLoading(false);
        pendingRequests.current.events.delete(requestKey);
      }
    })();

    pendingRequests.current.events.set(requestKey, requestPromise);
    return requestPromise;
  }, []);

  const fetchSpecialEvents = useCallback(async (offset = 0, limit = 50, params = {}) => {
    const paramsKey = Object.keys(params).sort().map(k => `${k}=${params[k]}`).join('&');

    // Only use cache for first page (offset = 0) when params match
    if (offset === 0 && isCacheValid('specialEvents', paramsKey)) {
      setSpecialEvents(cacheRef.current.specialEvents.data);
      return cacheRef.current.specialEvents.data;
    }

    // Request deduplication - check if same request is already pending
    const requestKey = `${offset}-${limit}${paramsKey ? `?${paramsKey}` : ''}`;
    if (pendingRequests.current.specialEvents.has(requestKey)) {
      return pendingRequests.current.specialEvents.get(requestKey);
    }

    const requestPromise = (async () => {
      try {
        setLoading(true);
        const usp = new URLSearchParams({ limit: String(limit), offset: String(offset) });
        Object.entries(params || {}).forEach(([k, v]) => {
          if (v !== undefined && v !== null && String(v).length > 0) usp.set(k, String(v));
        });
        const url = `/api/special-events?${usp.toString()}`;
        const res = await fetch(url);
        if (!res.ok) throw new Error('Failed to fetch special events');
        const data = await res.json();
        
        // Only cache first page
        if (offset === 0) {
          cacheRef.current.specialEvents = { data, timestamp: Date.now(), key: paramsKey };
          saveToLocalStorage('specialEvents', data, paramsKey);
        }
        setSpecialEvents(data);
        return data;
      } catch (error) {
        console.error('Error fetching special events:', error);
        return null;
      } finally {
        setLoading(false);
        pendingRequests.current.specialEvents.delete(requestKey);
      }
    })();

    pendingRequests.current.specialEvents.set(requestKey, requestPromise);
    return requestPromise;
  }, []);

  const clearCache = () => {
    cacheRef.current = {
      events: { data: null, timestamp: null, key: '' },
      specialEvents: { data: null, timestamp: null, key: '' },
    };
    // Clear pending requests
    pendingRequests.current.events.clear();
    pendingRequests.current.specialEvents.clear();
    setEvents(null);
    setSpecialEvents(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY_EVENTS);
      localStorage.removeItem(STORAGE_KEY_SPECIAL_EVENTS);
    }
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
