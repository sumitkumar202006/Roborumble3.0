"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Linkedin, Instagram, Twitter, Youtube, Facebook, Globe } from "lucide-react";

const Footer = () => {
  return (
    <footer className="relative bg-black text-white bg-grid-white/[0.05] overflow-hidden font-mono mt-20">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#00F0FF]/50 to-transparent" />
      <div className="container mx-auto px-6 pt-16 pb-32">
        <div className="flex flex-col md:flex-row justify-between items-center gap-8 md:gap-0">
          {/* Left: Logo */}
          <div className="flex items-center gap-2 group">
            <div className="relative w-10 h-10">
              <Image
                src="/skull-1.png"
                alt="Logo"
                fill
                className="object-contain"
              />
            </div>
            <span className="font-bold text-xl tracking-tighter uppercase">
              Robo_Rumble <span className="text-[#FF003C]">3.0</span>
            </span>
          </div>

          {/* Center: Links */}
          <div className="flex flex-col md:flex-row gap-6 text-sm text-zinc-400">
            <Link
              href="/terms"
              className="hover:text-[#00F0FF] transition-colors uppercase tracking-wide"
            >
              Terms & Conditions
            </Link>
            <Link
              href="/privacy"
              className="hover:text-[#E661FF] transition-colors uppercase tracking-wide"
            >
              Privacy Policy
            </Link>
            <Link
              href="/refund"
              className="hover:text-[#FF003C] transition-colors uppercase tracking-wide"
            >
              Refund & Cancellation
            </Link>
          </div>

          {/* Right: Socials */}
          <div className="flex flex-col items-center md:items-end gap-2">
            <div className="flex gap-3 flex-wrap justify-center md:justify-end">
              <Link
                href="https://youtube.com/@roborumble1?si=43olXlAlSAjSSK9K"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 border border-white/10 text-zinc-400 hover:text-[#FF0000] hover:border-[#FF0000] transition-all"
                title="YouTube"
              >
                <Youtube size={20} />
              </Link>
              <Link
                href="https://x.com/roborumble1"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 border border-white/10 text-zinc-400 hover:text-white hover:border-[#FF003C] transition-all"
                title="X (Twitter)"
              >
                <Twitter size={20} />
              </Link>
              <Link
                href="https://www.instagram.com/roborumble.3.o?igsh=YnZ0YTl6ZDZvZnFk"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 border border-white/10 text-zinc-400 hover:text-[#E1306C] hover:border-[#E661FF] transition-all"
                title="Instagram"
              >
                <Instagram size={20} />
              </Link>
              <Link
                href="https://www.linkedin.com/company/robo-rumble/"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 border border-white/10 text-zinc-400 hover:text-[#0A66C2] hover:border-[#0A66C2] transition-all"
                title="LinkedIn"
              >
                <Linkedin size={20} />
              </Link>
              <Link
                href="https://www.facebook.com/share/1AqXcFnKeK/"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 border border-white/10 text-zinc-400 hover:text-[#1877F2] hover:border-[#1877F2] transition-all"
                title="Facebook"
              >
                <Facebook size={20} />
              </Link>
              <Link
                href="https://roborumble.in/"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 border border-white/10 text-zinc-400 hover:text-[#00F0FF] hover:border-[#00F0FF] transition-all"
                title="Website"
              >
                <Globe size={20} />
              </Link>
            </div>
            <p className="text-zinc-600 text-[10px] uppercase tracking-widest mt-2">
              © 2026 RoboRumble. All rights reserved.
            </p>
          </div>
        </div>
      </div>

      {/* Large Watermark Text */}
      <div className="absolute -bottom-4 md:-bottom-10 left-1/2 -translate-x-1/2 w-full text-center pointer-events-none select-none overflow-hidden">
        <h1 className="text-[15vw] leading-none font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-zinc-800/50 to-black opacity-40">
          ROBORUMBLE
        </h1>
      </div>
    </footer>
  );
};

export default Footer;
