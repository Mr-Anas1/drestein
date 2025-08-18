
"use client";
import Header from '@/components/Header'
import React from 'react'
import Footer from '@/components/Footer'
import EventBox from '@/components/EventBox'

const page = () => {

    const eventsData = [
        {
            img: "/circle.png",
            title: "Event Catch",
            description:
                "Lorem ipsum, dolor sit amet consectetur adipisicing elit. Quis dolorum a, ducimus esse pariatur assumenda cum eveniet unde.",
            link: "/",
            id: 1,
        },
        {
            img: "/cube.png",
            title: "Cube Quest",
            description:
                "Embark on an adventure to solve the mysteries of the Cube Kingdom and conquer its geometric challenges.",
            link: "/cube-quest",
            id: 2,
        },
        {
            img: "/square.png",
            title: "Square Fest",
            description:
                "Celebrate symmetry and style at the annual Square Fest, filled with art, games, and food from all corners.",
            link: "/square-fest",
            id: 3,
        },
        {
            img: "/circle.png",
            title: "Event Catch",
            description:
                "Lorem ipsum, dolor sit amet consectetur adipisicing elit. Quis dolorum a, ducimus esse pariatur assumenda cum eveniet unde.",
            link: "/",
            id: 4,
        },
    ];
    return (
        <div className="min-h-screen bg-gradient-to-br from-background via-background-soft to-background">
            <Header />
            <div className='py-20 px-6 md:px-12 max-w-12xl mx-auto '>
                <h1 className="font-audiowide text-4xl md:text-6xl lg:text-7xl bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-6 text-center">
                    Events
                </h1>

                <p className='text-muted-text text-center font-space text-lg'>Discover all the Events and Workshops</p>
                <div className="w-full pt-10">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4  gap-12 justify-items-center">
                        {eventsData.map((event, index) => (
                            <EventBox
                                key={index}
                                img={event.img}
                                title={event.title}
                                description={event.description}
                                link={event.link}
                                id={event.id}
                            />
                        ))}
                    </div>
                </div>

            </div>

            <Footer />
        </div>
    )
}

export default page