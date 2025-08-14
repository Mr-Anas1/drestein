"use client";
import React from "react";
import Header from "@/components/Header";
import Hero from "./Hero";
import About from "./About";
import Events from "./Events";

const Home = () => {
  return (
    <div className=" h-screen ">
      <Header />
      <Hero />
      <About />
      <Events />
    </div>
  );
};

export default Home;
