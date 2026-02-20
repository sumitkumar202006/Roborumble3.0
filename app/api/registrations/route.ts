import { NextResponse } from "next/server";
import { auth as nextAuth } from "@/auth";
import connectDB from "@/lib/mongodb";
import Registration from "@/app/models/Registration";
import Profile from "@/app/models/Profile";
import Team from "@/app/models/Team";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
    try {
        const session = await nextAuth();
        const { searchParams } = new URL(request.url);
        const clerkIdParam = searchParams.get("clerkId"); // Keep for legacy/compat

        await connectDB();

        // 1. ADMIN CHECK (Hybrid: NextAuth session or Admin Cookie)
        // @ts-ignore
        const isAdminSession = session?.user?.role === "admin" || session?.user?.role === "superadmin";

        // If it's an admin request (no clerkIdParam search) and user is admin
        if (!clerkIdParam && isAdminSession) {
            const data = await Registration.find()
                .populate("teamId")
                .populate("eventId")
                .sort({ createdAt: -1 });
            return NextResponse.json(data);
        }

        // 2. USER REGISTRATIONS
        let email = session?.user?.email;
        let profile = null;

        if (email) {
            profile = await Profile.findOne({ email: email.toLowerCase() });
        } else if (clerkIdParam) {
            // Fallback for legacy calls or specific ID lookups
            const mongoose = (await import("mongoose")).default;
            const isObjectId = mongoose.Types.ObjectId.isValid(clerkIdParam);
            profile = await Profile.findOne({
                $or: [
                    { clerkId: clerkIdParam },
                    { email: clerkIdParam.toLowerCase() },
                    ...(isObjectId ? [{ _id: clerkIdParam }] : [])
                ]
            });
        }

        if (profile) {
            // Find all teams where user is a member
            const teams = await Team.find({ members: profile._id });
            const teamIds = teams.map(t => t._id);

            // Find registrations for:
            // 1. Teams where user is a member
            // 2. Individual registrations where user is in selectedMembers
            const registrations = await Registration.find({
                $or: [
                    { teamId: { $in: teamIds } },
                    { selectedMembers: profile._id }
                ]
            })
                .populate("teamId")
                .populate("eventId")
                .populate("selectedMembers")
                .sort({ createdAt: -1 });

            return NextResponse.json({ registrations });
        }

        // If no profile found and not an admin
        if (!session) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        return NextResponse.json({ registrations: [] });

    } catch (error) {
        console.error("Error in registrations GET:", error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
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
