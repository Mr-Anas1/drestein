"use client";
import React, { useEffect, useRef, useState } from "react";


const Reveal = ({
  children,
  effect = "fade-up",
  delay = 0,
  duration = 600,
  threshold = 0.2,
  once = true,
  className = "",
}) => {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!ref.current) return;

    // Accessibility: honor reduced motion preference
    if (typeof window !== "undefined") {
      const prefersReduced = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;
      if (prefersReduced) {
        setVisible(true);
        return;
      }
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          if (once) observer.disconnect();
        } else if (!once) {
          setVisible(false);
        }
      },
      { threshold }
    );

    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [threshold, once]);

  const base =
    "transition-all ease-out will-change-transform will-change-opacity";
  const style = {
    transitionDuration: `${duration}ms`,
    transitionDelay: `${delay}ms`,
  };

  // Keep all possible classes statically present for Tailwind JIT
  const hiddenMap = {
    "fade-up": "opacity-0 translate-y-6",
    "fade-down": "opacity-0 -translate-y-6",
    "fade-left": "opacity-0 -translate-x-6",
    "fade-right": "opacity-0 translate-x-6",
    zoom: "opacity-0 scale-95",
    fade: "opacity-0",
  };
  const visibleMap = {
    "fade-up": "opacity-100 translate-y-0",
    "fade-down": "opacity-100 -translate-y-0 translate-y-0",
    "fade-left": "opacity-100 -translate-x-0 translate-x-0",
    "fade-right": "opacity-100 translate-x-0",
    zoom: "opacity-100 scale-100",
    fade: "opacity-100",
  };

  const hidden = hiddenMap[effect] || hiddenMap["fade-up"];
  const shown = visibleMap[effect] || visibleMap["fade-up"];

  return (
    <div ref={ref} style={style} className={`${base} ${visible ? shown : hidden} ${className}`}>
      {children}
    </div>
  );
};

export default Reveal;
