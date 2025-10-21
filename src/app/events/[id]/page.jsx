"use client";
import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import EventRegistrationModal from "@/components/EventRegistrationModal";
import {
  Calendar,
  Clock,
  MapPin,
  Trophy,
  FileText,
  Phone,
  Mail,
  ArrowLeft,
} from "lucide-react";

const EventDetailPage = () => {
  const params = useParams();
  const router = useRouter();
  const [event, setEvent] = useState(null);
  const [isRegistered, setIsRegistered] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showRegistrationModal, setShowRegistrationModal] = useState(false);

  // Fetch event data from Firestore
  useEffect(() => {
    const fetchEvent = async () => {
      if (!params.id) return;

      try {
        setLoading(true);
        const eventDoc = doc(db, "events", params.id);
        const eventSnapshot = await getDoc(eventDoc);

        if (eventSnapshot.exists()) {
          const eventData = { id: eventSnapshot.id, ...eventSnapshot.data() };
          setEvent(eventData);
        } else {
          console.log("No event found with this ID");
          setEvent(null);
        }
      } catch (error) {
        console.error("Error fetching event:", error);
        setEvent(null);
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [params.id]);

  // Handle registration
  // const handleRegistration = async () => {
  //     if (isRegistered) {
  //         setIsRegistered(false)
  //         return
  //     }

  //     // Prompt user for registration details
  //     const name = prompt("Enter your full name:");
  //     if (!name || name.trim() === "") {
  //         alert("Name is required for registration");
  //         return;
  //     }

  //     const email = prompt("Enter your email address:");
  //     if (!email || email.trim() === "") {
  //         alert("Email is required for registration");
  //         return;
  //     }

  //     // Basic email validation
  //     const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  //     if (!emailRegex.test(email)) {
  //         alert("Please enter a valid email address");
  //         return;
  //     }

  //     try {
  //         const response = await fetch('/api/registrations', {
  //             method: 'POST',
  //             headers: {
  //                 'Content-Type': 'application/json'
  //             },
  //             body: JSON.stringify({
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background-soft to-background flex flex-col">
        <Header />
        <div className="text-center h-[calc(100vh-80px)] flex flex-col items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
          <h1 className="font-audiowide text-2xl text-white">Loading Event...</h1>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background-soft to-background flex flex-col">
        <Header />
        <div className="text-center h-[calc(100vh-80px)] flex flex-col items-center justify-center">
          <h1 className="font-audiowide text-4xl text-white mb-4">Event Not Found</h1>
          <button
            onClick={() => router.push("/events")}
            className="cursor-pointer bg-primary text-white px-6 py-3 rounded-lg font-audiowide hover:bg-hover-primary transition-colors duration-300"
          >
            Back to Events
          </button>
        </div>
      </div>
    );
  }

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background-soft to-background">
      <Header />

      <div className="py-20 px-6 md:px-12 max-w-6xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => router.push("/events")}
          className="flex items-center gap-2 text-muted-text hover:text-primary transition-colors mb-8 font-space"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Events
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
              <div className="flex items-center gap-2 mb-4">
                <span className="bg-primary/20 text-primary px-3 py-1 rounded-full text-xs font-audiowide uppercase">
                  {event.category}
                </span>
              </div>
              <h1 className="font-audiowide text-3xl md:text-4xl bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-4">
                {event.title}
              </h1>
            </div>

            {/* Quick Info */}
            <div className="space-y-3">
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
            <div className="w-full bg-primary/10 border border-primary/30 rounded-xl py-4 text-center">
              <p className="text-primary font-audiowide text-lg">🎉 Registration Opens Soon!</p>
              <p className="text-muted-text font-space text-sm mt-2">Stay tuned for updates</p>
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
            <p className="text-muted-text font-space leading-relaxed whitespace-pre-line">
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
          (event.facultyCoordinators && event.facultyCoordinators.length > 0) ||
          event.contact) && (
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
                          <a
                            href={`tel:${coordinator.phone}`}
                            className="flex items-center gap-2 text-muted-text hover:text-white transition-colors font-space text-sm"
                          >
                            <Phone className="w-4 h-4" />
                            {coordinator.phone}
                          </a>
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
                      {event.facultyCoordinator.phone && (
                        <a
                          href={`tel:${event.facultyCoordinator.phone}`}
                          className="flex items-center gap-2 text-muted-text hover:text-white transition-colors font-space text-sm"
                        >
                          <Phone className="w-4 h-4" />
                          {event.facultyCoordinator.phone}
                        </a>
                      )}
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
              {!event.studentCoordinators && event.contact && (
                <div>
                  <p className="font-audiowide text-sm text-primary mb-3">
                    Coordinator
                  </p>
                  <div className="bg-background rounded-lg p-4 space-y-2">
                    <p className="text-white font-space font-semibold">{event.contact.name}</p>
                    <div className="space-y-1">
                      <a
                        href={`tel:${event.contact.phone}`}
                        className="flex items-center gap-2 text-muted-text hover:text-white transition-colors font-space text-sm"
                      >
                        <Phone className="w-4 h-4" />
                        {event.contact.phone}
                      </a>
                      {event.contact.email && (
                        <a
                          href={`mailto:${event.contact.email}`}
                          className="flex items-center gap-2 text-muted-text hover:text-white transition-colors font-space text-sm"
                        >
                          <Mail className="w-4 h-4" />
                          {event.contact.email}
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Registration Modal */}
      {showRegistrationModal && !isExpired && (
        <EventRegistrationModal
          event={event}
          showCloseButton={true}
          allowBackdropClose={true}
          onClose={() => setShowRegistrationModal(false)}
          onRegistrationSuccess={() => {
            setIsRegistered(true);
            setEvent((prev) =>
              prev
                ? {
                    ...prev,
                    participationCount: (prev.participationCount || 0) + 1,
                  }
                : prev
            );
          }}
        />
      )}

      <Footer />
    </div>
  );
};

export default EventDetailPage;
