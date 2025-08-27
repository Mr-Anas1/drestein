import { db } from "@/lib/firebase";
import { NextResponse } from "next/server";
import { collection, addDoc, doc, updateDoc, increment, getDoc, query, where, getDocs } from "firebase/firestore";

export async function POST(request) {
    try {
        const { eventId, name, email, transactionId } = await request.json()
        
        if (!eventId || !name || !email || !transactionId) {
            return NextResponse.json({error: "All fields including transaction ID are required"}, {status: 400})
        }
        
        // Check if user is already registered for this event
        const registrationsRef = collection(db, "registrations")
        const q = query(
            registrationsRef, 
            where("eventId", "==", eventId),
            where("email", "==", email.toLowerCase())
        )
        const existingRegistrations = await getDocs(q)
        
        if (!existingRegistrations.empty) {
            return NextResponse.json({
                error: "You are already registered for this event. Check your email for confirmation details."
            }, {status: 409})
        }
        
        // Add registration to registrations collection
        const registrationData = {
            eventId,
            name: name.trim(),
            email: email.toLowerCase().trim(),
            transactionId: transactionId.trim(),
            registeredAt: new Date(),
            status: 'pending_payment',
            paymentStatus: 'pending',
            paymentVerified: false
        }
        
        const docRef = await addDoc(registrationsRef, registrationData)
        
        // Update event participation count
        const eventRef = doc(db, "events", eventId)
        await updateDoc(eventRef, {
            participationCount: increment(1)
        })
        
        return NextResponse.json({ 
            id: docRef.id, 
            message: "Registration successful! You will receive confirmation details via email.",
            ...registrationData 
        }, { status: 201 })
    } catch(error) {
        console.error('Registration error:', error)
        return NextResponse.json({error: "Registration failed. Please try again."}, {status: 500})
    }
}

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url)
        const eventId = searchParams.get('eventId')
        
        if (!eventId) {
            return NextResponse.json({error: "Event ID is required"}, {status: 400})
        }
        
        // Get all registrations for this event
        const registrationsRef = collection(db, "registrations")
        const q = query(registrationsRef, where("eventId", "==", eventId))
        const registrationsSnap = await getDocs(q)
        
        const participants = []
        registrationsSnap.forEach((doc) => {
            participants.push({
                id: doc.id,
                ...doc.data()
            })
        })
        
        // Sort by registration date (newest first)
        participants.sort((a, b) => new Date(b.registeredAt) - new Date(a.registeredAt))
        
        return NextResponse.json({
            participants,
            totalCount: participants.length
        })
    } catch(error) {
        console.error('Error fetching participants:', error)
        return NextResponse.json({error: "Failed to fetch participants"}, {status: 500})
    }
}

export async function PATCH(request) {
    try {
        const { registrationId, status, adminNotes } = await request.json()
        
        if (!registrationId || !status) {
            return NextResponse.json(
                { error: "Registration ID and status are required" }, 
                { status: 400 }
            )
        }

        const registrationRef = doc(db, "registrations", registrationId)
        const registrationSnap = await getDoc(registrationRef)

        if (!registrationSnap.exists()) {
            return NextResponse.json(
                { error: "Registration not found" },
                { status: 404 }
            )
        }

        const updateData = {
            status: status === 'approved' ? 'active' : 'rejected',
            paymentStatus: status,
            paymentVerified: status === 'approved',
            updatedAt: new Date().toISOString()
        }

        if (adminNotes) {
            updateData.adminNotes = adminNotes
        }

        await updateDoc(registrationRef, updateData)

        // If approved, update the event's participation count
        if (status === 'approved') {
            const registrationData = registrationSnap.data()
            const eventRef = doc(db, "events", registrationData.eventId)
            
            // Only increment if this registration wasn't previously approved
            if (registrationData.status !== 'active') {
                await updateDoc(eventRef, {
                    participationCount: increment(1)
                })
            }
        }

        return NextResponse.json({
            message: `Registration ${status} successfully`,
            registrationId,
            status: updateData.status
        })

    } catch (error) {
        console.error('Error updating registration status:', error)
        return NextResponse.json(
            { error: "Failed to update registration status" },
            { status: 500 }
        )
    }
}
