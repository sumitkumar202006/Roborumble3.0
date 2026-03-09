import { NextResponse } from "next/server";
import { auth as nextAuth } from "@/auth";
import mongoose from "mongoose";
import connectDB from "@/lib/mongodb";
import Cart from "@/app/models/Cart";
import Event from "@/app/models/Event";
import Profile from "@/app/models/Profile";
import Registration from "@/app/models/Registration";
import PaymentSubmission from "@/app/models/PaymentSubmission";
import Team from "@/app/models/Team";

// UPI Configuration
const UPI_ID = "cseuietcsjmue857@axl";
const UPI_NAME = "Robo Rumble";

// POST - Submit payment proof
export async function POST(req: Request) {
    try {
        let email = "";

        // Check NextAuth
        const nextSession = await nextAuth();
        if (nextSession?.user?.email) {
            email = nextSession.user.email;
        }

        if (!email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { transactionId, screenshotUrl } = await req.json();

        await connectDB();

        // Get user profile first
        const profile = await Profile.findOne({ email });
        if (!profile) {
            return NextResponse.json({ error: "Profile not found" }, { status: 404 });
        }

        const cartIdentifier = profile.clerkId || profile._id.toString();

        // Get user's cart
        const cart = await Cart.findOne({ clerkId: cartIdentifier }).populate({
            path: "items.eventId",
            model: Event,
        });

        if (!cart || cart.items.length === 0) {
            return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
        }

        // Calculate total amount with dynamic pricing
        const totalAmount = await (async () => {
            const teams = await Team.find({ members: profile._id });
            const teamIds = teams.map(t => t._id);

            const userRegistrations = await Registration.find({
                $or: [
                    { teamId: { $in: teamIds } },
                    { selectedMembers: profile._id }
                ],
                paymentStatus: { $in: ["paid", "manual_verified"] }
            });
            const hasExistingPaidEvent = userRegistrations.length > 0;

            let total = 0;

            for (const item of cart.items) {
                const event = item.eventId as any;
                if (event.eventId === "silent-dj") {
                    total += hasExistingPaidEvent ? 150 : 180;
                } else if (event.eventId === "band-show") {
                    total += item.ticketType === "couple" ? 399 : 249;
                } else {
                    total += event.fees || 0;
                }
            }
            return { totalAmount: total, hasExistingPaidEvent };
        })();

        const { totalAmount: totalAmountValue, hasExistingPaidEvent: hasExistingPaidEventValue } = totalAmount;

        // Validation: Require proof only if amount > 0
        if (totalAmountValue > 0) {
            if (!transactionId || !screenshotUrl) {
                return NextResponse.json(
                    { error: "Transaction ID and screenshot are required for paid events" },
                    { status: 400 }
                );
            }

            // Check for duplicate transaction ID
            const existingSubmission = await PaymentSubmission.findOne({ transactionId });
            if (existingSubmission) {
                return NextResponse.json(
                    { error: "This transaction ID has already been submitted" },
                    { status: 400 }
                );
            }
        }

        // Profile already fetched above

        // Prepare events data
        const events = cart.items.map((item: any) => ({
            eventId: item.eventId._id,
            selectedMembers: item.selectedMembers,
            universityId: item.universityId,
            ticketType: item.ticketType,
            partnerName: item.partnerName,
            partnerId: item.partnerId,
            ...(item.coordinator?.name && item.coordinator?.phone
                ? { coordinator: { name: item.coordinator.name, phone: item.coordinator.phone } }
                : {}),
            ...(item.gameChoice ? { gameChoice: item.gameChoice } : {}),
        }));

        // Determine status based on amount
        const isFree = totalAmountValue === 0;
        const submissionStatus = isFree ? "verified" : "pending";
        const registrationStatus = isFree ? "paid" : "verification_pending";

        // Create payment submission
        const submission = await PaymentSubmission.create({
            clerkId: cartIdentifier,
            cartId: cart._id,
            teamId: cart.teamId,
            transactionId: isFree ? `FREE_${Date.now()}` : transactionId.trim(),
            screenshotUrl: isFree ? "FREE_EVENT" : screenshotUrl,
            totalAmount: totalAmountValue,
            events,
            status: submissionStatus,
            verifiedBy: isFree ? "SYSTEM" : undefined,
            verifiedAt: isFree ? new Date() : undefined,
            leaderEmail: profile.email,
            leaderName: profile.firstName && profile.lastName
                ? `${profile.firstName} ${profile.lastName}`
                : profile.username || profile.email,
            leaderPhone: profile.phone || "N/A",
        });

        // Create registrations for each event
        for (const item of cart.items) {
            const event = item.eventId as any;

            await Registration.findOneAndUpdate(
                {
                    eventId: event._id,
                    teamId: cart.teamId,
                },
                {
                    $set: {
                        paymentStatus: registrationStatus,
                        paymentSubmissionId: submission._id,
                        selectedMembers: item.selectedMembers,
                        universityId: item.universityId,
                        ticketType: item.ticketType,
                        partnerName: item.partnerName,
                        partnerId: item.partnerId,
                    },
                    $setOnInsert: {
                        eventId: event._id,
                        teamId: cart.teamId,
                        amountExpected: event.eventId === "silent-dj"
                            ? (hasExistingPaidEventValue ? 150 : 180)
                            : (event.eventId === "band-show"
                                ? (item.ticketType === "couple" ? 399 : 249)
                                : event.fees),
                        gameChoice: item.gameChoice,
                    },
                },
                { upsert: true, new: true }
            );
        }

        // Update profile paidEvents if free
        if (isFree) {
            const eventIds = events.map((e: any) => e.eventId.toString());
            await Profile.updateOne(
                { _id: profile._id },
                { $addToSet: { paidEvents: { $each: eventIds } } }
            );
        }

        // Clear the cart after successful submission
        await Cart.deleteOne({ clerkId: cartIdentifier });

        return NextResponse.json({
            message: isFree ? "Registration successful" : "Payment submitted for verification",
            submissionId: submission._id,
            status: submissionStatus
        });
    } catch (error) {
        console.error("Checkout POST Error:", error);
        return NextResponse.json(
            { error: "Failed to submit payment" },
            { status: 500 }
        );
    }
}

// GET - Get checkout info (cart summary + QR code data)
export async function GET() {
    try {
        let email = "";

        // Check NextAuth
        const nextSession = await nextAuth();
        if (nextSession?.user?.email) {
            email = nextSession.user.email;
        }

        if (!email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        await connectDB();

        // Get user profile
        const profile = await Profile.findOne({ email });
        if (!profile) {
            return NextResponse.json({ error: "Profile not found" }, { status: 404 });
        }

        const cartIdentifier = profile.clerkId || profile._id.toString();

        const cart = await Cart.findOne({ clerkId: cartIdentifier }).populate({
            path: "items.eventId",
            model: Event,
        });

        if (!cart || cart.items.length === 0) {
            return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
        }

        // Calculate total amount with dynamic pricing
        const totalAmount = await (async () => {
            const teams = await Team.find({ members: profile._id });
            const teamIds = teams.map(t => t._id);

            const userRegistrations = await Registration.find({
                $or: [
                    { teamId: { $in: teamIds } },
                    { selectedMembers: profile._id }
                ],
                paymentStatus: { $in: ["paid", "manual_verified"] }
            });
            const hasExistingPaidEvent = userRegistrations.length > 0;

            let total = 0;

            for (const item of cart.items) {
                const event = item.eventId as any;
                if (event.eventId === "silent-dj") {
                    total += hasExistingPaidEvent ? 150 : 180;
                } else if (event.eventId === "band-show") {
                    total += item.ticketType === "couple" ? 399 : 249;
                } else {
                    total += event.fees || 0;
                }
            }
            return { totalAmount: total, hasExistingPaidEvent };
        })();

        const { totalAmount: totalAmountValue, hasExistingPaidEvent: hasExistingPaidEventValue } = totalAmount;

        const events = cart.items.map((item: any) => {
            const event = item.eventId as any;
            let finalFee = event.fees || 0;

            // Repeat dynamic pricing logic for individual item display
            if (event.eventId === "silent-dj") {
                finalFee = hasExistingPaidEventValue ? 150 : 180;
            } else if (event.eventId === "band-show") {
                finalFee = item.ticketType === "couple" ? 399 : 249;
            }

            return {
                title: event?.title || "Unknown Event",
                fees: finalFee,
                memberCount: item.selectedMembers?.length || 1,
                universityId: item.universityId,
                ticketType: item.ticketType,
                partnerName: item.partnerName,
                partnerId: item.partnerId,
            };
        });

        // Generate UPI deep link for QR is handled in return

        return NextResponse.json({
            events,
            totalAmount: totalAmountValue,
            upiId: UPI_ID,
            upiName: UPI_NAME,
            upiLink: `upi://pay?pa=${UPI_ID}&pn=${encodeURIComponent(UPI_NAME)}&am=${totalAmountValue}&cu=INR&tn=${encodeURIComponent("RoboRumble Event Registration")}`,
            itemCount: cart.items.length,
        });
    } catch (error) {
        console.error("Checkout GET Error:", error);
        return NextResponse.json(
            { error: "Failed to get checkout info" },
            { status: 500 }
        );
    }
}
