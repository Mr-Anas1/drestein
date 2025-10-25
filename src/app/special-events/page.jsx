"use client";
import Header from '@/components/Header';
import React, { useEffect, useState, useMemo } from 'react';
import Footer from '@/components/Footer';
import SpecialEventBox from '@/components/SpecialEventBox';
import CustomDropdown from '@/components/CustomDropdown';
import { Info } from 'lucide-react';

const SpecialEventsPage = () => {
  const [specialEvents, setSpecialEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [categoryFilter, setCategoryFilter] = useState('all'); // all, competition, workshop, event
  const [departmentFilter, setDepartmentFilter] = useState('all'); // all, CSE, ECE, EEE, MECH, CIVIL, etc.

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

  // Memoize filtered events to avoid recalculation on every render
  const filteredEvents = useMemo(() => {
    return specialEvents.filter(event => {
      const matchesCategory = categoryFilter === 'all' || event.category === categoryFilter;
      const matchesDepartment = departmentFilter === 'all' || event.department === departmentFilter;
      return matchesCategory && matchesDepartment;
    });
  }, [specialEvents, categoryFilter, departmentFilter]);

  const categories = [
    { id: 'all', name: 'All Events' },
    { id: 'competition', name: 'Competitions' },
    { id: 'workshop', name: 'Workshops' },
    { id: 'event', name: 'Special Events' },
  ];

  const departments = [
    { id: 'all', name: 'All Departments', short: 'All' },
    { id: 'AI-DS', name: 'Artificial Intelligence and Data Science', short: 'AI-DS' },
    { id: 'AI-ML', name: 'Artificial Intelligence and Machine Learning', short: 'AI-ML' },
    { id: 'AGRI', name: 'Agricultural Engineering', short: 'AGRI' },
    { id: 'BIO-MED', name: 'Biomedical Engineering', short: 'BIO-MED' },
    { id: 'CHEM', name: 'Chemical Engineering', short: 'CHEM' },
    { id: 'CIVIL', name: 'Civil Engineering', short: 'CIVIL' },
    { id: 'CSE', name: 'Computer Science and Engineering', short: 'CSE' },
    { id: 'CSE-CYB', name: 'Computer Science and Engineering (Cyber Security)', short: 'CSE-CYB' },
    { id: 'CSE-IOT', name: 'Computer Science and Engineering (Internet of Things)', short: 'CSE-IOT' },
    { id: 'IT', name: 'Information Technology', short: 'IT' },
    { id: 'ECE', name: 'Electronics and Communication Engineering', short: 'ECE' },
    { id: 'EEE', name: 'Electrical and Electronics Engineering', short: 'EEE' },
    { id: 'EIE', name: 'Electronics and Instrumentation Engineering', short: 'EIE' },
    { id: 'MECH', name: 'Mechanical Engineering', short: 'MECH' },
    { id: 'MED-ELE', name: 'Medical Electronics Engineering', short: 'MED-ELE' },
    { id: 'MBA', name: 'Master of Business Administration', short: 'MBA' },
    { id: 'S&H', name: 'Science and Humanities', short: 'S&H' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background-soft to-background">
      <Header />
      <div className='py-20 px-6 md:px-12 max-w-7xl mx-auto'>
        <h1 className="font-audiowide text-4xl md:text-6xl lg:text-7xl bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-6 text-center">
          Special Events & Workshops
        </h1>

        <p className='text-muted-text text-center font-space text-lg mb-8'>
          Special competitions, workshops, and exclusive events with custom pricing
        </p>

        {/* Filters */}
        <div className="mb-8 flex flex-col md:flex-row justify-center items-center gap-6">
          {/* Category Filter */}
          <div className="flex flex-wrap justify-center gap-3">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setCategoryFilter(cat.id)}
                className={`px-5 py-2.5 rounded-lg font-audiowide text-sm transition-all duration-300 ${categoryFilter === cat.id
                  ? 'bg-gradient-to-r from-primary to-secondary text-white'
                  : 'bg-background-soft border border-border text-muted-text hover:border-primary'
                  }`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          {/* Department Dropdown */}
          <CustomDropdown
            value={departmentFilter}
            onChange={setDepartmentFilter}
            options={departments}
            placeholder="Select Department"
          />
        </div>

        {/* Info Box for Special Events */}
        <div className="max-w-4xl mx-auto mb-12 bg-gradient-to-r from-secondary/10 via-accent/10 to-secondary/10 border-2 border-secondary/30 rounded-2xl p-6 backdrop-blur-sm">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 mt-1">
              <div className="bg-secondary/20 p-3 rounded-full">
                <Info className="w-6 h-6 text-secondary" />
              </div>
            </div>
            <div className="flex-1">
              <h3 className="font-audiowide text-xl text-white mb-3 flex items-center gap-2">
                ⭐ Special Events - Individual Pricing
              </h3>
              <p className="text-muted-text font-space leading-relaxed mb-3">
                These are <span className="text-secondary font-semibold">special events</span> with individual pricing. <span className="text-white font-semibold">Add events to your cart</span> and purchase them together!
              </p>
              <p className="text-muted-text font-space leading-relaxed text-sm mb-2">
                🛒 <span className="text-white font-semibold">Add to Cart:</span> Select multiple events and checkout together
              </p>
              <p className="text-muted-text font-space leading-relaxed text-sm">
                🎟️ <span className="text-white font-semibold">Custom Pass:</span> Purchase multiple special events in one go for convenience
              </p>
            </div>
          </div>
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
          <div className="space-y-16">
            {departments.filter(dept => dept.id !== 'all').map((dept) => {
              // Filter events for this department that match current filters
              const deptEvents = filteredEvents.filter(event => event.department === dept.id);
              
              // Skip if no events for this department
              if (deptEvents.length === 0) return null;
              
              return (
                <section key={dept.id} className="space-y-6">
                  {/* Department Header */}
                  <div className="text-center md:text-left">
                    <h2 className="font-audiowide text-3xl md:text-4xl bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-2">
                      {dept.name}
                    </h2>
                    <div className="h-1 w-24 bg-gradient-to-r from-primary to-secondary rounded-full mx-auto md:mx-0"></div>
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
};

export default SpecialEventsPage;
