"use client";

import { useState } from "react";
import MatrixBackground from "../components/MatrixBackground";
import { SlotText } from "../components/SlotText";
import Footer from "../components/Footer";

// --- Types ---
interface CardData {
  title: string;
  icon: string;
  shortDesc: string;
  fullDesc: string;
  specs: string[];
  image?: string;
}

// --- Internal Component: AboutCard ---
const AboutCard = ({ data }: { data: CardData }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className="relative group h-full"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Card */}
      <div
        className="relative p-8 bg-black/40 border-l-4 border-t border-[#00F0FF]/50 hover:bg-[#00F0FF]/10 transition-all duration-500 backdrop-blur-sm h-full"
        style={{ clipPath: 'polygon(0 0, 90% 0, 100% 10%, 100% 100%, 10% 100%, 0 90%)' }}
      >
        <div className="text-[#00F0FF] font-mono text-[10px] mb-4 opacity-50 tracking-tighter uppercase relative z-10">
          {"// SUBJECT_ID: "}{data.title.replace(/\s+/g, '_')}
        </div>

        {data.image ? (
          <div className="absolute inset-0 z-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={data.image} alt={data.title} className="w-full h-full object-cover opacity-80 grayscale group-hover:grayscale-0 transition-all duration-500" />
            <div className="absolute inset-0 bg-black/20" />
          </div>
        ) : (
          <div className="w-14 h-14 mb-6 border border-[#00F0FF]/40 flex items-center justify-center bg-[#00F0FF]/10 text-3xl shadow-[0_0_15px_rgba(0,240,255,0.2)] relative z-10">
            {data.icon}
          </div>
        )}

        <h3 className="text-2xl font-black text-white mb-4 font-mono tracking-tighter uppercase group-hover:text-[#00F0FF] transition-colors relative z-10">
          {data.title}
        </h3>
        <p className="text-gray-500 font-mono text-xs leading-relaxed uppercase relative z-10">
          {data.shortDesc}
        </p>

        {isHovered && <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#00F0FF]/20 to-transparent h-[20%] w-full animate-scan pointer-events-none z-20" />}
      </div>
    </div>
  );
};

