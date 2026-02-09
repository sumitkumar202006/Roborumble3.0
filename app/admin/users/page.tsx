"use client";

import { useState, useEffect } from "react";
import {
  Search,
  Check,
  X,
  ExternalLink,
  RefreshCw,
  User,
  Mail,
  School,
  Calendar,
  ShieldCheck,
  Phone,
} from "lucide-react";
import { useRouter } from "next/navigation";

interface AdminUser {
  id: string;
  _id: string;
  clerkId: string;
  email: string;
  firstName?: string;
  lastName?: string;
  username?: string;
  name: string;
  phone?: string;
  college?: string;
  role: string;
  registeredEvents: string[];
  paidEvents: string[];
  onboardingCompleted: boolean;
  createdAt: string | Date;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");
  const router = useRouter();

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/users");
      if (res.ok) {
        const data = await res.json();
        setUsers(data.users);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleDeleteUser = async (userId: string, userName: string) => {
    if (
      !confirm(
        `Are you sure you want to permanently DELETE user ${userName.toUpperCase()}? This action cannot be undone.`,
      )
    )
      return;

    try {
      const res = await fetch("/api/admin/users", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });
      if (res.ok) {
        setUsers((prev) => prev.filter((u) => u.id !== userId));
      } else {
        const data = await res.json();
        alert(data.error || "Delete Failed");
      }
    } catch (err) {
      alert("Network Error");
    }
  };

  const filteredUsers = users.filter(
    (u) =>
      (u.name || "").toLowerCase().includes(filter.toLowerCase()) ||
      (u.email || "").toLowerCase().includes(filter.toLowerCase()) ||
      (u.college || "").toLowerCase().includes(filter.toLowerCase()),
  );

  return (
    <div className="p-4 md:p-8 font-mono text-white min-h-screen bg-black">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 border-b border-[#FF003C]/30 pb-4">
        <div>
          <h1 className="text-xl md:text-2xl font-black text-[#FF003C] uppercase">
            Operative_Database
          </h1>
          <p className="text-zinc-500 text-[10px] uppercase tracking-widest mt-1">
            Total_Entries: {users.length}
          </p>
        </div>
        <button
          onClick={fetchUsers}
          disabled={loading}
          className="p-2 border border-zinc-800 hover:text-[#FF003C] hover:border-[#FF003C] transition-colors disabled:opacity-50"
        >
          <RefreshCw size={20} className={loading ? "animate-spin" : ""} />
        </button>
      </div>

      <div className="mb-6">
        <div className="relative max-w-md">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500"
            size={16}
          />
          <input
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            placeholder="SEARCH_BY_NAME_EMAIL_COLLEGE..."
            className="w-full bg-zinc-900 border border-zinc-800 pl-10 pr-4 py-3 text-sm focus:border-[#FF003C] outline-none transition-all"
          />
        </div>
      </div>

      <div className="bg-[#050505] border border-zinc-800 rounded-lg overflow-hidden">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-zinc-900 text-zinc-500 uppercase text-[10px] font-black tracking-tighter">
              <tr>
                <th className="p-4 border-b border-zinc-800">User_Entity</th>
                <th className="p-4 border-b border-zinc-800 hidden lg:table-cell">
                  Affiliation
                </th>
                <th className="p-4 border-b border-zinc-800">Event_Access</th>
                <th className="p-4 border-b border-zinc-800 text-right">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {loading ? (
                <tr>
                  <td
                    colSpan={4}
                    className="p-12 text-center text-zinc-600 animate-pulse"
                  >
                    DECRYPTING_USER_DATA...
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-12 text-center text-zinc-600">
                    NO_MATCHES_FOUND
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr
                    key={user.id}
                    className="hover:bg-zinc-900/50 transition-colors"
                  >
                    <td className="p-4">
                      <div className="flex flex-col">
                        <div className="font-bold text-white flex items-center gap-2">
                          {user.name}
                          {user.role !== "user" && (
                            <span className="text-[10px] bg-[#FF003C]/20 text-[#FF003C] px-1.5 py-0.5 border border-[#FF003C]/30 leading-none">
                              {user.role.toUpperCase()}
                            </span>
                          )}
                        </div>
                        <div className="text-zinc-500 text-[10px] flex items-center gap-1 mt-0.5">
                          <Mail size={10} /> {user.email}
                        </div>
                        {user.phone && (
                          <div className="text-zinc-600 text-[10px] flex items-center gap-1">
                            <Phone size={10} /> {user.phone}
                          </div>
                        )}
                        <div className="lg:hidden text-zinc-500 text-[10px] mt-1 italic">
                          {user.college || "N/A"}
                        </div>
                      </div>
                    </td>
                    <td className="p-4 hidden lg:table-cell max-w-[200px] overflow-hidden text-ellipsis">
                      <div className="text-zinc-400 text-xs flex items-center gap-2">
                        <School size={12} className="shrink-0" />
                        {user.college || "Unassigned"}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-1.5">
                          <Calendar size={12} className="text-zinc-500" />
                          <span className="text-xs text-white">
                            {user.registeredEvents.length} Registered
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <ShieldCheck
                            size={12}
                            className={
                              user.paidEvents.length ===
                                user.registeredEvents.length &&
                              user.registeredEvents.length > 0
                                ? "text-green-500"
                                : "text-yellow-500"
                            }
                          />
                          <span className="text-[10px] text-zinc-400">
                            {user.paidEvents.length}/
                            {user.registeredEvents.length} Paid
                          </span>
                        </div>
                        {user.registeredEvents.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1 max-w-[150px] md:max-w-xs">
                            {user.registeredEvents.slice(0, 3).map((e, idx) => (
                              <span
                                key={idx}
                                className={`text-[8px] px-1 py-0.5 border ${user.paidEvents.includes(e) ? "border-green-500/30 text-green-500 bg-green-500/5" : "border-zinc-800 text-zinc-500"}`}
                              >
                                {e}
                              </span>
                            ))}
                            {user.registeredEvents.length > 3 && (
                              <span className="text-[8px] text-zinc-600">
                                +{user.registeredEvents.length - 3}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => handleDeleteUser(user.id, user.name)}
                        className="text-[10px] px-3 py-1.5 font-bold border border-red-500/30 text-red-500 hover:bg-red-900/20 transition-all uppercase"
                      >
                        Purge_Entity
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
