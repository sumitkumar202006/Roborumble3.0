"use client";

import { useUser } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
    ArrowRight,
    Trophy,
    Users,
    AlertCircle,
    CheckCircle2,
    Sparkles,
    Zap,
    Calendar,
    CreditCard,
} from "lucide-react";

interface TeamData {
    _id: string;
    name: string;
    members?: Array<{ _id: string; username: string; email: string }>;
    isLocked: boolean;
}

interface RegistrationData {
    _id: string;
    eventId: { title: string; fees: number };
    paymentStatus: string;
}

// Animation variants
const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
            delayChildren: 0.2,
        },
    },
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            type: "spring" as const,
            stiffness: 100,
            damping: 15,
        },
    },
};

const cardHoverVariants = {
    rest: { scale: 1, boxShadow: "0 0 0 rgba(0, 240, 255, 0)" },
    hover: {
        scale: 1.02,
        boxShadow: "0 0 30px rgba(0, 240, 255, 0.15)",
        transition: { type: "spring" as const, stiffness: 400, damping: 25 },
    },
};

// Premium Loading Skeleton
function LoadingSkeleton() {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-8"
        >
            {/* Header Skeleton */}
            <div className="space-y-3">
                <div className="h-10 w-80 bg-gradient-to-r from-gray-800 via-gray-700 to-gray-800 rounded-lg animate-pulse" />
                <div className="h-5 w-96 bg-gradient-to-r from-gray-800 via-gray-700 to-gray-800 rounded animate-pulse" />
            </div>

            {/* Cards Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                    <div
                        key={i}
                        className="h-48 bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-2xl border border-gray-700/50 animate-pulse"
                        style={{ animationDelay: `${i * 150}ms` }}
                    />
                ))}
            </div>

            {/* Instructions Skeleton */}
            <div className="h-40 bg-gradient-to-r from-cyan-900/10 to-blue-900/10 rounded-2xl border border-cyan-500/10 animate-pulse" />
        </motion.div>
    );
}

// Stat Card Component
function StatCard({
    icon: Icon,
    label,
    value,
    color,
}: {
    icon: typeof Trophy;
    label: string;
    value: string | number;
    color: string;
}) {
    return (
        <motion.div
            variants={itemVariants}
            className="flex items-center gap-4 p-4 bg-gray-800/30 rounded-xl border border-gray-700/50"
        >
            <div className={`p-3 rounded-lg ${color}`}>
                <Icon size={20} />
            </div>
            <div>
                <p className="text-gray-400 text-sm">{label}</p>
                <p className="text-white font-bold text-xl">{value}</p>
            </div>
        </motion.div>
    );
}

