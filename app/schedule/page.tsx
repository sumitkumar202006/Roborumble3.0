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
      date: "16",
      month: "Mar",
      dayName: "Day 1",
      events: [
        {
          time: "10:00 AM",
          title: "Defence Expo",
          venue: "Senate Ground",
          type: "Exhibition",
        },
        {
          time: "10:00 AM",
          title: "Robo Race",
          venue: "Innovation Cell",
          type: "Competition",
        },

        {
          time: "10:00 AM",
          title: "Pick and Drop (Round 1)",
          venue: "Innovation Cell",
          type: "Competition",
        },
        {
          time: "01:00 PM",
          title: "Inauguration",
          venue: "L1 (UIET)",
          type: "General",
        },
        {
          time: "02:00 PM",
          title: "Defence Talk",
          venue: "L1 (UIET)",
          type: "Seminar",
        },
        {
          time: "03:00 PM",
          title: "Showcase and Exhibition",
          venue: "Senate Ground",
          type: "Exhibition",
        },
      ],
    },
    {
      id: 2,
      date: "17",
      month: "Mar",
      dayName: "Day 2",
      events: [
        {
          time: "10:00 AM",
          title: "Robo War",
          venue: "OAT-UIET",
          type: "Competition",
        },
        {
          time: "10:00 AM",
          title: "Robo Soccer",
          venue: "OAT-UIET",
          type: "Competition",
        },
        {
          time: "10:00 AM",
          title: "RC Flying",
          venue: "Helipad",
          type: "Competition",
        },
        {
          time: "10:00 AM",
          title: "Pick and Place (Round 2)",
          venue: "Innovation Cell",
          type: "Competition",
        },
        {
          time: "10:00 AM",
          title: "E-Sports",
          venue: "Innovation Cell",
          type: "Competition",
        },
        {
          time: "04:00 PM",
          title: "Silent DJ",
          venue: "OAT-UIET",
          type: "General",
        },
      ],
    },
    {
      id: 3,
      date: "18",
      month: "Mar",
      dayName: "Day 3",
      events: [
        {
          time: "10:00 AM",
          title: "Line Following Bot",
          venue: "Innovation Cell",
          type: "Competition",
        },
        {
          time: "10:00 AM",
          title: "Robo War(Finals)",
          venue: "OAT-UIET",
          type: "Competition",
        },
        {
          time: "10:00 AM",
          title: "Robo Soccer(Finals)",
          venue: "OAT-UIET",
          type: "Competition",
        },
        {
          time: "10:00 AM",
          title: "Esports(Finals)",
          venue: "Innovation Cell",
          type: "Competition",
        },
        {
          time: "04:00 PM",
          title: "Band Show",
          venue: "Helipad",
          type: "Performance",
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
        <div className="flex flex-nowrap md:flex-wrap justify-start md:justify-center gap-4 md:gap-8 mb-16 overflow-x-auto no-scrollbar w-full px-4 scroll-smooth">
          {scheduleData.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`
                relative px-6 py-3 md:px-12 md:py-6 rounded-lg border-2 
                flex flex-col items-center justify-center cursor-pointer
                transition-all duration-500 ease-out group font-['Orbitron']
                shrink-0
                ${activeTab === item.id
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
                  <div className="flex flex-col md:grid md:grid-cols-[1fr_auto] md:items-center gap-6 relative z-10">
                    <div className="space-y-2 min-w-0">
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

                    <div className="flex flex-row gap-3 md:gap-6 text-xs md:text-sm font-mono md:min-w-[340px] md:justify-end">
                      <div className="flex items-center gap-2 md:gap-3 bg-white/5 px-3 md:px-4 py-2 border border-white/5 rounded md:min-w-[130px] justify-center flex-1 md:flex-none">
                        <Clock size={14} className="text-[#00F0FF] shrink-0" />
                        <span className="text-zinc-300 whitespace-nowrap">{event.time}</span>
                      </div>
                      <div className="flex items-center gap-2 md:gap-3 bg-white/5 px-3 md:px-4 py-2 border border-white/5 rounded md:min-w-[170px] justify-center flex-1 md:flex-none">
                        <MapPin size={14} className="text-[#FF003C] shrink-0" />
                        <span className="text-zinc-300 whitespace-nowrap">{event.venue}</span>
                      </div>
                    </div>
                  </div>

                  <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#00F0FF]/5 to-transparent h-[10%] w-full opacity-0 group-hover:opacity-100 animate-scan pointer-events-none" />
                </div>
              ))}
            </motion.div>
          </AnimatePresence>
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