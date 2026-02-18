import { NextResponse } from "next/server";
import mongoose from "mongoose";
import connectDB from "@/lib/mongodb";
import { sendPaymentVerifiedEmail, sendPaymentRejectedEmail, sendApprovalEmails } from "@/lib/email";
import PaymentSubmission from "@/app/models/PaymentSubmission";
import Registration from "@/app/models/Registration";
import Profile from "@/app/models/Profile";
import Event from "@/app/models/Event";
import Team from "@/app/models/Team";


// GET - List all payment submissions
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

interface PopulatedMember {
    _id: string;
    firstName?: string;
    lastName?: string;
    email?: string;
    username?: string;
    phone?: string;
}

interface PopulatedEvent {
    _id: string;
    title: string;
    fees: number;
    eventId: string;
    category: string;
    brochureLink?: string;
}

interface EnrichedSubmission {
    _id: string;
    clerkId: string;
    transactionId: string;
    screenshotUrl: string;
    totalAmount: number;
    status: string;
    leaderEmail: string;
    leaderName: string;
    leaderFullName?: string;
    leaderPhone: string;
    teamId?: { name: string };
    rejectionReason?: string;
    createdAt: string;
    events: {
        eventId: PopulatedEvent;
        selectedMembers: PopulatedMember[];
    }[];
}

// GET - List all payment submissions
export async function GET(req: Request) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get("token");

        if (!token) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Verify Token
        const decoded = jwt.verify(
            token.value,
            process.env.JWT_SECRET || "default_secret"
        ) as { userId: string, role: string };


        if (!["ADMIN", "SUPERADMIN"].includes(decoded.role?.toUpperCase())) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const { searchParams } = new URL(req.url);
        const status = searchParams.get("status"); // pending, verified, rejected, or all

        await connectDB();

        const filter: Record<string, any> = {
            screenshotUrl: { $ne: "FREE_EVENT" }
        };
        if (status && status !== "all") {
            filter.status = status;
        }

        const submissions = await PaymentSubmission.find(filter)
            .populate({
                path: "events.eventId",
                model: Event,
                select: "title eventId fees category",
            })
            .populate({
                path: "teamId",
                model: Team,
                select: "name",
            })
            .populate({
                path: "events.selectedMembers",
                model: Profile,
                select: "firstName lastName username",
            })
            .sort({ createdAt: -1 })
            .limit(100)
            .lean();

        // Enrich with leaderFullName and handle fallback for leaderPhone
        const enrichedSubmissions = await Promise.all(
            (submissions as unknown as EnrichedSubmission[]).map(async (sub) => {
                const profile = await Profile.findOne({
                    $or: [
                        { clerkId: sub.clerkId },
                        ...(mongoose.Types.ObjectId.isValid(sub.clerkId) ? [{ _id: sub.clerkId }] : [])
                    ]
                }).select("firstName lastName username phone") as PopulatedMember | null;

                const leaderFullName = profile
                    ? [profile.firstName, profile.lastName].filter(Boolean).join(" ") || profile.username || sub.leaderName
                    : sub.leaderName;

                return {
                    ...sub,
                    leaderFullName,
                    leaderPhone: sub.leaderPhone || profile?.phone || "N/A"
                };
            })
        );

        const stats = {
            pending: await PaymentSubmission.countDocuments({ status: "pending", screenshotUrl: { $ne: "FREE_EVENT" } }),
            verified: await PaymentSubmission.countDocuments({ status: "verified", screenshotUrl: { $ne: "FREE_EVENT" } }),
            rejected: await PaymentSubmission.countDocuments({ status: "rejected", screenshotUrl: { $ne: "FREE_EVENT" } }),
            // REVENUE RESET: Only count payments verified after Feb 15, 2026 12:20 PM IST
            // ISO: 2026-02-15T06:50:00.000Z
            totalRevenue: (await PaymentSubmission.aggregate([
                { 
                    $match: { 
                        status: "verified",
                        screenshotUrl: { $ne: "FREE_EVENT" },
                        verifiedAt: { $gte: new Date("2026-02-15T06:50:00.000Z") }
                    } 
                },
                { $group: { _id: null, total: { $sum: "$totalAmount" } } }
            ]))[0]?.total || 0,
        };

        return NextResponse.json({
            submissions: enrichedSubmissions,
            stats,
        });
    } catch (error) {
        console.error("Admin Payments GET Error:", error);
        return NextResponse.json(
            { error: "Failed to fetch submissions" },
            { status: 500 }
        );
    }
}

