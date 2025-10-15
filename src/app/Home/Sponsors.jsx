"use client";
import React from 'react'
import Reveal from '@/components/Reveal'

const Sponsors = () => {

    const sponsers = [
        "/pngwing.com.png",
        "/pngwing.com(1).png",
        "/pngwing.com(2).png",
        "/pngwing.com(3).png",
        "/pngwing.com(4).png",
    ]
    return (
        <div className='flex flex-col items-center justify-center h-fit w-full py-24'>
            <Reveal effect="fade-up">
                <h1 className="font-audiowide text-center  text-[32px] md:text-[64px] bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                    SPONSORS
                </h1>
            </Reveal>
            <Reveal effect="fade-up" delay={100} className='w-full overflow-hidden'>
                <div className='flex items-center gap-24 animate-scroll whitespace-nowrap'>
                    {[...sponsers, ...sponsers, ...sponsers, ...sponsers].map((sponser, index) => (
                        <img
                            key={index}
                            src={sponser}
                            alt={`sponser-${index}`}
                            className="w-24 h-24 md:w-32 md:h-32 object-contain flex-shrink-0"
                        />
                    ))}
                </div>
            </Reveal>
        </div>
    )
}

export default Sponsors