"use client";


import { useSession } from "next-auth/react";
import { useEffect, useState, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Users,
    UserPlus,
    Search,
    Check,
    X,
    Crown,
    Mail,
    LogOut,
    Loader2,
    UserCircle,
    School,
    Send,
    AlertCircle,
    CheckCircle,
    XCircle,
    Clock,
    Sparkles,
} from "lucide-react";

// Types
interface Member {
    _id: string;
    username: string;
    email: string;
    firstName?: string;
    lastName?: string;
    avatarUrl?: string;
    college?: string;
}

interface TeamData {
    _id: string;
    name: string;
    leaderId: Member;
    members: Member[];
    isLocked: boolean;
}

interface Invitation {
    _id: string;
    name: string;
    leaderId: { username: string; email: string };
}

interface SearchResult {
    _id: string;
    username: string;
    email: string;
    fullName: string;
    avatarUrl?: string;
    college?: string;
}

interface PendingInvite {
    _id: string;
    username: string;
    email: string;
    firstName?: string;
    lastName?: string;
}

interface JoinRequest {
    _id: string;
    username: string;
    email: string;
    college?: string;
}

// Animation variants
const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.1 },
    },
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 100 } },
};

// Avatar Component
function Avatar({ user, size = "md" }: { user: { username?: string; avatarUrl?: string; firstName?: string }; size?: "sm" | "md" | "lg" }) {
    const sizes = { sm: "w-8 h-8 text-xs", md: "w-10 h-10 text-sm", lg: "w-12 h-12 text-base" };
    const initial = user.firstName?.[0] || user.username?.[0] || "?";

    if (user.avatarUrl) {
        return (
            <img
                src={user.avatarUrl}
                alt={user.username || "User"}
                className={`${sizes[size]} rounded-full object-cover border-2 border-gray-700`}
            />
        );
    }

    return (
        <div className={`${sizes[size]} rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white font-bold`}>
            {initial.toUpperCase()}
        </div>
    );
}

