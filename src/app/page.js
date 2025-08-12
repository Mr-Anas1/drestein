import React from "react";
import Home from "./Home/page";
import SmoothFollower from "@/components/CursorEffect";

function page() {
  return (
    <div className="w-screen h-screen">
      <SmoothFollower />
      <Home />
    </div>
  );
}

export default page;
