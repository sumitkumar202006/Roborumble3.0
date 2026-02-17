import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Team from "@/app/models/Team";
import Profile from "@/app/models/Profile";

// POST - Accept or reject an invitation/join request
export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { clerkId, action, teamId, userId } = body;
        // action: "accept_invitation" | "reject_invitation" | "accept_request" | "reject_request"

        if (!clerkId || !action) {
            return NextResponse.json(
                { message: "clerkId and action are required" },
                { status: 400 }
            );
        }

        await connectDB();

        const mongoose = (await import("mongoose")).default;
        const isObjectId = mongoose.Types.ObjectId.isValid(clerkId);

        const profile = await Profile.findOne({
            $or: [
                { clerkId: clerkId },
                ...(isObjectId ? [{ _id: clerkId }] : [])
            ]
        });
        if (!profile) {
            return NextResponse.json({ message: "Complete profile details" }, { status: 404 });
        }

        // Handle user accepting/rejecting an invitation
        if (action === "accept_invitation" || action === "reject_invitation") {
            if (!teamId) {
                return NextResponse.json({ message: "teamId is required" }, { status: 400 });
            }

            // Check if invitation exists
            if (!profile.invitations.includes(teamId)) {
                return NextResponse.json(
                    { message: "No invitation from this team" },
                    { status: 400 }
                );
            }

            // Remove invitation from profile
            await Profile.findByIdAndUpdate(profile._id, {
                $pull: { invitations: teamId },
            });

            if (action === "accept_invitation") {
                const team = await Team.findById(teamId);
                if (!team) {
                    return NextResponse.json(
                        { message: "Team no longer exists" },
                        { status: 404 }
                    );
                }

                if (team.isLocked) {
                    return NextResponse.json({ message: "Team is locked" }, { status: 400 });
                }

                // Check if user is already in a team of this type
                const alreadyInTeam = await Team.findOne({
                    isEsports: team.isEsports,
                    $or: [{ leaderId: profile._id }, { members: profile._id }],
                });

                if (alreadyInTeam) {
                    return NextResponse.json(
                        { message: `You are already in ${team.isEsports ? "an esports" : "a"} team` },
                        { status: 400 }
                    );
                }

                // Add user to team
                const leaderProfile = await Profile.findById(team.leaderId);
                if (!team.isEsports && leaderProfile && leaderProfile.college !== profile.college) {
                    return NextResponse.json(
                        { message: `Cross-college teams are not allowed. Your college (${profile.college}) does not match the team leader's college (${leaderProfile.college}).` },
                        { status: 403 }
                    );
                }

                await Team.findByIdAndUpdate(teamId, {
                    $push: { members: profile._id },
                });

                // Update user's profile with team ID
                const updateData: any = {};
                if (team.isEsports) {
                    updateData.esportsTeamId = teamId;
                } else {
                    updateData.currentTeamId = teamId;
                }

                await Profile.findByIdAndUpdate(profile._id, updateData);

                return NextResponse.json({ message: "You have joined the team!" });
            }

            return NextResponse.json({ message: "Invitation rejected" });
        }

        // Handle leader accepting/rejecting a join request
        if (action === "accept_request" || action === "reject_request") {
            if (!userId) {
                return NextResponse.json({ message: "userId is required" }, { status: 400 });
            }

            const type = body.type; // 'esports' or null/undefined
            const isEsports = type === "esports";

            // Must be a team leader for the specific type
            const team = await Team.findOne({ 
                leaderId: profile._id,
                isEsports: !!isEsports
            });
            
            if (!team) {
                return NextResponse.json(
                    { message: `You are not a leader of ${isEsports ? "an esports" : "a"} team` },
                    { status: 403 }
                );
            }

            // Check if join request exists
            if (!team.joinRequests.includes(userId)) {
                return NextResponse.json(
                    { message: "No join request from this user" },
                    { status: 400 }
                );
            }

            // Remove from joinRequests
            await Team.findByIdAndUpdate(team._id, {
                $pull: { joinRequests: userId },
            });

            if (action === "accept_request") {
                if (team.isLocked) {
                    return NextResponse.json({ message: "Team is locked" }, { status: 400 });
                }

                // Verify requester is not already in another team of this type
                const requesterAlreadyInTeam = await Team.findOne({
                    isEsports: team.isEsports,
                    $or: [{ leaderId: userId }, { members: userId }],
                });

                if (requesterAlreadyInTeam) {
                    return NextResponse.json(
                        { message: `User is already in ${team.isEsports ? "an esports" : "a"} team` },
                        { status: 400 }
                    );
                }

                // Verify college match (unless esports)
                const requesterProfile = await Profile.findById(userId);
                if (!team.isEsports && requesterProfile && requesterProfile.college !== profile.college) {
                    return NextResponse.json(
                        { message: `Cross-college teams are not allowed. Requester's college (${requesterProfile.college}) does not match your college (${profile.college}).` },
                        { status: 403 }
                    );
                }

                // Add user to team
                await Team.findByIdAndUpdate(team._id, {
                    $push: { members: userId },
                });

                // Update requester's profile with team ID
                const updateData: any = {};
                if (team.isEsports) {
                    updateData.esportsTeamId = team._id;
                } else {
                    updateData.currentTeamId = team._id;
                }

                await Profile.findByIdAndUpdate(userId, updateData);

                return NextResponse.json({ message: "User added to team!" });
            }

            return NextResponse.json({ message: "Join request rejected" });
        }

        return NextResponse.json({ message: "Invalid action" }, { status: 400 });
    } catch (error) {
        console.error("Respond error:", error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}