// --- Default Export: AboutPage ---
export default function AboutPage() {

  const cards: CardData[] = [
    {
      title: "HANDS-ON LEARNING",
      icon: "🛠️",
      shortDesc: "Promote hands-on learning and innovation",
      fullDesc: "The objective of Robo Rumble is to promote hands-on learning and innovation in robotics and emerging technologies.",
      specs: ["Practical Workshops", "Real-world Challenges", "Innovation Hub"],
      image: "/cyberpunk_robotics_innovation.jpg"
    },
    {
      title: "THEORY TO PRACTICE",
      icon: "⚡",
      shortDesc: "Bridge the gap between theory and practice",
      fullDesc: "It aims to bridge the gap between theory and practice while fostering problem-solving, teamwork, and leadership skills.",
      specs: ["Applied Engineering", "Problem Solving", "Strategic Leadership"],
      image: "/cyberpunk_engineering_practice.jpg"
    },
    {
      title: "COLLABORATIVE SPIRIT",
      icon: "🤝",
      shortDesc: "Strengthen technical culture and collaboration",
      fullDesc: "The event also seeks to strengthen the technical culture and collaborative spirit among students.",
      specs: ["Team Synergy", "Tech Culture", "Peer Learning"],
      image: "/cyberpunk_team_collaboration.jpg"
    },
  ];

  return (
    <main className="min-h-screen bg-black text-white relative overflow-hidden">
      {/* Background Matrix Effect */}
      <MatrixBackground color="#043352ff" text="" />

      {/* Navbar Overlay */}

      <div className="relative z-10 pt-40 pb-32 container mx-auto px-4 md:px-8">
        {/* Page Header */}
        <div className="mb-20 text-center">
          <div className="flex items-center justify-center gap-2 md:gap-4 mb-4">
            <div className="h-[2px] w-12 md:w-20 bg-[#FF003C]" />
            <span className="text-[#FF003C] font-mono text-xs md:text-sm font-bold tracking-[0.2em] md:tracking-[0.4em] uppercase">INITIATING_ARCHIVE_RECALL</span>
            <div className="h-[2px] w-12 md:w-20 bg-[#FF003C] md:hidden" />
          </div>
          <h1 className="text-6xl md:text-9xl font-black font-mono tracking-tighter uppercase leading-[0.8] mb-8">
            {/* Multi-layered Glitch Effect */}
            <div className="relative inline-block glitch-container">
              <span className="absolute top-0 left-0 text-[#FF003C] mix-blend-screen opacity-70 glitch-layer-red" style={{ transform: 'translate(-0.02em, 0.02em)' }}>
                ABOUT
              </span>
              <span className="absolute top-0 left-0 text-[#00F0FF] mix-blend-screen opacity-60 glitch-layer-cyan" style={{ transform: 'translate(0.03em, -0.02em)' }}>
                ABOUT
              </span>
              <span className="relative text-white">
                ABOUT
              </span>
            </div>
            <br />
            <div className="flex justify-center w-full translate-x-2 md:translate-x-12">
              <SlotText text="UIET_" className="text-6xl md:text-9xl text-[#00F0FF]" />
            </div>
          </h1>

          {/* UIET Content Section with Image */}
          <div className="grid md:grid-cols-2 gap-8 md:gap-16 items-start text-left mt-10 md:mt-16 mb-12 md:mb-20">
            <div className="space-y-6 md:space-y-8">
              <div className="relative">
                <h3 className="text-2xl sm:text-3xl md:text-5xl font-black text-white font-mono uppercase tracking-tight mb-4 md:mb-6 leading-tight">
                  <span className="text-[#E661FF] block mb-1 md:mb-2 text-sm sm:text-lg md:text-2xl tracking-wider md:tracking-widest">UNIVERSITY INSTITUTE OF</span>
                  ENGINEERING & TECHNOLOGY
                </h3>
                <p className="text-zinc-400 text-sm md:text-lg leading-relaxed font-mono border-l-4 border-[#00F0FF] pl-4 md:pl-6 py-1">
                  UIET Kanpur isn&apos;t just an institution; it&apos;s a <span className="text-[#00F0FF] font-bold">launchpad for dreams</span>.
                  Established in 1996 as a premier engineering hub of CSJMU, it is dedicated to nurturing the
                  next generation of innovators on its sprawling 264-acre campus.
                </p>
              </div>

              <div className="pl-1 md:pl-2">
                <h4 className="text-lg md:text-xl font-bold text-white font-mono uppercase tracking-wider md:tracking-widest mb-2 md:mb-3 flex items-center gap-2 md:gap-3">
                  <span className="text-[#FF003C] text-xl md:text-2xl">{"///"}</span> OUR VISION
                </h4>
                <p className="text-zinc-500 text-xs md:text-base leading-relaxed font-mono max-w-xl">
                  With a relentless pursuit of quality, UIET has emerged as a beacon of technical excellence.
                  We blend state-of-the-art infrastructure with a culture of curiosity, offering diverse programs
                  in Chemical, CSE, ECE, IT, Mechanical, and Material Science engineering.
                </p>
              </div>

              <div className="flex gap-8 md:gap-12 pt-4 md:pt-6 pl-1 md:pl-2">
                <div>
                  <div className="text-3xl md:text-4xl font-black text-white font-mono mb-1">30+</div>
                  <div className="text-[9px] md:text-[10px] text-[#00F0FF] uppercase tracking-wider md:tracking-widest font-mono font-bold">Years of Excellence</div>
                </div>
                <div>
                  <div className="text-3xl md:text-4xl font-black text-white font-mono mb-1">7</div>
                  <div className="text-[9px] md:text-[10px] text-[#E661FF] uppercase tracking-wider md:tracking-widest font-mono font-bold">Departments</div>
                </div>
              </div>
            </div>

            <div className="relative group w-full ml-auto mt-4 md:mt-12">
              <div className="absolute -inset-2 bg-linear-to-r from-[#00F0FF] to-[#E661FF] rounded-xl blur-lg opacity-30 group-hover:opacity-60 transition duration-500"></div>
              <div className="relative aspect-video w-full rounded-xl overflow-hidden border border-white/20 bg-black shadow-2xl">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/uiet-building.png"
                  alt="UIET Campus Night View"
                  className="w-full h-full object-cover scale-105 group-hover:scale-110 transition-transform duration-1000"
                />
                <div className="absolute inset-0 bg-linear-to-t from-black/90 via-transparent to-transparent opacity-80"></div>

                {/* Floating Caption inside image */}
                <div className="absolute bottom-3 md:bottom-6 left-3 md:left-6 right-3 md:right-6 border-l-2 border-[#00F0FF] pl-3 md:pl-4">
                  <p className="text-[#00F0FF] font-mono text-[10px] md:text-xs font-bold tracking-[0.15em] md:tracking-[0.2em] uppercase mb-1">CSJMU CAMPUS, KANPUR</p>
                  <p className="text-white/60 font-mono text-[8px] md:text-[10px] uppercase tracking-wider md:tracking-widest">EST. 1996 {"// CODE: UIET_KNP"}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="max-w-2xl mx-auto">
            <p className="text-zinc-500 text-lg font-mono border-l-2 border-[#FF003C] pl-6 py-2 bg-gradient-to-r from-[#FF003C]/5 to-transparent">
              Robo Rumble is UIET&apos;s flagship technical event dedicated to robotics, innovation, and hands-on engineering experience. It
              provides a platform for students to explore emerging technologies, apply theoretical knowledge to real-world challenges, and work
              collaboratively in a competitive yet learning-focused environment.
              <br /><br />
              With each edition, Robo Rumble has established itself as one of the most successful and impactful technical events at UIET. Robo
              Rumble 3.0 aims to further enhance technical excellence, participation, and overall event quality.
            </p>
          </div>
        </div>

        {/* Cards Infinite Scroll */}
        <div className="w-full overflow-hidden mb-16 md:mb-32 relative mask-linear-fade">
          <div className="flex gap-6 md:gap-10 w-max animate-infinite-scroll hover:pause">
            {[...cards, ...cards, ...cards].map((card, i) => (
              <div key={i} className="w-[80vw] sm:w-[70vw] md:w-[400px] h-[140px] md:h-[160px] shrink-0">
                <AboutCard data={card} />
              </div>
            ))}
          </div>
        </div>

        {/* Timeline Summary */}
        <div className="bg-zinc-950/50 border border-white/5 p-6 md:p-10 lg:p-16 backdrop-blur-xl relative overflow-hidden"
          style={{ clipPath: 'polygon(40px 0, 100% 0, 100% calc(100% - 40px), calc(100% - 40px) 100%, 0 100%, 0 40px)' }}>
          <div className="relative z-10 grid md:grid-cols-2 gap-8 md:gap-16 items-center">
            <div className="space-y-4 md:space-y-6 text-center md:text-left">
              <h3 className="text-2xl md:text-3xl lg:text-4xl font-black text-white font-mono uppercase tracking-tighter break-words">
                Engineering <span className="text-[#00F0FF]">Excellence</span> Since 2024
              </h3>
              <p className="text-zinc-500 font-mono text-xs md:text-sm leading-relaxed">
                A massive gathering of 1000+ innovators across the region.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 md:p-6 bg-zinc-900 border border-[#FF003C] text-center col-span-2">
                <div className="text-3xl md:text-4xl lg:text-5xl font-black text-white font-mono mb-2">2026</div>
                <div className="text-[10px] md:text-xs text-[#FF003C] uppercase font-black font-mono tracking-[0.3em] md:tracking-[0.5em] animate-pulse">EVOLUTION</div>
              </div>
            </div>
          </div>
        </div>
      </div>



      <Footer />

      <style jsx global>{`
        @keyframes scan { 0% { top: -20%; } 100% { top: 120%; } }
        .animate-scan { position: absolute; animation: scan 2.5s linear infinite; }
        @keyframes infinite-scroll { 0% { transform: translateX(0); } 100% { transform: translateX(-33.333%); } }
        .animate-infinite-scroll { animation: infinite-scroll 20s linear infinite; }
        .hover\\:pause:hover { animation-play-state: paused; }
        .mask-linear-fade { mask-image: linear-gradient(to right, transparent, black 5%, black 95%, transparent); -webkit-mask-image: linear-gradient(to right, transparent, black 5%, black 95%, transparent); }
        @keyframes glitch-entry {
          0% { opacity: 0; transform: scale(0.98) skewX(-5deg); }
          50% { opacity: 1; transform: scale(1.02) skewX(2deg); }
          100% { transform: scale(1) skewX(0); }
        }
        .animate-glitch-entry { animation: glitch-entry 0.4s ease-out forwards; }
        
        /* Normal Glitch Effect */
        .glitch-container {
          animation: glitch-skew 3s infinite;
        }
        @keyframes glitch-skew {
          0%, 100% { transform: skew(0deg); }
          20% { transform: skew(0deg); }
          21% { transform: skew(-0.6deg); }
          22% { transform: skew(0deg); }
          60% { transform: skew(0deg); }
          61% { transform: skew(0.6deg); }
          62% { transform: skew(0deg); }
        }
        
        .glitch-layer-red {
          animation: glitch-clip-red 2.5s infinite;
        }
        .glitch-layer-cyan {
          animation: glitch-clip-cyan 2s infinite;
        }
        
        @keyframes glitch-clip-red {
          0%, 100% { clip-path: inset(0 0 0 0); }
          10% { clip-path: inset(0 0 0 0); }
          11% { clip-path: inset(22% 0 58% 0); }
          12% { clip-path: inset(0 0 0 0); }
          50% { clip-path: inset(0 0 0 0); }
          51% { clip-path: inset(42% 0 28% 0); }
          52% { clip-path: inset(0 0 0 0); }
        }
        
        @keyframes glitch-clip-cyan {
          0%, 100% { clip-path: inset(0 0 0 0); }
          15% { clip-path: inset(0 0 0 0); }
          16% { clip-path: inset(32% 0 48% 0); }
          17% { clip-path: inset(0 0 0 0); }
          65% { clip-path: inset(0 0 0 0); }
          66% { clip-path: inset(12% 0 68% 0); }
          67% { clip-path: inset(0 0 0 0); }
        }
      `}</style>
    </main>
  );
}