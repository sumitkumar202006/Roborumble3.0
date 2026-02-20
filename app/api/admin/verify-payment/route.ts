import { NextResponse } from "next/server";
import { auth as nextAuth } from "@/auth";
import connectDB from "@/lib/mongodb";
import Registration from "@/app/models/Registration";
import Profile from "@/app/models/Profile";
import Team from "@/app/models/Team";

export async function POST(req: Request) {
    try {
        const session = await nextAuth();

        if (!session?.user?.email) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        // @ts-ignore
        if (!["ADMIN", "SUPERADMIN"].includes(session.user.role?.toUpperCase())) {
            return NextResponse.json({ message: "Forbidden" }, { status: 403 });
        }

        const body = await req.json();
        const { registrationId, action, notes } = body;

        await connectDB();

        const registration = await Registration.findById(registrationId);
        if (!registration) {
            return NextResponse.json({ message: "Registration not found" }, { status: 404 });
        }

        if (action === "verify") {
            await Registration.findByIdAndUpdate(registrationId, {
                paymentStatus: "manual_verified",
                manualVerification: {
                    verifiedBy: session.user.id,
                    verifiedAt: new Date(),
                    notes: notes || "Manually verified by admin",
                },
            });

            // Lock the team associated with this registration
            await Team.findByIdAndUpdate(registration.teamId, { isLocked: true });

            return NextResponse.json({ message: "Registration verified manually" });
        }

        if (action === "reject") {
            await Registration.findByIdAndUpdate(registrationId, {
                paymentStatus: "failed",
                manualVerification: {
                    verifiedBy: session.user.id,
                    verifiedAt: new Date(),
                    notes: notes || "Rejected by admin",
                },
            });
            return NextResponse.json({ message: "Registration marked as failed" });
        }

        return NextResponse.json({ message: "Invalid action" }, { status: 400 });
    } catch (error) {
        console.error("Admin Verify Payment Error:", error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}
