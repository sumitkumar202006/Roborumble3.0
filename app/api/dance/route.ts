import { NextResponse } from "next/server";
import { auth as nextAuth } from "@/auth";
import connectDB from "@/lib/mongodb";
import Profile from "@/app/models/Profile";
import DanceRegistration from "@/app/models/DanceRegistration";

export async function GET(req: Request) {
    try {
        let email = "";

        // Check NextAuth
        const nextSession = await nextAuth();
        if (nextSession?.user?.email) {
            email = nextSession.user.email;
        }

        if (!email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        await connectDB();

        // Find user profile by email
        const profile = await Profile.findOne({ email });
        if (!profile) {
            return NextResponse.json({ error: "Profile not found" }, { status: 404 });
        }

        const registrations = await DanceRegistration.find({ profileId: profile._id }).sort({ createdAt: -1 });

        return NextResponse.json({ registrations });
    } catch (error) {
        console.error("Dance GET error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        let email = "";

        // Check NextAuth
        const nextSession = await nextAuth();
        if (nextSession?.user?.email) {
            email = nextSession.user.email;
        }

        if (!email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { category, danceStyle, teamName, members, videoLink } = body;

        if (!category || !danceStyle || !videoLink) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        await connectDB();

        // Find user profile by email
        const profile = await Profile.findOne({ email });
        if (!profile) {
            return NextResponse.json({ error: "Profile not found" }, { status: 404 });
        }

        // Check if user already has 3 registrations
        const existingCount = await DanceRegistration.countDocuments({ profileId: profile._id });
        if (existingCount >= 3) {
            return NextResponse.json({ error: "Maximum limit of 3 registrations reached" }, { status: 400 });
        }

        const newRegistration = await DanceRegistration.create({
            profileId: profile._id,
            category,
            danceStyle,
            teamName: category === "Group" ? teamName : undefined,
            members: members || [],
            videoLink,
            performanceTime: "4–5 minutes",
            status: "pending"
        });

        return NextResponse.json({
            message: "Registration successful!",
            registration: newRegistration
        }, { status: 201 });

    } catch (error) {
        console.error("Dance POST error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
