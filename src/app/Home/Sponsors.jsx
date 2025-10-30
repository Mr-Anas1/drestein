"use client";
import React from 'react'
import Reveal from '@/components/Reveal'
import Image from 'next/image'

const Sponsors = () => {

    const sponsers = [
        "/arjun-vision-logo.png",
        "/dansas-logo.png",
      
    ]

    // Only animate if there are multiple sponsors
    const shouldAnimate = sponsers.length > 1;
    // Duplicate sponsors for seamless loop if animating
    const displaySponsors = shouldAnimate ? [...sponsers, ...sponsers, ...sponsers,...sponsers,...sponsers,...sponsers,...sponsers,...sponsers, ...sponsers] : sponsers;

    return (
        <div className='flex flex-col items-center justify-center h-fit w-full py-24'>
            <Reveal effect="fade-up">
                <h1 className="font-audiowide text-center text-[32px] md:text-[64px] bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-4">
                    SPONSORS
                </h1>
            </Reveal>
            <Reveal effect="fade-up" delay={100} className='w-full overflow-hidden'>
                <div className={`flex items-center justify-center gap-12 md:gap-24 ${shouldAnimate ? 'animate-scroll whitespace-nowrap' : 'flex-wrap'}`}>
                    {displaySponsors.map((sponser, index) => (
                        <div key={index} className="relative w-24 h-24 md:w-32 md:h-32 flex-shrink-0">
                            <Image
                                src={sponser}
                                alt={`sponsor-${index}`}
                                fill
                                loading="lazy"
                                className="object-contain"
                                sizes="(max-width: 768px) 96px, 128px"
                            />
                        </div>
                    ))}
                </div>
            </Reveal>
        </div>
    )
}

export default Sponsors