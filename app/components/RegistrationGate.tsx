"use client";

import { useUser, useClerk } from "@clerk/nextjs";
import { useEffect, useState, useCallback } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { AlertCircle, LogOut, ArrowRight, X } from "lucide-react";

export default function RegistrationGate({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoaded, isSignedIn } = useUser();
  const { signOut } = useClerk();
  const pathname = usePathname();
  const router = useRouter();
  const [isRegistered, setIsRegistered] = useState<boolean | null>(null);
  const [showError, setShowError] = useState(false);
  const [loading, setLoading] = useState(false);

  // Public routes that don't need registration check
  const isPublic = [
    "/",
    "/home",
    "/sign-in",
    "/sign-up",
    "/login",
    "/register",
    "/onboarding", // Allow onboarding so users can register!
    "/about",
    "/events",
    "/schedule",
    "/gallery",
    "/team",
    "/patrons",
    "/sponsors",
    "/contacts",
  ].some((path) => pathname === path || pathname.startsWith(path + "/"));

  const checkRegistration = useCallback(async () => {
    if (!isSignedIn || !user || isPublic) {
      setIsRegistered(true);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/verify-registration");
      const data = await res.json();

      if (res.ok) {
        if (data.registered) {
          setIsRegistered(true);
        } else {
          setIsRegistered(false);
          setShowError(true);
          // Trigger backend cleanup in background (optional, can be done here or on sign out)
          fetch("/api/auth/cleanup-unauthorized", { method: "POST" }).catch(
            console.error,
          );
        }
      } else {
        // If API fails, default to allowing for safety, but log it
        console.error("Registration check failed:", data.error);
        setIsRegistered(true);
      }
    } catch (err) {
      console.error("Failed to verify registration:", err);
      setIsRegistered(true);
    } finally {
      setLoading(false);
    }
  }, [isSignedIn, user, isPublic]);

  useEffect(() => {
    if (isLoaded) {
      checkRegistration();
    }
  }, [isLoaded, checkRegistration]);

  const handleSignOut = async () => {
    setShowError(false);
    await signOut();
    router.push("/login");
  };

  // If still checking, show nothing (or a small loader if desired)
  if (isLoaded && isSignedIn && !isPublic && isRegistered === null && loading) {
    return (
      <div className="fixed inset-0 z-[9999] bg-[#020617] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin" />
          <p className="text-cyan-500 font-mono text-sm animate-pulse tracking-widest uppercase">
            Verifying Credentials...
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      {children}

      <AnimatePresence>
        {showError && (
          <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/90 backdrop-blur-md"
            />

            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-md bg-[#0B0D10] border border-red-500/30 rounded-2xl overflow-hidden shadow-[0_0_50px_rgba(239,68,68,0.2)]"
            >
              {/* Tech Bar */}
              <div className="bg-red-500/10 border-b border-red-500/20 px-6 py-3 flex justify-between items-center">
                <span className="text-red-500 font-mono text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                  <AlertCircle size={14} /> ACCESS_DENIED
                </span>
                <div className="flex gap-1">
                  <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
                </div>
              </div>

              <div className="p-8 text-center space-y-6">
                <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto border border-red-500/20">
                  <LogOut size={40} className="text-red-500" />
                </div>

                <div className="space-y-2">
                  <h3 className="text-2xl font-black text-white uppercase tracking-tight">
                    Not Registered
                  </h3>
                  <p className="text-gray-400 text-sm leading-relaxed">
                    Your email{" "}
                    <span className="text-white font-mono">
                      ({user?.primaryEmailAddress?.emailAddress})
                    </span>{" "}
                    is not found in our records. Please register first to
                    participate in Robo Rumble 3.0.
                  </p>
                </div>

                <div className="flex flex-col gap-3">
                  <Link href="/register" onClick={() => setShowError(false)}>
                    <button className="w-full bg-cyan-500 text-black font-bold py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-cyan-400 transition-all shadow-[0_0_20px_rgba(6,182,212,0.3)]">
                      GO TO REGISTRATION <ArrowRight size={18} />
                    </button>
                  </Link>

                  <button
                    onClick={handleSignOut}
                    className="w-full bg-white/5 border border-white/10 text-white font-bold py-4 rounded-xl hover:bg-white/10 transition-all flex items-center justify-center gap-2"
                  >
                    RETURN TO LOGIN
                  </button>
                </div>
              </div>

              {/* Bottom Accent */}
              <div className="h-1 w-full bg-gradient-to-r from-transparent via-red-500 to-transparent opacity-50" />
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
