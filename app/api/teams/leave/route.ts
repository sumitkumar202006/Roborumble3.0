import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Team from "@/app/models/Team";
import Profile from "@/app/models/Profile";

// POST - Leave or disband team
export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { clerkId, type } = body;
        const isEsports = type === "esports";

        if (!clerkId) {
            return NextResponse.json(
                { message: "clerkId is required" },
                { status: 400 }
            );
        }

        await connectDB();

        // Get user's profile
        const profile = await Profile.findOne({ clerkId });
        if (!profile) {
            return NextResponse.json(
                { message: "Profile not found" },
                { status: 404 }
            );
        }

        // Find user's team of specific type
        const team = await Team.findOne({
            isEsports,
            $or: [
                { leaderId: profile._id },
                { members: profile._id },
            ],
        });

        if (!team) {
            return NextResponse.json(
                { message: "You are not in a team" },
                { status: 400 }
            );
        }

        // Check if team is locked (paid for event)
        if (team.isLocked) {
            return NextResponse.json(
                { message: "Cannot leave a locked team. Your team has already registered for an event." },
                { status: 400 }
            );
        }

        const isLeader = team.leaderId.toString() === profile._id.toString();

        if (isLeader) {
            // Leader is leaving - disband the entire team

            // Get all member IDs
            const memberIds = team.members || [];

            // Clear team ID for all members
            const updateData: any = {};
            if (isEsports) {
                updateData.esportsTeamId = 1;
            } else {
                updateData.currentTeamId = 1;
            }

            await Profile.updateMany(
                { _id: { $in: memberIds } },
                { $unset: updateData }
            );

            // Clear any pending invitations that reference this team
            await Profile.updateMany(
                { invitations: team._id },
                { $pull: { invitations: team._id } }
            );

            // Delete the team
            await Team.findByIdAndDelete(team._id);

            return NextResponse.json({
                message: "Team has been disbanded. All members have been removed.",
                disbanded: true,
            });
        } else {
            // Member is leaving - just remove from team

            // Remove from team members
            await Team.findByIdAndUpdate(team._id, {
                $pull: { members: profile._id },
            });

            // Clear user's team ID
            const updateData: any = {};
            if (isEsports) {
                updateData.esportsTeamId = 1;
            } else {
                updateData.currentTeamId = 1;
            }

            await Profile.findByIdAndUpdate(profile._id, {
                $unset: updateData,
            });

            return NextResponse.json({
                message: "You have left the team.",
                disbanded: false,
            });
        }
    } catch (error) {
        console.error("Leave team error:", error);
        return NextResponse.json(
            { message: "Internal server error" },
            { status: 500 }
        );
    }
}
