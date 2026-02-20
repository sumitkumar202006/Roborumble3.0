import { NextResponse } from "next/server";
import { auth as nextAuth } from "@/auth";
import connectDB from "@/lib/mongodb";
import Team from "@/app/models/Team";
import Profile from "@/app/models/Profile";
import Registration from "@/app/models/Registration";
import Cart from "@/app/models/Cart";

// POST - Leave or disband team
export async function POST(req: Request) {
    try {
        const session = await nextAuth();
        const body = await req.json();
        const { clerkId: clerkIdParam, type } = body;
        const isEsports = type === "esports";

        let email = session?.user?.email;
        if (!email && !clerkIdParam) {
            return NextResponse.json({ message: "Authentication required" }, { status: 401 });
        }

        await connectDB();

        // Get user's profile
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

        if (!profile) {
            return NextResponse.json(
                { message: "Complete profile details" },
                { status: 404 }
            );
        }

        // Find user's team of specific type
        const findTeam = await Team.findOne({
            isEsports,
            $or: [
                { leaderId: profile._id },
                { members: profile._id },
            ],
        });

        if (!findTeam) {
            return NextResponse.json(
                { message: "You are not in a team" },
                { status: 400 }
            );
        }

        // Check if team is locked (paid for event)
        if (findTeam.isLocked) {
            return NextResponse.json(
                { message: "Cannot leave a locked team. Your team has already registered for an event." },
                { status: 400 }
            );
        }

        const isLeader = findTeam.leaderId.toString() === profile._id.toString();

        if (isLeader) {
            // Leader is leaving - disband the entire team

            // 1. Clear team ID from all member profiles (leader + members)
            const allMemberIds = [findTeam.leaderId, ...findTeam.members];
            const unsetField = isEsports ? "esportsTeamId" : "currentTeamId";

            await Profile.updateMany(
                { _id: { $in: allMemberIds } },
                { $unset: { [unsetField]: 1 } }
            );

            // 2. Clear any pending invitations that reference this team from ALL profiles
            await Profile.updateMany(
                { invitations: findTeam._id },
                { $pull: { invitations: findTeam._id } }
            );

            // 3. Delete all registrations for this team
            await Registration.deleteMany({ teamId: findTeam._id });

            // 4. Delete cart associated with this team
            await Cart.deleteMany({ teamId: findTeam._id });

            // 5. Delete the team itself
            await Team.findByIdAndDelete(findTeam._id);

            return NextResponse.json({
                message: "Team has been disbanded. All members have been removed.",
                disbanded: true,
            });
        } else {
            // Member is leaving - just remove from team
            await Team.findByIdAndUpdate(findTeam._id, {
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
