
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import MatrixBackground from "../../components/MatrixBackground";
import { Shield, Check, X, Search, RefreshCw, LogOut } from "lucide-react";

interface AdminUser {
    id: number;
    name: string;
    email: string;
    college: string;
    paymentStatus: string | null;
    events: string[] | null;
    createdAt: string | Date;
    role: string | null;
}

export default function AdminDashboard() {
  const { user, loading: authLoading } = useAuth();
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
          } else {
              // If unauthorized, redirect
              router.push("/admin/login");
          }
      } catch (err) {
          console.error(err);
      } finally {
          setLoading(false);
      }
  };

  useEffect(() => {
     if (!authLoading) {
         if (!user || user.role !== 'ADMIN') {
             router.push("/admin/login");
         } else {
             fetchUsers();
         }
     }
  }, [user, authLoading, router]);

  const togglePayment = async (userId: number, currentStatus: string) => {
      const newStatus = currentStatus === 'paid' ? 'pending' : 'paid';
      if(!confirm(`CONFIRM: Change status to ${newStatus.toUpperCase()}?`)) return;

      try {
          const res = await fetch("/api/admin/payment", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ userId, status: newStatus }),
          });
          
          if(res.ok) {
              // Optimistic update
              setUsers(users.map(u => u.id === userId ? { ...u, paymentStatus: newStatus } : u));
          }
      } catch(err) {
          alert("UPDATE_FAILED");
      }
  };

  const filteredUsers = users.filter(u => 
      u.name.toLowerCase().includes(filter.toLowerCase()) || 
      u.email.toLowerCase().includes(filter.toLowerCase()) ||
      u.college.toLowerCase().includes(filter.toLowerCase())
  );

  if (authLoading || (loading && users.length === 0)) {
      return (
          <div className="min-h-screen bg-black flex items-center justify-center text-[#FF003C] font-mono">
              LOADING_ADMIN_CONSOLE...
          </div>
      );
  }

  return (
    <main className="min-h-screen bg-black text-white p-4 md:p-8 font-mono relative">
      <div className="fixed inset-0 z-0 opacity-20 pointer-events-none">
          <MatrixBackground color="#FF003C" text="ADMIN" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto space-y-8">
          {/* Header Removed (Handled by Sidebar) */}
          <div className="flex justify-between items-end border-b border-[#FF003C]/30 pb-4 mb-6">
              <div>
                   <h2 className="text-2xl font-black text-white uppercase tracking-tighter">Mission Overview</h2>
                   <p className="text-zinc-500 text-xs font-mono uppercase">System Status: ONLINE</p>
              </div>
               <button onClick={fetchUsers} className="p-2 border border-zinc-800 hover:border-[#FF003C] hover:text-[#FF003C] transition-colors">
                  <RefreshCw size={20} />
              </button>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-[#FF003C]/10 border border-[#FF003C]/30 p-4">
                  <h3 className="text-zinc-500 text-[10px] uppercase">Total Operatives</h3>
                  <p className="text-2xl font-bold text-white">{users.filter(u => u.role !== 'ADMIN').length}</p>
              </div>
              <div className="bg-green-900/10 border border-green-500/30 p-4">
                  <h3 className="text-zinc-500 text-[10px] uppercase">Paid / Verified</h3>
                  <p className="text-2xl font-bold text-green-500">{users.filter(u => u.paymentStatus === 'paid').length}</p>
              </div>
              <div className="bg-yellow-900/10 border border-yellow-500/30 p-4">
                  <h3 className="text-zinc-500 text-[10px] uppercase">Pending Uplinks</h3>
                  <p className="text-2xl font-bold text-yellow-500">{users.filter(u => u.paymentStatus === 'pending').length}</p>
              </div>
               <div className="bg-blue-900/10 border border-blue-500/30 p-4">
                  <h3 className="text-zinc-500 text-[10px] uppercase">Events Registered</h3>
                  <p className="text-2xl font-bold text-blue-500">
                    {users.reduce((acc, curr) => acc + (curr.events?.length || 0), 0)}
                  </p>
              </div>
          </div>

          {/* Search */}
          <div className="relative">
              <input 
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                placeholder="SEARCH_DB: NAME / EMAIL / ID"
                className="w-full bg-black/50 border border-zinc-800 p-4 pl-12 text-sm text-white focus:border-[#FF003C] outline-none uppercase"
              />
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600" size={18} />
          </div>

          {/* Table */}
          <div className="overflow-x-auto border border-zinc-800 bg-black/80">
              <table className="w-full text-left text-xs uppercase">
                  <thead>
                      <tr className="bg-zinc-900 text-zinc-500 border-b border-zinc-800">
                          <th className="p-4">ID</th>
                          <th className="p-4">Operative</th>
                          <th className="p-4">College / Base</th>
                          <th className="p-4">Missions</th>
                          <th className="p-4">Status</th>
                          <th className="p-4 text-right">Action</th>
                      </tr>
                  </thead>
                  <tbody>
                      {filteredUsers.map((u) => (
                          <tr key={u.id} className="border-b border-zinc-800 hover:bg-zinc-900/50 transition-colors">
                              <td className="p-4 font-mono text-zinc-600">#{u.id.toString().padStart(4, '0')}</td>
                              <td className="p-4">
                                  <div className="font-bold text-white">{u.name}</div>
                                  <div className="text-zinc-500 lowercase">{u.email}</div>
                                  {u.role === 'ADMIN' && <span className="text-[#FF003C] text-[9px] font-bold border border-[#FF003C] px-1 ml-1">ADMIN</span>}
                              </td>
                              <td className="p-4 text-zinc-400">{u.college}</td>
                              <td className="p-4">
                                  <span className="text-[#00F0FF]">{u.events?.length || 0}</span> Active
                              </td>
                              <td className="p-4">
                                  {u.paymentStatus === 'paid' ? (
                                      <span className="text-green-500 flex items-center gap-1 font-bold">
                                          <Check size={14} /> PAID
                                      </span>
                                  ) : (
                                      <span className="text-yellow-600 flex items-center gap-1 font-bold">
                                          PENDING
                                      </span>
                                  )}
                              </td>
                              <td className="p-4 text-right">
                                  <button
                                    onClick={() => togglePayment(u.id, u.paymentStatus || 'pending')} 
                                    className={`px-3 py-1 font-bold tracking-wider transition-all border ${
                                        u.paymentStatus === 'paid' 
                                            ? 'border-red-500/50 text-red-500 hover:bg-red-500 hover:text-white' 
                                            : 'border-green-500/50 text-green-500 hover:bg-green-500 hover:text-black'
                                    }`}
                                  >
                                      {u.paymentStatus === 'paid' ? "REVOKE" : "APPROVE"}
                                  </button>
                              </td>
                          </tr>
                      ))}
                      {filteredUsers.length === 0 && (
                          <tr>
                              <td colSpan={6} className="p-8 text-center text-zinc-600">
                                  NO_MATCHING_RECORDS_FOUND
                              </td>
                          </tr>
                      )}
                  </tbody>
              </table>
          </div>
      </div>
    </main>
  );
}
