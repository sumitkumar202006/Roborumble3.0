"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { X, Menu, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { user, loading } = useAuth();


  /* Nav Items adapted for Robo Rumble */
  const navItems = [
    { label: 'HOME', color: '#00F0FF', href: '/home' },           // Cyan
    { label: 'ABOUT', color: '#FFD700', href: '/about' },     // Gold/Yellow
    { label: 'EVENTS', color: '#FF003C', href: '/events' },   // Red/Pink (Glitch)
    { label: 'SCHEDULE', color: '#00F0FF', href: '/schedule' }, // Cyan
    { label: 'GALLERY', color: '#E661FF', href: '/gallery' },   // Magenta
    { label: 'TEAM', color: '#f200ffff', href: '/team' },       // Purple
    { label: 'PATRONS', color: '#00FF9E', href: '/patrons' },   // Green
    { label: 'SPONSORS', color: '#FF003C', href: '/sponsors' },       // Red
  ];

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  return (
    <div className="fixed top-0 left-0 w-full z-50">
      <div className="bg-black/80 backdrop-blur-md border-b border-white/10">
        <nav className="container mx-auto px-4 md:px-8 py-4 flex items-center justify-between">
          {/* Left Side: Logo */}
          <Link href="/home" className="flex items-center gap-3 group">
            <div className="relative w-16 h-16">
              <Image src="/skull-1.png" alt="Logo" fill className="object-contain" />
            </div>
            <span className="text-white font-black text-xl tracking-tighter group-hover:text-[#00E5FF] transition-colors">
              ROBO RUMBLE
            </span>
          </Link>

          {/* Desktop Navigation - Hidden on mobile/tablet */}
          <div className="hidden lg:flex items-center gap-5">
            {navItems.map((item, index) => (
              <a
                key={index}
                href={item.href}
                className="relative group/item"
              >
                <div className="absolute -bottom-1 left-0 w-0 h-[2px] group-hover/item:w-full transition-all duration-300" style={{ backgroundColor: item.color }} />
                <span className="text-gray-400 font-bold text-[10px] md:text-xs group-hover/item:text-white transition-colors tracking-widest">{item.label}</span>
              </a>
            ))}
          </div>

          {/* Desktop Register Button - Hidden on mobile/tablet */}
          <div className="hidden lg:flex items-center gap-4">
             {loading ? (
                // Loading Placeholder to prevent layout shift or flicker
                <div className="w-[100px] h-[40px] animate-pulse bg-white/5 border border-white/10" />
             ) : user ? (
                <Link href="/account">
                  <button className="bg-[#00E5FF]/10 border border-[#00E5FF] text-[#00E5FF] font-bold px-6 py-2 flex items-center gap-2 hover:bg-[#00E5FF]/20 transition-all font-mono tracking-widest text-sm shadow-[0_0_10px_rgba(0,229,255,0.2)]">
                    <User size={16} />
                    {user.name.toUpperCase()}
                  </button>
                </Link>
             ) : (
               <>
                 <Link href="/login">
                    <button className="text-white hover:text-[#00E5FF] font-bold px-4 py-2 font-mono tracking-widest text-sm border border-white/20 hover:border-[#00E5FF] transition-all">
                      LOGIN
                    </button>
                 </Link>
                 <Link href="/register">
                    <button className="bg-[#00E5FF]/90 text-black font-bold px-6 py-2 flex items-center gap-2 hover:bg-[#33EFFF] transition-colors shadow-[0_0_15px_rgba(0,229,255,0.4)]" style={{ clipPath: 'polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px)' }}>
                      REGISTER
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                        <path d="M9 18l6-6-6-6" />
                      </svg>
                    </button>
                 </Link>
               </>
             )}
          </div>

          {/* Mobile Hamburger Menu - Visible on mobile/tablet */}
          <button
            onClick={toggleSidebar}
            className="lg:hidden text-white hover:text-[#00E5FF] transition-colors p-2"
            aria-label="Toggle menu"
          >
            <Menu size={28} />
          </button>
        </nav>
      </div>

      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40 lg:hidden"
          onClick={closeSidebar}
        />
      )}

      {/* Mobile Sidebar */}
      <div
        className={`fixed top-0 right-0 h-full w-80 bg-black border-l border-[#00E5FF]/30 z-50 transform transition-transform duration-300 ease-in-out lg:hidden overflow-y-auto ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
      >
        {/* Sidebar Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="relative w-12 h-12">
              <Image src="/skull-1.png" alt="Logo" fill className="object-contain" />
            </div>
            <span className="text-white font-black text-lg tracking-tighter">
              MENU
            </span>
          </div>
          <button
            onClick={closeSidebar}
            className="text-white hover:text-[#FF003C] transition-colors p-2"
            aria-label="Close menu"
          >
            <X size={24} />
          </button>
        </div>

        {/* Sidebar Navigation Links */}
        <div className="flex flex-col p-6 space-y-3 pb-32">
          {navItems.map((item, index) => (
            <Link
              key={index}
              href={item.href}
              onClick={closeSidebar}
              className="group/item py-3 px-4 border-l-2 border-transparent hover:border-[#00E5FF] hover:bg-white/5 transition-all"
            >
              <span
                className="text-gray-400 font-bold tracking-widest group-hover/item:text-white transition-colors text-xs"
                style={{ color: item.color }}
              >
                {item.label}
              </span>
            </Link>
          ))}

          {/* Decorative System Text - Below Links */}
          <div className="pt-6 space-y-2 opacity-30">
            <p className="text-[#00E5FF] font-mono text-[8px] tracking-widest">// ROBO_RUMBLE_v3.0</p>
            <p className="text-[#00E5FF] font-mono text-[8px] tracking-widest">// SYSTEM_ONLINE</p>
          </div>
        </div>

        {/* Sidebar Register/Login Buttons */}
        <div className="sticky bottom-0 left-0 right-0 p-6 border-t border-white/10 bg-black space-y-3">
          {loading ? (
             <div className="w-full h-[50px] animate-pulse bg-white/5 border border-white/10" />
          ) : user ? (
            <Link href="/account" onClick={closeSidebar}>
               <button className="w-full bg-[#00E5FF]/10 border border-[#00E5FF] text-[#00E5FF] font-bold py-4 px-6 flex items-center justify-center gap-2 hover:bg-[#00E5FF]/20 transition-all font-mono tracking-widest text-sm shadow-[0_0_10px_rgba(0,229,255,0.2)]">
                  <User size={16} />
                  {user.name.toUpperCase()}
               </button>
            </Link>
          ) : (
            <div className='flex flex-col gap-4'>
              <Link href="/login" onClick={closeSidebar}>
                 <button className="w-full bg-transparent border border-white/20 text-white font-bold py-3 px-6 hover:border-[#00E5FF] hover:text-[#00E5FF] transition-all font-mono tracking-widest text-sm">
                    LOGIN
                 </button>
              </Link>
              <Link href="/register" onClick={closeSidebar}>
                <button className="w-full bg-[#00E5FF]/90 text-black font-bold py-4 px-6 flex items-center justify-center gap-2 hover:bg-[#33EFFF] transition-colors shadow-[0_0_15px_rgba(0,229,255,0.4)]" style={{ clipPath: 'polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px)' }}>
                  REGISTER
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                    <path d="M9 18l6-6-6-6" />
                  </svg>
                </button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Navbar;