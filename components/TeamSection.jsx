"use client";

import { useState, useRef, useEffect } from "react";
import { FaInstagram, FaLinkedinIn, FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { HiOutlineMail } from "react-icons/hi";

// --- TEAM DATA (Same as before) ---
const teamData = {
  core: [
    {
      name: "Devanshu Verma",
      role: "Coordinator",
      img: "/team/Devanshu.jpeg",
      socials: [
        { icon: FaInstagram, link: "https://www.instagram.com/devanshu_id" },
        { icon: FaLinkedinIn, link: "https://www.linkedin.com/in/devanshu" },
        { icon: HiOutlineMail, link: "mailto: devanshuv810@gmail.com" }
      ]
    },
    {
      name: "Raju Ranjan Singh",
      role: "Coordinator",
      img: "/team/Raju.jpeg",
      socials: [
        { icon: FaInstagram, link: "https://www.instagram.com/rraju98181" },
        { icon: FaLinkedinIn, link: "#" },
        { icon: HiOutlineMail, link: "mailto:rraju98181@gmail.com" }
      ]
    },
    {
      name: "Qaaid Iqbal Badri",
      role: "Coordinator",
      img: "/team/Qaaid.jpeg",
      socials: [
        { icon: FaInstagram, link: "#" },
        { icon: FaLinkedinIn, link: "https://www.linkedin.com/in/qaaid-badri-ab57393a8" },
        { icon: HiOutlineMail, link: "mailto:badri.qaaid@gmail.com" }
      ]
    },
    {
      name: "Ayush Kanaujia",
      role: "Logistic Head",
      img: "/team/Ayush.jpeg",
      socials: [
        { icon: FaInstagram, link: "https://www.instagram.com/_ayush_kanoujiya_/" },
        { icon: FaLinkedinIn, link: "https://www.linkedin.com/in/ayush-kanoujiya-50a1b825a" },
        { icon: HiOutlineMail, link: "#" }
      ]
    },
    {
      name: "Shivansh Singh",
      role: "Logistic Head",
      img: "/team/Shivansh.jpeg",
      socials: [
        { icon: FaInstagram, link: "https://www.instagram.com/shivanshsingh105" },
        { icon: FaLinkedinIn, link: "#" },
        { icon: HiOutlineMail, link: "mailto:singhanurag94156@gmail.com" }
      ]
    },
    {
      name: "Nikhil Kanaujiya ",
      role: "PR & Media Head",
      img: "/team/Nikhil.jpeg",
      socials: [
        { icon: FaInstagram, link: "https://www.instagram.com/i.nikhil.shines" },
        { icon: FaLinkedinIn, link: "https://www.linkedin.com/in/nikhil-kumar-shines" },
        { icon: HiOutlineMail, link: "mailto:Nikhilshines176@gmail.com" }
      ]
    },
    {
      name: "Vaishnavi Singh",
      role: "Hospitality Head",
      img: "/team/Vaishnavi.jpg",
      socials: [
        { icon: FaInstagram, link: "#" },
        { icon: FaLinkedinIn, link: "https://www.linkedin.com/in/vaishnavi-singh-397060322" },
        { icon: HiOutlineMail, link: "mailto:Vaishnavisingh1405@gmail.com" }
      ]
    },
    {
      name: "Vaishnavi Pal",
      role: "Hospitality Head",
      img: "/team/Vaishnavi2.jpeg",
      socials: [
        { icon: FaInstagram, link: "https://www.instagram.com/Impaalvaishnavi" },
        { icon: FaLinkedinIn, link: "#" },
        { icon: HiOutlineMail, link: "#" }
      ]
    },
    {
      name: "Neha Singh",
      role: "Artistic head",
      img: "/team/Neha.jpeg",
      socials: [
        { icon: FaInstagram, link: "https://www.instagram.com/nehaart55" },
        { icon: FaLinkedinIn, link: "https://www.linkedin.com/in/neha-singh-b9a122382" },
        { icon: HiOutlineMail, link: "mailto:33nehaa@gmail.com" }
      ]
    },
    {
      name: "Abhirup Dewanjee",
      role: "Artistic head",
      img: "/team/Abhirup.jpeg",
      socials: [
        { icon: FaInstagram, link: "https://www.instagram.com/_adx_art" },
        { icon: FaLinkedinIn, link: "https://www.linkedin.com/in/adx-art-96099b2b4" },
        { icon: HiOutlineMail, link: "mailto:dewanjee147@gmail.com" }
      ]
    },
    {
      name: "Shruti Gupta",
      role: "Artistic Head",
      img: "/team/Shruti.png",
      socials: [
        { icon: FaInstagram, link: "https://www.instagram.com/_itz_shruti_arts" },
        { icon: FaLinkedinIn, link: "https://www.linkedin.com/in/shruti-gupta-123560295" },
        { icon: HiOutlineMail, link: "mailto:sg934016@gmail.com" }
      ]
    },
  ],

  tech: [
    {
      name: "Akshat Darshi",
      role: "Tech Team Head",
      img: "/team/Akshat.jpeg",
      socials: [
        { icon: FaInstagram, link: "https://www.instagram.com/akshat_darshi" },
        { icon: FaLinkedinIn, link: "https://www.linkedin.com/in/akshat-darshi-88742b252" },
        { icon: HiOutlineMail, link: "mailto:akshatsan23@gmail.com" }
      ]
    },
    {
      name: "Kriti Dwivedi",
      role: "Developer",
      img: "/team/Kriti.jpeg",
      socials: [
        { icon: FaInstagram, link: "https://www.instagram.com/Kritidwivedi_14" },
        { icon: FaLinkedinIn, link: "#" },
        { icon: HiOutlineMail, link: "mailto:kritidwivedi3003@gmail.com" }
      ]
    },
    {
      name: "Jai Verma",
      role: "Tech Team Head",
      img: "/team/Jai.jpeg",
      socials: [
        { icon: FaInstagram, link: "https://www.instagram.com/_jaii.verrma_/" },
        { icon: FaLinkedinIn, link: "https://linkedin.com/in/jai-verma-270a49305" },
        { icon: HiOutlineMail, link: "mailto:jaivermacse70@gmail.com" }
      ]
    },
  ]
};

export default function TeamSection() {
  const [activeTeam, setActiveTeam] = useState("core");
  const [selectedMember, setSelectedMember] = useState(teamData.core[0]);
  const scrollRef = useRef(null);

  useEffect(() => {
    setSelectedMember(teamData[activeTeam][0]);
    if (scrollRef.current) scrollRef.current.scrollTo({ left: 0, behavior: 'smooth' });
  }, [activeTeam]);

  // --- NEW FUNCTIONS: Handle Previous & Next Member ---
  const handlePrevMember = () => {
    const currentTeam = teamData[activeTeam];
    const currentIndex = currentTeam.findIndex(member => member.name === selectedMember.name);
    // Logic to go to previous index (loops back to end if at 0)
    const prevIndex = (currentIndex - 1 + currentTeam.length) % currentTeam.length;
    setSelectedMember(currentTeam[prevIndex]);
  };

  const handleNextMember = () => {
    const currentTeam = teamData[activeTeam];
    const currentIndex = currentTeam.findIndex(member => member.name === selectedMember.name);
    // Logic to go to next index (loops back to start if at end)
    const nextIndex = (currentIndex + 1) % currentTeam.length;
    setSelectedMember(currentTeam[nextIndex]);
  };

  const scrollToStart = () => {
    if (scrollRef.current) scrollRef.current.scrollTo({ left: 0, behavior: 'smooth' });
  };
  const scrollToEnd = () => {
    if (scrollRef.current) scrollRef.current.scrollTo({ left: scrollRef.current.scrollWidth, behavior: 'smooth' });
  };
  const isScrollable = teamData[activeTeam].length > 4;

  return (
    <div className="relative z-10 min-h-screen flex flex-col items-center justify-start py-4 text-white overflow-hidden font-sans ">

      <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-5px); }
        }
        .animate-float { animation: float 4s ease-in-out infinite; }
        .animate-fade { animation: fadeIn 0.5s ease-in-out forwards; }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
      `}</style>

      {/* =========================================
          MOBILE VIEW (md:hidden)
         ========================================= */}
      <div className="md:hidden flex flex-col w-full h-screen pt-16 pb-4 relative z-10 px-2">

        {/* 1. TOP TABS */}
        <div className="flex justify-center gap-4 mb-4 shrink-0">
          {["core", "tech"].map((team) => (
            <button
              key={team}
              onClick={() => setActiveTeam(team)}
              className={`
                px-6 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition-all duration-300 border
                ${activeTeam === team
                  ? "bg-[#00FF9E]/10 border-[#00FF9E] text-[#00FF9E] shadow-[0_0_15px_rgba(0,255,158,0.6)]"
                  : "bg-transparent border-gray-700 text-gray-500 hover:border-gray-500"
                }
              `}
            >
              {team === "core" ? "Core Team" : "Tech Team"}
            </button>
          ))}
        </div>

        {/* 2. MAIN PROFILE (Center) */}
        <div className="flex-1 flex flex-col items-center justify-center w-full mb-4">

          {/* SQUARE PHOTO FRAME */}
          <div className="relative w-64 h-64 mb-4 group">
            {/* Tech Frame Corners */}
            <div className="absolute -top-3 -left-3 w-8 h-8 border-t-2 border-l-2 border-[#00FF9E] rounded-tl-sm shadow-[0_0_8px_#00FF9E]"></div>
            <div className="absolute -top-3 -right-3 w-8 h-8 border-t-2 border-r-2 border-[#00FF9E] rounded-tr-sm shadow-[0_0_8px_#00FF9E]"></div>
            <div className="absolute -bottom-3 -left-3 w-8 h-8 border-b-2 border-l-2 border-[#00FF9E] rounded-bl-sm shadow-[0_0_8px_#00FF9E]"></div>
            <div className="absolute -bottom-3 -right-3 w-8 h-8 border-b-2 border-r-2 border-[#00FF9E] rounded-br-sm shadow-[0_0_8px_#00FF9E]"></div>

            {/* Decorators */}
            <div className="absolute top-1/2 -left-4 w-1 h-6 bg-[#00FF9E] -translate-y-1/2 rounded-full opacity-60"></div>
            <div className="absolute top-1/2 -right-4 w-1 h-6 bg-[#00FF9E] -translate-y-1/2 rounded-full opacity-60"></div>

            {/* Main Image */}
            <div className="w-full h-full bg-black/60 overflow-hidden relative border border-[#00FF9E]/30 shadow-lg">
              <img
                key={selectedMember.name}
                src={selectedMember.img}
                alt={selectedMember.name}
                className="w-full h-full object-cover object-top animate-fade"
              />
            </div>
          </div>

          {/* NAME & ROLE */}
          <div className="text-center space-y-1 z-10 w-full mb-3">
            <h2 className="text-xl font-bold uppercase tracking-[0.1em] text-white drop-shadow-md animate-fade">
              {selectedMember.name}
            </h2>
            <p className="text-yellow-400 text-xs font-bold tracking-[0.25em] uppercase animate-fade delay-75">
              {selectedMember.role}
            </p>
          </div>

          {/* SOCIAL ICONS */}
          <div className="flex items-center justify-center gap-4 animate-fade delay-100">
            {selectedMember.socials.map((s, i) => {
              const Icon = s.icon;
              return (
                <a
                  key={i}
                  href={s.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`
                                w-9 h-9 rounded-full border border-yellow-500/60 
                                flex items-center justify-center 
                                text-yellow-400 transition-all duration-300
                                hover:bg-yellow-400 hover:text-black hover:scale-110
                                shadow-[0_0_10px_rgba(250,204,21,0.2)] bg-black/30
                            `}
                >
                  <Icon size={16} />
                </a>
              )
            })}
          </div>
        </div>

        {/* 3. BOTTOM SINGLE ITEM NAVIGATOR (Updated Section) */}
        <div className="w-full mt-auto mb-6 shrink-0 flex items-center justify-center gap-4 px-4">

          {/* LEFT BUTTON */}
          <button
            onClick={handlePrevMember}
            className="p-4 rounded-full border border-white/30 text-white bg-white/5 hover:bg-white/20 transition-all backdrop-blur-sm active:scale-90"
          >
            <FaChevronLeft size={20} />
          </button>

          {/* CENTER: SELECTED THUMBNAIL (Green Box) */}
          <div className="bg-[#0b120d]/80 backdrop-blur-md border border-[#00FF9E] rounded-xl p-2 shadow-[0_0_20px_rgba(0,255,158,0.2)] relative overflow-hidden w-28 h-28 flex flex-col items-center justify-center">

            {/* Thumbnail Image */}
            <div className="w-16 h-16 rounded-lg overflow-hidden border border-yellow-400 mb-1">
              <img
                key={selectedMember.name} // Key change triggers animation
                src={selectedMember.img}
                alt={selectedMember.name}
                className="w-full h-full object-cover object-top animate-fade"
              />
            </div>

            {/* Name inside Box */}
            <p className="text-[9px] text-white uppercase tracking-widest font-bold text-center leading-tight">
              {selectedMember.name.split(" ")[0]}
            </p>
          </div>

          {/* RIGHT BUTTON */}
          <button
            onClick={handleNextMember}
            className="p-4 rounded-full border border-white/30 text-white bg-white/5 hover:bg-white/20 transition-all backdrop-blur-sm active:scale-90"
          >
            <FaChevronRight size={20} />
          </button>

        </div>
      </div>


      {/* =========================================
          DESKTOP VIEW (md:flex) - No Changes
         ========================================= */}
      <div className="hidden md:flex flex-col items-center justify-center min-h-screen py-10 w-full max-w-7xl">
        {/* Toggle Buttons */}
        <div className="flex gap-8 mb-12">
          {["core", "tech"].map((team) => (
            <button
              key={team}
              onClick={() => setActiveTeam(team)}
              className={`px-10 py-3 text-sm font-bold uppercase tracking-widest transition-all duration-300 border-2 rounded-lg bg-transparent
                  ${activeTeam === team
                  ? "text-[#00FF9E] border-[#00FF9E] shadow-[0_0_15px_#00FF9E]"
                  : "text-gray-500 border-white/20 hover:text-white hover:border-white/60"
                }`}
            >
              {team === "core" ? "Core Team" : "Tech Team"}
            </button>
          ))}
        </div>

        {/* Main Content Side-by-Side */}
        <div className="flex w-full items-center justify-center gap-16 px-10">
          {/* Large Image */}
          <div className="relative w-72 h-80 animate-float flex-shrink-0">
            <div className="absolute -top-3 -left-3 w-6 h-6 border-t-2 border-l-2 border-[#00FF9E]" />
            <div className="absolute -top-3 -right-3 w-6 h-6 border-t-2 border-r-2 border-[#00FF9E]" />
            <div className="absolute -bottom-3 -left-3 w-6 h-6 border-b-2 border-l-2 border-[#00FF9E]" />
            <div className="absolute -bottom-3 -right-3 w-6 h-6 border-b-2 border-r-2 border-[#00FF9E]" />

            <div className="w-full h-full p-1 bg-black/50 backdrop-blur-sm">
              <img key={selectedMember.name} src={selectedMember.img} className="w-full h-full object-cover animate-fade" />
            </div>
          </div>

          {/* Text Info */}
          <div className="text-left space-y-4 max-w-lg">
            <h1 className="text-5xl font-black uppercase tracking-wider text-white drop-shadow-lg animate-fade">
              {selectedMember.name}
            </h1>
            <p className="text-[#00FF9E] text-xl tracking-[0.3em] font-bold uppercase animate-fade delay-75">
              {selectedMember.role}
            </p>
            <div className="flex gap-4 pt-4 animate-fade delay-100">
              {selectedMember.socials.map((s, i) => {
                const Icon = s.icon;
                return (
                  <a key={i} href={s.link} target="_blank" rel="noopener noreferrer" className="p-3 border border-white/30 rounded-full hover:bg-[#00FF9E] hover:text-black hover:border-[#00FF9E] transition-all">
                    <Icon size={20} />
                  </a>
                )
              })}
            </div>
          </div>
        </div>

        {/* Bottom Desktop Carousel */}
        <div className="mt-auto mb-4 w-full px-10">
          <div className="flex items-center justify-center gap-4">
            {isScrollable && (
              <button onClick={scrollToStart} className="p-3 bg-black/40 border border-[#00FF9E]/30 text-[#00FF9E] rounded-full hover:bg-[#00FF9E] hover:text-black transition-all">
                <FaChevronLeft />
              </button>
            )}

            <div ref={scrollRef} className="flex gap-6 overflow-x-auto no-scrollbar py-4 justify-start max-w-5xl">
              {teamData[activeTeam].map((member, i) => (
                <div
                  key={i}
                  onClick={() => setSelectedMember(member)}
                  className={`
                                relative w-32 h-40 flex-shrink-0 cursor-pointer transition-all duration-300 border border-white/10 hover:scale-105 group 
                                ${selectedMember.name === member.name ? "border-[#00FF9E] bg-black/60 shadow-[0_0_10px_#00FF9E]" : "opacity-70 bg-black/30"}
                            `}
                >
                  <img src={member.img} className="w-full h-full object-cover opacity-80 group-hover:opacity-100" />
                  <div className="absolute bottom-0 w-full bg-black/80 p-2 text-center">
                    <p className="text-[10px] font-bold text-white uppercase">{member.name.split(" ")[0]}</p>
                  </div>
                </div>
              ))}
            </div>

            {isScrollable && (
              <button onClick={scrollToEnd} className="p-3 bg-black/40 border border-[#00FF9E]/30 text-[#00FF9E] rounded-full hover:bg-[#00FF9E] hover:text-black transition-all">
                <FaChevronRight />
              </button>
            )}
          </div>
        </div>
      </div>

    </div>
  );
}