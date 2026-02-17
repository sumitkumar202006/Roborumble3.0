"use client";

import { useUser, useClerk } from "@clerk/nextjs";
import { useEffect, useState, useCallback } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

export default function RegistrationGate({
  children,
}: {
  children: React.ReactNode;
}) {
  // Clerk hooks
  const {
    user: clerkUser,
    isLoaded: clerkLoaded,
    isSignedIn: clerkSignedIn,
  } = useUser();
  const { signOut } = useClerk();

  // NextAuth hooks
  const { data: session, status: sessionStatus } = useSession();

  const pathname = usePathname();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  // Determine global loading/auth state
  const isAuthLoaded = clerkLoaded && sessionStatus !== "loading";
  const isAuthenticated = clerkSignedIn || !!session;

  const checkRegistration = useCallback(async () => {
    // If not authenticated, we don't proceed with checks
    if (!isAuthenticated) return;

    // Special handling for admin pages - let admin safeguards handle it
    if (pathname.startsWith("/admin")) return;

    setLoading(true);
    try {
      const res = await fetch("/api/auth/verify-registration");
      const data = await res.json();
      console.log("RegistrationGate Check:", data); // DEBUG LOG

      if (res.ok) {
        const isOnboarded = data.onboardingCompleted;

        if (isOnboarded) {
          // If user is onboarded but trying to access onboarding page, send to dashboard
          if (pathname.startsWith("/onboarding")) {
            console.log("Onboarded user on /onboarding -> Redirecting to /dashboard"); // DEBUG LOG
            router.push("/dashboard");
          }
        } else {
          // If user is NOT onboarded
          // If they are NOT on the onboarding page, send them there
          if (!pathname.startsWith("/onboarding")) {
            console.log("Un-onboarded user on " + pathname + " -> Redirecting to /onboarding"); // DEBUG LOG
            router.push("/onboarding");
          }
        }
      }
    } catch (err) {
      console.error("Failed to verify registration:", err);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, pathname, router]);

  useEffect(() => {
    if (isAuthLoaded && isAuthenticated) {
      checkRegistration();
    }
  }, [isAuthLoaded, isAuthenticated, checkRegistration]);

  return <>{children}</>;
}
