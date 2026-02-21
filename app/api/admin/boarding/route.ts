import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Profile from "@/app/models/Profile";
import { verifyAdminRequest } from "@/lib/adminAuth";

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const admin = await verifyAdminRequest();
        if (!admin) {
            return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
        }

        await connectDB();

        // Fetch profiles where boarding is true
        const boardingProfiles = await Profile.find({ boarding: true })
            .select(
                "clerkId email firstName lastName username phone college city state role registeredEvents paidEvents onboardingCompleted createdAt boarding"
            )
            .sort({ createdAt: -1 });

        const safeUsers = boardingProfiles.map((p) => ({
            ...p.toObject(),
            id: p._id.toString(),
            _id: p._id.toString(),
            name: p.firstName && p.lastName ? `${p.firstName} ${p.lastName}` : (p.username || "Unknown"),
            // Ensure phone is explicitly available if it exists
            phone: p.phone || "N/A",
            email: p.email || "N/A",
        }));

        return NextResponse.json({ users: safeUsers }, { status: 200 });
    } catch (error) {
        console.error("Admin Boarding Fetch Error:", error);
        return NextResponse.json({ error: "INTERNAL_SERVER_ERROR" }, { status: 500 });
    }
}
