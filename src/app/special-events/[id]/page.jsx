"use client";
import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Image from 'next/image';
import { Calendar, Clock, MapPin, Users, DollarSign, Trophy, FileText, Phone, Mail, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import SpecialEventRegistrationModal from '@/components/SpecialEventRegistrationModal';

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
          throw new Error('Event not found');
        }

        const data = await response.json();
        setEvent(data);
      } catch (err) {
        console.error('Error fetching event:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchEvent();
    }
  }, [params.id]);

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
          <div className="text-red-500 font-audiowide text-xl mb-4">Event not found</div>
          <button
            onClick={() => router.push('/special-events')}
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
          onClick={() => router.push('/special-events')}
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
              src={event.img || '/images/default-event.jpg'}
              fill
              style={{ objectFit: 'cover' }}
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
                <span className="bg-secondary/20 text-secondary px-3 py-1 rounded-full text-xs font-audiowide uppercase">
                  {event.mode}
                </span>
              </div>
              <h1 className="font-audiowide text-3xl md:text-4xl bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-4">
                {event.title}
              </h1>
              <p className="text-muted-text font-space text-lg">{event.description}</p>
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
                  <span>{event.type === 'team' ? `Team Event (Max ${event.maxTeamSize || 4} members)` : 'Individual Event'}</span>
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
              className="w-full bg-gradient-to-r from-primary to-secondary text-white font-audiowide py-4 rounded-xl hover:from-hover-primary hover:to-primary transition-all duration-300 transform hover:scale-105"
            >
              Register Now - ₹{event.price}
            </button>
          </div>
        </div>

        {/* Details Sections */}
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
                  <li key={index} className="flex items-start gap-3 text-muted-text font-space">
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
                  <li key={index} className="flex items-start gap-3 text-muted-text font-space">
                    <span className="text-primary font-audiowide">{index + 1}.</span>
                    <span>{prize}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Contact Info */}
        {(event.contactEmail || event.contactPhone) && (
          <div className="mt-8 bg-background-soft border border-border rounded-2xl p-8">
            <h2 className="font-audiowide text-2xl text-white mb-6">Contact Information</h2>
            <div className="grid md:grid-cols-2 gap-4">
              {event.contactEmail && (
                <div className="flex items-center gap-3 text-muted-text font-space">
                  <Mail className="w-5 h-5 text-primary" />
                  <a href={`mailto:${event.contactEmail}`} className="hover:text-primary transition-colors">
                    {event.contactEmail}
                  </a>
                </div>
              )}
              {event.contactPhone && (
                <div className="flex items-center gap-3 text-muted-text font-space">
                  <Phone className="w-5 h-5 text-primary" />
                  <a href={`tel:${event.contactPhone}`} className="hover:text-primary transition-colors">
                    {event.contactPhone}
                  </a>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <Footer />

      {/* Registration Modal */}
      {showRegistrationModal && (
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
