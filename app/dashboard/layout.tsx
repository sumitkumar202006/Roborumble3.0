"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { UserButton, useUser, useClerk } from "@clerk/nextjs";
import { useSession, signOut as nextAuthSignOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import {
    Home,
    Users,
    Trophy,
    FileText,
    Settings,
    LogOut,
    Menu,
    X,
    ChevronRight,
    ArrowLeft,
    Calendar,
    ShoppingCart,
    Lock,
    Unlock,
    MessageSquare,
    Music,
} from "lucide-react";
import NotificationBell from "@/app/components/NotificationBell";
import CartSidebar from "@/app/components/CartSidebar";

interface ChannelItem {
    channelId: string;
    eventId: string;
    name: string;
    eventTitle: string;
    eventSlug: string;
    category: string;
    postCount: number;
    isLocked: boolean;
}

const navItems = [
    { href: "/dashboard", label: "Dashboard", icon: Home, color: "cyan" },
    { href: "/dashboard/team", label: "My Team", icon: Users, color: "blue" },
    { href: "/dashboard/esports-team", label: "Esports Team", icon: Trophy, color: "green" },
    { href: "/dashboard/events", label: "Events", icon: Trophy, color: "yellow" },
    { href: "/dashboard/registrations", label: "Registrations", icon: FileText, color: "purple" },
    { href: "/dashboard/dance", label: "Dance Performance", icon: Music, color: "green" },
    { href: "/dashboard/communities", label: "Communities", icon: MessageSquare, color: "cyan" },
];

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const router = useRouter();
    const { user: clerkUser, isLoaded: isClerkLoaded } = useUser();
    const { data: session, status: sessionStatus } = useSession();
    const { signOut: clerkSignOut } = useClerk();

    const isLoaded = isClerkLoaded && sessionStatus !== "loading";
    const isAuthenticated = !!clerkUser || !!session?.user;

    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [cartOpen, setCartOpen] = useState(false);
    const [cartCount, setCartCount] = useState(0);
    const [channels, setChannels] = useState<ChannelItem[]>([]);
    const [channelsLoading, setChannelsLoading] = useState(true);
    const [onboardingChecked, setOnboardingChecked] = useState(false);

    // Check onboarding status
    useEffect(() => {
        async function checkOnboarding() {
            try {
                const res = await fetch('/api/onboarding');
                const data = await res.json();
                
                if (res.ok && !data.onboardingCompleted) {
                    router.push('/onboarding');
                } else if (!res.ok && res.status === 401) {
                    // Clerk will handle redirect to sign-in if needed, 
                    // but we stay on current page safely if not authenticated
                } else {
                    setOnboardingChecked(true);
                }
            } catch (error) {
                console.error('Failed to check onboarding:', error);
                // Safe default
                setOnboardingChecked(true);
            }
        }
        
        if (isLoaded && isAuthenticated) {
            checkOnboarding();
        } else if (isLoaded && !isAuthenticated) {
            setOnboardingChecked(true); // Let middleware handle redirection if necessary
        }
    }, [isLoaded, isAuthenticated, router]);

    // Fetch user's event channels with access status
    useEffect(() => {
        async function fetchChannels() {
            try {
                const res = await fetch('/api/user/channels');
                if (res.ok) {
                    const data = await res.json();
                    setChannels(data.channels || []);
                }
            } catch (error) {
                console.error('Failed to fetch channels:', error);
            } finally {
                setChannelsLoading(false);
            }
        }
        fetchChannels();
    }, []);

    const colorClasses = {
        cyan: "from-cyan-500/20 to-cyan-500/5 border-cyan-500/30 text-cyan-400",
        blue: "from-blue-500/20 to-blue-500/5 border-blue-500/30 text-blue-400",
        yellow: "from-yellow-500/20 to-yellow-500/5 border-yellow-500/30 text-yellow-400",
        purple: "from-purple-500/20 to-purple-500/5 border-purple-500/30 text-purple-400",
        green: "from-green-500/20 to-green-500/5 border-green-500/30 text-green-400",
    };

    if (!isLoaded || (isAuthenticated && !onboardingChecked)) {
        return (
            <div className="min-h-screen bg-[#020617] flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin" />
                    <p className="text-cyan-500 font-mono text-xs animate-pulse tracking-widest uppercase">
                        Verifying Clearance...
                    </p>
                </div>
            </div>
        );
    }

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
                    fixed top-0 left-0 z-50 h-screen w-64
                    bg-gradient-to-b from-gray-900 via-gray-900 to-gray-950
                    border-r border-gray-800/50
                    flex flex-col shrink-0
                    transform transition-transform duration-300 ease-out
                    ${mobileMenuOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
                `}
            >
                {/* Logo Section */}
                <Link href="/" className="group p-5 border-b border-gray-800/50 block hover:bg-white/5 transition-colors">
                    <div className="flex items-center gap-3">
                        <div className="relative w-10 h-10 flex items-center justify-center bg-cyan-500/10 rounded-xl overflow-hidden">
                            <Image
                                src="/skull-1.png"
                                alt="Robo Rumble Logo"
                                width={32}
                                height={32}
                                className="object-contain"
                            />
                        </div>
                        <div>
                            <h1 className="text-lg font-bold text-white group-hover:text-[#00E5FF] tracking-tight leading-tight transition-all duration-300">
                                Robo Rumble
                            </h1>
                            <p className="text-[10px] text-cyan-400 font-medium tracking-widest uppercase">
                                Dashboard
                            </p>
                        </div>
                    </div>
                </Link>

                {/* Back to Home Link (Pinned Top) */}
                <div className="px-3 py-2 border-b border-gray-800/50">
                    <Link
                        href="/"
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-400 hover:bg-gray-800/50 hover:text-white transition-all duration-200"
                    >
                        <ArrowLeft size={18} />
                        <span className="font-medium text-sm">Back to Home</span>
                    </Link>
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

                    {/* Event Channels Section */}
                    {channels.length > 0 && (
                        <div className="pt-4 mt-4 border-t border-gray-800/50">
                            <div className="flex items-center gap-2 px-4 py-2 text-gray-500">
                                <MessageSquare size={14} />
                                <span className="text-xs font-semibold uppercase tracking-wider">Event Channels</span>
                            </div>
                            <div className="space-y-1 mt-1">
                                {channels.map((channel) => {
                                    const isActive = pathname === `/dashboard/channels/${channel.eventId}`;
                                    const isLocked = channel.isLocked;

                                    if (isLocked) {
                                        // Locked channel - show as disabled with lock icon
                                        return (
                                            <div
                                                key={channel.channelId}
                                                className="relative flex items-center gap-3 px-4 py-2.5 rounded-xl text-gray-600 cursor-not-allowed opacity-60"
                                                title="Register & pay to unlock this channel"
                                            >
                                                <Lock size={16} className="text-gray-600" />
                                                <span className="font-medium text-sm truncate flex-1">{channel.eventTitle}</span>
                                                <span className="text-[10px] bg-gray-700/50 px-1.5 py-0.5 rounded text-gray-500">Locked</span>
                                            </div>
                                        );
                                    }

                                    // Unlocked channel - clickable link
                                    return (
                                        <Link
                                            key={channel.channelId}
                                            href={`/dashboard/channels/${channel.eventId}`}
                                            onClick={() => setMobileMenuOpen(false)}
                                            className={`
                                                relative flex items-center gap-3 px-4 py-2.5 rounded-xl
                                                transition-all duration-200
                                                ${isActive
                                                    ? `bg-gradient-to-r ${colorClasses.green} border`
                                                    : "text-gray-400 hover:bg-gray-800/50 hover:text-white"
                                                }
                                            `}
                                        >
                                            {isActive && (
                                                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-current rounded-r-full" />
                                            )}
                                            <Unlock size={16} className="text-green-400" />
                                            <span className="font-medium text-sm truncate flex-1">{channel.eventTitle}</span>
                                            {channel.postCount > 0 && (
                                                <span className="text-[10px] bg-green-500/20 px-1.5 py-0.5 rounded text-green-400">
                                                    {channel.postCount}
                                                </span>
                                            )}
                                        </Link>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Loading state for channels */}
                    {channelsLoading && (
                        <div className="pt-4 mt-4 border-t border-gray-800/50">
                            <div className="flex items-center gap-2 px-4 py-2 text-gray-500">
                                <MessageSquare size={14} />
                                <span className="text-xs font-semibold uppercase tracking-wider">Event Channels</span>
                            </div>
                            <div className="px-4 py-3 text-gray-600 text-sm">Loading...</div>
                        </div>
                    )}
                </nav>

                {/* Bottom Section */}
                <div className="p-3 border-t border-gray-800/50 space-y-2">
                    {/* User Profile */}
                    <div className="flex items-center gap-3 p-3 bg-gray-800/30 rounded-xl">
                        {clerkUser ? (
                            <UserButton afterSignOutUrl="/" />
                        ) : (
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white text-xs font-bold">
                                {session?.user?.name?.[0] || session?.user?.email?.[0] || "?"}
                            </div>
                        )}
                        <Link
                            href="/dashboard/profile"
                            onClick={() => setMobileMenuOpen(false)}
                            className="flex-1 text-gray-400 hover:text-white text-sm flex items-center gap-2 transition-colors"
                        >
                            <Settings size={14} />
                            <span>Edit Profile</span>
                        </Link>
                    </div>

                    {/* Logout Button */}
                    <button
                        onClick={async () => {
                            if (clerkUser) {
                                await clerkSignOut();
                            } else {
                                await nextAuthSignOut({ redirect: false });
                            }
                            router.push("/home");
                        }}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-red-500/10 to-red-500/5 border border-red-500/20 text-red-400 hover:from-red-500/20 hover:to-red-500/10 hover:border-red-500/30 transition-all duration-300 text-sm"
                    >
                        <LogOut size={16} />
                        <span className="font-medium">Sign Out</span>
                    </button>

                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 min-h-screen overflow-auto md:ml-64 relative">
                {/* Fixed Action Icons - positioned at top right, same level as page headers */}
                <div className="fixed top-4 right-4 md:right-6 lg:right-8 z-40 flex items-center gap-2">
                    {/* Events/Schedule Button */}
                    <Link href="/dashboard/events">
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="relative p-2.5 bg-yellow-500/20 hover:bg-yellow-500/30 rounded-xl border border-yellow-500/30 backdrop-blur-sm transition-all group"
                        >
                            <Calendar size={18} className="text-yellow-400" />
                        </motion.button>
                    </Link>

                    {/* Notifications Bell */}
                    <NotificationBell />

                    {/* Cart Button */}
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setCartOpen(true)}
                        className="relative p-2.5 bg-gray-800/80 hover:bg-gray-700/80 rounded-xl border border-gray-700/50 backdrop-blur-sm transition-all group"
                    >
                        <ShoppingCart size={18} className="text-gray-400 group-hover:text-cyan-400 transition-colors" />
                        {cartCount > 0 && (
                            <span className="absolute -top-1 -right-1 w-5 h-5 bg-cyan-500 text-black text-[10px] font-black rounded-full flex items-center justify-center">
                                {cartCount > 9 ? "9+" : cartCount}
                            </span>
                        )}
                    </motion.button>
                </div>

                {/* Page Content */}
                <div className="p-4 md:p-6 lg:p-8">
                    {children}
                </div>
            </main>

            {/* Cart Sidebar */}
            <CartSidebar
                isOpen={cartOpen}
                onClose={() => setCartOpen(false)}
                onCartUpdate={(count) => setCartCount(count)}
            />
        </div>
    );
}

