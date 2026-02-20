import { NextRequest, NextResponse } from "next/server";
import { auth as nextAuth } from "@/auth";
import connectDB from "@/lib/mongodb";
import Event from "@/app/models/Event";
import Channel from "@/app/models/Channel";
import Registration from "@/app/models/Registration";
import DanceRegistration from "@/app/models/DanceRegistration";
import Profile from "@/app/models/Profile";

// GET /api/user/channels - Get all event channels with access status for current user
export async function GET(request: NextRequest) {
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

        // Get user profile by email (unified identifier)
        const profile = await Profile.findOne({ email: email.toLowerCase() });

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

        // Get user's paid registrations (Hybrid: Individual + Team)
        const Team = (await import("@/app/models/Team")).default;
        const teams = await Team.find({ members: profile._id });
        const teamIds = teams.map(t => t._id);

        const paidRegistrations = await Registration.find({
            $or: [
                { selectedMembers: profile._id },
                { teamId: { $in: teamIds } }
            ],
            paymentStatus: { $in: ['paid', 'manual_verified'] }
        }).select('eventId').lean();

        const paidEventIds = new Set(paidRegistrations.map(r => r.eventId.toString()));

        // Get user's dance registrations (always treated as "paid" for community access)
        const danceRegistrations = await DanceRegistration.find({
            profileId: profile._id
        }).select('_id').lean();

        const hasDanceAccess = danceRegistrations.length > 0;

        // Build response with access status
        const channelsWithAccess = channels.map(channel => {
            const event = events.find(e => e._id.toString() === channel.eventId.toString());

            let hasAccess = paidEventIds.has(channel.eventId.toString());

            // Special check for Dance Battle channel
            if (event?.slug === 'dance-performance') {
                hasAccess = hasDanceAccess;
            }

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
