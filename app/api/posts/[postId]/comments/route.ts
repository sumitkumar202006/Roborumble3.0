import { NextRequest, NextResponse } from "next/server";
import { auth as nextAuth } from "@/auth";
import connectDB from "@/lib/mongodb";
import Post from "@/app/models/Post";
import Comment from "@/app/models/Comment";
import Profile from "@/app/models/Profile";

// GET /api/posts/[postId]/comments - Get all comments for a post
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ postId: string }> }
) {
    try {
        const session = await nextAuth();
        if (!session?.user?.email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { postId } = await params;
        await connectDB();

        const comments = await Comment.find({ postId })
            .sort({ createdAt: 1 })  // Chronological order
            .lean();

        return NextResponse.json({ comments });
    } catch (error) {
        console.error("Error fetching comments:", error);
        return NextResponse.json({ error: "Failed to fetch comments" }, { status: 500 });
    }
}

// POST /api/posts/[postId]/comments - Create a comment
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
        const { content } = await request.json();

        if (!content) {
            return NextResponse.json({ error: "Content is required" }, { status: 400 });
        }

        await connectDB();

        const post = await Post.findById(postId);
        if (!post) {
            return NextResponse.json({ error: "Post not found" }, { status: 404 });
        }

        if (post.isLocked) {
            return NextResponse.json(
                { error: "This post is locked and not accepting new comments" },
                { status: 403 }
            );
        }

        const profile = await Profile.findOne({ email: session.user.email });
        if (!profile) {
            return NextResponse.json({ error: "Complete profile details" }, { status: 404 });
        }

        // Create comment with denormalized author info
        const comment = await Comment.create({
            postId,
            authorId: profile._id,
            content,
            _author: {
                name: `${profile.firstName ?? ''} ${profile.lastName ?? ''}`.trim() || profile.email,
                avatarUrl: profile.avatarUrl,
            },
        });

        // Update post comment count
        await Post.findByIdAndUpdate(postId, {
            $inc: { commentCount: 1 }
        });

        return NextResponse.json({ comment }, { status: 201 });
    } catch (error) {
        console.error("Error creating comment:", error);
        return NextResponse.json({ error: "Failed to create comment" }, { status: 500 });
    }
}
