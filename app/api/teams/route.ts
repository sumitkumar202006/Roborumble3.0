import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Team from "@/app/models/Team";
import Profile from "@/app/models/Profile";

// GET - List teams or get user's team
export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const clerkId = searchParams.get("clerkId");
        const search = searchParams.get("search");

        await connectDB();

        // If clerkId provided, get user's current team
        if (clerkId) {
            const profile = await Profile.findOne({ clerkId }).lean();
            if (!profile) {
                return NextResponse.json(
                    { message: "Profile not found" },
                    { status: 404 }
                );
            }

            const team = await Team.findOne({
                $or: [{ leaderId: profile._id }, { members: profile._id }],
            })
                .populate("leaderId", "username email avatarUrl")
                .populate("members", "username email avatarUrl")
                .lean();

            // Also get pending invitations
            const invitations = await Team.find({
                _id: { $in: profile.invitations },
            }).populate("leaderId", "username email").lean();

            return NextResponse.json({
                team,
                invitations,
                profileId: profile._id,
            });
        }

        // If search query provided, search teams by name
        if (search) {
            const teams = await Team.find({
                name: { $regex: search, $options: "i" },
                isLocked: false,
            })
                .populate("leaderId", "username email")
                .limit(10)
                .lean();

            return NextResponse.json({ teams });
        }

        return NextResponse.json(
            { message: "Provide clerkId or search query" },
            { status: 400 }
        );
    } catch (error) {
        console.error("Team GET error:", error);
        return NextResponse.json(
            { message: "Internal server error" },
            { status: 500 }
        );
    }
}

// POST - Create a new team
export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { clerkId, teamName } = body;

        if (!clerkId || !teamName) {
            return NextResponse.json(
                { message: "clerkId and teamName are required" },
                { status: 400 }
            );
        }

        await connectDB();

        // Get user profile
        const profile = await Profile.findOne({ clerkId });
        if (!profile) {
            return NextResponse.json(
                { message: "Profile not found" },
                { status: 404 }
            );
        }

        // Check if user is already in a team
        const existingTeam = await Team.findOne({
            $or: [{ leaderId: profile._id }, { members: profile._id }],
        });

        if (existingTeam) {
            return NextResponse.json(
                { message: "You are already in a team. Leave your current team first." },
                { status: 400 }
            );
        }

        // Check if team name is taken
        const nameTaken = await Team.findOne({ name: teamName.trim() });
        if (nameTaken) {
            return NextResponse.json(
                { message: "Team name is already taken" },
                { status: 400 }
            );
        }

        // Create the team
        const newTeam = await Team.create({
            name: teamName.trim(),
            leaderId: profile._id,
            members: [profile._id],
            joinRequests: [],
            isLocked: false,
        });

        // Update user's currentTeamId
        await Profile.findByIdAndUpdate(profile._id, {
            currentTeamId: newTeam._id,
        });

        return NextResponse.json(
            { message: "Team created successfully", team: newTeam },
            { status: 201 }
        );
    } catch (error) {
        console.error("Team POST error:", error);
        return NextResponse.json(
            { message: "Internal server error" },
            { status: 500 }
        );
    }
}
