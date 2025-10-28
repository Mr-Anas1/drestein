import React from 'react'
import Image from 'next/image'
import Header from '@/components/Header'
import Footer from '../../components/Footer'

const About = () => {
    const coordinators = [
        {
            name: "Dr. G. Nagappan",
            role: "Associate Dean (SCOFT)",
            department: "Professor & Head - CSE",
            email: "hod.cse@saveetha.ac.in",
            image: "/nagappan-sir.jpeg",
            linkedin: "https://linkedin.com/in/nagappan",
            profile: "https://saveetha.ac.in/wp-content/uploads/2025/01/Dr.-G.-Nagappan-Profile.pdf"
        },
        {
            name: "Dr. Jyothi P",
            role: "Associate Professor - MBA",
            department: "MBA",
            email: "jyothip@saveetha.ac.in",
            image: "/jyothi-mam.png",
            linkedin: "https://linkedin.com/in/jyothi-p",
            profile: "https://saveetha.ac.in/wp-content/uploads/2025/01/Faculty-Profile-Dr.P.Jyothi.pdf"
        },

    ]

    return (
        <div className="min-h-screen bg-gradient-to-br from-background via-background-soft to-background">
            <Header />
            {/* Hero Section */}
            <div className="relative pt-20 px-6 md:px-12">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <h1 className="font-audiowide text-4xl md:text-6xl lg:text-7xl bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-6">
                            ABOUT US
                        </h1>
                        <p className="text-muted-text font-space text-lg md:text-xl max-w-3xl mx-auto">
                            Discover the story behind DRESTEIN and the institution that makes it all possible
                        </p>
                    </div>
                </div>
            </div>

            {/* College Section */}
            <div className="py-16 px-6 md:px-12">
                <div className="max-w-7xl mx-auto">
                    <div className="grid lg:grid-cols-2 gap-12 items-center">
                        <div className="space-y-6">
                            <h2 className="font-audiowide text-3xl md:text-4xl bg-gradient-to-r from-accent to-primary bg-clip-text text-transparent">
                                SAVEETHA ENGINEERING COLLEGE
                            </h2>
                            <div className="space-y-4 text-muted-text font-space leading-relaxed">
                                <p className="text-lg">
                                    Established with a vision to provide world-class technical education, Saveetha Engineering College stands as a beacon of innovation and excellence in the field of engineering and technology.
                                </p>
                                <p>
                                    Located in the serene campus of Saveetha Nagar, Sriperumbadur Taluk, our institution has been nurturing young minds and shaping future engineers who contribute significantly to society and industry.
                                </p>
                                <p>
                                    With state-of-the-art facilities, experienced faculty, and a commitment to holistic development, we provide an environment where students can explore, innovate, and excel in their chosen fields.
                                </p>
                            </div>
                            <div className="grid grid-cols-2 gap-6 mt-8">
                                <div className="text-center p-4 bg-background-soft rounded-lg border border-border">
                                    <h3 className="font-audiowide text-2xl text-primary">15+</h3>
                                    <p className="text-muted-text font-space">Years of Excellence</p>
                                </div>
                                <div className="text-center p-4 bg-background-soft rounded-lg border border-border">
                                    <h3 className="font-audiowide text-2xl text-secondary">5000+</h3>
                                    <p className="text-muted-text font-space">Students</p>
                                </div>
                            </div>
                        </div>
                        <div className="relative">
                            <div className="relative overflow-hidden rounded-2xl shadow-2xl">
                                <Image
                                    src="/saveetha.jpg"
                                    alt="Saveetha Engineering College Campus"
                                    width={600}
                                    height={400}
                                    className="w-full h-auto object-cover"
                                    loading="lazy"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-background/50 to-transparent"></div>
                            </div>
                            <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-gradient-to-r from-primary to-secondary rounded-full animate-glow opacity-20"></div>
                        </div>
                    </div>
                </div>
            </div>

            {/* DRESTEIN Fest Section */}
            <div className="py-16 px-6 md:px-12 bg-background-soft/50">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-12">
                        <h2 className="font-audiowide text-3xl md:text-5xl bg-gradient-to-r from-secondary to-accent bg-clip-text text-transparent mb-6">
                            DRESTEIN COLLEGE FEST
                        </h2>
                        <p className="text-muted-text font-space text-lg max-w-3xl mx-auto">
                            Where Innovation Meets Celebration
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        <div className="bg-background border border-border rounded-xl p-6 hover:border-primary transition-colors duration-300">
                            <div className="text-primary text-3xl mb-4">🎯</div>
                            <h3 className="font-audiowide text-xl text-white mb-3">TECHNICAL EVENTS</h3>
                            <p className="text-muted-text font-space">
                                Coding competitions, hackathons, robotics challenges, and technical paper presentations that showcase innovation and technical prowess.
                            </p>
                        </div>

                        <div className="bg-background border border-border rounded-xl p-6 hover:border-secondary transition-colors duration-300">
                            <div className="text-secondary text-3xl mb-4">🎭</div>
                            <h3 className="font-audiowide text-xl text-white mb-3">CULTURAL PROGRAMS</h3>
                            <p className="text-muted-text font-space">
                                Dance competitions, music performances, drama, fashion shows, and art exhibitions celebrating creativity and cultural diversity.
                            </p>
                        </div>

                        <div className="bg-background border border-border rounded-xl p-6 hover:border-accent transition-colors duration-300">
                            <div className="text-accent text-3xl mb-4">🏆</div>
                            <h3 className="font-audiowide text-xl text-white mb-3">COMPETITIONS</h3>
                            <p className="text-muted-text font-space">
                                Inter-college competitions, sports events, quiz contests, and various challenges with exciting prizes and recognition.
                            </p>
                        </div>
                    </div>

                    <div className="mt-12 text-center">
                        <p className="text-muted-text font-space text-lg max-w-4xl mx-auto">
                            DRESTEIN is more than just a college fest - it's a platform where students from various disciplines come together to showcase their talents,
                            learn from each other, and create memories that last a lifetime. Our fest promotes innovation, creativity, and collaboration among the next generation of engineers and technologists.
                        </p>
                    </div>
                </div>
            </div>

            {/* Coordinators Section */}
            <div className="py-16 px-6 md:px-12">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-12">
                        <h2 className="font-audiowide text-3xl md:text-4xl bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-6">
                            MEET OUR COORDINATORS
                        </h2>
                        <p className="text-muted-text font-space text-lg">
                            The dedicated team behind DRESTEIN's success
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-6 justify-center">
                        {coordinators.map((coordinator, index) => (
                            <div key={index} className="bg-background-soft border border-border rounded-xl p-6 text-center hover:border-primary transition-all duration-300 hover:transform hover:scale-105 cursor-pointer group">
                                <div className="relative w-24 h-24 bg-gradient-to-r from-primary to-secondary rounded-full mx-auto mb-4 flex items-center justify-center overflow-hidden shadow-lg group-hover:shadow-xl transition-shadow duration-300">
                                    <img 
                                        className="w-full h-full object-cover" 
                                        src={coordinator.image} 
                                        alt={coordinator.name}
                                        loading="lazy" decoding="async"
                                    />
                                </div>
                                <h3 className="font-audiowide text-lg text-white mb-2">{coordinator.name}</h3>
                                <p className="text-primary font-space text-sm mb-1">{coordinator.role}</p>
                                <p className="text-muted-text font-space text-xs mb-4">{coordinator.department}</p>
                                <div className="flex flex-col gap-2">
                                    <a href={`mailto:${coordinator.email}`} className="text-accent hover:text-white transition-colors duration-300 font-space text-xs">
                                        {coordinator.email}
                                    </a>
                                    {/* {coordinator.linkedin && (
                                        <a 
                                            href={coordinator.linkedin} 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center justify-center gap-2 px-3 py-2 bg-primary/20 hover:bg-primary/40 text-primary hover:text-white rounded-lg transition-all duration-300 font-space text-xs"
                                        >
                                            <span>🔗</span> LinkedIn
                                        </a>
                                    )} */}
                                    {
                                        coordinator.profile && (
                                            <a href={coordinator.profile} target="_blank" rel="noopener noreferrer" className="text-accent hover:text-white transition-colors duration-300 font-space text-xs">
                                                Profile
                                            </a>
                                        ) 
                                    }
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Site Builder Section */}
            <div className="py-16 px-6 md:px-12 bg-background-soft/30" id="team">
                <div className="max-w-4xl mx-auto text-center">
                    <h2 className="font-audiowide text-3xl md:text-4xl bg-gradient-to-r from-accent to-secondary bg-clip-text text-transparent mb-8">
                        WEBSITE DEVELOPMENT
                    </h2>

                    <div className="bg-background border border-border rounded-2xl p-8 md:p-12">
                        <div className="w-20 h-20 bg-gradient-to-r from-primary to-accent rounded-full mx-auto mb-6 flex items-center justify-center">
                            <span className="text-white font-audiowide text-2xl">💻</span>
                        </div>

                        <h3 className="font-audiowide text-2xl text-white mb-4">
                            CRAFTED WITH PASSION
                        </h3>

                        <p className="text-muted-text font-space text-lg leading-relaxed mb-6">
                            This website has been meticulously designed and developed to showcase the spirit and excellence of DRESTEIN.
                            Built with modern web technologies including React, Next.js, and Tailwind CSS, it represents our commitment to innovation and quality.
                        </p>

                        <div className="flex flex-wrap justify-center gap-4 mb-8">
                            <span className="px-4 py-2 bg-primary/20 text-primary rounded-full font-space text-sm">React</span>
                            <span className="px-4 py-2 bg-secondary/20 text-secondary rounded-full font-space text-sm">Next.js</span>
                            <span className="px-4 py-2 bg-accent/20 text-accent rounded-full font-space text-sm">Tailwind CSS</span>
                            <span className="px-4 py-2 bg-primary/20 text-primary rounded-full font-space text-sm">JavaScript</span>
                        </div>

                        <div className="border-t border-border pt-6">
                            <div className="grid md:grid-cols-3 gap-6 mb-6">
                                <a href="https://www.linkedin.com/in/md-anas1/" target="_blank" rel="noopener noreferrer" className="text-center group cursor-pointer">
                                    <div className="w-20 h-20 bg-gradient-to-r from-primary to-secondary rounded-full mx-auto mb-3 flex items-center justify-center overflow-hidden shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-110">
                                        <span className="text-white font-audiowide text-lg">MA</span>
                                    </div>
                                    <h4 className="font-audiowide text-lg text-white mb-1 group-hover:text-primary transition-colors duration-300">MOHAMED ANAS</h4>
                                    <p className="text-primary font-space text-sm">React Developer</p>
                                    <p className="text-accent font-space text-xs mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">View Profile →</p>
                                </a>
                                <a href="https://www.linkedin.com/in/mohamed-farook-s-2aa0352b2/" target="_blank" rel="noopener noreferrer" className="text-center group cursor-pointer">
                                    <div className="w-20 h-20 bg-gradient-to-r from-secondary to-accent rounded-full mx-auto mb-3 flex items-center justify-center overflow-hidden shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-110">
                                        <span className="text-white font-audiowide text-lg">MF</span>
                                    </div>
                                    <h4 className="font-audiowide text-lg text-white mb-1 group-hover:text-secondary transition-colors duration-300">MOHAMED FAROOK</h4>
                                    <p className="text-secondary font-space text-sm">UI/UX Designer</p>
                                    <p className="text-accent font-space text-xs mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">View Profile →</p>
                                </a>
                                <a href="https://www.linkedin.com/in/rdxkeerthi" target="_blank" rel="noopener noreferrer" className="text-center group cursor-pointer">
                                    <div className="w-20 h-20 bg-gradient-to-r from-accent to-primary rounded-full mx-auto mb-3 flex items-center justify-center overflow-hidden shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-110">
                                        <span className="text-white font-audiowide text-lg">K</span>
                                    </div>
                                    <h4 className="font-audiowide text-lg text-white mb-1 group-hover:text-accent transition-colors duration-300">KEERTHIVASAN M</h4>
                                    <p className="text-accent font-space text-sm">Security & Testing</p>
                                    <p className="text-accent font-space text-xs mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">View Profile →</p>
                                </a>
                            </div>
                            <p className="text-muted-text font-space text-sm">
                                Developed by the <span className="text-primary font-audiowide">DRESTEIN Development Team</span>
                            </p>
                            <p className="text-muted-text font-space text-xs mt-2">
                                © 2025 Saveetha Engineering College. All rights reserved.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Design and Media Team Section */}
            <div className="py-16 px-6 md:px-12">
                <div className="max-w-4xl mx-auto">
                    <h2 className="font-audiowide text-center text-3xl md:text-4xl bg-gradient-to-r from-accent to-secondary bg-clip-text text-transparent mb-8">
                        GRAPHICS DESIGNERS
                    </h2>
                    <div className="bg-background border border-border rounded-2xl p-8 md:p-12">
                        <div className="w-20 h-20 bg-gradient-to-r from-secondary to-accent rounded-full mx-auto mb-6 flex items-center justify-center">
                            <span className="text-white font-audiowide text-2xl">🎨</span>
                        </div>

                        <h3 className="font-audiowide text-center text-2xl text-white mb-4">
                            CRAFTED WITH CREATIVITY
                        </h3>

                        <p className="text-muted-text text-center font-space text-lg leading-relaxed mb-6">
                            This design has been thoughtfully envisioned and brought to life to capture the essence and vibrance of DRESTEIN.
                            Created using modern design principles and tools like Adobe Illustrator, Photoshop, and Figma, it stands as a reflection of our dedication to artistry, precision, and visual excellence.
                        </p>

                        <div className="flex flex-wrap justify-center gap-4 mb-8">
                            <span className="px-4 py-2 bg-secondary/20 text-secondary rounded-full font-space text-sm">Adobe Photoshop</span>
                            <span className="px-4 py-2 bg-accent/20 text-accent rounded-full font-space text-sm">Adobe Illustrator</span>
                            <span className="px-4 py-2 bg-secondary/20 text-secondary rounded-full font-space text-sm">Figma</span>
                        </div>

                        <div className="border-t border-border pt-6">
                            <div className="grid md:grid-cols-2 gap-6 mb-6">
                                <a href="https://www.linkedin.com/in/priyan-v-43496332a?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=ios_app" target="_blank" rel="noopener noreferrer" className="text-center group cursor-pointer">
                                    <div className="w-16 h-16 bg-gradient-to-r from-secondary to-accent rounded-full mx-auto mb-3 flex items-center justify-center overflow-hidden shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-110">
                                        <span className="text-white font-audiowide text-sm">PV</span>
                                    </div>
                                    <h4 className="font-audiowide text-base text-white mb-1 group-hover:text-secondary transition-colors duration-300">PRIYAN V</h4>
                                    <p className="text-secondary font-space text-xs">Designer</p>
                                    <p className="text-accent font-space text-xs mt-1">AI&DS</p>
                                    <p className="text-accent font-space text-xs mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">View Profile →</p>
                                </a>
                                <a href="https://www.linkedin.com/in/jayaganapathi?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app" target="_blank" rel="noopener noreferrer" className="text-center group cursor-pointer">
                                    <div className="w-16 h-16 bg-gradient-to-r from-accent to-secondary rounded-full mx-auto mb-3 flex items-center justify-center overflow-hidden shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-110">
                                        <span className="text-white font-audiowide text-sm">JS</span>
                                    </div>
                                    <h4 className="font-audiowide text-base text-white mb-1 group-hover:text-accent transition-colors duration-300">JAYAGANAPATHI S</h4>
                                    <p className="text-accent font-space text-xs">Designer</p>
                                    <p className="text-secondary font-space text-xs mt-1">CSE</p>
                                    <p className="text-accent font-space text-xs mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">View Profile →</p>
                                </a>
                            </div>
                            
                        </div>
                    </div>
                </div>
            </div>

            {/* DSC Coordinators Section */}
            <div className="py-16 px-6 md:px-12">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-12">
                        <h2 className="font-audiowide text-3xl md:text-4xl bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-6">
                            DSC COORDINATORS
                        </h2>
                        <p className="text-muted-text font-space text-lg">
                            Department Student Coordinators leading DRESTEIN across all branches
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {[
                            { dept: "AI&DS", name: "Ms. SANTHIYA R", contact: "9566694699" },
                            { dept: "AI&ML", name: "Mr. POZHILAN", contact: "9043693955" },
                            { dept: "AGRI", name: "Ms. SANJANA", contact: "9600037887" },
                            { dept: "BIO-MED", name: "Ms. SHERENA", contact: "9566533465" },
                            { dept: "CHEM", name: "Mr. HARISHANKAR E", contact: "8807051192"},
                            { dept: "CIVIL", name: "Mr. ARUN KUMAR", contact: "8072582553" },
                            { dept: "CSE", name: "Mr. GOKUL SHARAN R", contact: "9791486718" },
                            { dept: "CYB SEC", name: "Mr. RAGUL RAAJAN T", contact: "9488001452" },
                            { dept: "ECE", name: "Mr. ABINANDHAN G", contact: "6383796369" },
                            { dept: "EEE", name: "Mr. VISVANTH", contact: "9840928549"},
                            { dept: "EIE", name: "Mr. JEGINTHAN", contact: "6374470752"},
                            { dept: "IoT", name: "Ms. RAJALAKSHMI R", contact: "9488610743" },
                            { dept: "MECH", name: "Mr. VISAKAN G", contact: "7094998410"},
                            { dept: "MED ELE", name: "Ms. MADHUMITHA E. M", contact: "9629934867" },
                            { dept: "IT", name: "Ms. LAKSHMI PRIYA V", contact: "6381478448" },
                            { dept: "S&H", name: "Mr. JOTHIKRISHNAA V", contact: "9042162885" },
                        ].map((coord, index) => (
                            <div key={index} className="bg-background-soft border border-border rounded-lg p-4 hover:border-primary transition-all duration-300 hover:transform hover:scale-105 w-full">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="w-10 h-10 bg-gradient-to-r from-primary to-secondary rounded-full flex items-center justify-center flex-shrink-0">
                                        <span className="text-white font-audiowide text-xs">
                                            {coord.dept.split(' ').map(w => w[0]).join('')}
                                        </span>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-audiowide text-xs text-primary mb-1">{coord.dept}</h4>
                                        <h3 className="font-space text-sm text-white truncate">{coord.name}</h3>
                                        {coord.extra && (
                                            <p className="text-muted-text font-space text-xs">{coord.extra}</p>
                                        )}
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 mt-2 pt-2 border-t border-border">
                                    <span className="text-accent text-xs">📞</span>
                                    <a href={`tel:${coord.contact}`} className="text-muted-text hover:text-accent transition-colors duration-300 font-space text-xs">
                                        {coord.contact}
                                    </a>
                                </div>
                            </div>
                        ))}
                        
                        {/* MBA with two coordinators */}
                        
                        <div className="bg-background-soft border border-border rounded-lg p-4 hover:border-primary transition-all duration-300 hover:transform hover:scale-105">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="w-10 h-10 bg-gradient-to-r from-primary to-secondary rounded-full flex items-center justify-center flex-shrink-0">
                                    <span className="text-white font-audiowide text-xs">MBA</span>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className="font-audiowide text-xs text-primary mb-1">MBA</h4>
                                </div>
                            </div>
                            <div className="space-y-2 mt-2 pt-2 border-t border-border">
                                <div>
                                    <h3 className="font-space text-sm text-white">Mr. AAKASH</h3>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className="text-accent text-xs">📞</span>
                                        <a href="tel:7305323223" className="text-muted-text hover:text-accent transition-colors duration-300 font-space text-xs">
                                            7305323223
                                        </a>
                                    </div>
                                </div>
                                <div className="pt-2 border-t border-border/50">
                                    <h3 className="font-space text-sm text-white">Mr. HARIVIGNESH</h3>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className="text-accent text-xs">📞</span>
                                        <a href="tel:9445946319" className="text-muted-text hover:text-accent transition-colors duration-300 font-space text-xs">
                                            9445946319
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    )
}

export default About
