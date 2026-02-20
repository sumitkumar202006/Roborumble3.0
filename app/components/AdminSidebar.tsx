"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Calendar,
  Settings,
  LogOut,
  Shield,
  Menu,
  X,
  IndianRupee,
  Hotel,
  Music
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, refetchUser } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  // Hide Sidebar on Login Page
  if (pathname === "/admin/login") {
    return null;
  }

  const handleLogout = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("robo_user");
    }
    // Force reload/redirect to clear state completely
    window.location.href = "/";
  };

  const menuItems = [
    { name: "Dashboard", icon: LayoutDashboard, href: "/admin/dashboard" },
    { name: "Payments", icon: IndianRupee, href: "/admin/payments" },
    { name: "Verify Scan", icon: Users, href: "/admin/verify" },
    { name: "Users List", icon: Users, href: "/admin/users" },
    { name: "Announcements", icon: Shield, href: "/admin/announcements" },
    { name: "Events", icon: Calendar, href: "/admin/events" },
    { name: "Street Dance Battle", icon: Music, href: "/admin/dance" },
    { name: "Boarding", icon: Hotel, href: "/admin/boarding" },
    { name: "Settings", icon: Settings, href: "/admin/settings" },
  ];

  return (
    <>
      {/* Mobile Toggle */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="md:hidden fixed top-4 right-4 z-50 p-2 bg-black border border-[#FF003C] text-[#FF003C] rounded-md"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar Overlay (Mobile) */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/80 z-40 md:hidden backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`
          fixed top-0 left-0 h-screen w-64 bg-black border-r border-[#FF003C]/30 z-50 transition-transform duration-300 ease-in-out
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
          md:translate-x-0 flex flex-col justify-between
        `}
      >
        <div className="flex flex-col flex-1 overflow-hidden">
          {/* Header */}
          <div className="p-6 border-b border-[#FF003C]/20 shrink-0">
            <div className="flex items-center gap-3 text-[#FF003C] mb-2">
              <Shield size={28} />
              <h1 className="text-xl font-black font-mono tracking-tighter uppercase">ADMIN_CORE</h1>
            </div>
            <p className="text-zinc-500 font-mono text-[10px] uppercase truncate">
              User: {user?.name || "Unknown"}
            </p>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2 overflow-y-auto custom-scrollbar">
            {menuItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`
                    flex items-center gap-3 p-3 rounded-md font-mono text-xs uppercase tracking-wider transition-all
                    ${isActive
                      ? "bg-[#FF003C]/10 text-[#FF003C] border border-[#FF003C]/50"
                      : "text-zinc-500 hover:text-white hover:bg-white/5 border border-transparent"}
                    `}
                  onClick={() => setIsOpen(false)}
                >
                  <Icon size={18} />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer / Logout */}
        <div className="p-4 border-t border-[#FF003C]/20 shrink-0 bg-black">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 p-3 bg-red-950/20 text-[#FF003C] border border-[#FF003C]/30 hover:bg-[#FF003C] hover:text-black transition-all font-mono text-xs uppercase font-bold tracking-widest"
          >
            <LogOut size={16} /> Terminate
          </button>
        </div>
      </aside>
    </>
  );
}
