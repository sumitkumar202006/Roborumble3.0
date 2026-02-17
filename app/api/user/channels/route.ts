import { NextRequest, NextResponse } from "next/server";
import { auth as clerkAuth, currentUser } from "@clerk/nextjs/server";
import { auth as nextAuth } from "@/auth";
import connectDB from "@/lib/mongodb";
import Event from "@/app/models/Event";
import Channel from "@/app/models/Channel";
import Registration from "@/app/models/Registration";
import Profile from "@/app/models/Profile";

// GET /api/user/channels - Get all event channels with access status for current user
export async function GET(request: NextRequest) {
    try {
        let email = "";

        // 1. Check Clerk
        const clerkSession = await clerkAuth();
        if (clerkSession?.userId) {
            const user = await currentUser();
            email = user?.emailAddresses?.[0]?.emailAddress || "";
        } 
        // 2. Check NextAuth
        else {
            const nextSession = await nextAuth();
            if (nextSession?.user?.email) {
                email = nextSession.user.email;
            }
        }

        if (!email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        await connectDB();

        // Get user profile by email (unified identifier)
        const profile = await Profile.findOne({ email });
        
        if (!profile) {
            return NextResponse.json({ error: "Complete profile details" }, { status: 404 });
        }

        // Get all active events with their channels
        const events = await Event.find({ isLive: true })
            .select('_id title slug category')
            .lean();

        // Get channels for these events
        const eventIds = events.map(e => e._id);
        const channels = await Channel.find({ eventId: { $in: eventIds }, isActive: true })
            .lean();

        // Get user's paid registrations
        const paidRegistrations = await Registration.find({
            selectedMembers: profile._id,
            paymentStatus: { $in: ['paid', 'manual_verified'] }
        }).select('eventId').lean();

        const paidEventIds = new Set(paidRegistrations.map(r => r.eventId.toString()));

        // Build response with access status
        const channelsWithAccess = channels.map(channel => {
            const event = events.find(e => e._id.toString() === channel.eventId.toString());
            const hasAccess = paidEventIds.has(channel.eventId.toString());

            return {
                channelId: channel._id,
                eventId: channel.eventId,
                name: channel.name,
                eventTitle: event?.title ?? 'Unknown Event',
                eventSlug: event?.slug ?? '',
                category: event?.category ?? '',
                postCount: channel.postCount,
                isLocked: !hasAccess,  // Locked if user hasn't paid
            };
        });

        // Sort: unlocked first, then by event title
        channelsWithAccess.sort((a, b) => {
            if (a.isLocked !== b.isLocked) return a.isLocked ? 1 : -1;
            return a.eventTitle.localeCompare(b.eventTitle);
        });

        return NextResponse.json({ channels: channelsWithAccess });
    } catch (error) {
        console.error("Error fetching user channels:", error);
        return NextResponse.json({ error: "Failed to fetch channels" }, { status: 500 });
    }
}
