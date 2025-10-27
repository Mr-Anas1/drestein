"use client";

import { AlignJustify, X, Ticket, ShoppingCart, CheckCircle } from "lucide-react";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { auth } from "@/lib/firebase";

const Header = () => {
  const [menuDisplay, setMenuDisplay] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const router = useRouter();
  const { isAuthenticated, studentProfile, loginWithGoogleStudent, logout, user } = useAuth();

  // Fetch cart count
  useEffect(() => {
    if (isAuthenticated && user) {
      fetchCartCount();
    } else {
      setCartCount(0);
    }
  }, [isAuthenticated, user]);

  const fetchCartCount = async () => {
    try {
      const idToken = await auth.currentUser?.getIdToken();
      const response = await fetch(`/api/special-events/cart?userUid=${user.uid}`, {
        headers: { 'Authorization': `Bearer ${idToken}` },
      });
      if (response.ok) {
        const data = await response.json();
        setCartCount(data.cartItems?.length || 0);
      }
    } catch (error) {
      console.error('Error fetching cart count:', error);
    }
  };

  const toggleMenu = () => {
    setMenuDisplay(!menuDisplay);
  };

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (menuDisplay) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [menuDisplay]);

  return (
    <div className="flex justify-between items-center px-2 md:px-2 lg:px-4 h-22 border-b border-gray-600">
      <div className="flex items-center gap-2">
        <h1
          className="text-4xl font-audiowide bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent cursor-pointer"
          onClick={() => router.push("/")}
        >
          <div className="w-[160px] sm:w-[180px] md:w-[200px] lg:w-[250px]">
            <img src="/logo.png" alt="saveetha-logo" />
          </div>
        </h1>
        
        {/* Excellence Logo */}
        <div className="w-[40px] sm:w-[50px] md:w-[60px] lg:w-[80px] flex-shrink-0">
          <img src="/excellence.png" alt="excellence-logo" className="w-full h-auto object-contain" />
        </div>

        <div className="w-[50px] sm:w-[60px] md:w-[70px] lg:w-[90px] flex-shrink-0">
          <img src="/drestein-logo.png" alt="excellence-logo" className="w-full h-auto object-contain" />
        </div>
      </div>

      <div className="flex items-center">
        <div className="hidden items-center gap-3 xl:gap-4 xl:flex">
          <a
            onClick={() => router.push("/")}
            className="text-white font-audiowide hover:text-primary transition duration-300s  xl:px-1 cursor-pointer text-sm xl:text-base"
          >
            Home
          </a>
          <a
            onClick={() => router.push("/departments")}
            className="text-white font-audiowide hover:text-primary transition duration-300s  xl:px-1 cursor-pointer text-sm xl:text-base"
          >
            Departments
          </a>
          <a
            onClick={() => router.push("/events")}
            className="text-white font-audiowide hover:text-primary transition duration-300s px-3 xl:px-1 cursor-pointer text-sm xl:text-base"
          >
            Events
          </a>

          <a
            onClick={() => router.push("/special-events")}
            className="text-white font-audiowide hover:text-primary transition duration-300s px-3 xl:px-1 cursor-pointer text-sm xl:text-base"
          >
            Special Events
          </a>

          <a
            onClick={() => router.push("/about")}
            className="text-white font-audiowide hover:text-primary transition duration-300s px-3 xl:px-1 cursor-pointer text-sm xl:text-base"
          >
            About
          </a>

          {/* Cart Icon */}
          {isAuthenticated && (
            <button
              onClick={() => router.push("/buy-pass")}
              className="relative text-white hover:text-primary transition duration-300s p-2"
              title="View Cart"
            >
              <ShoppingCart size={24} />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-secondary text-white text-xs font-audiowide rounded-full w-5 h-5 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>
          )}

          {/* Buy Pass Button */}
          <button
            onClick={() => router.push("/buy-pass")}
            className="bg-gradient-to-r from-primary to-secondary text-white font-audiowide hover:from-hover-primary hover:to-primary transition duration-300s px-4 py-2 rounded-lg flex items-center gap-2 text-sm xl:text-base"
          >
            <Ticket size={18} />
            Buy Pass
          </button>

          {!isAuthenticated ? (
            <button
              onClick={loginWithGoogleStudent}
              className="bg-primary text-white font-audiowide hover:bg-hover-primary transition duration-300s px-6 py-2 rounded-lg text-sm xl:text-base"
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
                {/* <span className="text-white font-space text-sm hidden lg:inline">
                  {studentProfile?.name || user?.displayName || user?.email}
                </span> */}
              </button>
              {accountOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-background-soft border border-border rounded-lg shadow-lg p-2 z-[100]">
                  <div className="px-3 py-2 text-xs text-muted-text">
                    Signed in as
                    <div className="text-white truncate">{user?.email}</div>
                  </div>
                  <button
                    onClick={() => { setAccountOpen(false); router.push('/my-registrations'); }}
                    className="w-full text-left px-3 py-2 rounded-md hover:bg-background text-white text-sm flex items-center gap-2"
                  >
                    <CheckCircle size={16} />
                    My Registrations
                  </button>
                  <button
                    onClick={() => { setAccountOpen(false); router.push('/my-passes'); }}
                    className="w-full text-left px-3 py-2 rounded-md hover:bg-background text-white text-sm flex items-center gap-2"
                  >
                    <Ticket size={16} />
                    My Passes
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
        {/* Mobile/Tablet Cart & Menu */}
        <div className="xl:hidden flex items-center gap-3">
          {/* Mobile Cart Icon */}
          {isAuthenticated && (
            <button
              onClick={() => router.push("/buy-pass")}
              className="relative text-white hover:text-primary transition duration-300s p-2"
              title="View Cart"
            >
              <ShoppingCart size={28} />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-secondary text-white text-xs font-audiowide rounded-full w-5 h-5 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>
          )}
          
          {/* Hamburger Menu */}
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
        <div className="fixed top-20 left-0 w-full h-[calc(100vh-80px)] bg-gray-900 text-white flex flex-col items-center justify-start space-y-6 pt-10 md:hidden z-[99] overflow-y-auto">
          {/* Navigation Links */}
          {[
            { label: "Home", path: "/" },
            { label: "Departments", path: "/departments" },
            { label: "Events", path: "/events" },
            { label: "Special Events", path: "/special-events" },
            { label: "About", path: "/about" },
          ].map((item) => (
            <button
              key={item.path}
              onClick={() => {
                setMenuDisplay(false);
                router.push(item.path);
              }}
              className="text-lg font-medium hover:text-primary transition-colors duration-300"
            >
              {item.label}
            </button>
          ))}

          {/* Auth Section */}
          {!isAuthenticated ? (
            <button
              onClick={() => {
                setMenuDisplay(false);
                loginWithGoogleStudent();
              }}
              className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-hover-primary transition-colors duration-300"
            >
              Student Login
            </button>
          ) : (
            <div className="flex flex-col items-center w-full space-y-3">
              <button
                onClick={() => {
                  setMenuDisplay(false);
                  router.push("/buy-pass");
                }}
                className="w-3/4 flex items-center justify-center gap-2 py-2 rounded-md hover:bg-gray-800 text-lg font-medium transition-colors duration-300 relative"
              >
                <ShoppingCart size={18} />
                Cart
                {cartCount > 0 && (
                  <span className="bg-secondary text-white text-xs font-audiowide rounded-full w-5 h-5 flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </button>
              <button
                onClick={() => {
                  setMenuDisplay(false);
                  setAccountOpen(false);
                  router.push("/my-registrations");
                }}
                className="w-3/4 text-center py-2 rounded-md hover:bg-gray-800 text-lg font-medium transition-colors duration-300"
              >
                My Registrations
              </button>
              <button
                onClick={() => {
                  setMenuDisplay(false);
                  setAccountOpen(false);
                  router.push("/my-passes");
                }}
                className="w-3/4 flex items-center justify-center gap-2 py-2 rounded-md hover:bg-gray-800 text-lg font-medium transition-colors duration-300"
              >
                <Ticket size={16} />
                My Passes
              </button>
              <button
                onClick={() => {
                  setMenuDisplay(false);
                  router.push("/buy-pass");
                }}
                className="w-3/4 flex items-center justify-center gap-2 py-2 rounded-lg bg-gradient-to-r from-primary to-secondary hover:from-hover-primary hover:to-primary text-white font-semibold transition-colors duration-300"
              >
                <Ticket size={18} />
                Buy Pass
              </button>
              <button
                onClick={() => {
                  setMenuDisplay(false);
                  logout();
                }}
                className="w-3/4 py-2 rounded-lg border border-gray-700 hover:bg-gray-800 text-sm font-medium transition-colors duration-300"
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
