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
    <div className="bg-white border border-[#005696]/20 rounded-2xl p-6 md:p-8 shadow-sm">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <p className="text-[#232F3E]/60 text-sm uppercase tracking-wider font-sans mb-1">
            Countdown
          </p>
          <h3 className="font-poppins text-2xl md:text-3xl text-[#232F3E]">
            Time Reamaining
          </h3>
        </div>

        <div className="bg-[#C5934C] text-white rounded-xl px-6 py-4 flex items-baseline justify-center gap-2 shadow-lg w-full md:w-auto">
          <span className="font-poppins text-4xl md:text-5xl tracking-wider">
            {pad2(hours)}:{pad2(minutes)}:{pad2(seconds)}
          </span>
        </div>
      </div>
    </div>
  );
}
