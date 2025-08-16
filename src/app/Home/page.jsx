"use client";
import React from "react";
import Header from "@/components/Header";
import Hero from "./Hero";
import About from "./About";
import Events from "./Events";
import StatsSection from "./StatsSection";

const Home = () => {
  return (
    <div className=" h-screen ">
      <Header />
      <Hero />
      <About />
      <Events />
      <StatsSection />
    </div>
  );
};

export default Home;
