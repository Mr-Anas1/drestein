import EventBox from "@/components/EventBox";
import React from "react";
import { useRouter } from "next/navigation";

const Events = () => {
  const eventsData = [
    {
      img: "/circle.png",
      title: "Event Catch",
      description:
        "Lorem ipsum, dolor sit amet consectetur adipisicing elit. Quis dolorum a, ducimus esse pariatur assumenda cum eveniet unde.",
      link: "/",
    },
    {
      img: "/cube.png",
      title: "Cube Quest",
      description:
        "Embark on an adventure to solve the mysteries of the Cube Kingdom and conquer its geometric challenges.",
      link: "/cube-quest",
    },
    {
      img: "/square.png",
      title: "Square Fest",
      description:
        "Celebrate symmetry and style at the annual Square Fest, filled with art, games, and food from all corners.",
      link: "/square-fest",
    },
    {
      img: "/circle.png",
      title: "Event Catch",
      description:
        "Lorem ipsum, dolor sit amet consectetur adipisicing elit. Quis dolorum a, ducimus esse pariatur assumenda cum eveniet unde.",
      link: "/",
    },
  ];

  const router = useRouter();

  return (
    <div className="mt-24 md:mt-38">
      <h1 className="font-audiowide text-[32px]  text-center md:text-[64px] bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
        Events
      </h1>
      <div className="flex md:flex-row flex-col mx-12 mt-10  justify-center items-center gap-12">
        {eventsData.map((event, index) => (
          <EventBox
            key={index}
            img={event.img}
            title={event.title}
            description={event.description}
            link={event.link}
          />
        ))}
      </div>

      <div className="flex justify-center items-center my-12">
        <button
          className="bg-primary w-[150px] text-white rounded-lg hover:bg-hover-primary transition duration-300 py-2 md:py-3 cursor-pointer font-audiowide"
          onClick={() => router.push("/events")}
        >
          Explore More
        </button>
      </div>
    </div>
  );
};

export default Events;
