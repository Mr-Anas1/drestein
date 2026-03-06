"use client";

import React, { useEffect, useMemo, useState } from "react";

const API_ENDPOINT = "/api/ascend-countdown";
const DURATION_HOURS = 24;

function pad2(n) {
  return String(n).padStart(2, "0");
}

export default function AiAscendAdminPage() {
  const durationMs = DURATION_HOURS * 60 * 60 * 1000;
  const [state, setLocalState] = useState({ status: "idle" });
  const [nowMs, setNowMs] = useState(() => Date.now());
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const fetchState = async () => {
      try {
        const res = await fetch(API_ENDPOINT, { cache: "no-store" });
        if (!res.ok) return;
        const data = await res.json();
        if (!isMounted) return;
        setLocalState(data);
      } catch {
        // ignore
      }
    };

    fetchState();
    const id = setInterval(fetchState, 3000);

    return () => {
      isMounted = false;
      clearInterval(id);
    };
  }, []);

  useEffect(() => {
    const id = setInterval(() => setNowMs(Date.now()), 250);
    return () => clearInterval(id);
  }, []);

  const remainingMs = useMemo(() => {
    if (state?.status === "running" && typeof state?.startAtMs === "number") {
      const end = state.startAtMs + durationMs;
      return Math.max(0, end - nowMs);
    }

    if (state?.status === "stopped" && typeof state?.pausedRemainingMs === "number") {
      return Math.max(0, Math.min(durationMs, state.pausedRemainingMs));
    }

    return durationMs;
  }, [state, durationMs, nowMs]);

  const totalSeconds = Math.floor(remainingMs / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const sendAction = async (action) => {
    setBusy(true);
    setError("");
    try {
      const { getAuth } = await import("firebase/auth");
      const auth = getAuth();
      const currentUser = auth.currentUser;
      if (!currentUser) throw new Error("Login required");

      const token = await currentUser.getIdToken();
      const res = await fetch(API_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ action }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || "Failed");
      setLocalState(data);
    } catch (e) {
      setError(e?.message || "Failed");
    } finally {
      setBusy(false);
    }
  };

  const onStart = () => sendAction("start");
  const onStop = () => sendAction("stop");
  const onReset = () => sendAction("reset");

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-5xl mx-auto px-6 py-14">
        <div className="rounded-3xl p-[2px] bg-gradient-to-r from-[#C5934C] via-[#FF9900] to-[#005696] shadow-2xl">
          <div className="bg-[#1a2332] rounded-3xl px-6 py-10 md:px-12 md:py-14 text-center">
            <p className="text-white/70 text-sm md:text-base uppercase tracking-[0.25em] font-sans mb-3">
              AI Ascend Countdown Control
            </p>
            <h1 className="font-poppins text-3xl md:text-5xl text-white mb-6">
              Admin Timer Panel
            </h1>

            <div className="flex items-center justify-center mb-6">
              <div className="bg-[#C5934C] text-white rounded-2xl px-6 py-5 md:px-10 md:py-7 shadow-xl">
                <span className="font-poppins text-5xl sm:text-6xl md:text-7xl tracking-widest tabular-nums">
                  {pad2(hours)}:{pad2(minutes)}:{pad2(seconds)}
                </span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3">
              <button
                type="button"
                onClick={onStart}
                disabled={busy}
                className="bg-[#005696] hover:bg-[#004b82] disabled:opacity-60 text-white font-poppins px-6 py-4 rounded-xl shadow-lg transition-colors"
              >
                Start
              </button>
              <button
                type="button"
                onClick={onStop}
                disabled={busy}
                className="bg-[#BE3228] hover:bg-[#a02820] disabled:opacity-60 text-white font-poppins px-6 py-4 rounded-xl shadow-lg transition-colors"
              >
                Stop
              </button>
              <button
                type="button"
                onClick={onReset}
                disabled={busy}
                className="bg-white/10 hover:bg-white/20 disabled:opacity-60 text-white font-poppins px-6 py-4 rounded-xl shadow-lg transition-colors border border-white/20"
              >
                Reset
              </button>
            </div>

            {error ? (
              <p className="mt-6 text-center text-white/90 font-sans">
                {error}
              </p>
            ) : null}

            <div className="mt-8 text-left bg-white/5 rounded-2xl p-6 border border-white/10">
              <p className="text-white/70 font-sans text-sm mb-2">
                Current state:
              </p>
              <pre className="text-white/80 text-xs overflow-x-auto">
                {JSON.stringify(state, null, 2)}
              </pre>
              <p className="text-white/60 font-sans text-xs mt-4">
                Note: This controls the global timer via Firestore (super admin only).
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
