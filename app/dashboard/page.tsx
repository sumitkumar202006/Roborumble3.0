"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState, useMemo } from "react";
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
  Shield,
  Gavel,
  Home,
  Info,
  FileText,
  MapPin,
  GraduationCap,
  Activity,
  Bot,
  MessageCircle,
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
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
      className="relative overflow-hidden rounded-2xl border border-gray-700/50 bg-gradient-to-br from-gray-800/60 to-gray-900/80 backdrop-blur-sm h-full"
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

      <div className="relative p-6 z-10 h-full flex flex-col">
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
        <div className="relative z-10 flex-1 flex flex-col">
          <motion.div
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium mb-4 w-fit ${accentColor}`}
            whileHover={{ scale: 1.05 }}
          >
            <Icon size={16} />
            <span>{title}</span>
          </motion.div>

          <div className="flex-1 mb-4">
            {children || <p className="text-gray-400 text-sm">{description}</p>}
          </div>

          <Link
            href={href}
            className={`inline-flex items-center gap-2 ${accentColor.replace("bg-", "text-").replace("/20", "-400")} hover:brightness-125 font-medium text-sm transition-all group`}
          >
            <span>{linkText}</span>
            <motion.span initial={{ x: 0 }} whileHover={{ x: 4 }}>
              <ArrowRight size={16} />
            </motion.span>
          </Link>
        </div>
      </div>
    </motion.div>
  );
}

export default function DashboardPage() {
  const { data: session, status: sessionStatus } = useSession();

  // Unified user object for data fetching
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
  const [esportsTeam, setEsportsTeam] = useState<TeamData | null>(null);
  const [registrations, setRegistrations] = useState<RegistrationData[]>([]);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    async function fetchData() {
      if (!session?.user) return;
      try {
        setLoading(true);
        const [teamRes, esportsRes, regRes, profileRes] = await Promise.all([
          fetch(`/api/teams`),
          fetch(`/api/teams?type=esports`),
          fetch(`/api/registrations`),
          fetch(`/api/users`),
        ]);
        const teamData = await teamRes.json();
        const esportsData = await esportsRes.json();
        const regData = await regRes.json();
        const profileData = await profileRes.json();

        setTeam(teamData.team);
        setEsportsTeam(esportsData.team);
        setRegistrations(regData.registrations || []);
        setProfile(profileData.user);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    if (isLoaded && session?.user) fetchData();
    else if (sessionStatus !== "loading" && !session?.user)
      setLoading(false);
  }, [session, isLoaded, sessionStatus]);

  const paidCount = registrations.filter(
    (r) => r.paymentStatus === "paid" || r.paymentStatus === "manual_verified",
  ).length;

  return (
    <AnimatePresence mode="wait">
      {!isLoaded || loading ? (
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

          {/* WhatsApp Community Banner */}
          <motion.a
            href="https://chat.whatsapp.com/E9LJgOdncow6ReE1b7y6Ew"
            target="_blank"
            rel="noopener noreferrer"
            variants={itemVariants}
            whileHover={{ scale: 1.01, y: -2 }}
            whileTap={{ scale: 0.99 }}
            className="relative flex items-center gap-4 p-4 md:p-5 rounded-2xl border border-green-500/30 bg-gradient-to-r from-green-900/20 via-emerald-900/10 to-green-900/20 overflow-hidden cursor-pointer group"
          >
            {/* Animated shimmer */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-green-500/5 to-transparent"
              animate={{ x: ["-100%", "100%"] }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            />
            {/* Pulsing glow */}
            <motion.div
              className="absolute -inset-px rounded-2xl border border-green-400/0 group-hover:border-green-400/40 transition-colors duration-300"
            />

            {/* WhatsApp icon */}
            <div className="relative shrink-0">
              <motion.div
                animate={{ scale: [1, 1.15, 1] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center shadow-lg shadow-green-500/30"
              >
                <MessageCircle size={24} className="text-white fill-white" />
              </motion.div>
            </div>

            {/* Text */}
            <div className="relative flex-1 min-w-0">
              <p className="text-white font-bold text-base leading-tight">
                Join the Robo Rumble WhatsApp Community
              </p>
              <p className="text-green-400/80 text-sm mt-0.5">
                Stay updated on event schedules, announcements &amp; results
              </p>
            </div>

            {/* Arrow */}
            <motion.div
              className="relative shrink-0 text-green-400"
              initial={{ x: 0 }}
              whileHover={{ x: 4 }}
            >
              <ArrowRight size={20} />
            </motion.div>
          </motion.a>

          {/* Action Cards */}
          <motion.div
            variants={containerVariants}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {/* Team Card */}
            <motion.div variants={itemVariants}>
              <ActionCard
                icon={Users}
                title="My Team"
                linkText={team ? "Manage Team" : "Create or Join Team"}
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
                        {team.members?.length || 0} Members
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          team.isLocked
                            ? "bg-red-500/20 text-red-400"
                            : "bg-green-500/20 text-green-400"
                        }`}
                      >
                        {team.isLocked ? "🔒 Locked" : "✓ Open"}
                      </span>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-400 text-sm mb-4 min-h-[40px]">
                    You haven&apos;t joined a robotics team yet. Create one or
                    join an existing team!
                  </p>
                )}
              </ActionCard>
            </motion.div>

            {/* Esports Team Card */}
            <motion.div variants={itemVariants}>
              <ActionCard
                icon={Bot}
                title="Esports Team"
                linkText={esportsTeam ? "Manage Squad" : "Build Esports Squad"}
                href="/dashboard/esports-team"
                color="from-purple-500/20 to-pink-500/20"
                accentColor="bg-purple-500/20 text-purple-400"
              >
                {esportsTeam ? (
                  <div className="mb-4">
                    <p className="text-2xl font-bold text-white mb-1">
                      {esportsTeam.name}
                    </p>
                    <div className="flex items-center gap-3">
                      <span className="text-gray-400 text-sm">
                        {esportsTeam.members?.length || 0} Members
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          esportsTeam.isLocked
                            ? "bg-red-500/20 text-red-400"
                            : "bg-green-500/20 text-green-400"
                        }`}
                      >
                        {esportsTeam.isLocked ? "🔒 Locked" : "✓ Open"}
                      </span>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-400 text-sm mb-4 min-h-[40px]">
                    Build your elite gaming squad for Esports events.
                  </p>
                )}
              </ActionCard>
            </motion.div>

            {/* Events Card */}
            <motion.div variants={itemVariants}>
              <ActionCard
                icon={Trophy}
                title="Compete"
                linkText="Browse Events"
                href="/dashboard/events"
                color="from-yellow-500/20 to-orange-500/20"
                accentColor="bg-yellow-500/20 text-yellow-400"
              >
                <div className="mb-4">
                  <p className="text-gray-400 text-sm mb-2">
                    Register for events and showcase your robotics skills in
                    thrilling competitions.
                  </p>
                </div>
              </ActionCard>
            </motion.div>

            {/* Profile Card */}
            <motion.div variants={itemVariants}>
              <ActionCard
                icon={CheckCircle2}
                title="Onboarding"
                linkText="Edit Profile"
                href="/dashboard/profile"
                color="from-green-500/20 to-emerald-500/20"
                accentColor="bg-green-500/20 text-green-400"
              >
                <div className="mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles size={16} className="text-green-400" />
                    <span className="text-green-400 font-bold">Completed</span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <MapPin size={14} className="text-zinc-500" />
                      <span className="text-zinc-400 text-xs">
                        {profile?.city && profile?.state
                          ? `${profile.city}, ${profile.state}`
                          : "Location not set"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <GraduationCap size={14} className="text-zinc-500" />
                      <span className="text-zinc-400 text-xs truncate">
                        {profile?.college || "College not set"}
                      </span>
                    </div>
                    {(profile?.degree || profile?.branch) && (
                      <div className="flex items-center gap-2">
                        <Activity size={14} className="text-zinc-500" />
                        <span className="text-zinc-400 text-[10px] uppercase font-bold tracking-wider">
                          {[profile.degree, profile.branch]
                            .filter(Boolean)
                            .join(" • ")}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </ActionCard>
            </motion.div>
          </motion.div>

          {/* General Rules & Regulations */}
          <motion.div
            variants={itemVariants}
            className="relative overflow-hidden rounded-2xl border border-cyan-500/20"
          >
            {/* Animated Background */}
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-900/10 via-blue-900/10 to-purple-900/10" />
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
              <div className="flex items-center gap-3 mb-8">
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
                  <FileText className="text-cyan-400" size={24} />
                </motion.div>
                <h2 className="text-xl md:text-2xl font-bold text-white uppercase tracking-tight">
                  General Rules & Regulations
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Category 1 */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-cyan-400 font-bold text-sm uppercase tracking-wider mb-2">
                    <Users size={16} />
                    <span>1. Team Eligibility & Composition</span>
                  </div>
                  <ul className="space-y-3">
                    {[
                      "Profile Completeness: A complete profile (including Name, Username, Mobile, College, and academic details) is mandatory for creating or joining a team.",
                      "Unique Team Identity: Every team must have a unique name. Case-insensitive duplicates are not permitted during creation.",
                      "Institutional Unity: All members must belong to the same college. The college name must match EXACTLY (e.g., if one uses 'ABC College', all must use 'ABC College'). If one uses an abbreviation, all must use the same abbreviation. Even a single letter difference will prevent you from joining the team.",
                      "Team Capacity: Teams can have a maximum of 50 members, though individual event requirements may vary.",
                      "Exclusive Membership: A student cannot be a member of more than one team simultaneously.",
                    ].map((rule, i) => (
                      <li
                        key={i}
                        className="flex gap-3 text-gray-400 text-sm leading-relaxed"
                      >
                        <span className="text-cyan-500/50">•</span>
                        {rule}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Category 2 */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-blue-400 font-bold text-sm uppercase tracking-wider mb-2">
                    <Zap size={16} />
                    <span>2. Participation & Bot Rules</span>
                  </div>
                  <ul className="space-y-3">
                    {[
                      "Teams may register multiple bots for the same event, provided each has a unique operator.",
                      "An operator is restricted to controlling only one bot per specific event.",
                      "The same robot may be entered into multiple different events if technical requirements are met.",
                    ].map((rule, i) => (
                      <li
                        key={i}
                        className="flex gap-3 text-gray-400 text-sm leading-relaxed"
                      >
                        <span className="text-blue-500/50">•</span>
                        {rule}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Category 3 */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-red-400 font-bold text-sm uppercase tracking-wider mb-2">
                    <Shield size={16} />
                    <span>3. Conduct & Disqualification</span>
                  </div>
                  <ul className="space-y-3">
                    {[
                      "Judges' decisions are absolute and final. Zero tolerance for arguing.",
                      "Disqualified teams will not receive participation certificates.",
                      "Failure to meet technical or procedural requirements leads to immediate removal.",
                    ].map((rule, i) => (
                      <li
                        key={i}
                        className="flex gap-3 text-gray-400 text-sm leading-relaxed"
                      >
                        <span className="text-red-500/50">•</span>
                        {rule}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Category 4 */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-purple-400 font-bold text-sm uppercase tracking-wider mb-2">
                    <Home size={16} />
                    <span>4. Logistics & Accommodation</span>
                  </div>
                  <ul className="space-y-3">
                    {[
                      "Staying facilities (hostels) will be provided based on availability.",
                      "All accommodation costs must be covered by the participating teams.",
                      "Teams requiring a hostel must indicate this during the initial registration process.",
                    ].map((rule, i) => (
                      <li
                        key={i}
                        className="flex gap-3 text-gray-400 text-sm leading-relaxed"
                      >
                        <span className="text-purple-500/50">•</span>
                        {rule}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Note Section */}
              <div className="mt-8 p-4 bg-yellow-500/5 border border-yellow-500/20 rounded-xl flex gap-3 items-center">
                <Info size={18} className="text-yellow-500 shrink-0" />
                <p className="text-yellow-500/80 text-xs font-medium uppercase tracking-wide">
                  Note: If any event has less than 10 participating teams, prize
                  distribution will be limited to 1st and 2nd position only.
                </p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
