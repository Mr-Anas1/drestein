"use client";
import React from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import MyModel from "@/components/MyModel";
import { Suspense } from "react";

const Hero = () => {
  return (
    <div className="flex px-4 md:px-12 items-center justify-between h-[calc(100vh-80px)] bg-background">
      <div className="w-full flex flex-1 flex-col gap-4 justify-center">
        <h1 className="text-[32px] md:text-[64px]  leading-[1.1] font-audiowide text-white">
          <span className="text-primary">DR</span>EAM D
          <span className="text-secondary">ES</span>IGN COMPE
          <span className="text-accent">TE</span> W
          <span className="text-yellow-400">IN</span> 20
          <span className="text-green-400">25</span>
        </h1>

        <p className="text-white font-space text-md md:text-lg w-md">
          15th National Level Inter Collegiate Technical and Management Fest
        </p>

        <button className="bg-primary w-[150px] md:w-[250px] text-white rounded-lg hover:bg-hover-primary transition duration-300s py-2 md:py-3 cursor-pointer font-audiowide">
          Register
        </button>
      </div>

      <div className="w-full h-full min-h-[400px] flex-1 items-center justify-center">
        <div className="w-full h-full flex items-center justify-center bg-gray-50">
          <Canvas className="bg-background">
            <ambientLight />
            <directionalLight position={[2, 2, 5]} intensity={1} />
            <MyModel position={[0, 0, 0]} />
            <OrbitControls enableZoom={false} />
            <Suspense />
          </Canvas>
        </div>
      </div>
    </div>
  );
};

export default Hero;
