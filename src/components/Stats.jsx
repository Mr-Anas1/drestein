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
    <div ref={statsRef} className="flex flex-col items-center justify-center gap-2">
      <div className="font-audiowide text-4xl md:text-6xl font-bold text-primary">
        {formatValue(count)}+
      </div>
      <p className="font-audiowide md:text-2xl text-xl text-white">{title}</p>
    </div>
  );
};

export default Stats;
