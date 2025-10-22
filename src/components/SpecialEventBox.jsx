"use client";
import React, { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { DollarSign, Users, MapPin, Calendar } from "lucide-react";

const SpecialEventBox = ({ event }) => {
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
    <div className="group relative bg-background-soft border border-border rounded-3xl p-6 w-[280px] md:w-[320px] h-[500px] flex flex-col overflow-hidden hover:border-primary transition-all duration-500 hover:transform hover:scale-105 hover:shadow-2xl hover:shadow-primary/20">
      {/* Gradient Background Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

      {/* Floating Glow Effect */}
      <div className="absolute -top-2 -right-2 w-20 h-20 bg-gradient-to-r from-primary to-secondary rounded-full opacity-20 blur-xl group-hover:opacity-40 transition-opacity duration-500"></div>

      {/* Price Badge */}
      <div className="absolute top-4 right-4 z-20 bg-gradient-to-r from-primary to-secondary text-white px-3 py-1 rounded-full text-sm font-audiowide flex items-center gap-1">
          ₹{price}
      </div>

      {/* Category & Department Badges */}
      <div className="absolute top-4 left-4 z-20 flex flex-col gap-2">
        <div className="bg-background/80 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs font-audiowide uppercase">
          {category}
        </div>
        {department && (
          <div className="bg-secondary/80 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs font-audiowide uppercase">
            {department}
          </div>
        )}
      </div>

      {isExpired && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 bg-red-500/90 text-white px-3 py-1 rounded-full text-xs font-audiowide">
          Registration Closed
        </div>
      )}

      {/* Image Container */}
      <div className="relative w-full h-48 mb-6 rounded-2xl overflow-hidden bg-gradient-to-br from-background to-background-soft">
        <div className="absolute inset-2">
          <Image
            src={img || "/images/default-event.jpg"}
            fill
            style={{ objectFit: "cover" }}
            className="rounded-xl group-hover:scale-110 transition-transform duration-500"
            alt={title}
          />
        </div>
        {/* Image Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-background/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      </div>

      {/* Content Container */}
      <div className="relative z-10 flex flex-col flex-1 justify-between">
        <div className="space-y-4">
          <h2 className="font-audiowide text-xl md:text-2xl bg-gradient-to-r from-white to-muted-text bg-clip-text text-transparent group-hover:from-primary group-hover:to-secondary transition-all duration-300">
            {title}
          </h2>
          <p className="font-space text-sm md:text-base text-muted-text leading-relaxed line-clamp-3 group-hover:text-white transition-colors duration-300">
            {description}
          </p>

          {/* Event Info */}
          <div className="flex flex-wrap gap-2">
            {type && (
              <div className="flex items-center gap-1 text-xs text-muted-text bg-background/50 px-2 py-1 rounded">
                <Users className="w-3 h-3" />
                {type === "team"
                  ? `Team (Max ${maxTeamSize || 4})`
                  : "Individual"}
              </div>
            )}
            {mode && (
              <div className="flex items-center gap-1 text-xs text-muted-text bg-background/50 px-2 py-1 rounded">
                <MapPin className="w-3 h-3" />
                {mode}
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 space-y-2">
          <button
            onClick={() => router.push(`/special-events/${id}`)}
            disabled={isExpired}
            className={`w-full ${
              isExpired
                ? "bg-background-soft border border-border text-muted-text"
                : "bg-gradient-to-r from-primary to-secondary text-white hover:from-hover-primary hover:to-primary"
            } font-audiowide text-sm py-3 px-4 rounded-xl transition-all duration-300 ${
              isExpired ? "" : "transform hover:scale-105"
            }`}
          >
            {isExpired ? "Registration Closed" : "View Details & Register"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SpecialEventBox;
