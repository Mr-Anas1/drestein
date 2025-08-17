"use client";
import React from 'react';

const FloatingShapes = () => {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {/* Large gradient orbs */}
      <div className="absolute top-20 left-10 w-96 h-96 bg-gradient-to-br from-primary/20 to-transparent rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-20 right-10 w-80 h-80 bg-gradient-to-br from-secondary/20 to-transparent rounded-full blur-3xl animate-pulse delay-1000"></div>
      <div className="absolute top-1/2 left-1/3 w-64 h-64 bg-gradient-to-br from-accent/15 to-transparent rounded-full blur-2xl animate-pulse delay-2000"></div>
      
      {/* Floating geometric shapes */}
      <div className="absolute top-1/4 left-1/4 w-4 h-4 border border-primary/40 rotate-45 animate-floating"></div>
      <div className="absolute top-3/4 left-1/5 w-6 h-6 border border-secondary/40 animate-floating delay-500"></div>
      <div className="absolute top-1/3 right-1/4 w-3 h-3 bg-accent/30 rotate-45 animate-floating delay-1000"></div>
      <div className="absolute bottom-1/4 right-1/3 w-5 h-5 border border-accent/40 rounded-full animate-floating delay-1500"></div>
      <div className="absolute top-1/2 right-1/5 w-4 h-4 bg-primary/20 animate-floating delay-2000"></div>
      <div className="absolute bottom-1/3 left-1/6 w-6 h-6 border border-secondary/30 rotate-12 animate-floating delay-2500"></div>
      
      {/* Moving lines */}
      <div className="absolute top-0 left-1/4 w-px h-full bg-gradient-to-b from-transparent via-primary/20 to-transparent animate-pulse"></div>
      <div className="absolute top-0 right-1/3 w-px h-full bg-gradient-to-b from-transparent via-accent/20 to-transparent animate-pulse delay-1000"></div>
      
      {/* Grid pattern overlay */}
      <div 
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: `
            linear-gradient(rgba(159, 60, 255, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(159, 60, 255, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px'
        }}
      ></div>
    </div>
  );
};

export default FloatingShapes;
