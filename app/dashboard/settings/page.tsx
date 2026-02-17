"use client";

import { useUser, useClerk } from "@clerk/nextjs";
import { useSession, signOut as nextAuthSignOut } from "next-auth/react";
import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Settings,
    Bell,
    Shield,
    Palette,
    Globe,
    Moon,
    Sun,
    Mail,
    Smartphone,
    LogOut,
    ChevronRight,
    Check,
    AlertCircle,
} from "lucide-react";
import { useRouter } from "next/navigation";

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

// Loading Skeleton
function LoadingSkeleton() {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-8"
        >
            <div className="space-y-3">
                <div className="h-10 w-64 bg-gradient-to-r from-gray-800 via-gray-700 to-gray-800 rounded-lg animate-pulse" />
                <div className="h-5 w-96 bg-gradient-to-r from-gray-800 via-gray-700 to-gray-800 rounded animate-pulse" />
            </div>
            <div className="space-y-4">
                {[1, 2, 3, 4].map((i) => (
                    <div
                        key={i}
                        className="h-20 bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-xl border border-gray-700/50 animate-pulse"
                        style={{ animationDelay: `${i * 100}ms` }}
                    />
                ))}
            </div>
        </motion.div>
    );
}

// Settings Section Component
function SettingsSection({
    icon: Icon,
    title,
    description,
    children,
    accentColor = "cyan",
}: {
    icon: typeof Settings;
    title: string;
    description: string;
    children: React.ReactNode;
    accentColor?: string;
}) {
    const colorMap: Record<string, string> = {
        cyan: "bg-cyan-500/20 text-cyan-400",
        purple: "bg-purple-500/20 text-purple-400",
        yellow: "bg-yellow-500/20 text-yellow-400",
        green: "bg-green-500/20 text-green-400",
        red: "bg-red-500/20 text-red-400",
    };

    return (
        <motion.div
            variants={itemVariants}
            className="bg-gradient-to-br from-gray-800/60 to-gray-900/80 backdrop-blur-sm rounded-2xl border border-gray-700/50 overflow-hidden"
        >
            <div className="p-6 border-b border-gray-700/50">
                <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-xl ${colorMap[accentColor]}`}>
                        <Icon size={22} />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-white">{title}</h3>
                        <p className="text-gray-400 text-sm">{description}</p>
                    </div>
                </div>
            </div>
            <div className="p-6 space-y-4">{children}</div>
        </motion.div>
    );
}

// Toggle Switch Component
function ToggleSwitch({
    enabled,
    onChange,
}: {
    enabled: boolean;
    onChange: (value: boolean) => void;
}) {
    return (
        <button
            onClick={() => onChange(!enabled)}
            className={`relative w-12 h-6 rounded-full transition-colors duration-300 ${enabled ? "bg-cyan-500" : "bg-gray-600"
                }`}
        >
            <motion.div
                className="absolute top-1 w-4 h-4 bg-white rounded-full shadow-lg"
                animate={{ left: enabled ? "calc(100% - 20px)" : "4px" }}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
            />
        </button>
    );
}

// Settings Row Component
function SettingsRow({
    icon: Icon,
    label,
    description,
    action,
}: {
    icon: typeof Bell;
    label: string;
    description?: string;
    action: React.ReactNode;
}) {
    return (
        <div className="flex items-center justify-between py-3">
            <div className="flex items-center gap-3">
                <Icon size={18} className="text-gray-400" />
                <div>
                    <p className="text-white font-medium">{label}</p>
                    {description && (
                        <p className="text-gray-500 text-sm">{description}</p>
                    )}
                </div>
            </div>
            {action}
        </div>
    );
}

export default function SettingsPage() {
    const { user: clerkUser, isLoaded: isClerkLoaded } = useUser();
    const { data: session, status: sessionStatus } = useSession();

    const user = useMemo(() => {
        if (clerkUser) {
            return {
                id: clerkUser.id,
                firstName: clerkUser.firstName,
                isClerk: true,
            };
        }
        if (session?.user) {
            return {
                // @ts-ignore
                id: session.user.id || session.user.email,
                firstName: session.user.name?.split(" ")[0] || "Champion",
                isClerk: false,
            };
        }
        return null;
    }, [clerkUser, session]);

    const isLoaded = isClerkLoaded && sessionStatus !== "loading";

    const { signOut: clerkSignOut } = useClerk();
    const router = useRouter();

    // State for various settings
    const [notifications, setNotifications] = useState({
        email: true,
        push: false,
        eventUpdates: true,
        teamUpdates: true,
    });

    const [theme, setTheme] = useState<"dark" | "light" | "system">("dark");

    const handleLogout = async () => {
        if (user?.isClerk) {
            await clerkSignOut();
        } else {
            await nextAuthSignOut({ redirect: false });
        }
        router.push("/home");
    };

    return (
        <AnimatePresence mode="wait">
            {!isLoaded ? (
                <LoadingSkeleton key="loading" />
            ) : (
                <motion.div
                    key="content"
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="space-y-6 max-w-4xl"
                >
                    {/* Header */}
                    <motion.div variants={itemVariants} className="relative">
                        <motion.div
                            className="absolute -top-4 -left-4 w-24 h-24 bg-purple-500/10 rounded-full blur-2xl"
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
                                <Settings className="text-purple-400" size={32} />
                                <h1 className="text-3xl md:text-4xl font-bold text-white">
                                    Settings
                                </h1>
                            </div>
                            <p className="text-gray-400">
                                Manage your account preferences and application settings.
                            </p>
                        </div>
                    </motion.div>

                    {/* Notifications Section */}
                    <SettingsSection
                        icon={Bell}
                        title="Notifications"
                        description="Manage how you receive updates and alerts"
                        accentColor="cyan"
                    >
                        <SettingsRow
                            icon={Mail}
                            label="Email Notifications"
                            description="Receive updates via email"
                            action={
                                <ToggleSwitch
                                    enabled={notifications.email}
                                    onChange={(v) =>
                                        setNotifications({ ...notifications, email: v })
                                    }
                                />
                            }
                        />
                        <SettingsRow
                            icon={Smartphone}
                            label="Push Notifications"
                            description="Get notified on your device"
                            action={
                                <ToggleSwitch
                                    enabled={notifications.push}
                                    onChange={(v) =>
                                        setNotifications({ ...notifications, push: v })
                                    }
                                />
                            }
                        />
                        <div className="border-t border-gray-700/50 pt-4">
                            <p className="text-gray-400 text-sm font-medium mb-3">
                                Notification Types
                            </p>
                            <SettingsRow
                                icon={AlertCircle}
                                label="Event Updates"
                                description="New events, schedule changes"
                                action={
                                    <ToggleSwitch
                                        enabled={notifications.eventUpdates}
                                        onChange={(v) =>
                                            setNotifications({ ...notifications, eventUpdates: v })
                                        }
                                    />
                                }
                            />
                            <SettingsRow
                                icon={AlertCircle}
                                label="Team Updates"
                                description="Join requests, member changes"
                                action={
                                    <ToggleSwitch
                                        enabled={notifications.teamUpdates}
                                        onChange={(v) =>
                                            setNotifications({ ...notifications, teamUpdates: v })
                                        }
                                    />
                                }
                            />
                        </div>
                    </SettingsSection>

                    {/* Appearance Section */}
                    <SettingsSection
                        icon={Palette}
                        title="Appearance"
                        description="Customize how the app looks"
                        accentColor="purple"
                    >
                        <div className="grid grid-cols-3 gap-3">
                            {[
                                { value: "light", label: "Light", icon: Sun },
                                { value: "dark", label: "Dark", icon: Moon },
                                { value: "system", label: "System", icon: Globe },
                            ].map((option) => (
                                <button
                                    key={option.value}
                                    onClick={() => setTheme(option.value as typeof theme)}
                                    className={`p-4 rounded-xl border transition-all flex flex-col items-center gap-2 ${theme === option.value
                                            ? "border-purple-500 bg-purple-500/10"
                                            : "border-gray-700 hover:border-gray-600"
                                        }`}
                                >
                                    <option.icon
                                        size={24}
                                        className={
                                            theme === option.value
                                                ? "text-purple-400"
                                                : "text-gray-400"
                                        }
                                    />
                                    <span
                                        className={
                                            theme === option.value
                                                ? "text-purple-400 font-medium"
                                                : "text-gray-400"
                                        }
                                    >
                                        {option.label}
                                    </span>
                                    {theme === option.value && (
                                        <Check size={16} className="text-purple-400" />
                                    )}
                                </button>
                            ))}
                        </div>
                    </SettingsSection>

                    {/* Security Section */}
                    <SettingsSection
                        icon={Shield}
                        title="Security"
                        description="Manage your account security"
                        accentColor="green"
                    >
                        <button className="w-full flex items-center justify-between p-4 rounded-xl bg-gray-800/50 hover:bg-gray-700/50 transition-colors group">
                            <div className="flex items-center gap-3">
                                <Shield size={18} className="text-gray-400" />
                                <div className="text-left">
                                    <p className="text-white font-medium">
                                        Manage Account via Clerk
                                    </p>
                                    <p className="text-gray-500 text-sm">
                                        Update email, password, and security settings
                                    </p>
                                </div>
                            </div>
                            <ChevronRight
                                size={20}
                                className="text-gray-500 group-hover:text-white transition-colors"
                            />
                        </button>
                    </SettingsSection>

                    {/* Danger Zone */}
                    <SettingsSection
                        icon={AlertCircle}
                        title="Danger Zone"
                        description="Irreversible actions"
                        accentColor="red"
                    >
                        <button
                            onClick={handleLogout}
                            className="w-full flex items-center justify-center gap-2 p-4 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 font-medium transition-colors"
                        >
                            <LogOut size={18} />
                            <span>Sign Out</span>
                        </button>
                    </SettingsSection>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
