"use client";
import React from 'react';
import { X, Download } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const DepartmentDetailsModal = ({ departmentName, departmentData, onClose }) => {
    // Convert events object to array and sort by participants
    const eventsArray = departmentData?.events 
        ? Object.entries(departmentData.events).map(([eventId, data]) => ({
            id: eventId,
            ...data
          })).sort((a, b) => b.participants - a.participants)
        : [];

    const exportToPDF = () => {
        const doc = new jsPDF();
        
        // Add title
        doc.setFontSize(18);
        doc.setFont(undefined, 'bold');
        doc.text(`${departmentName} - Event Details`, 14, 20);
        
        // Add summary
        doc.setFontSize(10);
        doc.setFont(undefined, 'normal');
        doc.text(`Total Participants: ${departmentData?.totalParticipants || 0}`, 14, 30);
        doc.text(`Total Revenue: ₹${Math.round(departmentData?.totalAmount || 0).toLocaleString()}`, 14, 36);
        doc.text(`Total Events: ${eventsArray.length}`, 14, 42);
        doc.text(`Generated on: ${new Date().toLocaleString('en-IN')}`, 14, 48);
        
        // Add table
        const tableData = eventsArray.map((event, index) => [
            index + 1,
            event.name,
            event.category,
            event.participants,
            event.innerParticipants,
            event.outerParticipants,
            `₹${Math.round(event.revenue).toLocaleString()}`
        ]);
        
        autoTable(doc, {
            startY: 55,
            head: [['#', 'Event/Workshop', 'Category', 'Total', 'Inner', 'Outer', 'Revenue']],
            body: tableData,
            theme: 'grid',
            headStyles: { fillColor: [59, 130, 246], fontStyle: 'bold' },
            styles: { fontSize: 8 },
            columnStyles: {
                0: { cellWidth: 10 },
                1: { cellWidth: 60 },
                2: { cellWidth: 25 },
                3: { cellWidth: 20 },
                4: { cellWidth: 20 },
                5: { cellWidth: 20 },
                6: { cellWidth: 30 }
            }
        });
        
        // Save the PDF
        doc.save(`${departmentName.replace(/\s+/g, '_')}_Details.pdf`);
    };

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-background-soft border border-border rounded-lg max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="flex justify-between items-center p-6 border-b border-border">
                    <div>
                        <h2 className="font-audiowide text-2xl bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                            {departmentName}
                        </h2>
                        <p className="text-muted-text font-space text-sm mt-1">
                            Event-wise breakdown
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={exportToPDF}
                            className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-4 py-2 rounded-lg font-audiowide text-sm hover:from-green-700 hover:to-emerald-700 transition-all duration-300 flex items-center gap-2"
                        >
                            <Download size={18} />
                            Export PDF
                        </button>
                        <button
                            onClick={onClose}
                            className="text-muted-text hover:text-white transition-colors"
                        >
                            <X size={24} />
                        </button>
                    </div>
                </div>

                {/* Summary Cards */}
                <div className="p-6 border-b border-border bg-background/50">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-blue-500/30 rounded-lg p-4">
                            <p className="text-muted-text font-space text-sm mb-1">Total Participants</p>
                            <p className="text-2xl font-audiowide text-primary">
                                {departmentData?.totalParticipants || 0}
                            </p>
                        </div>
                        <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/30 rounded-lg p-4">
                            <p className="text-muted-text font-space text-sm mb-1">Total Revenue</p>
                            <p className="text-2xl font-audiowide text-green-500">
                                ₹{Math.round(departmentData?.totalAmount || 0).toLocaleString()}
                            </p>
                        </div>
                        <div className="bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border border-yellow-500/30 rounded-lg p-4">
                            <p className="text-muted-text font-space text-sm mb-1">Total Events</p>
                            <p className="text-2xl font-audiowide text-yellow-500">
                                {eventsArray.length}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">
                    {eventsArray.length === 0 ? (
                        <div className="text-center py-12">
                            <p className="text-muted-text font-space text-lg">
                                No events found for this department
                            </p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-max">
                                <thead className="bg-background sticky top-0">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-white font-audiowide text-sm whitespace-nowrap">
                                            #
                                        </th>
                                        <th className="px-4 py-3 text-left text-white font-audiowide text-sm whitespace-nowrap">
                                            Event/Workshop Name
                                        </th>
                                        <th className="px-4 py-3 text-left text-white font-audiowide text-sm whitespace-nowrap">
                                            Category
                                        </th>
                                        <th className="px-4 py-3 text-left text-white font-audiowide text-sm whitespace-nowrap">
                                            Total Participants
                                        </th>
                                        <th className="px-4 py-3 text-left text-white font-audiowide text-sm whitespace-nowrap">
                                            Inner College
                                        </th>
                                        <th className="px-4 py-3 text-left text-white font-audiowide text-sm whitespace-nowrap">
                                            Outer College
                                        </th>
                                        <th className="px-4 py-3 text-left text-white font-audiowide text-sm whitespace-nowrap">
                                            Revenue
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {eventsArray.map((event, index) => (
                                        <tr 
                                            key={event.id} 
                                            className="border-t border-border hover:bg-background/50 transition-colors"
                                        >
                                            <td className="px-4 py-3 text-muted-text font-space whitespace-nowrap">
                                                {index + 1}
                                            </td>
                                            <td className="px-4 py-3 text-white font-space whitespace-nowrap">
                                                {event.name}
                                            </td>
                                            <td className="px-4 py-3 text-muted-text font-space whitespace-nowrap">
                                                <span className={`px-2 py-1 rounded text-xs font-audiowide ${
                                                    event.category?.toLowerCase() === 'workshop' 
                                                        ? 'bg-pink-500/20 text-pink-400' 
                                                        : 'bg-blue-500/20 text-blue-400'
                                                }`}>
                                                    {event.category}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-primary font-audiowide whitespace-nowrap">
                                                {event.participants}
                                            </td>
                                            <td className="px-4 py-3 text-green-400 font-audiowide whitespace-nowrap">
                                                {event.innerParticipants}
                                            </td>
                                            <td className="px-4 py-3 text-cyan-400 font-audiowide whitespace-nowrap">
                                                {event.outerParticipants}
                                            </td>
                                            <td className="px-4 py-3 text-green-500 font-audiowide whitespace-nowrap">
                                                ₹{Math.round(event.revenue).toLocaleString()}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-border flex justify-between items-center">
                    <p className="text-muted-text font-space">
                        Showing <span className="text-primary font-audiowide">{eventsArray.length}</span> events/workshops
                    </p>
                    <button
                        onClick={onClose}
                        className="bg-background-soft border border-border text-white px-6 py-2 rounded-lg font-audiowide hover:bg-background transition-colors duration-300"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DepartmentDetailsModal;
