"use client";

import { AlignJustify, X } from "lucide-react";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

const Header = () => {
  const [menuDisplay, setMenuDisplay] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const router = useRouter();
  const { isAuthenticated, studentProfile, loginWithGoogleStudent, logout, user } = useAuth();

  const toggleMenu = () => {
    setMenuDisplay(!menuDisplay);
  };

  return (
    <div className="flex justify-between items-center px-4 md:px-12 h-20 border-b border-gray-600">
      <div>
        <h1
          className="text-4xl font-audiowide bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent cursor-pointer"
          onClick={() => router.push("/")}
        >
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
          {!isAuthenticated ? (
            <button
              onClick={loginWithGoogleStudent}
              className="bg-primary text-white font-audiowide hover:bg-hover-primary transition duration-300s px-6 py-2 rounded-lg"
            >
              Student Login
            </button>
          ) : (
            <div className="relative">
              <button
                onClick={() => setAccountOpen((v) => !v)}
                className="flex items-center gap-2 bg-background-soft border border-border text-white font-audiowide hover:bg-background transition duration-300s px-3 py-2 rounded-lg"
              >
                {(studentProfile?.photoURL || user?.photoURL) && (
                  <img
                    src={studentProfile?.photoURL || user?.photoURL}
                    alt="avatar"
                    className="w-8 h-8 rounded-full border border-border object-cover"
                  />
                )}
                <span className="text-white font-space text-sm hidden lg:inline">
                  {studentProfile?.name || user?.displayName || user?.email}
                </span>
              </button>
              {accountOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-background-soft border border-border rounded-lg shadow-lg p-2 z-[100]">
                  <div className="px-3 py-2 text-xs text-muted-text">
                    Signed in as
                    <div className="text-white truncate">{user?.email}</div>
                  </div>
                  <button
                    onClick={() => { setAccountOpen(false); router.push('/events'); }}
                    className="w-full text-left px-3 py-2 rounded-md hover:bg-background text-white text-sm"
                  >
                    My Registrations
                  </button>
                  <div className="h-px bg-border my-1" />
                  <button
                    onClick={() => { setAccountOpen(false); logout(); }}
                    className="w-full text-left px-3 py-2 rounded-md hover:bg-background text-white text-sm"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          )}
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
            className="hover:text-primary transition duration-300s"
            onClick={() => router.push("/")}
          >
            Home
          </a>
          <a
            className="hover:text-primary transition duration-300s"
            onClick={() => router.push("/departments")}
          >
            Departments
          </a>
          <a
            className="hover:text-primary transition duration-300s"
            onClick={() => router.push("/events")}
          >
            Events
          </a>
          <a
            className="hover:text-primary transition duration-300s"
            onClick={() => router.push("/about")}
          >
            About
          </a>
          {!isAuthenticated ? (
            <button
              onClick={loginWithGoogleStudent}
              className="bg-primary text-white hover:bg-hover-primary transition duration-300s px-6 py-2 rounded-lg"
            >
              Student Login
            </button>
          ) : (
            <div className="flex items-center gap-3">
              {(studentProfile?.photoURL || user?.photoURL) && (
                <img
                  src={studentProfile?.photoURL || user?.photoURL}
                  alt="avatar"
                  className="w-8 h-8 rounded-full border border-border object-cover"
                />
              )}
              <span className="text-white font-space text-sm">
                {studentProfile?.name || user?.displayName || user?.email}
              </span>
              <button
                onClick={logout}
                className="bg-background-soft border border-border text-white font-audiowide hover:bg-background transition duration-300s px-4 py-2 rounded-lg"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Header;
