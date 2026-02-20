import { NextRequest, NextResponse } from "next/server";
import { auth as nextAuth } from "@/auth";
import connectDB from "@/lib/mongodb";
import Channel from "@/app/models/Channel";
import Post from "@/app/models/Post";
import Profile from "@/app/models/Profile";
import Registration from "@/app/models/Registration";

// Helper: Verify user has access to event (paid participant)
async function verifyEventAccess(eventId: string, email: string) {
    const profile = await Profile.findOne({ email });
    if (!profile) return false;

    const registration = await Registration.findOne({
        eventId,
        selectedMembers: profile._id,
        paymentStatus: { $in: ['paid', 'manual_verified'] }
    });

    return !!registration;
}

// GET /api/channels/[eventId]/posts - List posts in channel
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ eventId: string }> }
) {
    try {
        const session = await nextAuth();
        if (!session?.user?.email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { eventId } = await params;
        await connectDB();

        // Verify access
        const hasAccess = await verifyEventAccess(eventId, session.user.email);
        if (!hasAccess) {
            return NextResponse.json(
                { error: "Access denied. Only verified participants can view this channel." },
                { status: 403 }
            );
        }

        const channel = await Channel.findOne({ eventId });
        if (!channel) {
            return NextResponse.json({ error: "Channel not found" }, { status: 404 });
        }

        // Get posts with pinned first
        const posts = await Post.find({ channelId: channel._id })
            .sort({ isPinned: -1, createdAt: -1 })
            .limit(50)
            .lean();

        return NextResponse.json({ posts });
    } catch (error) {
        console.error("Error fetching posts:", error);
        return NextResponse.json({ error: "Failed to fetch posts" }, { status: 500 });
    }
}

// POST /api/channels/[eventId]/posts - Create new post
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ eventId: string }> }
) {
    try {
        const session = await nextAuth();
        if (!session?.user?.email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { eventId } = await params;
        const { title, content } = await request.json();

        if (!title || !content) {
            return NextResponse.json(
                { error: "Title and content are required" },
                { status: 400 }
            );
        }

        await connectDB();

        // Verify access
        const hasAccess = await verifyEventAccess(eventId, session.user.email);
        if (!hasAccess) {
            return NextResponse.json(
                { error: "Access denied. Only verified participants can post." },
                { status: 403 }
            );
        }

        const channel = await Channel.findOne({ eventId });
        if (!channel) {
            return NextResponse.json({ error: "Channel not found" }, { status: 404 });
        }

        const profile = await Profile.findOne({ email: session.user.email });
        if (!profile) {
            return NextResponse.json({ error: "Complete profile details" }, { status: 404 });
        }

        // Create post with denormalized author info
        const post = await Post.create({
            channelId: channel._id,
            authorId: profile._id,
            title,
            content,
            _author: {
                name: `${profile.firstName ?? ''} ${profile.lastName ?? ''}`.trim() || profile.email,
                avatarUrl: profile.avatarUrl,
            },
        });

        // Update channel post count
        await Channel.findByIdAndUpdate(channel._id, {
            $inc: { postCount: 1 }
        });

        return NextResponse.json({ post }, { status: 201 });
    } catch (error) {
        console.error("Error creating post:", error);
        return NextResponse.json({ error: "Failed to create post" }, { status: 500 });
    }
}
