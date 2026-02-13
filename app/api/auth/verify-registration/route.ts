import { NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import connectDB from "@/lib/mongodb";
import Profile from "@/app/models/Profile";
import AuthUser from "@/app/models/AuthUser";

export const dynamic = "force-dynamic";

export async function GET() {
    try {
        const { userId: clerkId } = await auth();
        const user = await currentUser();

        if (!clerkId || !user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const email = user.emailAddresses?.[0]?.emailAddress;
        if (!email) {
            return NextResponse.json({ error: "Email not found" }, { status: 400 });
        }

        await connectDB();

        // Check if user exists in Profile (new system) or AuthUser (legacy system)
        const [profile, legacyUser] = await Promise.all([
            Profile.findOne({ $or: [{ clerkId }, { email }] }),
            AuthUser.findOne({ email })
        ]);

        const isRegistered = !!profile || !!legacyUser;

        return NextResponse.json({
            registered: isRegistered,
            email: email
        });

    } catch (error) {
        console.error("Verification Error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
