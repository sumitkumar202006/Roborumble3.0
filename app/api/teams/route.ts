import { NextResponse } from "next/server";
import { auth as nextAuth } from "@/auth";
import connectDB from "@/lib/mongodb";
import Team from "@/app/models/Team";
import Profile from "@/app/models/Profile";

// GET - List teams or get user's team
export async function GET(req: Request) {
    try {
        const session = await nextAuth();
        const { searchParams } = new URL(req.url);
        const clerkIdParam = searchParams.get("clerkId"); // Keep for legacy/compat
        const search = searchParams.get("search");
        const type = searchParams.get("type"); // 'esports' or null for normal
        const isEsports = type === "esports";

        await connectDB();

        // 1. GET USER'S TEAM (If authenticated or clerkId provided)
        let email = session?.user?.email;
        let profile = null;

        if (email) {
            profile = await Profile.findOne({ email: email.toLowerCase() }).lean();
        } else if (clerkIdParam) {
            const mongoose = (await import("mongoose")).default;
            const isObjectId = mongoose.Types.ObjectId.isValid(clerkIdParam);
            profile = await Profile.findOne({
                $or: [
                    { clerkId: clerkIdParam },
                    { email: clerkIdParam.toLowerCase() },
                    ...(isObjectId ? [{ _id: clerkIdParam }] : [])
                ]
            }).lean();
        }

        if (profile) {
            const team = await Team.findOne({
                isEsports,
                $or: [{ leaderId: profile._id }, { members: profile._id }],
            })
                .populate("leaderId", "username email avatarUrl")
                .populate("members", "username email avatarUrl")
                .lean();

            // Also get pending invitations (filtered by type)
            const invitations = await Team.find({
                _id: { $in: profile.invitations || [] },
                isEsports,
            }).populate("leaderId", "username email").lean();

            // If we found a team or invitations, OR if it's a direct user lookup, return it
            if (!search && searchParams.get("available") !== "true") {
                return NextResponse.json({
                    team,
                    invitations,
                    profileId: profile._id,
                });
            }
        }

        // 2. SEARCH TEAMS
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

        // 3. LIST AVAILABLE TEAMS
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

        // Default: If they just wanted their team but none found
        if (profile) {
            return NextResponse.json({ team: null, invitations: [], profileId: profile._id });
        }

        return NextResponse.json(
            { message: "Provide clerkId/session, search query, or available=true" },
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
        const session = await nextAuth();
        const body = await req.json();
        const { clerkId: clerkIdParam, teamName, isEsports } = body;

        let email = session?.user?.email;
        if (!email && !clerkIdParam) {
            return NextResponse.json(
                { message: "Authentication required" },
                { status: 401 }
            );
        }

        if (!teamName) {
            return NextResponse.json(
                { message: "teamName is required" },
                { status: 400 }
            );
        }

        await connectDB();
        
        // Find profile
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

        // Check profile completeness (Hybrid check)
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
