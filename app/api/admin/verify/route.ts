
import { NextResponse } from "next/server";
import connectToDB from "@/lib/mongodb";
import Registration from "@/app/models/Registration";
import Team from "@/app/models/Team";
import Event from "@/app/models/Event";
import Profile from "@/app/models/Profile";


import { verifyAdminRequest } from "@/lib/adminAuth";

export async function POST(req: Request) {
    try {
        const admin = await verifyAdminRequest();
        if (!admin) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        await connectToDB();

        const { registrationId, action } = await req.json();

        if (!registrationId || !/^[0-9a-fA-F]{24}$/.test(registrationId)) {
            return NextResponse.json(
                { message: "Invalid Registration ID format" },
                { status: 400 }
            );
        }

        const registration = await Registration.findById(registrationId)
            .populate({
                path: "teamId",
                model: Team,
                select: "name members leaderId",
                populate: [
                    {
                        path: "members",
                        model: Profile,
                        select: "fullName firstName lastName email studentId",
                    },
                    {
                        path: "leaderId",
                        model: Profile,
                        select: "fullName firstName lastName email studentId",
                    },
                ],
            })
            .populate({
                path: "eventId",
                model: Event,
                select: "title category fees",
            })
            .populate({
                path: "selectedMembers",
                model: Profile,
                select: "fullName firstName lastName email studentId college phone",
            });

        if (!registration) {
            return NextResponse.json(
                { message: "Registration not found" },
                { status: 404 }
            );
        }

        const isPaid =
            registration.paymentStatus === "paid" ||
            registration.paymentStatus === "manual_verified";

        if (!isPaid) {
            return NextResponse.json(
                {
                    message: "Registration not paid or verified",
                    registration: {
                        ...registration.toObject(),
                        status: "UNPAID",
                    },
                },
                { status: 400 }
            );
        }

        if (action === "checkIn") {
            if (registration.checkedIn) {
                return NextResponse.json(
                    {
                        message: "Already checked in",
                        registration: registration,
                    },
                    { status: 400 }
                );
            }

            registration.checkedIn = true;
            registration.checkedInAt = new Date();
            await registration.save();

            return NextResponse.json({
                message: "Check-in successful",
                registration,
            });
        }

        return NextResponse.json({
            message: "Valid registration found",
            registration: {
                ...registration.toObject(),
                status: "VALID",
            },
        });
    } catch (error) {
        console.error("Verification error:", error);
        return NextResponse.json(
            { message: "Internal server error" },
            { status: 500 }
        );
    }
}
