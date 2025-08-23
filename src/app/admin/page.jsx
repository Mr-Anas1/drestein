"use client";
import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Header from '@/components/Header'
import { useAuth } from '@/contexts/AuthContext'
import { DEPARTMENTS, getDepartmentName } from '@/constants/departments'
import { Plus, LogOut, Users } from 'lucide-react'

// Import extracted components
import AddEventModal from '@/components/AddEventModal'
import EditEventModal from '@/components/EditEventModal'
import DeleteConfirmModal from '@/components/DeleteConfirmModal'
import EventsTable from '@/components/EventsTable'
import StatsCards from '@/components/StatsCards'

const AdminDashboard = () => {
    const { user, userRole, loading: authLoading, logout, isSuperAdmin, isDepartmentAdmin, userDepartment } = useAuth()
    const router = useRouter()
    const [events, setEvents] = useState([])
    const [filteredEvents, setFilteredEvents] = useState([])
    const [loading, setLoading] = useState(true)
    const [showAddModal, setShowAddModal] = useState(false)
    const [showEditModal, setShowEditModal] = useState(false)
    const [selectedEvent, setSelectedEvent] = useState(null)
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
    const [eventToDelete, setEventToDelete] = useState(null)
    const [selectedDepartment, setSelectedDepartment] = useState('all')

    // Authentication check
    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/admin/login')
        }
    }, [user, authLoading, router])

    // Fetch events
    useEffect(() => {
        if (user && userRole) {
            fetchEvents()
        }
    }, [user, userRole])

    // Filter events based on user role and department
    useEffect(() => {
        if (!events.length) return

        let filtered = events

        // Department admins can only see their department's events
        if (isDepartmentAdmin && userDepartment) {
            filtered = events.filter(event => event.department === userDepartment)
        }

        // Apply department filter for super admin
        if (isSuperAdmin && selectedDepartment !== 'all') {
            filtered = events.filter(event => event.department === selectedDepartment)
        }

        setFilteredEvents(filtered)
    }, [events, isDepartmentAdmin, userDepartment, isSuperAdmin, selectedDepartment])

    const fetchEvents = async () => {
        try {
            setLoading(true)
            const response = await fetch('/api/events')
            const data = await response.json()
            setEvents(data)
        } catch (error) {
            console.error('Error fetching events:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleDeleteEvent = async (eventId) => {
        try {
            const response = await fetch(`/api/events?id=${eventId}`, {
                method: 'DELETE'
            })

            if (response.ok) {
                setEvents(events.filter(event => event.id !== eventId))
                setShowDeleteConfirm(false)
                setEventToDelete(null)
            }
        } catch (error) {
            console.error('Error deleting event:', error)
        }
    }

    const handleLogout = async () => {
        await logout()
        router.push('/admin/login')
    }

    const confirmDelete = (event) => {
        setEventToDelete(event)
        setShowDeleteConfirm(true)
    }

    const handleEditEvent = (event) => {
        setSelectedEvent(event)
        setShowEditModal(true)
    }

    const handleViewDetails = (event) => {
        setSelectedEvent(event)
        // You can add a detailed view modal here
    }

    if (authLoading || loading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="text-white font-audiowide">Loading...</div>
            </div>
        )
    }

    if (!user || !userRole) {
        return null
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-background via-background-soft to-background">
            <Header />

            <div className="py-20 px-6 md:px-12 max-w-7xl mx-auto">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
                    <div>
                        <h1 className="font-audiowide text-4xl md:text-6xl bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-4">
                            Admin Dashboard
                        </h1>
                        <p className="text-muted-text font-space text-lg">
                            {isSuperAdmin ? 'Super Admin - Full Access' : `Department Admin - ${getDepartmentName(userDepartment)}`}
                        </p>
                    </div>

                    <div className="flex items-center gap-4 mt-4 md:mt-0">
                        <button
                            onClick={() => setShowAddModal(true)}
                            className="bg-gradient-to-r from-primary to-secondary text-white px-6 py-3 rounded-lg font-audiowide hover:from-hover-primary hover:to-primary transition-all duration-300 flex items-center gap-2"
                        >
                            <Plus size={20} />
                            Add New Event
                        </button>
                        
                        {isSuperAdmin && (
                            <button
                                onClick={() => router.push('/admin/users')}
                                className="bg-background-soft border border-border text-white px-4 py-3 rounded-lg font-audiowide hover:bg-background transition-colors duration-300 flex items-center gap-2"
                            >
                                <Users size={20} />
                                Manage Users
                            </button>
                        )}
                        
                        <button
                            onClick={handleLogout}
                            className="bg-background-soft border border-border text-white px-4 py-3 rounded-lg font-audiowide hover:bg-background transition-colors duration-300 flex items-center gap-2"
                        >
                            <LogOut size={20} />
                            Logout
                        </button>
                    </div>
                </div>

                {/* Department Filter for Super Admin */}
                {isSuperAdmin && (
                    <div className="mb-6">
                        <label className="block text-white font-audiowide text-sm mb-2">Filter by Department</label>
                        <select
                            value={selectedDepartment}
                            onChange={(e) => setSelectedDepartment(e.target.value)}
                            className="bg-background-soft border border-border text-white px-4 py-2 rounded-lg font-space focus:outline-none focus:border-primary"
                        >
                            <option value="all">All Departments</option>
                            {DEPARTMENTS.map(dept => (
                                <option key={dept.id} value={dept.id}>{dept.name}</option>
                            ))}
                        </select>
                    </div>
                )}

                {/* Stats Cards */}
                <StatsCards events={filteredEvents} />

                {/* Events Table */}
                <EventsTable 
                    events={filteredEvents}
                    loading={loading}
                    onEdit={handleEditEvent}
                    onDelete={confirmDelete}
                    onView={handleViewDetails}
                />
            </div>

            {/* Modals */}
            {showDeleteConfirm && (
                <DeleteConfirmModal
                    event={eventToDelete}
                    onConfirm={() => handleDeleteEvent(eventToDelete.id)}
                    onCancel={() => {
                        setShowDeleteConfirm(false)
                        setEventToDelete(null)
                    }}
                />
            )}

            {showAddModal && (
                <AddEventModal
                    onClose={() => setShowAddModal(false)}
                    onEventAdded={fetchEvents}
                />
            )}

            {showEditModal && selectedEvent && (
                <EditEventModal
                    event={selectedEvent}
                    onClose={() => {
                        setShowEditModal(false)
                        setSelectedEvent(null)
                    }}
                    onEventUpdated={fetchEvents}
                />
            )}
        </div>
    )
}

export default AdminDashboard
