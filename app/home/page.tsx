"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Calendar,
  MapPin,
  Download,
  Shield,
  Trophy,
  Users,
  Terminal,
} from "lucide-react";

import Footer from "../components/Footer";
import Countdown from "../components/countdown";
import Image from "next/image";
import { sponsors, SponsorData } from "../data/sponsors";
import { events } from "../data/events";
import { useAudio } from "../hooks/useAudio";

// --- Types ---
interface TeamMember {
  name: string;
  role: string;
  dept: string;
  image: string;
  bio?: string;
  specs?: string[];
}

// --- Internal Component: AssetCard ---
const AssetCard = ({
  member,
  delay,
}: {
  member: TeamMember;
  delay: number;
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Preload audio
  const playOpenSound = useAudio("audio.wav", 0.1);
  const playCloseSound = useAudio("audio.wav", 0.1);

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
  };

  return (
    <div
      className="relative group cursor-crosshair h-full"
      onClick={handleClick}
    >
      {/* Enhanced Card Frame */}
      <div className="relative bg-black border border-white/10 hover:border-[#00F0FF]/50 transition-all duration-500 overflow-hidden h-full">
        {/* Corner Tech Brackets */}
        <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-[#00F0FF] z-10" />
        <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-[#00F0FF] z-10" />
        <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-[#FF003C] z-10" />
        <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-[#FF003C] z-10" />

        {/* Status Bar */}
        <div className="bg-zinc-950/80 px-4 py-2 flex justify-between items-center border-b border-white/5">
          <span className="text-[#00F0FF] font-mono text-[9px] uppercase tracking-widest">
            // {member.name.split(" ")[0]}
          </span>
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 bg-[#00F0FF] animate-pulse" />
            <span className="text-zinc-500 font-mono text-[8px]">ACTIVE</span>
          </div>
        </div>

        {/* Photo Container */}
        <div className="relative w-full aspect-square overflow-hidden">
          <Image
            src={member.image}
            alt={member.name}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-110"
          />
          {/* Overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />

          {/* Scan line effect */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#00F0FF]/5 to-transparent h-[30%] animate-scan opacity-0 group-hover:opacity-100" />
        </div>

        {/* Info Section */}
        <div className="p-6 bg-black relative">
          <h3 className="text-xl font-black text-white font-mono uppercase tracking-tight mb-1 group-hover:text-[#00F0FF] transition-colors">
            {member.name}
          </h3>
          <div className="flex items-center gap-2 mb-2">
            <div className="h-[1px] w-6 bg-[#FF003C]" />
            <span className="text-[#FF003C] font-mono text-[10px] font-bold tracking-wider uppercase">
              {member.role}
            </span>
          </div>
          <p className="text-zinc-500 font-mono text-[10px] uppercase tracking-tight">
            {member.dept}
          </p>
        </div>

        {/* Bottom accent */}
        <div className="absolute bottom-0 left-0 w-full h-[2px] bg-gradient-to-r from-[#00F0FF] via-[#E661FF] to-[#FF003C] opacity-50 group-hover:opacity-100 transition-opacity" />
      </div>

      {/* Full Details Dialog */}
      {showDetails && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-2 md:p-4 lg:p-12 pointer-events-none">
          <div className="absolute inset-0 bg-black/95 backdrop-blur-xl" />

          <div className="relative w-full max-w-sm md:max-w-3xl lg:max-w-4xl bg-[#050505] border border-[#FF003C] p-1 shadow-[0_0_80px_rgba(255,0,60,0.4)] pointer-events-auto overflow-hidden animate-glitch-entry">
            {/* Top Alert Bar */}
            <div className="bg-[#FF003C] text-black px-3 md:px-6 py-2 flex justify-between items-center font-mono text-[9px] md:text-[11px] font-black uppercase tracking-widest">
              <div className="flex gap-2 md:gap-4">
                <span className="animate-pulse">● CORE_TEAM_ASSET</span>
                <span className="hidden md:inline">ID_VERIFIED_LEVEL_A</span>
              </div>
              {/* Desktop Close Button */}
              <button
                onClick={handleClose}
                className="hidden md:block hover:bg-black hover:text-[#FF003C] px-2 md:px-4 py-1 transition-all border border-black text-[8px] md:text-[11px]"
              >
                [ CLOSE ]
              </button>
            </div>

            <div className="p-4 md:p-8 lg:p-16 max-h-[60vh] md:max-h-[70vh] overflow-y-auto">
              {isLoading ? (
                <div className="h-[300px] flex flex-col items-center justify-center space-y-6">
                  <div className="w-1 bg-[#FF003C] h-24 animate-pulse" />
                  <p className="text-[#FF003C] font-mono text-xl animate-pulse tracking-[0.7em] font-black uppercase">
                    Deciphering Profile...
                  </p>
                </div>
              ) : (
                <div className="grid md:grid-cols-[300px_1fr] gap-12 items-start">
                  {/* Left Column: Image */}
                  <div className="flex flex-col items-center">
                    <div className="relative w-64 h-64 mb-8 overflow-hidden border-2 border-[#00F0FF]">
                      <Image
                        src={member.image}
                        alt={member.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                  </div>

                  {/* Right Column: Text Content */}
                  <div className="w-full space-y-4">
                    <div className="border-b border-zinc-900 pb-4">
                      <h3 className="text-3xl font-black text-white font-mono uppercase tracking-tighter mb-2">
                        {member.name}
                      </h3>
                      <span className="text-[#FF003C] text-sm font-bold uppercase">
                        {member.role}
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-zinc-400 text-xs">
                        {member.dept}
                      </span>
                    </div>

                    {member.bio && (
                      <p className="text-zinc-300 text-xs leading-relaxed text-left font-mono border-l border-[#00F0FF]/30 pl-3 my-4">
                        {member.bio}
                      </p>
                    )}

                    {member.specs && (
                      <div className="grid grid-cols-2 gap-2 text-left mb-4">
                        {member.specs.map((spec, i) => (
                          <div
                            key={i}
                            className="bg-white/5 p-2 border border-white/10 text-[10px] text-[#00F0FF] uppercase tracking-wide flex items-center gap-2"
                          >
                            <span className="text-[#FF003C]">&gt;</span> {spec}
                          </div>
                        ))}
                      </div>
                    )}

                    <p className="text-zinc-500 text-sm leading-relaxed pt-4 border-t border-zinc-900 uppercase italic">
                      Operational status: active. Coordinating robotics
                      deployment for RR_v3.0.
                    </p>
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
            <div className="absolute bottom-0 w-full p-2 text-[7px] text-zinc-800 font-mono flex justify-between bg-zinc-950/50">
              <span>
                EST_CONN: 0xTEAM_{member.name.split(" ")[0].toUpperCase()}
              </span>
              <span>RR_SECURITY_OVERRIDE_ENABLED</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// --- Internal Component: ChiefPatronCard (Image 1 Style) ---
const ChiefPatronCard = ({ member }: { member: TeamMember }) => {
  return (
    <div className="relative group w-full max-w-md mx-auto">
      {/* Glow Effect behind card */}
      <div className="absolute -inset-1 bg-gradient-to-b from-[#00F0FF]/20 to-transparent blur-xl opacity-100" />

      <div className="relative bg-zinc-950 border-t border-[#00F0FF] overflow-hidden">
        {/* Top Status Bar */}
        <div className="flex justify-between items-center px-4 py-2 bg-black/50 border-b border-white/5">
          <div className="flex items-center gap-2">
            <div className="w-1 h-4 bg-[#00F0FF]" />
            <span className="text-[#00F0FF] font-mono text-[10px] font-bold tracking-widest uppercase">
              // PROF.
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 bg-[#00F0FF] animate-pulse" />
            <span className="text-zinc-500 font-mono text-[8px] tracking-widest uppercase">
              ACTIVE
            </span>
          </div>
        </div>

        {/* Image Container */}
        <div className="relative aspect-[3/4] w-full overflow-hidden">
          <Image
            src={member.image}
            alt={member.name}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-105"
          />
          {/* subtle gradient overlay at bottom for text readability */}
          <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black via-black/80 to-transparent" />
        </div>

        {/* Content Section */}
        <div className="relative p-6 -mt-20">
          <h3 className="text-3xl font-black text-white font-mono uppercase leading-none mb-2 drop-shadow-lg">
            {member.name}
          </h3>
          <div className="flex items-center gap-3 mt-4 mb-2">
            <div className="h-[2px] w-8 bg-[#FF003C]" />
            <span className="text-[#FF003C] font-mono text-sm font-bold tracking-widest uppercase">
              {member.role}
            </span>
          </div>
          <p className="text-zinc-500 font-mono text-[10px] uppercase tracking-wider">
            {member.dept}
          </p>
        </div>

        {/* Bottom Red Accent */}
        <div className="absolute bottom-0 left-0 w-1/3 h-[2px] bg-[#FF003C]" />
        <div className="absolute bottom-0 right-0 w-[2px] h-4 bg-[#FF003C]" />
      </div>
    </div>
  );
};

// --- Internal Component: PatronCard (Image 2 Style - Circular) ---
const PatronCard = ({
  member,
  onClick,
}: {
  member: TeamMember;
  onClick?: () => void;
}) => {
  return (
    <div
      onClick={onClick}
      className={`flex flex-col items-center text-center group ${onClick ? "cursor-pointer" : ""}`}
    >
      {/* Circular Image Container with Tech Ring */}
      <div className="relative w-48 h-48 mb-6">
        {/* Animated Tech Ring SVG */}
        <svg
          className="absolute inset-0 w-full h-full animate-spin-slow text-[#00F0FF]"
          viewBox="0 0 100 100"
        >
          <circle
            cx="50"
            cy="50"
            r="49"
            fill="none"
            stroke="currentColor"
            strokeWidth="0.5"
            strokeDasharray="10 10"
            opacity="0.3"
          />
          <circle
            cx="50"
            cy="50"
            r="46"
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
            strokeDasharray="60 40 60 40"
            strokeLinecap="square"
          />
        </svg>

        {/* Glow effect */}
        <div className="absolute inset-0 rounded-full shadow-[0_0_40px_rgba(0,240,255,0.5)]" />

        {/* Inner static border */}
        <div className="absolute inset-2 rounded-full border border-[#00F0FF]/30" />

        {/* Image */}
        <div className="absolute inset-3 rounded-full overflow-hidden border border-[#00F0FF]/50 bg-black">
          <Image
            src={member.image}
            alt={member.name}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-110"
          />
        </div>

        {/* Status indicator - Orbiting dot */}
        <div className="absolute top-1/2 left-1/2 w-full h-full -translate-x-1/2 -translate-y-1/2 animate-spin-reverse pointer-events-none">
          <div className="absolute top-0 left-1/2 w-2 h-2 bg-[#00F0FF] rounded-full shadow-[0_0_10px_#00F0FF] -translate-x-1/2 -translate-y-1/2" />
        </div>
      </div>

      {/* Name & Role */}
      <h3 className="text-xl font-black text-white font-mono uppercase tracking-tighter mb-2 group-hover:text-[#00F0FF] transition-colors">
        {member.name}
      </h3>

      <div className="flex flex-col items-center gap-1 group-hover:translate-y-1 transition-transform duration-300">
        <div className="w-12 h-[1px] bg-[#00F0FF] mb-2 opacity-100 group-hover:w-20 transition-all" />
        <span className="text-[#00F0FF] font-mono text-[10px] font-bold tracking-[0.2em] uppercase">
          {member.role}
        </span>
        <span className="text-zinc-500 font-mono text-[9px] uppercase tracking-wider max-w-[200px]">
          {member.dept}
        </span>
      </div>
    </div>
  );
};

// --- Main Home Component ---
export default function Home() {
  // Advisor data
  const chiefPatron = {
    name: "Prof. Vinay Kumar Pathak",
    role: "Chief Patron",
    dept: "Vice Chancellor, CSJMU",
    image: "/vinay-pathak.jpg",
    bio: "A distinguished academician and administrator, Prof. Pathak leads Chhatrapati Shahu Ji Maharaj University as Vice Chancellor. With a Ph.D. in Computer Science (Image Processing) from AKTU, he has previously served as the VC of AKTU and HBTU. He is a pioneer in digital governance and educational reform in Uttar Pradesh.",
    specs: [
      "Ph.D. Computer Science",
      "Former VC of AKTU & HBTU",
      "Expert in Image Processing",
      "Digital Governance Lead",
    ],
  };
  const patrons = [
    {
      name: "Dr. Shilpa Kaistha",
      role: "Patron",
      dept: "Dean, Innovation Foundation",
      image: "/dr-shilpa.jpg",
      bio: "Associate Professor in Biotechnology with over 50 publications in Viral Immunology. She serves as the Dean of Innovations, Entrepreneurship, and Startups at CSJMU, overseeing the university's incubation ecosystem.",
      specs: [
        "Ph.D. Univ. of Tennessee",
        "SERB DST Young Scientist",
        "Expert in Applied Microbiology",
      ],
    },
    {
      name: "Mr. Divyansh Shukla",
      role: "Patron",
      dept: "CEO, Innovation Foundation",
      image: "/Divyansh_Shukla_Law.jpg",
      bio: "Assistant Professor of Law specializing in AI and Cyber Law. As CEO of CSJMIF, he bridges the gap between technical innovation and legal frameworks, focusing on IPR and startup acceleration.",
      specs: [
        "LL.M. NLU Jodhpur",
        "Expert in AI & Cyber Law",
        "IPR Strategy Specialist",
      ],
    },
    {
      name: "Dr. Alok Kumar",
      role: "Patron",
      dept: "Director, UIET",
      image: "/alok-sir.jpeg",
      bio: "Associate Professor of Computer Science and Director of the School of Engineering & Technology (UIET). His research focus includes Natural Language Processing, Machine Learning, and Sentiment Analysis.",
      specs: [
        "Ph.D. Computer Science",
        "Director of SET/UIET",
        "Expert in NLP & Deep Learning",
      ],
    },
  ];

  const faculty = [
    {
      name: "Dr. Ajay Tiwari",
      role: "Faculty Coordinator",
      dept: "Asst. Professor, UIET",
      image: "/ajay.jpeg",
      bio: "Specialist in Electronics and Communication Engineering with a research focus on Solid State Physics and Dielectric Materials. He coordinates technical operations for electronic-heavy event segments.",
      specs: [
        "Ph.D. in Physics",
        "Expert in Analog Electronics",
        "Ferroelectric Material Research",
      ],
    },
    {
      name: "Er. Mohd Shah Alam",
      role: "Faculty Coordinator",
      dept: "Asst. Professor, UIET",
      image: "/shah.jpeg",
      bio: "Assistant Professor in Computer Science with expertise in Machine Learning and Network Security. He leads the software integration and cybersecurity protocols for competitive segments.",
      specs: [
        "M.Tech Computer Science",
        "Expert in Cyber Security",
        "Machine Learning Specialist",
      ],
    },
  ];
  const stats = [
    {
      title: `${events.length}`,
      subtitle: "ACTIVE_EVENTS",
      desc: "From Robo Wars to Esports",
      icon: <Shield size={20} />,
      details: {
        headline: `Over ${events.length} Exciting Events`,
        description:
          "Robo Rumble 3.0 features a diverse range of competitions designed to challenge your skills and creativity.",
        events: events.map((e) => e.title),
        note: "Each event offers unique challenges and substantial prizes!",
      },
    },
    {
      title: "₹1.5L+",
      subtitle: "VAL_PRIZE_POOL",
      desc: "Total cash prizes to be won",
      icon: <Trophy size={20} />,
      details: {
        headline: "Massive Prize Pool",
        description:
          "Compete for glory and cash prizes across all events. Winners take home substantial rewards!",
        breakdown: [
          "1st Place: Premium Cash Prizes",
          "2nd Place: Exciting Rewards",
          "3rd Place: Recognition Awards",
          "Special Categories: Best Innovation, Best Design",
        ],
        note: "All participants receive certificates and exclusive merchandise!",
      },
    },
  ];

  // Sponsor modal state
  const [selectedSponsor, setSelectedSponsor] = useState<SponsorData | null>(
    null,
  );

  // Stats modal state
  const [selectedStat, setSelectedStat] = useState<(typeof stats)[0] | null>(
    null,
  );

  // Mentor modal state
  const [selectedMentor, setSelectedMentor] = useState<TeamMember | null>(null);

  return (
    <main className="min-h-screen bg-transparent text-white relative overflow-x-hidden selection:bg-[#00F0FF] selection:text-black">
      {/* Background Matrix Effect */}

      {/* Background Matrix Effect */}

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center pt-32">
        <div className="container mx-auto px-4 md:px-6 z-10 text-center">
          <div className="flex items-center justify-center gap-4 mb-12">
            <div className="h-[2px] w-12 bg-[#FF003C]" />
            <span className="text-[#FF003C] font-mono text-sm font-bold tracking-[0.4em] uppercase">
              Build Compete Dominate
            </span>
            <div className="h-[2px] w-12 bg-[#FF003C]" />
          </div>

          {/* Official Logos & Welcome Text */}
          <div className="flex flex-col items-center gap-6 mb-8 animate-fade-in-up">
            <h2 className="text-xl md:text-2xl font-mono uppercase tracking-[0.3em] text-transparent bg-clip-text bg-gradient-to-r from-[#00F0FF] to-[#E661FF] font-bold drop-shadow-[0_0_10px_rgba(0,240,255,0.5)]">
              UIET Welcomes You
            </h2>

            <div className="flex flex-col items-center gap-4">
              {/* Row 1: University Logo + CSJMIF Logo */}
              <div className="flex flex-row items-center justify-center gap-2 md:gap-8">
                {/* University Logo */}
                <div className="relative w-[140px] h-[140px] md:w-[200px] md:h-[200px] hover:scale-105 transition-transform duration-300 rounded-full overflow-hidden flex items-center justify-center p-4">
                  <Image
                    src="/uni-logo-1.png"
                    alt="CSJMU University Logo"
                    fill
                    className="object-contain drop-shadow-[0_0_15px_rgba(0,240,255,0.3)] filter brightness-110 contrast-125"
                  />
                  <div className="absolute inset-0 bg-[#00F0FF]/5 blur-2xl -z-10 rounded-full" />
                </div>

                {/* CSJMIF Logo */}
                <div className="relative w-[95px] h-[95px] md:w-[140px] md:h-[140px] hover:scale-105 transition-transform duration-300 rounded-full overflow-hidden flex items-center justify-center p-4">
                  <Image
                    src="/csjmif.png"
                    alt="CSJMIF Logo"
                    fill
                    className="object-contain drop-shadow-[0_0_15px_rgba(230,97,255,0.3)] filter brightness-110 contrast-125"
                  />
                  <div className="absolute inset-0 bg-[#E661FF]/5 blur-2xl -z-10 rounded-full" />
                </div>
              </div>

              {/* Row 2: NAAC Grade Logo (smaller) */}
              <div className="relative w-[100px] h-[100px] md:w-[140px] md:h-[140px] hover:scale-105 transition-transform duration-300 rounded-full overflow-hidden flex items-center justify-center p-3">
                <Image
                  src="/naac-5.png"
                  alt="NAAC A++ Accreditation"
                  fill
                  className="object-contain drop-shadow-[0_0_1px_rgba(255,0,60,0.3)] filter brightness-110 contrast-125"
                />
                <div className="absolute inset-0 bg-[#FF003C]/5 blur-2xl -z-10 rounded-full" />
              </div>
            </div>
          </div>

          <h1 className="text-6xl md:text-8xl lg:text-9xl font-black font-mono tracking-tighter uppercase leading-[0.85] mb-8 flex flex-col items-center">
            <div className="flex items-end gap-4">
              <div className="relative inline-block glitch-container">
                <span
                  className="absolute top-0 left-0 text-[#FF003C] mix-blend-screen opacity-70 glitch-layer-red"
                  style={{ transform: "translate(-0.02em, 0.02em)" }}
                >
                  ROBO
                </span>
                <span
                  className="absolute top-0 left-0 text-[#00F0FF] mix-blend-screen opacity-60 glitch-layer-cyan"
                  style={{ transform: "translate(0.03em, -0.02em)" }}
                >
                  ROBO
                </span>
                <span className="relative text-white">ROBO</span>
              </div>
              <span className="text-[6rem] md:text-[10rem] lg:text-[12rem] leading-none align-baseline text-[#00F0FF] font-mono animate-pulse">
                3.0
              </span>
            </div>
            <div className="text-transparent bg-clip-text bg-gradient-to-r from-[#00F0FF] to-[#00F0FF]">
              RUMBLE
            </div>
          </h1>

          <div className="flex flex-col md:flex-row items-center justify-center gap-6 mb-16">
            <Link href="/register" className="w-full md:w-auto group">
              <button
                className="w-full md:w-auto min-w-[280px] px-8 py-4 bg-[#E60073] text-[#FAFAFA] font-black font-mono tracking-widest hover:tracking-[0.2em] transition-all duration-300 uppercase flex items-center justify-center gap-2"
                style={{
                  clipPath:
                    "polygon(15% 0, 100% 0, 100% 70%, 85% 100%, 0 100%, 0 30%)",
                }}
              >
                Register_Now{" "}
                <ArrowRight
                  size={20}
                  className="transition-transform duration-300 group-hover:translate-x-2"
                />
              </button>
            </Link>

            <Link href="/events" className="w-full md:w-auto">
              <button
                className="w-full md:w-auto px-8 py-4 border border-[#00F0FF] text-[#00F0FF] font-black font-mono tracking-widest hover:bg-[#00F0FF]/10 transition-all uppercase"
                style={{
                  clipPath:
                    "polygon(0 0, 85% 0, 100% 30%, 100% 100%, 15% 100%, 0 70%)",
                }}
              >
                Explore_Events
              </button>
            </Link>

            <a
              href="/RoboRumble.pdf"
              target="_blank"
              rel="noopener noreferrer"
              download="RoboRumble_Brochure.pdf"
              className="w-full md:w-auto"
            >
              <button
                className="w-full md:w-auto px-8 py-4 border border-[#E661FF] text-[#E661FF] font-black font-mono tracking-widest hover:bg-[#E661FF]/10 transition-all uppercase flex items-center justify-center gap-2"
                style={{
                  clipPath:
                    "polygon(0 15%, 85% 0, 100% 0, 100% 85%, 15% 100%, 0 100%)",
                }}
              >
                <Download size={20} /> Brochure.pdf
              </button>
            </a>
          </div>

          <div className="mb-10 animate-pulse text-center">
            <h2 className="text-3xl md:text-5xl font-black font-mono uppercase tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-[#FF003C] via-[#E661FF] to-[#00F0FF] drop-shadow-[0_0_25px_rgba(230,97,255,0.5)] transform hover:scale-105 transition-transform duration-300">
              PRIZE_POOL_₹1,50,000+
            </h2>
          </div>

          <div className="flex flex-wrap justify-center gap-12 text-zinc-500 font-mono text-sm mb-16">
            <div className="flex items-center gap-3">
              <Calendar size={18} className="text-[#E661FF]" />
              <span className="tracking-tighter">COMING_SOON</span>
            </div>
            <div className="flex items-center gap-3">
              <MapPin size={18} className="text-[#E661FF]" />
              <span className="tracking-tighter">CSJMU_CAMPUS_KANPUR</span>
            </div>
          </div>

          <div
            className="inline-block p-8 bg-zinc-950/50 border border-white/5 backdrop-blur-md mb-16"
            style={{
              clipPath:
                "polygon(20px 0, 100% 0, 100% calc(100% - 20px), calc(100% - 20px) 100%, 0 100%, 0 20px)",
            }}
          >
            <p className="text-[#FF003C] text-xs mb-4 uppercase tracking-[0.5em] font-black">
              Deployment Countdown
            </p>
            <Countdown targetDate="2026-03-16T09:00:00" />
          </div>
        </div>
      </section>

      {/* Theme Section */}
      <section className="py-24 relative z-10">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid md:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
            {/* Left Content */}
            <div className="space-y-8">
              {/* Theme Badge */}
              <div className="inline-block">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-[#E661FF] font-mono text-[10px] uppercase tracking-[0.3em]">
                    Theme 2026
                  </span>
                </div>
                <div className="relative">
                  <h3 className="text-2xl md:text-3xl font-black font-mono uppercase tracking-tight">
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00F0FF] via-[#E661FF] to-[#FF003C]">
                      NEXUS
                    </span>
                  </h3>
                  <p className="text-zinc-500 font-mono text-[10px] uppercase tracking-[0.2em] border-t border-[#E661FF]/30 pt-1 mt-1">
                    — Circuit of Champions —
                  </p>
                </div>
              </div>

              {/* Main Title */}
              <h2 className="text-5xl md:text-6xl lg:text-7xl font-black uppercase tracking-tighter leading-[0.9]">
                <span className="text-white">THE </span>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00F0FF] to-[#E661FF]">
                  THEME
                </span>
              </h2>

              {/* Tagline */}
              <p className="text-xl md:text-2xl text-zinc-400 leading-relaxed">
                From the battleground of circuits and code,{" "}
                <span className="text-[#00F0FF] font-semibold">
                  innovation awakens
                </span>
                .
              </p>

              {/* Description */}
              <p className="text-zinc-500 leading-relaxed max-w-lg">
                Like warriors of steel and silicon, Robo Rumble 3.0 unfolds as a
                convergence of engineering brilliance and competitive spirit.
                Every bot becomes a testament to human ingenuity.
              </p>

              {/* Stats */}
              <div className="flex gap-8 pt-4">
                <div className="text-center">
                  <div className="text-4xl font-black text-white font-mono">
                    10+
                  </div>
                  <div className="text-[10px] text-[#00F0FF] uppercase tracking-widest font-mono mt-1">
                    Events
                  </div>
                </div>
                <div className="h-12 w-[1px] bg-zinc-800" />
                <div className="text-center">
                  <div className="text-4xl font-black text-white font-mono">
                    03
                  </div>
                  <div className="text-[10px] text-[#E661FF] uppercase tracking-widest font-mono mt-1">
                    Days
                  </div>
                </div>
                <div className="h-12 w-[1px] bg-zinc-800" />
                <div className="text-center">
                  <div className="text-4xl font-black text-white font-mono">
                    ∞
                  </div>
                  <div className="text-[10px] text-[#FF003C] uppercase tracking-widest font-mono mt-1">
                    Energy
                  </div>
                </div>
              </div>
            </div>

            {/* Right Side - Mascot with Moving Bubble Effect */}
            <div className="relative flex items-center justify-center min-h-[400px] md:min-h-[500px]">
              {/* Background gradient blur */}
              <div className="absolute w-[400px] h-[400px] md:w-[500px] md:h-[500px] rounded-full blur-[150px] bg-gradient-to-tr from-[#E661FF]/30 via-[#00F0FF]/20 to-[#FF003C]/20 animate-pulse" />

              {/* Outer rotating orb ring */}
              <div className="absolute w-[320px] h-[320px] md:w-[420px] md:h-[420px] rounded-full border border-[#E661FF]/40 animate-spin-slow" />
              <div className="absolute w-[350px] h-[350px] md:w-[460px] md:h-[460px] rounded-full border border-dashed border-[#00F0FF]/30 animate-spin-reverse" />

              {/* Inner glow orb */}
              <div className="absolute w-[280px] h-[280px] md:w-[380px] md:h-[380px] rounded-full bg-gradient-to-br from-[#E661FF]/15 via-transparent to-[#00F0FF]/15" />

              {/* Robot Image */}
              <Image
                src="/robot.webp"
                alt="Robo Rumble Mascot"
                width={420}
                height={420}
                className="relative z-10 w-64 md:w-[380px] drop-shadow-[0_0_45px_rgba(0,240,255,0.4)] drop-shadow-[0_0_25px_rgba(230,97,255,0.35)] animate-float"
                draggable={false}
              />

              {/* Floating particles */}
              <div className="absolute top-10 right-10 w-2 h-2 bg-[#00F0FF] rounded-full animate-ping" />
              <div
                className="absolute bottom-16 left-8 w-1.5 h-1.5 bg-[#E661FF] rounded-full animate-ping"
                style={{ animationDelay: "0.5s" }}
              />
              <div
                className="absolute top-1/4 right-4 w-1 h-1 bg-[#FF003C] rounded-full animate-ping"
                style={{ animationDelay: "1s" }}
              />
              <div className="absolute bottom-1/4 left-4 w-2 h-2 bg-[#00F0FF]/60 rounded-full animate-pulse" />
            </div>
          </div>
        </div>
      </section>
      <section className="py-24 relative z-10">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {stats.map((stat, i) => (
              <div
                key={i}
                className="relative group overflow-hidden cursor-pointer"
                onClick={() => setSelectedStat(stat)}
              >
                {/* Outer Frame */}
                <div className="relative p-1 bg-gradient-to-br from-[#00F0FF]/30 via-transparent to-[#FF003C]/30">
                  {/* Inner Content */}
                  <div className="relative p-8 bg-black border border-white/5 backdrop-blur-sm">
                    {/* Corner Tech Brackets */}
                    <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-[#00F0FF]" />
                    <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-[#00F0FF]" />
                    <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-[#FF003C]" />
                    <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-[#FF003C]" />

                    {/* Status Bar */}
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-[#00F0FF] animate-pulse" />
                        <span className="text-[#00F0FF] font-mono text-[10px] uppercase tracking-widest">
                          ONLINE
                        </span>
                      </div>
                      <div className="text-zinc-600 font-mono text-[10px]">
                        {stat.icon}
                      </div>
                    </div>

                    {/* Main Value - Digital Display Style */}
                    <div className="relative mb-4">
                      <h3 className="text-6xl md:text-7xl font-black text-white font-mono tracking-tighter group-hover:text-[#00F0FF] transition-colors duration-300">
                        {stat.title}
                      </h3>
                      {/* Glitch overlay on hover */}
                      <div
                        className="absolute inset-0 text-6xl md:text-7xl font-black font-mono tracking-tighter text-[#FF003C] opacity-0 group-hover:opacity-20 transition-opacity"
                        style={{ transform: "translate(2px, -2px)" }}
                      >
                        {stat.title}
                      </div>
                    </div>

                    {/* Subtitle */}
                    <div className="flex items-center gap-2 mb-3">
                      <div className="h-[1px] w-8 bg-[#FF003C]" />
                      <span className="text-[#FF003C] font-mono text-xs font-bold tracking-[0.3em]">
                        {stat.subtitle}
                      </span>
                    </div>

                    {/* Description */}
                    <p className="text-zinc-500 font-mono text-xs uppercase tracking-tight">
                      {stat.desc}
                    </p>

                    {/* Click Hint */}
                    <p className="text-[#00F0FF]/60 font-mono text-[10px] uppercase tracking-widest mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
                      &gt; Click for details
                    </p>

                    {/* Bottom Scan Line */}
                    <div className="absolute bottom-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-[#00F0FF]/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Partners Section - Infinite Scrolling */}
      <section className="py-16 relative z-10 overflow-hidden">
        {/* Title */}
        <div className="container mx-auto px-4 md:px-6 mb-12">
          <p className="text-[#00F0FF] text-[3rem] max-[400]:text-[1rem] uppercase tracking-[0.2em] font-black text-center">
            Previous Partners
          </p>
        </div>

        {/* Infinite Scroll Container */}
        <div className="relative w-full">
          {/* Gradient overlays */}
          <div className="absolute left-0 top-0 bottom-0 w-32 md:w-64 bg-gradient-to-r from-black to-transparent z-10" />
          <div className="absolute right-0 top-0 bottom-0 w-32 md:w-64 bg-gradient-to-l from-black to-transparent z-10" />

          {/* Scrolling track */}
          <div className="flex gap-8 animate-infinite-scroll-slow">
            {/* First set */}
            <div className="flex gap-16 items-center min-w-max">
              {sponsors.map((sponsor, i) => (
                <button
                  key={`s1-${i}`}
                  onClick={() => setSelectedSponsor(sponsor)}
                  className="group relative w-48 h-32 md:w-64 md:h-40 hover:scale-110 transition-transform duration-300 cursor-pointer flex-shrink-0 flex items-center justify-center"
                >
                  <Image
                    src={sponsor.image}
                    alt={sponsor.name}
                    fill
                    className="object-contain p-2"
                  />
                </button>
              ))}
            </div>
            {/* Duplicate set for seamless loop */}
            <div className="flex gap-16 items-center min-w-max">
              {sponsors.map((sponsor, i) => (
                <button
                  key={`s2-${i}`}
                  onClick={() => setSelectedSponsor(sponsor)}
                  className="group relative w-48 h-32 md:w-64 md:h-40 hover:scale-110 transition-transform duration-300 cursor-pointer flex-shrink-0 flex items-center justify-center"
                >
                  <Image
                    src={sponsor.image}
                    alt={sponsor.name}
                    fill
                    className="object-contain p-2"
                  />
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Sponsor Modal */}
      {selectedSponsor && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 pointer-events-none">
          <div
            className="absolute inset-0 bg-black/95 backdrop-blur-xl pointer-events-auto"
            onClick={() => setSelectedSponsor(null)}
          />

          <div className="relative w-full max-w-2xl bg-[#050505] border border-[#00F0FF] p-1 shadow-[0_0_80px_rgba(0,240,255,0.3)] pointer-events-auto animate-glitch-entry">
            {/* Top Bar */}
            <div className="bg-[#00F0FF] text-black px-6 py-2 flex justify-between items-center font-mono text-[11px] font-black uppercase tracking-widest">
              <div className="flex gap-4">
                <span className="animate-pulse">● PARTNER_INTEL</span>
                <span>{selectedSponsor.category}</span>
              </div>
              <button
                onClick={() => setSelectedSponsor(null)}
                className="hover:bg-black hover:text-[#00F0FF] px-4 py-1 transition-all border border-black"
              >
                [ CLOSE ]
              </button>
            </div>

            <div className="p-8 max-h-[70vh] overflow-y-auto">
              <div className="grid md:grid-cols-[200px_1fr] gap-8 items-start">
                {/* Logo */}
                <div className="relative w-full aspect-square bg-white/5 border border-white/10 p-4">
                  <Image
                    src={selectedSponsor.image}
                    alt={selectedSponsor.name}
                    fill
                    className="object-contain p-2"
                  />
                </div>

                {/* Content */}
                <div className="space-y-4">
                  <div className="border-b border-zinc-900 pb-4">
                    <h3 className="text-3xl font-black text-white font-mono uppercase tracking-tighter mb-2">
                      {selectedSponsor.name}
                    </h3>
                    <span className="text-[#00F0FF] text-sm font-bold uppercase">
                      {selectedSponsor.contribution}
                    </span>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <h4 className="text-[#FF003C] text-xs font-mono font-bold uppercase tracking-wider mb-2">
                        // About
                      </h4>
                      <p className="text-zinc-400 text-sm leading-relaxed">
                        {selectedSponsor.about}
                      </p>
                    </div>

                    <div>
                      <h4 className="text-[#E661FF] text-xs font-mono font-bold uppercase tracking-wider mb-2">
                        // Operational Role
                      </h4>
                      <p className="text-zinc-400 text-sm leading-relaxed">
                        {selectedSponsor.operationalRole}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-2 text-[7px] text-zinc-800 font-mono flex justify-between bg-zinc-950/50">
              <span>
                CONN_ID: 0x
                {selectedSponsor.name.toUpperCase().replace(/\s/g, "")}
              </span>
              <span>RR_PARTNER_VERIFIED</span>
            </div>
          </div>
        </div>
      )}

      {/* Advisors & Leadership Section */}
      <section className="py-24 relative z-10 border-y border-white/5">
        <div className="container mx-auto px-4 md:px-6">
          {/* Section Header */}
          <div className="mb-20 text-center">
            <div className="flex items-center justify-center gap-2 md:gap-4 mb-4">
              <div className="h-[2px] w-12 md:w-20 bg-[#FF003C]" />
              <span className="text-[#FF003C] font-mono text-xs md:text-sm font-bold tracking-[0.2em] md:tracking-[0.4em] uppercase">
                LEADERSHIP_&_GUIDANCE
              </span>
              <div className="h-[2px] w-12 md:w-20 bg-[#FF003C]" />
            </div>
            <h2 className="text-3xl md:text-5xl lg:text-6xl font-black font-mono tracking-tighter uppercase">
              <span className="text-white">OUR </span>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00F0FF] to-[#E661FF]">
                MENTORS
              </span>
            </h2>
          </div>

          {/* Chief Command */}
          <div className="space-y-24">
            <div>
              <h3 className="text-xs font-mono font-bold text-[#FF003C] tracking-[0.5em] uppercase mb-10 border-b border-[#FF003C]/20 pb-4 flex items-center gap-4">
                <Terminal size={14} />  Chief_Patron
              </h3>
              <div className="flex justify-center">
                <PatronCard
                  member={chiefPatron}
                  onClick={() => setSelectedMentor(chiefPatron)}
                />
              </div>
            </div>

            {/* Strategic Patrons */}
            <div>
              <h3 className="text-xs font-mono font-bold text-[#00F0FF] tracking-[0.5em] uppercase mb-16 border-b border-[#00F0FF]/20 pb-4 flex items-center gap-4">
                <Terminal size={14} />  Strategic_Patrons
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-12 md:gap-8">
                {patrons.map((p, i) => (
                  <PatronCard
                    key={i}
                    member={p}
                    onClick={() => setSelectedMentor(p)}
                  />
                ))}
              </div>
            </div>

            {/* Technical Advisors */}
            <div>
              <h3 className="text-xs font-mono font-bold text-[#E661FF] tracking-[0.5em] uppercase mb-16 border-b border-[#E661FF]/20 pb-4 flex items-center gap-4">
                <Terminal size={14} />  Technical_Advisors
              </h3>
              <div className="flex flex-wrap justify-center gap-12 md:gap-20">
                {faculty.map((f, i) => (
                  <PatronCard
                    key={i}
                    member={f}
                    onClick={() => setSelectedMentor(f)}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Gallery Section - Infinite Scrolling */}
      <section className="py-24 relative z-10 overflow-hidden">
        <div className="container mx-auto px-4 md:px-6 mb-12">
          <div className="text-center">
            <span className="text-[#E661FF] font-mono text-[10px] uppercase tracking-[0.3em]">
              Memory_Archive
            </span>
            <h2 className="text-3xl md:text-4xl font-black font-mono uppercase tracking-tighter mt-2">
              <span className="text-white">Flowing Through </span>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00F0FF] to-[#E661FF]">
                Time
              </span>
            </h2>
          </div>
        </div>

        {/* Gallery Rows */}
        <div className="space-y-6">
          {/* Row 1 - Scrolling Left */}
          <div className="relative w-full">
            <div className="flex gap-6 animate-gallery-scroll-left">
              {[
                "/flowing_time/IMG-20250215-WA0071.jpg",
                "/flowing_time/IMG-20250215-WA0090.jpg",
                "/flowing_time/IMG-20250215-WA0094.jpg",
                "/flowing_time/IMG-20250217-WA0001.jpg",
                "/flowing_time/IMG-20250219-WA0159.jpg",
                "/flowing_time/IMG-20250219-WA0217.jpg",
              ].map((img, i) => (
                <div
                  key={`r1a-${i}`}
                  className="relative w-[280px] h-[180px] md:w-[350px] md:h-[220px] flex-shrink-0 border-2 border-[#E661FF]/30 rounded-lg overflow-hidden group"
                >
                  <Image
                    src={img}
                    alt={`Event ${i + 1}`}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                </div>
              ))}
              {/* Duplicate for seamless loop */}
              {[
                "/flowing_time/IMG-20250215-WA0071.jpg",
                "/flowing_time/IMG-20250215-WA0090.jpg",
                "/flowing_time/IMG-20250215-WA0094.jpg",
                "/flowing_time/IMG-20250217-WA0001.jpg",
                "/flowing_time/IMG-20250219-WA0159.jpg",
                "/flowing_time/IMG-20250219-WA0217.jpg",
              ].map((img, i) => (
                <div
                  key={`r1b-${i}`}
                  className="relative w-[280px] h-[180px] md:w-[350px] md:h-[220px] flex-shrink-0 border-2 border-[#E661FF]/30 rounded-lg overflow-hidden group"
                >
                  <Image
                    src={img}
                    alt={`Event ${i + 1}`}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                </div>
              ))}
            </div>
          </div>

          {/* Row 2 - Scrolling Right (Opposite direction) */}
          <div className="relative w-full">
            <div className="flex gap-6 animate-gallery-scroll-right">
              {[
                "/flowing_time/IMG-20250219-WA0217.jpg",
                "/flowing_time/IMG-20250219-WA0159.jpg",
                "/flowing_time/IMG-20250217-WA0001.jpg",
                "/flowing_time/IMG-20250215-WA0094.jpg",
                "/flowing_time/IMG-20250215-WA0090.jpg",
                "/flowing_time/IMG-20250215-WA0071.jpg",
              ].map((img, i) => (
                <div
                  key={`r2a-${i}`}
                  className="relative w-[280px] h-[180px] md:w-[350px] md:h-[220px] flex-shrink-0 border-2 border-[#00F0FF]/30 rounded-lg overflow-hidden group"
                >
                  <Image
                    src={img}
                    alt={`Event ${i + 1}`}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                </div>
              ))}
              {/* Duplicate for seamless loop */}
              {[
                "/flowing_time/IMG-20250219-WA0217.jpg",
                "/flowing_time/IMG-20250219-WA0159.jpg",
                "/flowing_time/IMG-20250217-WA0001.jpg",
                "/flowing_time/IMG-20250215-WA0094.jpg",
                "/flowing_time/IMG-20250215-WA0090.jpg",
                "/flowing_time/IMG-20250215-WA0071.jpg",
              ].map((img, i) => (
                <div
                  key={`r2b-${i}`}
                  className="relative w-[280px] h-[180px] md:w-[350px] md:h-[220px] flex-shrink-0 border-2 border-[#00F0FF]/30 rounded-lg overflow-hidden group"
                >
                  <Image
                    src={img}
                    alt={`Event ${i + 1}`}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Stats Modal */}
      {selectedStat && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          onClick={() => setSelectedStat(null)}
        >
          <div
            className="relative w-full max-w-lg bg-black border border-[#00F0FF]/30 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Corner Tech Brackets */}
            <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-[#00F0FF]" />
            <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-[#00F0FF]" />
            <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-[#FF003C]" />
            <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-[#FF003C]" />

            {/* Close Button */}
            <button
              onClick={() => setSelectedStat(null)}
              className="absolute top-4 right-4 text-zinc-500 hover:text-[#FF003C] transition-colors font-mono text-sm"
            >
              [X]
            </button>

            {/* Header */}
            <div className="p-6 border-b border-white/10">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-2 h-2 bg-[#00F0FF] animate-pulse" />
                <span className="text-[#00F0FF] font-mono text-[10px] uppercase tracking-widest">
                  // DATA_STREAM_ACTIVE
                </span>
              </div>
              <h3 className="text-4xl font-black text-white font-mono tracking-tight">
                {selectedStat.title}
              </h3>
              <p className="text-[#FF003C] font-mono text-xs uppercase tracking-widest mt-1">
                // {selectedStat.subtitle}
              </p>
            </div>

            {/* Content */}
            <div className="p-6 space-y-4">
              <h4 className="text-xl font-bold text-white">
                {selectedStat.details.headline}
              </h4>
              <p className="text-zinc-400 font-mono text-sm leading-relaxed">
                {selectedStat.details.description}
              </p>

              {/* Events List or Prize Breakdown */}
              {"events" in selectedStat.details && (
                <div className="grid grid-cols-2 gap-2 mt-4">
                  {(selectedStat.details as any).events.map(
                    (event: string, i: number) => (
                      <div
                        key={i}
                        className="flex items-center gap-2 p-2 bg-[#00F0FF]/5 border border-[#00F0FF]/20 rounded"
                      >
                        <div className="w-1.5 h-1.5 bg-[#00F0FF]" />
                        <span className="text-white font-mono text-xs">
                          {event}
                        </span>
                      </div>
                    ),
                  )}
                </div>
              )}

              {"breakdown" in selectedStat.details && (
                <div className="space-y-2 mt-4">
                  {(selectedStat.details as any).breakdown.map(
                    (item: string, i: number) => (
                      <div
                        key={i}
                        className="flex items-center gap-3 p-3 bg-[#E661FF]/5 border border-[#E661FF]/20 rounded"
                      >
                        <div className="w-6 h-6 flex items-center justify-center bg-[#E661FF]/20 rounded">
                          <Trophy size={14} className="text-[#E661FF]" />
                        </div>
                        <span className="text-white font-mono text-xs">
                          {item}
                        </span>
                      </div>
                    ),
                  )}
                </div>
              )}

              {/* Note */}
              <div className="mt-4 p-3 bg-[#FF003C]/10 border border-[#FF003C]/20 rounded">
                <p className="text-[#FF003C] font-mono text-xs">
                  &gt;_ {selectedStat.details.note}
                </p>
              </div>
            </div>

            {/* Scan Line Effect */}
            <div className="absolute inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-[#00F0FF]/50 to-transparent animate-scan" />
          </div>
        </div>
      )}

      {/* Mentor Modal */}
      {selectedMentor && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 pointer-events-none">
          <div
            className="absolute inset-0 bg-black/95 backdrop-blur-xl pointer-events-auto"
            onClick={() => setSelectedMentor(null)}
          />

          {(() => {
            const getMentorTheme = (role: string) => {
              if (role === "Chief Patron")
                return {
                  main: "#FF003C",
                  shadow: "rgba(255,0,60,0.4)",
                  bg: "rgba(255,0,60,0.05)",
                };
              if (role === "Faculty Coordinator")
                return {
                  main: "#E661FF",
                  shadow: "rgba(230,97,255,0.4)",
                  bg: "rgba(230,97,255,0.05)",
                };
              return {
                main: "#00F0FF",
                shadow: "rgba(0,240,255,0.4)",
                bg: "rgba(0,240,255,0.05)",
              }; // Patron & default
            };

            const theme = getMentorTheme(selectedMentor.role);

            return (
              <div
                className="relative w-full max-w-4xl bg-[#050b14] border p-1 pointer-events-auto overflow-hidden animate-glitch-entry"
                style={{
                  borderColor: theme.main,
                  boxShadow: `0 0 50px ${theme.shadow}`,
                }}
              >
                {/* Top Bar */}
                <div
                  className="text-black px-3 md:px-6 py-2 flex justify-between items-center font-mono text-[9px] md:text-[11px] font-black uppercase tracking-widest leading-none"
                  style={{ backgroundColor: theme.main }}
                >
                  <div className="flex gap-2 md:gap-4 items-center">
                    <span className="animate-pulse">● PROFILE_ACTIVE</span>
                    <span className="hidden md:inline">ID_VERIFIED</span>
                  </div>
                  <button
                    onClick={() => setSelectedMentor(null)}
                    className="hidden md:block hover:bg-black px-2 md:px-4 py-1 transition-all border border-black font-bold text-[8px] md:text-[11px]"
                    style={{ color: "black" }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.color = theme.main)
                    }
                    onMouseLeave={(e) => (e.currentTarget.style.color = "black")}
                  >
                    [ CLOSE ]
                  </button>
                </div>

                <div className="p-4 md:p-8 lg:p-12 max-h-[60vh] md:max-h-[70vh] overflow-y-auto">
                  <div className="grid md:grid-cols-[280px_1fr] gap-8 md:gap-12 items-center">
                    {/* Left Column - Image with Ring */}
                    <div className="flex flex-col items-center">
                      <div className="relative w-52 h-52 md:w-64 md:h-64 mb-6">
                        {/* Tech Ring SVG */}
                        <svg
                          className="absolute inset-0 w-full h-full animate-spin-slow"
                          style={{ color: theme.main }}
                          viewBox="0 0 100 100"
                        >
                          <circle
                            cx="50"
                            cy="50"
                            r="48"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1"
                            strokeDasharray="40 20 40 20"
                            opacity="0.5"
                          />
                          <circle
                            cx="50"
                            cy="50"
                            r="44"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeDasharray="100 200"
                            strokeLinecap="round"
                          />
                        </svg>

                        {/* Glowing static ring */}
                        <div
                          className="absolute inset-2 rounded-full border-2"
                          style={{
                            borderColor: theme.main,
                            boxShadow: `0 0 30px ${theme.shadow}`,
                          }}
                        />

                        {/* Image */}
                        <div
                          className="absolute inset-4 rounded-full overflow-hidden border-2 bg-black"
                          style={{
                            borderColor: `${theme.main}40`, // Adding alpha
                          }}
                        >
                          <Image
                            src={selectedMentor.image}
                            alt={selectedMentor.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                      </div>

                      <div
                        className="font-mono text-xs uppercase tracking-[0.2em] font-bold"
                        style={{ color: theme.main }}
                      >
                        //{" "}
                        {selectedMentor.role === "Chief Patron"
                          ? "CHIEF_PATRON"
                          : selectedMentor.role
                            .toUpperCase()
                            .replace(/\s+/g, "_")}
                      </div>
                    </div>

                    {/* Right Column - Content */}
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <h3 className="text-3xl md:text-4xl lg:text-5xl font-black text-white font-mono uppercase tracking-tighter leading-none">
                          {selectedMentor.name}
                        </h3>
                        <div className="flex items-center gap-2 mt-2">
                          <div
                            className="h-[2px] w-8"
                            style={{ backgroundColor: theme.main }}
                          />
                          <h4
                            className="text-sm md:text-base font-bold uppercase tracking-wide font-mono"
                            style={{ color: theme.main }}
                          >
                            {selectedMentor.dept}
                          </h4>
                        </div>
                      </div>

                      <div
                        className="h-[1px] w-full"
                        style={{
                          background: `linear-gradient(to right, ${theme.main}80, transparent)`,
                        }}
                      />

                      {/* Bio with border-left */}
                      {selectedMentor.bio && (
                        <div
                          className="pl-6 border-l-2 py-3 pr-3"
                          style={{
                            borderColor: theme.main,
                            backgroundColor: theme.bg,
                          }}
                        >
                          <p className="text-zinc-400 text-xs md:text-sm leading-relaxed font-mono">
                            {selectedMentor.bio}
                          </p>
                        </div>
                      )}

                      {/* Specs in Grid Boxes */}
                      {selectedMentor.specs && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-8">
                          {selectedMentor.specs.map((spec, i) => (
                            <div
                              key={i}
                              className="flex items-center gap-3 p-3 md:p-4 bg-zinc-950 border transition-all"
                              style={{
                                borderColor: `${theme.main}33`, // roughly 20% opacity
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.borderColor = theme.main;
                                e.currentTarget.style.backgroundColor = `${theme.main}1A`; // roughly 10%
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.borderColor = `${theme.main}33`;
                                e.currentTarget.style.backgroundColor =
                                  "rgba(9, 9, 11, 1)"; // zinc-950
                              }}
                            >
                              <span
                                className="font-bold text-sm"
                                style={{ color: theme.main }}
                              >
                                &gt;
                              </span>
                              <span className="text-zinc-300 font-mono text-[10px] md:text-xs uppercase tracking-wide">
                                {spec}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Mobile Close Button */}
                  <div
                    className="md:hidden border-t p-4 mt-6"
                    style={{ borderColor: `${theme.main}4D` }}
                  >
                    <button
                      onClick={() => setSelectedMentor(null)}
                      className="w-full text-black py-3 font-black font-mono text-xs uppercase tracking-widest transition-all"
                      style={{ backgroundColor: theme.main }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.opacity = "0.8")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.opacity = "1")
                      }
                    >
                      [ CLOSE ]
                    </button>
                  </div>
                </div>

                {/* Bottom status bar */}
                <div className="absolute bottom-0 w-full p-2 text-[7px] text-zinc-800 font-mono flex justify-between bg-zinc-950/50">
                  <span>
                    EST_CONN: 0x
                    {selectedMentor.name.split(" ")[0].toUpperCase()}
                  </span>
                  <span>ROBO_RUMBLE_v3.0_SECURE</span>
                </div>
              </div>
            );
          })()}
        </div>
      )}

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

        @keyframes infinite-scroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        .animate-infinite-scroll {
          animation: infinite-scroll 30s linear infinite;
        }
        .animate-infinite-scroll:hover {
          animation-play-state: paused;
        }

        .animate-infinite-scroll-slow {
          animation: infinite-scroll 45s linear infinite;
        }
        .animate-infinite-scroll-slow:hover {
          animation-play-state: paused;
        }

        @keyframes float {
          0%,
          100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-15px);
          }
        }
        .animate-float {
          animation: float 4s ease-in-out infinite;
        }

        @keyframes spin-slow {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        .animate-spin-slow {
          animation: spin-slow 25s linear infinite;
        }

        @keyframes spin-reverse {
          from {
            transform: rotate(360deg);
          }
          to {
            transform: rotate(0deg);
          }
        }
        .animate-spin-reverse {
          animation: spin-reverse 30s linear infinite;
        }

        @keyframes gallery-scroll-left {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        @keyframes gallery-scroll-right {
          0% {
            transform: translateX(-50%);
          }
          100% {
            transform: translateX(0);
          }
        }
        .animate-gallery-scroll-left {
          animation: gallery-scroll-left 40s linear infinite;
        }
        .animate-gallery-scroll-right {
          animation: gallery-scroll-right 40s linear infinite;
        }
        .animate-gallery-scroll-left:hover,
        .animate-gallery-scroll-right:hover {
          animation-play-state: paused;
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
          60% {
            transform: skew(0deg);
          }
          61% {
            transform: skew(0.8deg);
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
      `}</style>
    </main>
  );
}
