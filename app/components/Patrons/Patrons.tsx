"use client";

import React, { useState } from "react";
import { X } from "lucide-react";

interface PersonCardProps {
  name: string;
  role: string;
  designation?: string;
  image: string;
  isChief?: boolean;
  bio?: string;
  specs?: string[];
}

export default function Patrons() {
  // 1. CHIEF PATRON DATA
  const chiefPatron = {
    name: "Prof. Vinay Kumar Pathak",
    role: "Chief Patron",
    designation: "Vice Chancellor, CSJMU",
    image: "/vinay-pathak.jpg",
    bio: "A distinguished academician and administrator, Prof. Pathak leads Chhatrapati Shahu Ji Maharaj University as Vice Chancellor. With a Ph.D. in Computer Science (Image Processing) from AKTU, he has previously served as the VC of AKTU and HBTU. He is a pioneer in digital governance and educational reform in Uttar Pradesh.",
    specs: [
      "Ph.D. Computer Science",
      "Former VC of AKTU & HBTU",
      "Expert in Image Processing",
      "Digital Governance Lead",
    ],
  };

  // 2. PATRONS DATA
  const patrons = [
    {
      name: "Dr. Shilpa Kaistha",
      role: "Patron",
      designation: "Dean, Innovation Foundation",
      image: "/dr-shilpa.jpg",
      bio: "Associate Professor in Biotechnology with over 50 publications in Viral Immunology. She serves as the Dean of Innovations, Entrepreneurship, and Startups at CSJMU, overseeing the university's incubation ecosystem.",
      specs: [
        "Ph.D. Univ. of Tennessee",
        "SERB DST Young Scientist",
        "Expert in Applied Microbiology",
      ],
    },
    {
      name: "Dr. Alok Kumar",
      role: "Patron",
      designation: "Director, UIET",
      image: "/dr-alok-kumar.jpg",
      bio: "Associate Professor of Computer Science and Director of the School of Engineering & Technology (UIET). His research focus includes Natural Language Processing, Machine Learning, and Sentiment Analysis.",
      specs: [
        "Ph.D. Computer Science",
        "Director of SET/UIET",
        "Expert in NLP & Deep Learning",
      ],
    },
    {
      name: "Mr. Divyansh Shukla",
      role: "Patron",
      designation: "CEO, Innovation Foundation",
      image: "/Divyansh_Shukla_Law.jpg",
      bio: "Assistant Professor of Law specializing in AI and Cyber Law. As CEO of CSJMIF, he bridges the gap between technical innovation and legal frameworks, focusing on IPR and startup acceleration.",
      specs: [
        "LL.M. NLU Jodhpur",
        "Expert in AI & Cyber Law",
        "IPR Strategy Specialist",
      ],
    },
  ];

  // 3. FACULTY COORDINATORS DATA
  const faculty = [
    {
      name: "Dr. Ajay Tiwari",
      role: "Faculty Coordinator",
      designation: "Asst. Professor, UIET",
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
      designation: "Asst. Professor, UIET",
      image: "/shah.jpeg",
      bio: "Assistant Professor in Computer Science with expertise in Machine Learning and Network Security. He leads the software integration and cybersecurity protocols for competitive segments.",
      specs: [
        "M.Tech Computer Science",
        "Expert in Network Security",
        "Machine Learning Specialist",
      ],
    },
  ];

  // --- REUSABLE CARD COMPONENT ---
  const PersonCard: React.FC<PersonCardProps & { 
    isActive: boolean; 
    onOpen: () => void; 
    onClose: () => void; 
  }> = ({
    name,
    role,
    designation,
    image,
    isChief = false,
    bio,
    specs,
    isActive,
    onOpen,
    onClose,
  }) => {
    return (
      <>
        <div
          className="flex flex-col items-center group relative z-10 cursor-pointer"
          onClick={onOpen}
        >
          {/* PHOTO CONTAINER */}
          <div
            className={`relative ${isChief ? "w-52 h-52 md:w-64 md:h-64" : "w-40 h-40 md:w-48 md:h-48"} mb-6`}
          >
            {/* 1. Neon Glow Background */}
            <div className="absolute inset-0 rounded-full bg-[#00F0FF] blur-[25px] opacity-20 group-hover:opacity-50 transition-opacity duration-500"></div>

            {/* 2. Rotating Ring */}
            <div className="absolute inset-[-6px] rounded-full border-2 border-transparent border-t-[#00F0FF] border-l-[#00F0FF] opacity-80 animate-spin-slow"></div>

            {/* 3. Image Circle */}
            <div className="relative w-full h-full rounded-full overflow-hidden border-2 border-[#00F0FF]/50 group-hover:border-[#00F0FF] shadow-[0_0_20px_rgba(0,240,255,0.3)] transition-all duration-300 bg-gray-900">
              {/* Image */}
              <img
                src={image}
                alt={name}
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* TEXT DETAILS */}
          <div className="text-center">
            <h3
              className={`${isChief ? "text-3xl md:text-5xl" : "text-xl md:text-2xl"} font-bold text-white uppercase tracking-wider group-hover:text-[#00F0FF] transition-colors drop-shadow-lg`}
            >
              {name}
            </h3>

            {/* Divider */}
            <div
              className={`h-1 bg-[#00F0FF] mx-auto rounded-full my-3 shadow-[0_0_8px_#00F0FF] ${isChief ? "w-32" : "w-16"}`}
            ></div>

            <p
              className={`${isChief ? "text-xl" : "text-sm"} text-[#00F0FF] tracking-[0.2em] uppercase font-bold`}
            >
              {role}
            </p>

            {designation && (
              <p className="text-white/70 text-xs md:text-sm mt-1 tracking-widest uppercase font-light">
                {designation}
              </p>
            )}
          </div>
        </div>

        {/* DETAILS DIALOG */}
        {isActive && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 md:p-8">
            {/* Backdrop (Click Outside) */}
            <div
              className="absolute inset-0 bg-black/95 backdrop-blur-md cursor-default"
              onClick={onClose}
            />

            <div className="relative w-full max-w-4xl bg-[#050b14] border border-[#00F0FF] p-1 shadow-[0_0_50px_rgba(0,240,255,0.2)] animate-in fade-in zoom-in duration-300" onClick={(e) => e.stopPropagation()}>
              {/* Header Bar */}
              <div className="bg-[#00F0FF] text-black px-4 py-2 flex justify-between items-center font-mono text-xs md:text-sm font-black uppercase tracking-widest">
                <div className="flex gap-4">
                  <span className="animate-pulse">● PROFILE_ACTIVE</span>
                  <span className="hidden md:inline">ID_VERIFIED</span>
                </div>
                {/* Desktop Close Button */}
                <button
                  onClick={onClose}
                  className="hidden md:block hover:bg-black hover:text-[#00F0FF] px-3 py-1 border border-black transition-colors"
                >
                  [CLOSE]
                </button>
              </div>

              <div className="p-6 md:p-12 overflow-y-auto max-h-[80vh]">
                <div className="grid md:grid-cols-[250px_1fr] gap-8 md:gap-12 items-start">
                  {/* Image Section */}
                  <div className="flex flex-col items-center">
                    <div className="relative w-48 h-48 md:w-60 md:h-60 rounded-full border-4 border-[#00F0FF]/30 overflow-hidden shadow-[0_0_30px_rgba(0,240,255,0.2)]">
                      <img
                        src={image}
                        alt={name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="mt-4 text-[#00F0FF] font-mono text-xs tracking-widest text-center">
                      // {role.toUpperCase().replace(" ", "_")}
                    </div>
                  </div>

                  {/* Content Section */}
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-3xl md:text-4xl font-black text-white uppercase tracking-tight mb-2">
                        {name}
                      </h2>
                      <p className="text-[#00F0FF] text-lg font-bold uppercase tracking-widest">
                        {designation}
                      </p>
                    </div>

                    <div className="h-[1px] w-full bg-gradient-to-r from-[#00F0FF]/50 to-transparent" />

                    {bio && (
                      <p className="text-gray-300 leading-relaxed font-light text-sm md:text-base border-l-2 border-[#00F0FF] pl-4">
                        {bio}
                      </p>
                    )}

                    {specs && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4">
                        {specs.map((spec, i) => (
                          <div
                            key={i}
                            className="bg-[#00F0FF]/5 border border-[#00F0FF]/20 p-3 text-xs md:text-sm text-[#00F0FF] font-mono uppercase flex items-center gap-2"
                          >
                            <span>&gt;</span> {spec}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Mobile Close Button at Bottom */}
                <div className="md:hidden border-t border-[#00F0FF]/30 pt-4 mt-6">
                  <button 
                    onClick={onClose}
                    className="w-full bg-[#00F0FF] text-black py-3 font-black font-mono text-xs uppercase tracking-widest hover:bg-[#00F0FF]/80 transition-all"
                  >
                    [ CLOSE ]
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </>
    );
  };

  const [activePatronName, setActivePatronName] = useState<string | null>(null);

  return (
    <div className="w-full flex flex-col items-center gap-24 pb-20">
      {/* ================= SECTION 1: CHIEF PATRON ================= */}
      <div className="w-full flex flex-col items-center">
        {/* HEADING: CHIEF PATRON */}
        <div className="relative mb-12 text-center">
          <h1 className="text-4xl md:text-6xl font-black text-white uppercase tracking-[0.2em] drop-shadow-[0_0_15px_rgba(255,255,255,0.4)]">
            Chief Patron
          </h1>
          <div className="w-full h-[2px] bg-gradient-to-r from-transparent via-[#00F0FF] to-transparent mt-4"></div>
        </div>

        <PersonCard 
          {...chiefPatron} 
          isChief={true} 
          isActive={activePatronName === chiefPatron.name}
          onOpen={() => setActivePatronName(chiefPatron.name)}
          onClose={() => setActivePatronName(null)}
        />
      </div>

      {/* ================= SECTION 2: PATRONS ================= */}
      <div className="w-full flex flex-col items-center">
        {/* HEADING: PATRONS */}
        <div className="relative mb-16 text-center">
          <h2 className="text-3xl md:text-5xl font-black text-white uppercase tracking-[0.2em] drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">
            Patrons
          </h2>
          <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-[#00F0FF]/50 to-transparent mt-4"></div>
        </div>

        {/* Grid for Patrons */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-16 md:gap-20 w-full max-w-7xl px-4 justify-items-center">
          {patrons.map((p, index) => (
            <PersonCard 
              key={index} 
              {...p} 
              isActive={activePatronName === p.name}
              onOpen={() => setActivePatronName(p.name)}
              onClose={() => setActivePatronName(null)}
            />
          ))}
        </div>
      </div>

      {/* ================= SECTION 3: FACULTY COORDINATORS ================= */}
      <div className="w-full flex flex-col items-center">
        {/* HEADING: FACULTY COORDINATORS */}
        <div className="relative mb-16 text-center">
          <h2 className="text-2xl md:text-4xl font-black text-white uppercase tracking-[0.2em] drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">
            Faculty Coordinators
          </h2>
          <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-[#00F0FF]/50 to-transparent mt-4"></div>
        </div>

        {/* Grid for Faculty */}
        <div className="flex flex-col md:flex-row gap-20 md:gap-40 items-center justify-center w-full px-4">
          {faculty.map((f, index) => (
            <PersonCard 
              key={index} 
              {...f} 
              isActive={activePatronName === f.name}
              onOpen={() => setActivePatronName(f.name)}
              onClose={() => setActivePatronName(null)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
