"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useUser, useClerk } from "@clerk/nextjs";
import { useSession, signOut as nextAuthSignOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import CollegeSearchInput from "@/app/components/CollegeSearchInput";
import SearchableSelect from "@/app/components/SearchableSelect";
import {
  LogOut,
  User,
  Heart,
  GraduationCap,
  Phone,
  ChevronRight,
  ChevronLeft,
  Check,
  Sparkles,
  Loader2,
  AlertCircle,
  Zap,
  MapPin,
  LucideIcon,
} from "lucide-react";

const AVAILABLE_INTERESTS = [
  { name: "Robotics", icon: "🤖", color: "from-cyan-500 to-blue-500" },
  { name: "AI/ML", icon: "🧠", color: "from-purple-500 to-pink-500" },
  { name: "Web Dev", icon: "🌐", color: "from-blue-500 to-cyan-500" },
  { name: "App Dev", icon: "📱", color: "from-green-500 to-emerald-500" },
  { name: "IoT", icon: "📡", color: "from-orange-500 to-red-500" },
  { name: "Embedded", icon: "⚙️", color: "from-gray-500 to-zinc-500" },
  { name: "3D Print", icon: "🖨️", color: "from-pink-500 to-rose-500" },
  { name: "Drones", icon: "🚁", color: "from-sky-500 to-blue-500" },
  { name: "Gaming", icon: "🎮", color: "from-violet-500 to-purple-500" },
  { name: "Security", icon: "🔐", color: "from-red-500 to-orange-500" },
  { name: "Blockchain", icon: "⛓️", color: "from-yellow-500 to-amber-500" },
  { name: "Cloud", icon: "☁️", color: "from-indigo-500 to-blue-500" },
];

const STEPS = [
  { id: 1, title: "Identity", icon: User },
  { id: 2, title: "Education", icon: GraduationCap },
  { id: 3, title: "Location", icon: MapPin },
  { id: 4, title: "Interests", icon: Heart },
  { id: 5, title: "Contact", icon: Phone },
];

const pageVariants = {
  initial: (direction: number) => ({
    x: direction > 0 ? 200 : -200,
    opacity: 0,
  }),
  animate: {
    x: 0,
    opacity: 1,
    transition: { type: "spring" as const, stiffness: 300, damping: 30 },
  },
  exit: (direction: number) => ({
    x: direction > 0 ? -200 : 200,
    opacity: 0,
    transition: { duration: 0.2 },
  }),
};

function ProgressIndicator({ currentStep }: { currentStep: number }) {
  return (
    <div className="flex items-center justify-center gap-1 mb-4">
      {STEPS.map((step, index) => {
        const StepIcon = step.icon;
        const isCompleted = index + 1 < currentStep;
        const isCurrent = index + 1 === currentStep;
        return (
          <div key={step.id} className="flex items-center">
            <motion.div
              animate={{
                scale: isCurrent ? 1.1 : 1,
                backgroundColor:
                  isCompleted || isCurrent
                    ? "rgb(34, 211, 238)"
                    : "rgb(31, 41, 55)",
              }}
              className={`w-9 h-9 rounded-full flex items-center justify-center ${isCurrent ? "ring-2 ring-cyan-500/30" : ""}`}
            >
              {isCompleted ? (
                <Check className="w-4 h-4 text-black" />
              ) : (
                <StepIcon
                  className={`w-4 h-4 ${isCurrent ? "text-black" : "text-gray-400"}`}
                />
              )}
            </motion.div>
            {index < STEPS.length - 1 && (
              <div className="w-6 md:w-10 h-0.5 mx-0.5 bg-gray-700 overflow-hidden">
                <motion.div
                  className="h-full bg-cyan-500"
                  animate={{ width: index + 1 < currentStep ? "100%" : "0%" }}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function AnimatedInput({
  label,
  name,
  value,
  onChange,
  placeholder,
  type = "text",
  required = false,
  icon: Icon,
}: {
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder: string;
  type?: string;
  required?: boolean;
  icon?: LucideIcon;
}) {
  return (
    <div className="space-y-1">
      <label className="text-white text-sm font-medium">
        {label}
        {required && <span className="text-cyan-400 ml-1">*</span>}
      </label>
      <div className="relative">
        {Icon && (
          <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
        )}
        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={`w-full ${Icon ? "pl-10" : "pl-3"} pr-3 py-2.5 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 transition-all text-sm`}
        />
      </div>
    </div>
  );
}

function AnimatedSelect({
  label,
  name,
  value,
  onChange,
  options,
  required = false,
  icon: Icon,
}: {
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options: { value: string; label: string }[];
  required?: boolean;
  icon?: LucideIcon;
}) {
  return (
    <div className="space-y-1">
      <label className="text-white text-sm font-medium">
        {label}
        {required && <span className="text-cyan-400 ml-1">*</span>}
      </label>
      <div className="relative">
        {Icon && (
          <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
        )}
        <select
          name={name}
          value={value}
          onChange={onChange}
          className={`w-full ${Icon ? "pl-10" : "pl-3"} pr-3 py-2.5 bg-gray-800/50 border border-gray-700 rounded-lg text-white appearance-none focus:outline-none focus:border-cyan-500 transition-all text-sm`}
        >
          <option value="" disabled className="bg-gray-900 text-gray-400">
            Select {label}
          </option>
          {options.map((opt) => (
            <option
              key={opt.value}
              value={opt.value}
              className="bg-gray-900 text-white"
            >
              {opt.label}
            </option>
          ))}
        </select>
        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
          <ChevronRight size={14} className="rotate-90" />
        </div>
      </div>
    </div>
  );
}

export default function OnboardingPage() {
  const { user, isLoaded } = useUser();
  const { signOut } = useClerk();
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [direction, setDirection] = useState(0);
  // NextAuth
  const { data: session } = useSession();

  const [formData, setFormData] = useState({
    username: "",
    bio: "",
    phone: "",
    college: "",
    city: "",
    state: "",
    degree: "",
    branch: "",
    yearOfStudy: "",
    boarding: "",
  });
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function checkCurrentStatus() {
      // Check if we have EITHER Clerk user OR NextAuth session
      if ((!isLoaded || !user) && !session) return;

      try {
        const res = await fetch("/api/onboarding");
        const data = await res.json();

        if (res.ok && data.onboardingCompleted) {
          router.push("/dashboard");
        } else {
          setLoading(false);
        }
      } catch (err) {
        console.error("Failed to check status", err);
        setLoading(false);
      }
    }

    checkCurrentStatus();
  }, [isLoaded, user, session, router]);

  useEffect(() => {
    if (user?.username) {
      setFormData((prev) => ({ ...prev, username: user.username || "" }));
    } else if (session?.user?.name) {
      // Optional: Try to suggest username from email or name
      // const suggested = session.user.email?.split('@')[0] || "";
      // setFormData((prev) => ({ ...prev, username: suggested }));
    }
  }, [user, session]);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError("");
  };

  const toggleInterest = (interest: string) => {
    setSelectedInterests((prev) =>
      prev.includes(interest)
        ? prev.filter((i) => i !== interest)
        : [...prev, interest],
    );
    setError("");
  };

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

  const validateStep = (step: number): boolean => {
    if (
      step === 1 &&
      (!formData.username.trim() || formData.username.length < 3)
    ) {
      setError(
        formData.username.trim()
          ? "Username must be at least 3 characters"
          : "Username is required",
      );
      return false;
    }
    if (step === 2) {
      if (!formData.college.trim()) {
        setError("College name is required");
        return false;
      }
      if (!formData.degree) {
        setError("Please select your degree");
        return false;
      }
      if (!formData.degree) {
        setError("Please select your degree");
        return false;
      }
    }
    if (step === 3) {
      if (!formData.city.trim()) {
        setError("City is required");
        return false;
      }
      if (!formData.state.trim()) {
        setError("State is required");
        return false;
      }
    }
    if (step === 4 && selectedInterests.length === 0) {
      setError("Please select at least one interest");
      return false;
    }
    if (step === 5 && (!formData.phone.trim() || formData.phone.length < 10)) {
      setError("Please enter a valid mobile number");
      return false;
    }
    return true;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setDirection(1);
      setCurrentStep((p) => Math.min(p + 1, 5));
      setError("");
    }
  };
  const prevStep = () => {
    setDirection(-1);
    setCurrentStep((p) => Math.max(p - 1, 1));
    setError("");
  };

  const handleSubmit = async () => {
    if (!validateStep(5)) return;
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: formData.username.trim(),
          bio: formData.bio.trim(),
          phone: formData.phone.trim(),
          college: formData.college.trim(),
          city: formData.city.trim(),
          state: formData.state.trim(),
          degree: formData.degree,
          branch: formData.branch.trim(),
          yearOfStudy: formData.yearOfStudy
            ? parseInt(formData.yearOfStudy)
            : undefined,
          interests: selectedInterests,
          boarding: formData.boarding,
        }),
      });
      const data = await response.json();
      if (!response.ok)
        throw new Error(data.message || "Failed to save profile");
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  if (!isLoaded)
    return (
      <div className="h-screen flex items-center justify-center bg-[#020617]">
        <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
      </div>
    );

  return (
    <div className="min-h-screen bg-[#020617] flex items-center justify-center p-4">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/5 via-transparent to-purple-500/5" />

      <div className="relative z-10 w-full max-w-lg">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <Link href="/dashboard" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center overflow-hidden h-8 w-8 relative">
              <Image
                src="/skull-1.png"
                alt="Robo Rumble Logo"
                fill
                className="object-contain scale-150"
              />
            </div>
            <span className="text-lg font-bold text-white group-hover:text-[#00E5FF] tracking-tight leading-tight transition-all duration-300">
              Robo Rumble
            </span>
          </Link>
          <button
            onClick={async () => {
              await nextAuthSignOut({ redirect: false });
              await signOut();
              router.push("/");
            }}
            className="flex items-center gap-1 px-3 py-1.5 text-gray-400 text-sm hover:text-white transition-colors"
          >
            <LogOut size={14} /> Logout
          </button>
        </div>

        {/* Progress */}
        <ProgressIndicator currentStep={currentStep} />

        {/* Title */}
        <motion.div
          key={currentStep}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center mb-4"
        >
          <h2 className="text-xl font-bold text-white">
            {STEPS[currentStep - 1].title}
          </h2>
        </motion.div>

        {/* Error */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-3 bg-red-500/10 border border-red-500/50 text-red-400 px-3 py-2 rounded-lg flex items-center gap-2 text-sm"
            >
              <AlertCircle size={16} /> {error}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Form */}
        <AnimatePresence mode="wait" custom={direction}>
          {currentStep === 1 && (
            <motion.div
              key="s1"
              custom={direction}
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="bg-gray-800/30 border border-gray-700/50 rounded-xl p-4 space-y-4"
            >
              <AnimatedInput
                label="Username"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                placeholder="Choose a unique username"
                required
                icon={User}
              />
              <div className="space-y-1">
                <label className="text-white text-sm font-medium">Bio</label>
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleInputChange}
                  placeholder="Tell us about yourself..."
                  rows={2}
                  maxLength={200}
                  className="w-full px-3 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 transition-all resize-none text-sm"
                />
                <div className="text-right text-xs text-gray-500">
                  {formData.bio.length}/200
                </div>
              </div>
            </motion.div>
          )}
          {currentStep === 2 && (
            <motion.div
              key="s2"
              custom={direction}
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="bg-gray-800/30 border border-gray-700/50 rounded-xl p-4 space-y-4 overflow-visible"
            >
              <CollegeSearchInput
                value={formData.college}
                onChange={(val) => {
                  setFormData((prev) => ({ ...prev, college: val }));
                  setError("");
                }}
                required
              />
              <div className="grid grid-cols-2 gap-4 relative z-10">
                <SearchableSelect
                  label="Degree/Grade"
                  value={formData.degree}
                  onChange={(val) => {
                    setFormData((prev) => ({ ...prev, degree: val }));
                    setError("");
                  }}
                  options={degreeOptions}
                  placeholder="Search or type degree..."
                  icon={GraduationCap}
                  required
                />
                <AnimatedSelect
                  label="Year (Optional)"
                  name="yearOfStudy"
                  value={formData.yearOfStudy}
                  onChange={handleInputChange}
                  options={yearOptions}
                />
              </div>
              <AnimatedInput
                label="Branch / Course (Optional)"
                name="branch"
                value={formData.branch}
                onChange={handleInputChange}
                placeholder="e.g., Computer Science, Mechanical..."
              />
            </motion.div>
          )}
          {currentStep === 3 && (
            <motion.div
              key="s3"
              custom={direction}
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="bg-gray-800/30 border border-gray-700/50 rounded-xl p-4 space-y-4"
            >
              <div className="grid grid-cols-2 gap-4">
                <AnimatedInput
                  label="City"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  placeholder="e.g., New Delhi"
                  icon={MapPin}
                  required
                />
                <AnimatedInput
                  label="State"
                  name="state"
                  value={formData.state}
                  onChange={handleInputChange}
                  placeholder="e.g., Delhi"
                  required
                />
              </div>

              <div className="space-y-3 pt-2 border-t border-gray-700/50">
                <label className="text-white text-sm font-medium block">
                  Do you need a boarding facility?{" "}
                  <span className="text-cyan-400">*</span>
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() =>
                      setFormData((prev) => ({ ...prev, boarding: "yes" }))
                    }
                    className={`py-2.5 px-4 rounded-lg border text-sm font-medium transition-all ${
                      formData.boarding === "yes"
                        ? "bg-cyan-500/20 border-cyan-500 text-cyan-400"
                        : "bg-gray-800/50 border-gray-700 text-gray-400 hover:border-gray-600"
                    }`}
                  >
                    Yes, I need it
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setFormData((prev) => ({ ...prev, boarding: "no" }))
                    }
                    className={`py-2.5 px-4 rounded-lg border text-sm font-medium transition-all ${
                      formData.boarding === "no"
                        ? "bg-cyan-500/20 border-cyan-500 text-cyan-400"
                        : "bg-gray-800/50 border-gray-700 text-gray-400 hover:border-gray-600"
                    }`}
                  >
                    No, I don't
                  </button>
                </div>

                <div className="p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg flex gap-2 items-start">
                  <AlertCircle
                    size={16}
                    className="text-yellow-500 mt-0.5 shrink-0"
                  />
                  <p className="text-yellow-500/90 text-xs">
                    <span className="font-bold">Disclaimer:</span> Boarding
                    facility is subject to availability it may or may not be
                    given to you so you should be prepared accordingly.
                  </p>
                </div>
              </div>

              <div className="p-3 bg-cyan-500/5 border border-cyan-500/20 rounded-lg">
                <p className="text-zinc-500 text-xs">
                  📍 This helps us customize event locations and logistics for
                  you.
                </p>
              </div>
            </motion.div>
          )}
          {currentStep === 4 && (
            <motion.div
              key="s4"
              custom={direction}
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="bg-gray-800/30 border border-gray-700/50 rounded-xl p-4"
            >
              <p className="text-gray-400 text-xs mb-3">
                Select topics you&apos;re passionate about:
              </p>
              <div className="grid grid-cols-3 gap-2">
                {AVAILABLE_INTERESTS.map((interest) => {
                  const isSelected = selectedInterests.includes(interest.name);
                  return (
                    <motion.button
                      key={interest.name}
                      type="button"
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        setSelectedInterests((prev) =>
                          prev.includes(interest.name)
                            ? prev.filter((i) => i !== interest.name)
                            : [...prev, interest.name],
                        );
                      }}
                      className={`p-2 rounded-lg border text-center transition-all ${
                        isSelected
                          ? "bg-cyan-500/20 border-cyan-500 text-cyan-400"
                          : "bg-gray-800/30 border-gray-700 text-gray-500 hover:border-gray-600"
                      }`}
                    >
                      <span className="text-lg block mb-1">
                        {interest.icon}
                      </span>
                      <span className="text-[10px] font-bold uppercase tracking-wider">
                        {interest.name}
                      </span>
                    </motion.button>
                  );
                })}
              </div>
              <div className="mt-2 text-center">
                <span
                  className={`text-xs ${selectedInterests.length > 0 ? "text-cyan-400" : "text-gray-500"}`}
                >
                  {selectedInterests.length} selected
                </span>
              </div>
            </motion.div>
          )}
          {currentStep === 5 && (
            <motion.div
              key="s5"
              custom={direction}
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="bg-gray-800/30 border border-gray-700/50 rounded-xl p-4 space-y-4"
            >
              <AnimatedInput
                label="Phone Number"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="+91 98765 43210"
                type="tel"
                icon={Phone}
                required
              />
              <div className="p-3 bg-cyan-500/10 border border-cyan-500/30 rounded-lg">
                <p className="text-cyan-400 text-xs">
                  💡 Only shared with team members & organizers.
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Navigation - directly after form */}
        <div className="flex justify-between items-center mt-4">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={prevStep}
            disabled={currentStep === 1}
            className={`flex items-center gap-1 px-4 py-2 rounded-lg text-sm font-medium transition-all ${currentStep === 1 ? "opacity-0 pointer-events-none" : "bg-gray-800 text-gray-300 hover:bg-gray-700"}`}
          >
            <ChevronLeft size={16} /> Back
          </motion.button>
          {currentStep < 5 ? (
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={nextStep}
              className="flex items-center gap-1 px-6 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-sm font-medium rounded-lg shadow-lg shadow-cyan-500/25"
            >
              Continue <ChevronRight size={16} />
            </motion.button>
          ) : (
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={handleSubmit}
              disabled={loading}
              className="flex items-center gap-1 px-6 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white text-sm font-medium rounded-lg shadow-lg shadow-green-500/25 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" /> Saving...
                </>
              ) : (
                <>
                  <Sparkles size={16} /> Complete
                </>
              )}
            </motion.button>
          )}
        </div>
      </div>
    </div>
  );
}
