import { NextResponse } from "next/server";
import { auth as nextAuth } from "@/auth";
import connectDB from "@/lib/mongodb";
import Team from "@/app/models/Team";
import Profile from "@/app/models/Profile";

// POST - Request to join a team
export async function POST(req: Request) {
    try {
        const session = await nextAuth();
        const body = await req.json();
        const { clerkId: clerkIdParam, teamId } = body;

        let email = session?.user?.email;
        if (!email && !clerkIdParam) {
            return NextResponse.json({ message: "Authentication required" }, { status: 401 });
        }

        if (!teamId) {
            return NextResponse.json({ message: "teamId is required" }, { status: 400 });
        }

        await connectDB();

        // Get requester's profile
        let profile = null;
        if (email) {
            profile = await Profile.findOne({ email: email.toLowerCase() });
        } else if (clerkIdParam) {
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

        if (!profile) {
            return NextResponse.json({ message: "Complete profile details" }, { status: 404 });
        }

        // Check profile completeness (Hybrid check)
        const mandatoryFields = ["username", "phone", "college", "city", "state", "degree"];
        const isIncomplete = mandatoryFields.some(field => !profile[field as keyof typeof profile]);

        if (!profile.onboardingCompleted || isIncomplete) {
            return NextResponse.json(
                { message: "Incomplete profile. Please fill all details in your profile before requesting to join a team." },
                { status: 403 }
            );
        }

        // Get the target team first to know its type
        const team = await Team.findById(teamId).populate("leaderId", "college");
        if (!team) {
            return NextResponse.json({ message: "Team not found" }, { status: 404 });
        }

        // Check if user is already in a team of this type
        const existingTeam = await Team.findOne({
            isEsports: team.isEsports,
            $or: [{ leaderId: profile._id }, { members: profile._id }],
        });

        if (existingTeam) {
            return NextResponse.json(
                { message: `You are already in ${team.isEsports ? "an esports" : "a"} team` },
                { status: 400 }
            );
        }

        // Check same-college rule (unless it's an esports team)
        const leader = team.leaderId as any;
        if (!team.isEsports && leader.college !== profile.college) {
            return NextResponse.json(
                { message: `Cross-college teams are not allowed. This team is for students of ${leader.college}.` },
                { status: 403 }
            );
        }

        if (team.isLocked) {
            return NextResponse.json(
                { message: "Team is locked and not accepting new members" },
                { status: 400 }
            );
        }

        // Check if already requested
        if (team.joinRequests.includes(profile._id)) {
            return NextResponse.json(
                { message: "You have already requested to join this team" },
                { status: 400 }
            );
        }

        // Check member limit (50)
        if (team.members.length >= 50) {
            return NextResponse.json(
                { message: "Team has reached the maximum limit of 50 members" },
                { status: 400 }
            );
        }

        // Add join request
        await Team.findByIdAndUpdate(teamId, {
            $push: { joinRequests: profile._id },
        });

        return NextResponse.json(
            { message: "Join request sent successfully" },
            { status: 200 }
        );
    } catch (error) {
        console.error("Join request error:", error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}

// GET - Get pending join requests for a team (leader only)
export async function GET(req: Request) {
    try {
        const session = await nextAuth();
        const { searchParams } = new URL(req.url);
        const clerkIdParam = searchParams.get("clerkId");
        const type = searchParams.get("type"); // 'esports' or null
        const isEsports = type === "esports";

        let email = session?.user?.email;
        if (!email && !clerkIdParam) {
            return NextResponse.json({ message: "Authentication required" }, { status: 401 });
        }

        await connectDB();

        let profile = null;
        if (email) {
            profile = await Profile.findOne({ email: email.toLowerCase() });
        } else if (clerkIdParam) {
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

        if (!profile) {
            return NextResponse.json({ message: "Complete profile details" }, { status: 404 });
        }

        // Find the team where this user is leader and matches the requested type
        const team = await Team.findOne({ 
            leaderId: profile._id,
            isEsports: !!isEsports 
        }).populate(
            "joinRequests",
            "username email avatarUrl college"
        );

        if (!team) {
            // It's acceptable to have no team, return empty list
            return NextResponse.json({ joinRequests: [] });
        }

        return NextResponse.json({ joinRequests: team.joinRequests });
    } catch (error) {
        console.error("Get join requests error:", error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}