// POST - Verify or reject a payment
export async function POST(req: Request) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get("token");

        if (!token) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Verify Token
        const decoded = jwt.verify(
            token.value,
            process.env.JWT_SECRET || "default_secret"
        ) as { userId: string, role: string };

        const clerkId = decoded.userId;

        if (!["ADMIN", "SUPERADMIN"].includes(decoded.role?.toUpperCase())) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const { submissionId, action, rejectionReason } = await req.json();

        await connectDB();

        const submission = await PaymentSubmission.findById(submissionId);
        if (!submission) {
            return NextResponse.json(
                { error: "Submission not found" },
                { status: 404 }
            );
        }

        if (submission.status !== "pending") {
            return NextResponse.json(
                { error: "Submission already processed" },
                { status: 400 }
            );
        }

        if (action === "verify") {
            // Update submission status
            submission.status = "verified";
            submission.verifiedBy = clerkId;
            submission.verifiedAt = new Date();
            await submission.save();

            // Update all related registrations to manual_verified
            for (const eventItem of submission.events) {
                console.log(`Verifying event ${eventItem.eventId} for submission ${submission._id}`);

                // Primary update attempt using paymentSubmissionId
                let reg = await Registration.findOneAndUpdate(
                    {
                        eventId: eventItem.eventId,
                        paymentSubmissionId: submission._id,
                    },
                    {
                        paymentStatus: "manual_verified",
                        amountPaid: submission.totalAmount / submission.events.length,
                    },
                    { new: true }
                );

                // Fallback: Try finding by Team ID or User logic if primary failed
                if (!reg) {
                    console.warn(`Primary update failed for ${eventItem.eventId}. Trying fallback...`);
                    const fallbackQuery: Record<string, unknown> = {
                        eventId: eventItem.eventId,
                        paymentStatus: { $in: ["verification_pending", "pending", "initiated"] }
                    };

                    if (submission.teamId) {
                        fallbackQuery.teamId = submission.teamId;
                    } else {
                        // For individual, find by leader profile? 
                        // Simplified: update if found by Clerk ID via Profile look up if needed, 
                        // but for now relying on teamId or just logging the failure.
                        // Actually, we can look up the profile from clerkId
                        const profile = await Profile.findOne({
                            $or: [
                                { clerkId: submission.clerkId },
                                ...(mongoose.Types.ObjectId.isValid(submission.clerkId) ? [{ _id: submission.clerkId }] : [])
                            ]
                        });
                        if (profile) {
                            fallbackQuery.selectedMembers = profile._id;
                        }
                    }

                    if (fallbackQuery.teamId || fallbackQuery.selectedMembers) {
                        reg = await Registration.findOneAndUpdate(
                            fallbackQuery,
                            {
                                paymentStatus: "manual_verified",
                                paymentSubmissionId: submission._id, // Link it now
                                amountPaid: submission.totalAmount / submission.events.length,
                            },
                            { new: true }
                        );
                    }
                }

                if (reg) {
                    console.log(`Registration updated: ${reg._id}`);
                } else {
                    console.error(`Failed to find registration for event ${eventItem.eventId}`);
                }

                // Increment event registration count
                await Event.findByIdAndUpdate(eventItem.eventId, {
                    $inc: { currentRegistrations: 1 },
                });
            }

            // Update user profile with paid events
            const eventIds = submission.events.map((e) => e.eventId.toString());
            await Profile.findOneAndUpdate(
                {
                    $or: [
                        { clerkId: submission.clerkId },
                        ...(mongoose.Types.ObjectId.isValid(submission.clerkId) ? [{ _id: submission.clerkId }] : [])
                    ]
                },
                {
                    $addToSet: {
                        registeredEvents: { $each: eventIds },
                        paidEvents: { $each: eventIds },
                    },
                }
            );

            // NEW: Send detailed approval emails to ALL members using Resend
            try {
                const fullSubmission = (await PaymentSubmission.findById(submissionId)
                    .populate({
                        path: "events.eventId",
                        model: Event,
                        select: "title fees brochureLink guidelines",
                    })
                    .populate({
                        path: "events.selectedMembers",
                        model: Profile,
                        select: "firstName lastName email username",
                    })
                    .lean()) as unknown as EnrichedSubmission;

                if (fullSubmission) {
                    for (const eventItem of fullSubmission.events) {
                        const eventDetails = {
                            name: eventItem.eventId?.title || "Event",
                            fees: eventItem.eventId?.fees || 0,
                            brochureLink: eventItem.eventId?.brochureLink,
                        };

                        const participants = (eventItem.selectedMembers as unknown as PopulatedMember[]).map((m) => ({
                            name: [m.firstName, m.lastName].filter(Boolean).join(" ") || m.username || "Participant",
                            email: m.email || "",
                            transactionId: fullSubmission.transactionId,
                        })).filter(p => p.email);

                        if (participants.length > 0) {
                            await sendApprovalEmails(eventDetails, participants);
                        }
                    }

                    // Legacy notification for leader using populated data
                    const eventTitles = fullSubmission.events.map((e) => e.eventId?.title || "Event");
                    await sendPaymentVerifiedEmail(
                        fullSubmission.leaderEmail,
                        fullSubmission.leaderName,
                        eventTitles,
                        fullSubmission.totalAmount
                    );
                }
            } catch (emailError) {
                console.error("Automated batch email failed:", emailError);
                // Non-blocking error for the main verification flow
            }

            return NextResponse.json({
                message: "Payment verified and approval emails sent",
                email: submission.leaderEmail,
            });
        } else {
            // Reject payment
            submission.status = "rejected";
            submission.verifiedBy = clerkId;
            submission.verifiedAt = new Date();
            submission.rejectionReason = rejectionReason || "Payment could not be verified";
            await submission.save();

            // Update registrations to rejected
            for (const eventItem of submission.events) {
                await Registration.findOneAndUpdate(
                    {
                        eventId: eventItem.eventId,
                        paymentSubmissionId: submission._id,
                    },
                    {
                        paymentStatus: "rejected",
                    }
                );
            }

            // Send rejection email
            await sendPaymentRejectedEmail(
                submission.leaderEmail,
                submission.leaderName,
                submission.rejectionReason || "Payment could not be verified",
                submission.totalAmount
            );

            return NextResponse.json({
                message: "Payment rejected",
                email: submission.leaderEmail,
            });
        }
    } catch (error) {
        console.error("Admin Payments POST Error:", error);
        return NextResponse.json(
            { error: "Failed to process payment" },
            { status: 500 }
        );
    }
}
