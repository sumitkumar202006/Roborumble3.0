import { NextResponse } from "next/server";
import { auth as nextAuth } from "@/auth";
import mongoose from "mongoose";
import connectDB from "@/lib/mongodb";
import Cart from "@/app/models/Cart";
import Event from "@/app/models/Event";
import Profile from "@/app/models/Profile";
import Team from "@/app/models/Team";
import Registration from "@/app/models/Registration";

// GET - Fetch current user's cart
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

        const profile = await Profile.findOne({ email });
        if (!profile) {
            return NextResponse.json({ error: "Profile not found" }, { status: 404 });
        }

        const cartIdentifier = profile.clerkId || profile._id.toString();

        const cart = await Cart.findOne({ clerkId: cartIdentifier })
            .populate({
                path: "items.eventId",
                model: Event,
            })
            .populate({
                path: "items.selectedMembers",
                model: Profile,
                select: "username email clerkId",
            })
            .populate({
                path: "teamId",
                model: Team,
                select: "name",
            });

        if (!cart) {
            return NextResponse.json({
                items: [],
                itemCount: 0,
                totalAmount: 0
            });
        }

        // Calculate total amount
        const totalAmount = cart.items.reduce((total, item) => {
            const event = item.eventId as any;
            return total + (event?.fees || 0);
        }, 0);

        return NextResponse.json({
            items: cart.items.map((item: any) => ({
                ...item.toObject(),
                quantity: 1
            })),
            teamId: cart.teamId,
            itemCount: cart.items.length,
            totalAmount,
            expiresAt: cart.expiresAt,
        });
    } catch (error) {
        console.error("Cart GET Error:", error);
        return NextResponse.json({ error: "Failed to fetch cart" }, { status: 500 });
    }
}

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

        const { eventId, teamId, selectedMembers } = await req.json();

        if (!eventId) {
            return NextResponse.json({ error: "Event ID is required" }, { status: 400 });
        }

        await connectDB();

        // Get user profile
        const profile = await Profile.findOne({ email });
        if (!profile) {
            return NextResponse.json({ error: "Profile not found" }, { status: 404 });
        }
        const userClerkId = profile.clerkId;

        // Get event details
        const event = await Event.findOne({ eventId });
        if (!event) {
            return NextResponse.json({ error: "Event not found" }, { status: 404 });
        }

        // Check if already registered for this event
        const existingReg = await Registration.findOne({
            eventId: event._id,
            $or: [
                ...(teamId ? [{ teamId: teamId }] : []),
                { selectedMembers: profile._id }
            ],
            paymentStatus: { $in: ["paid", "manual_verified", "pending", "verification_pending"] }
        });

        if (existingReg) {
            return NextResponse.json({ error: "Already registered for this event" }, { status: 400 });
        }

        // Validate team and members if team event
        if (teamId && selectedMembers?.length > 0) {
            const team = await Team.findById(teamId);
            if (!team) {
                return NextResponse.json({ error: "Team not found" }, { status: 404 });
            }

            // Verify user is team leader
            if (team.leaderId.toString() !== profile._id.toString()) {
                return NextResponse.json({ error: "Only team leader can add team events to cart" }, { status: 403 });
            }

            // Validate selected members are in team
            const validMemberIds = team.members.map((m: mongoose.Types.ObjectId) => m.toString());
            const allValid = selectedMembers.every((m: string) => validMemberIds.includes(m));
            if (!allValid) {
                return NextResponse.json({ error: "Some selected members are not in your team" }, { status: 400 });
            }

            // Validate team size
            if (selectedMembers.length < event.minTeamSize || selectedMembers.length > event.maxTeamSize) {
                return NextResponse.json({
                    error: `Team size must be between ${event.minTeamSize} and ${event.maxTeamSize}`
                }, { status: 400 });
            }
        }

        // Find or create cart
        const cartIdentifier = profile.clerkId || profile._id.toString();
        let cart = await Cart.findOne({ clerkId: cartIdentifier });

        if (!cart) {
            cart = new Cart({
                clerkId: cartIdentifier,
                teamId: teamId || undefined,
                items: [],
                expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
            });
        }

        // Check if event already in cart
        const eventInCart = cart.items.some(
            (item) => item.eventId.toString() === event._id.toString()
        );

        if (eventInCart) {
            return NextResponse.json({ error: "Event already in cart" }, { status: 400 });
        }

        // Add event to cart
        cart.items.push({
            eventId: event._id,
            selectedMembers: selectedMembers?.map((id: string) => new mongoose.Types.ObjectId(id)) || [profile._id],
            addedAt: new Date(),
        });

        // Update teamId if not set
        if (teamId && !cart.teamId) {
            cart.teamId = new mongoose.Types.ObjectId(teamId);
        }

        await cart.save();

        return NextResponse.json({
            message: "Added to cart",
            itemCount: cart.items.length,
            eventTitle: event.title,
        });
    } catch (error) {
        console.error("Cart POST Error:", error);
        return NextResponse.json({ error: "Failed to add to cart" }, { status: 500 });
    }
}

// DELETE - Remove event from cart
export async function DELETE(req: Request) {
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

        const { searchParams } = new URL(req.url);
        const eventId = searchParams.get("eventId");

        if (!eventId) {
            return NextResponse.json({ error: "Event ID is required" }, { status: 400 });
        }

        await connectDB();

        // Get user profile first to get clerkId
        const profile = await Profile.findOne({ email });
        if (!profile) {
            return NextResponse.json({ error: "Profile not found" }, { status: 404 });
        }
        const userClerkId = profile.clerkId;

        // Find the event
        const event = await Event.findOne({ eventId });
        if (!event) {
            return NextResponse.json({ error: "Event not found" }, { status: 404 });
        }

        // Find cart and remove item
        const cartIdentifier = profile.clerkId || profile._id.toString();
        const cart = await Cart.findOne({ clerkId: cartIdentifier });
        if (!cart) {
            return NextResponse.json({ error: "Cart not found" }, { status: 404 });
        }

        const initialLength = cart.items.length;
        cart.items = cart.items.filter(
            (item) => item.eventId.toString() !== event._id.toString()
        );

        if (cart.items.length === initialLength) {
            return NextResponse.json({ error: "Event not in cart" }, { status: 404 });
        }

        // Delete cart if empty
        if (cart.items.length === 0) {
            await Cart.deleteOne({ clerkId: cartIdentifier });
        } else {
            await cart.save();
        }

        return NextResponse.json({
            message: "Removed from cart",
            itemCount: cart.items.length,
        });
    } catch (error) {
        console.error("Cart DELETE Error:", error);
        return NextResponse.json({ error: "Failed to remove from cart" }, { status: 500 });
    }
}
