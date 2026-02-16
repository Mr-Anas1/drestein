"use client";

import React from "react";
import Slider from "react-slick";
import Image from "next/image";

const testimonials = [
    {
        quote: "AI Ascend is our flagship initiative in partnership with Amazon Web Services and Kyndryl to bring Generative and Agentic AI to students across Tamil Nadu.",
        highlight: "AI is no longer optional it is essential. Through hands-on hackathons, real-world challenges, and industry mentorship, we are empowering students to move from learning AI to building with it.",
        final: "AI Ascend is where innovation begins and future-ready talent is shaped.",
        name: "Dr. Raj C. Mohan",
        role: "Professional Leader & Educator",
        image: "/ascend/mohansir.jpeg",
        gradient: "from-[#232F3E] to-[#1a2332]",
        accent: "text-[#C5934C]",
        border: "border-[#C5934C]/20"
    },
    {
        quote: "The true promise of AI lies not in the technology itself, but in who is empowered to build with it. Through AI Ascend — a strategic collaboration between Amazon Web Services and Kyndryl — we are expanding that opportunity at scale, equipping students with deep cloud fluency, advanced AI capabilities, and the confidence to innovate responsibly.",
        highlight: "This is not merely a learning initiative; it is a long-term investment in shaping India’s next generation of AI leaders.",
        final: "",
        name: "Pratibha Singh",
        role: "Business Development Lead, Future Builders Programs – AWS India",
        image: "/ascend/PratibhaSingh.jpeg",
        gradient: "from-[#1a2332] to-[#232F3E]",
        accent: "text-[#FF9900]",
        border: "border-[#FF9900]/20"
    }
];

const NextArrow = (props) => {
    const { onClick } = props;
    return (
        <button
            onClick={onClick}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-20 bg-white/10 hover:bg-white/20 backdrop-blur-md p-3 rounded-full transition-all duration-300 border border-white/20 hidden md:block group"
            aria-label="Next Testimonial"
        >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white group-hover:translate-x-1 transition-transform"><path d="m9 18 6-6-6-6" /></svg>
        </button>
    );
}

const PrevArrow = (props) => {
    const { onClick } = props;
    return (
        <button
            onClick={onClick}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-20 bg-white/10 hover:bg-white/20 backdrop-blur-md p-3 rounded-full transition-all duration-300 border border-white/20 hidden md:block group"
            aria-label="Previous Testimonial"
        >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white group-hover:-translate-x-1 transition-transform"><path d="m15 18-6-6 6-6" /></svg>
        </button>
    );
}

export default function TestimonialSlider() {
    const settings = {
        dots: true,
        infinite: true,
        speed: 800,
        slidesToShow: 1,
        slidesToScroll: 1,
        autoplay: true,
        autoplaySpeed: 5000,
        arrows: true,
        fade: true,
        cssEase: "cubic-bezier(0.87, 0, 0.13, 1)",
        dotsClass: "slick-dots custom-dots",
        nextArrow: <NextArrow />,
        prevArrow: <PrevArrow />
    };

    return (
        <div className="testimonial-slider-container pb-8 relative group">
            <Slider {...settings}>
                {testimonials.map((t, index) => (
                    <div key={index} className="px-2">
                        <div className={`bg-gradient-to-br ${t.gradient} rounded-2xl p-8 md:p-14 shadow-2xl relative overflow-hidden border ${t.border} min-h-[500px] flex flex-col justify-center`}>
                            {/* Decorative Quote Mark */}
                            <div className={`absolute top-0 ${index % 2 === 0 ? 'left-4' : 'right-4'} opacity-10 font-serif text-[12rem] leading-none select-none ${t.accent.replace('text-', 'text-')}`}>
                                {index % 2 === 0 ? '“' : '”'}
                            </div>

                            <div className="relative z-10 max-w-4xl mx-auto text-center px-6 md:px-12">
                                <div className="text-white/90 font-sans text-lg md:text-2xl space-y-6 italic leading-relaxed">
                                    <p>"{t.quote}"</p>
                                    {t.highlight && (
                                        <p className={t.final ? "" : `font-semibold ${t.accent}`}>
                                            "{t.highlight}"
                                        </p>
                                    )}
                                    {t.final && (
                                        <p className={`font-semibold ${t.accent}`}>
                                            "{t.final}"
                                        </p>
                                    )}
                                </div>

                                <div className="mt-10 flex flex-col items-center justify-center">
                                    <div className="relative w-24 h-24 rounded-full overflow-hidden bg-white/10 p-1 border border-white/20">
                                        <Image
                                            src={t.image}
                                            alt={t.name}
                                            fill
                                            className="object-cover rounded-full"
                                        />
                                    </div>

                                    <h4 className="font-poppins text-2xl text-white mb-1 mt-4">
                                        {t.name}
                                    </h4>
                                    <p className={`${t.accent} font-sans text-sm md:text-base`}>{t.role}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </Slider>

            <style jsx global>{`
                .custom-dots {
                    bottom: -40px;
                }
                .custom-dots li button:before {
                    color: #C5934C !important;
                    font-size: 12px;
                    opacity: 0.3;
                    transition: all 0.3s ease;
                }
                .custom-dots li.slick-active button:before {
                    opacity: 1;
                    transform: scale(1.2);
                }
                .testimonial-slider-container:hover .slick-arrow {
                    opacity: 1;
                }
                .slick-arrow.slick-disabled {
                    opacity: 0 !important;
                    pointer-events: none;
                }
            `}</style>
        </div>
    );
}
