import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import connectDB from "@/lib/mongodb";
import Registration from "@/app/models/Registration";

// Middleware-like check for admin session
async function isAdmin() {
    const cookieStore = await cookies();
    return cookieStore.get("admin_session")?.value === "true";
}

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const clerkId = searchParams.get("clerkId");

    // If clerkId is provided, fetch user's registrations
    if (clerkId) {
        try {
            await connectDB();
            const Profile = (await import("@/app/models/AuthUser")).default;
            const profile = await Profile.findOne({ clerkId });

            if (!profile) {
                return NextResponse.json({ message: "Profile not found" }, { status: 404 });
            }

            // Find all teams where user is a member
            const Team = (await import("@/app/models/Team")).default;
            const teams = await Team.find({ members: profile._id });
            const teamIds = teams.map(t => t._id);

            // Find registrations for:
            // 1. Teams where user is a member
            // 2. Individual registrations where user is in selectedMembers
            const registrations = await Registration.find({
                $or: [
                    { teamId: { $in: teamIds } }, // Team registrations
                    { selectedMembers: profile._id } // Individual registrations
                ]
            })
                .populate("teamId")
                .populate("eventId")
                .populate("selectedMembers")
                .sort({ createdAt: -1 });

            return NextResponse.json({ registrations });
        } catch (error) {
            console.error("Error fetching user registrations:", error);
            return NextResponse.json({ message: "Error fetching registrations" }, { status: 500 });
        }
    }

    // Admin route - fetch all registrations
    if (!(await isAdmin())) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    try {
        await connectDB();
        const data = await Registration.find()
            .populate("teamId")
            .populate("eventId")
            .sort({ createdAt: -1 });
        return NextResponse.json(data);
    } catch (error) {
        console.error("Error fetching registrations:", error);
        return NextResponse.json({ message: "Error fetching registrations" }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        // NOTE: This POST handler logic seems to mismatch the database schema for 'registrations'.
        // Since this route seems unused (Auth uses /api/auth/register), returning 501.
        // If this route is needed, it must be aligned with the schema.

        const body = await request.json();
        console.log("Received registration request (Legacy Route):", body);

        return NextResponse.json(
            { success: false, message: "Endpoint deprecated or needs update" },
            { status: 501 }
        );
    } catch (error) {
        console.error("Error processing registration:", error);
        return NextResponse.json({ message: "Error processing registration" }, { status: 500 });
    }
}
