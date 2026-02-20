import { NextResponse } from "next/server";
import { auth as nextAuth } from "@/auth";
import connectDB from "@/lib/mongodb";
import Profile from "@/app/models/Profile";

async function getAuthenticatedUser() {
    // Check NextAuth
    const nextSession = await nextAuth();
    if (nextSession?.user?.email) {
        return {
            // @ts-ignore
            id: nextSession.user.id || `google_${nextSession.user.email}`, // Fallback ID if needed
            email: nextSession.user.email,
            firstName: nextSession.user.name?.split(" ")[0] || "",
            lastName: nextSession.user.name?.split(" ")[1] || "",
            avatarUrl: nextSession.user.image || "",
            isClerk: false
        };
    }

    return null;
}

export async function POST(req: Request) {
    try {
        const user = await getAuthenticatedUser();

        if (!user) {
            return NextResponse.json(
                { message: "Not authenticated" },
                { status: 401 }
            );
        }

        const body = await req.json();
        const { username, phone, college, city, state, degree, branch, yearOfStudy, interests, bio, boarding } = body;

        // Validation
        const mandatoryFields = {
            username: "Username",
            phone: "Mobile number",
            college: "College name",
            city: "City",
            state: "State",
            degree: "Degree"
        };

        for (const [field, label] of Object.entries(mandatoryFields)) {
            const value = body[field as keyof typeof body];
            if (!value || (typeof value === "string" && !value.trim())) {
                return NextResponse.json(
                    { message: `${label} is required` },
                    { status: 400 }
                );
            }
        }

        if (!interests || interests.length === 0) {
            return NextResponse.json(
                { message: "Please select at least one interest" },
                { status: 400 }
            );
        }

        await connectDB();

        // Check if username is already taken (exclude current user)
        let dbId = user.isClerk ? user.id : (user.id || `google_${user.email}`);

        const existingUsername = await Profile.findOne({
            username: username.trim(),
            email: { $ne: user.email }, // Safer to exclude by email
        });

        if (existingUsername) {
            return NextResponse.json(
                { message: "Username is already taken" },
                { status: 400 }
            );
        }

        // Update or Create the profile
        const updatedProfile = await Profile.findOneAndUpdate(
            { email: user.email },
            {
                $set: {
                    clerkId: dbId, // Update ID to ensure consistency
                    username: username.trim(),
                    bio: bio?.trim() || "",
                    phone: phone?.trim() || "",
                    college: college?.trim() || "",
                    city: city?.trim() || "",
                    state: state?.trim() || "",
                    degree: degree?.trim() || "",
                    branch: branch?.trim() || "",
                    yearOfStudy: yearOfStudy ? parseInt(yearOfStudy.toString()) : undefined,
                    interests,
                    onboardingCompleted: true,
                    // Ensure basic info is synced
                    email: user.email,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    avatarUrl: user.avatarUrl,
                    boarding: boarding === "yes" || boarding === true,
                },
                $setOnInsert: {
                    role: "user",
                    createdAt: new Date(),
                }
            },
            { new: true, upsert: true, setDefaultsOnInsert: true }
        );

        if (!updatedProfile) {
            return NextResponse.json(
                { message: "Failed to update profile" },
                { status: 500 }
            );
        }

        return NextResponse.json(
            {
                message: "Profile updated successfully",
                profile: updatedProfile,
            },
            { status: 200 }
        );
    } catch (error) {
        console.error("Onboarding error:", error);
        return NextResponse.json(
            { message: "Internal server error" },
            { status: 500 }
        );
    }
}

export async function GET(req: Request) {
    try {
        const user = await getAuthenticatedUser();

        if (!user) {
            return NextResponse.json(
                { message: "Not authenticated" },
                { status: 401 }
            );
        }

        await connectDB();

        const profile = await Profile.findOne({ email: user.email });

        if (!profile) {
            return NextResponse.json(
                { onboardingCompleted: false, exists: false },
                { status: 200 }
            );
        }

        return NextResponse.json(
            {
                onboardingCompleted: profile.onboardingCompleted,
                exists: true,
                profile: {
                    username: profile.username,
                    interests: profile.interests,
                },
            },
            { status: 200 }
        );
    } catch (error) {
        console.error("Onboarding check error:", error);
        return NextResponse.json(
            { message: "Internal server error" },
            { status: 500 }
        );
    }
}
