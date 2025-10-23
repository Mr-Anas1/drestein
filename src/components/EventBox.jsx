"use client";
import React, { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Calendar, Clock } from "lucide-react";
import EventRegistrationModal from "./EventRegistrationModal";

const EventBox = React.memo(({ img, title, description, link, id, event }) => {
  const router = useRouter();
  const [showRegistrationModal, setShowRegistrationModal] = useState(false);
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
    <div className="group relative bg-background-soft border border-border rounded-3xl p-6 w-[280px] md:w-[320px] h-[450px] flex flex-col overflow-hidden hover:border-primary transition-all duration-500 hover:transform hover:scale-105 hover:shadow-2xl hover:shadow-primary/20">
      {/* Gradient Background Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

      {/* Floating Glow Effect */}
      <div className="absolute -top-2 -right-2 w-20 h-20 bg-gradient-to-r from-primary to-secondary rounded-full opacity-20 blur-xl group-hover:opacity-40 transition-opacity duration-500"></div>

      {/* Image Container */}
      <div className="relative w-full h-48 mb-6 rounded-2xl overflow-hidden bg-gradient-to-br from-background to-background-soft flex-shrink-0">
        <div className="absolute inset-2">
          <Image
            src={img || "/images/default-event.jpg"}
            fill
            style={{ objectFit: "cover" }}
            className="rounded-xl group-hover:scale-110 transition-transform duration-500"
            alt={title}
            loading="lazy"
            sizes="(max-width: 768px) 280px, 320px"
          />
        </div>
        {/* Image Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-background/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        {isExpired && (
          <div className="absolute top-3 left-3 z-10 bg-red-500/90 text-white px-3 py-1 rounded-full text-xs font-audiowide">
            Registration Closed
          </div>
        )}
      </div>

      {/* Content Container */}
      <div className="relative z-10 flex flex-col flex-1 justify-between min-h-0">
        <div className="space-y-3 flex-shrink overflow-hidden">
          <h2 
            className="font-audiowide text-xl md:text-2xl bg-gradient-to-r from-white to-muted-text bg-clip-text text-transparent group-hover:from-primary group-hover:to-secondary transition-all duration-300 line-clamp-2"
            title={title}
          >
            {title}
          </h2>
          
          {/* Date and Time Info */}
          <div className="space-y-2">
            {event?.isMultiDay && event?.startDate && event?.endDate ? (
              <div className="flex items-center gap-2 text-xs text-muted-text bg-background/50 px-3 py-1.5 rounded w-fit">
                <Calendar className="w-3.5 h-3.5" />
                <span>{new Date(event.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {new Date(event.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
              </div>
            ) : event?.date ? (
              <div className="flex items-center gap-2 text-xs text-muted-text bg-background/50 px-3 py-1.5 rounded w-fit">
                <Calendar className="w-3.5 h-3.5" />
                <span>{new Date(event.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
              </div>
            ) : null}
            
            {event?.time && (
              <div className="flex items-center gap-2 text-xs text-muted-text bg-background/50 px-3 py-1.5 rounded w-fit">
                <Clock className="w-3.5 h-3.5" />
                <span>{event.time}</span>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-4 flex-shrink-0">
          <button
            className="w-full bg-background-soft border border-border text-white font-audiowide text-sm py-2 px-4 rounded-xl hover:bg-background transition-all duration-300"
            onClick={() => router.push(`/events/${id}`)}
          >
            View Details
          </button>
        </div>
      </div>

      {/* Bottom Accent Line */}
      <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-secondary to-accent transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-center"></div>
    </div>
  );
});

EventBox.displayName = 'EventBox';

export default EventBox;
