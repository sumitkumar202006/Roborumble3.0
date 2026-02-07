"use client";

import { useState, useEffect } from "react";
import MatrixBackground from "../../components/MatrixBackground";
import { Shield, Plus, Trash2, Megaphone, AlertTriangle, Info } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

type Announcement = {
    id: string;
    title: string;
    message: string;
    type: string;
    date: string;
};

export default function AdminAnnouncementsPage() {
    const [announcements, setAnnouncements] = useState<Announcement[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState("");
    const { user } = useAuth(); // Ensure auth context is loaded

    // New Announcement Form
    const [form, setForm] = useState({
        title: "",
        message: "",
        type: "info"
    });

    const fetchAnnouncements = async () => {
        try {
            const res = await fetch("/api/announcements");
            if (res.ok) {
                const data = await res.json();
                setAnnouncements(data);
            }
        } catch (err) {
            console.error("Failed to fetch announcements");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchAnnouncements();
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError("");

        try {
            const res = await fetch("/api/announcements", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form)
            });

            if (!res.ok) throw new Error("Failed to post announcement");

            await fetchAnnouncements();
            setForm({ title: "", message: "", type: "info" }); // Reset form
        } catch (err) {
            setError("Failed to post announcement");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Confirm deletion of announcement protocol?")) return;
        
        try {
            const res = await fetch(`/api/announcements?id=${id}`, { method: "DELETE" });
            if (res.ok) {
                setAnnouncements(prev => prev.filter(a => a.id !== id));
            }
        } catch (err) {
            alert("Error removing announcement");
        }
    };

    return (
        <main className="min-h-screen bg-black text-white relative">
            <MatrixBackground color="#FF003C" text="" />
            
            <div className="relative z-10 p-4 md:p-8 ml-0 md:ml-64 transition-all duration-300">
                
                {/* Header */}
                <div className="flex items-center gap-4 mb-8">
                    <div className="p-3 bg-[#FF003C]/10 border border-[#FF003C] rounded-lg">
                        <Megaphone className="text-[#FF003C]" size={24} />
                    </div>
                    <div>
                        <h1 className="text-2xl md:text-3xl font-black font-mono uppercase tracking-tighter">
                            System_Broadcasts
                        </h1>
                        <p className="text-zinc-500 font-mono text-xs uppercase tracking-widest">
                            Global Announcement Protocols
                        </p>
                    </div>
                </div>

                {/* Create Section */}
                <div className="mb-12 border border-[#FF003C]/30 bg-black/50 backdrop-blur-sm p-6 relative">
                     <div className="absolute -top-3 left-4 bg-[#FF003C] text-black text-[10px] font-black px-2 uppercase">
                        New_Broadcast
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4 mt-2">
                        <div className="grid md:grid-cols-2 gap-4">
                            <input 
                                required
                                name="title"
                                value={form.title}
                                onChange={handleChange}
                                placeholder="Broadcast Header / Title"
                                className="bg-black/50 border border-zinc-700 p-3 text-sm font-mono text-white focus:border-[#FF003C] outline-none"
                            />
                            <select 
                                name="type"
                                value={form.type}
                                onChange={handleChange}
                                className="bg-black/50 border border-zinc-700 p-3 text-sm font-mono text-white focus:border-[#FF003C] outline-none uppercase"
                            >
                                <option value="info">Info_Protocol</option>
                                <option value="alert">Alert_Protocol</option>
                                <option value="warning">Warning_Protocol</option>
                            </select>
                        </div>
                        <textarea 
                            required
                            name="message"
                            value={form.message}
                            onChange={handleChange}
                            placeholder="Broadcast Message Content..."
                            rows={3}
                            className="w-full bg-black/50 border border-zinc-700 p-3 text-sm font-mono text-white focus:border-[#FF003C] outline-none"
                        />
                        
                        {error && <p className="text-red-500 text-xs font-mono">{error}</p>}

                        <button 
                            disabled={isSubmitting}
                            className="bg-[#FF003C] hover:bg-white hover:text-black text-black font-black font-mono text-xs uppercase px-6 py-3 tracking-widest flex items-center gap-2 transition-all"
                        >
                            {isSubmitting ? "Transmitting..." : <><Plus size={16}/> Initiate_Broadcast</>}
                        </button>
                    </form>
                </div>

                {/* List Section */}
                <div className="space-y-4">
                    <h2 className="text-[#FF003C] font-mono text-sm uppercase tracking-widest border-b border-[#FF003C]/20 pb-2 mb-4">
                        Active_Transmissions [{announcements.length}]
                    </h2>

                    {isLoading ? (
                        <div className="text-zinc-500 font-mono text-xs animate-pulse">Scanning frequencies...</div>
                    ) : announcements.length === 0 ? (
                        <div className="text-zinc-600 font-mono text-xs italic">No active data streams found.</div>
                    ) : (
                        <div className="grid gap-4">
                            {announcements.map((item) => (
                                <div key={item.id} className="group border-l-2 border-[#FF003C] bg-zinc-900/30 p-4 relative hover:bg-zinc-900/50 transition-all">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                {item.type === 'alert' ? <AlertTriangle size={14} className="text-[#FF003C]" /> :
                                                 item.type === 'warning' ? <Shield size={14} className="text-yellow-500" /> :
                                                 <Info size={14} className="text-[#00F0FF]" />
                                                }
                                                <span className={`text-[10px] font-mono uppercase tracking-wider ${
                                                    item.type === 'alert' ? 'text-[#FF003C]' : 
                                                    item.type === 'warning' ? 'text-yellow-500' : 'text-[#00F0FF]'
                                                }`}>
                                                    {item.type.toUpperCase()}_PROTOCOL
                                                </span>
                                                <span className="text-zinc-600 text-[10px] font-mono">
                                                    | {new Date(item.date).toLocaleDateString()}
                                                </span>
                                            </div>
                                            <h3 className="font-bold text-lg font-mono text-white">{item.title}</h3>
                                            <p className="text-zinc-400 text-sm mt-1">{item.message}</p>
                                        </div>
                                        <button 
                                            onClick={() => handleDelete(item.id)}
                                            className="text-zinc-600 hover:text-[#FF003C] transition-colors p-2"
                                            title="Purge Protocol"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

            </div>
        </main>
    );
}
