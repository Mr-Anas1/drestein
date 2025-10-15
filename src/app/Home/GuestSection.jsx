"use client";
import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import Reveal from "@/components/Reveal";

const guests = [
  {
    name: "Miracle Korsgaard",
    title: "CEO & COO at Zonlo",
    img: "/man1.png",
  },
  {
    name: "Davis George",
    title: "Co-Founder at Pino",
    img: "women1.png",
  },
  {
    name: "Ryan Dias",
    title: "Founder at Plun",
    img: "man2.png",
  },
  {
    name: "Kierra Culhane",
    title: "CEO & Co-Founder at Aero",
    img: "women2.png",
  },
];

const GuestSection = () => {
  return (
    <div className="flex flex-col items-center justify-center h-fit w-full">
      <div className="flex flex-col items-center justify-center gap-8 w-full">
        <Reveal effect="fade-up">
          <h1 className="font-audiowide text-[32px] md:text-[64px] bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent text-center">
            Guests
          </h1>
        </Reveal>

        <Reveal effect="fade-up" delay={100} className="w-[90%] md:w-[80%]">
          <Swiper
            modules={[Navigation, Pagination]}
            spaceBetween={30}
            slidesPerView={1}
            breakpoints={{
              768: { slidesPerView: 2 },
              1024: { slidesPerView: 3 },
            }}
            navigation
          >
            {guests.map((guest, index) => (
              <SwiperSlide key={index}>
                <Reveal effect="fade-up" delay={index * 100}>
                  <div
                    className="bg-[#1a0b2e] rounded-2xl overflow-hidden shadow-lg text-white text-center p-6 
                    transform transition duration-300 hover:scale-105 hover:shadow-2xl"
                  >
                    <img
                      src={guest.img}
                      alt={guest.name}
                      className="w-full h-64 object-cover rounded-xl transition duration-300 hover:opacity-90"
                    />
                    <h2 className="mt-4 text-xl font-bold transition duration-300 group-hover:text-primary">
                      {guest.name}
                    </h2>
                    <p className="text-secondary">{guest.title}</p>
                  </div>
                </Reveal>
              </SwiperSlide>
            ))}
          </Swiper>
        </Reveal>
      </div>
    </div>
  );
};

export default GuestSection;
