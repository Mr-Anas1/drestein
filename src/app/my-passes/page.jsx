'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Ticket, Download, Calendar, CheckCircle, Loader2, AlertCircle, QrCode } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { auth } from '@/lib/firebase';

export default function MyPassesPage() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuth();
  const [passes, setPasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [specialEventsMap, setSpecialEventsMap] = useState({});

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/');
      return;
    }
    fetchPasses();
  }, [isAuthenticated]);

  const fetchPasses = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const idToken = await auth.currentUser?.getIdToken();
      if (!idToken) throw new Error('Not authenticated');

      const response = await fetch(`/api/passes?userUid=${user.uid}`, {
        headers: {
          'Authorization': `Bearer ${idToken}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch passes');
      }

      const data = await response.json();
      
      // Handle both single pass (old format) and multiple passes (new format)
      if (data.passes) {
        setPasses(data.passes);
      } else if (data.pass) {
        setPasses([data.pass]);
      } else {
        setPasses([]);
      }

      // Fetch special events for custom pass details
      const specialEvRes = await fetch('/api/special-events');
      if (specialEvRes.ok) {
        const specialEvents = await specialEvRes.json();
        const specialMap = {};
        for (const ev of specialEvents) specialMap[ev.id] = ev;
        setSpecialEventsMap(specialMap);
      }
    } catch (err) {
      console.error('Error fetching passes:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const downloadTicket = async (passId) => {
    try {
      const idToken = await auth.currentUser?.getIdToken();
      
      const response = await fetch('/api/tickets/generate-simple', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`,
        },
        body: JSON.stringify({ passId }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate ticket');
      }

      const data = await response.json();
      
      // Open ticket in new tab with passId parameter
      router.push(`/view-ticket?passId=${passId}`);
    } catch (err) {
      console.error('Error downloading ticket:', err);
      alert('Failed to download ticket. Please try again.');
    }
  };

  const getPassTypeInfo = (pass) => {
    // Default to general pass info
    const passType = pass.passType || 'general';
    
    const passTypes = {
      general: {
        name: 'General Pass',
        description: 'Access to all events',
        dates: 'November 7-8, 2025',
        events: 'All technical, non-technical, and cultural events',
        color: 'from-primary to-secondary',
      },
      workshop: {
        name: 'Workshop Pass',
        description: 'Access to all workshops',
        dates: 'November 7-8, 2025',
        events: 'All workshop sessions',
        color: 'from-purple-500 to-pink-500',
      },
      custom: {
        name: pass.passName || 'Custom Pass',
        description: `Access to ${pass.customEvents?.length || 0} selected special events`,
        dates: 'November 7-8, 2025',
        events: pass.customEvents?.length > 0 
          ? `${pass.customEvents.length} premium events` 
          : 'Custom selected events',
        color: 'from-secondary to-primary',
      },
    };

    return passTypes[passType] || passTypes.general;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-white">
        <Header />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto mb-4" />
            <p className="text-muted-text font-space">Loading your passes...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-white">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 py-16">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-audiowide mb-4 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            My Passes
          </h1>
          <p className="text-muted-text font-space">
            View and download your event passes
          </p>
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6 mb-8 flex items-start gap-3">
            <AlertCircle className="w-6 h-6 text-red-500 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-audiowide text-red-500 mb-1">Error Loading Passes</h3>
              <p className="text-muted-text font-space text-sm">{error}</p>
            </div>
          </div>
        )}

        {/* No Passes State */}
        {!error && passes.length === 0 && (
          <div className="bg-background-soft border border-border rounded-2xl p-12 text-center">
            <div className="inline-block p-6 bg-primary/10 rounded-full mb-6">
              <Ticket className="w-16 h-16 text-primary" />
            </div>
            <h2 className="text-2xl font-audiowide mb-4">No Passes Yet</h2>
            <p className="text-muted-text font-space mb-8 max-w-md mx-auto">
              You haven't purchased any event passes yet. Get your pass to access all DRESTEIN events!
            </p>
            <button
              onClick={() => router.push('/buy-pass')}
              className="bg-gradient-to-r from-primary to-secondary text-white font-audiowide px-8 py-3 rounded-lg hover:from-hover-primary hover:to-primary transition-all duration-300"
            >
              Buy Pass Now
            </button>
          </div>
        )}

        {/* Passes Grid */}
        {!error && passes.length > 0 && (
          <div className="grid md:grid-cols-2 gap-8">
            {passes.map((pass) => {
              const passInfo = getPassTypeInfo(pass);
              const isActive = pass.status === 'active' || pass.paymentVerified;
              
              return (
                <div
                  key={pass.id}
                  className="bg-background-soft border border-border rounded-2xl overflow-hidden hover:border-primary transition-all duration-300"
                >
                  {/* Pass Header */}
                  <div className={`bg-gradient-to-r ${passInfo.color} p-6 text-white`}>
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-2xl font-audiowide mb-2">{passInfo.name}</h3>
                        <p className="text-white/80 font-space text-sm">{passInfo.description}</p>
                      </div>
                      <Ticket className="w-10 h-10" />
                    </div>
                    
                    {isActive && (
                      <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full">
                        <CheckCircle className="w-4 h-4" />
                        <span className="text-sm font-audiowide">Active</span>
                      </div>
                    )}
                  </div>

                  {/* Pass Details */}
                  <div className="p-6">
                    <div className="space-y-4 mb-6">
                      <div className="flex items-start gap-3">
                        <Calendar className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                        <div>
                          <div className="text-sm text-muted-text font-space">Valid Dates</div>
                          <div className="text-white font-space">{passInfo.dates}</div>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <Ticket className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                        <div>
                          <div className="text-sm text-muted-text font-space">Access To</div>
                          <div className="text-white font-space">{passInfo.events}</div>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <QrCode className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                        <div>
                          <div className="text-sm text-muted-text font-space">Pass ID</div>
                          <div className="text-white font-mono text-sm">{pass.id}</div>
                        </div>
                      </div>
                    </div>

                    {/* Custom Events List */}
                    {pass.passType === 'custom' && pass.customEvents && pass.customEvents.length > 0 && (
                      <div className="bg-background border border-border rounded-lg p-4 mb-6">
                        <div className="text-sm text-muted-text font-space mb-3">Included Special Events:</div>
                        <div className="space-y-2">
                          {pass.customEvents.map((eventId, index) => {
                            const event = specialEventsMap[eventId];
                            return (
                              <div key={eventId} className="flex items-center justify-between text-sm">
                                <div className="flex items-center gap-2">
                                  <span className="text-secondary font-audiowide">{index + 1}.</span>
                                  <span className="text-white font-space">{event?.title || 'Event'}</span>
                                </div>
                                {event && (
                                  <span className="text-primary font-audiowide text-xs">₹{event.price}</span>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Purchase Info */}
                    <div className="bg-background border border-border rounded-lg p-4 mb-6">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <div className="text-muted-text font-space mb-1">Amount Paid</div>
                          <div className="text-white font-audiowide">₹{pass.passPrice || pass.amount || '250'}</div>
                        </div>
                        <div>
                          <div className="text-muted-text font-space mb-1">Status</div>
                          <div className={`font-audiowide ${isActive ? 'text-green-500' : 'text-yellow-500'}`}>
                            {isActive ? 'Verified' : pass.status || 'Pending'}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    {isActive && (
                      <button
                        onClick={() => downloadTicket(pass.id)}
                        className="w-full bg-gradient-to-r from-primary to-secondary text-white font-audiowide py-3 rounded-lg hover:from-hover-primary hover:to-primary transition-all duration-300 flex items-center justify-center gap-2"
                      >
                        <Download className="w-5 h-5" />
                        Download Ticket
                      </button>
                    )}

                    {!isActive && (
                      <div className="text-center text-muted-text font-space text-sm">
                        Your payment is being verified. Please check back in a few minutes.
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Additional Info */}
        {passes.length > 0 && (
          <div className="mt-12 bg-background-soft border border-border rounded-xl p-6">
            <h3 className="font-audiowide text-lg mb-4 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-primary" />
              Important Information
            </h3>
            <ul className="space-y-2 text-muted-text font-space text-sm">
              <li>• Please carry a printed or digital copy of your pass to the event</li>
              <li>• Your pass QR code will be scanned at the entrance</li>
              <li>• Each pass is valid for one person only</li>
              <li>• Lost passes can be re-downloaded from this page</li>
              <li>• For any issues, contact support at the event venue</li>
            </ul>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
