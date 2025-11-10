"use client";
import React from 'react';
import { X, Download } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const ViewOuterCollegeModal = ({ students, onClose }) => {
    const exportToPDF = () => {
        const doc = new jsPDF();
        
        // Add title
        doc.setFontSize(18);
        doc.setFont(undefined, 'bold');
        doc.text('Outer College Students', 14, 20);
        
        // Add summary
        doc.setFontSize(10);
        doc.setFont(undefined, 'normal');
        doc.text(`Total Students: ${students.length}`, 14, 30);
        doc.text(`Generated on: ${new Date().toLocaleString('en-IN')}`, 14, 36);
        
        // Add table
        const tableData = students.map((student, index) => [
            index + 1,
            student.name,
            student.email,
            student.college,
            student.rollNo,
            student.phone,
            student.registeredAt ? 
                new Date(student.registeredAt.seconds * 1000).toLocaleDateString('en-IN') : 'N/A'
        ]);
        
        autoTable(doc, {
            startY: 42,
            head: [['#', 'Name', 'Email', 'College', 'Roll No', 'Phone', 'Registered']],
            body: tableData,
            theme: 'grid',
            headStyles: { fillColor: [59, 130, 246], fontStyle: 'bold' },
            styles: { fontSize: 7 },
            columnStyles: {
                0: { cellWidth: 8 },
                1: { cellWidth: 30 },
                2: { cellWidth: 40 },
                3: { cellWidth: 35 },
                4: { cellWidth: 20 },
                5: { cellWidth: 25 },
                6: { cellWidth: 25 }
            }
        });
        
        // Save the PDF
        doc.save('Outer_College_Students.pdf');
    };

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-background-soft border border-border rounded-lg max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="flex justify-between items-center p-6 border-b border-border">
                    <h2 className="font-audiowide text-2xl bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                        Outer College Students
                    </h2>
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

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">
                    {students.length === 0 ? (
                        <div className="text-center py-12">
                            <p className="text-muted-text font-space text-lg">
                                No outer college students found
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
                                            Name
                                        </th>
                                        <th className="px-4 py-3 text-left text-white font-audiowide text-sm whitespace-nowrap">
                                            Email
                                        </th>
                                        <th className="px-4 py-3 text-left text-white font-audiowide text-sm whitespace-nowrap">
                                            College
                                        </th>
                                        <th className="px-4 py-3 text-left text-white font-audiowide text-sm whitespace-nowrap">
                                            Roll No
                                        </th>
                                        <th className="px-4 py-3 text-left text-white font-audiowide text-sm whitespace-nowrap">
                                            Phone
                                        </th>
                                        <th className="px-4 py-3 text-left text-white font-audiowide text-sm whitespace-nowrap">
                                            Registered At
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {students.map((student, index) => (
                                        <tr 
                                            key={index} 
                                            className="border-t border-border hover:bg-background/50 transition-colors"
                                        >
                                            <td className="px-4 py-3 text-muted-text font-space whitespace-nowrap">
                                                {index + 1}
                                            </td>
                                            <td className="px-4 py-3 text-white font-space whitespace-nowrap">
                                                {student.name}
                                            </td>
                                            <td className="px-4 py-3 text-primary font-space whitespace-nowrap">
                                                {student.email}
                                            </td>
                                            <td className="px-4 py-3 text-cyan-400 font-space whitespace-nowrap">
                                                {student.college}
                                            </td>
                                            <td className="px-4 py-3 text-muted-text font-space whitespace-nowrap">
                                                {student.rollNo}
                                            </td>
                                            <td className="px-4 py-3 text-muted-text font-space whitespace-nowrap">
                                                {student.phone}
                                            </td>
                                            <td className="px-4 py-3 text-muted-text font-space whitespace-nowrap">
                                                {student.registeredAt ? 
                                                    new Date(student.registeredAt.seconds * 1000).toLocaleDateString('en-IN', {
                                                        day: '2-digit',
                                                        month: 'short',
                                                        year: 'numeric'
                                                    }) : 'N/A'}
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
                        Total: <span className="text-primary font-audiowide">{students.length}</span> students
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

export default ViewOuterCollegeModal;
