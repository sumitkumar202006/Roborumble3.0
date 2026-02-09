"use client";

import { useUser } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  Mail,
  Phone,
  Building2,
  Calendar,
  Trophy,
  Users,
  Edit3,
  Check,
  X,
  Loader2,
  Star,
  Save,
  MapPin,
  GraduationCap,
    LucideIcon,
    Heart,
} from "lucide-react";

const AVAILABLE_INTERESTS = [
    { name: "Robotics", icon: "🤖", color: "from-cyan-500 to-blue-500" },
    { name: "AI/ML", icon: "🧠", color: "from-purple-500 to-pink-500" },
    { name: "Web Dev", icon: "🌐", color: "from-blue-500 to-cyan-500" },
    { name: "App Dev", icon: "📱", color: "from-green-500 to-emerald-500" },
    { name: "IOT", icon: "🔌", color: "from-orange-500 to-red-500" },
    { name: "CyberSec", icon: "🔐", color: "from-red-500 to-rose-500" },
    { name: "UI/UX", icon: "🎨", color: "from-pink-500 to-purple-500" },
    { name: "Cloud", icon: "☁️", color: "from-sky-500 to-blue-500" },
    { name: "Blockchain", icon: "⛓️", color: "from-indigo-500 to-blue-500" },
];

interface UserProfile {
  _id: string;
  clerkId: string;
  username: string;
  email: string;
  phone?: string;
  bio?: string;
  college?: string;
  city?: string;
  state?: string;
  degree?: string;
  branch?: string;
  yearOfStudy?: number;
  interests?: string[];
  teamId?: string;
  createdAt: string;
}

interface TeamData {
  _id: string;
  name: string;
  members?: Array<{ _id: string; username: string; email: string }>;
  isLocked: boolean;
  leaderId: string;
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

// Loading Skeleton
function LoadingSkeleton() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="space-y-8"
    >
      <div className="flex items-center gap-6">
        <div className="w-32 h-32 rounded-2xl bg-gradient-to-r from-gray-800 via-gray-700 to-gray-800 animate-pulse" />
        <div className="space-y-3 flex-1">
          <div className="h-8 w-48 bg-gradient-to-r from-gray-800 via-gray-700 to-gray-800 rounded animate-pulse" />
          <div className="h-5 w-64 bg-gradient-to-r from-gray-800 via-gray-700 to-gray-800 rounded animate-pulse" />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="h-24 bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-xl border border-gray-700/50 animate-pulse"
            style={{ animationDelay: `${i * 100}ms` }}
          />
        ))}
      </div>
    </motion.div>
  );
}

