import Stats from "@/components/Stats";
import React from "react";

const StatsSection = () => {
  const statData = [
    {
      value: 60,
      title: "Events",
    },
    {
      value: 5,
      title: "Speakers",
    },
    {
      value: "1,00,000",
      title: "Prize",
    },
    {
      value: 45,
      title: "Events",
    },
  ];
  return (
    <div className="h-[20vh] my-32 w-screen flex justify-center items-center">
      <div className="flex justify-center items-center gap-12 md:gap-24 flex-wrap px-4">
        {statData.map((item, index) => (
          <Stats value={item.value} title={item.title} key={index} />
        ))}
      </div>
    </div>
  );
};

export default StatsSection;
