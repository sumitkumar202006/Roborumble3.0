import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Registration from "@/app/models/Registration";
import Profile from "@/app/models/Profile";
import Team from "@/app/models/Team";
import Event from "@/app/models/Event";

import { verifyAdminRequest } from "@/lib/adminAuth";

export const dynamic = "force-dynamic";

// Force import to register models
void Team;
void Event;

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const eventId = searchParams.get("eventId");
        const status = searchParams.get("status");

        const admin = await verifyAdminRequest();
        if (!admin) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        // Build Query
        const query: Record<string, unknown> = {};
        if (eventId && eventId !== "all") query.eventId = eventId;
        if (status && status !== "all") query.paymentStatus = status;

        const registrations = await Registration.find(query)
            .populate({
                path: "teamId",
                populate: { path: "leaderId", select: "username email phone" },
            })
            .populate("eventId", "title fees")
            .sort({ createdAt: -1 });

        return NextResponse.json({ registrations });
    } catch (error) {
        console.error("Admin Registrations GET Error:", error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}