// Action Card Component
function ActionCard({
    icon: Icon,
    title,
    description,
    linkText,
    href,
    color,
    accentColor,
    children,
}: {
    icon: typeof Trophy;
    title: string;
    description?: string;
    linkText: string;
    href: string;
    color: string;
    accentColor: string;
    children?: React.ReactNode;
}) {
    return (
        <motion.div
            variants={cardHoverVariants}
            initial="rest"
            whileHover="hover"
            className="relative overflow-hidden rounded-2xl border border-gray-700/50 bg-gradient-to-br from-gray-800/60 to-gray-900/80 backdrop-blur-sm"
        >
            {/* Gradient Overlay */}
            <div
                className={`absolute inset-0 opacity-5 bg-gradient-to-br ${color}`}
            />

            {/* Glowing Border Effect */}
            <div
                className={`absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br ${color} blur-xl`}
                style={{ transform: "scale(0.95)" }}
            />

            <div className="relative p-6 z-10">
                {/* Background Icon */}
                <motion.div
                    className="absolute top-4 right-4 opacity-5"
                    initial={{ rotate: 0 }}
                    whileHover={{ rotate: 12, scale: 1.1 }}
                    transition={{ type: "spring" as const, stiffness: 200 }}
                >
                    <Icon size={100} />
                </motion.div>

                {/* Content */}
                <div className="relative z-10">
                    <motion.div
                        className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium mb-4 ${accentColor}`}
                        whileHover={{ scale: 1.05 }}
                    >
                        <Icon size={16} />
                        <span>{title}</span>
                    </motion.div>

                    {children || (
                        <p className="text-gray-400 text-sm mb-4 min-h-[40px]">
                            {description}
                        </p>
                    )}

                    <Link
                        href={href}
                        className={`inline-flex items-center gap-2 ${accentColor.replace("bg-", "text-").replace("/20", "-400")} hover:brightness-125 font-medium text-sm transition-all group`}
                    >
                        <span>{linkText}</span>
                        <motion.span
                            initial={{ x: 0 }}
                            whileHover={{ x: 4 }}
                        >
                            <ArrowRight size={16} />
                        </motion.span>
                    </Link>
                </div>
            </div>
        </motion.div>
    );
}

export default function DashboardPage() {
    const { user, isLoaded } = useUser();
    const [team, setTeam] = useState<TeamData | null>(null);
    const [registrations, setRegistrations] = useState<RegistrationData[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchData() {
            if (!user?.id) return;
            try {
                const [teamRes, regRes] = await Promise.all([
                    fetch(`/api/teams?clerkId=${user.id}`),
                    fetch(`/api/registrations?clerkId=${user.id}`),
                ]);
                const teamData = await teamRes.json();
                const regData = await regRes.json();
                setTeam(teamData.team);
                setRegistrations(regData.registrations || []);
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        }
        if (isLoaded && user) fetchData();
        else if (isLoaded && !user) setLoading(false);
    }, [user, isLoaded]);

    const paidCount = registrations.filter(
        (r) => r.paymentStatus === "paid" || r.paymentStatus === "manual_verified"
    ).length;

    return (
        <AnimatePresence mode="wait">
            {(!isLoaded || loading) ? (
                <LoadingSkeleton key="loading" />
            ) : (
                <motion.div
                    key="content"
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="space-y-4"
                >
                    {/* Welcome Header */}
                    <motion.div variants={itemVariants} className="relative">
                        <motion.div
                            className="absolute -top-4 -left-4 w-24 h-24 bg-cyan-500/10 rounded-full blur-2xl"
                            animate={{
                                scale: [1, 1.2, 1],
                                opacity: [0.3, 0.5, 0.3],
                            }}
                            transition={{
                                duration: 4,
                                repeat: Infinity,
                                ease: "easeInOut",
                            }}
                        />
                        <div className="relative">
                            <div className="flex items-center gap-3 mb-2">
                                <motion.span
                                    animate={{ rotate: [0, 10, -10, 0] }}
                                    transition={{
                                        duration: 2,
                                        repeat: Infinity,
                                        ease: "easeInOut",
                                    }}
                                    className="text-4xl"
                                >
                                    👋
                                </motion.span>
                                <h1 className="text-3xl md:text-4xl font-bold text-white">
                                    Welcome back,{" "}
                                    <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                                        {user?.firstName || "Champion"}
                                    </span>
                                    !
                                </h1>
                            </div>
                            <p className="text-gray-400">
                                Here&apos;s what&apos;s happening with your Robo Rumble journey.
                            </p>
                        </div>
                    </motion.div>

                    {/* Action Cards */}
                    <motion.div
                        variants={containerVariants}
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                    >
                        {/* Team Card */}
                        <motion.div variants={itemVariants}>
                            <ActionCard
                                icon={Users}
                                title="My Team"
                                linkText={
                                    team ? "Manage Team" : "Create or Join Team"
                                }
                                href="/dashboard/team"
                                color="from-cyan-500/20 to-blue-500/20"
                                accentColor="bg-cyan-500/20 text-cyan-400"
                            >
                                {team ? (
                                    <div className="mb-4">
                                        <p className="text-2xl font-bold text-white mb-1">
                                            {team.name}
                                        </p>
                                        <div className="flex items-center gap-3">
                                            <span className="text-gray-400 text-sm">
                                                {team.members?.length || 0}{" "}
                                                Members
                                            </span>
                                            <span
                                                className={`px-2 py-0.5 rounded-full text-xs font-medium ${team.isLocked
                                                    ? "bg-red-500/20 text-red-400"
                                                    : "bg-green-500/20 text-green-400"
                                                    }`}
                                            >
                                                {team.isLocked
                                                    ? "🔒 Locked"
                                                    : "✓ Open"}
                                            </span>
                                        </div>
                                    </div>
                                ) : (
                                    <p className="text-gray-400 text-sm mb-4 min-h-[40px]">
                                        You haven&apos;t joined a team yet.
                                        Create one or join an existing team!
                                    </p>
                                )}
                            </ActionCard>
                        </motion.div>

                        {/* Events Card */}
                        <motion.div variants={itemVariants}>
                            <ActionCard
                                icon={Trophy}
                                title="Compete"
                                description="Register for events and showcase your robotics skills in thrilling competitions."
                                linkText="Browse Events"
                                href="/dashboard/events"
                                color="from-yellow-500/20 to-orange-500/20"
                                accentColor="bg-yellow-500/20 text-yellow-400"
                            />
                        </motion.div>

                        {/* Profile Card */}
                        <motion.div variants={itemVariants}>
                            <ActionCard
                                icon={CheckCircle2}
                                title="Onboarding"
                                linkText="Edit Profile"
                                href="/onboarding"
                                color="from-green-500/20 to-emerald-500/20"
                                accentColor="bg-green-500/20 text-green-400"
                            >
                                <div className="mb-4">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Sparkles
                                            size={16}
                                            className="text-green-400"
                                        />
                                        <span className="text-green-400 font-bold">
                                            Completed
                                        </span>
                                    </div>
                                    <p className="text-gray-400 text-sm">
                                        You are all set to participate in Robo
                                        Rumble 3.0!
                                    </p>
                                </div>
                            </ActionCard>
                        </motion.div>
                    </motion.div>

                    {/* Important Instructions */}
                    <motion.div
                        variants={itemVariants}
                        className="relative overflow-hidden rounded-2xl border border-cyan-500/20"
                    >
                        {/* Animated Background */}
                        <div className="absolute inset-0 bg-gradient-to-r from-cyan-900/20 via-blue-900/20 to-purple-900/20" />
                        <motion.div
                            className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 to-transparent"
                            animate={{
                                x: ["-100%", "100%"],
                            }}
                            transition={{
                                duration: 8,
                                repeat: Infinity,
                                ease: "linear",
                            }}
                        />

                        <div className="relative p-6 md:p-8">
                            <div className="flex items-center gap-3 mb-6">
                                <motion.div
                                    animate={{
                                        scale: [1, 1.1, 1],
                                        rotate: [0, 5, -5, 0],
                                    }}
                                    transition={{
                                        duration: 2,
                                        repeat: Infinity,
                                    }}
                                    className="p-3 bg-cyan-500/20 rounded-xl"
                                >
                                    <Zap className="text-cyan-400" size={24} />
                                </motion.div>
                                <h2 className="text-xl md:text-2xl font-bold text-white">
                                    Important Instructions
                                </h2>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {[
                                    {
                                        icon: "👥",
                                        text: "Create a team before registering for any event.",
                                    },
                                    {
                                        icon: "🔒",
                                        text: "Once you register and pay, your team will be locked (no new members).",
                                    },
                                    {
                                        icon: "✅",
                                        text: "Ensure all team members have completed their profiles.",
                                    },
                                    {
                                        icon: "📞",
                                        text: "For support, contact the admin via the help desk.",
                                    },
                                ].map((item, index) => (
                                    <motion.div
                                        key={index}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.5 + index * 0.1 }}
                                        className="flex items-start gap-3 p-3 bg-gray-800/30 rounded-xl border border-gray-700/30"
                                    >
                                        <span className="text-xl">{item.icon}</span>
                                        <p className="text-gray-300 text-sm">
                                            {item.text}
                                        </p>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
