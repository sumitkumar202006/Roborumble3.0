import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import DanceRegistration from "@/app/models/DanceRegistration";
import Profile from "@/app/models/Profile";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get("token");

        if (!token) {
            return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
        }

        // Verify Token
        const decoded = jwt.verify(
            token.value,
            process.env.JWT_SECRET || "default_secret"
        ) as { userId: string, role: string };

        if (!["ADMIN", "SUPERADMIN"].includes(decoded.role?.toUpperCase())) {
            return NextResponse.json({ error: "FORBIDDEN: ADMIN_ACCESS_ONLY" }, { status: 403 });
        }

        await connectDB();

        // Fetch all dance registrations with profile data
        const registrations = await DanceRegistration.find()
            .populate({
                path: 'profileId',
                select: 'firstName lastName email phone college degree city state username avatarUrl'
            })
            .sort({ createdAt: -1 });

        return NextResponse.json({ registrations }, { status: 200 });
    } catch (error) {
        console.error("Admin Dance Fetch Error:", error);
        return NextResponse.json({ error: "INTERNAL_SERVER_ERROR" }, { status: 500 });
    }
}

export async function PATCH(req: Request) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get("token");

        if (!token) {
            return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
        }

        const decoded = jwt.verify(
            token.value,
            process.env.JWT_SECRET || "default_secret"
        ) as { userId: string, role: string };

        if (!["ADMIN", "SUPERADMIN"].includes(decoded.role?.toUpperCase())) {
            return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
        }

        await connectDB();

        const { registrationId, status } = await req.json();

        if (!registrationId || !status) {
            return NextResponse.json({ error: "MISSING_DATA" }, { status: 400 });
        }

        const updated = await DanceRegistration.findByIdAndUpdate(
            registrationId,
            { status },
            { new: true }
        );

        if (!updated) {
            return NextResponse.json({ error: "REGISTRATION_NOT_FOUND" }, { status: 404 });
        }

        return NextResponse.json({ message: "STATUS_UPDATED", registration: updated });
    } catch (error) {
        console.error("Admin Dance Update Error:", error);
        return NextResponse.json({ error: "INTERNAL_SERVER_ERROR" }, { status: 500 });
    }
}
