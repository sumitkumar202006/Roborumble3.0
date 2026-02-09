"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useUser } from "@clerk/nextjs";
import MatrixBackground from "../components/MatrixBackground";
import {
  Trophy,
  Users,
  Info,
  Shield,
  Zap,
  Cpu,
  Bot,
  Gamepad2,
  Mic,
  Rocket,
  Magnet,
  Download,
} from "lucide-react";
import { BiFootball } from "react-icons/bi";
import { SlotText } from "../components/SlotText";
import Footer from "../components/Footer";
import { useAudio } from "../hooks/useAudio";
import { events } from "../data/events";

// --- Types ---
interface EventData {
  id: string;
  title: string;
  category: string;
  icon: any;
  desc: string;
  teamSize: string;
  prize: string;
  cost: number;
  rules: string[]; // General rules or summary
  specifications?: string[]; // Bot/Project specs
  gameplay?: string[]; // Gameplay mechanics
  judging?: string[]; // Judging criteria
  video?: string; // Optional: Path to background video
  image?: string; // Optional: Path to background image
  brochureLink?: string; // Optional: Link to event brochure
}

// --- Internal Component: Animated Backgrounds ---
const CardBackground = ({
  category,
  image,
}: {
  category: string;
  image?: string;
}) => {
  // Priority: Image Background
  if (image) {
    return (
      <div className="absolute inset-0 z-0 select-none">
        <Image
          src={image}
          alt={category}
          fill
          className="object-cover opacity-60 group-hover:scale-110 transition-transform duration-700"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent"></div>
      </div>
    );
  }

  // Robotics: Scrolling Grid
  if (category === "Robotics") {
    return (
      <div className="absolute inset-0 z-0 opacity-20">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#00F0FF_1px,transparent_1px),linear-gradient(to_bottom,#00F0FF_1px,transparent_1px)] bg-[size:40px_40px] animate-grid-scroll"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-black via-transparent to-black"></div>
      </div>
    );
  }
  // Gaming: Glitch/Noise
  if (category === "Gaming") {
    return (
      <div className="absolute inset-0 z-0 opacity-20 overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-30 animate-noise"></div>
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-[#E661FF]/20 to-[#00F0FF]/20 mix-blend-overlay"></div>
        <div className="absolute w-[200%] h-[10px] bg-[#E661FF]/50 top-1/4 animate-scan-fast blur-md"></div>
        <div className="absolute w-[200%] h-[5px] bg-[#00F0FF]/50 bottom-1/3 animate-scan-fast-reverse blur-md"></div>
      </div>
    );
  }
  // Aerial: Sky/Flow
  if (category === "Aerial") {
    return (
      <div className="absolute inset-0 z-0 opacity-20">
        <div className="absolute inset-0 bg-gradient-to-b from-[#00F0FF]/10 to-transparent"></div>
        {/* Simulated Clouds/Wind with moving gradients */}
        <div className="absolute -inset-[100%] bg-[radial-gradient(circle,rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[size:20px_20px] animate-wind-flow"></div>
      </div>
    );
  }
  // Data/Innovation: Particles/Nodes
  if (category === "Innovation" || category === "Seminar") {
    return (
      <div className="absolute inset-0 z-0 opacity-30">
        <div className="absolute inset-0 bg-[radial-gradient(#FFD700_1px,transparent_1px)] bg-[size:20px_20px] opacity-30"></div>
        <div className="absolute inset-0 bg-gradient-radial from-[#FFD700]/10 to-transparent animate-pulse"></div>
      </div>
    );
  }
  // Defence: Radar/Hazard
  if (category === "Defence" || category === "Exhibition") {
    return (
      <div className="absolute inset-0 z-0 opacity-20">
        <div className="absolute inset-0 bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,#FF003C_10px,#FF003C_11px)] opacity-10"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,black_100%)]"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150%] h-[150%] border-t-2 border-[#FF003C]/50 rounded-full animate-radar-spin mask-image-radar"></div>
      </div>
    );
  }

  // Default
  return <div className="absolute inset-0 z-0 bg-zinc-900/50"></div>;
};

