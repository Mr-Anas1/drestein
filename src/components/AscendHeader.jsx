"use client";
import React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

const AscendHeader = () => {
    const router = useRouter();

    return (
        <div className="bg-white w-full border-b border-gray-700">
            <div className="max-w-[85rem] mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-wrap justify-between items-center gap-4">

                {/* Left Side: Saveetha & Excellence Logos */}
                <div
                    className="flex items-center gap-4 cursor-pointer"
                    onClick={() => router.push("/")}
                >
                    <div className="w-[120px] sm:w-[150px] md:w-[180px] lg:w-[260px] ">
                        <img
                            src="/ascend/sec-logo-01as.png"
                            alt="Saveetha Logo"
                            className="w-full h-auto object-contain"
                            loading="lazy"
                        />
                    </div>
                    {/* Divider */}
                    <div className="h-8 w-px bg-gray-500/50 hidden sm:block"></div>

                    <div className="w-[40px] sm:w-[50px] md:w-[60px]">
                        <img
                            src="/excellence.png"
                            alt="Excellence Logo"
                            className="w-full h-auto object-contain"
                            loading="lazy"
                        />
                    </div>
                </div>

                {/* Right Side: Kyndryl & AWS Logos */}
                <div className="flex items-center gap-6">
                    {/* Kyndryl Logo */}
                    <div className="w-[80px] sm:w-[100px] md:w-[120px] lg:w-[140px">
                        <img
                            src="/ascend/kyndryl.png"
                            alt="Kyndryl Logo"
                            className="w-full h-auto object-contain"
                            loading="lazy"
                        />
                    </div>

                    {/* AWS Logo */}
                    <div className="w-[60px] sm:w-[50px] md:w-[60px]">
                        <img
                            src="/ascend/aws.png"
                            alt="AWS Logo"
                            className="w-full h-auto object-contain"
                            loading="lazy"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AscendHeader;
