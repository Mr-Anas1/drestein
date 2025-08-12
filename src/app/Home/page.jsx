"use client";
import React from "react";
import Header from "@/components/Header";
import Hero from "./Hero";
import About from "./About";

const Home = () => {
  return (
    <div className=" h-screen ">
      <Header />
      <Hero />
      <About />
    </div>
  );
};

export default Home;
