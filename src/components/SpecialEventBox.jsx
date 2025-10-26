"use client";
import React, { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { DollarSign, Users, MapPin, Calendar, Clock, ArrowRight } from "lucide-react";

const SpecialEventBox = React.memo(({ event }) => {
  const router = useRouter();
  const {
    id,
    title,
    description,
    price,
    category,
    department,
    type,
    maxTeamSize,
    mode,
    img,
  } = event;
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
    <Link 
  href={{
    pathname: `/special-events/${id}`,
    query: { eventData: JSON.stringify(event) }
  }}
  className="group"
>
      <div className="rounded-2xl p-[1px] bg-gradient-to-r from-secondary/30 to-primary/30 hover:from-secondary/60 hover:to-primary/60 transition-all duration-300 hover:-translate-y-1 h-full">
        <div className="rounded-2xl bg-background-soft border border-border/60 overflow-hidden h-full flex flex-col">
          {img && (
            <div className="relative w-full h-48 overflow-hidden">
              <Image
                src={img}
                alt={title}
                fill
                className="object-cover group-hover:scale-110 transition-transform duration-300"
              />
            </div>
          )}
          <div className="p-6 flex flex-col flex-1">
            <div className="flex items-start justify-between mb-3">
              <h3 className="font-audiowide text-xl text-white group-hover:text-secondary transition-colors flex-1">
                {title}
              </h3>
              <span className="text-primary font-audiowide text-lg ml-2">
                ₹{price}
              </span>
            </div>
            <p className="text-muted-text font-space text-sm mb-4 line-clamp-2 flex-1">
              {description}
            </p>
            <div className="space-y-2 text-sm">
              {event?.date && (
                <div className="flex items-center gap-2 text-muted-text">
                  <Calendar className="w-4 h-4 text-secondary" />
                  <span className="font-space">{event.date}</span>
                </div>
              )}
              {event?.time && (
                <div className="flex items-center gap-2 text-muted-text">
                  <Clock className="w-4 h-4 text-secondary" />
                  <span className="font-space">{event.time}</span>
                </div>
              )}
              {event?.venue && (
                <div className="flex items-center gap-2 text-muted-text">
                  <MapPin className="w-4 h-4 text-secondary" />
                  <span className="font-space">{event.venue}</span>
                </div>
              )}
              {event?.type && (
                <div className="flex items-center gap-2 text-muted-text">
                  <Users className="w-4 h-4 text-secondary" />
                  <span className="font-space capitalize">{event.type}</span>
                </div>
              )}
            </div>
            <div className="mt-4 flex items-center justify-between gap-2">
              <div className="flex gap-2">
                <span className="text-xs px-3 py-1 rounded-full bg-secondary/10 text-secondary border border-secondary/20 font-space capitalize">
                  {category}
                </span>
                <span className="text-xs px-3 py-1 rounded-full bg-secondary/20 text-secondary border border-secondary/30 font-audiowide">
                  Premium Event
                </span>
              </div>
              <ArrowRight className="w-5 h-5 text-secondary group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
});

SpecialEventBox.displayName = 'SpecialEventBox';

export default SpecialEventBox;
