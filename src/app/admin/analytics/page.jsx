"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import { useAuth } from '@/contexts/AuthContext';
import { getDepartmentName } from '@/constants/departments';
import { ArrowLeft, TrendingUp, Users, DollarSign, Award, Building2, Ticket, Eye, Download } from 'lucide-react';
import ViewOuterCollegeModal from '@/components/ViewOuterCollegeModal';
import DepartmentDetailsModal from '@/components/DepartmentDetailsModal';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const AnalyticsDashboard = () => {
    const { user, userRole, loading: authLoading, isSuperAdmin } = useAuth();
    const router = useRouter();
    const [analytics, setAnalytics] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showOuterCollegeModal, setShowOuterCollegeModal] = useState(false);
    const [selectedDepartment, setSelectedDepartment] = useState(null);
    const [showDepartmentModal, setShowDepartmentModal] = useState(false);

    // Authentication check - only allow super_admin
    useEffect(() => {
        if (!authLoading) {
            if (!user) {
                router.push('/admin/login');
            } else if (userRole && !isSuperAdmin) {
                router.push('/admin');
            }
        }
    }, [user, authLoading, userRole, isSuperAdmin, router]);

    // Fetch analytics data
    useEffect(() => {
        if (user && isSuperAdmin) {
            fetchAnalytics();
        }
    }, [user, isSuperAdmin]);

    const fetchAnalytics = async () => {
        try {
            setLoading(true);
            setError(null);
            const { auth } = await import('@/lib/firebase');
            const token = await auth.currentUser?.getIdToken?.();
            
            const res = await fetch('/api/admin/analytics', {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (!res.ok) {
                throw new Error('Failed to fetch analytics');
            }

            const data = await res.json();
            setAnalytics(data);
        } catch (err) {
            console.error('Error fetching analytics:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (authLoading || loading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="text-white font-audiowide">Loading Analytics...</div>
            </div>
        );
    }

    if (!user || !isSuperAdmin) {
        return null;
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-background via-background-soft to-background">
                <Header />
                <div className="py-20 px-6 md:px-12 max-w-7xl mx-auto">
                    <div className="text-center">
                        <h1 className="font-audiowide text-3xl text-red-500 mb-4">Error Loading Analytics</h1>
                        <p className="text-muted-text mb-6">{error}</p>
                        <button
                            onClick={() => router.push('/admin')}
                            className="bg-gradient-to-r from-primary to-secondary text-white px-6 py-3 rounded-lg font-audiowide hover:from-hover-primary hover:to-primary transition-all duration-300"
                        >
                            Back to Dashboard
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Sort departments by total participants
    const sortedDepartments = analytics?.departmentWise 
        ? Object.entries(analytics.departmentWise)
            .sort((a, b) => b[1].totalParticipants - a[1].totalParticipants)
        : [];

    const exportFullReport = () => {
        const doc = new jsPDF();
        let yPos = 20;
        
        // Title
        doc.setFontSize(20);
        doc.setFont(undefined, 'bold');
        doc.text('DRESTEIN Analytics Report', 14, yPos);
        yPos += 10;
        
        doc.setFontSize(10);
        doc.setFont(undefined, 'normal');
        doc.text(`Generated on: ${new Date().toLocaleString('en-IN')}`, 14, yPos);
        yPos += 15;
        
        // Overall Statistics
        doc.setFontSize(14);
        doc.setFont(undefined, 'bold');
        doc.text('Overall Statistics', 14, yPos);
        yPos += 8;
        
        doc.setFontSize(10);
        doc.setFont(undefined, 'normal');
        doc.text(`Total Participants: ${analytics?.overall?.totalParticipants || 0}`, 14, yPos);
        yPos += 6;
        doc.text(`Total Events: ${analytics?.overall?.events || 0}`, 14, yPos);
        yPos += 6;
        doc.text(`Total Workshops: ${analytics?.overall?.workshops || 0}`, 14, yPos);
        yPos += 6;
        doc.text(`Total Pass Revenue: ₹${((analytics?.passes?.generalPassAmount || 0) + (analytics?.passes?.customPassAmount || 0)).toLocaleString()}`, 14, yPos);
        yPos += 12;
        
        // Pass Statistics
        doc.setFontSize(14);
        doc.setFont(undefined, 'bold');
        doc.text('Pass Statistics', 14, yPos);
        yPos += 8;
        
        doc.setFontSize(10);
        doc.setFont(undefined, 'normal');
        doc.text(`General Passes: ${analytics?.passes?.generalPass || 0} (₹${(analytics?.passes?.generalPassAmount || 0).toLocaleString()})`, 14, yPos);
        yPos += 6;
        doc.text(`Custom Passes: ${analytics?.passes?.customPass || 0} (₹${(analytics?.passes?.customPassAmount || 0).toLocaleString()})`, 14, yPos);
        yPos += 12;
        
        // Outer College Statistics
        doc.setFontSize(14);
        doc.setFont(undefined, 'bold');
        doc.text('Outer College Statistics', 14, yPos);
        yPos += 8;
        
        doc.setFontSize(10);
        doc.setFont(undefined, 'normal');
        const outerPercentage = analytics?.overall?.totalParticipants > 0
            ? ((analytics.outerCollege.totalParticipants / analytics.overall.totalParticipants) * 100).toFixed(1)
            : 0;
        doc.text(`Total Participants: ${analytics?.outerCollege?.totalParticipants || 0} (${outerPercentage}%)`, 14, yPos);
        yPos += 12;
        
        // Department-wise Statistics Table
        doc.setFontSize(14);
        doc.setFont(undefined, 'bold');
        doc.text('Department-wise Statistics', 14, yPos);
        yPos += 8;
        
        const deptTableData = sortedDepartments.map(([deptId, data]) => {
            const percentage = analytics?.overall?.totalParticipants > 0 
                ? ((data.totalParticipants / analytics.overall.totalParticipants) * 100).toFixed(1)
                : 0;
            return [
                getDepartmentName(deptId),
                data.totalParticipants,
                `₹${Math.round(data.totalAmount).toLocaleString()}`,
                `${percentage}%`
            ];
        });
        
        autoTable(doc, {
            startY: yPos,
            head: [['Department', 'Participants', 'Revenue', '% of Total']],
            body: deptTableData,
            theme: 'grid',
            headStyles: { fillColor: [59, 130, 246], fontStyle: 'bold' },
            styles: { fontSize: 9 }
        });
        
        // Save the PDF
        doc.save(`DRESTEIN_Analytics_${new Date().toISOString().split('T')[0]}.pdf`);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-background via-background-soft to-background">
            <Header />

            <div className="py-20 px-6 md:px-12 max-w-7xl mx-auto">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
                    <div>
                        <h1 className="font-audiowide text-4xl md:text-6xl bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-4">
                            Analytics Dashboard
                        </h1>
                        <p className="text-muted-text font-space text-lg">
                            Comprehensive event statistics and insights
                        </p>
                    </div>

                    <div className="flex gap-3 mt-4 md:mt-0">
                        <button
                            onClick={exportFullReport}
                            className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-3 rounded-lg font-audiowide hover:from-green-700 hover:to-emerald-700 transition-all duration-300 flex items-center gap-2"
                        >
                            <Download size={20} />
                            Export PDF
                        </button>
                        <button
                            onClick={() => router.push('/admin')}
                            className="bg-background-soft border border-border text-white px-6 py-3 rounded-lg font-audiowide hover:bg-background transition-colors duration-300 flex items-center gap-2"
                        >
                            <ArrowLeft size={20} />
                            Back to Dashboard
                        </button>
                    </div>
                </div>

                {/* Overall Statistics */}
                <div className="mb-12">
                    <h2 className="font-audiowide text-2xl text-white mb-6 flex items-center gap-2">
                        <TrendingUp className="text-primary" size={28} />
                        Overall Statistics
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <StatCard
                            icon={<Users className="text-primary" size={32} />}
                            title="Total Participants"
                            value={analytics?.overall?.totalParticipants || 0}
                            gradient="from-blue-500/20 to-purple-500/20"
                        />
                        <StatCard
                            icon={<DollarSign className="text-green-500" size={32} />}
                            title="Total Pass Revenue"
                            value={`₹${((analytics?.passes?.generalPassAmount || 0) + (analytics?.passes?.customPassAmount || 0)).toLocaleString()}`}
                            gradient="from-green-500/20 to-emerald-500/20"
                        />
                        <StatCard
                            icon={<Award className="text-yellow-500" size={32} />}
                            title="Events"
                            value={analytics?.overall?.events || 0}
                            gradient="from-yellow-500/20 to-orange-500/20"
                        />
                        <StatCard
                            icon={<Award className="text-pink-500" size={32} />}
                            title="Workshops"
                            value={analytics?.overall?.workshops || 0}
                            gradient="from-pink-500/20 to-rose-500/20"
                        />
                    </div>
                </div>

                {/* Department-wise Statistics */}
                <div className="mb-12">
                    <h2 className="font-audiowide text-2xl text-white mb-6 flex items-center gap-2">
                        <Building2 className="text-secondary" size={28} />
                        Department-wise Statistics
                    </h2>
                    <div className="bg-background-soft border border-border rounded-lg overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-max">
                                <thead className="bg-background sticky top-0">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-white font-audiowide text-sm whitespace-nowrap">
                                            Department
                                        </th>
                                        <th className="px-6 py-4 text-left text-white font-audiowide text-sm whitespace-nowrap">
                                            Participants
                                        </th>
                                        <th className="px-6 py-4 text-left text-white font-audiowide text-sm whitespace-nowrap">
                                            Revenue
                                        </th>
                                        <th className="px-6 py-4 text-left text-white font-audiowide text-sm whitespace-nowrap">
                                            % of Total
                                        </th>
                                        <th className="px-6 py-4 text-left text-white font-audiowide text-sm whitespace-nowrap">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {sortedDepartments.length === 0 ? (
                                        <tr>
                                            <td colSpan="5" className="px-6 py-8 text-center text-muted-text font-space">
                                                No department data available
                                            </td>
                                        </tr>
                                    ) : (
                                        sortedDepartments.map(([deptId, data]) => {
                                            const percentage = analytics?.overall?.totalParticipants > 0 
                                                ? ((data.totalParticipants / analytics.overall.totalParticipants) * 100).toFixed(1)
                                                : 0;
                                            
                                            return (
                                                <tr key={deptId} className="border-t border-border hover:bg-background/50 transition-colors">
                                                    <td className="px-6 py-4 text-white font-space whitespace-nowrap">
                                                        {getDepartmentName(deptId)}
                                                    </td>
                                                    <td className="px-6 py-4 text-primary font-audiowide whitespace-nowrap">
                                                        {data.totalParticipants.toLocaleString()}
                                                    </td>
                                                    <td className="px-6 py-4 text-green-500 font-audiowide whitespace-nowrap">
                                                        ₹{Math.round(data.totalAmount).toLocaleString()}
                                                    </td>
                                                    <td className="px-6 py-4 text-muted-text font-space whitespace-nowrap">
                                                        {percentage}%
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <button
                                                            onClick={() => {
                                                                setSelectedDepartment({ id: deptId, name: getDepartmentName(deptId), data });
                                                                setShowDepartmentModal(true);
                                                            }}
                                                            className="bg-gradient-to-r from-primary to-secondary text-white px-3 py-1.5 rounded font-audiowide text-xs hover:from-hover-primary hover:to-primary transition-all duration-300 flex items-center gap-1"
                                                        >
                                                            <Eye size={14} />
                                                            View Details
                                                        </button>
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Outer College & Passes Statistics */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Outer College Stats */}
                    <div>
                        <h2 className="font-audiowide text-2xl text-white mb-6 flex items-center gap-2">
                            <Building2 className="text-cyan-500" size={28} />
                            Outer College Statistics
                        </h2>
                        <div className="bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-cyan-500/30 rounded-lg p-6">
                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <span className="text-muted-text font-space">Total Participants</span>
                                    <span className="text-2xl font-audiowide text-cyan-400">
                                        {analytics?.outerCollege?.totalParticipants || 0}
                                    </span>
                                </div>
                                <div className="h-px bg-border"></div>
                                <div className="flex justify-between items-center">
                                    <span className="text-muted-text font-space">% of Total Participants</span>
                                    <span className="text-2xl font-audiowide text-cyan-400">
                                        {analytics?.overall?.totalParticipants > 0
                                            ? ((analytics.outerCollege.totalParticipants / analytics.overall.totalParticipants) * 100).toFixed(1)
                                            : 0}%
                                    </span>
                                </div>
                                <div className="h-px bg-border"></div>
                                <button
                                    onClick={() => setShowOuterCollegeModal(true)}
                                    className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 text-white px-4 py-3 rounded-lg font-audiowide hover:from-cyan-700 hover:to-blue-700 transition-all duration-300 flex items-center justify-center gap-2"
                                >
                                    <Eye size={20} />
                                    View Details
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Pass Statistics */}
                    <div>
                        <h2 className="font-audiowide text-2xl text-white mb-6 flex items-center gap-2">
                            <Ticket className="text-purple-500" size={28} />
                            Pass Statistics
                        </h2>
                        <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/30 rounded-lg p-6">
                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <span className="text-muted-text font-space">General Passes</span>
                                    <span className="text-2xl font-audiowide text-purple-400">
                                        {analytics?.passes?.generalPass || 0}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center pl-4">
                                    <span className="text-muted-text font-space text-sm">Revenue</span>
                                    <span className="text-lg font-audiowide text-green-400">
                                        ₹{(analytics?.passes?.generalPassAmount || 0).toLocaleString()}
                                    </span>
                                </div>
                                <div className="h-px bg-border"></div>
                                <div className="flex justify-between items-center">
                                    <span className="text-muted-text font-space">Custom Passes</span>
                                    <span className="text-2xl font-audiowide text-pink-400">
                                        {analytics?.passes?.customPass || 0}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center pl-4">
                                    <span className="text-muted-text font-space text-sm">Revenue</span>
                                    <span className="text-lg font-audiowide text-green-400">
                                        ₹{(analytics?.passes?.customPassAmount || 0).toLocaleString()}
                                    </span>
                                </div>
                                <div className="h-px bg-border"></div>
                                <div className="flex justify-between items-center">
                                    <span className="text-muted-text font-space font-semibold">Total Pass Revenue</span>
                                    <span className="text-2xl font-audiowide text-green-400">
                                        ₹{((analytics?.passes?.generalPassAmount || 0) + (analytics?.passes?.customPassAmount || 0)).toLocaleString()}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Summary Card */}
                <div className="mt-12 bg-gradient-to-r from-primary/20 to-secondary/20 border border-primary/30 rounded-lg p-8">
                    <h2 className="font-audiowide text-2xl text-white mb-6 text-center">
                        Total Pass Revenue
                    </h2>
                    <div className="text-center">
                        <div className="text-6xl font-audiowide bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-2">
                            ₹{((analytics?.passes?.generalPassAmount || 0) + (analytics?.passes?.customPassAmount || 0)).toLocaleString()}
                        </div>
                        <p className="text-muted-text font-space">
                            From {(analytics?.passes?.generalPass || 0) + (analytics?.passes?.customPass || 0)} total passes sold
                        </p>
                    </div>
                </div>

                {/* Outer College Modal */}
                {showOuterCollegeModal && (
                    <ViewOuterCollegeModal
                        students={analytics?.outerCollege?.students || []}
                        onClose={() => setShowOuterCollegeModal(false)}
                    />
                )}

                {/* Department Details Modal */}
                {showDepartmentModal && selectedDepartment && (
                    <DepartmentDetailsModal
                        departmentName={selectedDepartment.name}
                        departmentData={selectedDepartment.data}
                        onClose={() => {
                            setShowDepartmentModal(false);
                            setSelectedDepartment(null);
                        }}
                    />
                )}
            </div>
        </div>
    );
};

// Reusable StatCard Component
const StatCard = ({ icon, title, value, gradient }) => {
    return (
        <div className={`bg-gradient-to-br ${gradient} border border-border rounded-lg p-6 hover:scale-105 transition-transform duration-300`}>
            <div className="flex items-center justify-between mb-4">
                {icon}
            </div>
            <h3 className="text-muted-text font-space text-sm mb-2">{title}</h3>
            <p className="text-3xl font-audiowide text-white">{value}</p>
        </div>
    );
};

export default AnalyticsDashboard;
