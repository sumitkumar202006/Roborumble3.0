"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
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
    MoreVertical,
    Calendar,
    User,
    X
} from "lucide-react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";

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
    reactions: any[];
}

interface Channel {
    _id: string;
    name: string;
    description?: string;
    eventId?: {
        whatsappGroupLink?: string;
        discordLink?: string;
    };
}

export default function ChannelPage() {
    const params = useParams();
    const router = useRouter();
    const { isLoaded, userId } = useAuth();
    const eventId = params.eventId as string;

    const [channel, setChannel] = useState<Channel | null>(null);
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [showCreateModal, setShowCreateModal] = useState(false);

    // New Post Form
    const [newPostTitle, setNewPostTitle] = useState("");
    const [newPostContent, setNewPostContent] = useState("");
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (!eventId) return;
        fetchChannelData();
    }, [eventId]);

    async function fetchChannelData() {
        try {
            setLoading(true);
            // Fetch channel info
            const channelRes = await fetch(`/api/channels/${eventId}`);
            if (!channelRes.ok) throw new Error("Failed to load channel");
            const channelData = await channelRes.json();
            setChannel(channelData);

            // Fetch posts
            const postsRes = await fetch(`/api/channels/${eventId}/posts`);
            if (postsRes.status === 403) {
                setError("Access Denied: You must be a registered participant to view this channel.");
                return;
            }
            if (!postsRes.ok) throw new Error("Failed to load posts");
            const postsData = await postsRes.json();
            setPosts(postsData.posts || []);
        } catch (err) {
            console.error(err);
            setError("Failed to load channel data");
        } finally {
            setLoading(false);
        }
    }

    async function handleCreatePost(e: React.FormEvent) {
        e.preventDefault();
        if (!newPostTitle.trim() || !newPostContent.trim()) return;

        try {
            setSubmitting(true);
            const res = await fetch(`/api/channels/${eventId}/posts`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    title: newPostTitle,
                    content: newPostContent
                })
            });

            if (!res.ok) throw new Error("Failed to create post");

            const data = await res.json();
            setPosts([data.post, ...posts]);
            setShowCreateModal(false);
            setNewPostTitle("");
            setNewPostContent("");
        } catch (err) {
            console.error(err);
            alert("Failed to create post");
        } finally {
            setSubmitting(false);
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6">
                <Lock size={48} className="text-red-500 mb-4" />
                <h2 className="text-2xl font-bold text-white mb-2">Channel Locked</h2>
                <p className="text-gray-400 max-w-md">{error}</p>
                <Link href="/dashboard/events" className="mt-6 px-6 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 transition-all">
                    Register for Event
                </Link>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-black text-white tracking-tight uppercase flex items-center gap-3">
                        <MessageSquare className="text-cyan-400" />
                        {channel?.name}
                    </h1>
                    {channel?.description && (
                        <p className="text-gray-400 mt-1">{channel.description}</p>
                    )}
                </div>
                <div className="flex flex-wrap items-center gap-3">
                    {channel?.eventId?.whatsappGroupLink && (
                        <a
                            href={channel.eventId.whatsappGroupLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-4 py-2 bg-[#25D366] text-white rounded-lg font-bold text-sm uppercase flex items-center gap-2 hover:brightness-110 transition-all shadow-[0_0_15px_rgba(37,211,102,0.3)]"
                        >
                            <img src="/whatsapp-white.png" alt="WA" className="w-5 h-5 invert brightness-0" />
                            Join WhatsApp
                        </a>
                    )}
                    {channel?.eventId?.discordLink && (
                        <a
                            href={channel.eventId.discordLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-4 py-2 bg-[#5865F2] text-white rounded-lg font-bold text-sm uppercase flex items-center gap-2 hover:brightness-110 transition-all shadow-[0_0_15px_rgba(88,101,242,0.3)]"
                        >
                            <img src="/discord-white.png" alt="DC" className="w-5 h-5 invert brightness-0" />
                            Join Discord
                        </a>
                    )}
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-xl font-bold uppercase tracking-wide hover:shadow-[0_0_20px_rgba(6,182,212,0.5)] transition-all flex items-center gap-2"
                    >
                        <Send size={18} />
                        New Discussion
                    </button>
                </div>
            </div>

            {/* Posts List */}
            <div className="space-y-4">
                {posts.length === 0 ? (
                    <div className="text-center py-20 bg-gray-900/30 rounded-2xl border border-gray-800 border-dashed">
                        <MessageSquare size={48} className="text-gray-700 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-gray-400 mb-2">No discussions yet</h3>
                        <p className="text-gray-500">Be the first to start a conversation!</p>
                    </div>
                ) : (
                    posts.map((post) => (
                        <Link href={`/dashboard/channels/${eventId}/posts/${post._id}`} key={post._id}>
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                whileHover={{ scale: 1.01 }}
                                className={`
                                    p-6 rounded-2xl border transition-all cursor-pointer relative overflow-hidden group
                                    ${post.isPinned
                                        ? "bg-gradient-to-br from-yellow-500/10 to-transparent border-yellow-500/30 hover:border-yellow-500/50"
                                        : "bg-gray-900/50 border-gray-800 hover:bg-gray-800/50 hover:border-gray-700"
                                    }
                                `}
                            >
                                <div className="flex items-start gap-4">
                                    {/* Author Avatar/Icon */}
                                    <div className="shrink-0 w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center overflow-hidden border border-gray-700">
                                        {post._author.avatarUrl ? (
                                            <img src={post._author.avatarUrl} alt={post._author.name} className="w-full h-full object-cover" />
                                        ) : (
                                            <User size={20} className="text-gray-500" />
                                        )}
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            {post.isPinned && (
                                                <span className="px-2 py-0.5 bg-yellow-500/20 text-yellow-400 text-[10px] font-bold uppercase rounded flex items-center gap-1">
                                                    <Pin size={10} /> Pinned
                                                </span>
                                            )}
                                            <span className="text-sm font-semibold text-gray-300 hover:text-white transition-colors">
                                                {post._author.name}
                                            </span>
                                            <span className="text-gray-600 text-xs">•</span>
                                            <span className="text-xs text-gray-500">
                                                {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
                                            </span>
                                        </div>

                                        <h3 className="text-lg font-bold text-white mb-2 group-hover:text-cyan-400 transition-colors line-clamp-1">
                                            {post.title}
                                        </h3>
                                        <p className="text-gray-400 text-sm line-clamp-2 mb-4">
                                            {post.content}
                                        </p>

                                        <div className="flex items-center gap-4 text-xs font-medium text-gray-500">
                                            <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-gray-800/50">
                                                <MessageSquare size={14} />
                                                {post.commentCount} comments
                                            </div>
                                            {post.reactions && post.reactions.length > 0 && (
                                                <div className="flex items-center gap-1">
                                                    <span>{post.reactions.length} reactions</span>
                                                </div>
                                            )}
                                            {post.isLocked && (
                                                <span className="flex items-center gap-1 text-red-400">
                                                    <Lock size={12} /> Locked
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        </Link>
                    ))
                )}
            </div>

            {/* Create Post Modal */}
            <AnimatePresence>
                {showCreateModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowCreateModal(false)}
                            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="relative w-full max-w-lg bg-gray-900 border border-gray-800 rounded-2xl p-6 shadow-2xl"
                        >
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-xl font-bold text-white">New Discussion</h3>
                                <button onClick={() => setShowCreateModal(false)} className="text-gray-500 hover:text-white">
                                    <X size={20} />
                                </button>
                            </div>

                            <form onSubmit={handleCreatePost} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-1">Title</label>
                                    <input
                                        type="text"
                                        value={newPostTitle}
                                        onChange={(e) => setNewPostTitle(e.target.value)}
                                        className="w-full bg-black/50 border border-gray-800 rounded-xl px-4 py-3 text-white focus:border-cyan-500 focus:outline-none transition-colors placeholder:text-gray-700"
                                        placeholder="What's on your mind?"
                                        required
                                        maxLength={200}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-1">Content</label>
                                    <textarea
                                        value={newPostContent}
                                        onChange={(e) => setNewPostContent(e.target.value)}
                                        className="w-full bg-black/50 border border-gray-800 rounded-xl px-4 py-3 text-white focus:border-cyan-500 focus:outline-none transition-colors h-40 resize-none placeholder:text-gray-700 custom-scrollbar"
                                        placeholder="Elaborate on your topic..."
                                        required
                                        maxLength={5000}
                                    />
                                </div>
                                <div className="flex justify-end gap-3 pt-2">
                                    <button
                                        type="button"
                                        onClick={() => setShowCreateModal(false)}
                                        className="px-4 py-2 text-gray-400 hover:text-white font-medium"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={submitting}
                                        className="px-6 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg font-bold disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                    >
                                        {submitting ? (
                                            <>
                                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                Publishing...
                                            </>
                                        ) : (
                                            <>
                                                <Send size={16} />
                                                Publish Post
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}

// Add these utility functions/components if not present, or import them
// Assuming X icon is available from lucide-react, imported above.
