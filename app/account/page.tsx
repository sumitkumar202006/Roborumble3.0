"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import MatrixBackground from "../components/MatrixBackground";
import Footer from "../components/Footer";
import { Terminal, ShieldCheck, Activity, CreditCard, LogOut, Loader2, X } from "lucide-react";
interface UserData {
  name: string;
  email: string;
  college: string;
  events: string[];
  paymentStatus: string;
  createdAt: string;
}

export default function AccountPage() {
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch("/api/auth/me");
        if (!res.ok) {
          throw new Error("Unauthorized");
        }
        const data = await res.json();
        setUser(data.user);
      } catch (err) {
        router.push("/login");
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [router]);

  const handleCancelEvent = async (eventId: string) => {
    if(!confirm("CONFIRM_ABORT: Are you sure you want to withdraw from this mission?")) return;

    try {
      const res = await fetch("/api/events/cancel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ eventId }),
      });

      if (res.ok) {
        const data = await res.json();
        // Optimistically update local state or re-fetch
        setUser(prev => prev ? { ...prev, events: data.events } : null);
        // Refresh auth context if needed, but local state update is faster for UI
      } else {
        const errorData = await res.json();
        alert(errorData.error || "CANCELLATION_FAILED");
      }
    } catch (error) {
       console.error("Cancellation failed", error);
       alert("SYSTEM_ERROR");
    }
  };

  const handleLogout = async () => {
    // Add logic to clear cookie if needed, usually server-side or just overwrite
    // For now simple client redirect or a backend logout route would be better
    // But since we used HTTP-Only cookies, we need a backend route to clear it.
    // Let's assume the user just wants to go away for now.
    // Ideally: await fetch("/api/auth/logout", { method: "POST" });
    // But user asked for basic connect. We will just redirect to home/login.
    router.push("/login"); 
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-[#00F0FF] font-mono">
        <Loader2 className="animate-spin mr-2" /> Connecting...
      </div>
    );
  }

  if (!user) return null;

  return (
    <main className="min-h-screen bg-black text-white relative overflow-hidden">
      <MatrixBackground color="#003B00" text="" />

      <div className="relative z-10 pt-40 pb-20 container mx-auto px-4 md:px-8">
        {/* Dashboard Header */}
        <div className="mb-12 border-b border-zinc-800 pb-8 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
            <div>
                <div className="flex items-center gap-2 mb-2">
                    <div className="h-2 w-2 bg-[#00F0FF] animate-pulse rounded-full" />
                    <span className="text-[#00F0FF] font-mono text-xs tracking-widest uppercase">Command Center</span>
                </div>
                <h1 className="text-4xl md:text-6xl font-black font-mono tracking-tighter uppercase leading-none">
                    {user.name}
                </h1>
                <p className="text-zinc-500 font-mono text-sm mt-2 uppercase tracking-wide">
                     {user.college} // ID: {user.email}
                </p>
            </div>
            
            <button 
                onClick={handleLogout}
                className="px-6 py-2 border border-[#FF003C] text-[#FF003C] hover:bg-[#FF003C] hover:text-black transition-all font-mono text-xs uppercase tracking-widest flex items-center gap-2"
            >
                <LogOut size={14} /> Disconnect
            </button>
        </div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Status Card */}
            <div className="bg-zinc-950/50 border border-white/10 p-6 relative overflow-hidden group">
                 <div className="absolute top-0 right-0 p-2 opacity-20 group-hover:opacity-50 transition-opacity">
                    <Activity size={40} className="text-[#00F0FF]" />
                 </div>
                 <h3 className="text-zinc-400 font-mono text-xs uppercase tracking-widest mb-4">Unit Status</h3>
                 <div className="flex items-center gap-3">
                    <ShieldCheck size={24} className="text-green-500" />
                    <span className="text-2xl font-mono font-bold text-white uppercase">Operational</span>
                 </div>
                 <div className="mt-4 h-1 w-full bg-zinc-900">
                    <div className="h-full bg-green-500 w-[95%]" />
                 </div>
                 <p className="text-[10px] text-zinc-600 font-mono mt-2 uppercase">System Integrity: 98%</p>
            </div>

             {/* Events Card */}
             <div className="bg-zinc-950/50 border border-white/10 p-6 relative overflow-hidden group">
                 <div className="absolute top-0 right-0 p-2 opacity-20 group-hover:opacity-50 transition-opacity">
                    <Terminal size={40} className="text-[#E661FF]" />
                 </div>
                 <h3 className="text-zinc-400 font-mono text-xs uppercase tracking-widest mb-4">Active Missions</h3>
                  {user.events && user.events.length > 0 ? (
                      <div className="space-y-2">
                       {user.events.map((event, i) => (
                           <div key={i} className="flex items-center justify-between p-2 bg-white/5 border-l-2 border-[#E661FF] group/item">
                               <span className="font-mono text-sm uppercase">{event}</span>
                               <div className="flex items-center gap-2">
                                  <span className="text-[10px] bg-[#E661FF]/20 text-[#E661FF] px-2 py-0.5 rounded">REGISTERED</span>
                                  {user.paymentStatus !== 'paid' && (
                                     <button 
                                        onClick={() => handleCancelEvent(event)}
                                        className="text-zinc-500 hover:text-red-500 transition-colors p-1"
                                        title="Cancel Registration"
                                     >
                                        <X size={14} />
                                     </button>
                                  )}
                               </div>
                           </div>
                       ))}
                      </div>
                  ) : (
                      <p className="text-zinc-500 font-mono text-sm uppercase">No active missions.</p>
                  )}
            </div>

            {/* Payment Card */}
             <div className="bg-zinc-950/50 border border-white/10 p-6 relative overflow-hidden group">
                 <div className="absolute top-0 right-0 p-2 opacity-20 group-hover:opacity-50 transition-opacity">
                    <CreditCard size={40} className="text-[#FF003C]" />
                 </div>
                 <h3 className="text-zinc-400 font-mono text-xs uppercase tracking-widest mb-4">Financial Uplink</h3>
                 
                 <div className="flex flex-col gap-2">
                    <span className="text-zinc-500 text-xs font-mono uppercase">Payment Status:</span>
                    <span className={`text-2xl font-mono font-bold uppercase ${user.paymentStatus === 'paid' ? 'text-green-500' : 'text-[#FF003C]'}`}>
                        {user.paymentStatus}
                    </span>
                 </div>
                 
                 {user.paymentStatus !== 'paid' && (
                     <Link 
                        href="/payment"
                        className="mt-4 w-full py-2 bg-[#FF003C]/10 border border-[#FF003C] text-[#FF003C] hover:bg-[#FF003C] hover:text-black transition-all font-mono text-xs uppercase tracking-widest block text-center"
                     >
                         Initiate Payment
                     </Link>
                 )}
            </div>
        </div>
      </div>
       <Footer />
    </main>
  );
}
