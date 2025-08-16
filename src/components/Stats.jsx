import React from "react";

const Stats = ({ value, title }) => {
  return (
    <div className="flex flex-col items-center justify-center gap-2">
      <div className="font-audiowide text-4xl md:text-6xl font-bold text-primary">
        {value}+
      </div>
      <p className="font-audiowide md:text-2xl text-xl text-white">{title}</p>
    </div>
  );
};

export default Stats;
