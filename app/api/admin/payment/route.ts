import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Profile from "@/app/models/Profile";
import { auth as nextAuth } from "@/auth";

export async function POST(req: Request) {
    try {
        const session = await nextAuth();
        
        if (!session?.user?.email) {
            return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
        }

        // @ts-ignore
        if (!["ADMIN", "SUPERADMIN"].includes(session.user.role?.toUpperCase())) {
            return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
        }

        await connectDB();

        const { userId, status } = await req.json(); // userId is mongo _id

        if (!userId || !status) {
            return NextResponse.json({ error: "MISSING_DATA" }, { status: 400 });
        }

        // Fetch target profiles
        const targetProfile = await Profile.findById(userId);
        if (!targetProfile) {
            return NextResponse.json({ error: "USER_NOT_FOUND" }, { status: 404 });
        }

        // Simulating the legacy status toggle by syncing events to paidEvents if 'paid'
        const updateData: Record<string, any> = {};
        
        // Profile doesn't have a global 'paymentStatus', but we can mock or add it if needed.
        // For now, let's just update the role or other accessible fields, or 
        // if the UI expects to mark someone as 'paid', we sync registeredEvents to paidEvents.
        
        if (status === "paid") {
            updateData.paidEvents = targetProfile.registeredEvents;
        } else {
            updateData.paidEvents = [];
        }

        await Profile.findByIdAndUpdate(userId, updateData);

        return NextResponse.json({ message: "STATUS_UPDATED" });
    } catch (error) {
        console.error("Payment Update Error:", error);
        return NextResponse.json({ error: "INTERNAL_SERVER_ERROR" }, { status: 500 });
    }
}
