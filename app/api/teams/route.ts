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
        const type = searchParams.get("type"); // 'esports' or null for normal
        const isEsports = type === "esports";

        await connectDB();

        // If clerkId provided, get user's current team
        if (clerkId) {
            const mongoose = (await import("mongoose")).default;
            const isObjectId = mongoose.Types.ObjectId.isValid(clerkId);
            
            const profile = await Profile.findOne({
                $or: [
                    { clerkId: clerkId },
                    { email: clerkId },
                    ...(isObjectId ? [{ _id: clerkId }] : [])
                ]
            }).lean();

            if (!profile) {
                return NextResponse.json(
                    { message: "Complete profile details" },
                    { status: 404 }
                );
            }

            const team = await Team.findOne({
                isEsports,
                $or: [{ leaderId: profile._id }, { members: profile._id }],
            })
                .populate("leaderId", "username email avatarUrl")
                .populate("members", "username email avatarUrl")
                .lean();

            // Also get pending invitations (filtered by type)
            const invitations = await Team.find({
                _id: { $in: profile.invitations },
                isEsports,
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
                isEsports,
            })
                .populate("leaderId", "username email")
                .limit(10)
                .lean();

            return NextResponse.json({ teams });
        }

        // If available=true, fetch available teams (not locked)
        const available = searchParams.get("available");
        if (available === "true") {
            const teams = await Team.find({
                isLocked: false,
                isEsports,
            })
                .populate("leaderId", "username email avatarUrl")
                .populate("members", "_id")
                .sort({ createdAt: -1 })
                .limit(10)
                .lean();

            return NextResponse.json({ teams });
        }

        return NextResponse.json(
            { message: "Provide clerkId, search query, or available=true" },
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
        const { clerkId, teamName, isEsports } = body;

        if (!clerkId || !teamName) {
            return NextResponse.json(
                { message: "clerkId and teamName are required" },
                { status: 400 }
            );
        }

        await connectDB();
        const mongoose = (await import("mongoose")).default;
        const isObjectId = mongoose.Types.ObjectId.isValid(clerkId);

        // Get user profile
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

        // Check profile completeness
        const mandatoryFields = ["username", "phone", "college", "city", "state", "degree"];
        const isIncomplete = mandatoryFields.some(field => !profile[field as keyof typeof profile]);

        if (!profile.onboardingCompleted || isIncomplete) {
            return NextResponse.json(
                { message: "Incomplete profile. Please fill all details in your profile before creating a team." },
                { status: 403 }
            );
        }

        // Check if user is already in a team of this type
        const existingTeam = await Team.findOne({
            isEsports: !!isEsports,
            $or: [{ leaderId: profile._id }, { members: profile._id }],
        });

        if (existingTeam) {
            return NextResponse.json(
                { message: `You are already in ${isEsports ? 'an esports' : 'a'} team. Leave your current team first.` },
                { status: 400 }
            );
        }

        // Check if team name is taken (case-insensitive)
        const nameTaken = await Team.findOne({
            name: { $regex: new RegExp(`^${teamName.trim()}$`, "i") }
        });
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
            isEsports: !!isEsports,
        });

        // Update user's profile with team ID
        const updateData: any = {};
        if (isEsports) {
            updateData.esportsTeamId = newTeam._id;
        } else {
            updateData.currentTeamId = newTeam._id;
        }

        await Profile.findByIdAndUpdate(profile._id, updateData);

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
