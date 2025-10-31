"use client";

import { useEffect, useState } from "react";
import { X, Info, Sparkles, Ticket, Users } from "lucide-react";

export default function LoadingScreen() {
  const [showLoading, setShowLoading] = useState(true);
  const [showInfo, setShowInfo] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Show loading for minimum 2 seconds, then show info popup
    const loadingTimer = setTimeout(() => {
      setIsLoading(false);
      setShowInfo(true);
    }, 2000);

    // Check if user has already seen the info popup
    const hasSeenInfo = localStorage.getItem('hasSeenSECInfo');
    if (hasSeenInfo) {
      clearTimeout(loadingTimer);
      setShowLoading(false);
      setShowInfo(false);
    }

    return () => clearTimeout(loadingTimer);
  }, []);

  const handleCloseInfo = () => {
    setShowInfo(false);
    localStorage.setItem('hasSeenSECInfo', 'true');
    setTimeout(() => {
      setShowLoading(false);
    }, 300);
  };

  if (!showLoading) return null;

  return (
    <div className="fixed inset-0 z-[9999] bg-background flex items-center justify-center">
      {/* Loading Screen */}
      {isLoading && (
        <div className="text-center">
          <div className="relative mb-8 flex justify-center items-center">
            <div className="w-24 h-24 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <Sparkles className="w-8 h-8 text-primary animate-pulse" />
            </div>
          </div>
          <h1 className="font-audiowide text-3xl md:text-4xl bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-4">
            Welcome to DRESTEIN 2025
          </h1>
          <p className="text-muted-text font-space text-lg">
            Loading amazing events and experiences...
          </p>
        </div>
      )}

      {/* Info Popup */}
      {showInfo && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-background-soft border border-border rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto transform transition-all duration-300 scale-100 animate-slideUp">
            <div className="flex justify-between items-start mb-6">
              <div className="flex items-center gap-3">
                <div className="bg-primary/20 p-3 rounded-full">
                  <Info className="w-6 h-6 text-primary" />
                </div>
                <h2 className="font-audiowide text-2xl text-white">
                  Important Information for Students
                </h2>
              </div>
              <button
                onClick={handleCloseInfo}
                className="text-muted-text hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-6">
              {/* SEC Students Section */}
              <div className="bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/30 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Users className="w-6 h-6 text-primary" />
                  <h3 className="font-audiowide text-xl text-white">SEC Students</h3>
                </div>
                <div className="space-y-3">
                  <p className="text-white font-space leading-relaxed">
                    <span className="font-semibold text-primary">Great news!</span> As an SEC student, you can attend <span className="font-semibold text-primary">all the premium events absolutely free</span> of cost!
                  </p>
                  <p className="text-muted-text font-space leading-relaxed">
                    Just fill out the Google Form shared by your mentor to register for the required events — and don’t forget to attend them!                  </p>
                  <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 mt-4">
                    <p className="text-primary font-semibold font-space flex items-center gap-2">
                      <Ticket className="w-5 h-5" />
                      Note: Only workshops & special events require payment for SEC students
                    </p>
                  </div>
                </div>
              </div>

              {/* Other College Students Section */}
              <div className="bg-gradient-to-r from-secondary/10 to-secondary/5 border border-secondary/30 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Sparkles className="w-6 h-6 text-secondary" />
                  <h3 className="font-audiowide text-xl text-white">Other College Students</h3>
                </div>
                <div className="space-y-3">
                  <p className="text-white font-space leading-relaxed">
                    Welcome to DRESTEIN 2025! You'll need passes to attend events:
                  </p>
                  <ul className="space-y-2 text-muted-text font-space">
                    <li className="flex items-start gap-2">
                      <span className="text-secondary mt-1">•</span>
                      <span><span className="font-semibold text-secondary">Common Pass (₹300):</span> Access all regular events on Nov 7-8, 2025</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-secondary mt-1">•</span>
                      <span><span className="font-semibold text-secondary">Custom Pass:</span> Pick the events and workshops you love and join in on the fun!</span>
                    </li>

                  </ul>
                </div>
              </div>

              {/* Action Button */}
              <div className="text-center pt-4">
                <button
                  onClick={handleCloseInfo}
                  className="bg-gradient-to-r from-primary to-secondary text-white font-audiowide px-8 py-3 rounded-lg hover:from-hover-primary hover:to-primary transition-all duration-300 transform hover:scale-105"
                >
                  Got it, Let's Explore!
                </button>
                <p className="text-muted-text font-space text-sm mt-3">
                  You can always find this information in the Events section
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { 
            opacity: 0;
            transform: translateY(20px);
          }
          to { 
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-in-out;
        }
        .animate-slideUp {
          animation: slideUp 0.4s ease-out;
        }
      `}</style>
    </div>
  );
}
