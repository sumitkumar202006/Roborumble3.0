import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import connectDB from "@/lib/mongodb";
import AuthUser from "@/app/models/AuthUser";

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        await connectDB();

        const cookieStore = await cookies();
        const token = cookieStore.get("token");

        if (!token) {
            return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
        }

        // Verify Admin Token
        const decoded = jwt.verify(
            token.value,
            process.env.JWT_SECRET || "default_secret"
        ) as { userId: string; email: string };

        // Check if user is admin in DB
        const adminUser = await AuthUser.findById(decoded.userId);

        if (!adminUser || adminUser.role !== "ADMIN") {
            return NextResponse.json({ error: "FORBIDDEN: ADMIN_ACCESS_ONLY" }, { status: 403 });
        }

        // Fetch all users
        const allUsers = await AuthUser.find()
            .select(
                "name email college role paymentStatus events transactionId screenshotUrl declaredAmount createdAt"
            )
            .sort({ createdAt: -1 });

        return NextResponse.json({ users: allUsers }, { status: 200 });
    } catch (error) {
        console.error("Admin Users Fetch Error:", error);
        return NextResponse.json({ error: "INTERNAL_SERVER_ERROR" }, { status: 500 });
    }
}
