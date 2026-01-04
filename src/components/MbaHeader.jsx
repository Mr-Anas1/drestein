"use client";

import { useRouter } from "next/navigation";

export default function MbaHeader() {
    const router = useRouter();

    return (
        <div className="flex justify-between items-center px-4 md:px-6 h-16 border-b border-gray-600">

            <div className="flex items-center gap-3">
                <button
                    type="button"
                    onClick={() => router.push("/mba")}
                    className="w-[160px] sm:w-[180px] md:w-[200px] lg:w-[250px]"
                    aria-label="Go to MBA page"
                >
                    <img src="/logo.png" alt="saveetha-logo" loading="lazy" decoding="async" />
                </button>

                <div className="w-[40px] sm:w-[50px] md:w-[60px] lg:w-[80px] flex-shrink-0">
                    <img
                        src="/excellence.png"
                        alt="excellence-logo"
                        className="w-full h-auto object-contain"
                        loading="lazy"
                        decoding="async"
                    />
                </div>

                <button
                    type="button"
                    onClick={() => router.push("/mba")}
                    className="font-audiowide text-xl md:text-2xl bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent"
                >
                    MBA
                </button>
            </div>

            <div className="flex items-center gap-3" />
        </div>
    );
}
