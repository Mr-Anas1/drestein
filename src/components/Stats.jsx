"use client";
import React, { useState, useEffect, useRef } from "react";

const Stats = ({ value, title }) => {
  const [count, setCount] = useState(0);
  const [hasAnimated, setHasAnimated] = useState(false);
  const statsRef = useRef(null);

  // Parse the value - handle numbers, strings like "10,00,000", and "10L", "5K", etc.
  const parseValue = (val) => {
    if (typeof val === 'number') return val;
    if (typeof val === 'string') {
      // Check if it has suffix like L, K, M, B
      const suffixMatch = val.match(/^([\d,]+)([LKMB])$/i);
      if (suffixMatch) {
        const num = parseInt(suffixMatch[1].replace(/,/g, ''), 10);
        const suffix = suffixMatch[2].toUpperCase();
        // Don't multiply for display purposes, just return the base number
        return num;
      }
      // Regular number with commas
      return parseInt(val.replace(/,/g, ''), 10);
    }
    return 0;
  };

  const formatValue = (val) => {
    // Check if original value has suffix
    if (typeof value === 'string') {
      const suffixMatch = value.match(/^([\d,]+)([LKMB])$/i);
      if (suffixMatch) {
        return val + suffixMatch[2];
      }
      if (value.includes(',')) {
        // Format with commas for large numbers
        return val.toLocaleString('en-IN');
      }
    }
    return val;
  };

  const targetValue = parseValue(value);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasAnimated) {
            setHasAnimated(true);
            animateCount();
          }
        });
      },
      { threshold: 0.5 }
    );

    if (statsRef.current) {
      observer.observe(statsRef.current);
    }

    return () => {
      if (statsRef.current) {
        observer.unobserve(statsRef.current);
      }
    };
  }, [hasAnimated]);

  const animateCount = () => {
    const duration = 2000; // 2 seconds
    const steps = 60;
    const increment = targetValue / steps;
    let currentStep = 0;

    const timer = setInterval(() => {
      currentStep++;
      const newCount = Math.min(Math.floor(increment * currentStep), targetValue);
      setCount(newCount);

      if (currentStep >= steps) {
        clearInterval(timer);
        setCount(targetValue);
      }
    }, duration / steps);
  };

  return (
    <div ref={statsRef} className="flex flex-col items-center justify-center gap-4 group">
      {/* Card Background with Gradient Border */}
      <div className="relative w-full max-w-xs">
        {/* Animated Gradient Border */}
        <div className="absolute inset-0 bg-gradient-to-r from-primary via-secondary to-primary rounded-3xl p-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-sm"></div>
        
        {/* Card Content */}
        <div className="relative bg-gradient-to-br from-background-soft/90 to-background/80 backdrop-blur-xl border border-border/40 group-hover:border-primary/60 rounded-3xl px-8 py-8 transition-all duration-300 hover:shadow-2xl hover:shadow-primary/30 hover:-translate-y-1">
          <div className="text-center space-y-3">
            {/* Number with Gradient */}
            <div className="font-audiowide text-6xl md:text-7xl font-bold bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent group-hover:scale-110 transition-transform duration-300 leading-tight">
              {formatValue(count)}+
            </div>
            
            {/* Title */}
            <p className="font-audiowide md:text-lg text-base text-muted-text group-hover:text-white transition-colors duration-300 uppercase tracking-widest font-semibold">
              {title}
            </p>
            
            {/* Decorative Line */}
            <div className="h-1 w-12 bg-gradient-to-r from-primary to-secondary rounded-full mx-auto opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Stats;
