"use client";

import { useState } from "react";
import Image from "next/image";
import MatrixBackground from "../components/MatrixBackground";
import { SlotText } from "../components/SlotText";
import Footer from "../components/Footer";
import { useAudio } from "../hooks/useAudio";

import { sponsors, SponsorData } from "../data/sponsors";

// --- Internal Component: SponsorCard ---
const SponsorCard = ({
  sponsor,
  delay,
}: {
  sponsor: SponsorData;
  delay: number;
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Preload audio
  const playOpenSound = useAudio("audio.wav", 0.15); // Using audio.wav as generic sound, can be customized
  const playCloseSound = useAudio("audio.wav", 0.15);

  const handleClick = () => {
    if (showDetails || isLoading) return;
    setIsLoading(true);
    playOpenSound();
    setTimeout(() => {
      setIsLoading(false);
      setShowDetails(true);
    }, 600);
  };

  const handleClose = (e: React.MouseEvent) => {
    e.stopPropagation();
    playCloseSound();
    setShowDetails(false);
    setIsHovered(false);
    setIsLoading(false);
  };

  return (
    <div
      className="relative group cursor-pointer"
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Main Preview Card */}
      {/* Main Preview Card */}
      <div
        className="relative w-full h-80 bg-black/40 border-l-4 border-t border-[#00F0FF]/50 hover:bg-[#00F0FF]/10 transition-all duration-500 backdrop-blur-sm flex flex-col items-center justify-center p-4 overflow-hidden"
        style={{
          clipPath: "polygon(0 0, 90% 0, 100% 15%, 100% 100%, 15% 100%, 0 85%)",
        }}
      >
        <div className="text-[#00F0FF] font-mono text-[8px] absolute top-2 left-4 opacity-50 tracking-tighter uppercase z-10 bg-black/50 px-1">
          // PARTNER_ID: {sponsor.name.toUpperCase()}
        </div>

        <div
          className="relative w-full h-full"
          style={{
            clipPath:
              "polygon(0 0, 90% 0, 100% 15%, 100% 100%, 15% 100%, 0 85%)",
          }}
        >
          <Image
            src={sponsor.image}
            alt={sponsor.name}
            fill
            className="object-cover transition-all duration-500 hover:scale-110"
          />
        </div>

        {isHovered && (
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#00F0FF]/20 to-transparent h-[20%] w-full animate-scan pointer-events-none" />
        )}
      </div>

      {/* Expanded Dialog Box */}
      {(isLoading || showDetails) && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-2 md:p-4 lg:p-12 pointer-events-none">
          <div className="absolute inset-0 bg-black/95 backdrop-blur-xl" />

          <div className="relative w-full max-w-sm md:max-w-3xl lg:max-w-4xl bg-[#050505] border border-[#FF003C] p-1 shadow-[0_0_80px_rgba(255,0,60,0.4)] pointer-events-auto overflow-hidden animate-glitch-entry">
            {/* Top Red Status Bar */}
            <div className="bg-[#FF003C] text-black px-3 md:px-6 py-2 flex justify-between items-center font-mono text-[9px] md:text-[11px] font-black uppercase tracking-widest">
              <div className="flex gap-2 md:gap-4">
                <span className="animate-pulse">● SECURE_PARTNER_LOG</span>
                <span className="hidden md:inline">ENCRYPTION_ACTIVE</span>
              </div>
              {/* Desktop Close Button */}
              <button
                onClick={handleClose}
                className="hidden md:block hover:bg-black hover:text-[#FF003C] px-2 md:px-4 py-1 transition-all border border-black font-bold uppercase text-[8px] md:text-[11px]"
              >
                [ CLOSE ]
              </button>
            </div>

            <div className="p-4 md:p-8 lg:p-16 max-h-[60vh] md:max-h-[70vh] overflow-y-auto">
              {isLoading ? (
                <div className="h-[300px] flex flex-col items-center justify-center space-y-6">
                  <div className="w-1 bg-[#FF003C] h-24 animate-pulse" />
                  <p className="text-[#FF003C] font-mono text-xl animate-pulse tracking-[0.7em] font-black uppercase">
                    Decrypting_Partner_Intel
                  </p>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 gap-12">
                  <div className="space-y-8">
                    <div className="aspect-video bg-white/5 border border-[#FF003C]/30 relative flex items-center justify-center p-8">
                      <Image
                        src={sponsor.image}
                        alt={sponsor.name}
                        width={200}
                        height={100}
                        className="object-contain"
                      />
                      <div className="absolute inset-0 border-[20px] border-transparent border-t-[#FF003C]/5 border-l-[#FF003C]/5" />
                    </div>
                    <div className="grid grid-cols-2 gap-4 font-mono text-[10px]">
                      <div className="p-3 border border-[#FF003C]/20 bg-red-950/5">
                        <p className="text-zinc-600 mb-1">TIER</p>
                        <p className="text-[#FF003C] font-bold">
                          {sponsor.category}
                        </p>
                      </div>
                      <div className="p-3 border border-[#FF003C]/20 bg-red-950/5">
                        <p className="text-zinc-600 mb-1">CLEARANCE</p>
                        <p className="text-[#FF003C] font-bold">LEVEL_5</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col">
                    <h4 className="text-5xl font-black text-white font-mono mb-4 uppercase tracking-tighter">
                      {sponsor.name}
                    </h4>
                    <div className="h-1.5 w-24 bg-[#FF003C] mb-8" />
                    <p className="text-zinc-400 font-mono text-sm leading-relaxed mb-8">
                      {sponsor.about}
                    </p>

                    <div className="mb-8">
                      <h5 className="text-[#00F0FF] font-mono text-[10px] mb-2 uppercase tracking-[0.3em] font-bold">
                        Operational_Role:
                      </h5>
                      <p className="text-zinc-500 font-mono text-xs leading-relaxed">
                        {sponsor.operationalRole}
                      </p>
                    </div>

                    <div className="mt-auto pt-6 border-t border-zinc-900">
                      <h5 className="text-[#00F0FF] font-mono text-[10px] mb-4 uppercase tracking-[0.3em] font-bold">
                        Contribution_Specs:
                      </h5>
                      <div className="text-zinc-500 font-mono text-xs flex gap-2">
                        <span className="text-[#FF003C]">/</span>{" "}
                        {sponsor.contribution}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Mobile Close Button at Bottom */}
              <div className="md:hidden border-t border-[#FF003C]/30 p-4">
                <button
                  onClick={handleClose}
                  className="w-full bg-[#FF003C] text-black py-3 font-black font-mono text-xs uppercase tracking-widest hover:bg-[#FF003C]/80 transition-all"
                >
                  [ CLOSE ]
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default function SponsorsPage() {
  return (
    <main className="min-h-screen bg-black text-white relative overflow-hidden">
      <MatrixBackground color="#003B00" text="" />

      <div className="relative z-10 pt-40 pb-20 container mx-auto px-4 md:px-8">
        {/* Page Header */}
        <div className="mb-20 text-center">
          <div className="flex items-center justify-center gap-2 md:gap-4 mb-4">
            <div className="h-[2px] w-12 md:w-20 bg-[#FF003C]" />
            <span className="text-[#FF003C] font-mono text-xs md:text-sm font-bold tracking-[0.2em] md:tracking-[0.4em] uppercase">
              AUTHORIZED_PARTNERS_ONLY
            </span>
          </div>
          <h1 className="text-4xl md:text-6xl lg:text-8xl font-black font-mono tracking-tighter uppercase leading-[0.85] mb-8 break-words">
            <div className="relative inline-block glitch-container">
              <span
                className="absolute top-0 left-0 text-[#FF003C] mix-blend-screen opacity-70 glitch-layer-red"
                style={{ transform: "translate(-0.02em, 0.02em)" }}
              >
                OUR 
              </span>
              <span
                className="absolute top-0 left-0 text-[#00F0FF] mix-blend-screen opacity-60 glitch-layer-cyan"
                style={{ transform: "translate(0.03em, -0.02em)" }}
              >
                OUR 
              </span>
              <span className="relative text-white">OUR </span>
            </div>
            <br />
            <div className="flex justify-center w-full">
              <SlotText
                text="PARTNERS_"
                className="text-4xl md:text-6xl lg:text-8xl text-[#00F0FF]"
              />
            </div>
          </h1>
          <div className="max-w-2xl mx-auto">
            <p className="text-zinc-500 text-lg leading-relaxed font-mono border-l-2 border-[#FF003C] pl-6 py-2 bg-gradient-to-r from-[#FF003C]/5 to-transparent">
              Robo Rumble 3.0 is powered by a network of elite industry leaders.
              These organizations provide the tactical support required for the
              region&apos;s largest technology deployment.
            </p>
          </div>
        </div>

        {/* CTA Section */}
        <div
          className="bg-zinc-950/50 border border-white/5 p-10 md:p-16 backdrop-blur-xl relative overflow-hidden mb-20"
          style={{
            clipPath:
              "polygon(40px 0, 100% 0, 100% calc(100% - 40px), calc(100% - 40px) 100%, 0 100%, 0 40px)",
          }}
        >
          <div className="relative z-10 flex flex-col items-center text-center space-y-8">
            <h3 className="text-4xl font-black text-white font-mono uppercase tracking-tighter">
              Initiate <span className="text-[#00F0FF]">Partnership</span>{" "}
              Protocols?
            </h3>
            <p className="text-zinc-500 font-mono text-sm max-w-xl leading-relaxed uppercase">
              Connect with 1000+ engineers. Showcase your tactical advantage at
              the region&apos;s premier tech fest. Awaiting connection...
            </p>
            <button
              className="px-12 py-4 bg-[#FF003C] text-black font-black font-mono tracking-widest hover:bg-white transition-all uppercase text-sm"
              style={{
                clipPath:
                  "polygon(15% 0, 100% 0, 100% 70%, 85% 100%, 0 100%, 0 30%)",
              }}
            >
              Become_A_Partner
            </button>
          </div>
        </div>

        {/* Sponsors Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-32">
          {sponsors.map((sponsor, i) => (
            <SponsorCard key={i} sponsor={sponsor} delay={i * 0.1} />
          ))}
        </div>
      </div>

      <Footer />

      <style jsx global>{`
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
          animation: scan 2.5s linear infinite;
        }

        @keyframes glitch-entry {
          0% {
            opacity: 0;
            transform: scale(0.98) skewX(-5deg);
            filter: brightness(2);
          }
          50% {
            opacity: 1;
            transform: scale(1.02) skewX(2deg);
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
            transform: skew(-0.8deg);
          }
          22% {
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
          11% {
            clip-path: inset(22% 0 58% 0);
          }
          12% {
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
          16% {
            clip-path: inset(32% 0 48% 0);
          }
          17% {
            clip-path: inset(0 0 0 0);
          }
          66% {
            clip-path: inset(12% 0 68% 0);
          }
          67% {
            clip-path: inset(0 0 0 0);
          }
        }
      `}</style>
    </main>
  );
}
