"use client";
import Stats from "@/components/Stats";
import React from "react";
import Reveal from "@/components/Reveal";

const StatsSection = () => {
  const statData = [
    {
      value: 60,
      title: "Events",
    },
    {
      value: 5,
      title: "Speakers",
    },
    {
      value: "10L",
      title: "Prize Pool",
    },
    {
      value: 45,
      title: "Workshops",
    },
  ];
  
  return (
    <div className="py-20 px-4 md:px-8">
      {/* Section Header */}
      <div className="text-center mb-16">
        <h2 className="font-audiowide text-4xl md:text-5xl lg:text-6xl bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-4">
          Event Highlights
        </h2>
        <div className="h-1 w-24 bg-gradient-to-r from-primary to-secondary rounded-full mx-auto"></div>
      </div>
      
      {/* Stats Grid */}
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {statData.map((item, index) => (
            <Reveal effect="zoom" delay={index * 100} key={index}>
              <Stats value={item.value} title={item.title} />
            </Reveal>
          ))}
        </div>
      </div>
      
      {/* Decorative Background Elements */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute top-1/4 left-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-0 w-96 h-96 bg-secondary/5 rounded-full blur-3xl"></div>
      </div>
    </div>
  );
};

export default StatsSection;
