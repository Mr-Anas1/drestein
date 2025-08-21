import { db } from "@/lib/firebase";
import { NextResponse } from "next/server";
import { collection, getDocs } from "firebase/firestore";

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