// --- Internal Component: EventCard ---
// ... (keep CardBackground)

// --- Internal Component: EventCard ---
const EventCard = ({
  event,
  isActive,
  isLoading,
  onOpen,
  onClose,
}: {
  event: EventData;
  isActive: boolean;
  isLoading: boolean;
  onOpen: () => void;
  onClose: () => void;
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [activeTab, setActiveTab] = useState<"about" | "rules" | "register">(
    "about",
  );

  const handleOpen = () => {
    if (isActive || isLoading) return;
    setActiveTab("about");
    onOpen();
  };

  const handleClose = (e: React.MouseEvent) => {
    e.stopPropagation();
    onClose();
  };

  const Icon = event.icon;

  return (
    <div
      className="relative group cursor-crosshair h-full"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleOpen}
    >
      {/* Main Preview Card */}
      <div
        className="relative p-8 border-l-4 border-t border-[#00F0FF]/30 transition-all duration-500 overflow-hidden h-full flex flex-col justify-between bg-black/80 backdrop-blur-md"
        style={{
          clipPath: "polygon(0 0, 92% 0, 100% 8%, 100% 100%, 8% 100%, 0 92%)",
        }}
      >
        <CardBackground category={event.category} image={event.image} />
        <div
          className={`absolute inset-0 bg-[#00F0FF]/10 z-0 transition-opacity duration-300 ${isHovered ? "opacity-100" : "opacity-0"}`}
        />
        <div className="relative z-10 flex flex-col h-full">
          <div className="flex justify-between items-start mb-6">
            <div className="w-12 h-12 border border-[#00F0FF]/40 flex items-center justify-center bg-black/50 text-[#00F0FF] shadow-[0_0_15px_rgba(0,240,255,0.2)] backdrop-blur-sm">
              <Icon size={24} />
            </div>
            <span className="text-[#00F0FF] font-mono text-[10px] opacity-70 tracking-widest uppercase bg-black/50 px-2 py-1">
              [{event.category}]
            </span>
          </div>

          <h3 className="text-2xl font-black text-white mb-3 font-mono tracking-tighter uppercase group-hover:text-[#00F0FF] transition-colors drop-shadow-md">
            {event.title}
          </h3>

          <p className="text-gray-400 font-mono text-xs leading-relaxed uppercase mb-6 line-clamp-2 drop-shadow-sm">
            {event.desc}
          </p>

          <div className="flex justify-between items-center pt-4 border-t border-white/10 mt-auto">
            <span className="text-[#00F0FF] font-mono text-xs font-bold drop-shadow-md">
              {event.prize}
            </span>
            <span className="text-white font-mono text-[9px] opacity-60 group-hover:opacity-100 transition-opacity underline">
              VIEW_SPECS
            </span>
          </div>
        </div>
        {isHovered && (
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#00F0FF]/20 to-transparent h-[20%] w-full animate-scan pointer-events-none z-20" />
        )}
      </div>

      {/* FULL SCREEN MISSION BRIEFING DIALOG */}
      {(isLoading || isActive) && (
        <div className="fixed inset-x-0 bottom-0 top-[96px] z-[9999] flex items-start justify-center px-4 py-2 pointer-events-auto">
          {/* Backdrop (Click Outside) */}
          <div
            className="absolute inset-0 bg-black/95 backdrop-blur-xl cursor-default"
            onClick={handleClose}
          />

          <div
            className="relative w-full max-w-sm md:max-w-4xl lg:max-w-6xl bg-[#050505] border border-[#E661FF] shadow-[0_0_80px_rgba(230,97,255,0.4)] pointer-events-auto flex flex-col h-[calc(100vh-120px)] animate-glitch-entry"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header Status Bar */}
            <div className="bg-[#E661FF] text-black px-3 md:px-6 py-1 flex justify-between items-center font-mono text-[9px] md:text-[11px] font-black uppercase tracking-widest flex-shrink-0">
              <div className="flex gap-2 md:gap-4">
                <span className="animate-pulse">
                  ● MISSION_INTEL: {event.id.toUpperCase()}
                </span>
              </div>
              <button
                onClick={handleClose}
                className="hidden md:block hover:bg-black hover:text-[#E661FF] px-2 py-1 transition-all border border-black font-bold text-[10px]"
              >
                [ CLOSE ]
              </button>
            </div>

            {/* Main Content Area */}
            <div className="flex-grow overflow-y-auto md:overflow-hidden p-6 md:p-10 custom-scrollbar">
              {isLoading ? (
                <div className="h-full flex flex-col items-center justify-center space-y-6">
                  <div className="w-1 bg-[#E661FF] h-24 animate-pulse" />
                  <p className="text-[#E661FF] font-mono text-xl animate-pulse tracking-[0.7em] font-black uppercase">
                    Retrieving Data...
                  </p>
                </div>
              ) : (
                <div className="flex flex-col md:flex-row gap-10 md:h-full">
                  {/* LEFT COLUMN: Image + Primary Action */}
                  <div className="w-full md:w-1/3 flex flex-col gap-6 flex-shrink-0">
                    <div className="aspect-square bg-zinc-950 border border-[#E661FF]/30 relative flex items-center justify-center p-2 rounded-xl overflow-hidden shadow-[0_0_30px_rgba(230,97,255,0.1)]">
                      {event.image ? (
                        <Image
                          src={event.image}
                          alt={event.title}
                          fill
                          className="object-cover rounded-lg opacity-90"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-[#E661FF]/5">
                          <Icon
                            size={80}
                            className="text-[#E661FF] opacity-80"
                          />
                        </div>
                      )}

                      <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-[#E661FF]" />
                      <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-[#E661FF]" />
                      <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-[#E661FF]" />
                      <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-[#E661FF]" />
                    </div>

                    <div className="text-center space-y-3">
                      <div className="p-3 bg-zinc-900/50 border border-zinc-700/50 rounded text-zinc-500 font-mono text-xs font-bold uppercase tracking-wider">
                        Status: Registration Open
                      </div>

                      <Link
                        href="/dashboard/events"
                        className="w-full py-3 block bg-[#E661FF] text-black font-mono font-black uppercase tracking-widest hover:bg-white hover:shadow-[0_0_20px_rgba(230,97,255,0.5)] transition-all text-xs border border-[#E661FF] text-center"
                      >
                        REGISTER_VIA_DASHBOARD
                      </Link>
                    </div>
                  </div>

                  {/* RIGHT COLUMN: Title + Content Box */}
                  <div className="w-full md:w-2/3 flex flex-col md:h-full min-h-0">
                    <div className="mb-6 text-center md:text-left">
                      <h2 className="text-4xl md:text-5xl font-black font-mono uppercase tracking-tighter text-white mb-2 leading-none">
                        {event.title}
                      </h2>
                      <p className="text-[#00F0FF] font-mono text-sm tracking-[0.2em] font-bold">
                        // {event.category} DIVISION
                      </p>
                    </div>

                    <div className="flex-grow relative border border-[#E661FF]/30 bg-hex-mesh p-6 md:p-8 rounded-lg min-h-0 flex flex-col">
                      <div className="absolute -top-[1px] -left-[1px] w-8 h-8 border-t-2 border-l-2 border-[#E661FF]" />
                      <div className="absolute -top-[1px] -right-[1px] w-8 h-8 border-t-2 border-r-2 border-[#E661FF]" />
                      <div className="absolute -bottom-[1px] -left-[1px] w-8 h-8 border-b-2 border-l-2 border-[#E661FF]" />
                      <div className="absolute -bottom-[1px] -right-[1px] w-8 h-8 border-b-2 border-r-2 border-[#E661FF]" />

                      <div className="flex-grow overflow-y-auto pr-2 custom-scrollbar">
                        {activeTab === "about" && (
                          <div className="space-y-6 animate-glitch-entry">
                            <p className="text-zinc-300 font-mono text-sm leading-relaxed whitespace-pre-line">
                              {event.desc}
                            </p>
                            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/10">
                              <div>
                                <span className="text-[#E661FF] text-[10px] font-bold uppercase tracking-wider block mb-1">
                                  Squad Size
                                </span>
                                <span className="text-white font-mono text-lg">
                                  {event.teamSize}
                                </span>
                              </div>
                              <div>
                                <span className="text-[#E661FF] text-[10px] font-bold uppercase tracking-wider block mb-1">
                                  Bounty
                                </span>
                                <span className="text-white font-mono text-lg">
                                  {event.prize}
                                </span>
                              </div>
                            </div>
                            {event.brochureLink && (
                              <div className="pt-4">
                                <a
                                  href={event.brochureLink}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-2 px-4 py-2 bg-[#FF003C]/10 border border-[#FF003C]/50 text-[#FF003C] hover:bg-[#FF003C] hover:text-white transition-all font-mono text-xs font-bold uppercase tracking-widest group"
                                >
                                  <Download
                                    size={14}
                                    className="group-hover:animate-bounce"
                                  />
                                  DOWNLOAD_INTEL
                                </a>
                              </div>
                            )}
                          </div>
                        )}

                        {activeTab === "rules" && (
                          <div className="space-y-8 animate-glitch-entry">
                            <div className="space-y-4">
                              <h5 className="text-[#FF003C] font-mono font-bold text-xs uppercase tracking-widest border-b border-[#FF003C]/30 pb-2">
                                // Engagement_Protocol
                              </h5>
                              <ul className="grid gap-2">
                                {event.rules.map((rule, i) => (
                                  <li
                                    key={i}
                                    className="flex gap-2 text-xs text-zinc-400 font-mono items-start"
                                  >
                                    <span className="text-[#FF003C] mt-1">
                                      ►
                                    </span>
                                    <span>{rule}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                            {event.specifications && (
                              <div className="space-y-4">
                                <h5 className="text-[#00F0FF] font-mono font-bold text-xs uppercase tracking-widest border-b border-[#00F0FF]/30 pb-2">
                                  // Tech_Specs
                                </h5>
                                <ul className="grid gap-2">
                                  {event.specifications.map((spec, i) => (
                                    <li
                                      key={i}
                                      className="flex gap-2 text-xs text-zinc-400 font-mono items-start"
                                    >
                                      <span className="text-[#00F0FF] mt-1">
                                        ►
                                      </span>
                                      <span>{spec}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                            {event.gameplay && (
                              <div className="space-y-4">
                                <h5 className="text-[#E661FF] font-mono font-bold text-xs uppercase tracking-widest border-b border-[#E661FF]/30 pb-2">
                                  // Mission_Parameters
                                </h5>
                                <ul className="grid gap-2">
                                  {event.gameplay.map((gp, i) => (
                                    <li
                                      key={i}
                                      className="flex gap-2 text-xs text-zinc-400 font-mono items-start"
                                    >
                                      <span className="text-[#E661FF] mt-1">
                                        ITEM_
                                      </span>
                                      <span>{gp}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        )}

                        {activeTab === "register" && (
                          <div className="space-y-6 animate-glitch-entry py-8 text-center">
                            <Rocket
                              size={48}
                              className="text-[#E661FF] animate-bounce mx-auto"
                            />
                            <div>
                              <h4 className="text-2xl font-black text-white font-mono uppercase mb-2">
                                Registration Required
                              </h4>
                              <p className="text-zinc-400 font-mono text-xs max-w-sm mx-auto">
                                All mission deployments must be initialized
                                through the central dashboard command center.
                              </p>
                            </div>
                            <Link
                              href="/dashboard/events"
                              className="inline-flex items-center gap-2 px-8 py-4 bg-[#00F0FF] text-black font-black font-mono tracking-widest hover:bg-white transition-all uppercase text-sm"
                              style={{
                                clipPath:
                                  "polygon(0 0, 95% 0, 100% 30%, 100% 100%, 5% 100%, 0 70%)",
                              }}
                            >
                              <Zap size={16} /> GO_TO_DASHBOARD
                            </Link>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Navigation Tabs */}
            <div className="flex-shrink-0 border-t border-white/10 bg-black/50 p-4 flex justify-center gap-2 md:gap-4 flex-wrap">
              <button
                onClick={() => setActiveTab("about")}
                className={`px-6 py-2 border font-mono text-xs font-bold uppercase tracking-wider transition-all skew-x-[-10deg] ${activeTab === "about" ? "bg-[#E661FF] border-[#E661FF] text-black shadow-[0_0_15px_rgba(230,97,255,0.4)]" : "border-white/20 text-zinc-400 hover:border-white hover:text-white"}`}
              >
                <span className="skew-x-[10deg] inline-block">About</span>
              </button>
              <button
                onClick={() => setActiveTab("rules")}
                className={`px-6 py-2 border font-mono text-xs font-bold uppercase tracking-wider transition-all skew-x-[-10deg] ${activeTab === "rules" ? "bg-[#E661FF] border-[#E661FF] text-black shadow-[0_0_15px_rgba(230,97,255,0.4)]" : "border-white/20 text-zinc-400 hover:border-white hover:text-white"}`}
              >
                <span className="skew-x-[10deg] inline-block">Rules</span>
              </button>
              <button
                onClick={() => setActiveTab("register")}
                className={`px-6 py-2 border font-mono text-xs font-bold uppercase tracking-wider transition-all skew-x-[-10deg] ${activeTab === "register" ? "bg-[#00F0FF] border-[#00F0FF] text-black shadow-[0_0_15px_rgba(0,240,255,0.4)]" : "border-white/20 text-zinc-400 hover:border-white hover:text-white"}`}
              >
                <span className="skew-x-[10deg] inline-block">Register</span>
              </button>
            </div>

            <div className="md:hidden border-t border-[#E661FF]/30 p-0">
              <button
                onClick={handleClose}
                className="w-full bg-[#E661FF] text-black py-4 font-black font-mono text-xs uppercase tracking-widest hover:bg-[#E661FF]/80 transition-all"
              >
                [ CLOSE MODULE ]
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default function EventsPage() {
  const { user, isLoaded } = useUser();
  const [registeredEvents, setRegisteredEvents] = useState<string[]>([]);
  const [activeEventId, setActiveEventId] = useState<string | null>(null);
  const [loadingEventId, setLoadingEventId] = useState<string | null>(null);
  const playOpenSound = useAudio("/audio.wav", 0.1);
  const playCloseSound = useAudio("audio.wav", 0.1);

  const fetchUserData = async () => {
    if (!user) return;
    try {
      const res = await fetch("/api/auth/me");
      if (res.ok) {
        const data = await res.json();
        setRegisteredEvents(data.user.events || []);
      }
    } catch (error) {
      console.error("Failed to fetch user data", error);
    }
  };

  useEffect(() => {
    if (isLoaded && user) {
      fetchUserData();
    }
  }, [isLoaded, user]);

  const handleOpenEvent = (id: string) => {
    setActiveEventId(null);
    setLoadingEventId(id);
    playOpenSound();
    setTimeout(() => {
      setLoadingEventId(null);
      setActiveEventId(id);
    }, 600);
  };

  const handleCloseEvent = () => {
    playCloseSound();
    setActiveEventId(null);
    setLoadingEventId(null);
  };

  return (
    <main className="min-h-screen bg-black text-white relative overflow-hidden">
      <MatrixBackground color="#003B00" text="" />

      <div className="relative z-10 pt-40 pb-32 container mx-auto px-4 md:px-8">
        {/* Page Header */}
        <div className="mb-20 text-center">
          <div className="flex items-center justify-center gap-2 md:gap-4 mb-4">
            <div className="h-[2px] w-12 md:w-20 bg-[#00F0FF]" />
            <span className="text-[#00F0FF] font-mono text-xs md:text-sm font-bold tracking-[0.2em] md:tracking-[0.4em] uppercase">
              SYSTEM_ARENA_INITIALIZED
            </span>
          </div>
          <h1 className="text-6xl md:text-9xl font-black font-mono tracking-tighter uppercase leading-[0.8] mb-8">
            {/* Multi-layered Glitch Effect on EVENT */}
            <div className="relative inline-block glitch-container">
              {/* Red glitch layer */}
              <span
                className="absolute top-0 left-0 text-[#FF003C] mix-blend-screen opacity-70 glitch-layer-red"
                style={{ transform: "translate(-0.02em, 0.02em)" }}
              >
                EVENT
              </span>
              {/* Cyan glitch layer */}
              <span
                className="absolute top-0 left-0 text-[#00F0FF] mix-blend-screen opacity-60 glitch-layer-cyan"
                style={{ transform: "translate(0.03em, -0.02em)" }}
              >
                EVENT
              </span>
              {/* Main white layer */}
              <span className="relative text-white">EVENT</span>
            </div>
            <br />
            <div className="flex justify-center w-full">
              <SlotText
                text="ARENA_"
                className="text-6xl md:text-9xl text-[#00F0FF]"
              />
            </div>
          </h1>
          <p className="text-zinc-500 text-lg font-mono max-w-2xl border-l-2 border-[#00F0FF] pl-6 py-2 bg-gradient-to-r from-[#00F0FF]/5 to-transparent">
            Choose your battlefield. Engage in high-precision robotics, aerial
            maneuvers, or digital warfare.
          </p>
        </div>

        {/* Competitive Section */}
        <div className="mb-16">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-2 h-8 bg-[#FF003C]" />
            <h2 className="text-2xl md:text-4xl font-black font-mono uppercase tracking-widest text-white">
              // COMPETITIVE_PARADIGMS
            </h2>
            <div className="h-[1px] flex-grow bg-gradient-to-r from-[#FF003C]/50 to-transparent" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {events
              .filter((e: any) =>
                ["Robotics", "Aerial", "Gaming"].includes(e.category),
              )
              .map((event: any) => (
                <EventCard
                  key={event.id}
                  event={event}
                  isActive={activeEventId === event.id}
                  isLoading={loadingEventId === event.id}
                  onOpen={() => handleOpenEvent(event.id)}
                  onClose={handleCloseEvent}
                />
              ))}
          </div>
        </div>

        {/* Expos Section */}
        <div className="mb-16">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-2 h-8 bg-[#E661FF]" />
            <h2 className="text-2xl md:text-4xl font-black font-mono uppercase tracking-widest text-white">
              // EXPOS_PARADIGMS
            </h2>
            <div className="h-[1px] flex-grow bg-gradient-to-r from-[#E661FF]/50 to-transparent" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {events
              .filter(
                (e: any) =>
                  !["Robotics", "Aerial", "Gaming"].includes(e.category),
              )
              .map((event: any) => (
                <EventCard
                  key={event.id}
                  event={event}
                  isActive={activeEventId === event.id}
                  isLoading={loadingEventId === event.id}
                  onOpen={() => handleOpenEvent(event.id)}
                  onClose={handleCloseEvent}
                />
              ))}
          </div>
        </div>
      </div>

      <Footer />

      <style jsx global>{`
        /* HEX MESH BACKGROUND */
        .bg-hex-mesh {
          background-color: #080508;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='28' height='49' viewBox='0 0 28 49'%3E%3Cg fill-rule='evenodd'%3E%3Cg id='hexagons' fill='%23E661FF' fill-opacity='0.07' fill-rule='nonzero'%3E%3Cpath d='M13.99 9.25l13 7.5v15l-13 7.5L1 31.75v-15l12.99-7.5zM3 17.9v12.7l10.99 6.34 11-6.35V17.9l-11-6.34L3 17.9zM0 15l12.98-7.5V0h-2v6.35L0 12.69v2.3zm0 18.5L12.98 41v8h-2v-6.85L0 35.81v-2.3zM15 0v7.5L27.99 15H28v-2.31h-.01L17 6.35V0h-2zm0 49v-8l12.99-7.5H28v2.31h-.01L17 42.15V49h-2z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
        }

        /* CUSTOM SCROLLBARS */
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.5);
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #e661ff;
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #d440ef;
        }

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
        @keyframes glitch-entry {
          0% {
            opacity: 0;
            transform: scale(0.97) skewX(-4deg);
            filter: brightness(2);
          }
          50% {
            opacity: 1;
            transform: scale(1.03) skewX(2deg);
            filter: brightness(1.2);
          }
          100% {
            transform: scale(1) skewX(0);
            filter: brightness(1);
          }
        }
        .animate-glitch-entry {
          animation: glitch-entry 0.4s ease-out forwards;
        }

        /* Normal Glitch Effect */
        .glitch-container {
          animation: glitch-skew 3s infinite;
        }
        @keyframes glitch-skew {
          0%,
          100% {
            transform: skew(0deg);
          }
          20% {
            transform: skew(0deg);
          }
          21% {
            transform: skew(-0.6deg);
          }
          22% {
            transform: skew(0deg);
          }
          60% {
            transform: skew(0deg);
          }
          61% {
            transform: skew(0.6deg);
          }
          62% {
            transform: skew(0deg);
          }
        }

        .glitch-layer-red {
          animation: glitch-clip-red 2.5s infinite;
        }
        .glitch-layer-cyan {
          animation: glitch-clip-cyan 2s infinite;
        }

        @keyframes glitch-clip-red {
          0%,
          100% {
            clip-path: inset(0 0 0 0);
          }
          10% {
            clip-path: inset(0 0 0 0);
          }
          11% {
            clip-path: inset(22% 0 58% 0);
          }
          12% {
            clip-path: inset(0 0 0 0);
          }
          50% {
            clip-path: inset(0 0 0 0);
          }
          51% {
            clip-path: inset(42% 0 28% 0);
          }
          52% {
            clip-path: inset(0 0 0 0);
          }
        }

        @keyframes glitch-clip-cyan {
          0%,
          100% {
            clip-path: inset(0 0 0 0);
          }
          15% {
            clip-path: inset(0 0 0 0);
          }
          16% {
            clip-path: inset(32% 0 48% 0);
          }
          17% {
            clip-path: inset(0 0 0 0);
          }
          65% {
            clip-path: inset(0 0 0 0);
          }
          66% {
            clip-path: inset(12% 0 68% 0);
          }
          67% {
            clip-path: inset(0 0 0 0);
          }
        }

        /* NEW ANIMATIONS FOR CARDS */
        @keyframes grid-scroll {
          0% {
            background-position: 0 0;
          }
          100% {
            background-position: 40px 40px;
          }
        }
        .animate-grid-scroll {
          animation: grid-scroll 2s linear infinite;
        }

        @keyframes wind-flow {
          0% {
            transform: translateY(0) rotate(0deg);
            opacity: 0.2;
          }
          50% {
            opacity: 0.5;
          }
          100% {
            transform: translateY(-20px) rotate(5deg);
            opacity: 0.2;
          }
        }
        .animate-wind-flow {
          animation: wind-flow 10s ease-in-out infinite alternate;
        }

        @keyframes radar-spin {
          from {
            transform: translate(-50%, -50%) rotate(0deg);
          }
          to {
            transform: translate(-50%, -50%) rotate(360deg);
          }
        }
        .animate-radar-spin {
          animation: radar-spin 4s linear infinite;
        }

        @keyframes scan-fast {
          0% {
            top: -10%;
          }
          100% {
            top: 110%;
          }
        }
        .animate-scan-fast {
          animation: scan-fast 1s linear infinite;
        }
        .animate-scan-fast-reverse {
          animation: scan-fast 1.5s linear infinite reverse;
        }

        @keyframes noise {
          0% {
            transform: translate(0, 0);
          }
          10% {
            transform: translate(-5%, -5%);
          }
          20% {
            transform: translate(-10%, 5%);
          }
          30% {
            transform: translate(5%, -10%);
          }
          40% {
            transform: translate(-5%, 15%);
          }
          50% {
            transform: translate(-10%, 5%);
          }
          60% {
            transform: translate(15%, 0);
          }
          70% {
            transform: translate(0, 10%);
          }
          80% {
            transform: translate(-15%, 0);
          }
          90% {
            transform: translate(10%, 5%);
          }
          100% {
            transform: translate(5%, 0);
          }
        }
        .animate-noise {
          animation: noise 2s steps(10) infinite;
        }
      `}</style>
    </main>
  );
}