// Toast/Message Component
function Toast({ message, type, onClose }: { message: string; type: "success" | "error" | "info"; onClose: () => void }) {
    const colors = {
        success: "from-green-500/20 to-green-500/10 border-green-500/50 text-green-400",
        error: "from-red-500/20 to-red-500/10 border-red-500/50 text-red-400",
        info: "from-cyan-500/20 to-cyan-500/10 border-cyan-500/50 text-cyan-400",
    };
    const icons = {
        success: <CheckCircle size={18} />,
        error: <XCircle size={18} />,
        info: <AlertCircle size={18} />,
    };

    useEffect(() => {
        const timer = setTimeout(onClose, 5000);
        return () => clearTimeout(timer);
    }, [onClose]);

    return (
        <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-xl border bg-gradient-to-r ${colors[type]} flex items-center gap-3 shadow-lg max-w-md`}
        >
            {icons[type]}
            <span className="flex-1">{message}</span>
            <button onClick={onClose} className="hover:opacity-70">
                <X size={16} />
            </button>
        </motion.div>
    );
}

// Loading Skeleton
function LoadingSkeleton() {
    return (
        <div className="space-y-6 animate-pulse">
            <div className="h-10 w-64 bg-gray-800 rounded-lg" />
            <div className="h-64 bg-gray-800/50 rounded-2xl" />
            <div className="h-48 bg-gray-800/50 rounded-2xl" />
        </div>
    );
}

export default function TeamPage() {
    const { data: session, status: sessionStatus } = useSession();

    const user = useMemo(() => {
        if (session?.user) {
            return {
                // @ts-ignore
                id: session.user.id,
                firstName: session.user.name?.split(" ")[0] || "Champion",
            };
        }
        return null;
    }, [session]);

    const isLoaded = sessionStatus !== "loading";

    const [team, setTeam] = useState<TeamData | null>(null);
    const [invitations, setInvitations] = useState<Invitation[]>([]);
    const [pendingInvites, setPendingInvites] = useState<PendingInvite[]>([]);
    const [joinRequests, setJoinRequests] = useState<JoinRequest[]>([]);
    const [profileId, setProfileId] = useState<string>("");
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState<string | null>(null);

    // Form states
    const [teamName, setTeamName] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
    const [searchLoading, setSearchLoading] = useState(false);
    const [teamSearchQuery, setTeamSearchQuery] = useState("");
    const [teamSearchResults, setTeamSearchResults] = useState<TeamData[]>([]);
    const [availableTeams, setAvailableTeams] = useState<TeamData[]>([]);
    const [availableTeamsLoading, setAvailableTeamsLoading] = useState(false);
    const [requestedTeamIds, setRequestedTeamIds] = useState<string[]>([]);

    // Toast message
    const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null);

    const isLeader = team?.leaderId?._id === profileId;

    const showToast = useCallback((message: string, type: "success" | "error" | "info") => {
        setToast({ message, type });
    }, []);

    // Fetch team data
    async function fetchTeamData() {
        if (!session?.user) return;
        try {
            const res = await fetch(`/api/teams`);
            if (!res.ok) {
                console.error("Teams API error:", res.status);
                setLoading(false);
                return;
            }
            const data = await res.json();
            setTeam(data.team || null);
            setInvitations(data.invitations || []);
            setProfileId(data.profileId || "");

            // If user has no team, fetch available teams
            if (!data.team) {
                fetchAvailableTeams();
            }

            // If user is a leader, fetch pending invites and join requests
            if (data.team && data.team.leaderId?._id === data.profileId) {
                try {
                    const [invRes, reqRes] = await Promise.all([
                        fetch(`/api/teams/invite`),
                        fetch(`/api/teams/join`),
                    ]);
                    if (invRes.ok) {
                        const invData = await invRes.json();
                        setPendingInvites(invData.pendingInvites || []);
                    }
                    if (reqRes.ok) {
                        const reqData = await reqRes.json();
                        setJoinRequests(reqData.joinRequests || []);
                    }
                } catch (subError) {
                    console.error("Error fetching invites/requests:", subError);
                }
            }
        } catch (e) {
            console.error(e);
            showToast("Failed to load team data", "error");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        if (isLoaded && session?.user) {
            fetchTeamData();
        } else if (isLoaded && !session?.user) {
            setLoading(false);
        }
    }, [session, isLoaded]);

    // Fetch available teams for users without a team
    async function fetchAvailableTeams() {
        setAvailableTeamsLoading(true);
        try {
            const res = await fetch("/api/teams?available=true");
            if (res.ok) {
                const data = await res.json();
                setAvailableTeams(data.teams || []);
            }
        } catch (e) {
            console.error("Error fetching available teams:", e);
        } finally {
            setAvailableTeamsLoading(false);
        }
    }

    // Debounced user search
    useEffect(() => {
        const timer = setTimeout(async () => {
            if (searchQuery.length < 2) {
                setSearchResults([]);
                return;
            }

            setSearchLoading(true);
            try {
                const res = await fetch(
                    `/api/users/search?q=${encodeURIComponent(searchQuery)}&excludeInTeam=true`
                );
                const data = await res.json();
                setSearchResults(data.users || []);
            } catch (e) {
                console.error(e);
            } finally {
                setSearchLoading(false);
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [searchQuery]);

    // Create team
    async function createTeam() {
        if (!teamName.trim()) {
            showToast("Please enter a team name", "error");
            return;
        }

        setActionLoading("create");
        try {
            const res = await fetch("/api/teams", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ teamName }),
            });
            const data = await res.json();

            if (res.ok) {
                showToast("Team created successfully!", "success");
                setTeamName("");
                fetchTeamData();
            } else {
                showToast(data.message, "error");
            }
        } catch (e) {
            console.error(e);
            showToast("Failed to create team", "error");
        } finally {
            setActionLoading(null);
        }
    }

    // Invite member
    async function inviteMember(userId: string, displayName: string) {
        setActionLoading(`invite-${userId}`);
        try {
            const res = await fetch("/api/teams/invite", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ inviteUserId: userId }),
            });
            const data = await res.json();

            if (res.ok) {
                showToast(`Invitation sent to ${displayName}`, "success");
                setSearchQuery("");
                setSearchResults([]);
                // Refresh pending invites
                const invRes = await fetch(`/api/teams/invite`);
                const invData = await invRes.json();
                setPendingInvites(invData.pendingInvites || []);
            } else {
                showToast(data.message, "error");
            }
        } catch (e) {
            console.error(e);
            showToast("Failed to send invitation", "error");
        } finally {
            setActionLoading(null);
        }
    }

    // Cancel invitation
    async function cancelInvitation(userId: string) {
        setActionLoading(`cancel-${userId}`);
        try {
            const res = await fetch("/api/teams/invite/cancel", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId }),
            });
            const data = await res.json();

            if (res.ok) {
                showToast("Invitation cancelled", "info");
                setPendingInvites((prev) => prev.filter((p) => p._id !== userId));
            } else {
                showToast(data.message, "error");
            }
        } catch (e) {
            console.error(e);
            showToast("Failed to cancel invitation", "error");
        } finally {
            setActionLoading(null);
        }
    }

    // Search teams
    async function searchTeams() {
        if (!teamSearchQuery.trim()) return;
        try {
            const res = await fetch(`/api/teams?search=${encodeURIComponent(teamSearchQuery)}`);
            const data = await res.json();
            setTeamSearchResults(data.teams || []);
        } catch (e) {
            console.error(e);
        }
    }

    // Request to join team
    async function requestJoin(teamId: string) {
        setActionLoading(`join-${teamId}`);
        try {
            const res = await fetch("/api/teams/join", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ teamId }),
            });
            const data = await res.json();

            if (res.ok) {
                showToast("Join request sent!", "success");
                setRequestedTeamIds(prev => [...prev, teamId]);
            } else {
                showToast(data.message, "error");
            }
        } catch (e) {
            console.error(e);
            showToast("Failed to send join request", "error");
        } finally {
            setActionLoading(null);
        }
    }

    // Respond to invitation
    async function respondToInvitation(teamId: string, accept: boolean) {
        setActionLoading(`respond-${teamId}`);
        try {
            const res = await fetch("/api/teams/respond", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    action: accept ? "accept_invitation" : "reject_invitation",
                    teamId,
                }),
            });
            const data = await res.json();

            if (res.ok) {
                showToast(accept ? "You have joined the team!" : "Invitation declined", accept ? "success" : "info");
                fetchTeamData();
            } else {
                showToast(data.message, "error");
            }
        } catch (e) {
            console.error(e);
        } finally {
            setActionLoading(null);
        }
    }

    // Respond to join request
    async function respondToRequest(userId: string, accept: boolean) {
        setActionLoading(`request-${userId}`);
        try {
            const res = await fetch("/api/teams/respond", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    action: accept ? "accept_request" : "reject_request",
                    userId,
                }),
            });
            const data = await res.json();

            if (res.ok) {
                showToast(accept ? "Member added to team!" : "Request declined", accept ? "success" : "info");
                fetchTeamData();
            } else {
                showToast(data.message, "error");
            }
        } catch (e) {
            console.error(e);
        } finally {
            setActionLoading(null);
        }
    }

    // Leave team
    async function leaveTeam() {
        if (!confirm(isLeader ? "Are you sure? This will disband the team and remove all members." : "Are you sure you want to leave this team?")) {
            return;
        }

        setActionLoading("leave");
        try {
            const res = await fetch("/api/teams/leave", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({}),
            });
            const data = await res.json();

            if (res.ok) {
                showToast(data.disbanded ? "Team has been disbanded" : "You have left the team", "success");
                setTeam(null);
                fetchTeamData();
            } else {
                showToast(data.message, "error");
            }
        } catch (e) {
            console.error(e);
            showToast("Failed to leave team", "error");
        } finally {
            setActionLoading(null);
        }
    }

    if (!isLoaded || loading) return <LoadingSkeleton />;

    return (
        <>
            {/* Toast Notification */}
            <AnimatePresence>
                {toast && (
                    <Toast
                        message={toast.message}
                        type={toast.type}
                        onClose={() => setToast(null)}
                    />
                )}
            </AnimatePresence>

            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="max-w-4xl w-full space-y-6 sm:space-y-8 px-4 sm:px-0"
            >
                {/* Header */}
                <motion.div variants={itemVariants} className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold text-white flex items-center gap-2 sm:gap-3">
                            <Users className="text-cyan-400 shrink-0" size={28} />
                            Team Management
                        </h1>
                        <p className="text-gray-400 mt-1 text-sm sm:text-base">
                            {team ? "Manage your team and invite members" : "Create or join a team to compete"}
                        </p>
                    </div>
                </motion.div>

                {team ? (
                    /* ========== HAS TEAM ========== */
                    <>
                        {/* Team Info Card */}
                        <motion.div
                            variants={itemVariants}
                            className="relative overflow-hidden rounded-2xl border border-gray-700/50 bg-gradient-to-br from-gray-800/60 to-gray-900/80"
                        >
                            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-transparent" />
                            <div className="relative p-4 sm:p-6">
                                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
                                    <div className="min-w-0">
                                        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                                            <h2 className="text-xl sm:text-2xl font-bold text-white truncate">{team.name}</h2>
                                            {isLeader && (
                                                <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 rounded-full text-xs font-medium flex items-center gap-1 shrink-0">
                                                    <Crown size={12} /> Leader
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-gray-400 mt-1 flex flex-wrap items-center gap-2 text-sm">
                                            {team.isLocked ? (
                                                <span className="text-red-400 flex items-center gap-1">
                                                    🔒 Team Locked (Payment Made)
                                                </span>
                                            ) : (
                                                <span className="text-green-400 flex items-center gap-1">
                                                    ✓ Open for Members
                                                </span>
                                            )}
                                            <span className="text-gray-600 hidden sm:inline">•</span>
                                            <span>{team.members?.length || 0}/50 Members</span>
                                        </p>
                                    </div>

                                    {!team.isLocked && (
                                        <motion.button
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            onClick={leaveTeam}
                                            disabled={actionLoading === "leave"}
                                            className="px-4 py-2 bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl hover:bg-red-500/20 transition-colors flex items-center justify-center gap-2 text-sm shrink-0"
                                        >
                                            {actionLoading === "leave" ? (
                                                <Loader2 size={16} className="animate-spin" />
                                            ) : (
                                                <LogOut size={16} />
                                            )}
                                            {isLeader ? "Disband Team" : "Leave Team"}
                                        </motion.button>
                                    )}
                                </div>

                                {/* Members List */}
                                <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                                    <Users size={16} className="text-cyan-400" />
                                    Team Members
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {team.members?.map((member) => (
                                        <motion.div
                                            key={member._id}
                                            initial={{ opacity: 0, scale: 0.95 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            className="flex items-center gap-3 p-3 bg-gray-800/50 rounded-xl border border-gray-700/50"
                                        >
                                            <Avatar user={member} />
                                            <div className="flex-1 min-w-0">
                                                <p className="text-white font-medium truncate flex items-center gap-2">
                                                    {member.username || "No username"}
                                                    {member._id === team.leaderId._id && (
                                                        <Crown size={14} className="text-yellow-400" />
                                                    )}
                                                </p>
                                                <p className="text-gray-400 text-sm truncate">{member.email}</p>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            </div>
                        </motion.div>

                        {/* Invite Members Section (Leader Only) */}
                        {isLeader && !team.isLocked && (
                            <motion.div
                                variants={itemVariants}
                            className="rounded-2xl border border-gray-700/50 bg-gradient-to-br from-gray-800/60 to-gray-900/80 p-4 sm:p-6"
                            >
                                <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                                    <UserPlus size={18} className="text-cyan-400" />
                                    Invite Members
                                </h3>

                                {/* Search Input */}
                                <div className="relative mb-4">
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                    <input
                                        type="text"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        placeholder="Search by username or email..."
                                        className="w-full pl-12 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 transition-all"
                                    />
                                    {searchLoading && (
                                        <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 text-cyan-400 animate-spin" size={18} />
                                    )}
                                </div>

                                {/* Search Results */}
                                <AnimatePresence>
                                    {searchResults.length > 0 && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: "auto" }}
                                            exit={{ opacity: 0, height: 0 }}
                                            className="space-y-2 mb-4"
                                        >
                                            {searchResults.map((result) => (
                                                <motion.div
                                                    key={result._id}
                                                    initial={{ opacity: 0, x: -10 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                 className="flex flex-col sm:flex-row sm:items-center gap-3 p-3 bg-gray-800/50 rounded-xl border border-gray-700/30 group hover:border-cyan-500/30 transition-colors"
                                                >
                                                    <div className="flex items-center gap-3 min-w-0">
                                                        <Avatar user={result} />
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-white font-medium truncate">
                                                                {result.fullName || result.username}
                                                            </p>
                                                            <p className="text-gray-400 text-sm flex items-center gap-2 truncate">
                                                                <Mail size={12} className="shrink-0" />
                                                                {result.email}
                                                            </p>
                                                            {result.college && (
                                                                <p className="text-gray-400 text-sm flex items-center gap-2 truncate">
                                                                    <School size={12} className="shrink-0" />
                                                                    {result.college}
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <motion.button
                                                        whileHover={{ scale: 1.05 }}
                                                        whileTap={{ scale: 0.95 }}
                                                        onClick={() => inviteMember(result._id, result.username || result.email)}
                                                        disabled={actionLoading === `invite-${result._id}`}
                                                        className="px-4 py-2 bg-cyan-500/20 border border-cyan-500/30 text-cyan-400 rounded-lg hover:bg-cyan-500/30 transition-colors flex items-center justify-center gap-2 text-sm shrink-0 w-full sm:w-auto"
                                                    >
                                                        {actionLoading === `invite-${result._id}` ? (
                                                            <Loader2 size={14} className="animate-spin" />
                                                        ) : (
                                                            <Send size={14} />
                                                        )}
                                                        Invite
                                                    </motion.button>
                                                </motion.div>
                                            ))}
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                {searchQuery.length >= 2 && !searchLoading && searchResults.length === 0 && (
                                    <p className="text-gray-500 text-sm text-center py-4">
                                        No users found matching &ldquo;{searchQuery}&rdquo;
                                    </p>
                                )}

                                {searchQuery.length < 2 && searchQuery.length > 0 && (
                                    <p className="text-gray-500 text-sm text-center py-2">
                                        Type at least 2 characters to search
                                    </p>
                                )}

                                {/* Pending Invitations */}
                                {pendingInvites.length > 0 && (
                                    <div className="mt-6 pt-6 border-t border-gray-700/50">
                                        <h4 className="text-gray-400 text-sm font-medium mb-3 flex items-center gap-2">
                                            <Clock size={14} />
                                            Pending Invitations ({pendingInvites.length})
                                        </h4>
                                        <div className="space-y-2">
                                            {pendingInvites.map((invite) => (
                                                <div
                                                    key={invite._id}
                                                    className="flex items-center gap-3 p-2 bg-gray-800/30 rounded-lg"
                                                >
                                                    <Avatar user={invite} size="sm" />
                                                    <span className="text-gray-300 text-sm flex-1 truncate">
                                                        {invite.username || invite.email}
                                                    </span>
                                                    <button
                                                        onClick={() => cancelInvitation(invite._id)}
                                                        disabled={actionLoading === `cancel-${invite._id}`}
                                                        className="text-gray-500 hover:text-red-400 transition-colors"
                                                    >
                                                        {actionLoading === `cancel-${invite._id}` ? (
                                                            <Loader2 size={14} className="animate-spin" />
                                                        ) : (
                                                            <X size={14} />
                                                        )}
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </motion.div>
                        )}

                        {/* Join Requests (Leader Only) */}
                        {isLeader && joinRequests.length > 0 && (
                            <motion.div
                                variants={itemVariants}
                                className="rounded-2xl border border-yellow-500/30 bg-gradient-to-br from-yellow-500/10 to-yellow-500/5 p-4 sm:p-6"
                            >
                                <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                                    <UserCircle size={18} className="text-yellow-400" />
                                    Join Requests ({joinRequests.length})
                                </h3>
                                <div className="space-y-3">
                                    {joinRequests.map((req) => (
                                        <div
                                            key={req._id}
                                            className="flex flex-col sm:flex-row sm:items-center gap-3 p-3 bg-gray-800/50 rounded-xl"
                                        >
                                            <div className="flex items-center gap-3 min-w-0">
                                                <Avatar user={req} />
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-white truncate">{req.username}</p>
                                                    <p className="text-gray-400 text-sm truncate">{req.email}</p>
                                                </div>
                                            </div>
                                            <div className="flex gap-2 sm:shrink-0">
                                                <motion.button
                                                    whileHover={{ scale: 1.05 }}
                                                    whileTap={{ scale: 0.95 }}
                                                    onClick={() => respondToRequest(req._id, true)}
                                                    disabled={actionLoading === `request-${req._id}`}
                                                    className="flex-1 sm:flex-none px-4 py-2 bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/30 flex items-center justify-center gap-2"
                                                >
                                                    {actionLoading === `request-${req._id}` ? (
                                                        <Loader2 size={18} className="animate-spin" />
                                                    ) : (
                                                        <Check size={18} />
                                                    )}
                                                    <span className="sm:hidden">Accept</span>
                                                </motion.button>
                                                <motion.button
                                                    whileHover={{ scale: 1.05 }}
                                                    whileTap={{ scale: 0.95 }}
                                                    onClick={() => respondToRequest(req._id, false)}
                                                    className="flex-1 sm:flex-none px-4 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 flex items-center justify-center gap-2"
                                                >
                                                    <X size={18} />
                                                    <span className="sm:hidden">Decline</span>
                                                </motion.button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        )}
                    </>
                ) : (
                    /* ========== NO TEAM ========== */
                    <>
                        {/* Pending Invitations */}
                        {invitations.length > 0 && (
                            <motion.div
                                variants={itemVariants}
                                className="rounded-2xl border border-cyan-500/30 bg-gradient-to-br from-cyan-500/10 to-cyan-500/5 p-4 sm:p-6"
                            >
                                <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                                    <Sparkles size={18} className="text-cyan-400" />
                                    You have been invited!
                                </h3>
                                <div className="space-y-3">
                                    {invitations.map((inv) => (
                                        <div
                                            key={inv._id}
                                            className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 bg-gray-800/50 rounded-xl gap-4"
                                        >
                                            <div className="min-w-0">
                                                <p className="text-white font-medium truncate">{inv.name}</p>
                                                <p className="text-gray-400 text-sm truncate">
                                                    From: {inv.leaderId.username}
                                                </p>
                                            </div>
                                            <div className="flex gap-2 shrink-0">
                                                <motion.button
                                                    whileHover={{ scale: 1.02 }}
                                                    whileTap={{ scale: 0.98 }}
                                                    onClick={() => respondToInvitation(inv._id, true)}
                                                    disabled={actionLoading === `respond-${inv._id}`}
                                                    className="flex-1 sm:flex-none px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 flex items-center justify-center gap-2"
                                                >
                                                    {actionLoading === `respond-${inv._id}` ? (
                                                        <Loader2 size={16} className="animate-spin" />
                                                    ) : (
                                                        <Check size={16} />
                                                    )}
                                                    Accept
                                                </motion.button>
                                                <motion.button
                                                    whileHover={{ scale: 1.02 }}
                                                    whileTap={{ scale: 0.98 }}
                                                    onClick={() => respondToInvitation(inv._id, false)}
                                                    className="flex-1 sm:flex-none px-4 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600"
                                                >
                                                    Decline
                                                </motion.button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        )}

                        {/* Create Team */}
                        <motion.div
                            variants={itemVariants}
                            className="rounded-2xl border border-gray-700/50 bg-gradient-to-br from-gray-800/60 to-gray-900/80 p-6"
                        >
                            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                                <Users size={24} className="text-cyan-400" />
                                Create a New Team
                            </h2>
                            <p className="text-gray-400 text-sm mb-4">
                                As a team leader, you can invite members and manage your team.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-3">
                                <input
                                    type="text"
                                    value={teamName}
                                    onChange={(e) => setTeamName(e.target.value)}
                                    placeholder="Enter team name..."
                                    className="flex-1 px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 transition-all"
                                    onKeyDown={(e) => e.key === "Enter" && createTeam()}
                                />
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={createTeam}
                                    disabled={actionLoading === "create"}
                                    className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-xl hover:from-cyan-400 hover:to-blue-500 transition-all flex items-center justify-center gap-2 font-medium shrink-0"
                                >
                                    {actionLoading === "create" ? (
                                        <Loader2 size={18} className="animate-spin" />
                                    ) : (
                                        <Sparkles size={18} />
                                    )}
                                    Create Team
                                </motion.button>
                            </div>
                        </motion.div>

                        {/* Available Teams - Auto-loaded */}
                        <motion.div
                            variants={itemVariants}
                            className="rounded-2xl border border-green-500/30 bg-gradient-to-br from-green-500/10 to-green-500/5 p-4 sm:p-6"
                        >
                            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                                <Users size={24} className="text-green-400" />
                                Available Teams
                                <span className="ml-auto text-sm font-normal text-gray-400">
                                    {availableTeams.length} teams open
                                </span>
                            </h2>
                            <p className="text-gray-400 text-sm mb-4">
                                These teams are looking for new members. Send a join request to get started!
                            </p>

                            {availableTeamsLoading ? (
                                <div className="flex items-center justify-center py-8">
                                    <Loader2 className="animate-spin text-green-400" size={24} />
                                </div>
                            ) : availableTeams.length > 0 ? (
                                <div className="space-y-3">
                                    {availableTeams.map((t) => (
                                        <motion.div
                                            key={t._id}
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 bg-gray-800/50 rounded-xl border border-gray-700/50 hover:border-green-500/30 transition-all group gap-4"
                                        >
                                            <div className="flex items-center gap-3 min-w-0">
                                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-white font-bold shrink-0">
                                                    {t.name?.[0]?.toUpperCase() || "T"}
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-white font-medium truncate">{t.name}</p>
                                                    <p className="text-gray-400 text-sm flex flex-wrap items-center gap-1 sm:gap-2">
                                                        <span className="flex items-center gap-1">
                                                            <Crown size={12} className="text-yellow-400" />
                                                            {t.leaderId?.username || "Unknown"}
                                                        </span>
                                                        <span className="text-gray-600 hidden sm:inline">•</span>
                                                        <span className="flex items-center gap-1">
                                                            <Users size={12} />
                                                            {t.members?.length || 0} members
                                                        </span>
                                                    </p>
                                                </div>
                                            </div>
                                            <motion.button
                                            whileTap={{ scale: 0.98 }}
                                            onClick={() => requestJoin(t._id)}
                                            disabled={actionLoading === `join-${t._id}` || requestedTeamIds.includes(t._id)}
                                            className={`px-4 py-2 border rounded-lg transition-colors flex items-center justify-center gap-2 shrink-0 w-full sm:w-auto ${
                                                requestedTeamIds.includes(t._id)
                                                    ? "bg-gray-700/50 border-gray-600 text-gray-400"
                                                    : "bg-cyan-500/20 border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/30"
                                            }`}
                                        >
                                            {actionLoading === `join-${t._id}` ? (
                                                <Loader2 size={16} className="animate-spin" />
                                            ) : requestedTeamIds.includes(t._id) ? (
                                                <Check size={16} />
                                            ) : (
                                                <Send size={16} />
                                            )}
                                            {requestedTeamIds.includes(t._id) ? "Requested" : "Request to Join"}
                                        </motion.button>
                                        </motion.div>
                                    ))}
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center py-8 text-gray-500">
                                    <Users size={32} className="mb-2 opacity-50" />
                                    <p className="text-sm">No teams available right now</p>
                                    <p className="text-xs text-gray-600 mt-1">Create your own team or search for a specific one below</p>
                                </div>
                            )}
                        </motion.div>

                        {/* Find a Team */}
                        <motion.div
                            variants={itemVariants}
                            className="rounded-2xl border border-gray-700/50 bg-gradient-to-br from-gray-800/60 to-gray-900/80 p-6"
                        >
                            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                                <Search size={24} className="text-purple-400" />
                                Find a Team to Join
                            </h2>
                            <div className="flex flex-col sm:flex-row gap-3 mb-4">
                                <input
                                    type="text"
                                    value={teamSearchQuery}
                                    onChange={(e) => setTeamSearchQuery(e.target.value)}
                                    placeholder="Search by team name..."
                                    className="flex-1 px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 transition-all"
                                    onKeyDown={(e) => e.key === "Enter" && searchTeams()}
                                />
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={searchTeams}
                                    className="px-6 py-3 bg-gray-700 text-white rounded-xl hover:bg-gray-600 transition-all flex items-center justify-center gap-2 shrink-0"
                                >
                                    <Search size={18} />
                                    Search
                                </motion.button>
                            </div>

                            {teamSearchResults.length > 0 && (
                                <div className="space-y-3">
                                    {teamSearchResults.map((t) => (
                                        <div
                                            key={t._id}
                                            className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 bg-gray-800/50 rounded-xl border border-gray-700/50 gap-4"
                                        >
                                            <div className="min-w-0">
                                                <p className="text-white font-medium truncate">{t.name}</p>
                                                <p className="text-gray-400 text-sm">
                                                    {t.members?.length || 0} members
                                                </p>
                                            </div>
                                            <motion.button
                                                whileTap={{ scale: 0.98 }}
                                                onClick={() => requestJoin(t._id)}
                                                disabled={actionLoading === `join-${t._id}` || requestedTeamIds.includes(t._id)}
                                                className={`px-4 py-2 border rounded-lg transition-colors flex items-center justify-center gap-2 shrink-0 w-full sm:w-auto ${
                                                    requestedTeamIds.includes(t._id)
                                                        ? "bg-gray-700/50 border-gray-600 text-gray-400"
                                                        : "bg-cyan-500/20 border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/30"
                                                }`}
                                            >
                                                {actionLoading === `join-${t._id}` ? (
                                                    <Loader2 size={16} className="animate-spin" />
                                                ) : requestedTeamIds.includes(t._id) ? (
                                                    <Check size={16} />
                                                ) : (
                                                    <UserPlus size={16} />
                                                )}
                                                {requestedTeamIds.includes(t._id) ? "Requested" : "Request to Join"}
                                            </motion.button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </motion.div>
                    </>
                )}
            </motion.div>
        </>
    );
}
