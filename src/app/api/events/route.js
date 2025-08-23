import { db } from "@/lib/firebase";
import { NextResponse } from "next/server";
import { collection, getDocs, addDoc, doc, updateDoc, deleteDoc, getDoc } from "firebase/firestore";

export async function GET() {
    try {
        const snapshot = await getDocs(collection(db, "events"))
        const events = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }))

        return NextResponse.json(events)
    } catch(error) {
        return NextResponse.json({error: error.message}, {status: 500})
    }
}

export async function POST(request) {
    try {
        const eventData = await request.json()
        
        // Validate required fields including department
        if (!eventData.department) {
            return NextResponse.json({ error: 'Department is required' }, { status: 400 })
        }
        
        // Add the event to Firestore
        const docRef = await addDoc(collection(db, 'events'), {
            ...eventData,
            createdAt: new Date(),
            participationCount: 0
        })
        
        return NextResponse.json({ 
            id: docRef.id, 
            ...eventData,
            createdAt: new Date(),
            participationCount: 0
        })
    } catch (error) {
        console.error('Error adding event:', error)
        return NextResponse.json({ error: 'Failed to add event' }, { status: 500 })
    }
}

export async function PUT(request) {
    try {
        const { id, ...eventData } = await request.json()
        
        if (!id) {
            return NextResponse.json({error: "Event ID is required"}, {status: 400})
        }
        
        const eventRef = doc(db, "events", id)
        await updateDoc(eventRef, {
            ...eventData,
            updatedAt: new Date().toISOString()
        })
        
        return NextResponse.json({ message: "Event updated successfully" })
    } catch(error) {
        return NextResponse.json({error: error.message}, {status: 500})
    }
}

export async function DELETE(request) {
    try {
        const { searchParams } = new URL(request.url)
        const id = searchParams.get('id')
        
        if (!id) {
            return NextResponse.json({error: "Event ID is required"}, {status: 400})
        }
        
        await deleteDoc(doc(db, "events", id))
        
        return NextResponse.json({ message: "Event deleted successfully" })
    } catch(error) {
        return NextResponse.json({error: error.message}, {status: 500})
    }
}