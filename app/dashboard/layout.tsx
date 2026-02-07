"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { UserButton, SignOutButton } from "@clerk/nextjs";
import { motion, AnimatePresence } from "framer-motion";
import {
    Home,
    Users,
    Trophy,
    FileText,
    Settings,
    LogOut,
    Menu,
    X,
    Zap,
    ChevronRight,
} from "lucide-react";

const navItems = [
    { href: "/dashboard", label: "Dashboard", icon: Home, color: "cyan" },
    { href: "/dashboard/team", label: "My Team", icon: Users, color: "blue" },
    { href: "/dashboard/events", label: "Events", icon: Trophy, color: "yellow" },
    { href: "/dashboard/registrations", label: "Registrations", icon: FileText, color: "purple" },
];

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const colorClasses = {
        cyan: "from-cyan-500/20 to-cyan-500/5 border-cyan-500/30 text-cyan-400",
        blue: "from-blue-500/20 to-blue-500/5 border-blue-500/30 text-blue-400",
        yellow: "from-yellow-500/20 to-yellow-500/5 border-yellow-500/30 text-yellow-400",
        purple: "from-purple-500/20 to-purple-500/5 border-purple-500/30 text-purple-400",
    };

    return (
        <div className="min-h-screen bg-[#020617] flex relative z-10">
            {/* Mobile Menu Button */}
            <button
                className="fixed top-4 left-4 z-50 p-3 bg-gray-800/90 backdrop-blur-sm rounded-xl border border-gray-700 md:hidden"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
                {mobileMenuOpen ? (
                    <X size={20} className="text-white" />
                ) : (
                    <Menu size={20} className="text-white" />
                )}
            </button>

            {/* Mobile Overlay */}
            <AnimatePresence>
                {mobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
                        onClick={() => setMobileMenuOpen(false)}
                    />
                )}
            </AnimatePresence>

            {/* Sidebar */}
            <aside
                className={`
                    fixed md:relative top-0 left-0 z-50 h-screen w-64
                    bg-gradient-to-b from-gray-900 via-gray-900 to-gray-950
                    border-r border-gray-800/50
                    flex flex-col shrink-0
                    transform transition-transform duration-300 ease-out
                    ${mobileMenuOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
                `}
            >
                {/* Logo Section */}
                <div className="p-5 border-b border-gray-800/50">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-cyan-500/20 rounded-xl">
                            <Zap className="text-cyan-400" size={22} />
                        </div>
                        <div>
                            <h1 className="text-lg font-bold text-white tracking-tight">
                                Robo Rumble
                            </h1>
                            <p className="text-xs text-cyan-400 font-medium tracking-widest uppercase">
                                Dashboard
                            </p>
                        </div>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={() => setMobileMenuOpen(false)}
                                className={`
                                    relative flex items-center gap-3 px-4 py-3 rounded-xl
                                    transition-all duration-200
                                    ${isActive
                                        ? `bg-gradient-to-r ${colorClasses[item.color as keyof typeof colorClasses]} border`
                                        : "text-gray-400 hover:bg-gray-800/50 hover:text-white"
                                    }
                                `}
                            >
                                {isActive && (
                                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-current rounded-r-full" />
                                )}
                                <item.icon size={18} />
                                <span className="font-medium text-sm">{item.label}</span>
                                {isActive && <ChevronRight size={14} className="ml-auto" />}
                            </Link>
                        );
                    })}
                </nav>

                {/* Bottom Section */}
                <div className="p-3 border-t border-gray-800/50 space-y-2">
                    {/* User Profile */}
                    <div className="flex items-center gap-3 p-3 bg-gray-800/30 rounded-xl">
                        <UserButton afterSignOutUrl="/" />
                        <Link
                            href="/onboarding"
                            onClick={() => setMobileMenuOpen(false)}
                            className="flex-1 text-gray-400 hover:text-white text-sm flex items-center gap-2 transition-colors"
                        >
                            <Settings size={14} />
                            <span>Edit Profile</span>
                        </Link>
                    </div>

                    {/* Logout Button */}
                    <SignOutButton>
                        <button className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-red-500/10 to-red-500/5 border border-red-500/20 text-red-400 hover:from-red-500/20 hover:to-red-500/10 hover:border-red-500/30 transition-all duration-300 text-sm">
                            <LogOut size={16} />
                            <span className="font-medium">Sign Out</span>
                        </button>
                    </SignOutButton>

                    {/* Back to Home Link */}
                    <Link
                        href="/home"
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center justify-center gap-2 px-4 py-2 text-gray-500 hover:text-gray-300 text-xs transition-colors"
                    >
                        ← Back to Home
                    </Link>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 min-h-screen overflow-auto">
                <div className="p-4 md:p-6 lg:p-8">
                    {children}
                </div>
            </main>
        </div>
    );
}
