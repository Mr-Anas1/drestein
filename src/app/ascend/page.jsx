import Footer from "@/components/Footer";
import AscendHeader from "@/components/AscendHeader";
import Image from "next/image";

export default function AscendPage({ searchParams }) {
    const registrationUrl = "https://www.awseducate.com/registration/s/registration-detail?language=en_US&promocode=FBKNDRL";

    return (
        <div className="min-h-screen bg-white">
            {/* Header Section */}
            <div className="bg-[#1a2332]">
                <AscendHeader />
            </div>
            {/* Hero Banner */}
            {/* Hero Banner with Background Image */}
            {/* Banner Container */}
            <div className="max-w-[85rem] mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-12">
                <div className="relative w-full aspect-[3/4] sm:aspect-[16/10] md:aspect-[21/9] lg:aspect-[2.5/1] rounded-[1.5rem] md:rounded-[2.5rem] overflow-hidden shadow-2xl flex flex-col justify-center items-center text-center p-6 md:p-8 border border-gray-100">
                    {/* Background Image */}
                    <div className="absolute inset-0 w-full h-full z-0">
                        <Image
                            src="/ascend/banner.jpeg"
                            alt="AI Ascend Banner"
                            fill
                            className="object-cover object-center"
                            priority
                        />
                        {/* Light Overlay for text readability */}
                        <div className="absolute inset-0 bg-white/20 backdrop-blur-[1px]"></div>
                    </div>

                    {/* Content Overlay */}
                    <div className="relative z-10 mt-8 md:mt-24 w-full">
                        <h1 className="font-poppins text-4xl sm:text-5xl md:text-7xl text-[#C5934C] mb-4 md:mb-6 tracking-wider drop-shadow-sm font-bold leading-tight">
                            AI ASCEND 2026
                        </h1>

                        <div className="inline-block bg-[#232F3E]/90 backdrop-blur-sm px-4 py-2 md:px-8 md:py-3 rounded-full mb-6 md:mb-8 shadow-lg border border-white/20 max-w-[90%]">
                            <span className="text-white font-sans text-sm md:text-lg uppercase tracking-wider font-semibold block leading-snug">
                                Innovating For India's Tomorrow
                            </span>
                        </div>
                        <div className="w-[120px] sm:w-[180px] md:w-[200px] lg:w-[350px] mx-auto">
                            <img src="/ascend/ai-ascend-logo.png" alt="ai-ascend-logo" loading="lazy" decoding="async" className="w-full h-auto" />
                        </div>


                        {/* <p className="text-[#232F3E] font-sans  md:text-4xl font-bold max-w-4xl mx-auto leading-relaxed drop-shadow-sm">
                            Intelligent. Autonomous. Agentic in Action.
                        </p> */}


                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-6 py-12">
                {/* Event Info Card */}
                <div className="grid lg:grid-cols-2 gap-8 items-start mb-16">
                    {/* Left - Logo Circle */}

                    <div className="flex items-center justify-center gap-12 flex-col">
                        <div className="flex justify-center items-center ">
                            <div className="w-56 h-56 rounded-full bg-[#E6C87F] flex items-center justify-center shadow-2xl border-4 border-[#DDBF74]">
                                <div className="text-center">
                                    <div className="text-white font-poppins text-4xl mb-1">AI</div>
                                    <div className="text-white font-poppins text-2xl">ASCEND</div>
                                    <div className="text-white text-lg mt-1">2026</div>
                                </div>
                            </div>
                        </div>

                        {/* Center - Event Details */}
                        <div className="space-y-4">
                            <h2 className="font-poppins text-4xl md:text-5xl text-[#232F3E]">
                                AI ASCEND 2026

                            </h2>
                            <h2 className="font-poppins text-xl text-[#232F3E]">Intelligent. Autonomous. Agentic in Action.</h2>

                            <p className="text-[#232F3E]/70 font-sans text-lg">
                                Powered by Kyndryl & AWS. Innovate for India.
                                <a href="#schedule" className="text-[#FF9900] ml-2 underline">View more →</a>
                            </p>

                            <div className="flex flex-wrap gap-6 text-lg text-[#232F3E]/80 font-sans">
                                <div className="flex items-center gap-2">
                                    <span className="text-[#FF9900] text-xl">�</span>
                                    <span>14th Feb 2026</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-[#FF9900] text-xl">📍</span>
                                    <span>Majestorium Hall</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-[#FF9900] text-xl">👥</span>
                                    <span>4 Team Members</span>
                                </div>
                                <div>
                                    <a href="#schedule" className="text-[#005696] underline text-lg">View full Schedule</a>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right - Registration with QR Code */}
                    <div className="bg-white border-2 border-[#005696] rounded-xl p-8 shadow-lg">
                        <div className="text-center mb-6">
                            <p className="text-[#232F3E]/60 text-lg uppercase mb-2">Curtain Raiser</p>
                            {/* <p className="font-poppins text-3xl text-[#232F3E]">14th FEB 2026</p> */}
                            <p className="font-poppins text-3xl text-[#232F3E]">Ideathon Submission</p>
                        </div>

                        {/* QR Code */}
                        <div className="bg-white p-4 rounded-xl mb-6 border-2 border-[#C5934C]/30">
                            <div className="relative w-full aspect-square max-w-[200px] mx-auto">
                                <Image
                                    src="/ascend/registration-qr.jpeg"
                                    alt="Scan to Register"
                                    fill
                                    className="object-contain"
                                />
                            </div>
                            <p className="text-center text-xs text-[#232F3E]/60 mt-3">Scan to Register</p>
                        </div>

                        <a
                            href={registrationUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block w-full bg-[#DDBF74] hover:bg-[#DDBF74] text-white font-poppins py-4 px-6 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg text-center"
                        >
                            REGISTER NOW
                        </a>
                        <p className="text-center text-lg text-[#232F3E]/50 mt-4">
                            No Registration Fee
                        </p>
                    </div>
                </div>

                {/* Programme Overview */}
                <div className="mb-12">
                    <h3 className="font-poppins text-4xl text-[#232F3E] mb-8 border-l-4 border-[#C5934C] pl-6">
                        Programme Overview
                    </h3>
                    <div className="bg-gradient-to-br from-[#232F3E]/5 to-[#005696]/5 rounded-2xl p-10 border border-[#232F3E]/10">
                        <p className="text-[#232F3E]/80 font-sans text-lg leading-relaxed">
                            AI Ascend 2026 is a structured, phased journey from foundational knowledge to real-world Agentic AI innovation. It offers comprehensive learning and innovation initiative designed to empower students with future-ready skills in Cloud Computing, Machine Learning, and Generative AI hosted at Saveetha Engineering College, powered by Kyndryl & AWS. The programme provides participants with access to AWS learning platforms, industry-recognized certifications, and an opportunity to apply acquired knowledge through a national-level hackathon, encouraging innovation, collaboration, and real-world impact.
                        </p>
                    </div>
                </div>

                {/* Why Join AI Ascend 2026? */}
                <div className="mb-12">
                    <h3 className="font-poppins text-4xl text-[#232F3E] mb-8 border-l-4 border-[#FF9900] pl-6">
                        Why Join AI Ascend 2026?
                    </h3>
                    <div className="bg-white border text-[#232F3E]/80 border-[#FF9900]/30 rounded-2xl p-8 shadow-sm">
                        <ul className="space-y-4 font-sans text-lg">
                            <li className="flex items-start gap-3">
                                <span className="text-[#FF9900] text-xl">✓</span>
                                Learn industry-relevant AI and Cloud skills
                            </li>
                            <li className="flex items-start gap-3">
                                <span className="text-[#FF9900] text-xl">✓</span>
                                Build real-world solutions
                            </li>
                            <li className="flex items-start gap-3">
                                <span className="text-[#FF9900] text-xl">✓</span>
                                Gain hands-on AWS experience
                            </li>
                            <li className="flex items-start gap-3">
                                <span className="text-[#FF9900] text-xl">✓</span>
                                Strengthen your resume and portfolio
                            </li>
                            <li className="flex items-start gap-3">
                                <span className="text-[#FF9900] text-xl">✓</span>
                                Be part of India’s AI innovation journey
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Programme Structure */}
                <div className="grid md:grid-cols-2 gap-8 mb-12" id="schedule">
                    {/* Phase I */}
                    <div className="bg-white border-2 border-[#FF9900] rounded-2xl p-10 shadow-lg hover:shadow-2xl transition-shadow">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="bg-[#FF9900] text-white w-16 h-16 rounded-full flex items-center justify-center font-poppins text-2xl">
                                I
                            </div>
                            <h4 className="font-poppins text-2xl text-[#232F3E]">
                                Foundational Learning
                            </h4>
                        </div>
                        <p className="text-[#232F3E]/70   text-lg mb-4 font-sans">
                            Open to All Students
                        </p>
                        <p className="text-[#232F3E]/80 font-sans text-lg mb-6 ">
                            Register and access curated 1-hour learning tracks:
                        </p>
                        <ul className="space-y-3 text-[#232F3E]/70 font-sans text-lg">
                            <li className="flex items-start gap-3">
                                <span className="text-[#FF9900] mt-1 text-lg">•</span>
                                <span>Introduction to Cloud 101</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <span className="text-[#FF9900] mt-1 text-lg">•</span>
                                <span>Machine Learning Foundations</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <span className="text-[#FF9900] mt-1 text-lg">•</span>
                                <span>Introduction to Generative AI</span>
                            </li>
                        </ul>
                        <div className="mt-6 bg-[#FF9900]/10 p-6 rounded-lg">
                            <p className="font-poppins text-lg text-[#232F3E] mb-3">Benefits:</p>
                            <ul className="space-y-2 text-lg text-[#232F3E]/70 font-sans">
                                <li>✓ Industry-aligned learning</li>
                                <li>✓ Certification upon completion</li>
                                <li>✓ Access to Learning tracks and exclusive advanced learning tracks for hackathon qualifiers</li>
                                <li className="text-sm italic mt-2 text-[#232F3E]/60">Learning tracks are open to all students, regardless of hackathon participation. (Tech & Non Tech Groups)</li>
                            </ul>
                        </div>
                    </div>

                    {/* Phase II */}
                    <div className="bg-white border-2 border-[#BE3228] rounded-2xl p-10 shadow-lg hover:shadow-2xl transition-shadow">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="bg-[#BE3228] text-white w-16 h-16 rounded-full flex items-center justify-center font-poppins text-2xl">
                                II
                            </div>
                            <h4 className="font-poppins text-2xl text-[#232F3E]">
                                Hackathon
                            </h4>
                        </div>
                        <p className="text-[#232F3E]/70 text-lg mb-4 font-sans font-bold">
                            Intelligent. Autonomous. Agentic in Action.

                        </p>
                        <p className="text-[#232F3E]/80 font-sans text-lg mb-6">
                            An inclusive, student-focused hackathon open to engineering and technology students across Chennai and surrounding regions.
                        </p>

                        <div className="space-y-4 mt-6">
                            <div className="bg-[#005696]/10 p-5 rounded-lg">
                                <p className="font-poppins text-lg text-[#005696] mb-2">Round 1: Ideation</p>
                                <p className="text-lg text-[#232F3E]/70 font-sans">Online submission of ideas</p>
                            </div>
                            <div className="bg-[#BE3228]/10 p-5 rounded-lg">
                                <p className="font-poppins text-lg text-[#BE3228] mb-2">Round 2: Grand Finale</p>
                                <p className="text-lg text-[#232F3E]/70 font-sans">24-Hour Hackathon (In-Person)</p>
                                <p className="text-lg text-[#232F3E]/70 font-sans font-bold">7-8 March 2026</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Prizes Section */}
                <div className="bg-[#DDBF74] rounded-2xl p-10 md:p-14 shadow-2xl mb-12 text-white">
                    <div className="text-center mb-10">
                        <h3 className="font-poppins text-5xl md:text-6xl mb-6 drop-shadow-lg">
                            Prizes & Recognition
                        </h3>
                        <div className="inline-block bg-white text-[#C5934C] px-10 py-4 rounded-full">
                            <p className="font-poppins text-4xl md:text-5xl">₹1,00,000+</p>
                        </div>
                        <p className="text-white/90 mt-4 font-sans text-xl">One Lakh Pooled Prizes</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8 mb-10">
                        <div className="bg-white/95 rounded-xl p-8 text-center transform hover:scale-105 transition-transform">
                            <div className="text-6xl mb-4">🥇</div>
                            <p className="font-poppins text-xl text-[#232F3E] mb-3">1st Prize</p>
                            <p className="font-sans text-4xl font-bold text-[#C5934C]">₹30,000</p>
                        </div>
                        <div className="bg-white/95 rounded-xl p-8 text-center transform hover:scale-105 transition-transform">
                            <div className="text-6xl mb-4">🥈</div>
                            <p className="font-poppins text-xl text-[#232F3E] mb-3">2nd Prize</p>
                            <p className="font-sans text-4xl font-bold text-[#C5934C]">₹25,000</p>
                        </div>
                        <div className="bg-white/95 rounded-xl p-8 text-center transform hover:scale-105 transition-transform">
                            <div className="text-6xl mb-4">🥉</div>
                            <p className="font-poppins text-xl text-[#232F3E] mb-3">3rd Prize</p>
                            <p className="font-sans text-4xl font-bold text-[#C5934C]">₹15,000</p>
                        </div>
                    </div>

                    <div className="bg-white/10 backdrop-blur rounded-xl p-8">
                        <p className="font-poppins text-xl mb-4">Additional Benefits:</p>
                        <div className="grid md:grid-cols-2 gap-4">
                            <div className="flex items-start gap-3">
                                <span className="text-[#FF9900] text-lg">✓</span>
                                <span className="text-lg font-sans">Exclusive Kyndryl & AWS Merchandise worth ₹25,000</span>
                            </div>
                            <div className="flex items-start gap-3">
                                <span className="text-[#FF9900] text-lg">✓</span>
                                <span className="text-lg font-sans">$50 lab for all Hackathon Teams</span>
                            </div>
                            <div className="flex items-start gap-3">
                                <span className="text-[#FF9900] text-lg">✓</span>
                                <span className="text-lg font-sans">$150+ learning materials</span>
                            </div>
                            <div className="flex items-start gap-3">
                                <span className="text-[#FF9900] text-lg">✓</span>
                                <span className="text-lg font-sans">Industry exposure & mentorship</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Curtain Raiser Event */}
                <div className="bg-[#DDBF74] rounded-2xl p-10 shadow-xl mb-12 text-white">
                    <h3 className="font-poppins text-4xl mb-8 text-center">
                        Curtain Raiser Event
                    </h3>
                    <p className="text-center text-2xl mb-8 font-sans">14th February 2026 • Lattice Hall</p>

                    <div className="grid md:grid-cols-3 gap-8">
                        <div className="bg-white/10 backdrop-blur rounded-lg p-6 text-center">
                            <div className="text-5xl mb-3">🎓</div>
                            <p className="font-sans text-lg">Master Class for Faculty & TPO</p>
                        </div>
                        <div className="bg-white/10 backdrop-blur rounded-lg p-6 text-center">
                            <div className="text-5xl mb-3">🏆</div>
                            <p className="font-sans text-lg">Recognition for Principals & Deans</p>
                        </div>
                        <div className="bg-white/10 backdrop-blur rounded-lg p-6 text-center">
                            <div className="text-5xl mb-3">🤝</div>
                            <p className="font-sans text-lg">Meet Kyndryl & AWS Leaders</p>
                        </div>
                    </div>
                </div>

                {/* Participation & Eligibility */}
                <div className="grid md:grid-cols-2 gap-8 mb-12">
                    <div className="bg-white border-2 border-[#FF9900]/30 rounded-xl p-8 shadow-lg">
                        <h3 className="font-poppins text-2xl text-[#232F3E] mb-6 flex items-center gap-3">
                            <span className="text-[#FF9900] text-2xl">📋</span>
                            Participation Highlights
                        </h3>
                        <ul className="space-y-3 text-[#232F3E]/80 font-sans text-lg">
                            <li className="flex items-start gap-3">
                                <span className="text-[#FF9900] font-bold text-lg">•</span>
                                <span>No registration fee</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <span className="text-[#FF9900] font-bold text-lg">•</span>
                                <span>Open to all genders</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <span className="text-[#FF9900] font-bold text-lg">•</span>
                                <span>Multiple teams per college (4 participants per team)</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <span className="text-[#FF9900] font-bold text-lg">•</span>
                                <span>Hands-on AWS experience</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <span className="text-[#FF9900] font-bold text-lg">•</span>
                                <span>Opportunity to showcase innovation</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <span className="text-[#FF9900] font-bold text-lg">•</span>
                                <span>Virtual & Facetime with Kyndryl & AWS Industry experts</span>
                            </li>
                        </ul>
                    </div>

                    <div className="bg-white border-2 border-[#005696]/30 rounded-xl p-8 shadow-lg">
                        <h3 className="font-poppins text-2xl text-[#232F3E] mb-6 flex items-center gap-3">
                            <span className="text-[#005696] text-2xl">👥</span>
                            Eligibility
                        </h3>
                        <ul className="space-y-3 text-[#232F3E]/80 font-sans text-lg">
                            <li className="flex items-start gap-3">
                                <span className="text-[#005696] font-bold text-lg">•</span>
                                <span><strong>Courses:</strong> B.E, B.Tech, M.Tech, M.Sc, MCA</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <span className="text-[#005696] font-bold text-lg">•</span>
                                <span><strong>Open to all years</strong> (1st to final year)</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <span className="text-[#005696] font-bold text-lg">•</span>
                                <span><strong>Interest in:</strong> Cloud, AI, and Generative AI</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <span className="text-[#005696] font-bold text-lg">•</span>
                                <span>Eager to learn AWS services</span>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Testimonial Section */}
                <div className="mb-16">
                    <div className="bg-gradient-to-br from-[#232F3E] to-[#1a2332] rounded-2xl p-10 md:p-14 shadow-2xl relative overflow-hidden border border-[#C5934C]/20">
                        {/* Decorative Quote Mark */}
                        <div className="absolute top-0 left-4 text-[#C5934C]/10 font-serif text-[12rem] leading-none select-none">
                            “
                        </div>

                        <div className="relative z-10 max-w-4xl mx-auto text-center">
                            <div className="text-white/90 font-sans text-xl md:text-2xl space-y-8 italic leading-relaxed">
                                <p>
                                    "AI Ascend is our flagship initiative in partnership with Amazon Web Services and Kyndryl to bring Generative and Agentic AI to students across Tamil Nadu."
                                </p>
                                <p>
                                    "AI is no longer optional it is essential. Through hands-on hackathons, real-world challenges, and industry mentorship, we are empowering students to move from learning AI to building with it."
                                </p>
                                <p className="font-semibold text-[#C5934C]">
                                    "AI Ascend is where innovation begins and future-ready talent is shaped."
                                </p>
                            </div>

                            <div className="mt-12 flex flex-col items-center justify-center">
                                <div className="relative w-24 h-24 rounded-full overflow-hidden">
                                    <Image
                                        src="/ascend/mohansir.jpeg"
                                        alt="Dr. Raj C. Mohan"
                                        fill
                                        className="object-contain p-2 rounded-full"
                                    />
                                </div>

                                <h4 className="font-poppins text-2xl text-white mb-1">
                                    Dr. Raj C. Mohan
                                </h4>

                            </div>
                        </div>
                    </div>
                </div>

                {/* Contact & Registration */}
                <div className="bg-[#DDBF74] rounded-2xl p-10 md:p-14 shadow-2xl text-white">
                    <h3 className="font-poppins text-4xl mb-10 text-center">
                        Contact Information
                    </h3>

                    <div className="grid md:grid-cols-2 gap-10 mb-10">
                        <div className="bg-white/10 backdrop-blur rounded-xl p-8">
                            <h4 className="font-poppins text-xl mb-4 text-white">Mr. Joel John</h4>
                            <p className="font-sans text-lg text-white/80">AP / CSE</p>
                            <p className="font-sans text-lg text-white/80">Saveetha Engineering College</p>
                            <p className="font-sans text-lg text-white/90 mt-3">Ph: 98941 28078</p>
                        </div>
                        <div className="bg-white/10 backdrop-blur rounded-xl p-8">
                            <h4 className="font-poppins text-xl mb-4 text-white">Dr. S. Kalpana</h4>
                            <p className="font-sans text-lg text-white/80">Professor</p>
                            <p className="font-sans text-lg text-white/80">Saveetha Engineering College</p>
                            <p className="font-sans text-lg text-white/90 mt-3">Ph: 90804 95844</p>
                        </div>
                    </div>

                    <div className="text-center">
                        <p className="font-sans text-lg mb-6 text-white/70">
                            Start your AI learning journey today.<br />
                        </p>

                        {/* QR Code in Contact Section */}
                        <div className="inline-block bg-white p-6 rounded-2xl mb-6">
                            <div className="relative w-48 h-48">
                                <Image
                                    src="/ascend/awsacademy-qr.png"
                                    alt="Scan to Register for AI Ascend 2026"
                                    fill
                                    className="object-contain"
                                />
                            </div>
                            <p className="text-[#232F3E] font-sans text-lg mt-3">Scan to Register</p>
                        </div>

                        <div>
                            <a
                                href={registrationUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-block bg-[#BE3228] hover:bg-[#a02820] text-white font-poppins px-12 py-5 rounded-lg shadow-xl transition-all duration-300 transform hover:scale-105 text-lg"
                            >
                                REGISTER NOW
                            </a>
                        </div>

                    </div>

                    <div className="mt-10 pt-10 border-t border-white/20 text-center">
                        <p className="text-white/90 font-poppins mb-6 text-xl">Powered By</p>
                        {/* <div className="flex flex-wrap items-center justify-center gap-8">
                            <div className="text-[#BE3228] bg-white px-8 py-4 rounded-lg font-bold text-2xl">kyndryl</div>
                            <div className="text-[#FF9900] bg-white px-8 py-4 rounded-lg font-bold text-2xl">AWS</div>
                            <div className="text-[#005696] bg-white px-8 py-4 rounded-lg font-bold text-2xl">SAVEETHA</div>
                        </div> */}

                        <div className="w-[160px] sm:w-[180px] md:w-[420px] lg:w-[700px] mx-auto">
                            <img src="/ascend/ai-ascend-logo.png" alt="ai-ascend-logo" loading="lazy" decoding="async" className="w-full h-auto" />
                        </div>
                    </div>
                </div>

                {/* Disclaimer */}
                <div className="mt-10 text-center">
                    <p className="text-lg text-[#232F3E]/50 font-sans italic max-w-3xl mx-auto">
                        This program is conducted solely for educational and learning purposes. Participation does not imply or guarantee internship, employment, or hiring opportunities.
                    </p>
                </div>
            </div>

        </div>
    );
}
