"use client";
import React from "react";
import Header from "@/components/Header";
import Hero from "./Hero";
import About from "./About";
import Events from "./Events";
import StatsSection from "./StatsSection";
import GuestSection from "./GuestSection";
import Sponsors from "./Sponsors";
import Footer from "../../components/Footer";

const Home = () => {
  return (
    <div className=" h-screen ">
      <Header />
      <Hero />
      <About />
      <Events />
      <StatsSection />
      <GuestSection />
      <Sponsors />
      <Footer />
    </div>
  );
};

export default Home;
