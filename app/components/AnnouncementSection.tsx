"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { SlotText } from "./SlotText";
// Define the interface locally if not available easily via import, or try to import it.
// Assuming the user has it in @/lib/db
// import { Announcement } from "@/lib/db";

interface Announcement {
  id: string;
  title: string;
  message: string;
  date: string;
  type: string;
}

export default function AnnouncementSection() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/announcements")
      .then((res) => res.json())
      .then((data) => {
        // If the API returns an error or empty object, handle it
        if (Array.isArray(data)) {
          setAnnouncements(data.slice(0, 3)); // Limit to top 3 for home page
        } else {
          setAnnouncements([]);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch announcements", err);
        setLoading(false);
      });
  }, []);

  return (
    <section className="py-24 relative z-10">
      <div className="container mx-auto px-4 md:px-6">
        <div className="mb-12 text-center">
          <p
            className="text-[#00F0FF] text-lg md:text-3xl lg:text-5xl uppercase tracking-[0.15em] md:tracking-[0.2em] font-black text-center py-4 md:py-8"
            style={{ fontFamily: "var(--font-orbitron)" }}
          >
            // System_Broadcasts
          </p>
        </div>

        <div className="max-w-4xl mx-auto space-y-8">
          {loading ? (
            <div className="text-center text-[#00F0FF] font-mono animate-pulse">
              LOADING_DATA_STREAM...
            </div>
          ) : announcements.length > 0 ? (
            <div className="grid gap-6">
              {announcements.map((a) => (
                <div
                  key={a.id}
                  className="border-l-2 border-[#00F0FF] pl-6 py-4 bg-zinc-900/30 text-left hover:bg-zinc-900/50 transition-colors backdrop-blur-sm relative group"
                >
                  <div className="absolute inset-0 bg-[#00F0FF]/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                  <div className="flex justify-between items-center mb-2">
                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 ${a.type === "alert" ? "bg-red-500/20 text-red-400" : "bg-blue-500/20 text-blue-400"}`}
                    >
                      {a.type.toUpperCase()}
                    </span>
                    <span className="text-zinc-500 font-mono text-[10px]">
                      {new Date(a.date).toLocaleDateString()}
                    </span>
                  </div>
                  <h3 className="text-white text-xl font-bold font-mono uppercase mb-2">
                    {a.title}
                  </h3>
                  <p className="text-zinc-400 text-sm leading-relaxed font-mono">
                    {a.message}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center border border-[#00F0FF]/20 p-8 rounded-lg bg-black/40 backdrop-blur-sm">
              <div className="flex justify-center w-full mb-4">
                <SlotText
                  text="16 - 18 MARCH 2026"
                  className="text-lg md:text-3xl text-[#FF003C] whitespace-nowrap"
                />
              </div>
              <p className="text-zinc-400 font-mono">
                &gt; No active broadcasts detected. Stand by.
              </p>
            </div>
          )}

          <div className="flex justify-center mt-8">
            <Link href="/announcement">
              <button className="px-8 py-3 border border-[#00F0FF] text-[#00F0FF] font-black font-mono tracking-widest hover:bg-[#00F0FF]/10 transition-all uppercase flex items-center gap-2 text-sm">
                View_All_Announcements <ArrowRight size={16} />
              </button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
