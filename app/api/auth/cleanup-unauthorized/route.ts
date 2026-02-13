import { NextResponse } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs/server";
import connectDB from "@/lib/mongodb";
import Profile from "@/app/models/Profile";
import AuthUser from "@/app/models/AuthUser";

export const dynamic = "force-dynamic";

export async function POST() {
    try {
        const { userId: clerkId } = await auth();

        if (!clerkId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const client = await clerkClient();
        const user = await client.users.getUser(clerkId);
        const email = user.emailAddresses?.[0]?.emailAddress;

        if (!email) {
            return NextResponse.json({ error: "Email not found" }, { status: 400 });
        }

        await connectDB();

        // Final check before deletion
        const [profile, legacyUser] = await Promise.all([
            Profile.findOne({ $or: [{ clerkId }, { email }] }),
            AuthUser.findOne({ email })
        ]);

        if (profile || legacyUser) {
            return NextResponse.json({ message: "User is registered, not deleting." });
        }

        // User is not registered and they just logged in (account created by Clerk)
        // We delete their account from Clerk to prevent pollution
        console.log(`[CLEANUP] Deleting unauthorized Clerk user: ${email} (${clerkId})`);
        await client.users.deleteUser(clerkId);

        return NextResponse.json({ message: "Account cleaned up successfully." });

    } catch (error) {
        console.error("Cleanup Error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
