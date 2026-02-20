import { NextRequest, NextResponse } from "next/server";
import { auth as nextAuth } from "@/auth";
import connectDB from "@/lib/mongodb";
import Comment from "@/app/models/Comment";
import Profile from "@/app/models/Profile";

// POST /api/comments/[commentId]/react - Toggle reaction on a comment
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ commentId: string }> }
) {
    try {
        const session = await nextAuth();
        if (!session?.user?.email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { commentId } = await params;
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

        const comment = await Comment.findById(commentId);
        if (!comment) {
            return NextResponse.json({ error: "Comment not found" }, { status: 404 });
        }

        // Check if user already reacted with this type
        const existingReaction = comment.reactions.find(
            r => r.userId.toString() === profile._id.toString() && r.type === reactionType
        );

        if (existingReaction) {
            // Remove reaction (toggle off)
            await Comment.findByIdAndUpdate(commentId, {
                $pull: { reactions: { userId: profile._id, type: reactionType } }
            });
            return NextResponse.json({ action: 'removed' });
        } else {
            // Add reaction
            await Comment.findByIdAndUpdate(commentId, {
                $push: { reactions: { type: reactionType, userId: profile._id } }
            });
            return NextResponse.json({ action: 'added' });
        }
    } catch (error) {
        console.error("Error toggling reaction:", error);
        return NextResponse.json({ error: "Failed to toggle reaction" }, { status: 500 });
    }
}