// Editable Field Component
function EditableField({
  icon: Icon,
  label,
  value,
  field,
  color = "cyan",
  isEditing,
  editValue,
  onEditChange,
  type = "text",
  options,
}: {
  icon: typeof User;
  label: string;
  value: string | number | undefined;
  field: string;
  color?: string;
  isEditing: boolean;
  editValue: string;
  onEditChange: (field: string, value: string) => void;
  type?: "text" | "select" | "number" | "textarea";
  options?: { value: string; label: string }[];
}) {
  const colorMap: Record<string, string> = {
    cyan: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
    purple: "bg-purple-500/20 text-purple-400 border-purple-500/30",
    yellow: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
    green: "bg-green-500/20 text-green-400 border-green-500/30",
    pink: "bg-pink-500/20 text-pink-400 border-pink-500/30",
  };

  const iconColor: Record<string, string> = {
    cyan: "bg-cyan-500/20 text-cyan-400",
    purple: "bg-purple-500/20 text-purple-400",
    yellow: "bg-yellow-500/20 text-yellow-400",
    green: "bg-green-500/20 text-green-400",
    pink: "bg-pink-500/20 text-pink-400",
  };

  return (
    <div className="bg-gradient-to-br from-gray-800/60 to-gray-900/80 backdrop-blur-sm rounded-xl border border-gray-700/50 p-4">
      <div className="flex items-center gap-4">
        <div className={`p-3 rounded-lg ${iconColor[color]}`}>
          <Icon size={20} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-gray-400 text-sm mb-1">{label}</p>
          {isEditing ? (
            type === "select" && options ? (
              <select
                value={editValue}
                onChange={(e) => onEditChange(field, e.target.value)}
                className={`w-full bg-gray-800 border rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 ${colorMap[color]}`}
              >
                <option value="">Select {label}</option>
                {options.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            ) : type === "number" ? (
              <input
                type="number"
                value={editValue}
                onChange={(e) => onEditChange(field, e.target.value)}
                className={`w-full bg-gray-800 border rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 ${colorMap[color]}`}
                min="1"
                max="6"
              />
            ) : type === "textarea" ? (
              <textarea
                value={editValue}
                onChange={(e) => onEditChange(field, e.target.value)}
                className={`w-full bg-gray-800 border rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 ${colorMap[color]} resize-none`}
                rows={3}
                placeholder={`Enter ${label.toLowerCase()}`}
              />
            ) : (
              <input
                type="text"
                value={editValue}
                onChange={(e) => onEditChange(field, e.target.value)}
                className={`w-full bg-gray-800 border rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 ${colorMap[color]}`}
                placeholder={`Enter ${label.toLowerCase()}`}
              />
            )
          ) : (
            <p className="text-white font-semibold truncate">
              {value || <span className="text-gray-500 italic">Not set</span>}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

// Stat Badge Component
function StatBadge({
  icon: Icon,
  value,
  label,
  color,
}: {
  icon: typeof Trophy;
  value: string | number;
  label: string;
  color: string;
}) {
  return (
    <div
      className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${color}`}
    >
      <Icon size={14} />
      <span className="font-bold">{value}</span>
      <span className="text-sm opacity-80">{label}</span>
    </div>
  );
}

export default function ProfilePage() {
  const { user, isLoaded } = useUser();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [team, setTeam] = useState<TeamData | null>(null);
  const [registrationCount, setRegistrationCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
    const [editForm, setEditForm] = useState({
    username: "",
    phone: "",
    bio: "",
    college: "",
    city: "",
    state: "",
    degree: "",
    branch: "",
    yearOfStudy: "",
  });
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  useEffect(() => {
    async function fetchData() {
      if (!user?.id) return;
      try {
        const [userRes, teamRes, regRes] = await Promise.all([
          fetch(`/api/users?clerkId=${user.id}`),
          fetch(`/api/teams?clerkId=${user.id}`),
          fetch(`/api/registrations?clerkId=${user.id}`),
        ]);

        if (userRes.ok) {
          const userData = await userRes.json();
                    setProfile(userData.user);
                    setSelectedInterests(userData.user?.interests || []);
                    // Initialize edit form with current values
          setEditForm({
            username: userData.user?.username || "",
            phone: userData.user?.phone || "",
            bio: userData.user?.bio || "",
            college: userData.user?.college || "",
            city: userData.user?.city || "",
            state: userData.user?.state || "",
            degree: userData.user?.degree || "",
            branch: userData.user?.branch || "",
            yearOfStudy: userData.user?.yearOfStudy?.toString() || "",
          });
        }
        if (teamRes.ok) {
          const teamData = await teamRes.json();
          setTeam(teamData.team);
        }
        if (regRes.ok) {
          const regData = await regRes.json();
          setRegistrationCount(regData.registrations?.length || 0);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    if (isLoaded && user) fetchData();
    else if (isLoaded && !user) setLoading(false);
  }, [user, isLoaded]);

  const handleEditChange = (field: string, value: string) => {
    setEditForm((prev) => ({ ...prev, [field]: value }));
  };

    const toggleInterest = (interest: string) => {
        if (!isEditing) return;
        setSelectedInterests((prev) =>
            prev.includes(interest) ? prev.filter((i) => i !== interest) : [...prev, interest]
        );
    };

    const handleSave = async () => {
        if (!user?.id) return;
        setSaving(true);
        setMessage(null);

        try {
            const res = await fetch("/api/users", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    clerkId: user.id,
                    ...editForm,
                    yearOfStudy: editForm.yearOfStudy ? parseInt(editForm.yearOfStudy) : undefined,
                    interests: selectedInterests,
                }),
            });

      if (res.ok) {
        const data = await res.json();
        setProfile(data.user);
        setIsEditing(false);
        setMessage({ type: "success", text: "Profile updated successfully!" });
      } else {
        const error = await res.json();
        setMessage({
          type: "error",
          text: error.error || "Failed to update profile",
        });
      }
    } catch (e) {
      setMessage({
        type: "error",
        text: "Failed to update profile. Please try again.",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    // Reset form to current profile values
    if (profile) {
      setEditForm({
        username: profile.username || "",
        phone: profile.phone || "",
        bio: profile.bio || "",
        college: profile.college || "",
        city: profile.city || "",
        state: profile.state || "",
        degree: profile.degree || "",
        branch: profile.branch || "",
                yearOfStudy: profile.yearOfStudy?.toString() || "",
            });
            setSelectedInterests(profile.interests || []);
        }
    };

  const isTeamLeader = team && profile && team.leaderId === profile._id;
  const memberSince = profile?.createdAt
    ? new Date(profile.createdAt).toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      })
    : "N/A";

  const degreeOptions = [
    { value: "B.Tech", label: "B.Tech" },
    { value: "B.E.", label: "B.E." },
    { value: "M.Tech", label: "M.Tech" },
    { value: "BCA", label: "BCA" },
    { value: "MCA", label: "MCA" },
    { value: "B.Sc", label: "B.Sc" },
    { value: "M.Sc", label: "M.Sc" },
    { value: "Diploma", label: "Diploma" },
    { value: "Other", label: "Other" },
  ];

  const yearOptions = [
    { value: "1", label: "1st Year" },
    { value: "2", label: "2nd Year" },
    { value: "3", label: "3rd Year" },
    { value: "4", label: "4th Year" },
    { value: "5", label: "5th Year" },
  ];

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
          className="space-y-8 max-w-5xl"
        >
          {/* Message Toast */}
          <AnimatePresence>
            {message && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className={`fixed top-24 right-6 z-50 px-4 py-3 rounded-xl border flex items-center gap-3 ${
                  message.type === "success"
                    ? "bg-green-500/20 border-green-500/50 text-green-400"
                    : "bg-red-500/20 border-red-500/50 text-red-400"
                }`}
              >
                {message.type === "success" ? (
                  <Check size={18} />
                ) : (
                  <X size={18} />
                )}
                <span>{message.text}</span>
                <button
                  onClick={() => setMessage(null)}
                  className="ml-2 hover:opacity-70"
                >
                  <X size={16} />
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Profile Header Card */}
          <motion.div
            variants={itemVariants}
            className="relative overflow-hidden rounded-2xl border border-gray-700/50 bg-gradient-to-br from-gray-800/80 to-gray-900/90 backdrop-blur-sm"
          >
            {/* Background Gradient */}
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 via-purple-500/10 to-pink-500/10" />
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 to-transparent"
              animate={{ x: ["-100%", "100%"] }}
              transition={{
                duration: 8,
                repeat: Infinity,
                ease: "linear",
              }}
            />

            <div className="relative p-6 md:p-8">
              <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                {/* Avatar */}
                <motion.div
                  className="relative"
                  whileHover={{ scale: 1.05 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <div className="w-28 h-28 md:w-32 md:h-32 rounded-2xl bg-gradient-to-br from-cyan-500 to-purple-600 p-[3px]">
                    <div className="w-full h-full rounded-2xl bg-gray-900 flex items-center justify-center">
                      {user?.imageUrl ? (
                        <img
                          src={user.imageUrl}
                          alt="Profile"
                          className="w-full h-full rounded-2xl object-cover"
                        />
                      ) : (
                        <span className="text-5xl font-bold bg-gradient-to-br from-cyan-400 to-purple-500 bg-clip-text text-transparent">
                          {profile?.username?.[0]?.toUpperCase() ||
                            user?.firstName?.[0] ||
                            "?"}
                        </span>
                      )}
                    </div>
                  </div>
                  {isTeamLeader && (
                    <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center border-4 border-gray-900">
                      <Star size={14} className="text-black" />
                    </div>
                  )}
                </motion.div>

                {/* Info */}
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-3 mb-2">
                    <h1 className="text-2xl md:text-3xl font-bold text-white">
                      {profile?.username || user?.fullName || "User"}
                    </h1>
                    {profile?.college && (
                      <span className="px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-400 text-sm font-medium">
                        {profile.college}
                      </span>
                    )}
                  </div>
                  <p className="text-gray-400 mb-4">
                    {profile?.email || user?.emailAddresses?.[0]?.emailAddress}
                  </p>

                  {/* Stats */}
                  <div className="flex flex-wrap items-center gap-3">
                    <StatBadge
                      icon={Trophy}
                      value={registrationCount}
                      label="Events"
                      color="bg-yellow-500/20 text-yellow-400"
                    />
                    {team && (
                      <StatBadge
                        icon={Users}
                        value={team.members?.length || 0}
                        label={`in ${team.name}`}
                        color="bg-cyan-500/20 text-cyan-400"
                      />
                    )}
                    <StatBadge
                      icon={Calendar}
                      value={memberSince}
                      label=""
                      color="bg-purple-500/20 text-purple-400"
                    />
                  </div>
                </div>

                {/* Edit/Save Buttons */}
                <div className="flex items-center gap-3">
                  {isEditing ? (
                    <>
                      <motion.button
                        onClick={handleCancel}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="flex items-center gap-2 px-4 py-2 bg-gray-700/50 hover:bg-gray-600/50 border border-gray-600 rounded-xl text-gray-300 font-medium transition-colors"
                      >
                        <X size={18} />
                        <span>Cancel</span>
                      </motion.button>
                      <motion.button
                        onClick={handleSave}
                        disabled={saving}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="flex items-center gap-2 px-4 py-2 bg-green-500/20 hover:bg-green-500/30 border border-green-500/50 rounded-xl text-green-400 font-medium transition-colors disabled:opacity-50"
                      >
                        {saving ? (
                          <Loader2 size={18} className="animate-spin" />
                        ) : (
                          <Save size={18} />
                        )}
                        <span>{saving ? "Saving..." : "Save"}</span>
                      </motion.button>
                    </>
                  ) : (
                    <motion.button
                      onClick={() => setIsEditing(true)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="flex items-center gap-2 px-4 py-2 bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/50 rounded-xl text-cyan-400 font-medium transition-colors"
                    >
                      <Edit3 size={18} />
                      <span>Edit Profile</span>
                    </motion.button>
                  )}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Personal Information */}
          <motion.div variants={itemVariants}>
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <User className="text-cyan-400" size={22} />
              Personal Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <EditableField
                icon={User}
                label="Username"
                value={profile?.username}
                field="username"
                color="cyan"
                isEditing={isEditing}
                editValue={editForm.username}
                onEditChange={handleEditChange}
              />
              <EditableField
                icon={Mail}
                label="Email"
                value={profile?.email}
                field="email"
                color="purple"
                isEditing={false} // Email is not editable
                editValue={profile?.email || ""}
                onEditChange={() => {}}
              />
              <EditableField
                icon={Phone}
                label="Phone"
                value={profile?.phone}
                field="phone"
                color="green"
                isEditing={isEditing}
                editValue={editForm.phone}
                onEditChange={handleEditChange}
              />
              <EditableField
                icon={Building2}
                label="College"
                value={profile?.college}
                field="college"
                color="yellow"
                isEditing={isEditing}
                editValue={editForm.college}
                onEditChange={handleEditChange}
              />
              <EditableField
                icon={MapPin}
                label="City"
                value={profile?.city}
                field="city"
                color="pink"
                isEditing={isEditing}
                editValue={editForm.city}
                onEditChange={handleEditChange}
              />
              <EditableField
                icon={MapPin}
                label="State"
                value={profile?.state}
                field="state"
                color="cyan"
                isEditing={isEditing}
                editValue={editForm.state}
                onEditChange={handleEditChange}
              />
              <div className="md:col-span-2 lg:col-span-3">
                <EditableField
                  icon={Edit3}
                  label="Bio"
                  value={profile?.bio}
                  field="bio"
                  color="purple"
                  isEditing={isEditing}
                  editValue={editForm.bio}
                  onEditChange={handleEditChange}
                  type="textarea"
                />
              </div>
            </div>
          </motion.div>

          {/* Academic Details */}
          <motion.div variants={itemVariants}>
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <GraduationCap className="text-purple-400" size={22} />
              Academic Details
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <EditableField
                icon={GraduationCap}
                label="Degree"
                value={profile?.degree}
                field="degree"
                color="purple"
                isEditing={isEditing}
                editValue={editForm.degree}
                onEditChange={handleEditChange}
                type="select"
                options={degreeOptions}
              />
              <EditableField
                icon={Building2}
                label="Branch"
                value={profile?.branch}
                field="branch"
                color="yellow"
                isEditing={isEditing}
                editValue={editForm.branch}
                onEditChange={handleEditChange}
              />
              <EditableField
                icon={Calendar}
                label="Year of Study"
                value={
                  profile?.yearOfStudy
                    ? `Year ${profile.yearOfStudy}`
                    : undefined
                }
                field="yearOfStudy"
                color="green"
                isEditing={isEditing}
                editValue={editForm.yearOfStudy}
                onEditChange={handleEditChange}
                type="select"
                options={yearOptions}
              />
            </div>
          </motion.div>

                    {/* Interests Section */}
                    <motion.div variants={itemVariants}>
                        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                            <Heart className="text-pink-400" size={22} />
                            Skills & Interests
                        </h2>
                        <div className="bg-gradient-to-br from-gray-800/60 to-gray-900/80 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-6">
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                                {AVAILABLE_INTERESTS.map((interest) => {
                                    const isSelected = selectedInterests.includes(interest.name);
                                    return (
                                        <motion.button
                                            key={interest.name}
                                            disabled={!isEditing}
                                            whileHover={isEditing ? { scale: 1.05 } : {}}
                                            whileTap={isEditing ? { scale: 0.95 } : {}}
                                            onClick={() => toggleInterest(interest.name)}
                                            className={`relative p-3 rounded-xl text-center transition-all border ${isSelected
                                                ? "bg-gradient-to-br " + interest.color + " text-white border-transparent shadow-lg"
                                                : "bg-gray-800/40 border-gray-700 text-gray-400 hover:border-gray-600"
                                                } ${!isEditing && !isSelected ? "opacity-40 grayscale" : ""}`}
                                        >
                                            <span className="text-2xl block mb-1">{interest.icon}</span>
                                            <span className="text-xs font-bold uppercase tracking-wider">{interest.name}</span>
                                            {isSelected && isEditing && (
                                                <div className="absolute -top-1 -right-1 bg-white text-black rounded-full p-0.5 shadow-md">
                                                    <Check size={10} strokeWidth={4} />
                                                </div>
                                            )}
                                        </motion.button>
                                    );
                                })}
                            </div>
                        </div>
                    </motion.div>

                    {/* Team Section */}
          {team && (
            <motion.div variants={itemVariants}>
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <Users className="text-yellow-400" size={22} />
                Team Details
              </h2>
              <div className="bg-gradient-to-br from-gray-800/60 to-gray-900/80 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-2xl font-bold text-white">
                      {team.name}
                    </h3>
                    <p className="text-gray-400">
                      {team.members?.length || 0} Members
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {isTeamLeader && (
                      <span className="px-3 py-1 rounded-full bg-yellow-500/20 text-yellow-400 text-sm font-medium flex items-center gap-1">
                        <Star size={14} /> Leader
                      </span>
                    )}
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${
                        team.isLocked
                          ? "bg-red-500/20 text-red-400"
                          : "bg-green-500/20 text-green-400"
                      }`}
                    >
                      {team.isLocked ? "🔒 Locked" : "✓ Open"}
                    </span>
                  </div>
                </div>

                {/* Team Members */}
                <div className="flex flex-wrap gap-2">
                  {team.members?.map((member) => (
                    <div
                      key={member._id}
                      className={`px-3 py-2 rounded-lg bg-gray-800/50 border ${
                        profile?._id === member._id
                          ? "border-cyan-500/50"
                          : "border-gray-700/50"
                      }`}
                    >
                      <p className="text-white text-sm font-medium">
                        {member.username}
                        {profile?._id === member._id && (
                          <span className="text-cyan-400 ml-1">(You)</span>
                        )}
                      </p>
                      <p className="text-gray-500 text-xs">{member.email}</p>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
