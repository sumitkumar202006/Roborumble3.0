"use client";

import { useEffect, useState } from "react";
import { Plus, Edit, Trash2, Save, X, Trophy, Users, IndianRupee, Loader2, ToggleLeft, ToggleRight } from "lucide-react";

interface EventData {
    eventId: string;
    title: string;
    category: string;
    description: string;
    teamSize: string;
    prize: string;
    rules: string[];
    image?: string;
    fees: number;
    minTeamSize: number;
    maxTeamSize: number;
    maxRegistrations?: number;
    currentRegistrations: number;
    isLive: boolean;
    createdAt: string;
}

const CATEGORIES = ["Robotics", "Aerial", "Gaming", "Innovation", "Seminar", "Exhibition"];

export default function AdminEventsPage() {
    const [events, setEvents] = useState<EventData[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [editingEvent, setEditingEvent] = useState<EventData | null>(null);
    const [showForm, setShowForm] = useState(false);
    const [message, setMessage] = useState({ type: "", text: "" });

    const [formData, setFormData] = useState({
        title: "",
        category: "Robotics",
        description: "",
        teamSize: "3-5 Members",
        prize: "",
        rules: "",
        image: "",
        fees: 0,
        maxRegistrations: "",
        isLive: true,
    });

    useEffect(() => {
        fetchEvents();
    }, []);

    async function fetchEvents() {
        try {
            const res = await fetch("/api/admin/events");
            if (res.ok) {
                const data = await res.json();
                setEvents(data.events || []);
            } else {
                setMessage({ type: "error", text: "Failed to fetch events" });
            }
        } catch (e) {
            console.error(e);
            setMessage({ type: "error", text: "Network error" });
        } finally {
            setLoading(false);
        }
    }

    function resetForm() {
        setFormData({
            title: "",
            category: "Robotics",
            description: "",
            teamSize: "3-5 Members",
            prize: "",
            rules: "",
            image: "",
            fees: 0,
            maxRegistrations: "",
            isLive: true,
        });
        setEditingEvent(null);
        setShowForm(false);
    }

    function startEdit(event: EventData) {
        setEditingEvent(event);
        setFormData({
            title: event.title,
            category: event.category,
            description: event.description,
            teamSize: event.teamSize,
            prize: event.prize,
            rules: event.rules.join("\n"),
            image: event.image || "",
            fees: event.fees,
            maxRegistrations: event.maxRegistrations?.toString() || "",
            isLive: event.isLive,
        });
        setShowForm(true);
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setSaving(true);
        setMessage({ type: "", text: "" });

        try {
            const payload = {
                ...formData,
                rules: formData.rules.split("\n").filter(r => r.trim()),
                maxRegistrations: formData.maxRegistrations ? parseInt(formData.maxRegistrations) : undefined,
                eventId: editingEvent?.eventId,
            };

            const method = editingEvent ? "PUT" : "POST";
            const res = await fetch("/api/admin/events", {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            const data = await res.json();

            if (res.ok) {
                setMessage({ type: "success", text: editingEvent ? "Event updated!" : "Event created!" });
                resetForm();
                fetchEvents();
            } else {
                setMessage({ type: "error", text: data.error || "Failed to save" });
            }
        } catch (e) {
            console.error(e);
            setMessage({ type: "error", text: "Network error" });
        } finally {
            setSaving(false);
        }
    }

    async function toggleLive(event: EventData) {
        try {
            const res = await fetch("/api/admin/events", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ eventId: event.eventId, isLive: !event.isLive }),
            });

            if (res.ok) {
                fetchEvents();
            }
        } catch (e) {
            console.error(e);
        }
    }

    async function deleteEvent(eventId: string) {
        if (!confirm("Are you sure you want to delete this event?")) return;

        try {
            const res = await fetch(`/api/admin/events?eventId=${eventId}`, {
                method: "DELETE",
            });

            if (res.ok) {
                setMessage({ type: "success", text: "Event deleted" });
                fetchEvents();
            } else {
                setMessage({ type: "error", text: "Failed to delete" });
            }
        } catch (e) {
            console.error(e);
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-[#020617] flex items-center justify-center">
                <Loader2 className="animate-spin text-cyan-400" size={32} />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#020617] p-4 md:p-8">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-3">
                            <Trophy className="text-yellow-400" /> Event Management
                        </h1>
                        <p className="text-gray-400 text-sm">Create, edit, and manage events</p>
                    </div>
                    <button
                        onClick={() => { resetForm(); setShowForm(true); }}
                        className="w-full md:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-cyan-500 text-black font-bold rounded-lg hover:bg-cyan-400 transition-colors"
                    >
                        <Plus size={20} /> Add Event
                    </button>
                </div>

                {/* Messages */}
                {message.text && (
                    <div className={`px-4 py-3 rounded-lg mb-6 ${message.type === "success"
                            ? "bg-green-500/10 border border-green-500 text-green-400"
                            : "bg-red-500/10 border border-red-500 text-red-400"
                        }`}>
                        {message.text}
                    </div>
                )}

                {/* Event Form */}
                {showForm && (
                    <div className="bg-gray-800/50 rounded-xl border border-gray-700 p-6 mb-8">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold text-white">
                                {editingEvent ? "Edit Event" : "Create New Event"}
                            </h2>
                            <button onClick={resetForm} className="text-gray-400 hover:text-white">
                                <X size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-gray-400 text-sm mb-2">Title *</label>
                                <input
                                    type="text"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    disabled={!!editingEvent}
                                    className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white disabled:opacity-50"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-gray-400 text-sm mb-2">Category *</label>
                                <select
                                    value={formData.category}
                                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                    className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white"
                                >
                                    {CATEGORIES.map(cat => (
                                        <option key={cat} value={cat}>{cat}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-gray-400 text-sm mb-2">Description *</label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    rows={3}
                                    className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-gray-400 text-sm mb-2">Team Size *</label>
                                <input
                                    type="text"
                                    value={formData.teamSize}
                                    onChange={(e) => setFormData({ ...formData, teamSize: e.target.value })}
                                    placeholder="e.g., 3-5 Members"
                                    className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-gray-400 text-sm mb-2">Prize *</label>
                                <input
                                    type="text"
                                    value={formData.prize}
                                    onChange={(e) => setFormData({ ...formData, prize: e.target.value })}
                                    placeholder="e.g., ₹20,000"
                                    className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-gray-400 text-sm mb-2">Registration Fee (₹)</label>
                                <input
                                    type="number"
                                    value={formData.fees}
                                    onChange={(e) => setFormData({ ...formData, fees: parseInt(e.target.value) || 0 })}
                                    className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white"
                                />
                            </div>

                            <div>
                                <label className="block text-gray-400 text-sm mb-2">Max Registrations</label>
                                <input
                                    type="number"
                                    value={formData.maxRegistrations}
                                    onChange={(e) => setFormData({ ...formData, maxRegistrations: e.target.value })}
                                    placeholder="Unlimited"
                                    className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white"
                                />
                            </div>

                            <div>
                                <label className="block text-gray-400 text-sm mb-2">Image Path</label>
                                <input
                                    type="text"
                                    value={formData.image}
                                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                                    placeholder="/event-image.jpeg"
                                    className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white"
                                />
                            </div>

                            <div className="flex items-center gap-4">
                                <label className="text-gray-400 text-sm">Live Status</label>
                                <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, isLive: !formData.isLive })}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${formData.isLive
                                            ? "bg-green-500/20 text-green-400 border border-green-500/30"
                                            : "bg-gray-700/50 text-gray-400 border border-gray-600"
                                        }`}
                                >
                                    {formData.isLive ? <ToggleRight size={20} /> : <ToggleLeft size={20} />}
                                    {formData.isLive ? "Live" : "Hidden"}
                                </button>
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-gray-400 text-sm mb-2">Rules (one per line)</label>
                                <textarea
                                    value={formData.rules}
                                    onChange={(e) => setFormData({ ...formData, rules: e.target.value })}
                                    rows={4}
                                    placeholder="Rule 1
Rule 2
Rule 3"
                                    className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white font-mono text-sm"
                                />
                            </div>

                            <div className="md:col-span-2 flex gap-4">
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="flex items-center gap-2 px-6 py-3 bg-cyan-500 text-black font-bold rounded-lg hover:bg-cyan-400 disabled:opacity-50 transition-colors"
                                >
                                    {saving ? <Loader2 size={20} className="animate-spin" /> : <Save size={20} />}
                                    {editingEvent ? "Update Event" : "Create Event"}
                                </button>
                                <button
                                    type="button"
                                    onClick={resetForm}
                                    className="px-6 py-3 bg-gray-700 text-gray-300 font-bold rounded-lg hover:bg-gray-600 transition-colors"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* Events List */}
                <div className="space-y-4">
                    {events.length === 0 ? (
                        <div className="text-center py-12 text-gray-400">
                            No events found. Click "Add Event" to create one.
                        </div>
                    ) : (
                        events.map((event) => (
                            <div
                                key={event.eventId}
                                className={`bg-gray-800/50 rounded-xl border p-6 transition-colors ${event.isLive ? "border-gray-700" : "border-red-900/50 opacity-60"
                                    }`}
                            >
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <span className="text-xs font-mono text-cyan-400 bg-cyan-500/10 px-2 py-1 rounded">
                                                {event.category}
                                            </span>
                                            <span className={`text-xs font-mono px-2 py-1 rounded ${event.isLive
                                                    ? "text-green-400 bg-green-500/10"
                                                    : "text-red-400 bg-red-500/10"
                                                }`}>
                                                {event.isLive ? "LIVE" : "HIDDEN"}
                                            </span>
                                        </div>
                                        <h3 className="text-xl font-bold text-white mb-1">{event.title}</h3>
                                        <p className="text-gray-400 text-sm mb-2 line-clamp-1">{event.description}</p>
                                        <div className="flex flex-wrap gap-4 text-sm text-gray-400">
                                            <span className="flex items-center gap-1">
                                                <Users size={14} /> {event.teamSize}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <IndianRupee size={14} /> {event.fees || "Free"}
                                            </span>
                                            <span className="flex items-center gap-1 text-green-400">
                                                <Trophy size={14} /> {event.prize}
                                            </span>
                                            <span className="text-cyan-400">
                                                {event.currentRegistrations} registered
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => toggleLive(event)}
                                            className={`p-2 rounded-lg transition-colors ${event.isLive
                                                    ? "bg-green-500/10 text-green-400 hover:bg-green-500/20"
                                                    : "bg-gray-700 text-gray-400 hover:bg-gray-600"
                                                }`}
                                            title={event.isLive ? "Make Hidden" : "Make Live"}
                                        >
                                            {event.isLive ? <ToggleRight size={20} /> : <ToggleLeft size={20} />}
                                        </button>
                                        <button
                                            onClick={() => startEdit(event)}
                                            className="p-2 bg-cyan-500/10 text-cyan-400 rounded-lg hover:bg-cyan-500/20 transition-colors"
                                            title="Edit"
                                        >
                                            <Edit size={20} />
                                        </button>
                                        <button
                                            onClick={() => deleteEvent(event.eventId)}
                                            className="p-2 bg-red-500/10 text-red-400 rounded-lg hover:bg-red-500/20 transition-colors"
                                            title="Delete"
                                        >
                                            <Trash2 size={20} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
