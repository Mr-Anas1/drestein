"use client";
import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import MbaHeader from "@/components/MbaHeader";
import Footer from "@/components/Footer";
import Image from "next/image";
import {
    Calendar,
    Clock,
    MapPin,
    Users,
    Trophy,
    FileText,
    Phone,
    Mail,
    ArrowLeft,
    Info,
    ExternalLink,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import SpecialEventRegistrationModal from "@/components/SpecialEventRegistrationModal";
import { getDepartmentName } from "@/constants/departments";

const MbaSpecialEventDetailPage = () => {
    const params = useParams();
    const router = useRouter();

    const { user, isAuthenticated } = useAuth();
    const [event, setEvent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showRegistrationModal, setShowRegistrationModal] = useState(false);
    const [isRegistered, setIsRegistered] = useState(false);

    useEffect(() => {
        const fetchEvent = async () => {
            try {
                if (!params.id) return;
                setLoading(true);
                const res = await fetch(`/api/special-events?id=${encodeURIComponent(params.id)}`, {
                    cache: "no-store",
                });
                if (!res.ok) throw new Error("Event not found");
                const data = await res.json();
                setEvent(data);
                setLoading(false);
            } catch (err) {
                console.error("Error fetching event:", err);
                setError(err.message);
                setLoading(false);
            }
        };

        fetchEvent();
    }, [params.id]);

    useEffect(() => {
        const checkRegistration = async () => {
            try {
                if (!user || !event?.id) return;
                const res = await fetch(`/api/registrations?userUid=${encodeURIComponent(user.uid)}`);
                if (!res.ok) return;
                const data = await res.json();
                const list = Array.isArray(data?.participants) ? data.participants : [];
                const match = list.find((r) => r.eventId === event.id || r.eventId === params.id);
                setIsRegistered(!!match);
            } catch (_e) {
                setIsRegistered(false);
            }
        };

        checkRegistration();
    }, [user, event?.id, params.id]);

    const isExpired = (() => {
        const raw = event?.expiryDate;
        if (!raw) return false;
        const d = new Date(raw);
        if (isNaN(d.getTime())) return false;
        const end = new Date(d);
        if (String(raw).length <= 10 && /\d{4}-\d{2}-\d{2}/.test(String(raw))) end.setHours(23, 59, 59, 999);
        return new Date() > end;
    })();

    if (loading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="text-white font-audiowide text-xl">Loading...</div>
            </div>
        );
    }

    if (error || !event) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="text-center">
                    <div className="text-red-500 font-audiowide text-xl mb-4">Event not found</div>
                    <button onClick={() => router.push("/mba")} className="text-primary hover:text-hover-primary font-space">
                        Back to MBA
                    </button>
                </div>
            </div>
        );
    }

    const competitionFileName = (() => {
        const base = String(event?.title || "competition-file")
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-+|-+$/g, "");
        const url = String(event?.competitionPptUrl || "");
        const urlExtMatch = url.match(/\.([a-z0-9]{1,6})(?:$|[?#])/i);
        const ext = urlExtMatch ? `.${urlExtMatch[1].toLowerCase()}` : "";
        return `${base || "competition-file"}${ext}`;
    })();

    const competitionDownloadUrl = (() => {
        const url = String(event?.competitionPptUrl || "");
        if (!url) return "";
        const uploadMarker = "/upload/";
        const idx = url.indexOf(uploadMarker);
        if (idx !== -1) {
            const before = url.slice(0, idx + uploadMarker.length);
            const after = url.slice(idx + uploadMarker.length);
            if (!/(^|\/)fl_attachment/.test(after)) {
                const safeName = encodeURIComponent(competitionFileName);
                return `${before}fl_attachment:${safeName}/${after}`;
            }
        }
        return url;
    })();

    return (
        <div className="min-h-screen bg-gradient-to-br from-background via-background-soft to-background">
            <MbaHeader />
            {params.id === "YDWrdDuodUYm72qLJZN0" && (
                <div className="border-y border-green-500 text-green-100 py-2 overflow-hidden relative">
                    <div className="animate-marquee whitespace-nowrap">
                        <p className="font-space text-sm flex items-center gap-2 inline-block">
                            <Info className="w-4 h-4 flex-shrink-0 inline-block text-green-400" />
                            <span className="text-green-400 font-bold">
                                Submission deadline extended to <span className="font-bold pr-24 text-green-400">5th November 2025</span>
                            </span>
                            <span className="text-green-400 font-bold">
                                Submission deadline extended to <span className="font-bold pr-24 text-green-400">5th November 2025</span>
                            </span>
                            <span className="text-green-400 font-bold">
                                Submission deadline extended to <span className="font-bold pr-24  text-green-400">5th November 2025</span>
                            </span>
                        </p>
                    </div>
                </div>
            )}

            <div className="py-20 px-6 md:px-12 max-w-6xl mx-auto">
                <button
                    onClick={() => {
                        if (typeof window !== "undefined" && window.history.length > 1) {
                            router.back();
                        } else {
                            router.push("/mba");
                        }
                    }}
                    className="flex items-center gap-2 text-muted-text hover:text-primary transition-colors mb-8 font-space"
                >
                    <ArrowLeft className="w-5 h-5" />
                    Back to MBA
                </button>

                <div className="grid md:grid-cols-2 gap-8 mb-12">
                    <div className="relative h-[400px] rounded-2xl overflow-hidden border border-border">
                        <Image
                            src={event.img || "/images/default-event.jpg"}
                            fill
                            style={{ objectFit: "cover" }}
                            alt={event.title}
                            loading="lazy"
                        />
                    </div>

                    <div className="bg-background-soft border border-border rounded-2xl p-8 space-y-6">
                        <div>
                            <div className="flex items-center gap-2 mb-4 flex-wrap">
                                <span className="bg-secondary/10 text-secondary border border-secondary/20 px-4 py-2 rounded-full font-space text-sm capitalize">
                                    {event.category}
                                </span>
                                {Array.isArray(event.departments) && event.departments.length > 0 ? (
                                    <span className="bg-primary/10 text-primary border border-primary/20 px-4 py-2 rounded-full font-space text-sm">
                                        {event.departments.map((d) => getDepartmentName(d)).join(", ")}
                                    </span>
                                ) : event.department ? (
                                    <span className="bg-primary/10 text-primary border border-primary/20 px-4 py-2 rounded-full font-space text-sm">
                                        {getDepartmentName(event.department)}
                                    </span>
                                ) : null}
                            </div>

                            <h1 className="font-audiowide text-3xl md:text-4xl text-white mb-4">{event.title}</h1>
                            <p className="text-muted-text font-space leading-relaxed">{event.description}</p>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            {event.date && (
                                <div className="flex items-center gap-3 text-muted-text">
                                    <Calendar className="w-5 h-5 text-secondary" />
                                    <span className="font-space">{event.date}</span>
                                </div>
                            )}
                            {event.time && (
                                <div className="flex items-center gap-3 text-muted-text">
                                    <Clock className="w-5 h-5 text-secondary" />
                                    <span className="font-space">{event.time}</span>
                                </div>
                            )}
                            {event.venue && (
                                <div className="flex items-center gap-3 text-muted-text col-span-2">
                                    <MapPin className="w-5 h-5 text-secondary" />
                                    <span className="font-space">{event.venue}</span>
                                </div>
                            )}
                            {event.type && (
                                <div className="flex items-center gap-3 text-muted-text col-span-2">
                                    <Users className="w-5 h-5 text-secondary" />
                                    <span className="font-space capitalize">{event.type}</span>
                                    {event.type === "team" && event.maxTeamSize && (
                                        <span className="text-sm">(Max {event.maxTeamSize} members)</span>
                                    )}
                                </div>
                            )}
                        </div>

                        <div className="flex items-center justify-between p-4 bg-background rounded-xl border border-border">
                            <div className="text-white font-audiowide text-2xl">₹{event.price}</div>
                            <button
                                onClick={() => setShowRegistrationModal(true)}
                                disabled={isExpired || (isAuthenticated && isRegistered)}
                                className={`font-audiowide px-6 py-3 rounded-lg transition-all duration-300 ${isExpired || (isAuthenticated && isRegistered)
                                        ? "bg-gray-600 cursor-not-allowed"
                                        : "bg-gradient-to-r from-primary to-secondary hover:from-hover-primary hover:to-primary"
                                    } text-white`}
                            >
                                {isExpired ? "Expired" : isAuthenticated && isRegistered ? "Registered" : "Register"}
                            </button>
                        </div>
                    </div>
                </div>

                {(event.rules?.length > 0 || event.prizes?.length > 0) && (
                    <div className="grid md:grid-cols-2 gap-8 mb-12">
                        {event.rules?.length > 0 && (
                            <div className="bg-background-soft border border-border rounded-2xl p-8">
                                <h2 className="font-audiowide text-2xl text-white mb-6 flex items-center gap-3">
                                    <FileText className="w-6 h-6 text-secondary" />
                                    Rules
                                </h2>
                                <ul className="space-y-3">
                                    {event.rules.map((rule, index) => (
                                        <li key={index} className="text-muted-text font-space flex items-start gap-3">
                                            <span className="w-2 h-2 bg-secondary rounded-full mt-2 flex-shrink-0" />
                                            <span>{rule}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {event.prizes?.length > 0 && (
                            <div className="bg-background-soft border border-border rounded-2xl p-8">
                                <h2 className="font-audiowide text-2xl text-white mb-6 flex items-center gap-3">
                                    <Trophy className="w-6 h-6 text-secondary" />
                                    Prizes
                                </h2>
                                <ul className="space-y-3">
                                    {event.prizes.map((prize, index) => (
                                        <li key={index} className="text-muted-text font-space flex items-start gap-3">
                                            <span className="w-2 h-2 bg-secondary rounded-full mt-2 flex-shrink-0" />
                                            <span>{prize}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                )}

                {(event.contactEmail || event.contactPhone || (Array.isArray(event.studentCoordinators) && event.studentCoordinators.length) || (Array.isArray(event.facultyCoordinators) && event.facultyCoordinators.length)) && (
                    <div className="bg-background-soft border border-border rounded-2xl p-8 mb-12">
                        <h2 className="font-audiowide text-2xl text-white mb-6">Contact</h2>

                        <div className="grid md:grid-cols-2 gap-6">
                            {event.contactPhone && (
                                <div className="flex items-center gap-3 text-muted-text">
                                    <Phone className="w-5 h-5 text-secondary" />
                                    <a className="font-space hover:text-primary" href={`tel:${event.contactPhone}`}>
                                        {event.contactPhone}
                                    </a>
                                </div>
                            )}

                            {event.contactEmail && (
                                <div className="flex items-center gap-3 text-muted-text">
                                    <Mail className="w-5 h-5 text-secondary" />
                                    <a className="font-space hover:text-primary" href={`mailto:${event.contactEmail}`}>
                                        {event.contactEmail}
                                    </a>
                                </div>
                            )}

                            {Array.isArray(event.studentCoordinators) && event.studentCoordinators.length > 0 && (
                                <div className="md:col-span-2">
                                    <div className="text-white font-audiowide mb-2">Student Coordinators</div>
                                    <div className="grid md:grid-cols-2 gap-4">
                                        {event.studentCoordinators.map((c, idx) => (
                                            <div key={idx} className="bg-background border border-border rounded-xl p-4">
                                                <div className="text-white font-space font-semibold">{c?.name}</div>
                                                {c?.phone && <div className="text-muted-text font-space text-sm">{c.phone}</div>}
                                                {c?.email && <div className="text-muted-text font-space text-sm">{c.email}</div>}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {Array.isArray(event.facultyCoordinators) && event.facultyCoordinators.length > 0 && (
                                <div className="md:col-span-2">
                                    <div className="text-white font-audiowide mb-2">Faculty Coordinators</div>
                                    <div className="grid md:grid-cols-2 gap-4">
                                        {event.facultyCoordinators.map((c, idx) => (
                                            <div key={idx} className="bg-background border border-border rounded-xl p-4">
                                                <div className="text-white font-space font-semibold">{c?.name}</div>
                                                {c?.phone && <div className="text-muted-text font-space text-sm">{c.phone}</div>}
                                                {c?.email && <div className="text-muted-text font-space text-sm">{c.email}</div>}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {(event.competitionPptUrl || event.competitionGformLink) && (
                    <div className="bg-background-soft border border-border rounded-2xl p-8 mb-12">
                        <h2 className="font-audiowide text-2xl text-white mb-6">Resources</h2>
                        <div className="flex flex-col sm:flex-row gap-4">
                            {event.competitionPptUrl && (
                                <a
                                    href={competitionDownloadUrl || event.competitionPptUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="inline-flex items-center gap-2 bg-background border border-border text-white font-audiowide px-5 py-3 rounded-lg hover:border-primary transition-colors"
                                >
                                    <ExternalLink className="w-5 h-5 text-secondary" />
                                    Download File
                                </a>
                            )}
                            {event.competitionGformLink && (
                                <a
                                    href={event.competitionGformLink}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="inline-flex items-center gap-2 bg-background border border-border text-white font-audiowide px-5 py-3 rounded-lg hover:border-primary transition-colors"
                                >
                                    <ExternalLink className="w-5 h-5 text-secondary" />
                                    Open Form
                                </a>
                            )}
                        </div>
                    </div>
                )}
            </div>

            <Footer />

            {showRegistrationModal && (
                <SpecialEventRegistrationModal
                    event={event}
                    onClose={() => setShowRegistrationModal(false)}
                    isAuthenticated={isAuthenticated}
                />
            )}
        </div>
    );
};

export default MbaSpecialEventDetailPage;
