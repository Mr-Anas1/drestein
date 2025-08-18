import React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

const EventBox = ({ img, title, description, link, id }) => {
  const router = useRouter();
  return (
    <div className="group relative bg-background-soft border border-border rounded-3xl p-6 w-[280px] md:w-[320px] h-[450px] flex flex-col overflow-hidden hover:border-primary transition-all duration-500 hover:transform hover:scale-105 hover:shadow-2xl hover:shadow-primary/20">

      {/* Gradient Background Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

      {/* Floating Glow Effect */}
      <div className="absolute -top-2 -right-2 w-20 h-20 bg-gradient-to-r from-primary to-secondary rounded-full opacity-20 blur-xl group-hover:opacity-40 transition-opacity duration-500"></div>

      {/* Image Container */}
      <div className="relative w-full h-48 mb-6 rounded-2xl overflow-hidden bg-gradient-to-br from-background to-background-soft">
        <div className="absolute inset-2">
          <Image
            src={img}
            fill
            style={{ objectFit: "cover" }}
            className="rounded-xl group-hover:scale-110 transition-transform duration-500"
            alt={title}
          />
        </div>
        {/* Image Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-background/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      </div>

      {/* Content Container */}
      <div className="relative z-10 flex flex-col flex-1 justify-between">
        <div className="space-y-4">
          <h2 className="font-audiowide text-xl md:text-2xl bg-gradient-to-r from-white to-muted-text bg-clip-text text-transparent group-hover:from-primary group-hover:to-secondary transition-all duration-300">
            {title}
          </h2>
          <p className="font-space text-sm md:text-base text-muted-text leading-relaxed line-clamp-3 group-hover:text-white transition-colors duration-300">
            {description}
          </p>
        </div>

        {/* Register Button */}
        <div className="mt-6">
          <button
            className="w-full bg-gradient-to-r from-primary to-secondary text-white font-audiowide text-sm md:text-base py-3 px-6 rounded-xl hover:from-hover-primary hover:to-primary transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-primary/30 relative overflow-hidden group/btn"
            onClick={() => router.push(`/events/${id}`)}
          >
            {/* Button Glow Effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300 cursor-pointer"></div>
            <span className="relative z-10 ">Register Now</span>
          </button>
        </div>
      </div>

      {/* Bottom Accent Line */}
      <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-secondary to-accent transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-center"></div>
    </div>
  );
};

export default EventBox;
