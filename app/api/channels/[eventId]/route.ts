import { NextRequest, NextResponse } from "next/server";
import { auth as nextAuth } from "@/auth";
import connectDB from "@/lib/mongodb";
import Channel from "@/app/models/Channel";
import Event from "@/app/models/Event";

// GET /api/channels/[eventId]
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ eventId: string }> }
) {
    try {
        const session = await nextAuth();
        if (!session?.user?.email) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const { eventId } = await params;
        await connectDB();

        const channel = await Channel.findOne({ eventId }).populate({
            path: "eventId",
            model: Event,
            select: "whatsappGroupLink discordLink title registrationDeadline"
        });

        if (!channel) {
            return NextResponse.json(
                { error: "Channel not found" },
                { status: 404 }
            );
        }

        return NextResponse.json(channel);
    } catch (error) {
        console.error("Error fetching channel:", error);
        return NextResponse.json(
            { error: "Failed to fetch channel" },
            { status: 500 }
        );
    }
}
