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

function safeJsonParse(value) {
  if (!value) return null;
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

function getStorageState(storageKey) {
  if (!storageKey) return null;
  if (typeof window === "undefined") return null;
  return safeJsonParse(window.localStorage.getItem(storageKey));
}

function getDerivedStateFromStorage(storageKey, durationMs) {
  const raw = getStorageState(storageKey);
  const status = raw?.status;

  if (status === "running" && typeof raw?.startAtMs === "number") {
    return { status: "running", startAtMs: raw.startAtMs, pausedRemainingMs: null };
  }

  if (
    status === "stopped" &&
    typeof raw?.pausedRemainingMs === "number" &&
    raw.pausedRemainingMs >= 0
  ) {
    return {
      status: "stopped",
      startAtMs: null,
      pausedRemainingMs: Math.min(durationMs, raw.pausedRemainingMs),
    };
  }

  return { status: "idle", startAtMs: null, pausedRemainingMs: null };
}

export default function AscendCountdown24h({
  enabled = false,
  startAt = null,
  durationHours = 24,
  storageKey = null,
  apiEndpoint = null,
}) {
  const durationMs = durationHours * 60 * 60 * 1000;

  const startDate = useMemo(() => parseStartAt(startAt), [startAt]);
  const [storageVersion, setStorageVersion] = useState(0);
  const [apiState, setApiState] = useState(null);

  useEffect(() => {
    if (!storageKey) return;

    const onLocalUpdate = () => {
      setStorageVersion((v) => v + 1);
    };

    const onStorage = (e) => {
      if (e.key === storageKey) setStorageVersion((v) => v + 1);
    };

    window.addEventListener("storage", onStorage);
    window.addEventListener("aiascend-countdown:update", onLocalUpdate);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("aiascend-countdown:update", onLocalUpdate);
    };
  }, [storageKey]);

  useEffect(() => {
    if (!apiEndpoint) return;

    let isMounted = true;

    const fetchState = async () => {
      try {
        const res = await fetch(apiEndpoint, { cache: "no-store" });
        if (!res.ok) return;
        const data = await res.json();
        if (!isMounted) return;
        setApiState(data);
      } catch {
        // ignore
      }
    };

    fetchState();
    const id = setInterval(fetchState, 5000);

    return () => {
      isMounted = false;
      clearInterval(id);
    };
  }, [apiEndpoint]);

  const derivedStorageState = useMemo(() => {
    if (!storageKey) return null;
    return getDerivedStateFromStorage(storageKey, durationMs);
  }, [storageKey, durationMs, storageVersion]);

  const derivedApiState = useMemo(() => {
    if (!apiEndpoint) return null;
    const status = apiState?.status;

    if (status === "running" && typeof apiState?.startAtMs === "number") {
      return { status: "running", startAtMs: apiState.startAtMs, pausedRemainingMs: null };
    }

    if (status === "stopped" && typeof apiState?.pausedRemainingMs === "number") {
      return {
        status: "stopped",
        startAtMs: null,
        pausedRemainingMs: Math.min(durationMs, Math.max(0, apiState.pausedRemainingMs)),
      };
    }

    return { status: "idle", startAtMs: null, pausedRemainingMs: null };
  }, [apiEndpoint, apiState, durationMs]);

  const endTimeMs = useMemo(() => {
    if (apiEndpoint) {
      if (!derivedApiState || derivedApiState.status !== "running") return null;
      return derivedApiState.startAtMs + durationMs;
    }

    if (storageKey) {
      if (!derivedStorageState || derivedStorageState.status !== "running") return null;
      return derivedStorageState.startAtMs + durationMs;
    }

    if (!enabled) return null;
    const base = (startDate ?? new Date()).getTime();
    return base + durationMs;
  }, [apiEndpoint, derivedApiState, storageKey, derivedStorageState, durationMs, enabled, startDate]);

  const [nowMs, setNowMs] = useState(() => Date.now());

  useEffect(() => {
    const shouldTick = apiEndpoint
      ? derivedApiState?.status === "running"
      : storageKey
        ? derivedStorageState?.status === "running"
        : enabled;

    if (!shouldTick) return;

    const id = setInterval(() => {
      setNowMs(Date.now());
    }, 250);

    return () => clearInterval(id);
  }, [enabled, storageKey, derivedStorageState?.status, apiEndpoint, derivedApiState?.status]);

  const remainingMs = useMemo(() => {
    if (apiEndpoint) {
      if (!derivedApiState) return durationMs;

      if (derivedApiState.status === "stopped") {
        if (typeof derivedApiState.pausedRemainingMs === "number") {
          return Math.max(0, derivedApiState.pausedRemainingMs);
        }
        return durationMs;
      }

      if (derivedApiState.status !== "running" || !endTimeMs) return durationMs;
      return Math.max(0, endTimeMs - nowMs);
    }

    if (storageKey) {
      if (!derivedStorageState) return durationMs;

      if (derivedStorageState.status === "stopped") {
        if (typeof derivedStorageState.pausedRemainingMs === "number") {
          return Math.max(0, derivedStorageState.pausedRemainingMs);
        }
        return durationMs;
      }

      if (derivedStorageState.status !== "running" || !endTimeMs) return durationMs;
      return Math.max(0, endTimeMs - nowMs);
    }

    if (!enabled || !endTimeMs) return durationMs;
    return Math.max(0, endTimeMs - nowMs);
  }, [apiEndpoint, derivedApiState, storageKey, derivedStorageState, endTimeMs, nowMs, durationMs, enabled]);

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
