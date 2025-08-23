import { db } from "@/lib/firebase";
import { NextResponse } from "next/server";
import { collection, addDoc, doc, updateDoc, increment, getDoc } from "firebase/firestore";

export async function POST(request) {
    try {
        const { eventId, userInfo } = await request.json()
        
        if (!eventId || !userInfo) {
            return NextResponse.json({error: "Event ID and user info are required"}, {status: 400})
        }
        
        // Add registration to registrations collection
        const registrationData = {
            eventId,
            userInfo,
            registeredAt: new Date().toISOString(),
            status: 'active'
        }
        
        const docRef = await addDoc(collection(db, "registrations"), registrationData)
        
        // Update event participation count
        const eventRef = doc(db, "events", eventId)
        await updateDoc(eventRef, {
            participationCount: increment(1)
        })
        
        return NextResponse.json({ 
            id: docRef.id, 
            ...registrationData 
        }, { status: 201 })
    } catch(error) {
        return NextResponse.json({error: error.message}, {status: 500})
    }
}

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url)
        const eventId = searchParams.get('eventId')
        
        if (!eventId) {
            return NextResponse.json({error: "Event ID is required"}, {status: 400})
        }
        
        // Get event details with current participation count
        const eventRef = doc(db, "events", eventId)
        const eventSnap = await getDoc(eventRef)
        
        if (!eventSnap.exists()) {
            return NextResponse.json({error: "Event not found"}, {status: 404})
        }
        
        const eventData = { id: eventSnap.id, ...eventSnap.data() }
        
        return NextResponse.json({
            event: eventData,
            participationCount: eventData.participationCount || 0
        })
    } catch(error) {
        return NextResponse.json({error: error.message}, {status: 500})
    }
}
