import { NextRequest, NextResponse } from "next/server";
import { auth as nextAuth } from "@/auth";
import connectDB from "@/lib/mongodb";
import Post from "@/app/models/Post";
import Profile from "@/app/models/Profile";

// POST /api/posts/[postId]/react - Toggle reaction on a post
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ postId: string }> }
) {
    try {
        const session = await nextAuth();
        if (!session?.user?.email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { postId } = await params;
        const { reactionType } = await request.json();

        // Validate reaction type
        const validReactions = ['👍', '👎', '❤️', '🎉', '😮'];
        if (!validReactions.includes(reactionType)) {
            return NextResponse.json(
                { error: "Invalid reaction type" },
                { status: 400 }
            );
        }

        await connectDB();

        const profile = await Profile.findOne({ email: session.user.email });
        if (!profile) {
            return NextResponse.json({ error: "Complete profile details" }, { status: 404 });
        }

        const post = await Post.findById(postId);
        if (!post) {
            return NextResponse.json({ error: "Post not found" }, { status: 404 });
        }

        // Check if user already reacted with this type
        const existingReaction = post.reactions.find(
            r => r.userId.toString() === profile._id.toString() && r.type === reactionType
        );

        if (existingReaction) {
            // Remove reaction (toggle off)
            await Post.findByIdAndUpdate(postId, {
                $pull: { reactions: { userId: profile._id, type: reactionType } }
            });
            return NextResponse.json({ action: 'removed' });
        } else {
            // Add reaction
            await Post.findByIdAndUpdate(postId, {
                $push: { reactions: { type: reactionType, userId: profile._id } }
            });
            return NextResponse.json({ action: 'added' });
        }
    } catch (error) {
        console.error("Error toggling reaction:", error);
        return NextResponse.json({ error: "Failed to toggle reaction" }, { status: 500 });
    }
}
