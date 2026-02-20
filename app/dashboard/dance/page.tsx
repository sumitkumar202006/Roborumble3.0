"use client";

import { useState, useEffect } from "react";

import { useSession } from "next-auth/react";
import { 
    Music, 
    Users, 
    User, 
    Zap, 
    Trophy, 
    Star, 
    Plus, 
    Trash2, 
    CheckCircle, 
    Clock, 
    AlertCircle,
    Loader2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Registration {
    _id: string;
    category: "Solo" | "Group";
    danceStyle: string;
    teamName?: string;
    members: string[];
    videoLink?: string;
    status: string;
    createdAt: string;
}

export default function DancePage() {
    const { data: session, status: sessionStatus } = useSession();
    
    const [registrations, setRegistrations] = useState<Registration[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [message, setMessage] = useState({ type: "", text: "" });

    // Form State
    const [category, setCategory] = useState<"Solo" | "Group">("Solo");
    const [danceStyle, setDanceStyle] = useState("");
    const [videoLink, setVideoLink] = useState("");
    const [teamName, setTeamName] = useState("");
    const [memberNames, setMemberNames] = useState<string[]>(["", "", ""]); // Min 3 for Group

    const isLoaded = sessionStatus !== "loading";
    const userEmail = session?.user?.email;

    useEffect(() => {
        if (isLoaded && userEmail) {
            fetchRegistrations();
        }
    }, [isLoaded, userEmail]);

    async function fetchRegistrations() {
        try {
            setLoading(true);
            const res = await fetch("/api/dance");
            if (res.ok) {
                const data = await res.json();
                setRegistrations(data.registrations || []);
            }
        } catch (error) {
            console.error("Failed to fetch registrations:", error);
        } finally {
            setLoading(false);
        }
    }

    const handleAddMember = () => {
        if (memberNames.length < 5) {
            setMemberNames([...memberNames, ""]);
        }
    };

    const handleRemoveMember = (index: number) => {
        if (memberNames.length > 3) {
            const newMembers = [...memberNames];
            newMembers.splice(index, 1);
            setMemberNames(newMembers);
        }
    };

    const handleMemberNameChange = (index: number, value: string) => {
        const newMembers = [...memberNames];
        newMembers[index] = value;
        setMemberNames(newMembers);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (registrations.length >= 3) {
            setMessage({ type: "error", text: "Maximum limit of 3 registrations reached." });
            return;
        }

        setSubmitting(true);
        setMessage({ type: "", text: "" });

        const payload = {
            category,
            danceStyle,
            videoLink,
            teamName: category === "Group" ? teamName : undefined,
            members: category === "Group" ? memberNames.filter(n => n.trim() !== "") : [session?.user?.name || "Solo Performer"]
        };

        try {
            const res = await fetch("/api/dance", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });

            const data = await res.json();

            if (res.ok) {
                setMessage({ type: "success", text: "Registration submitted successfully!" });
                fetchRegistrations();
                // Reset form
                setDanceStyle("");
                setVideoLink("");
                setTeamName("");
                setMemberNames(["", "", ""]);
            } else {
                setMessage({ type: "error", text: data.error || "Failed to submit registration." });
            }
        } catch (error) {
            setMessage({ type: "error", text: "Something went wrong. Please try again." });
        } finally {
            setSubmitting(false);
        }
    };

    if (!isLoaded) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
                <Loader2 className="animate-spin text-purple-500 mb-4" size={32} />
                <p className="text-zinc-500 font-mono text-sm">SYNCHRONIZING_DANCE_FEEDS...</p>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto py-8 px-4">
            {/* Header Section */}
            <div className="relative mb-12 overflow-hidden rounded-3xl bg-gradient-to-br from-purple-900/40 via-blue-900/40 to-black border border-white/10 p-8 md:p-12">
                <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-64 h-64 bg-purple-500/20 blur-[80px] rounded-full" />
                <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/2 w-64 h-64 bg-blue-500/20 blur-[80px] rounded-full" />
                
                <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
                    <div className="w-20 h-20 bg-gradient-to-tr from-purple-500 to-blue-500 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-500/20">
                        <Music className="text-white" size={40} />
                    </div>
                    <div>
                        <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter mb-2">
                            STREET <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">DANCE BATTLE</span>
                        </h1>
                        <p className="text-zinc-400 font-mono text-sm max-w-xl">
                            Hit the streets and own the stage. Solo artists or group crews — bring your raw energy and compete for the ultimate title.
                            Live audition voting enabled.
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-12">
                    {[
                        { icon: Star, label: "Any Style", color: "text-amber-400" },
                        { icon: Clock, label: "4–5 Mins", color: "text-blue-400" },
                        { icon: Trophy, label: "Live Voting", color: "text-purple-400" },
                        { icon: Zap, label: "Instant Results", color: "text-cyan-400" },
                    ].map((item, i) => (
                        <div key={i} className="flex items-center gap-3 bg-white/5 backdrop-blur-sm border border-white/5 rounded-xl p-3">
                            <item.icon className={item.color} size={18} />
                            <span className="text-xs font-bold text-white uppercase tracking-tight">{item.label}</span>
                        </div>
                    ))}
                </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
                {/* Left: Registration Form */}
                <div className="lg:col-span-1">
                    <div className="bg-[#111] border border-white/10 rounded-2xl p-6 sticky top-8">
                        <h2 className="text-xl font-black text-white mb-6 uppercase tracking-tight flex items-center gap-2">
                            <Plus className="text-purple-400" size={20} /> New Participation
                        </h2>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Category Selection */}
                            <div className="grid grid-cols-2 gap-2">
                                {(["Solo", "Group"] as const).map((cat) => (
                                    <button
                                        key={cat}
                                        type="button"
                                        onClick={() => setCategory(cat)}
                                        className={`py-3 rounded-xl font-bold font-mono text-xs uppercase transition-all border ${
                                            category === cat
                                                ? "bg-purple-500/10 border-purple-500 text-purple-400"
                                                : "bg-zinc-900 border-zinc-800 text-zinc-500 hover:border-zinc-700"
                                        }`}
                                    >
                                        <div className="flex items-center justify-center gap-2">
                                            {cat === "Solo" ? <User size={14} /> : <Users size={14} />}
                                            {cat}
                                        </div>
                                    </button>
                                ))}
                            </div>

                            {/* Dance Style */}
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest block">Dance Style</label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="Hip-hop, Freestyle, Fusion..."
                                        value={danceStyle}
                                        onChange={(e) => setDanceStyle(e.target.value)}
                                        className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-white text-sm font-mono focus:border-purple-500 outline-none transition-all"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest block">Video Link (YouTube/Drive)</label>
                                    <input
                                        type="url"
                                        required
                                        placeholder="https://youtu.be/..."
                                        value={videoLink}
                                        onChange={(e) => setVideoLink(e.target.value)}
                                        className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-white text-sm font-mono focus:border-purple-500 outline-none transition-all"
                                    />
                                </div>
                            </div>

                            {category === "Group" && (
                                <AnimatePresence>
                                    <motion.div
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="space-y-6"
                                    >
                                        <div className="space-y-2">
                                            <label className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest block">Team Name</label>
                                            <input
                                                type="text"
                                                required
                                                placeholder="Elite Squad"
                                                value={teamName}
                                                onChange={(e) => setTeamName(e.target.value)}
                                                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-white text-sm font-mono focus:border-purple-500 outline-none transition-all"
                                            />
                                        </div>

                                        <div className="space-y-3">
                                            <div className="flex items-center justify-between">
                                                <label className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest block">Members (3-5)</label>
                                                <button
                                                    type="button"
                                                    onClick={handleAddMember}
                                                    disabled={memberNames.length >= 5}
                                                    className="text-[10px] text-purple-400 uppercase font-bold hover:text-white disabled:text-zinc-600 transition-colors"
                                                >
                                                    + Add
                                                </button>
                                            </div>
                                            <div className="space-y-2">
                                                {memberNames.map((name, index) => (
                                                    <div key={index} className="flex gap-2">
                                                        <input
                                                            type="text"
                                                            required
                                                            placeholder={`Member ${index + 1} Name`}
                                                            value={name}
                                                            onChange={(e) => handleMemberNameChange(index, e.target.value)}
                                                            className="flex-1 bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-white text-sm font-mono focus:border-purple-500 outline-none transition-all"
                                                        />
                                                        {memberNames.length > 3 && (
                                                            <button
                                                                type="button"
                                                                onClick={() => handleRemoveMember(index)}
                                                                className="p-3 bg-red-500/10 text-red-400 rounded-xl border border-red-500/20 hover:bg-red-500/20 transition-all"
                                                            >
                                                                <Trash2 size={16} />
                                                            </button>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </motion.div>
                                </AnimatePresence>
                            )}

                            {message.text && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className={`p-3 rounded-xl text-xs font-mono flex items-center gap-2 border ${
                                        message.type === "success" 
                                            ? "bg-green-500/10 border-green-500/20 text-green-400" 
                                            : "bg-red-500/10 border-red-500/20 text-red-400"
                                    }`}
                                >
                                    {message.type === "success" ? <CheckCircle size={14} /> : <AlertCircle size={14} />}
                                    {message.text}
                                </motion.div>
                            )}

                            <button
                                type="submit"
                                disabled={submitting || registrations.length >= 3}
                                className="w-full py-4 bg-gradient-to-r from-purple-500 to-blue-500 text-white font-black uppercase text-xs rounded-xl hover:shadow-[0_0_20px_rgba(139,92,246,0.3)] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {submitting ? <Loader2 size={16} className="animate-spin" /> : <Zap size={16} />}
                                {registrations.length >= 3 ? "Limit Reached" : "Enroll Now"}
                            </button>
                        </form>
                    </div>
                </div>

                {/* Right: My Registrations */}
                <div className="lg:col-span-2 space-y-6">
                    <h2 className="text-xl font-black text-white uppercase tracking-tight flex items-center gap-2 px-2">
                        <Star className="text-amber-400" size={20} /> My Performances
                    </h2>

                    {loading ? (
                        <div className="space-y-4">
                            {[1, 2].map((i) => (
                                <div key={i} className="h-32 bg-white/5 border border-white/5 rounded-2xl animate-pulse" />
                            ))}
                        </div>
                    ) : registrations.length === 0 ? (
                        <div className="bg-[#111] border border-dashed border-white/10 rounded-2xl p-12 text-center">
                            <Music size={48} className="mx-auto text-zinc-700 mb-4" />
                            <h3 className="text-white font-bold uppercase mb-2">No Registrations Yet</h3>
                            <p className="text-zinc-510 text-xs font-mono">Fill out the form to start your dance journey.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {registrations.map((reg) => (
                                <motion.div
                                    key={reg._id}
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="group bg-[#111] border border-white/10 rounded-2xl p-6 hover:border-purple-500/30 transition-all flex flex-col md:flex-row md:items-center justify-between gap-6"
                                >
                                    <div className="flex gap-6 items-center">
                                        <div className={`w-14 h-14 rounded-xl flex items-center justify-center border transition-colors ${
                                            reg.category === "Solo" 
                                                ? "bg-blue-500/10 border-blue-500/20 text-blue-400" 
                                                : "bg-purple-500/10 border-purple-500/20 text-purple-400"
                                        }`}>
                                            {reg.category === "Solo" ? <User size={24} /> : <Users size={24} />}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-tighter border ${
                                                    reg.category === "Solo" 
                                                        ? "bg-blue-500/10 border-blue-500/20 text-blue-400" 
                                                        : "bg-purple-500/10 border-purple-500/20 text-purple-400"
                                                }`}>
                                                    {reg.category}
                                                </span>
                                                <span className="text-[10px] text-zinc-500 font-mono">
                                                    {new Date(reg.createdAt).toLocaleDateString()}
                                                </span>
                                            </div>
                                            <h3 className="text-xl font-bold text-white uppercase group-hover:text-purple-400 transition-colors">
                                                {reg.category === "Group" ? reg.teamName : reg.danceStyle}
                                            </h3>
                                            <p className="text-zinc-510 text-xs font-mono">
                                                Style: {reg.danceStyle} • {reg.members.length} member{reg.members.length !== 1 ? 's' : ''}
                                            </p>
                                            {reg.videoLink && (
                                                <a 
                                                    href={reg.videoLink} 
                                                    target="_blank" 
                                                    rel="noopener noreferrer"
                                                    className="text-[10px] text-purple-400 hover:text-purple-300 font-mono flex items-center gap-1 mt-1 transition-colors"
                                                >
                                                    <Zap size={10} /> Watch Performance Video
                                                </a>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4">
                                        <div className="text-right hidden md:block">
                                            <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest mb-1">Status</p>
                                            <div className="flex items-center gap-2 justify-end">
                                                <div className={`w-2 h-2 rounded-full animate-pulse ${
                                                    reg.status === 'pending' ? 'bg-amber-500' : 'bg-green-500'
                                                }`} />
                                                <span className={`text-xs font-bold uppercase font-mono ${
                                                    reg.status === 'pending' ? 'text-amber-400' : 'text-green-400'
                                                }`}>
                                                    {reg.status}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="w-10 h-10 rounded-full border border-white/5 bg-white/5 flex items-center justify-center text-zinc-700 group-hover:text-purple-400 group-hover:border-purple-500/30 transition-all">
                                            <Trophy size={18} />
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}

                    {/* Prize Disclaimer Section */}
                    <div className="bg-gradient-to-r from-amber-500/10 to-transparent border-l-4 border-amber-500 p-6 rounded-r-2xl">
                        <div className="flex items-start gap-4">
                            <Trophy className="text-amber-500 shrink-0" size={24} />
                            <div>
                                <h4 className="text-white font-black uppercase text-sm mb-1">Prize Pool Information</h4>
                                <p className="text-zinc-400 text-xs leading-relaxed font-mono">
                                    🥇 Individual & Group Winners will receive exclusive Gift Hampers. 
                                    Top competitors will be finalized through LIVE audition voting. Instant results verified by judges.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

