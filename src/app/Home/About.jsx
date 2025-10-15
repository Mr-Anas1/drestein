"use client";
import AboutFeature from "@/components/AboutFeature";
import React from "react";
import { Rocket } from "lucide-react";
import { Code } from "lucide-react";
import { Network } from "lucide-react";
import Reveal from "@/components/Reveal";

const About = () => {
  return (
    <>
      <div className="w-screen  my-12 flex justify-center items-center flex-col">
        <Reveal effect="fade-up">
          <div className="flex flex-col items-center justify-center gap-4">
            <h1 className="font-audiowide text-center  text-[32px] md:text-[64px] bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              <span className="text-white">ABOUT </span>
              DRESTEIN
            </h1>

            <p className="text-center text-white w-[300px] md:w-3xl lg:4xl text-md md:text-xl font-space px-4">
              A premier technical festival bringing together the brightest minds
              in technology, innovation, and creativity for an unforgettable
              experience.
            </p>
          </div>
        </Reveal>

        <div className="flex flex-col md:flex-row flex-wrap px-4 gap-8 mt-12 justify-center items-center">
          <Reveal effect="fade-up" delay={0}>
            <AboutFeature
            title={"The InoInnovation Hub"}
            description={
              "Showcase cutting-edge projects and breakthrough technologies"
            }
            icon={
              <Rocket
                className="text-primary text-center animate-floating"
                style={{ animationDelay: `${Math.random() * 2}s` }}
              />
            }
            />
          </Reveal>
          <Reveal effect="fade-up" delay={100}>
            <AboutFeature
            title={"Learning Platform"}
            description={
              "Workshops, seminars, and hands-on sessions with industry experts"
            }
            icon={
              <Code
                className="text-secondary text-center animate-floating"
                style={{ animationDelay: `${Math.random() * 2}s` }}
              />
            }
            />
          </Reveal>
          <Reveal effect="fade-up" delay={200}>
            <AboutFeature
            title={"Networking Zone"}
            description={
              "Connect with like-minded individuals and industry professionals"
            }
            icon={
              <Network
                className="text-accent text-center animate-floating"
                style={{ animationDelay: `${Math.random() * 2}s` }}
              />
            }
            />
          </Reveal>
        </div>
      </div>
    </>
  );
};

export default About;
