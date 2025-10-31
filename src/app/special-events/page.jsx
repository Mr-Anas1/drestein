"use client";
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import SpecialEventBox from '@/components/SpecialEventBox';
import { useEffect, useState, useMemo } from 'react';
import { DEPARTMENTS } from '@/constants/departments';
import CustomDropdown from '@/components/CustomDropdown';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { auth } from '@/lib/firebase';

const SpecialEventsPage = () => {
  const { studentProfile, isSuperAdmin } = useAuth();
  const [competitions, setCompetitions] = useState([]);
  const [workshops, setWorkshops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isQuotaExceeded, setIsQuotaExceeded] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [bulkUpdating, setBulkUpdating] = useState(false);

  const handleBulkSetVisibleToEveryone = async () => {
    if (!isSuperAdmin) return;
    const ok = window.confirm('Set ALL special events visible to both students and non-students?');
    if (!ok) return;
    try {
      setBulkUpdating(true);
      const token = await auth.currentUser?.getIdToken?.();
      const res = await fetch('/api/special-events', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ isForStudents: true, isForNonStudents: true }),
      });
      if (!res.ok) {
        // Try to read JSON error; if not JSON, read text
        let errMsg = 'Bulk update failed';
        try {
          const data = await res.json();
          errMsg = data?.error || errMsg;
        } catch {
          try {
            errMsg = await res.text();
          } catch { }
        }
        throw new Error(errMsg);
      }
      const data = await res.json();
      // Refresh list
      window.alert(`Updated ${data.updated} special events.`);
      if (typeof window !== 'undefined') {
        window.location.reload();
      }
    } catch (e) {
      console.error('Bulk update error:', e);
      window.alert(e.message || 'Bulk update failed');
    } finally {
      setBulkUpdating(false);
    }
  };

  useEffect(() => {
    const fetchSpecialEvents = async () => {
      try {
        setLoading(true);
        setError(null);
        setIsQuotaExceeded(false);

        // Fetch all special events
        const res = await fetch('/api/special-events');
        if (!res.ok) throw new Error('Failed to fetch special events');

        const data = await res.json();
        const eventsArray = data?.events || data || [];

        if (!Array.isArray(eventsArray)) {
          throw new Error('Invalid events format');
        }

        console.log('Fetched events:', eventsArray);

        // Filter events based on user's student status
        const userIsStudent = studentProfile?.isStudent !== false; // Default to true if not specified

        const filteredEvents = eventsArray.filter(e => {
          const forStudents = e.isForStudents !== false; // Default true if not specified
          const forNonStudents = e.isForNonStudents === true;

          // If both checkboxes are checked or neither is checked, show to everyone
          if ((forStudents && forNonStudents) || (!forStudents && !forNonStudents)) {
            return true;
          }

          // If only one checkbox is checked, filter based on user status
          if (userIsStudent) {
            return forStudents;
          } else {
            return forNonStudents;
          }
        });

        // Separate competitions and workshops
        const comps = filteredEvents.filter(event =>
          String(event.category || '').toLowerCase() === 'competition' ||
          String(event.category || '').toLowerCase() === 'other'
        );

        const workshps = filteredEvents.filter(event =>
          String(event.category || '').toLowerCase() === 'workshop'
        );

        setCompetitions(comps);
        setWorkshops(workshps);
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

    fetchSpecialEvents();
  }, [studentProfile]);


  // Group competitions by department (handle both array and string formats)
  const competitionsByDept = useMemo(() => {
    const grouped = {};
    competitions.forEach(event => {
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
  }, [competitions]);

  // Group workshops by department
  const workshopsByDept = useMemo(() => {
    const grouped = {};
    workshops.forEach(event => {
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
  }, [workshops]);

  // Get departments that have events
  const deptsWithCompetitions = DEPARTMENTS.filter(dept => competitionsByDept[dept.id]);
  const deptsWithWorkshops = DEPARTMENTS.filter(dept => workshopsByDept[dept.id]);
  // Apply dropdown filter
  const filteredCompetitionDepts = selectedDepartment === 'all'
    ? deptsWithCompetitions
    : deptsWithCompetitions.filter(d => d.id === selectedDepartment);
  const filteredWorkshopDepts = selectedDepartment === 'all'
    ? deptsWithWorkshops
    : deptsWithWorkshops.filter(d => d.id === selectedDepartment);

  // Check if there are events without department info
  const hasCommonCompetitions = competitionsByDept['COMMON'] && competitionsByDept['COMMON'].length > 0;
  const hasCommonWorkshops = workshopsByDept['COMMON'] && workshopsByDept['COMMON'].length > 0;

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

        {/* {isSuperAdmin && (
          <div className="flex justify-center mb-6">
            <button
              onClick={handleBulkSetVisibleToEveryone}
              disabled={bulkUpdating}
              className={`font-audiowide px-5 py-2 rounded-lg border transition-all duration-200 ${bulkUpdating ? 'opacity-60 cursor-not-allowed' : 'hover:border-primary'} bg-background-soft border-border text-white`}
              title="Set all special events visible to both students and non-students"
            >
              {bulkUpdating ? 'Updating…' : 'Make All Special Events Visible to Everyone'}
            </button>
          </div>
        )} */}

        {/* Department filter moved below competitions; now filters workshops only */}

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

        {!loading && !error && !isQuotaExceeded && competitions.length === 0 && workshops.length === 0 && (
          <div className="flex justify-center items-center py-20">
            <div className="text-muted-text text-lg font-space">No special events available yet</div>
          </div>
        )}

        {!loading && !error && !isQuotaExceeded && (competitions.length > 0 || workshops.length > 0) && (
          <div className="space-y-20">
            {/* Competitions Section */}
            {(competitions.length > 0 || hasCommonCompetitions) && (
              <section className="space-y-8">
                <div className="text-center">
                  <h2 className="font-audiowide text-4xl md:text-5xl bg-gradient-to-r from-secondary to-primary bg-clip-text text-transparent mb-4">
                    Competitions
                  </h2>
                  <div className="h-1 w-32 bg-gradient-to-r from-secondary to-primary rounded-full mx-auto"></div>
                </div>

                <div className="space-y-16">
                  {deptsWithCompetitions.map((dept) => {
                    const deptEvents = competitionsByDept[dept.id];
                    return (
                      <div key={dept.id} className="space-y-6">
                        <div className="text-center md:text-left">
                          <h3 className="font-audiowide text-2xl md:text-3xl text-white mb-2">
                            {dept.name} Competitions
                          </h3>
                          <div className="h-1 w-20 bg-gradient-to-r from-secondary to-primary rounded-full mx-auto md:mx-0"></div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 justify-items-center">
                          {deptEvents.map((event) => (
                            <SpecialEventBox
                              key={`comp-${dept.id}-${event.id}`}
                              event={event}
                            />
                          ))}
                        </div>
                      </div>
                    );
                  })}

                  {hasCommonCompetitions && (
                    <div className="space-y-6">
                      <div className="text-center md:text-left">
                        <h3 className="font-audiowide text-2xl md:text-3xl text-white mb-2">
                          General Competitions
                        </h3>
                        <div className="h-1 w-20 bg-gradient-to-r from-secondary to-primary rounded-full mx-auto md:mx-0"></div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 justify-items-center">
                        {competitionsByDept['COMMON'].map((event) => (
                          <SpecialEventBox
                            key={event.id}
                            event={event}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </section>
            )}

            {/* Workshops Filter Dropdown (applies to workshops only) */}
            <div className="flex justify-center mb-8 mt-2">
              <CustomDropdown
                value={selectedDepartment}
                onChange={setSelectedDepartment}
                options={[
                  { id: 'all', name: 'All Departments', short: 'ALL' },
                  ...DEPARTMENTS
                ]}
                placeholder="Filter Workshops by Department"
              />
            </div>

            {/* Workshops Section */}
            {(workshops.length > 0 || (hasCommonWorkshops && selectedDepartment === 'all')) && (
              <section className="space-y-8 pt-10 border-t border-gray-800">
                <div className="text-center">
                  <h2 className="font-audiowide text-4xl md:text-5xl bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent mb-4">
                    Workshops
                  </h2>
                  <div className="h-1 w-32 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full mx-auto"></div>
                </div>

                <div className="space-y-16">
                  {filteredWorkshopDepts.map((dept) => {
                    const deptEvents = workshopsByDept[dept.id];
                    return (
                      <div key={dept.id} className="space-y-6">
                        <div className="text-center md:text-left">
                          <h3 className="font-audiowide text-2xl md:text-3xl text-white mb-2">
                            {dept.name} Workshops
                          </h3>
                          <div className="h-1 w-20 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full mx-auto md:mx-0"></div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 justify-items-center">
                          {deptEvents.map((event) => (
                            <SpecialEventBox
                              key={`workshop-${dept.id}-${event.id}`}
                              event={event}
                            />
                          ))}
                        </div>
                      </div>
                    );
                  })}

                  {hasCommonWorkshops && selectedDepartment === 'all' && (
                    <div className="space-y-6">
                      <div className="text-center md:text-left">
                        <h3 className="font-audiowide text-2xl md:text-3xl text-white mb-2">
                          General Workshops
                        </h3>
                        <div className="h-1 w-20 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full mx-auto md:mx-0"></div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 justify-items-center">
                        {workshopsByDept['COMMON'].map((event) => (
                          <SpecialEventBox
                            key={event.id}
                            event={event}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </section>
            )}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}

export default SpecialEventsPage;
