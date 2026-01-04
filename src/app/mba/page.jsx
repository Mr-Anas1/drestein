"use client";

import MbaHeader from "@/components/MbaHeader";
import Footer from "@/components/Footer";
import Image from "next/image";
import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Calendar, Clock, ExternalLink, IndianRupee } from "lucide-react";

export default function MbaPage() {
    const searchParams = useSearchParams();
    const [payLoading, setPayLoading] = useState(false);
    const [payError, setPayError] = useState("");

    const paymentStatus = useMemo(() => {
        const status = String(searchParams?.get("status") || "").toLowerCase();
        if (status === "success") return "success";
        if (status === "failed") return "failed";
        return "";
    }, [searchParams]);

    const orderId = useMemo(() => {
        return String(searchParams?.get("orderId") || "");
    }, [searchParams]);

    const googleFormUrl = process.env.NEXT_PUBLIC_MBA_MARKETING_ANALYTICS_FORM_URL || "";

    const startPayment = async () => {
        try {
            setPayLoading(true);
            setPayError("");
            const res = await fetch("/api/payments/ccavenue/mba/initiate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ amount: 500 }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data?.error || "Failed to initiate payment");
            if (data.directUrl) {
                window.location.href = data.directUrl;
                return;
            }
            throw new Error("Missing payment redirect URL");
        } catch (e) {
            setPayError(e?.message || "Failed to start payment");
        } finally {
            setPayLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-background via-background-soft to-background">
            <MbaHeader />
            <div className="py-16 px-6 md:px-12 max-w-6xl mx-auto">
                <div className="grid lg:grid-cols-2 gap-10 items-start">
                    <div className="space-y-6">
                        <h1 className="font-audiowide text-3xl md:text-5xl bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                            Marketing Analytics
                        </h1>
                        <p className="text-muted-text font-space text-base md:text-lg">
                            5-Days Virtual Faculty Development Program on "Marketing Analytics"
                        </p>

                        <div className="bg-background-soft border border-border rounded-2xl p-6 space-y-4">
                            <div className="flex flex-wrap gap-4">
                                <div className="flex items-center gap-2 text-muted-text font-space">
                                    <Calendar className="w-5 h-5 text-secondary" />
                                    <span>19th - 23rd Jan 2026</span>
                                </div>
                                <div className="flex items-center gap-2 text-muted-text font-space">
                                    <Clock className="w-5 h-5 text-secondary" />
                                    <span>6.00 PM to 8.00 PM</span>
                                </div>
                            </div>

                            <div className="flex items-center justify-between gap-4 flex-wrap">
                                <div>
                                    <div className="text-muted-text font-space text-sm">Registration Fees</div>
                                    <div className="text-white font-audiowide text-3xl flex items-center gap-1">
                                        <IndianRupee className="w-6 h-6 text-primary" />
                                        500
                                    </div>
                                    <div className="text-muted-text font-space text-xs">(inclusive of GST)</div>
                                </div>

                                <button
                                    type="button"
                                    onClick={startPayment}
                                    disabled={payLoading}
                                    className="bg-gradient-to-r from-primary to-secondary text-white font-audiowide px-6 py-3 rounded-lg hover:from-hover-primary hover:to-primary transition-all duration-300 disabled:opacity-60"
                                >
                                    {payLoading ? "Redirecting..." : "Pay Now"}
                                </button>
                            </div>

                            {payError && (
                                <div className="text-red-400 font-space text-sm bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                                    {payError}
                                </div>
                            )}

                            <div className="bg-background border border-border rounded-xl p-4">
                                <div className="text-white font-audiowide mb-2">Step 2: Register after payment</div>
                                <div className="text-muted-text font-space text-sm">
                                    After completing the ₹500 payment, open the registration form and upload your payment screenshot to confirm participation.
                                </div>

                                <div className="mt-3">
                                    {googleFormUrl ? (
                                        <a
                                            href={googleFormUrl}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="inline-flex items-center gap-2 bg-background-soft border border-border text-white font-audiowide px-5 py-3 rounded-lg hover:border-primary transition-colors"
                                        >
                                            <ExternalLink className="w-5 h-5 text-secondary" />
                                            Open Registration Form
                                        </a>
                                    ) : (
                                        <div className="text-muted-text font-space text-sm">
                                            Google Form link is not configured yet.
                                        </div>
                                    )}
                                </div>
                            </div>

                            {paymentStatus === "failed" && (
                                <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4">
                                    <div className="text-yellow-200 font-audiowide mb-1">Payment not completed</div>
                                    <div className="text-muted-text font-space text-xs">
                                        If amount was deducted, please retry after some time or contact coordinators.
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="bg-background-soft border border-border rounded-2xl p-6">
                            <h2 className="font-audiowide text-xl text-white mb-3">
                                Navigating the Marketing Analytics Frontier
                            </h2>
                            <p className="text-muted-text font-space text-sm leading-relaxed">
                                Department of Management Studies
                            </p>
                        </div>
                    </div>

                    <div className="bg-background-soft border border-border rounded-2xl p-4">
                        <div className="relative w-full aspect-[3/4] rounded-xl overflow-hidden">
                            <Image
                                src="/mba/mba-marketing-analytics-image.jpeg"
                                alt="Marketing Analytics poster"
                                fill
                                className="object-cover"
                                priority
                            />
                        </div>

                    </div>

                </div>
                <div className="space-y-4 mt-8">
                    <h3 className="font-audiowide text-xl text-white">
                        Workshop Objectives:
                    </h3>
                    <ul className="list-disc list-inside text-muted-text">
                        <li>
                            Gain foundational expertise in Marketing Analytics and advanced understanding of Causal Analytics.
                        </li>
                        <li>
                            Apply data-driven insights to identify, measure, and interpret causal relationships in marketing contexts.
                        </li>
                        <li>
                            Understand organizational applications of Causal Analytics in real-world marketing departments and strategy formulation.
                        </li>
                        <li>
                            Design analytical models using marketing datasets for segmentation, targeting, and positioning.
                        </li>
                        <li>
                            Test and validate models for accuracy, efficiency, and decision-making effectiveness in marketing analytics.
                        </li>
                    </ul>

                    <h3 className="font-audiowide text-xl text-white">Who Should Attend?</h3>
                    <ul className="list-disc list-inside text-muted-text font-space">
                        <li>
                            This workshop is designed for individuals passionate about leveraging analytics to transform marketing education and practice.
                        </li>
                        <li>Faculty Members</li>
                        <li>Researchers and Academicians</li>
                        <li>Doctoral and Postgraduate Students</li>
                    </ul>

                    <h3 className="font-audiowide text-xl text-white">About the Department</h3>
                    <div className="space-y-2 text-muted-text font-space">
                        <p>The Department of Management Studies at Saveetha Engineering College, established in 2006, is dedicated to developing future-ready business leaders equipped for Industry 5.0 and beyond.</p>
                        <p>Located on the 6th floor of the SEC complex, the MBA program emphasizes leadership, entrepreneurship, and ethical business practices.</p>
                        <p>It integrates experiential learning through case studies, simulations, live projects, and industry visits, supported by advanced tools like the NSE smart lab and CMIE database.</p>
                        <p>Students benefit from guaranteed internships, placement bootcamps, and personalized career counseling. Facilities include smart classrooms, specialized labs, and a resource-rich library.</p>
                        <p>The program offers diverse specializations such as Marketing, Finance, HR, Operations, and Business Analytics. With a focus on holistic development, sustainability, and emotional intelligence, the department nurtures innovative leaders prepared to thrive in a global business environment.</p>
                    </div>

                    <h3 className="font-audiowide text-xl text-white">Resource Persons</h3>
                    <ul className="list-disc list-inside text-muted-text font-space">
                        <li>Dr. V. Gajapathy Professor and Chair, Analytics, School of Business, University of Petroleum and Energy Studies (UPES), Energy Acres, P.O. Bidholi.</li>
                        <li>Dr. Venkateshkumar Professor & Head, Department of Management Studies, Central University of Pondicherry, Puducherry, India.</li>
                    </ul>

                    <h3 className="font-audiowide text-xl text-white">Date & Registration</h3>
                    <div className="space-y-2 text-muted-text font-space">
                        <p>Date: 19ᵗʰ – 23ʳᵈ Jan 2026</p>
                        <p>Time: 6.00 PM to 8.00 PM</p>
                        <p>Registration Fees: Rs. 500/- (inclusive of GST)</p>
                        <p>To register: (QR Code)</p>
                    </div>

                    <h3 className="font-audiowide text-xl text-white">Coordinators</h3>
                    <ul className="list-disc list-inside text-muted-text font-space">
                        <li>Dr. R. Ravimohan AP/MBA – 9444016612</li>
                        <li>Dr. Periasamy P AOP/MBA – 98949 94989</li>
                        <li>Dr. Sangeetha P AP/MBA – 99401 73884</li>
                        <li>Dr. Devi Sangamitra AP/MBA – 98426 50817</li>
                    </ul>

                    <h3 className="font-audiowide text-xl text-white">Convenors</h3>
                    <ul className="list-disc list-inside text-muted-text font-space">
                        <li>Dr. G. Ramasundaram Dean, MBA</li>
                        <li>Dr. R. Senthil Kumar Vice Principal</li>
                        <li>Dr. V. Vijaya Chamundeeswari Principal</li>
                    </ul>
                </div>
            </div>
            <Footer />
        </div>
    );
}
