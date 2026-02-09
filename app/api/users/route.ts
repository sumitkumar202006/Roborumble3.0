import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import connectDB from "@/lib/mongodb";
import Profile from "@/app/models/Profile";

export const dynamic = "force-dynamic";

// GET - Get user profile by clerkId
export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const clerkId = searchParams.get("clerkId");

        if (!clerkId) {
            return NextResponse.json({ error: "clerkId is required" }, { status: 400 });
        }

        await connectDB();
        const user = await Profile.findOne({ clerkId });

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        return NextResponse.json({ user }, { status: 200 });
    } catch (error) {
        console.error("User GET Error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

// PATCH - Update user profile
export async function PATCH(req: Request) {
    try {
        const body = await req.json();
        const { clerkId, username, phone, college, city, state, degree, branch, yearOfStudy } = body;

        if (!clerkId) {
            return NextResponse.json({ error: "clerkId is required" }, { status: 400 });
        }

        await connectDB();

        // Check for username uniqueness if changed
        if (username) {
            const existingUser = await Profile.findOne({
                username: username.trim(),
                clerkId: { $ne: clerkId }
            });

            if (existingUser) {
                return NextResponse.json({ error: "Username is already taken" }, { status: 400 });
            }
        }

        // Get current user details from Clerk for sync
        const clerkUser = await currentUser();

        const updateData: any = {
            ...(username && { username: username.trim() }),
            ...(phone && { phone: phone.trim() }),
            ...(college && { college: college.trim() }),
            ...(city && { city: city.trim() }),
            ...(state && { state: state.trim() }),
            ...(degree && { degree: degree.trim() }),
            ...(branch && { branch: branch.trim() }),
            ...(yearOfStudy !== undefined && { yearOfStudy }),
            ...(clerkUser?.imageUrl && { avatarUrl: clerkUser.imageUrl }),
            ...(clerkUser?.emailAddresses?.[0]?.emailAddress && { email: clerkUser.emailAddresses[0].emailAddress }),
            ...(clerkUser?.firstName && { firstName: clerkUser.firstName }),
            ...(clerkUser?.lastName && { lastName: clerkUser.lastName }),
        };

        const updatedUser = await Profile.findOneAndUpdate(
            { clerkId },
            { $set: updateData },
            { new: true }
        );

        if (!updatedUser) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        return NextResponse.json({ user: updatedUser }, { status: 200 });
    } catch (error) {
        console.error("User PATCH Error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
