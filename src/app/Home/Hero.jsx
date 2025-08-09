"use client";
import React, { Suspense, useEffect, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import MyModel from "@/components/MyModel";

const Hero = () => {
  const [modelScale, setModelScale] = useState([1.8, 1.8, 1.8]);

  return (
    <div className="min-h-[calc(100vh-80px)] bg-background overflow-hidden">
      <div className="flex flex-col-reverse lg:flex-row items-center justify-between w-full h-full px-4 md:px-12">
        {/* Left Section */}
        <div className="flex-1 max-w-[600px] flex flex-col gap-6 justify-center items-center md:items-start py-12 md:py-0">
          <h1 className="text-center md:text-left text-[32px] md:text-[64px] leading-[1.1] font-audiowide text-white">
            <span className="text-primary">DR</span>EA
            <span className="text-secondary">M</span> D
            <span className="text-accent">ES</span>IGN COMPE
            <span className="text-yellow-400">TE</span> W
            <span className="text-green-400">IN</span> 20
            <span className="text-yellow-400">25</span>
          </h1>

          <p className="text-center md:text-left text-white font-space text-md md:text-lg">
            15th National Level Inter Collegiate Technical and Management Fest
          </p>

          <button className="bg-primary w-[150px] md:w-[250px] text-white rounded-lg hover:bg-hover-primary transition duration-300 py-2 md:py-3 cursor-pointer font-audiowide">
            Register
          </button>
        </div>

        {/* Right Section */}
        <div className="flex-1 w-full h-[calc(100vh-80px)] flex items-center justify-center overflow-hidden">
          <Canvas
            className="w-full h-full cursor-grab"
            camera={{ position: [5, 5, 5], fov: 50 }}
          >
            <ambientLight />
            <directionalLight position={[1, 1, 1]} intensity={1} />
            <Suspense fallback={null}>
              <MyModel scale={modelScale} position={[0, -1, 0]} />
            </Suspense>
            <OrbitControls enablePan={false} enableZoom={false} />
          </Canvas>
        </div>
      </div>
    </div>
  );
};

export default Hero;
