"use client";

import { useState, useEffect } from "react";
import {
  Music,
  User,
  Users,
  Phone,
  Mail,
  School,
  MapPin,
  CheckCircle,
  XCircle,
  Clock,
  Search,
  Download,
  Eye,
  ChevronDown,
  Filter,
  Shield,
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
  profileId: {
    _id: string;
    firstName?: string;
    lastName?: string;
    username?: string;
    email: string;
    phone?: string;
    college?: string;
    degree?: string;
    city?: string;
    state?: string;
  };
}

export default function AdminDancePage() {
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("All");
  const [filterStatus, setFilterStatus] = useState("All");
  const [selectedReg, setSelectedReg] = useState<Registration | null>(null);

  useEffect(() => {
    fetchRegistrations();
  }, []);

  async function fetchRegistrations() {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/dance");
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

  async function updateStatus(regId: string, newStatus: string) {
    try {
      const res = await fetch("/api/admin/dance", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ registrationId: regId, status: newStatus }),
      });
      if (res.ok) {
        fetchRegistrations();
        if (selectedReg?._id === regId) {
          setSelectedReg((prev) =>
            prev ? { ...prev, status: newStatus } : null,
          );
        }
      }
    } catch (error) {
      console.error("Failed to update status:", error);
    }
  }

  const filteredRegistrations = registrations.filter((reg) => {
    const matchesSearch =
      reg.profileId.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (reg.profileId.firstName?.toLowerCase() || "").includes(
        searchTerm.toLowerCase(),
      ) ||
      (reg.profileId.lastName?.toLowerCase() || "").includes(
        searchTerm.toLowerCase(),
      ) ||
      (reg.teamName?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
      reg.danceStyle.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory =
      filterCategory === "All" || reg.category === filterCategory;
    const matchesStatus = filterStatus === "All" || reg.status === filterStatus;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const stats = {
    total: registrations.length,
    solo: registrations.filter((r) => r.category === "Solo").length,
    group: registrations.filter((r) => r.category === "Group").length,
    pending: registrations.filter((r) => r.status === "pending").length,
  };

  return (
    <div className="p-6 md:p-10 space-y-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-white flex items-center gap-3 font-mono tracking-tighter">
            <Music className="text-[#FF003C]" /> DANCE_RECORDS
          </h1>
          <p className="text-zinc-500 font-mono text-xs uppercase mt-2">
            System access granted. Managing participation data for dance
            competitions.
          </p>
        </div>
        <button
          onClick={() => {
            const csvContent =
              "data:text/csv;charset=utf-8," +
              "Category,Team/Style,Leader Email,Phone,College,Status,Members\n" +
              registrations
                .map(
                  (r) =>
                    `${r.category},${r.category === "Group" ? r.teamName : r.danceStyle},${r.profileId.email},${r.profileId.phone},${r.profileId.college},${r.status},"${r.members.join("|")}"`,
                )
                .join("\n");
            const encodedUri = encodeURI(csvContent);
            const link = document.createElement("a");
            link.setAttribute("href", encodedUri);
            link.setAttribute("download", "dance_registrations.csv");
            document.body.appendChild(link);
            link.click();
          }}
          className="flex items-center gap-2 px-4 py-2 bg-zinc-900 border border-[#FF003C]/30 text-[#FF003C] hover:bg-[#FF003C] hover:text-black transition-all rounded font-mono text-xs font-bold"
        >
          <Download size={16} /> EXPORT_CSV
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          {
            label: "TOTAL_ENTRIES",
            val: stats.total,
            color: "border-white/20",
          },
          { label: "SOLO", val: stats.solo, color: "border-blue-500/30" },
          { label: "GROUP", val: stats.group, color: "border-purple-500/30" },
          {
            label: "PENDING",
            val: stats.pending,
            color: "border-amber-500/30",
          },
        ].map((stat, i) => (
          <div
            key={i}
            className={`bg-zinc-900/50 border ${stat.color} p-4 rounded-xl`}
          >
            <p className="text-[10px] text-zinc-500 font-mono mb-1 uppercase tracking-widest">
              {stat.label}
            </p>
            <p className="text-2xl font-black text-white font-mono">
              {stat.val}
            </p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500"
            size={18}
          />
          <input
            type="text"
            placeholder="SEARCH_BY_EMAIL_NAME_OR_TEAM..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-zinc-950 border border-white/10 rounded-lg pl-10 pr-4 py-3 text-white font-mono text-sm focus:border-[#FF003C] outline-none transition-all"
          />
        </div>
        <div className="flex gap-2">
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="bg-zinc-950 border border-white/10 text-zinc-400 font-mono text-xs p-3 rounded-lg outline-none focus:border-[#FF003C]"
          >
            <option value="All">ALL_CATEGORIES</option>
            <option value="Solo">SOLO</option>
            <option value="Group">GROUP</option>
          </select>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-zinc-950 border border-white/10 text-zinc-400 font-mono text-xs p-3 rounded-lg outline-none focus:border-[#FF003C]"
          >
            <option value="All">ALL_STATUS</option>
            <option value="pending">PENDING</option>
            <option value="verified">VERIFIED</option>
            <option value="rejected">REJECTED</option>
          </select>
        </div>
      </div>

      {/* Records Table */}
      <div className="bg-zinc-950 border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/5 border-b border-white/10 text-[10px] text-zinc-500 font-mono uppercase tracking-widest">
                <th className="p-4">PARTICIPANT / TEAM</th>
                <th className="p-4">CATEGORY / STYLE</th>
                <th className="p-4">VIDEO</th>
                <th className="p-4">CONTACT</th>
                <th className="p-4">COLLEGE</th>
                <th className="p-4">STATUS</th>
                <th className="p-4 text-right">ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-sm font-mono">
              {loading ? (
                [1, 2, 3].map((i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={6} className="p-8 bg-white/5" />
                  </tr>
                ))
              ) : filteredRegistrations.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="p-12 text-center text-zinc-600 uppercase font-bold tracking-widest"
                  >
                    NO_RECORDS_FOUND_IN_CORE
                  </td>
                </tr>
              ) : (
                filteredRegistrations.map((reg) => (
                  <tr
                    key={reg._id}
                    className="hover:bg-white/5 transition-colors group"
                  >
                    <td className="p-4">
                      <div className="flex flex-col">
                        <span className="text-white font-bold uppercase truncate max-w-[200px]">
                          {reg.category === "Group"
                            ? reg.teamName
                            : `${reg.profileId.firstName || reg.profileId.username} ${reg.profileId.lastName || ""}`}
                        </span>
                        <span className="text-zinc-500 text-[10px] font-mono lowercase">
                          ID: {reg._id.slice(-8)}
                        </span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex flex-col">
                        <span
                          className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded w-fit mb-1 ${
                            reg.category === "Solo"
                              ? "bg-blue-500/10 text-blue-400"
                              : "bg-purple-500/10 text-purple-400"
                          }`}
                        >
                          {reg.category}
                        </span>
                        <span className="text-zinc-400 text-xs">
                          {reg.danceStyle}
                        </span>
                      </div>
                    </td>
                    <td className="p-4">
                      {reg.videoLink ? (
                        <a 
                          href={reg.videoLink} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-[10px] bg-purple-500/10 text-purple-400 px-2 py-1 rounded border border-purple-500/20 hover:bg-purple-500/20 transition-all font-bold"
                        >
                          WATCH <Eye size={10} />
                        </a>
                      ) : (
                        <span className="text-zinc-700 text-[10px]">NO_LINK</span>
                      )}
                    </td>
                    <td className="p-4">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-1.5 text-zinc-400">
                          <Mail size={12} className="text-[#FF003C]" />
                          <span className="text-[11px] lowercase">
                            {reg.profileId.email}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 text-zinc-400">
                          <Phone size={12} className="text-[#FF003C]" />
                          <span className="text-[11px]">
                            {reg.profileId.phone || "N/A"}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-1.5 text-zinc-400 max-w-[200px]">
                        <School size={14} className="text-zinc-600 shrink-0" />
                        <span className="text-[11px] truncate uppercase">
                          {reg.profileId.college || "PRIVATE"}
                        </span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-1.5 h-1.5 rounded-full ${
                            reg.status === "pending"
                              ? "bg-amber-500 animate-pulse"
                              : reg.status === "verified"
                                ? "bg-green-500"
                                : "bg-red-500"
                          }`}
                        />
                        <span
                          className={`text-[10px] font-bold uppercase ${
                            reg.status === "pending"
                              ? "text-amber-500"
                              : reg.status === "verified"
                                ? "text-green-500"
                                : "text-red-500"
                          }`}
                        >
                          {reg.status}
                        </span>
                      </div>
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => setSelectedReg(reg)}
                        className="p-2 bg-zinc-900 border border-white/10 hover:border-[#FF003C] hover:text-[#FF003C] transition-all rounded text-zinc-500"
                      >
                        <Eye size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detailed Modal */}
      <AnimatePresence>
        {selectedReg && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-zinc-950 border border-[#FF003C]/30 w-full max-w-2xl rounded-2xl overflow-hidden shadow-[0_0_50px_rgba(255,0,60,0.2)]"
            >
              <div className="p-6 border-b border-white/10 flex justify-between items-center bg-zinc-900/50">
                <h3 className="text-xl font-black text-white font-mono tracking-tighter uppercase flex items-center gap-2">
                  <Shield size={20} className="text-[#FF003C]" /> DATA_ENVELOPE
                </h3>
                <button
                  onClick={() => setSelectedReg(null)}
                  className="text-zinc-500 hover:text-white"
                >
                  <XCircle size={24} />
                </button>
              </div>

              <div className="p-8 space-y-8 max-h-[70vh] overflow-y-auto custom-scrollbar">
                {/* Core Info */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="p-4 bg-white/5 border border-white/5 rounded-xl">
                      <p className="text-[10px] text-zinc-500 font-mono uppercase mb-1">
                        Full Name / Leader
                      </p>
                      <p className="text-white font-bold uppercase">
                        {selectedReg.profileId.firstName}{" "}
                        {selectedReg.profileId.lastName}
                      </p>
                    </div>
                    <div className="p-4 bg-white/5 border border-white/5 rounded-xl">
                      <p className="text-[10px] text-zinc-500 font-mono uppercase mb-1">
                        Email Address
                      </p>
                      <p className="text-white font-bold lowercase">
                        {selectedReg.profileId.email}
                      </p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="p-4 bg-white/5 border border-white/5 rounded-xl">
                      <p className="text-[10px] text-zinc-500 font-mono uppercase mb-1">
                        Phone Number
                      </p>
                      <p className="text-white font-bold">
                        {selectedReg.profileId.phone || "NOT_PROVIDED"}
                      </p>
                    </div>
                    <div className="p-4 bg-white/5 border border-white/5 rounded-xl">
                      <p className="text-[10px] text-zinc-500 font-mono uppercase mb-1">
                        College / Institution
                      </p>
                      <p className="text-white font-bold uppercase truncate">
                        {selectedReg.profileId.college || "NOT_PROVIDED"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Performance Info */}
                <div className="p-6 bg-[#FF003C]/5 border border-[#FF003C]/20 rounded-2xl space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-black text-[#FF003C] font-mono uppercase tracking-widest">
                      PERFORMANCE_SPECIFICATIONS
                    </h4>
                    <span className="text-[10px] bg-[#FF003C] text-black font-bold px-2 py-0.5 rounded uppercase">
                      {selectedReg.category}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-[10px] text-zinc-500 font-mono uppercase mb-1">
                        Dance Style
                      </p>
                      <p className="text-white font-bold uppercase">
                        {selectedReg.danceStyle}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] text-zinc-500 font-mono uppercase mb-1">
                        Video Submission
                      </p>
                      {selectedReg.videoLink ? (
                        <a href={selectedReg.videoLink} target="_blank" rel="noopener noreferrer" className="text-purple-400 font-bold underline text-xs">VIEW_VIDEO_LINK</a>
                      ) : (
                        <p className="text-zinc-600 text-xs italic uppercase">EMPTY</p>
                      )}
                    </div>
                    {selectedReg.category === "Group" && (
                      <div>
                        <p className="text-[10px] text-zinc-500 font-mono uppercase mb-1">
                          Team Name
                        </p>
                        <p className="text-white font-bold uppercase">
                          {selectedReg.teamName}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="pt-4 border-t border-[#FF003C]/10">
                    <p className="text-[10px] text-zinc-500 font-mono uppercase mb-2">
                      Members Roster
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {selectedReg.members.map((m, i) => (
                        <span
                          key={i}
                          className="px-3 py-1 bg-black border border-white/10 text-white text-[11px] rounded-lg font-mono"
                        >
                          {m}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Address / Other */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="p-4 bg-white/5 border border-white/5 rounded-xl">
                    <p className="text-[10px] text-zinc-500 font-mono uppercase mb-1 flex items-center gap-1">
                      <MapPin size={10} /> Location
                    </p>
                    <p className="text-white font-bold uppercase text-xs">
                      {selectedReg.profileId.city},{" "}
                      {selectedReg.profileId.state}
                    </p>
                  </div>
                  <div className="p-4 bg-white/5 border border-white/5 rounded-xl">
                    <p className="text-[10px] text-zinc-500 font-mono uppercase mb-1 flex items-center gap-1">
                      <School size={10} /> Academic
                    </p>
                    <p className="text-white font-bold uppercase text-xs">
                      {selectedReg.profileId.degree || "UNDISCLOSED"}
                    </p>
                  </div>
                </div>

                {/* Status Management */}
                <div className="pt-6 border-t border-white/10">
                  <p className="text-[10px] text-zinc-500 font-mono uppercase mb-4 text-center tracking-widest">
                    COMMIT_STATUS_UPDATE
                  </p>
                  <div className="grid grid-cols-3 gap-3">
                    {["pending", "verified", "rejected"].map((s) => (
                      <button
                        key={s}
                        onClick={() => updateStatus(selectedReg._id, s)}
                        className={`py-3 rounded-xl font-mono text-[10px] font-black uppercase tracking-tighter border transition-all ${
                          selectedReg.status === s
                            ? s === "verified"
                              ? "bg-green-500 text-black border-green-500"
                              : s === "rejected"
                                ? "bg-red-500 text-black border-red-500"
                                : "bg-amber-500 text-black border-amber-500"
                            : "bg-zinc-900 border-white/10 text-zinc-500 hover:border-white/30"
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
