import { NextResponse } from "next/server";
import crypto from "crypto";
import { auth as nextAuth } from "@/auth";
import connectDB from "@/lib/mongodb";
import Profile from "@/app/models/Profile";
import Event from "@/app/models/Event";

// POST - Verify payment on client side
export async function POST(req: Request) {
    try {
        const body = await req.json();
        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
            eventId,
        } = body;

        if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
            return NextResponse.json(
                { message: "Missing payment verification data" },
                { status: 400 }
            );
        }

        // Verify signature
        const secret = process.env.RAZORPAY_KEY_SECRET;
        if (!secret) {
            return NextResponse.json(
                { message: "Payment system not configured" },
                { status: 500 }
            );
        }

        const expectedSignature = crypto
            .createHmac("sha256", secret)
            .update(`${razorpay_order_id}|${razorpay_payment_id}`)
            .digest("hex");

        if (razorpay_signature !== expectedSignature) {
            return NextResponse.json(
                { message: "Invalid payment signature" },
                { status: 400 }
            );
        }

        // Get user from NextAuth
        const session = await nextAuth();
        if (!session?.user?.email) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const email = session.user.email;

        await connectDB();

        // Find user profile
        const profile = await Profile.findOne({ email });
        if (!profile) {
            return NextResponse.json({ message: "Complete profile details" }, { status: 404 });
        }

        // Mark event as paid
        if (eventId) {
            const paidEvents = profile.paidEvents || [];
            if (!paidEvents.includes(eventId)) {
                await Profile.findOneAndUpdate(
                    { email },
                    {
                        $addToSet: { paidEvents: eventId, registeredEvents: eventId },
                        $set: { updatedAt: new Date() }
                    }
                );

                // Increment registration count for the event
                await Event.findOneAndUpdate(
                    { eventId },
                    { $inc: { currentRegistrations: 1 } }
                );
            }
        }

        return NextResponse.json({
            message: "Payment verified successfully",
            success: true,
        });
    } catch (error) {
        console.error("Payment verification error:", error);
        return NextResponse.json({ message: "Verification failed" }, { status: 500 });
    }
}
