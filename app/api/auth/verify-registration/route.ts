import { NextResponse } from "next/server";
import { auth as clerkAuth, currentUser } from "@clerk/nextjs/server";
import { auth as nextAuth } from "@/auth";
import connectDB from "@/lib/mongodb";
import Profile from "@/app/models/Profile";

export const dynamic = "force-dynamic";

export async function GET() {
    try {
        let email = "";
        let authId = "";

        // 1. Check Clerk
        const clerkSession = await clerkAuth();
        if (clerkSession?.userId) {
            const user = await currentUser();
            email = user?.emailAddresses?.[0]?.emailAddress || "";
            authId = clerkSession.userId;
        }
        // 2. Check NextAuth
        else {
            const nextSession = await nextAuth();
            if (nextSession?.user?.email) {
                email = nextSession.user.email;
                authId = nextSession.user.id || `google_${email}`;
            }
        }

        if (!email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        await connectDB();

        // Check Profile
        const profile = await Profile.findOne({ email });

        // User is "registered" if they have a profile AND onboarding is completed
        // legacy check for "AuthUser" removed as we are migrating to Profile-based hybrid system
        // providing 'registered' as true only if onboarding is completed.

        const isOnboarded = profile?.onboardingCompleted === true;

        return NextResponse.json({
            registered: !!profile,
            onboardingCompleted: isOnboarded,
            email: email
        });

    } catch (error) {
        console.error("Verification Error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
