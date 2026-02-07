
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import MatrixBackground from "../../components/MatrixBackground";
import Link from "next/link";
import { Shield } from "lucide-react";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const router = useRouter();
  const { refetchUser } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    setError("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Login failed");
        setIsLoggingIn(false);
        return;
      }

      // Check Role
      if (data.user.role !== "ADMIN") {
          setError("ACCESS_DENIED: INSUFFICIENT_CLEARANCE");
          setIsLoggingIn(false);
          return;
      }

      // Success
      await refetchUser();
      router.push("/admin/dashboard");
    } catch (err) {
      setError("Connection failed");
      setIsLoggingIn(false);
    }
  };

  return (
    <main className="min-h-screen bg-black text-white relative overflow-hidden flex items-center justify-center">
      <MatrixBackground color="#FF003C" text="" />
      
      <div className="relative z-10 w-full max-w-md p-8">
         <div className="border border-[#FF003C] bg-black/80 backdrop-blur-md p-8 relative shadow-[0_0_50px_rgba(255,0,60,0.3)]">
            <div className="absolute top-0 left-0 bg-[#FF003C] text-black text-[10px] font-black px-2 py-1">
                ADMIN_ACCESS_PANEL
            </div>
            
            <div className="flex flex-col items-center mb-8 mt-4">
                <Shield size={48} className="text-[#FF003C] mb-4 animate-pulse" />
                <h1 className="text-2xl font-black font-mono tracking-tighter uppercase text-center">
                    Command_Override
                </h1>
                <p className="text-zinc-500 font-mono text-xs uppercase tracking-widest mt-2">
                    Authorized Personnel Only
                </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-6">
                 <div className="space-y-2">
                    <label className="text-[#FF003C] font-mono text-xs uppercase font-bold">Admin ID</label>
                    <input 
                        type="email" 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-black/50 border border-zinc-700 focus:border-[#FF003C] p-3 text-sm font-mono outline-none text-white transition-all"
                        placeholder="admin@roborumble.com"
                    />
                 </div>
                 <div className="space-y-2">
                    <label className="text-[#FF003C] font-mono text-xs uppercase font-bold">Passkey</label>
                    <input 
                        type="password" 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full bg-black/50 border border-zinc-700 focus:border-[#FF003C] p-3 text-sm font-mono outline-none text-white transition-all"
                        placeholder="••••••••"
                    />
                 </div>

                 {error && (
                    <div className="p-3 bg-[#FF003C]/10 border border-[#FF003C] text-[#FF003C] text-xs font-mono text-center">
                        ERROR: {error}
                    </div>
                 )}

                 <button 
                    disabled={isLoggingIn}
                    className="w-full py-4 bg-[#FF003C] hover:bg-white hover:text-black text-black font-black font-mono tracking-widest uppercase transition-all flex items-center justify-center gap-2"
                 >
                    {isLoggingIn ? "AUTHENTICATING..." : "INITIATE_SESSION"}
                 </button>
            </form>

            <div className="mt-8 text-center">
                <Link href="/" className="text-zinc-600 hover:text-white text-xs font-mono uppercase underline">
                    Return to Main System
                </Link>
            </div>
         </div>
      </div>
    </main>
  );
}
