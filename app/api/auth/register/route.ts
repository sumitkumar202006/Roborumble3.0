import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import connectDB from "@/lib/mongodb";
import Profile from "@/app/models/Profile";

export async function POST(req: Request) {
    try {
        await connectDB();

        const { firstName, lastName, email, password } = await req.json();

        if (!firstName || !email || !password) {
            return NextResponse.json({ error: "ALL_FIELDS_REQUIRED" }, { status: 400 });
        }

        // Check if user exists in Profile (where Clerk/Google users are)
        const existingProfile = await Profile.findOne({ email });

        if (existingProfile) {
            // Check if user already has a password (already "migrated" or registered)
            // We need to use .select("+password") to check because it's hidden by default
            const userWithPass = await Profile.findOne({ email }).select("+password");
            
            if (userWithPass?.password) {
                return NextResponse.json({ error: "USER_ALREADY_EXISTS" }, { status: 400 });
            }

            // If user exists but has no password (Clerk/Google user),
            // update their profile with the new password
            const hashedPassword = await bcrypt.hash(password, 10);
            existingProfile.password = hashedPassword;
            existingProfile.firstName = firstName;
            if (lastName) existingProfile.lastName = lastName;
            
            await existingProfile.save();

            return NextResponse.json(
                {
                    message: "Profile updated with credentials",
                    user: {
                        id: existingProfile._id,
                        email: existingProfile.email,
                        firstName: existingProfile.firstName,
                    },
                },
                { status: 200 }
            );
        }

        // Create new user if email doesn't exist
        const hashedPassword = await bcrypt.hash(password, 10);

        const newProfile = await Profile.create({
            email,
            password: hashedPassword,
            firstName,
            lastName: lastName || "",
            role: "user",
            onboardingCompleted: false,
            interests: [],
        });

        return NextResponse.json(
            {
                message: "Registration successful",
                user: {
                    id: newProfile._id,
                    email: newProfile.email,
                    firstName: newProfile.firstName,
                },
            },
            { status: 201 }
        );
    } catch (error) {
        console.error("Registration Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
