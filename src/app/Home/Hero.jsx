"use client";
import React, { Suspense, useEffect, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import MyModel from "@/components/MyModel";


const Hero = () => {
  const [modelScale, setModelScale] = useState([1.8, 1.8, 1.8]);
  const [cameraPos, setCameraPos] = useState([5, 5, 5]);
  const [width, setWidth] = useState(600);

  useEffect(() => {
    function handleResize() {
      const width = window.innerWidth;

      if (width < 640) {
        setWidth(350);
      } else if (width < 1024 && width >= 640) {
        setWidth(450);
      } else {
        setWidth(600);
      }
    }

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="min-h-screen md:mb-12 overflow-hidden relative">
      {/* Background Effects */}


      <div className="flex flex-col-reverse lg:flex-row items-center justify-between w-full h-[calc(100vh-80px)] px-4 md:px-12 relative z-10">
        {/* Left Section */}
        <div className="flex-1 flex flex-col gap-6 justify-center items-center lg:items-start h-full">
          <h1 className="text-center lg:text-left text-[32px] md:text-[64px] leading-[1.1] font-audiowide text-white animate-slide-in">
            <span className="text-primary animate-glow">DR</span>EA
            <span className="text-secondary animate-glow">M</span> D
            <span className="text-accent animate-glow">ES</span>IGN COMPE
            <span className="text-yellow-400 animate-glow">TE</span> W
            <span className="text-green-400 animate-glow">IN</span> 20
            <span className="text-yellow-400 animate-glow">25</span>
          </h1>

          <p className="text-center lg:text-left text-white font-space text-md md:text-lg animate-slide-in opacity-90">
            15th National Level Inter Collegiate Technical and Management Fest
          </p>

          <button className="bg-primary w-[150px] md:w-[250px] text-white rounded-lg hover:bg-hover-primary hover:scale-105 hover:shadow-lg hover:shadow-primary/30 transition-all duration-300 py-2 md:py-3 cursor-pointer font-audiowide animate-slide-in">
            Register
          </button>
        </div>

        {/* Right Section */}
        <div className="flex-1 flex items-center justify-center h-full w-full">
          <Canvas
            style={{ width: "100%", height: "100%", minHeight: "400px" }}
            camera={{ position: [5, 5, 5], fov: 50 }}
            className="cursor-grab w-full h-full"
          >
            <ambientLight />
            <directionalLight position={[1, 1, 1]} intensity={1} />
            <Suspense fallback={null}>
              <MyModel scale={[2, 2, 2]} position={[0, -1, 0]} />
            </Suspense>
            <OrbitControls enablePan={false} enableZoom={false} />
          </Canvas>
        </div>
      </div>
    </div>
  );
};

export default Hero;
