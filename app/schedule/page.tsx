"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import MatrixBackground from "../components/MatrixBackground";
import Footer from "../components/Footer";
import { Clock, MapPin, Activity, ShieldAlert, Terminal } from "lucide-react";
import { useAudio } from "../hooks/useAudio";

// --- Types ---
interface Event {
  time: string;
  title: string;
  venue: string;
  type: string;
}

interface DayBlock {
  id: number;
  date: string;
  month: string;
  dayName: string;
  events: Event[];
}

export default function SchedulePage() {
  const [activeTab, setActiveTab] = useState(1);
  const playHoverSound = useAudio("audio.wav", 0.1);

  const scheduleData: DayBlock[] = [
    {
      id: 1,
      date: "Unknown",
      month: "",
      dayName: "Unknown",
      events: [
        {
          time: "10:00 AM",
          title: "Inauguration Ceremony",
          venue: "Innovation Cell CSJMU",
          type: "General",
        },
        {
          time: "11:00 AM",
          title: "Line Following Bot",
          venue: "Innovation Cell CSJMU",
          type: "Competition",
        },
        {
          time: "03:00 PM",
          title: "Project Expo",
          venue: "Innovation Cell CSJMU",
          type: "Exhibition",
        },
      ],
    },
    {
      id: 2,
      date: "Unknown",
      month: "",
      dayName: "Unknown",
      events: [
        {
          time: "10:00 AM",
          title: "Robo Race",
          venue: "Innovation Cell CSJMU",
          type: "Competition",
        },
        {
          time: "12:00 PM",
          title: "Robo Wars",
          venue: "UIET CSJMU",
          type: "Competition",
        },
        {
          time: "03:00 PM",
          title: "Robo Soccer",
          venue: "UIET CSJMU",
          type: "Competition",
        },
      ],
    },
    {
      id: 3,
      date: "Unknown",
      month: "",
      dayName: "Unknown",
      events: [
        {
          time: "10:00 AM",
          title: "Esports Finals",
          venue: "UIET CSJMU",
          type: "Competition",
        },
        {
          time: "01:00 PM",
          title: "Defence Talk",
          venue: "UIET CSJMU",
          type: "Seminar",
        },
        {
          time: "03:00 PM",
          title: "Defence Expo",
          venue: "UIET CSJMU",
          type: "Exhibition",
        },
      ],
    },
  ];

  const activeDay = scheduleData.find((d) => d.id === activeTab);

  return (
    <main className="min-h-screen bg-black text-white relative overflow-hidden font-sans selection:bg-[#00FF9E] selection:text-black">
      {/* Import Font */}
      <style jsx global>{`
        @import url("https://fonts.googleapis.com/css2?family=Orbitron:wght@400;500;700;900&display=swap");

        @keyframes scan {
          0% {
            top: -20%;
          }
          100% {
            top: 120%;
          }
        }
        .animate-scan {
          position: absolute;
          animation: scan 2s linear infinite;
        }
      `}</style>

      {/* Background Matrix Effect (Preserved) */}
      <MatrixBackground color="#003B00" text="" />

      {/* Central Glow Effect Overlay */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[300px] bg-[#00FF9E]/10 blur-[120px] rounded-full pointer-events-none z-0"></div>

      <div className="relative z-10 flex flex-col items-center pt-32 pb-20 px-4 min-h-screen">
        {/* --- TITLE --- */}
        <h1
          className="text-3xl md:text-7xl font-black tracking-widest uppercase mb-16 text-center font-['Orbitron']"
          style={{
            background: "linear-gradient(to bottom, #00F0FF, #00FF9E)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            filter: "drop-shadow(0 0 10px rgba(0, 255, 158, 0.5))",
          }}
        >
          SCHEDULE
        </h1>

        {/* --- TABS --- */}
        <div className="flex flex-wrap justify-center gap-8 mb-16">
          {scheduleData.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`
                relative px-8 py-4 md:px-12 md:py-6 rounded-lg border-2 
                flex flex-col items-center justify-center cursor-pointer
                transition-all duration-500 ease-out group font-['Orbitron']
                ${
                  activeTab === item.id
                    ? "border-[#00FF9E] bg-[#00FF00]/10 shadow-[0_0_30px_rgba(0,255,0,0.4)] scale-105"
                    : "border-zinc-800 bg-black/50 text-zinc-500 hover:border-[#00FF9E]/50 hover:text-[#00FF9E]/80"
                }
              `}
            >
              <span
                className={`text-xl md:text-3xl font-bold transition-colors duration-300 
                  ${activeTab === item.id ? "text-[#00FF9E] drop-shadow-[0_0_10px_rgba(0,255,0,0.8)]" : ""}`}
              >
                {item.date} {item.month}
              </span>

              <span
                className={`text-xs md:text-sm tracking-widest mt-1 uppercase transition-colors duration-300
                  ${activeTab === item.id ? "text-[#00FF9E]" : ""}`}
              >
                {item.dayName}
              </span>

              {activeTab === item.id && (
                <>
                  <span className="absolute -top-1 -left-1 w-3 h-3 border-t-2 border-l-2 border-[#00FF9E]"></span>
                  <span className="absolute -bottom-1 -right-1 w-3 h-3 border-b-2 border-r-2 border-[#00FF9E]"></span>
                </>
              )}
            </button>
          ))}
        </div>

        {/* --- EVENTS CONTENT --- */}
        <div className="w-full max-w-5xl">
          <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-[#00FF9E] to-transparent mb-12"></div>

          {/* COMING SOON OVERLAY */}
          <div className="flex flex-col items-center justify-center py-12 md:py-20 px-4 border border-[#00FF9E]/20 bg-black/40 backdrop-blur-sm rounded-xl text-center">
               <Clock className="text-[#00FF9E] mb-6 animate-pulse w-12 h-12 md:w-16 md:h-16" />
               <h2 className="text-2xl sm:text-3xl md:text-5xl font-black font_['Orbitron'] text-white tracking-widest uppercase mb-4 break-words w-full">
                   TIMELINE<span className="hidden md:inline">_</span><br className="md:hidden" />LOCKED
               </h2>
               <p className="text-[#00FF9E] font-mono tracking-[0.2em] md:tracking-[0.3em] uppercase text-xs sm:text-sm md:text-base animate-pulse">
                   // DECLASSIFICATION_PENDING...
               </p>
          </div>

          {/* 
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              {activeDay?.events.map((event, i) => (
                <div
                  key={i}
                  className="relative group p-6 md:p-8 bg-zinc-950/70 border-l-4 border-zinc-800 hover:border-[#00F0FF] transition-all duration-300 backdrop-blur-md overflow-hidden"
                  onMouseEnter={() => playHoverSound()}
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <Activity
                          size={14}
                          className="text-[#00FF9E] animate-pulse"
                        />
                        <span className="text-[#00FF9E] font-mono text-[10px] font-bold tracking-[0.2em] uppercase">
                          // {event.type}
                        </span>
                      </div>
                      <h3 className="text-xl md:text-3xl font-black text-white font-['Orbitron'] tracking-wide uppercase group-hover:text-[#00F0FF] transition-colors">
                        {event.title}
                      </h3>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 md:gap-8 text-xs md:text-sm font-mono">
                      <div className="flex items-center gap-3 bg-white/5 px-4 py-2 border border-white/5 rounded">
                        <Clock size={16} className="text-[#00F0FF]" />
                        <span className="text-zinc-300">{event.time}</span>
                      </div>
                      <div className="flex items-center gap-3 bg-white/5 px-4 py-2 border border-white/5 rounded">
                        <MapPin size={16} className="text-[#FF003C]" />
                        <span className="text-zinc-300">{event.venue}</span>
                      </div>
                    </div>
                  </div>

                  <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#00F0FF]/5 to-transparent h-[10%] w-full opacity-0 group-hover:opacity-100 animate-scan pointer-events-none" />
                </div>
              ))}
            </motion.div>
          </AnimatePresence>
          */}
        </div>

        {/* Footer Data */}
        <div className="mt-20 pt-10 border-t border-zinc-900 w-full max-w-5xl flex flex-col md:flex-row justify-between items-center text-zinc-600 font-mono text-[10px] uppercase tracking-widest gap-4">
          <div className="flex items-center gap-4">
            <ShieldAlert size={12} />
            <span>Operational Integrity: 99.8%</span>
          </div>
          <div className="flex items-center gap-4">
            <Terminal size={12} />
            <span>User_Access: Verified_Guest</span>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}