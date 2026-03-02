"use client";

import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import MatrixBackground from "../components/MatrixBackground";
import { SlotText } from "../components/SlotText";
import Footer from "../components/Footer";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

interface Announcement {
    _id: string;
    title: string;
    message: string;
    type: "info" | "alert" | "warning";
    date: string;
}

export default function AnnouncementPage() {
    const [announcements, setAnnouncements] = useState<Announcement[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/announcements')
            .then(res => res.json())
            .then(data => {
                setAnnouncements(data);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    return (
        <main className="min-h-screen bg-black text-white relative overflow-hidden">
            <MatrixBackground color="#003B00" text="" />
            <Navbar />

            <div className="relative z-10 pt-40 pb-20 container mx-auto px-4 md:px-8 min-h-[80vh] flex flex-col justify-center">
                {/* Header */}
                <div className="mb-20 text-center">
                    <div className="flex items-center justify-center gap-2 md:gap-4 mb-4">
                        <div className="h-[2px] w-12 md:w-20 bg-[#00F0FF]" />
                        <span className="text-[#00F0FF] font-mono text-xs md:text-sm font-bold tracking-[0.2em] md:tracking-[0.4em] uppercase">SYSTEM_BROADCAST</span>
                    </div>
                    <h1 className="text-3xl md:text-5xl lg:text-7xl font-black font-mono tracking-tighter uppercase leading-[0.85] mb-8 wrap-break-word">
                        <div className="relative inline-block glitch-container">
                            <span className="absolute top-0 left-0 text-[#FF003C] mix-blend-screen opacity-70 glitch-layer-red" style={{ transform: 'translate(-0.02em, 0.02em)' }}>
                                ANNOUNCEMENTS
                            </span>
                            <span className="absolute top-0 left-0 text-[#00F0FF] mix-blend-screen opacity-60 glitch-layer-cyan" style={{ transform: 'translate(0.03em, -0.02em)' }}>
                                ANNOUNCEMENTS
                            </span>
                            <span className="relative text-white">ANNOUNCEMENTS</span>
                        </div>
                    </h1>

                    {/* Dynamic Content */}
                    <div className="max-w-2xl mx-auto mt-12 space-y-8">
                        {loading ? (
                            <div className="text-center text-[#00F0FF] font-mono animate-pulse">LOADING_DATA_STREAM...</div>
                        ) : announcements.length > 0 ? (
                            announcements.map((a) => (
                                <div key={a._id} className="border-l-2 border-[#00F0FF] pl-6 py-4 bg-zinc-900/30 text-left hover:bg-zinc-900/50 transition-colors">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className={`text-[10px] font-mono px-2 py-0.5 ${a.type === 'alert' ? 'bg-red-500/20 text-red-400' : 'bg-blue-500/20 text-blue-400'}`}>
                                            {a.type.toUpperCase()}
                                        </span>
                                        <span className="text-zinc-500 font-mono text-[10px]">
                                            {new Date(a.date).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <h3 className="text-white text-xl font-bold font-mono uppercase mb-2">{a.title}</h3>
                                    <p className="text-zinc-400 text-sm leading-relaxed font-mono">
                                        {a.message}
                                    </p>
                                </div>
                            ))
                        ) : (
                            <>
                                <div className="flex justify-center w-full mt-4">
                                    <SlotText text="16 - 18 MARCH 2026" className="text-xl md:text-4xl lg:text-6xl text-[#FF003C] whitespace-nowrap" />
                                </div>
                                <div className="border-l-2 border-[#00F0FF] pl-6 py-4 bg-linear-to-r from-[#00F0FF]/10 to-transparent text-left">
                                    <p className="text-zinc-400 text-lg leading-relaxed font-mono">
                                        &gt; INITIALIZING_DATA_STREAM...
                                    </p>
                                    <p className="text-zinc-300 text-xl leading-relaxed font-mono mt-2">
                                        Major updates regarding Robo Rumble 3.0 are currently being encrypted. Stand by for transmission.
                                    </p>
                                </div>
                            </>
                        )}
                    </div>
                </div>

                {/* Back Button */}
                <div className="flex justify-center mt-8">
                    <Link
                        href="/"
                        className="group flex items-center gap-2 text-zinc-500 hover:text-[#00F0FF] transition-colors duration-300 font-mono tracking-widest text-sm uppercase"
                    >
                        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                        <span>[ RETURN_TO_BASE ]</span>
                    </Link>
                </div>
            </div>

            <Footer />

            <style jsx global>{`
        @keyframes glitch-entry {
          0% { opacity: 0; transform: scale(0.98) skewX(-5deg); filter: brightness(2); }
          50% { opacity: 1; transform: scale(1.02) skewX(2deg); filter: brightness(1.2); }
          100% { transform: scale(1) skewX(0); filter: brightness(1); }
        }
        .animate-glitch-entry { animation: glitch-entry 0.4s ease-out forwards; }
        .glitch-container { animation: glitch-skew 3s infinite; }
        @keyframes glitch-skew {
          0%, 100% { transform: skew(0deg); }
          20% { transform: skew(0deg); }
          21% { transform: skew(-0.6deg); }
          22% { transform: skew(0deg); }
        }
        .glitch-layer-red { animation: glitch-clip-red 2.5s infinite; }
        .glitch-layer-cyan { animation: glitch-clip-cyan 2s infinite; }
        @keyframes glitch-clip-red {
          0%, 100% { clip-path: inset(0 0 0 0); }
          11% { clip-path: inset(22% 0 58% 0); }
          12% { clip-path: inset(0 0 0 0); }
          51% { clip-path: inset(42% 0 28% 0); }
          52% { clip-path: inset(0 0 0 0); }
        }
        @keyframes glitch-clip-cyan {
          0%, 100% { clip-path: inset(0 0 0 0); }
          16% { clip-path: inset(32% 0 48% 0); }
          17% { clip-path: inset(0 0 0 0); }
          66% { clip-path: inset(12% 0 68% 0); }
          67% { clip-path: inset(0 0 0 0); }
        }
      `}</style>
        </main>
    );
}
