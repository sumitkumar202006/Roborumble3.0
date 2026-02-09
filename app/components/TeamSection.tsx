"use client";

import { useState, useRef, useEffect } from "react";
import {
  FaInstagram,
  FaLinkedinIn,
  FaChevronLeft,
  FaChevronRight,
} from "react-icons/fa";
import { HiOutlineMail } from "react-icons/hi";

const teamData = {
  core: [
    {
      name: "Devanshu Verma",
      role: "Coordinator",
      img: "/devanshu.jpeg",
      socials: [
        { icon: FaInstagram, link: "https://www.instagram.com/devanshu_id" },
        { icon: FaLinkedinIn, link: "https://www.linkedin.com/in/devanshu" },
        { icon: HiOutlineMail, link: "mailto:devanshuv810@gmail.com" },
      ],
    },
    {
      name: "Raju Ranjan Singh",
      role: "Coordinator",
      img: "/Raju.jpeg",
      socials: [
        { icon: FaInstagram, link: "https://www.instagram.com/rraju98181" },
        { icon: FaLinkedinIn, link: "#" },
        { icon: HiOutlineMail, link: "mailto:rraju98181@gmail.com" },
      ],
    },
    {
      name: "Qaaid Iqbal Badri",
      role: "Coordinator",
      img: "/qaaid.jpeg",
      socials: [
        { icon: FaInstagram, link: "#" },
        {
          icon: FaLinkedinIn,
          link: "https://www.linkedin.com/in/qaaid-badri-ab57393a8",
        },
        { icon: HiOutlineMail, link: "mailto:badri.qaaid@gmail.com" },
      ],
    },
    {
      name: "Ayush Kanaujia",
      role: "Logistic Head",
      img: "/Ayush.jpeg",
      socials: [
        {
          icon: FaInstagram,
          link: "https://www.instagram.com/_ayush_kanoujiya_/",
        },
        {
          icon: FaLinkedinIn,
          link: "https://www.linkedin.com/in/ayush-kanoujiya-50a1b825a",
        },
        { icon: HiOutlineMail, link: "#" },
      ],
    },
    {
      name: "Shivansh Singh",
      role: "Logistic Head",
      img: "/shivansh.jpeg",
      socials: [
        {
          icon: FaInstagram,
          link: "https://www.instagram.com/shivanshsingh105",
        },
        { icon: FaLinkedinIn, link: "#" },
        { icon: HiOutlineMail, link: "mailto:singhanurag94156@gmail.com" },
      ],
    },
    {
      name: "Nikhil Kanaujiya ",
      role: "PR & Media Head",
      img: "/Nikhil.jpeg",
      socials: [
        {
          icon: FaInstagram,
          link: "https://www.instagram.com/i.nikhil.shines",
        },
        {
          icon: FaLinkedinIn,
          link: "https://www.linkedin.com/in/nikhil-kumar-shines",
        },
        { icon: HiOutlineMail, link: "mailto:Nikhilshines176@gmail.com" },
      ],
    },
    {
      name: "Mukesh Yadav",
      role: "Event Manager",
      img: "/mukesh copy.jpeg",
      socials: [
        { icon: FaInstagram, link: "#" },
        { icon: FaLinkedinIn, link: "#" },
        { icon: HiOutlineMail, link: "#" },
      ],
    },
    {
      name: "Vaishnavi Singh",
      role: "Hospitality Head",
      img: "/Vaishnavi.jpeg",
      socials: [
        { icon: FaInstagram, link: "#" },
        {
          icon: FaLinkedinIn,
          link: "https://www.linkedin.com/in/vaishnavi-singh-397060322",
        },
        { icon: HiOutlineMail, link: "mailto:Vaishnavisingh1405@gmail.com" },
      ],
    },
    {
      name: "Vaishnavi Pal",
      role: "Hospitality Head",
      img: "/Vaishnavi2.jpeg",
      socials: [
        {
          icon: FaInstagram,
          link: "https://www.instagram.com/Impaalvaishnavi",
        },
        { icon: FaLinkedinIn, link: "#" },
        { icon: HiOutlineMail, link: "#" },
      ],
    },
    {
      name: "Neha Singh",
      role: "Artistic head",
      img: "/Neha.jpeg",
      socials: [
        { icon: FaInstagram, link: "https://www.instagram.com/nehaart55" },
        {
          icon: FaLinkedinIn,
          link: "https://www.linkedin.com/in/neha-singh-b9a122382",
        },
        { icon: HiOutlineMail, link: "mailto:33nehaa@gmail.com" },
      ],
    },
    {
      name: "Aman Maurya",
      role: "Graphic and Designing Head",
      img: "/aman-2.jpeg",
      socials: [
        {
          icon: FaInstagram,
          link: "https://www.instagram.com/me.aman_2005?igsh=azJhMHpzOWtwOTM3",
        },
        { icon: FaLinkedinIn, link: "https://www.linkedin.com/in/maurya-aman-satyendra-a19835368?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app" },
        { icon: HiOutlineMail, link: "mailto:mauryaman2005@gmail.com" },
      ],
    },
    {
      name: "Abhirup Dewanjee",
      role: "Artistic head",
      img: "/Abhirup.jpeg",
      socials: [
        { icon: FaInstagram, link: "https://www.instagram.com/_adx_art" },
        {
          icon: FaLinkedinIn,
          link: "https://www.linkedin.com/in/adx-art-96099b2b4",
        },
        { icon: HiOutlineMail, link: "mailto:dewanjee147@gmail.com" },
      ],
    },
    {
      name: "Shruti Gupta",
      role: "Artistic Head",
      img: "/Shruti.png",
      socials: [
        {
          icon: FaInstagram,
          link: "https://www.instagram.com/_itz_shruti_arts",
        },
        {
          icon: FaLinkedinIn,
          link: "https://www.linkedin.com/in/shruti-gupta-123560295",
        },
        { icon: HiOutlineMail, link: "mailto:sg934016@gmail.com" },
      ],
    },
  ],

  tech: [
    {
      name: "Akshat Darshi",
      role: "Tech Team Head",
      img: "/Akshat.jpeg",
      socials: [
        { icon: FaInstagram, link: "https://www.instagram.com/akshat_darshi" },
        {
          icon: FaLinkedinIn,
          link: "https://www.linkedin.com/in/akshat-darshi-88742b252",
        },
        { icon: HiOutlineMail, link: "mailto:akshatsan23@gmail.com" },
      ],
    },
    {
      name: "Kriti Dwivedi",
      role: "Developer",
      img: "/Kriti.jpeg",
      socials: [
        {
          icon: FaInstagram,
          link: "https://www.instagram.com/Kritidwivedi_14",
        },
        { icon: FaLinkedinIn, link: "#" },
        { icon: HiOutlineMail, link: "mailto:kritidwivedi3003@gmail.com" },
      ],
    },
    {
      name: "Anant Tirupati",
      role: "Technical Lead",
      img: "/anant.jpeg",
      socials: [
        { icon: FaInstagram, link: "#" },
        { icon: FaLinkedinIn, link: "#" },
        { icon: HiOutlineMail, link: "#" },
      ],
    },
    {
      name: "Aakshant Kumar",
      role: "Technical Lead",
      img: "/aakshant-2.jpeg",
      socials: [
        { icon: FaInstagram, link: "#" },
        { icon: FaLinkedinIn, link: "#" },
        { icon: HiOutlineMail, link: "#" },
      ],
    },
  ],
  contributors: [
    {
      name: "Mukut Kumar",
      role: "Contributor",
      img: "/Mukut.jpeg",
      socials: [
        { icon: FaInstagram, link: "#" },
        { icon: FaLinkedinIn, link: "#" },
        { icon: HiOutlineMail, link: "#" },
      ],
    },
    {
      name: "Shreya Jain",
      role: "Contributor",
      img: "/Shreya.jpeg",
      socials: [
        { icon: FaInstagram, link: "#" },
        { icon: FaLinkedinIn, link: "#" },
        { icon: HiOutlineMail, link: "#" },
      ],
    },
    {
      name: "Jai Verma",
      role: "Contributor",
      img: "/Jai.jpeg",
      socials: [
        { icon: FaInstagram, link: "https://www.instagram.com/_jaii.verrma_/" },
        {
          icon: FaLinkedinIn,
          link: "https://linkedin.com/in/jai-verma-270a49305",
        },
        { icon: HiOutlineMail, link: "mailto:jaivermacse70@gmail.com" },
      ],
    },
    {
      name: "Sumit Kumar",
      role: "Contributor",
      img: "/sumit.jpeg",
      socials: [
        { icon: FaInstagram, link: "https://www.instagram.com/_jaii.verrma_/" },
        {
          icon: FaLinkedinIn,
          link: "https://linkedin.com/in/jai-verma-270a49305",
        },
        { icon: HiOutlineMail, link: "mailto:jaivermacse70@gmail.com" },
      ],
    },
  ],
};

