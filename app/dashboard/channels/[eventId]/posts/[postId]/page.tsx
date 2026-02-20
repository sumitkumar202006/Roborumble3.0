"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import {
    MessageSquare,
    Send,
    ThumbsUp,
    ThumbsDown,
    Heart,
    PartyPopper,
    AlertCircle,
    Pin,
    Lock,
    ArrowLeft,
    User,
    MoreVertical
} from "lucide-react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";

interface Reaction {
    type: string;
    userId: string;
}

interface Comment {
    _id: string;
    content: string;
    _author: {
        name: string;
        avatarUrl?: string;
    };
    createdAt: string;
    reactions: Reaction[];
}

interface Post {
    _id: string;
    title: string;
    content: string;
    _author: {
        name: string;
        avatarUrl?: string;
    };
    createdAt: string;
    commentCount: number;
    isPinned: boolean;
    isLocked: boolean;
    reactions: Reaction[];
}

export default function PostPage() {
    const params = useParams();
    const router = useRouter();
    const { data: session } = useSession();
    const userId = session?.user?.id;
    const { eventId, postId } = params as { eventId: string; postId: string };

    const [post, setPost] = useState<Post | null>(null);
    const [comments, setComments] = useState<Comment[]>([]);
    const [loading, setLoading] = useState(true);
    const [newComment, setNewComment] = useState("");
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (!postId) return;
        fetchPostData();
    }, [postId]);

    async function fetchPostData() {
        try {
            setLoading(true);
            // In a real app we might need a dedicated single post API or filter from list
            // For now, let's re-fetch the list and find the post (not efficient but works with current API)
            // Ideally: GET /api/posts/[postId]
            // We implemented /api/posts/[postId]/comments, but maybe not just the post itself?
            // Let's check the API implementation... actually we didn't implement GET /api/posts/[postId].
            // We only implemented GET /api/channels/[eventId]/posts
            // So we have to fetch list and filter or implement new API. 
            // Fetching list is okay for MVP since we have limit 50.

            const postsRes = await fetch(`/api/channels/${eventId}/posts`);
            if (!postsRes.ok) throw new Error("Failed to load post");
            const postsData = await postsRes.json();
            const foundPost = postsData.posts.find((p: Post) => p._id === postId);

            if (foundPost) {
                setPost(foundPost);

                // Fetch comments
                const commentsRes = await fetch(`/api/posts/${postId}/comments`);
                if (commentsRes.ok) {
                    const commentsData = await commentsRes.json();
                    setComments(commentsData.comments || []);
                }
            } else {
                // Handle not found
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }

    async function handlePostReaction(type: string) {
        if (!post) return;

        // Optimistic update
        const isReacted = post.reactions.some(r => r.userId === userId && r.type === type);
        let newReactions = [...post.reactions];

        if (isReacted) {
            newReactions = newReactions.filter(r => !(r.userId === userId && r.type === type));
        } else {
            newReactions.push({ userId: userId!, type });
        }

        setPost({ ...post, reactions: newReactions });

        try {
            await fetch(`/api/posts/${postId}/react`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ reactionType: type })
            });
        } catch (err) {
            console.error(err);
            // Revert on error would go here
        }
    }

    async function handleCommentReaction(commentId: string, type: string) {
        // Optimistic update
        setComments(comments.map(c => {
            if (c._id === commentId) {
                const isReacted = c.reactions.some(r => r.userId === userId && r.type === type);
                let newReactions = [...c.reactions];

                if (isReacted) {
                    newReactions = newReactions.filter(r => !(r.userId === userId && r.type === type));
                } else {
                    newReactions.push({ userId: userId!, type });
                }
                return { ...c, reactions: newReactions };
            }
            return c;
        }));

        try {
            await fetch(`/api/comments/${commentId}/react`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ reactionType: type })
            });
        } catch (err) {
            console.error(err);
        }
    }

    async function handleSubmitComment(e: React.FormEvent) {
        e.preventDefault();
        if (!newComment.trim()) return;

        try {
            setSubmitting(true);
            const res = await fetch(`/api/posts/${postId}/comments`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ content: newComment })
            });

            if (!res.ok) throw new Error("Failed to post comment");

            const data = await res.json();
            setComments([...comments, data.comment]);
            if (post) {
                setPost({ ...post, commentCount: post.commentCount + 1 });
            }
            setNewComment("");
        } catch (err) {
            console.error(err);
            alert("Failed to submit comment");
        } finally {
            setSubmitting(false);
        }
    }

    if (loading) return <div className="p-8 text-center text-gray-500">Loading discussion...</div>;
    if (!post) return <div className="p-8 text-center text-gray-500">Post not found</div>;

    return (
        <div className="max-w-4xl mx-auto">
            <Link
                href={`/dashboard/channels/${eventId}`}
                className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors"
            >
                <ArrowLeft size={18} />
                Back to Channel
            </Link>

            {/* Main Post */}
            <div className={`
                p-6 rounded-2xl border mb-8
                ${post.isPinned
                    ? "bg-gradient-to-br from-yellow-500/10 to-transparent border-yellow-500/30"
                    : "bg-gray-900/50 border-gray-800"
                }
            `}>
                <div className="flex gap-4">
                    <div className="shrink-0 w-12 h-12 rounded-full bg-gray-800 flex items-center justify-center overflow-hidden border border-gray-700">
                        {post._author.avatarUrl ? (
                            <img src={post._author.avatarUrl} alt={post._author.name} className="w-full h-full object-cover" />
                        ) : (
                            <User size={24} className="text-gray-500" />
                        )}
                    </div>
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                            {post.isPinned && (
                                <span className="px-2 py-0.5 bg-yellow-500/20 text-yellow-400 text-[10px] font-bold uppercase rounded flex items-center gap-1">
                                    <Pin size={10} /> Pinned
                                </span>
                            )}
                            <span className="font-bold text-white">{post._author.name}</span>
                            <span className="text-gray-600 text-xs">•</span>
                            <span className="text-gray-500 text-sm">
                                {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
                            </span>
                        </div>

                        <h1 className="text-2xl font-bold text-white mb-4">{post.title}</h1>
                        <div className="text-gray-300 whitespace-pre-wrap mb-6 leading-relaxed">
                            {post.content}
                        </div>

                        {/* Reactions Bar */}
                        <div className="flex items-center gap-2 pt-4 border-t border-gray-800/50">
                            {['👍', '👎', '❤️', '🎉', '😮'].map(emoji => {
                                const count = post.reactions.filter(r => r.type === emoji).length;
                                const isUserReacted = post.reactions.some(r => r.type === emoji && r.userId === userId);

                                return (
                                    <button
                                        key={emoji}
                                        onClick={() => handlePostReaction(emoji)}
                                        className={`
                                            px-2.5 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5
                                            ${isUserReacted
                                                ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30"
                                                : "bg-gray-800/30 text-gray-400 hover:bg-gray-800 hover:text-white border border-transparent"
                                            }
                                        `}
                                    >
                                        <span>{emoji}</span>
                                        {count > 0 && <span className="text-xs opacity-80">{count}</span>}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>

            {/* Comments Section */}
            <div className="space-y-6">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <MessageSquare size={18} className="text-cyan-400" />
                    Comments ({comments.length})
                </h3>

                {/* Comment Form */}
                {post.isLocked ? (
                    <div className="p-4 bg-red-900/10 border border-red-500/20 rounded-xl flex items-center gap-3 text-red-400">
                        <Lock size={18} />
                        <p className="text-sm font-medium">This discussion has been locked by moderators.</p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmitComment} className="flex gap-4">
                        <div className="shrink-0 w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center border border-gray-700">
                            <User size={20} className="text-gray-500" />
                        </div>
                        <div className="flex-1 relative">
                            <textarea
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                                placeholder="Add to the discussion..."
                                className="w-full bg-black/30 border border-gray-800 rounded-xl px-4 py-3 text-white focus:border-cyan-500 focus:outline-none transition-colors min-h-[100px] resize-y placeholder:text-gray-600"
                                required
                            />
                            <div className="absolute bottom-3 right-3">
                                <button
                                    type="submit"
                                    disabled={submitting || !newComment.trim()}
                                    className="px-4 py-1.5 bg-cyan-500 text-black text-sm font-bold rounded-lg hover:bg-cyan-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                >
                                    {submitting ? "Posting..." : "Reply"}
                                </button>
                            </div>
                        </div>
                    </form>
                )}

                {/* Comments List */}
                <div className="space-y-4">
                    {comments.map((comment) => (
                        <div key={comment._id} className="flex gap-4 p-4 bg-gray-900/20 rounded-xl border border-gray-800/50">
                            <div className="shrink-0 w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center overflow-hidden border border-gray-700">
                                {comment._author.avatarUrl ? (
                                    <img src={comment._author.avatarUrl} alt={comment._author.name} className="w-full h-full object-cover" />
                                ) : (
                                    <User size={16} className="text-gray-500" />
                                )}
                            </div>
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="font-semibold text-gray-300 text-sm">{comment._author.name}</span>
                                    <span className="text-gray-600 text-xs">•</span>
                                    <span className="text-xs text-gray-500">
                                        {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                                    </span>
                                </div>
                                <p className="text-gray-300 text-sm whitespace-pre-wrap mb-3">{comment.content}</p>

                                {/* Comment Reactions */}
                                <div className="flex items-center gap-2">
                                    {['👍', '❤️', '🎉'].map(emoji => {
                                        const count = comment.reactions.filter(r => r.type === emoji).length;
                                        const isUserReacted = comment.reactions.some(r => r.type === emoji && r.userId === userId);

                                        if (count === 0 && !isUserReacted) return null;

                                        return (
                                            <button
                                                key={emoji}
                                                onClick={() => handleCommentReaction(comment._id, emoji)}
                                                className={`
                                                    px-1.5 py-0.5 rounded text-xs font-medium transition-all flex items-center gap-1
                                                    ${isUserReacted
                                                        ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20"
                                                        : "bg-gray-800/30 text-gray-500 hover:bg-gray-800 hover:text-gray-300 border border-transparent"
                                                    }
                                                `}
                                            >
                                                <span>{emoji}</span>
                                                {count > 0 && <span>{count}</span>}
                                            </button>
                                        );
                                    })}
                                    <button
                                        className="text-xs text-gray-600 hover:text-gray-400 transition-colors ml-1"
                                        onClick={() => {/* Show reaction picker - optional for MVP */ }}
                                    >
                                        React
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
