"use client";

import React, { useEffect, useMemo, useState } from "react";

function pad2(n) {
  return String(n).padStart(2, "0");
}

function parseStartAt(startAt) {
  if (!startAt) return null;
  if (startAt instanceof Date) return startAt;
  if (typeof startAt === "number") return new Date(startAt);
  if (typeof startAt === "string") {
    const d = new Date(startAt);
    if (!Number.isNaN(d.getTime())) return d;
  }
  return null;
}

export default function AscendCountdown24h({
  enabled = false,
  startAt = null,
  durationHours = 24,
}) {
  const durationMs = durationHours * 60 * 60 * 1000;

  const startDate = useMemo(() => parseStartAt(startAt), [startAt]);
  const endTimeMs = useMemo(() => {
    if (!enabled) return null;
    const base = (startDate ?? new Date()).getTime();
    return base + durationMs;
  }, [enabled, startDate, durationMs]);

  const [nowMs, setNowMs] = useState(() => Date.now());

  useEffect(() => {
    if (!enabled) return;

    const id = setInterval(() => {
      setNowMs(Date.now());
    }, 250);

    return () => clearInterval(id);
  }, [enabled]);

  const remainingMs = useMemo(() => {
    if (!enabled || !endTimeMs) return durationMs;
    return Math.max(0, endTimeMs - nowMs);
  }, [enabled, endTimeMs, nowMs, durationMs]);

  const totalSeconds = Math.floor(remainingMs / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return (
    <div className="rounded-3xl p-[2px] bg-gradient-to-r from-[#C5934C] via-[#FF9900] to-[#005696] shadow-2xl">
      <div className="bg-[#1a2332] rounded-3xl px-6 py-10 md:px-12 md:py-14 text-center">
        <p className="text-white/70 text-sm md:text-base uppercase tracking-[0.25em] font-sans mb-3">
          Countdown
        </p>
        <h3 className="font-poppins text-3xl md:text-5xl text-white mb-6">
          Time Remaining
        </h3>

        <div className="flex items-center justify-center">
          <div className="bg-[#C5934C] text-white rounded-2xl px-6 py-5 md:px-10 md:py-7 shadow-xl">
            <span className="font-poppins text-5xl sm:text-6xl md:text-7xl lg:text-8xl tracking-widest tabular-nums">
              {pad2(hours)}:{pad2(minutes)}:{pad2(seconds)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
