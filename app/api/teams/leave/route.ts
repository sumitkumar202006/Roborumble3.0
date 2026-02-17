import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Team from "@/app/models/Team";
import Profile from "@/app/models/Profile";
import Registration from "@/app/models/Registration";
import Cart from "@/app/models/Cart";

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
        const mongoose = (await import("mongoose")).default;
        const isObjectId = mongoose.Types.ObjectId.isValid(clerkId);

        const profile = await Profile.findOne({
            $or: [
                { clerkId: clerkId },
                ...(isObjectId ? [{ _id: clerkId }] : [])
            ]
        });
        if (!profile) {
            return NextResponse.json(
                { message: "Complete profile details" },
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

            // 1. Clear team ID from all member profiles (leader + members)
            const allMemberIds = [team.leaderId, ...team.members];
            const unsetField = isEsports ? "esportsTeamId" : "currentTeamId";

            await Profile.updateMany(
                { _id: { $in: allMemberIds } },
                { $unset: { [unsetField]: 1 } }
            );

            // 2. Clear any pending invitations that reference this team from ALL profiles
            await Profile.updateMany(
                { invitations: team._id },
                { $pull: { invitations: team._id } }
            );

            // 3. Delete all registrations for this team
            await Registration.deleteMany({ teamId: team._id });

            // 4. Delete cart associated with this team
            await Cart.deleteMany({ teamId: team._id });

            // 5. Delete the team itself
            await Team.findByIdAndDelete(team._id);

            return NextResponse.json({
                message: "Team has been disbanded. All members have been removed.",
                disbanded: true,
            });
        } else {
            // Member is leaving - just remove from team
            await Team.findByIdAndUpdate(team._id, {
                $pull: { members: profile._id },
            });

            // Clear user's team ID
            const unsetField = isEsports ? "esportsTeamId" : "currentTeamId";
            await Profile.findByIdAndUpdate(profile._id, {
                $unset: { [unsetField]: 1 },
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
