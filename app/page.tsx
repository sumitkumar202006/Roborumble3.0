"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Loading from "./components/Loading";
import Hero from "./components/Hero";
import Link from "next/link";

export default function Home() {
  const [phase, setPhase] = useState<'loading' | 'intro'>('loading');
  const [showPopup, setShowPopup] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Phase 1: Loading Screen (3 seconds)
    if (phase === 'loading') {
      const timer = setTimeout(() => {
        setPhase('intro');
        // Show popup shortly after intro starts
        setTimeout(() => setShowPopup(true), 1500);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [phase]);

  return (
    <main className="relative min-h-screen w-full flex flex-col items-center justify-center overflow-hidden">
      {phase === 'loading' && <Loading />}

      {phase === 'intro' && (
        <>
          {/* Matrix Background (Red/Granting Access) */}
          <Hero onComplete={() => router.push('/home')} />

          {/* Registration Popup Modal */}
          {showPopup && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
              <div className="relative w-full max-w-md bg-black border border-[#00F0FF] shadow-[0_0_30px_rgba(0,240,255,0.2)] p-1 animate-glitch-entry">
                {/* Header */}
                <div className="bg-[#00F0FF] text-black px-4 py-2 flex justify-between items-center font-mono font-black uppercase text-xs tracking-widest">
                  <span>// SYSTEM_ALERT</span>
                  <button 
                    onClick={() => setShowPopup(false)}
                    className="hover:bg-black hover:text-[#00F0FF] px-2 py-1 transition-colors border border-transparent hover:border-[#00F0FF]"
                  >
                    [X]
                  </button>
                </div>
                
                {/* Body */}
                <div className="p-8 text-center flex flex-col items-center">
                  <div className="w-16 h-16 border-2 border-[#FF003C] rounded-full flex items-center justify-center mb-6 animate-pulse">
                     <span className="text-[#FF003C] font-mono text-2xl">!</span>
                  </div>
                  <h3 className="text-2xl font-black font-mono text-white tracking-widest uppercase mb-2">
                    Registrations Open
                  </h3>
                  <p className="text-zinc-400 font-mono text-sm tracking-widest uppercase mb-8">
                    Access granted to all events. Secure your spot now.
                  </p>
                  
                  <Link href="/events" className="w-full">
                    <button className="w-full bg-[#FF003C] hover:bg-[#E60073] text-white font-black font-mono px-6 py-4 tracking-[0.2em] transition-all border border-[#FF003C] shadow-[0_0_15px_rgba(255,0,60,0.5)]">
                      ENTER_ARENA
                    </button>
                  </Link>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </main>
  );
}
