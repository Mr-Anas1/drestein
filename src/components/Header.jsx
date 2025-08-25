"use client";

import { AlignJustify, X } from "lucide-react";
import React, { useState } from "react";
import { useRouter } from "next/navigation";

const Header = () => {
  const [menuDisplay, setMenuDisplay] = useState(false);
  const router = useRouter();

  const toggleMenu = () => {
    setMenuDisplay(!menuDisplay);
  };

  return (
    <div className="flex justify-between items-center px-4 md:px-12 h-20 border-b border-gray-600">
      <div>
        <h1 className="text-4xl font-audiowide bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent cursor-pointer"
          onClick={() => router.push("/")}>
          DRESTEIN
        </h1>
      </div>

      <div className="flex items-center space-x-6">
        <div className="hidden items-center md:flex">
          <a
            onClick={() => router.push("/")}
            className="text-white font-audiowide hover:text-primary transition duration-300s px-4 cursor-pointer"
          >
            Home
          </a>
          <a
            onClick={() => router.push("/departments")}
            className="text-white font-audiowide hover:text-primary transition duration-300s px-4 cursor-pointer"
          >
            Departments
          </a>
          <a
            onClick={() => router.push("/events")}
            className="text-white font-audiowide hover:text-primary transition duration-300s px-4 cursor-pointer"
          >
            Events
          </a>

          <a
            onClick={() => router.push("/about")}
            className="text-white font-audiowide hover:text-primary transition duration-300s px-4 cursor-pointer"
          >
            About
          </a>
          <button className="bg-primary text-white font-audiowide hover:bg-hover-primary transition duration-300s px-6 py-2 rounded-lg">
            Register
          </button>
        </div>
        {/* menu */}
        <div className="md:hidden flex">
          {menuDisplay ? (
            <X
              className="text-white cursor-pointer"
              size={38}
              onClick={toggleMenu}
            />
          ) : (
            <AlignJustify
              className="text-white"
              size={38}
              onClick={toggleMenu}
            />
          )}
        </div>
      </div>
      {/* mobile menu */}

      {menuDisplay && (
        <div className="absolute top-20 left-0 w-full h-screen bg-gray-800 text-white p-4 flex flex-col space-y-12 py-12 overflow-hidden items-center md:hidden z-99">
          <a
            href="#home"
            className="hover:text-primary transition duration-300s"
            onClick={toggleMenu}
          >
            Home
          </a>
          <a
            href="#departments"
            className="hover:text-primary transition duration-300s"
            onClick={toggleMenu}
          >
            Departments
          </a>
          <a
            href="#events"
            className="hover:text-primary transition duration-300s"
            onClick={toggleMenu}
          >
            Events
          </a>
          <a
            href="#about"
            className="hover:text-primary transition duration-300s"
            onClick={toggleMenu}
          >
            About
          </a>
          <button className="bg-primary text-white hover:bg-hover-primary transition duration-300s px-6 py-2 rounded-lg">
            Register
          </button>
        </div>
      )}
    </div>
  );
};

export default Header;
