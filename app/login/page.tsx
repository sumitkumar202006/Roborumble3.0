"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { signIn as nextAuthSignIn, useSession } from "next-auth/react";
import { useAuth, SignIn, useSignIn } from "@clerk/nextjs";
import { FaGoogle, FaEnvelope, FaLock, FaArrowRight } from "react-icons/fa";
import { motion } from "framer-motion";

export default function LoginPage() {
  const router = useRouter();
  
  // NextAuth Session
  const { data: session, status: sessionStatus } = useSession();
  
  // Clerk Session
  const { isSignedIn: isClerkSignedIn, isLoaded: isClerkLoaded } = useAuth();
  const { signIn: clerkSignIn, setActive, isLoaded: isSignInLoaded } = useSignIn();

  const [showLegacy, setShowLegacy] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (sessionStatus === "authenticated" || (isClerkLoaded && isClerkSignedIn)) {
      router.replace("/dashboard");
    }
  }, [sessionStatus, isClerkLoaded, isClerkSignedIn, router]);

  const handleGoogleLogin = async () => {
    await nextAuthSignIn("google", { callbackUrl: "/dashboard" });
  };

  const handleLegacyLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const result = await nextAuthSignIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        console.error("Login error", result.error);
        setError("Invalid email or password");
      } else {
        router.push("/dashboard");
      }
    } catch (err) {
      console.error("Login exception", err);
      setError("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  if (sessionStatus === "loading" || !isClerkLoaded) {
    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020617] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
        <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] bg-purple-600/20 blur-[120px] rounded-full" />
        <div className="absolute top-[40%] right-[0%] w-[40%] h-[40%] bg-blue-600/20 blur-[120px] rounded-full" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-blue-400">
              Welcome Back
            </h1>
            <p className="text-gray-400 mt-2">Sign in to access your dashboard</p>
          </div>

          {!showLegacy ? (
            <div className="space-y-4">
              <button
                onClick={handleGoogleLogin}
                className="w-full bg-white text-gray-900 h-12 rounded-xl font-semibold flex items-center justify-center gap-3 hover:bg-gray-100 transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]"
              >
                <FaGoogle className="text-lg" />
                <span>Sign in with Google</span>
              </button>

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/10"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-[#020617]/50 text-gray-500 backdrop-blur-sm">Or</span>
                </div>
              </div>

              <button
                onClick={() => setShowLegacy(true)}
                className="w-full bg-white/5 border border-white/10 text-white h-12 rounded-xl font-medium flex items-center justify-center gap-3 hover:bg-white/10 transition-all duration-300"
              >
                <FaEnvelope className="text-lg" />
                <span>Sign in with Email</span>
              </button>
            </div>
          ) : (
            <form onSubmit={handleLegacyLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Email</label>
                <div className="relative">
                  <FaEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-11 pr-4 text-white focus:outline-none focus:border-purple-500/50 transition-colors placeholder-gray-600"
                    placeholder="name@example.com"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Password</label>
                <div className="relative">
                  <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-11 pr-4 text-white focus:outline-none focus:border-purple-500/50 transition-colors placeholder-gray-600"
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>

              {error && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm text-center">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white h-12 rounded-xl font-semibold flex items-center justify-center gap-2 hover:opacity-90 transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                ) : (
                    <>
                        <span>Sign In</span>
                        <FaArrowRight />
                    </>
                )}
              </button>

              <button
                type="button"
                onClick={() => setShowLegacy(false)}
                className="w-full text-gray-500 text-sm hover:text-gray-300 transition-colors"
              >
                Back to Authentication Options
              </button>
            </form>
          )}
        </div>
        
        <p className="text-center text-gray-500 text-sm mt-8">
            Don't have an account?{" "}
            <a href="/sign-up" className="text-purple-400 hover:text-purple-300 transition-colors">
                Register for Robo Rumble
            </a>
        </p>
      </motion.div>
    </div>
  );
}
