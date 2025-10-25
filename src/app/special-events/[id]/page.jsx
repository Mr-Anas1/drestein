"use client";
import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Image from "next/image";
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  DollarSign,
  Trophy,
  FileText,
  Phone,
  Mail,
  ArrowLeft,
  Info,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import SpecialEventRegistrationModal from "@/components/SpecialEventRegistrationModal";
import { getDepartmentName } from "@/constants/departments";

const SpecialEventDetailPage = () => {
  const params = useParams();
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showRegistrationModal, setShowRegistrationModal] = useState(false);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/special-events?id=${params.id}`);

        if (!response.ok) {
          throw new Error("Event not found");
        }

        const data = await response.json();
        setEvent(data);
      } catch (err) {
        console.error("Error fetching event:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchEvent();
    }
  }, [params.id]);

  const isExpired = (() => {
    const raw = event?.expiryDate;
    if (!raw) return false;
    const d = new Date(raw);
    if (isNaN(d.getTime())) return false;
    const end = new Date(d);
    if (String(raw).length <= 10 && /\d{4}-\d{2}-\d{2}/.test(String(raw)))
      end.setHours(23, 59, 59, 999);
    return new Date() > end;
  })();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-white font-audiowide text-xl">Loading...</div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 font-audiowide text-xl mb-4">
            Event not found
          </div>
          <button
            onClick={() => router.back()}
            className="text-primary hover:text-hover-primary font-space"
          >
            Back to Special Events
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background-soft to-background">
      <Header />

      <div className="py-20 px-6 md:px-12 max-w-6xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => {
            if (typeof window !== "undefined" && window.history.length > 1) {
              router.back();
            } else {
              router.push("/special-events");
            }
          }}
          className="flex items-center gap-2 text-muted-text hover:text-primary transition-colors mb-8 font-space"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Special Events
        </button>

        {/* Hero Section */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {/* Image */}
          <div className="relative h-[400px] rounded-2xl overflow-hidden border border-border">
            <Image
              src={event.img || "/images/default-event.jpg"}
              fill
              style={{ objectFit: "cover" }}
              alt={event.title}
            />
          </div>

          {/* Event Info Card */}
          <div className="bg-background-soft border border-border rounded-2xl p-8 space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-4 flex-wrap">
                <span className="bg-primary/20 text-primary px-3 py-1 rounded-full text-xs font-audiowide uppercase">
                  {event.category}
                </span>
                <span className="bg-secondary/20 text-secondary px-3 py-1 rounded-full text-xs font-audiowide uppercase">
                  {event.mode}
                </span>
                {event.department && (
                  <span className="bg-accent/20 text-accent px-3 py-1 rounded-full text-xs font-audiowide uppercase">
                    {getDepartmentName(event.department)}
                  </span>
                )}
              </div>
              <h1 className="font-audiowide text-3xl md:text-4xl bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-4">
                {event.title}
              </h1>
              {/* <p className="text-muted-text font-space text-lg">
                {event.description}
              </p> */}
            </div>

            {/* Quick Info */}
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-white font-space">
                <DollarSign className="w-5 h-5 text-primary" />
                <span className="font-audiowide text-2xl">₹{event.price}</span>
              </div>

              {event.type && (
                <div className="flex items-center gap-3 text-muted-text font-space">
                  <Users className="w-5 h-5 text-primary" />
                  <span>
                    {event.type === "team"
                      ? `Team Event (Max ${event.maxTeamSize || 4} members)`
                      : "Individual Event"}
                  </span>
                </div>
              )}

              {event.venue && (
                <div className="flex items-center gap-3 text-muted-text font-space">
                  <MapPin className="w-5 h-5 text-primary" />
                  <span>{event.venue}</span>
                </div>
              )}

              {event.date && (
                <div className="flex items-center gap-3 text-muted-text font-space">
                  <Calendar className="w-5 h-5 text-primary" />
                  <span>{event.date}</span>
                </div>
              )}

              {event.time && (
                <div className="flex items-center gap-3 text-muted-text font-space">
                  <Clock className="w-5 h-5 text-primary" />
                  <span>{event.time}</span>
                </div>
              )}
            </div>

            {/* Register Button */}
            <button
              onClick={() => setShowRegistrationModal(true)}
              disabled={isExpired}
              className={`w-full ${
                isExpired
                  ? "bg-background-soft border border-border text-muted-text"
                  : "bg-gradient-to-r from-primary to-secondary text-white hover:from-hover-primary hover:to-primary"
              } font-audiowide py-4 rounded-xl transition-all duration-300 ${
                isExpired ? "" : "transform hover:scale-105"
              }`}
            >
              {isExpired
                ? "Registration Closed"
                : `Register Now - ₹${event.price}`}
            </button>
            
            <div className="w-full bg-primary/10 border border-primary/30 rounded-xl py-4 text-center">
              <p className="text-primary font-audiowide text-lg">🎉 Registration Opens Soon!</p>
              <p className="text-muted-text font-space text-sm mt-2">Stay tuned for updates</p>
            </div>
          </div>
        </div>

        {/* Info Box for Special Event Pricing */}
        <div className="mb-8 bg-gradient-to-r from-secondary/10 via-accent/10 to-secondary/10 border-2 border-secondary/30 rounded-2xl p-6 backdrop-blur-sm">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 mt-1">
              <div className="bg-secondary/20 p-3 rounded-full">
                <Info className="w-6 h-6 text-secondary" />
              </div>
            </div>
            <div className="flex-1">
              <h3 className="font-audiowide text-lg md:text-xl text-white mb-3">
                ⭐ Premium Event - Add to Cart
              </h3>
              <p className="text-muted-text font-space leading-relaxed mb-3">
                This is a <span className="text-secondary font-semibold">premium special event</span> priced at <span className="text-white font-semibold">₹{event.price}</span>. Add it to your cart and purchase along with other special events!
              </p>
              <div className="space-y-2">
                <p className="text-muted-text font-space  leading-relaxed">
                  🛒 <span className="text-white font-semibold">Add to Cart:</span> Select this and other events, then checkout together
                </p>
                <p className="text-muted-text font-space leading-relaxed ">
                  🎟️ <span className="text-white font-semibold">Custom Pass:</span> Purchase multiple special events in one convenient transaction
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Description Section */}
        {(event.description || event.fullDescription) && (
          <div className="bg-background-soft border border-border rounded-2xl p-8 mb-8">
            <h2 className="font-audiowide text-2xl text-white mb-4 flex items-center gap-2">
              <FileText className="w-6 h-6 text-primary" />
              About this event
            </h2>
            <p className="text-muted-text text-md md:text-lg font-space leading-relaxed whitespace-pre-line">
              {event.description || event.fullDescription}
            </p>
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-8">
          {/* Rules */}
          {event.rules && event.rules.length > 0 && (
            <div className="bg-background-soft border border-border rounded-2xl p-8">
              <h2 className="font-audiowide text-2xl text-white mb-6 flex items-center gap-2">
                <FileText className="w-6 h-6 text-primary" />
                Rules & Guidelines
              </h2>
              <ul className="space-y-3">
                {event.rules.map((rule, index) => (
                  <li
                    key={index}
                    className="flex items-start gap-3 text-muted-text font-space"
                  >
                    <span className="text-primary mt-1">•</span>
                    <span>{rule}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Prizes */}
          {event.prizes && event.prizes.length > 0 && (
            <div className="bg-background-soft border border-border rounded-2xl p-8">
              <h2 className="font-audiowide text-2xl text-white mb-6 flex items-center gap-2">
                <Trophy className="w-6 h-6 text-primary" />
                Prizes
              </h2>
              <ul className="space-y-3">
                {event.prizes.map((prize, index) => (
                  <li
                    key={index}
                    className="flex items-start gap-3 text-muted-text font-space"
                  >
                    <span className="text-primary font-audiowide">
                      {index + 1}.
                    </span>
                    <span>{prize}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Contact Info */}
        {((event.studentCoordinators && event.studentCoordinators.length > 0) || 
          (event.facultyCoordinator && event.facultyCoordinator.name) || 
          event.contactEmail || event.contactPhone) && (
          <div className="mt-8 bg-background-soft border border-border rounded-2xl p-8">
            <h2 className="font-audiowide text-2xl text-white mb-6">
              Contact Information
            </h2>
            <div className="space-y-6">
              {/* Student Coordinators */}
              {event.studentCoordinators && event.studentCoordinators.length > 0 && (
                <div>
                  <p className="font-audiowide text-sm text-primary mb-3">
                    Student Coordinators
                  </p>
                  <div className="grid md:grid-cols-2 gap-4">
                    {event.studentCoordinators.map((coordinator, index) => (
                      <div key={index} className="bg-background rounded-lg p-4 space-y-2">
                        <p className="text-white font-space font-semibold">{coordinator.name}</p>
                        <div className="space-y-1">
                          {coordinator.phone && (
                            <a
                              href={`tel:${coordinator.phone}`}
                              className="flex items-center gap-2 text-muted-text hover:text-white transition-colors font-space text-sm"
                            >
                              <Phone className="w-4 h-4" />
                              {coordinator.phone}
                            </a>
                          )}
                          {coordinator.email && (
                            <a
                              href={`mailto:${coordinator.email}`}
                              className="flex items-center gap-2 text-muted-text hover:text-white transition-colors font-space text-sm"
                            >
                              <Mail className="w-4 h-4" />
                              {coordinator.email}
                            </a>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Faculty Coordinators */}
              {event.facultyCoordinators && event.facultyCoordinators.length > 0 && (
                <div>
                  <p className="font-audiowide text-sm text-secondary mb-3">
                    Faculty Coordinators
                  </p>
                  <div className="grid md:grid-cols-2 gap-4">
                    {event.facultyCoordinators.map((coordinator, index) => (
                      <div key={index} className="bg-background rounded-lg p-4 space-y-2">
                        <p className="text-white font-space font-semibold">{coordinator.name}</p>
                        <div className="space-y-1">
                          {coordinator.phone && (
                            <a
                              href={`tel:${coordinator.phone}`}
                              className="flex items-center gap-2 text-muted-text hover:text-white transition-colors font-space text-sm"
                            >
                              <Phone className="w-4 h-4" />
                              {coordinator.phone}
                            </a>
                          )}
                          {coordinator.email && (
                            <a
                              href={`mailto:${coordinator.email}`}
                              className="flex items-center gap-2 text-muted-text hover:text-white transition-colors font-space text-sm"
                            >
                              <Mail className="w-4 h-4" />
                              {coordinator.email}
                            </a>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Fallback for old single faculty coordinator */}
              {!event.facultyCoordinators && event.facultyCoordinator && event.facultyCoordinator.name && (
                <div>
                  <p className="font-audiowide text-sm text-secondary mb-3">
                    Faculty Coordinator
                  </p>
                  <div className="bg-background rounded-lg p-4 space-y-2">
                    <p className="text-white font-space font-semibold">{event.facultyCoordinator.name}</p>
                    <div className="space-y-1">
                      <a
                        href={`tel:${event.facultyCoordinator.phone}`}
                        className="flex items-center gap-2 text-muted-text hover:text-white transition-colors font-space text-sm"
                      >
                        <Phone className="w-4 h-4" />
                        {event.facultyCoordinator.phone}
                      </a>
                      {event.facultyCoordinator.email && (
                        <a
                          href={`mailto:${event.facultyCoordinator.email}`}
                          className="flex items-center gap-2 text-muted-text hover:text-white transition-colors font-space text-sm"
                        >
                          <Mail className="w-4 h-4" />
                          {event.facultyCoordinator.email}
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Fallback for old contact structure */}
              {!event.studentCoordinators && (event.contactEmail || event.contactPhone) && (
                <div className="grid md:grid-cols-2 gap-4">
                  {event.contactEmail && (
                    <div className="flex items-center gap-3 text-muted-text font-space">
                      <Mail className="w-5 h-5 text-primary" />
                      <a
                        href={`mailto:${event.contactEmail}`}
                        className="hover:text-primary transition-colors"
                      >
                        {event.contactEmail}
                      </a>
                    </div>
                  )}
                  {event.contactPhone && (
                    <div className="flex items-center gap-3 text-muted-text font-space">
                      <Phone className="w-5 h-5 text-primary" />
                      <a
                        href={`tel:${event.contactPhone}`}
                        className="hover:text-primary transition-colors"
                      >
                        {event.contactPhone}
                      </a>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <Footer />

      {/* Registration Modal */}
      {showRegistrationModal && !isExpired && (
        <SpecialEventRegistrationModal
          event={event}
          onClose={() => setShowRegistrationModal(false)}
          onSuccess={() => {
            setShowRegistrationModal(false);
            // Optionally redirect or show success message
          }}
        />
      )}
    </div>
  );
};

export default SpecialEventDetailPage;
