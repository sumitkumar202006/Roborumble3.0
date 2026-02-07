import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Team from "@/app/models/Team";
import Profile from "@/app/models/Profile";

// POST - Request to join a team
export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { clerkId, teamId } = body;

        if (!clerkId || !teamId) {
            return NextResponse.json(
                { message: "clerkId and teamId are required" },
                { status: 400 }
            );
        }

        await connectDB();

        // Get requester's profile
        const profile = await Profile.findOne({ clerkId });
        if (!profile) {
            return NextResponse.json({ message: "Profile not found" }, { status: 404 });
        }

        // Check if user is already in a team
        const existingTeam = await Team.findOne({
            $or: [{ leaderId: profile._id }, { members: profile._id }],
        });

        if (existingTeam) {
            return NextResponse.json(
                { message: "You are already in a team" },
                { status: 400 }
            );
        }

        // Get the team
        const team = await Team.findById(teamId);
        if (!team) {
            return NextResponse.json({ message: "Team not found" }, { status: 404 });
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
        const { searchParams } = new URL(req.url);
        const clerkId = searchParams.get("clerkId");

        if (!clerkId) {
            return NextResponse.json({ message: "clerkId is required" }, { status: 400 });
        }

        await connectDB();

        const profile = await Profile.findOne({ clerkId });
        if (!profile) {
            return NextResponse.json({ message: "Profile not found" }, { status: 404 });
        }

        // Must be a team leader
        const team = await Team.findOne({ leaderId: profile._id }).populate(
            "joinRequests",
            "username email avatarUrl college"
        );

        if (!team) {
            return NextResponse.json({ message: "You are not a team leader" }, { status: 403 });
        }

        return NextResponse.json({ joinRequests: team.joinRequests });
    } catch (error) {
        console.error("Get join requests error:", error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}
