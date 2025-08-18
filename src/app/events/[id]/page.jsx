"use client";
import React, { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

const EventDetailPage = () => {
    const params = useParams()
    const router = useRouter()
    const [event, setEvent] = useState(null)
    const [isRegistered, setIsRegistered] = useState(false)

    const eventsData = {
        1: {
            id: 1,
            title: "Event Catch",
            img: "/circle.png",
            description: "Lorem ipsum, dolor sit amet consectetur adipisicing elit. Quis dolorum a, ducimus esse pariatur assumenda cum eveniet unde.",
            fullDescription: "Event Catch is an exciting competition that challenges participants to demonstrate their quick thinking and problem-solving abilities. This event combines elements of strategy, speed, and creativity to create an unforgettable experience for all participants.",
            date: "March 15, 2025",
            time: "10:00 AM - 4:00 PM",
            venue: "Main Auditorium, Saveetha Engineering College",
            category: "Technical",
            prizes: ["₹10,000", "₹7,000", "₹5,000"],
            rules: [
                "Participants must register before the deadline",
                "Teams of 2-4 members are allowed",
                "All participants must carry valid college ID",
                "Mobile phones are not allowed during the competition",
                "Participants must register before the deadline",
                "Teams of 2-4 members are allowed",
                "All participants must carry valid college ID",
                "Mobile phones are not allowed during the competition",
                "Participants must register before the deadline",
                "Teams of 2-4 members are allowed",
                "All participants must carry valid college ID",
                "Mobile phones are not allowed during the competition"
            ],
            contact: {
                name: "Priya Sharma",
                phone: "+91 9876543210",
                email: "priya.sharma@student.saveetha.ac.in"
            }
        },
        2: {
            id: 2,
            title: "Cube Quest",
            img: "/cube.png",
            description: "Embark on an adventure to solve the mysteries of the Cube Kingdom and conquer its geometric challenges.",
            fullDescription: "Cube Quest is an innovative puzzle-solving competition that tests your spatial reasoning and logical thinking. Participants will navigate through various cube-based challenges, each more complex than the last.",
            date: "March 16, 2025",
            time: "9:00 AM - 5:00 PM",
            venue: "Computer Lab, Block A",
            category: "Technical",
            prizes: ["₹15,000", "₹10,000", "₹7,000"],
            rules: [
                "Individual participation only",
                "Basic knowledge of algorithms required",
                "Laptops will be provided",
                "Duration: 6 hours with breaks",
                "Basic knowledge of algorithms required",
                "Laptops will be provided",
                "Duration: 6 hours with breaks",
                "Basic knowledge of algorithms required",
                "Laptops will be provided",
                "Duration: 6 hours with breaks",
                "Basic knowledge of algorithms required",
                "Laptops will be provided",
                "Duration: 6 hours with breaks"
            ],
            contact: {
                name: "Arjun Patel",
                phone: "+91 9876543211",
                email: "arjun.patel@student.saveetha.ac.in"
            }
        },
        3: {
            id: 3,
            title: "Square Fest",
            img: "/square.png",
            description: "Celebrate symmetry and style at the annual Square Fest, filled with art, games, and food from all corners.",
            fullDescription: "Square Fest is a cultural extravaganza that brings together art, music, dance, and culinary delights. This event celebrates creativity in all its forms and provides a platform for artistic expression.",
            date: "March 17, 2025",
            time: "2:00 PM - 8:00 PM",
            venue: "Open Ground, Campus",
            category: "Cultural",
            prizes: ["₹12,000", "₹8,000", "₹5,000"],
            rules: [
                "Open to all departments",
                "Group performances encouraged",
                "Original content only",
                "Maximum 10 minutes per performance"
            ],
            contact: {
                name: "Sneha Reddy",
                phone: "+91 9876543212",
                email: "sneha.reddy@student.saveetha.ac.in"
            }
        },
        4: {
            id: 4,
            title: "Event Catch",
            img: "/circle.png",
            description: "Lorem ipsum, dolor sit amet consectetur adipisicing elit. Quis dolorum a, ducimus esse pariatur assumenda cum eveniet unde.",
            fullDescription: "Another exciting Event Catch competition with new challenges and opportunities for participants to showcase their skills and win amazing prizes.",
            date: "March 18, 2025",
            time: "11:00 AM - 3:00 PM",
            venue: "Seminar Hall, Block B",
            category: "Technical",
            prizes: ["₹8,000", "₹5,000", "₹3,000"],
            rules: [
                "Teams of 3-5 members",
                "Cross-department teams allowed",
                "Presentation required",
                "Time limit: 4 hours",
                "Teams of 3-5 members",
                "Cross-department teams allowed",
                "Presentation required",
                "Time limit: 4 hours",
                "Teams of 3-5 members",
                "Cross-department teams allowed",
                "Presentation required",
                "Time limit: 4 hours"
            ],
            contact: {
                name: "Dr. Rajesh Kumar",
                phone: "+91 9876543213",
                email: "rajesh.kumar@saveetha.ac.in"
            }
        }
    }

    useEffect(() => {
        const eventId = parseInt(params.id)
        const eventData = eventsData[eventId]
        if (eventData) {
            setEvent(eventData)
        }
    }, [params.id])

    const handleRegistration = () => {
        setIsRegistered(!isRegistered)
    }

    if (!event) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-background via-background-soft to-background flex items-center justify-center">
                <Header />
                <div className="text-center">
                    <h1 className="font-audiowide text-4xl text-white mb-4">Event Not Found</h1>
                    <button
                        onClick={() => router.push('/events')}
                        className="cursor-pointer bg-primary text-white px-6 py-3 rounded-lg font-audiowide hover:bg-hover-primary transition-colors duration-300"
                    >
                        Back to Events
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-background via-background-soft to-background">
            <Header />

            {/* Hero Section */}
            <div className="relative pt-20 pb-12 px-6 md:px-12">
                <div className="max-w-7xl mx-auto">
                    <div className="grid lg:grid-cols-2 gap-12 items-center">
                        <div className="space-y-6">
                            <div className="flex items-center gap-4 mb-4">
                                <button
                                    onClick={() => router.push('/events')}
                                    className="text-muted-text hover:text-primary transition-colors duration-300 font-space"
                                >
                                    ← Back to Events
                                </button>
                                <span className={`px-3 py-1 rounded-full text-xs font-audiowide ${event.category === 'Technical'
                                    ? 'bg-primary/20 text-primary'
                                    : 'bg-secondary/20 text-secondary'
                                    }`}>
                                    {event.category}
                                </span>
                            </div>

                            <h1 className="font-audiowide text-4xl md:text-6xl bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                                {event.title}
                            </h1>

                            <p className="text-muted-text font-space text-lg leading-relaxed">
                                {event.fullDescription}
                            </p>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="bg-background-soft border border-border rounded-lg p-4">
                                    <h3 className="font-audiowide text-sm text-primary mb-2">📅 DATE</h3>
                                    <p className="text-white font-space">{event.date}</p>
                                </div>
                                <div className="bg-background-soft border border-border rounded-lg p-4">
                                    <h3 className="font-audiowide text-sm text-secondary mb-2">⏰ TIME</h3>
                                    <p className="text-white font-space">{event.time}</p>
                                </div>
                                <div className="bg-background-soft border border-border rounded-lg p-4">
                                    <h3 className="font-audiowide text-sm text-accent mb-2">📍 VENUE</h3>
                                    <p className="text-white font-space text-sm">{event.venue}</p>
                                </div>
                            </div>
                        </div>

                        <div className="relative">
                            <div className="relative overflow-hidden rounded-3xl shadow-2xl">
                                <Image
                                    src={event.img}
                                    alt={event.title}
                                    width={600}
                                    height={400}
                                    className="w-full h-auto object-cover"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-background/60 to-transparent"></div>
                            </div>
                            <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-gradient-to-r from-primary to-secondary rounded-full animate-glow opacity-30"></div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Event Details Section */}
            <div className="py-16 px-6 md:px-12 bg-background-soft/50">
                <div className="max-w-7xl mx-auto">
                    <div className="grid lg:grid-cols-3 gap-12">

                        {/* Rules & Guidelines */}
                        <div className="bg-background border border-border rounded-2xl p-6 h-fit">
                            <h3 className="font-audiowide text-xl text-white mb-6 flex items-center gap-2">
                                📋 RULES & GUIDELINES
                            </h3>
                            <div className="max-h-80 overflow-y-auto custom-scrollbar">
                                <ul className="space-y-3 pr-2">
                                    {event.rules.map((rule, index) => (
                                        <li key={index} className="flex items-start gap-3 text-muted-text font-space">
                                            <span className="text-primary text-sm mt-1 flex-shrink-0">•</span>
                                            <span className="text-sm">{rule}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>

                        {/* Prizes */}
                        <div className="bg-background border border-border rounded-2xl p-6">
                            <h3 className="font-audiowide text-xl text-white mb-6 flex items-center gap-2">
                                🏆 PRIZES
                            </h3>
                            <div className="space-y-4">
                                {event.prizes.map((prize, index) => (
                                    <div key={index} className="flex items-center justify-between bg-background-soft rounded-lg p-3">
                                        <span className="font-audiowide text-sm text-muted-text">
                                            {index === 0 ? '1st Place' : index === 1 ? '2nd Place' : '3rd Place'}
                                        </span>
                                        <span className={`font-audiowide text-lg ${index === 0 ? 'text-primary' : index === 1 ? 'text-secondary' : 'text-accent'
                                            }`}>
                                            {prize}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Contact Information */}
                        <div className="bg-background border border-border rounded-2xl p-6">
                            <h3 className="font-audiowide text-xl text-white mb-6 flex items-center gap-2">
                                📞 CONTACT
                            </h3>
                            <div className="space-y-4">
                                <div>
                                    <p className="font-audiowide text-sm text-primary mb-1">Coordinator</p>
                                    <p className="text-white font-space">{event.contact.name}</p>
                                </div>
                                <div>
                                    <p className="font-audiowide text-sm text-secondary mb-1">Phone</p>
                                    <a href={`tel:${event.contact.phone}`} className="text-muted-text hover:text-white transition-colors duration-300 font-space">
                                        {event.contact.phone}
                                    </a>
                                </div>
                                <div>
                                    <p className="font-audiowide text-sm text-accent mb-1">Email</p>
                                    <a href={`mailto:${event.contact.email}`} className="text-muted-text hover:text-white transition-colors duration-300 font-space text-sm">
                                        {event.contact.email}
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Registration Section */}
            <div className="py-16 px-6 md:px-12">
                <div className="max-w-4xl mx-auto text-center">
                    <h2 className="font-audiowide text-3xl md:text-4xl bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-8">
                        READY TO PARTICIPATE?
                    </h2>

                    <div className="bg-background-soft border border-border rounded-2xl p-8 md:p-12">
                        <div className="space-y-6">
                            <p className="text-muted-text font-space text-lg">
                                Join us for an amazing experience at {event.title}. Register now to secure your spot!
                            </p>

                            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                                <button
                                    onClick={handleRegistration}
                                    className={`cursor-pointer px-8 py-4 rounded-xl font-audiowide text-lg transition-all duration-300 transform hover:scale-105 ${isRegistered
                                        ? 'bg-green-600 text-white hover:bg-green-700'
                                        : 'bg-gradient-to-r from-primary to-secondary text-white hover:from-hover-primary hover:to-primary shadow-lg hover:shadow-primary/30'
                                        }`}
                                >
                                    {isRegistered ? '✓ REGISTERED' : 'REGISTER NOW'}
                                </button>

                                <button
                                    onClick={() => router.push('/events')}
                                    className="cursor-pointer px-8 py-4 border border-border text-muted-text rounded-xl font-audiowide text-lg hover:border-primary hover:text-primary transition-all duration-300"
                                >
                                    VIEW ALL EVENTS
                                </button>
                            </div>

                            {isRegistered && (
                                <div className="mt-6 p-4 bg-green-600/20 border border-green-600/50 rounded-lg">
                                    <p className="text-green-400 font-space">
                                        🎉 Registration successful! Check your email for confirmation details.
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    )
}

export default EventDetailPage