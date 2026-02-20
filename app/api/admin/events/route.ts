import { NextResponse } from "next/server";
export const dynamic = "force-dynamic";
import { auth as nextAuth } from "@/auth";
import connectDB from "@/lib/mongodb";
import Event, { generateSlug, parseTeamSize } from "@/app/models/Event";
import Profile from "@/app/models/Profile";

// GET - List all events (admin only)
export async function GET() {
    try {
        const session = await nextAuth();
        if (!session?.user?.email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        await connectDB();

        // Check if user is admin
        const profile = await Profile.findOne({ email: session.user.email });
        if (!profile || !["admin", "superadmin"].includes(profile.role)) {
            return NextResponse.json({ error: "Admin access required" }, { status: 403 });
        }

        const events = await Event.find({}).sort({ createdAt: -1 });
        return NextResponse.json({ events });
    } catch (error) {
        console.error("Admin fetch events error:", error);
        return NextResponse.json({ error: "Failed to fetch events" }, { status: 500 });
    }
}

// POST - Create new event (admin only)
export async function POST(req: Request) {
    try {
        const session = await nextAuth();
        if (!session?.user?.email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        await connectDB();

        // Check if user is admin
        const profile = await Profile.findOne({ email: session.user.email });
        if (!profile || !["admin", "superadmin"].includes(profile.role)) {
            return NextResponse.json({ error: "Admin access required" }, { status: 403 });
        }

        const body = await req.json();
// ... (omitting rules etc but keeping logic)
        const { title, category, description, teamSize, prize, rules, image, fees, maxRegistrations, registrationDeadline, isLive, whatsappGroupLink, discordLink } = body;

        const { min, max } = parseTeamSize(teamSize);
        const eventId = generateSlug(title);
        const slug = eventId;

        const event = new Event({
            eventId,
            title,
            slug,
            category,
            description,
            teamSize,
            prize,
            rules: rules || [],
            image,
            fees: fees || 0,
            minTeamSize: min,
            maxTeamSize: max,
            maxRegistrations,
            registrationDeadline: registrationDeadline ? new Date(registrationDeadline) : undefined,
            isLive: isLive !== false,
            whatsappGroupLink: whatsappGroupLink || "",
            discordLink: discordLink || "",
            createdBy: profile._id,
        });

        await event.save();
        return NextResponse.json({ message: "Event created", event }, { status: 201 });
    } catch (error) {
        console.error("Create event error:", error);
        return NextResponse.json({ error: "Failed to create event" }, { status: 500 });
    }
}

// PUT - Update event (admin only)
export async function PUT(req: Request) {
    try {
        const session = await nextAuth();
        if (!session?.user?.email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        await connectDB();

        const profile = await Profile.findOne({ email: session.user.email });
        if (!profile || !["admin", "superadmin"].includes(profile.role)) {
            return NextResponse.json({ error: "Admin access required" }, { status: 403 });
        }

        const body = await req.json();
// ...
        const { eventId, ...updates } = body;
        if (!eventId) return NextResponse.json({ error: "Event ID required" }, { status: 400 });

        if (updates.teamSize) {
            const { min, max } = parseTeamSize(updates.teamSize);
            updates.minTeamSize = min;
            updates.maxTeamSize = max;
        }

        const event = await Event.findOneAndUpdate({ eventId }, { $set: updates }, { new: true });
        if (!event) return NextResponse.json({ error: "Event not found" }, { status: 404 });

        return NextResponse.json({ message: "Event updated", event });
    } catch (error) {
        console.error("Update event error:", error);
        return NextResponse.json({ error: "Failed to update event" }, { status: 500 });
    }
}

// DELETE - Delete event (admin only)
export async function DELETE(req: Request) {
    try {
        const session = await nextAuth();
        if (!session?.user?.email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        await connectDB();

        const profile = await Profile.findOne({ email: session.user.email });
        if (!profile || !["admin", "superadmin"].includes(profile.role)) {
            return NextResponse.json({ error: "Admin access required" }, { status: 403 });
        }

        const { searchParams } = new URL(req.url);
        const eventId = searchParams.get("eventId");

        if (!eventId) {
            return NextResponse.json({ error: "Event ID required" }, { status: 400 });
        }

        const result = await Event.findOneAndDelete({ eventId });
        if (!result) {
            return NextResponse.json({ error: "Event not found" }, { status: 404 });
        }

        return NextResponse.json({ message: "Event deleted" });
    } catch (error) {
        console.error("Delete event error:", error);
        return NextResponse.json({ error: "Failed to delete event" }, { status: 500 });
    }
}
