import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Team from "@/app/models/Team";
import Profile from "@/app/models/Profile";

// POST - Cancel a pending invitation
export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { clerkId, userId } = body;

        if (!clerkId || !userId) {
            return NextResponse.json(
                { message: "clerkId and userId are required" },
                { status: 400 }
            );
        }

        await connectDB();

        // Get inviter's profile
        const inviterProfile = await Profile.findOne({ clerkId });
        if (!inviterProfile) {
            return NextResponse.json(
                { message: "Profile not found" },
                { status: 404 }
            );
        }

        // Get inviter's team (must be leader)
        const team = await Team.findOne({ leaderId: inviterProfile._id });
        if (!team) {
            return NextResponse.json(
                { message: "You must be a team leader to cancel invitations" },
                { status: 403 }
            );
        }

        // Find the invited user and check if they have an invitation from this team
        const invitedUser = await Profile.findById(userId);
        if (!invitedUser) {
            return NextResponse.json(
                { message: "User not found" },
                { status: 404 }
            );
        }

        // Check if the invitation exists
        const hasInvitation = invitedUser.invitations?.some(
            (inv: { toString: () => string }) => inv.toString() === team._id.toString()
        );

        if (!hasInvitation) {
            return NextResponse.json(
                { message: "No pending invitation found for this user" },
                { status: 400 }
            );
        }

        // Remove the invitation
        await Profile.findByIdAndUpdate(userId, {
            $pull: { invitations: team._id },
        });

        return NextResponse.json({
            message: `Invitation to ${invitedUser.username || invitedUser.email} has been cancelled`,
        });
    } catch (error) {
        console.error("Cancel invitation error:", error);
        return NextResponse.json(
            { message: "Internal server error" },
            { status: 500 }
        );
    }
}