export default function TeamSection() {
  const [activeTeam, setActiveTeam] = useState<
    "core" | "tech" | "contributors"
  >("core");
  const [selectedMember, setSelectedMember] = useState(teamData.core[0]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setSelectedMember(teamData[activeTeam][0]);
    if (scrollRef.current)
      scrollRef.current.scrollTo({ left: 0, behavior: "smooth" });
  }, [activeTeam]);

  const handlePrevMember = () => {
    const currentTeam = teamData[activeTeam];
    const currentIndex = currentTeam.findIndex(
      (m) => m.name === selectedMember.name,
    );
    const prevIndex =
      (currentIndex - 1 + currentTeam.length) % currentTeam.length;
    setSelectedMember(currentTeam[prevIndex]);
  };

  const handleNextMember = () => {
    const currentTeam = teamData[activeTeam];
    const currentIndex = currentTeam.findIndex(
      (m) => m.name === selectedMember.name,
    );
    const nextIndex = (currentIndex + 1) % currentTeam.length;
    setSelectedMember(currentTeam[nextIndex]);
  };

  const scrollToStart = () => {
    if (scrollRef.current)
      scrollRef.current.scrollTo({ left: 0, behavior: "smooth" });
  };
  const scrollToEnd = () => {
    if (scrollRef.current)
      scrollRef.current.scrollTo({
        left: scrollRef.current.scrollWidth,
        behavior: "smooth",
      });
  };
  const isScrollable = teamData[activeTeam].length > 4;

  return (
    <div className="relative z-10 w-full py-20 flex flex-col items-center justify-start text-white overflow-hidden font-sans">
      <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        @keyframes float {
          0%,
          100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-5px);
          }
        }
        .animate-float {
          animation: float 4s ease-in-out infinite;
        }
        .animate-fade {
          animation: fadeIn 0.5s ease-in-out forwards;
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
      `}</style>

      <div className="container mx-auto px-4 md:px-6 mb-8 text-center">
        <p
          className="text-[#00F0FF] text-xl md:text-3xl lg:text-5xl uppercase tracking-[0.15em] md:tracking-[0.2em] font-black py-4 md:py-8"
          style={{ fontFamily: "var(--font-orbitron)" }}
        >
          // Meet_The_Team
        </p>
      </div>

      {/* MOBILE VIEW */}
      <div className="md:hidden flex flex-col w-full relative z-10 px-2">
        <div className="flex flex-col items-center gap-4 mb-8 shrink-0">
          {["core", "tech", "contributors"].map((team) => (
            <button
              key={team}
              onClick={() => setActiveTeam(team as "core" | "tech")}
              className={`px-6 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition-all duration-300 border ${
                activeTeam === team
                  ? "bg-[#00F0FF]/10 border-[#00F0FF] text-[#00F0FF] shadow-[0_0_15px_rgba(0,240,255,0.6)]"
                  : "bg-transparent border-zinc-700 text-zinc-500"
              }`}
            >
              {team === "core"
                ? "Core Team"
                : team === "tech"
                  ? "Tech Team"
                  : "Contributors"}
            </button>
          ))}
        </div>

        <div className="flex-1 flex flex-col items-center justify-center w-full mb-8">
          <div className="relative w-64 h-64 mb-6 group">
            <div className="absolute -top-3 -left-3 w-8 h-8 border-t-2 border-l-2 border-[#00F0FF] rounded-tl-sm shadow-[0_0_8px_#00F0FF]"></div>
            <div className="absolute -top-3 -right-3 w-8 h-8 border-t-2 border-r-2 border-[#00F0FF] rounded-tr-sm shadow-[0_0_8px_#00F0FF]"></div>
            <div className="absolute -bottom-3 -left-3 w-8 h-8 border-b-2 border-l-2 border-[#00F0FF] rounded-bl-sm shadow-[0_0_8px_#00F0FF]"></div>
            <div className="absolute -bottom-3 -right-3 w-8 h-8 border-b-2 border-r-2 border-[#00F0FF] rounded-br-sm shadow-[0_0_8px_#00F0FF]"></div>
            <div className="w-full h-full bg-black/60 overflow-hidden relative border border-[#00F0FF]/30 backdrop-blur-sm">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                key={selectedMember.name}
                src={selectedMember.img}
                alt={selectedMember.name}
                className="w-full h-full object-cover object-top animate-fade"
              />
            </div>
          </div>

          <div className="text-center space-y-1 z-10 w-full mb-6">
            <h2 className="text-xl font-bold uppercase tracking-wider text-white drop-shadow-md animate-fade">
              {selectedMember.name}
            </h2>
            <p className="text-[#E661FF] text-xs font-bold tracking-[0.25em] uppercase animate-fade">
              {selectedMember.role}
            </p>
          </div>

          <div className="flex items-center justify-center gap-4 animate-fade">
            {selectedMember.socials.map((s, i) => {
              const Icon = s.icon;
              return (
                <a
                  key={i}
                  href={s.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-full border border-[#E661FF]/60 flex items-center justify-center text-[#E661FF] transition-all hover:bg-[#E661FF] hover:text-black"
                >
                  <Icon size={16} />
                </a>
              );
            })}
          </div>
        </div>

        <div className="w-full shrink-0 flex items-center justify-center gap-4 px-4">
          <button
            onClick={handlePrevMember}
            className="p-4 rounded-full border border-white/30 text-white bg-white/5 backdrop-blur-sm active:scale-90"
          >
            <FaChevronLeft size={20} />
          </button>
          <div className="bg-[#0b120d]/80 backdrop-blur-md border border-[#00F0FF] rounded-xl p-2 shadow-[0_0_20px_rgba(0,240,255,0.2)] w-28 h-28 flex flex-col items-center justify-center">
            <div className="w-16 h-16 rounded-lg overflow-hidden border border-[#E661FF] mb-1">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                key={selectedMember.name}
                src={selectedMember.img}
                alt={selectedMember.name}
                className="w-full h-full object-cover object-top animate-fade"
              />
            </div>
            <p className="text-[9px] text-white uppercase tracking-widest font-bold text-center">
              {selectedMember.name.split(" ")[0]}
            </p>
          </div>
          <button
            onClick={handleNextMember}
            className="p-4 rounded-full border border-white/30 text-white bg-white/5 backdrop-blur-sm active:scale-90"
          >
            <FaChevronRight size={20} />
          </button>
        </div>
      </div>

      {/* DESKTOP VIEW */}
      <div className="hidden md:flex flex-col items-center justify-center w-full max-w-7xl">
        <div className="flex gap-8 mb-12">
          {["core", "tech", "contributors"].map((team) => (
            <button
              key={team}
              onClick={() =>
                setActiveTeam(team as "core" | "tech" | "contributors")
              }
              className={`px-10 py-3 text-sm font-bold uppercase tracking-widest transition-all duration-300 border-2 rounded-lg ${activeTeam === team ? "text-[#00F0FF] border-[#00F0FF] shadow-[0_0_15px_#00F0FF]" : "text-zinc-500 border-white/20 hover:text-white"}`}
            >
              {team === "core"
                ? "Core Team"
                : team === "tech"
                  ? "Tech Team"
                  : "Contributors"}
            </button>
          ))}
        </div>

        <div className="flex w-full items-center justify-center gap-16 px-10 mb-12">
          <div className="relative w-80 h-96 animate-float flex-shrink-0">
            <div className="absolute -top-3 -left-3 w-6 h-6 border-t-2 border-l-2 border-[#00F0FF]" />
            <div className="absolute -top-3 -right-3 w-6 h-6 border-t-2 border-r-2 border-[#00F0FF]" />
            <div className="absolute -bottom-3 -left-3 w-6 h-6 border-b-2 border-l-2 border-[#00F0FF]" />
            <div className="absolute -bottom-3 -right-3 w-6 h-6 border-b-2 border-r-2 border-[#00F0FF]" />
            <div className="w-full h-full p-1 bg-black/50 backdrop-blur-sm border border-[#00F0FF]/20">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                key={selectedMember.name}
                src={selectedMember.img}
                alt={selectedMember.name}
                className="w-full h-full object-cover animate-fade relative z-0"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent z-10" />
            </div>
          </div>

          <div className="text-left space-y-6 max-w-lg">
            <h1 className="text-5xl font-black uppercase tracking-wider text-white animate-fade">
              {selectedMember.name}
            </h1>
            <p className="text-[#E661FF] text-xl tracking-[0.3em] font-bold uppercase animate-fade">
              // {selectedMember.role}
            </p>
            <div className="flex gap-4 pt-4 animate-fade">
              {selectedMember.socials.map((s, i) => {
                const Icon = s.icon;
                return (
                  <a
                    key={i}
                    href={s.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 border border-white/30 rounded-full hover:bg-[#00F0FF] hover:text-black transition-all text-[#00F0FF]"
                  >
                    <Icon size={20} />
                  </a>
                );
              })}
            </div>
          </div>
        </div>

        <div className="w-full px-10">
          <div className="flex items-center justify-center gap-4">
            {isScrollable && (
              <button
                onClick={scrollToStart}
                className="p-3 bg-black/40 border border-[#00F0FF]/30 text-[#00F0FF] rounded-full hover:bg-[#00F0FF] hover:text-black"
              >
                <FaChevronLeft />
              </button>
            )}
            <div
              ref={scrollRef}
              className="flex gap-6 overflow-x-auto no-scrollbar py-4 justify-start max-w-5xl scroll-smooth"
              style={{
                maskImage:
                  "linear-gradient(to right, transparent, black 10%, black 90%, transparent)",
              }}
            >
              {teamData[activeTeam].map((member, i) => (
                <div
                  key={i}
                  onClick={() => setSelectedMember(member)}
                  className={`relative w-32 h-40 shrink-0 cursor-pointer transition-all border ${selectedMember.name === member.name ? "border-[#00F0FF] shadow-[0_0_10px_#00F0FF] scale-105" : "opacity-70 border-white/10 hover:opacity-100"}`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={member.img}
                    alt={member.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent" />
                  <div className="absolute bottom-0 w-full p-2 text-center z-10">
                    <p className="text-[10px] font-bold text-white uppercase">
                      {member.name.split(" ")[0]}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            {isScrollable && (
              <button
                onClick={scrollToEnd}
                className="p-3 bg-black/40 border border-[#00F0FF]/30 text-[#00F0FF] rounded-full hover:bg-[#00F0FF] hover:text-black"
              >
                <FaChevronRight />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
