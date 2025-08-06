"use client";

import { AlignJustify, X } from "lucide-react";
import React, { useState } from "react";

const Header = () => {
  const [menuDisplay, setMenuDisplay] = useState(false);

  const toggleMenu = () => {
    setMenuDisplay(!menuDisplay);
  };

  return (
    <div className="flex justify-between items-center px-4 md:px-12 h-20 border-b border-gray-600">
      <div>
        <h1 className="text-4xl font-audiowide bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
          DRESTEIN
        </h1>
      </div>

      <div className="flex items-center space-x-6">
        <div className="hidden items-center md:flex">
          <a
            href="#home"
            className="text-white font-audiowide hover:text-primary transition duration-300s px-4 "
          >
            Home
          </a>
          <a
            href="#events"
            className="text-white font-audiowide hover:text-primary transition duration-300s px-4"
          >
            Events
          </a>

          <a
            href="#about"
            className="text-white font-audiowide hover:text-primary transition duration-300s px-4"
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
            <X className="text-white" size={38} onClick={toggleMenu} />
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
        <div className="absolute top-20 left-0 w-full h-screen bg-gray-800 text-white p-4 flex flex-col space-y-12 py-12 overflow-hidden items-center md:hidden">
          <a
            href="#home"
            className="hover:text-primary transition duration-300s"
            onClick={toggleMenu}
          >
            Home
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
