import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Team from "@/app/models/Team";
import Profile from "@/app/models/Profile";

const MAX_TEAM_SIZE = 5;

// POST - Invite a user to team by username or email
export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { clerkId, inviteQuery, inviteUserId } = body;

        // Support both: inviteQuery (username/email) OR inviteUserId (direct ID)
        if (!clerkId || (!inviteQuery && !inviteUserId)) {
            return NextResponse.json(
                { message: "clerkId and inviteQuery or inviteUserId are required" },
                { status: 400 }
            );
        }

        await connectDB();

        // Get inviter's profile
        const inviterProfile = await Profile.findOne({ clerkId });
        if (!inviterProfile) {
            return NextResponse.json(
                { message: "Your profile was not found" },
                { status: 404 }
            );
        }

        // Get inviter's team (must be leader)
        const team = await Team.findOne({ leaderId: inviterProfile._id });
        if (!team) {
            return NextResponse.json(
                { message: "You must be a team leader to invite members" },
                { status: 403 }
            );
        }

        // Check if team is locked
        if (team.isLocked) {
            return NextResponse.json(
                { message: "Team is locked. Cannot add new members after payment." },
                { status: 400 }
            );
        }

        // Check team size limit
        if (team.members && team.members.length >= MAX_TEAM_SIZE) {
            return NextResponse.json(
                { message: `Team is full. Maximum ${MAX_TEAM_SIZE} members allowed.` },
                { status: 400 }
            );
        }

        // Find the user to invite - by ID or by query
        let inviteeProfile;
        if (inviteUserId) {
            inviteeProfile = await Profile.findById(inviteUserId);
        } else {
            // Search by username or email
            const query = inviteQuery.trim().toLowerCase();
            inviteeProfile = await Profile.findOne({
                $or: [
                    { username: { $regex: new RegExp(`^${query}$`, "i") } },
                    { email: { $regex: new RegExp(`^${query}$`, "i") } },
                ],
            });
        }

        if (!inviteeProfile) {
            return NextResponse.json(
                { message: "User not found. Make sure they have an account and completed onboarding." },
                { status: 404 }
            );
        }

        // Edge case: Cannot invite yourself
        if (inviteeProfile._id.toString() === inviterProfile._id.toString()) {
            return NextResponse.json(
                { message: "You cannot invite yourself" },
                { status: 400 }
            );
        }

        // Check if user is already in a team
        const userInTeam = await Team.findOne({
            $or: [
                { leaderId: inviteeProfile._id },
                { members: inviteeProfile._id },
            ],
        });

        if (userInTeam) {
            return NextResponse.json(
                { message: `${inviteeProfile.username || inviteeProfile.email} is already in a team` },
                { status: 400 }
            );
        }

        // Check if already invited
        if (inviteeProfile.invitations && inviteeProfile.invitations.some(
            (inv: { toString: () => string }) => inv.toString() === team._id.toString()
        )) {
            return NextResponse.json(
                { message: "This user already has a pending invitation from your team" },
                { status: 400 }
            );
        }

        // Add invitation to user's profile
        await Profile.findByIdAndUpdate(inviteeProfile._id, {
            $push: { invitations: team._id },
        });

        const displayName = inviteeProfile.username || inviteeProfile.email;
        return NextResponse.json(
            {
                message: `Invitation sent to ${displayName}`,
                invited: {
                    _id: inviteeProfile._id,
                    username: inviteeProfile.username,
                    email: inviteeProfile.email,
                }
            },
            { status: 200 }
        );
    } catch (error) {
        console.error("Invite error:", error);
        return NextResponse.json(
            { message: "Internal server error" },
            { status: 500 }
        );
    }
}

// GET - Get pending invitations sent by the team
export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const clerkId = searchParams.get("clerkId");

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

        // Get user's team (must be leader)
        const team = await Team.findOne({ leaderId: profile._id });
        if (!team) {
            return NextResponse.json({ pendingInvites: [] });
        }

        // Find all users who have this team in their invitations
        const pendingInvites = await Profile.find({
            invitations: team._id,
        }).select("_id username email firstName lastName avatarUrl college");

        return NextResponse.json({ pendingInvites });
    } catch (error) {
        console.error("Get invites error:", error);
        return NextResponse.json(
            { message: "Internal server error" },
            { status: 500 }
        );
    }
}
