import React from 'react'
import Image from 'next/image'
import Header from '@/components/Header'
import Footer from '../../components/Footer'

const About = () => {
    const coordinators = [
        {
            name: "Dr. Rajesh Kumar",
            role: "Faculty Coordinator",
            department: "Computer Science & Engineering",
            email: "rajesh.kumar@saveetha.ac.in"
        },
        {
            name: "Priya Sharma",
            role: "Student Coordinator",
            department: "Information Technology",
            email: "priya.sharma@student.saveetha.ac.in"
        },
        {
            name: "Arjun Patel",
            role: "Technical Coordinator",
            department: "Electronics & Communication",
            email: "arjun.patel@student.saveetha.ac.in"
        },
        {
            name: "Sneha Reddy",
            role: "Cultural Coordinator",
            department: "Computer Science & Engineering",
            email: "sneha.reddy@student.saveetha.ac.in"
        }
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

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {coordinators.map((coordinator, index) => (
                            <div key={index} className="bg-background-soft border border-border rounded-xl p-6 text-center hover:border-primary transition-all duration-300 hover:transform hover:scale-105">
                                <div className="w-16 h-16 bg-gradient-to-r from-primary to-secondary rounded-full mx-auto mb-4 flex items-center justify-center">
                                    <span className="text-white font-audiowide text-xl">
                                        {coordinator.name.split(' ').map(n => n[0]).join('')}
                                    </span>
                                </div>
                                <h3 className="font-audiowide text-lg text-white mb-2">{coordinator.name}</h3>
                                <p className="text-primary font-space text-sm mb-1">{coordinator.role}</p>
                                <p className="text-muted-text font-space text-xs mb-3">{coordinator.department}</p>
                                <a href={`mailto:${coordinator.email}`} className="text-accent hover:text-white transition-colors duration-300 font-space text-xs">
                                    {coordinator.email}
                                </a>
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
                            <div className="grid md:grid-cols-2 gap-6 mb-6">
                                <div className="text-center">
                                    <div className="w-16 h-16 bg-gradient-to-r from-primary to-secondary rounded-full mx-auto mb-3 flex items-center justify-center">
                                        <span className="text-white font-audiowide text-lg">MA</span>
                                    </div>
                                    <h4 className="font-audiowide text-lg text-white mb-1">MOHAMED ANAS</h4>
                                    <p className="text-primary font-space text-sm">React Developer</p>
                                </div>
                                <div className="text-center">
                                    <div className="w-16 h-16 bg-gradient-to-r from-secondary to-accent rounded-full mx-auto mb-3 flex items-center justify-center">
                                        <span className="text-white font-audiowide text-lg">MF</span>
                                    </div>
                                    <h4 className="font-audiowide text-lg text-white mb-1">MOHAMED FAROOK</h4>
                                    <p className="text-secondary font-space text-sm">UI/UX Designer</p>
                                </div>
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
            <Footer />
        </div>
    )
}

export default About
