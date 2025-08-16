import React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

const EventBox = ({ img, title, description, link }) => {
  const router = useRouter();
  return (
    <div className="border border-gray-50 mt-12 md:mt-0 rounded-2xl p-4 relative w-[250px] md:w-[300px] h-[400px] flex flex-col items-center">
      <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-[200px] h-[200px]">
        <Image
          src={img}
          fill
          style={{ objectFit: "contain" }}
          className="rounded-2xl"
          alt={title}
        />
      </div>

      <div className="flex flex-col justify-between items-center gap-5 mt-[120px] w-full flex-1 overflow-hidden">
        <div className="flex flex-col items-center gap-3 px-2 text-center">
          <h2 className="font-audiowide text-2xl text-white">{title}</h2>
          <p className="font-space text-lg text-white line-clamp-4">
            {description}
          </p>
        </div>
        <button
          className="bg-gray-50 w-[90px] md:w-[150px] text-black rounded-lg hover:bg-hover-primary transition duration-300 py-2 md:py-3 cursor-pointer font-audiowide"
          onClick={() => router.push(link)}
        >
          Register
        </button>
      </div>
    </div>
  );
};

export default EventBox;
