import { NextResponse } from "next/server";
import { auth as nextAuth } from "@/auth";
import connectDB from "@/lib/mongodb";
import Profile from "@/app/models/Profile";
import Registration from "@/app/models/Registration";
import Team from "@/app/models/Team";

export const dynamic = "force-dynamic";

export async function GET() {
    try {
        let email = "";

        // Check NextAuth
        const nextSession = await nextAuth();
        if (nextSession?.user?.email) {
            email = nextSession.user.email;
        }

        if (!email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        await connectDB();

        const profile = await Profile.findOne({ email });

        if (!profile) {
            return NextResponse.json({
                registrations: [],
                registeredEvents: [],
                paidEvents: [],
                onboardingCompleted: false
            });
        }

        // Find teams where user is a member
        const teams = await Team.find({ members: profile._id });
        const teamIds = teams.map(t => t._id);

        // Find registrations
        const registrations = await Registration.find({
            $or: [
                { teamId: { $in: teamIds } },
                { selectedMembers: profile._id }
            ]
        }).select("eventId paymentStatus");

        const registrationData = registrations.map(reg => ({
            eventId: reg.eventId.toString(),
            status: reg.paymentStatus
        }));

        const registeredEventIds = registrationData.map(r => r.eventId);
        const paidEventIds = registrationData
            .filter(r => ["paid", "manual_verified"].includes(r.status))
            .map(r => r.eventId);

        return NextResponse.json({
            registrations: registrationData,
            registeredEvents: registeredEventIds,
            paidEvents: paidEventIds,
            onboardingCompleted: profile.onboardingCompleted,
            username: profile.username
        });

    } catch (error) {
        console.error("Profile Status Error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
