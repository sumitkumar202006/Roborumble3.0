"use client";

import { useState, useEffect } from "react";
import { 
    MessageSquare, 
    Lock, 
    Unlock, 
    ChevronRight, 
    Search,
    Users,
    Trophy,
    Bot,
    Gamepad2,
    Plane,
    Lightbulb
} from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

interface Channel {
    channelId: string;
    eventId: string;
    name: string;
    eventTitle: string;
    eventSlug: string;
    category: string;
    postCount: number;
    isLocked: boolean;
}

const CATEGORY_ICONS: Record<string, any> = {
    "Robotics": Bot,
    "Esports": Gamepad2,
    "Aerial": Plane,
    "Gaming": Gamepad2,
    "Innovation": Lightbulb,
    "Seminar": Users,
};

export default function CommunitiesPage() {
    const [channels, setChannels] = useState<Channel[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        fetchChannels();
    }, []);

    async function fetchChannels() {
        try {
            const res = await fetch("/api/user/channels");
            if (res.ok) {
                const data = await res.json();
                setChannels(data.channels || []);
            }
        } catch (err) {
            console.error("Error fetching channels:", err);
        } finally {
            setLoading(false);
        }
    }

    const filteredChannels = channels.filter(c => 
        c.eventTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500"></div>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto p-4 md:p-6">
            <header className="mb-10 text-center md:text-left">
                <h1 className="text-4xl font-black text-white tracking-tighter uppercase flex items-center justify-center md:justify-start gap-4 mb-2">
                    <MessageSquare size={36} className="text-cyan-400" />
                    Event Communities
                </h1>
                <p className="text-gray-400 max-w-2xl">
                    Join the discussion for each event. Exclusive access for registered participants.
                </p>
            </header>

            <div className="relative mb-8">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
                <input
                    type="text"
                    placeholder="Search for an event community..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-gray-900/50 border border-gray-800 rounded-2xl py-4 pl-12 pr-6 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all placeholder:text-gray-600"
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredChannels.length === 0 ? (
                    <div className="col-span-full py-20 text-center bg-gray-900/20 rounded-3xl border border-gray-800 border-dashed">
                        <MessageSquare size={48} className="text-gray-700 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-gray-500">No communities found</h3>
                        <p className="text-gray-600">Try a different search term or check back later.</p>
                    </div>
                ) : (
                    filteredChannels.map((channel, index) => {
                        const Icon = CATEGORY_ICONS[channel.category] || Trophy;
                        return (
                            <motion.div
                                key={channel.channelId}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                            >
                                <Link 
                                    href={channel.isLocked ? "#" : `/dashboard/channels/${channel.eventId}`}
                                    className={`
                                        block group relative overflow-hidden p-6 rounded-3xl border transition-all h-full
                                        ${channel.isLocked 
                                            ? "bg-gray-900/30 border-gray-800 opacity-60 grayscale cursor-not-allowed" 
                                            : "bg-gradient-to-br from-gray-900 to-gray-800/50 border-gray-800 hover:border-cyan-500/50 hover:shadow-[0_0_30px_rgba(6,182,212,0.15)]"
                                        }
                                    `}
                                    onClick={(e) => channel.isLocked && e.preventDefault()}
                                >
                                    <div className="flex items-start justify-between mb-4">
                                        <div className={`p-3 rounded-2xl ${channel.isLocked ? "bg-gray-800" : "bg-cyan-500/10 text-cyan-400"}`}>
                                            <Icon size={24} />
                                        </div>
                                        {channel.isLocked ? (
                                            <div className="flex items-center gap-1.5 px-3 py-1 bg-red-500/10 text-red-500 rounded-full text-[10px] font-black uppercase tracking-wider border border-red-500/20">
                                                <Lock size={12} /> Locked
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-1.5 px-3 py-1 bg-green-500/10 text-green-500 rounded-full text-[10px] font-black uppercase tracking-wider border border-green-500/20">
                                                <Unlock size={12} /> Unlocked
                                            </div>
                                        )}
                                    </div>

                                    <div>
                                        <h3 className="text-xl font-bold text-white mb-2 leading-tight group-hover:text-cyan-400 transition-colors">
                                            {channel.eventTitle}
                                        </h3>
                                        <p className="text-gray-500 text-sm mb-6 line-clamp-2">
                                            {channel.name}
                                        </p>
                                    </div>

                                    <div className="mt-auto flex items-center justify-between pt-4 border-t border-gray-800/50">
                                        <div className="flex items-center gap-4 text-xs font-bold text-gray-500 uppercase tracking-widest">
                                            <span className="flex items-center gap-1.5">
                                                <MessageSquare size={14} /> {channel.postCount} Posts
                                            </span>
                                        </div>
                                        {!channel.isLocked && (
                                            <ChevronRight size={18} className="text-cyan-500 group-hover:translate-x-1 transition-transform" />
                                        )}
                                    </div>

                                    {channel.isLocked && (
                                        <div className="absolute inset-0 flex items-center justify-center backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity">
                                            <div className="bg-black/80 px-4 py-2 rounded-xl text-xs font-black text-white uppercase border border-white/10">
                                                Registration Required
                                            </div>
                                        </div>
                                    )}
                                </Link>
                            </motion.div>
                        );
                    })
                )}
            </div>
        </div>
    );
}
