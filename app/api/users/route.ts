import { NextResponse } from "next/server";
import { auth as nextAuth } from "@/auth";
import connectDB from "@/lib/mongodb";
import Profile from "@/app/models/Profile";

export const dynamic = "force-dynamic";

// GET - Get user profile by id or email
export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const id = searchParams.get("id");
        const email = searchParams.get("email");

        if (!id && !email) {
            return NextResponse.json({ error: "id or email is required" }, { status: 400 });
        }

        await connectDB();
        
        const filter = id ? { _id: id } : { email: email };
        const user = await Profile.findOne(filter);

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        return NextResponse.json({ user }, { status: 200 });
    } catch (error) {
        console.error("User GET Error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

// PATCH - Update current user profile
export async function PATCH(req: Request) {
    try {
        const session = await nextAuth();
        if (!session?.user?.email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { username, phone, college, city, state, degree, branch, yearOfStudy, boarding } = body;

        await connectDB();

        // Check for username uniqueness if changed
        if (username) {
            const existingUser = await Profile.findOne({
                username: username.trim(),
                email: { $ne: session.user.email }
            });

            if (existingUser) {
                return NextResponse.json({ error: "Username is already taken" }, { status: 400 });
            }
        }

        const updateData: any = {
            ...(username && { username: username.trim() }),
            ...(phone && { phone: phone.trim() }),
            ...(college && { college: college.trim() }),
            ...(city && { city: city.trim() }),
            ...(state && { state: state.trim() }),
            ...(degree && { degree: degree.trim() }),
            ...(branch && { branch: branch.trim() }),
            ...(yearOfStudy !== undefined && { yearOfStudy }),
            ...(boarding !== undefined && { boarding: boarding === "yes" || boarding === true }),
        };

        const updatedUser = await Profile.findOneAndUpdate(
            { email: session.user.email },
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
