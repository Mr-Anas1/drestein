import React from "react";

const AboutFeature = ({ icon, title, description }) => {
  return (
    <div className="bg-[rgba(80,85,184,0.18)] rounded-xl shadow-[0_4px_30px_rgba(0,0,0,0.1)] backdrop-blur-[1.3px] border border-[rgba(255,255,255,0.3)] w-[250px] md:w-[350px] h-fit p-4 py-8 flex flex-col justify-center items-center gap-4">
      {" "}
      <div className="bg-[rgba(255,255,255,0.18)] rounded-[16px] shadow-[0_4px_30px_rgba(0,0,0,0.1)] backdrop-blur-[1.3px] border border-[rgba(255,255,255,0.3)] p-4 ">
        {" "}
        {icon}
      </div>
      <h2 className="text-lg text-white font-bold font-audiowide text-center">
        {title}
      </h2>
      <p className="md:text-md text-center text-muted-text font-space">
        {description}
      </p>
    </div>
  );
};

export default AboutFeature;
