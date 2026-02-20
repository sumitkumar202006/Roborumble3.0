"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import AdminSidebar from "./AdminSidebar";

type AdminUser = { role: string; name: string; email: string } | null;

export default function AdminLayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [adminUser, setAdminUser] = useState<AdminUser>(null);
  const [checking, setChecking] = useState(true);
  // Use a ref to make sure we only auth-check once per mount, not on every render
  const hasChecked = useRef(false);

  const isLoginPage = pathname === "/admin/login";

  useEffect(() => {
    // Skip auth check on the login page itself
    if (isLoginPage) {
      setChecking(false);
      return;
    }

    // Only fetch once — don't re-run if we already confirmed the user
    if (hasChecked.current) return;
    hasChecked.current = true;

    // Check auth via the me endpoint (reads JWT cookie from admin login)
    fetch("/api/auth/me")
      .then((res) => {
        if (!res.ok) throw new Error("Not authenticated");
        return res.json();
      })
      .then((data) => {
        const role = (data?.user?.role || "").toLowerCase();
        if (role === "admin" || role === "superadmin") {
          setAdminUser(data.user);
        } else {
          // Authenticated via NextAuth but not an admin — redirect
          router.replace("/admin/login");
        }
      })
      .catch(() => {
        router.replace("/admin/login");
      })
      .finally(() => {
        setChecking(false);
      });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoginPage]); // intentionally exclude router to prevent re-runs on navigation

  // Login page: just render children with no layout
  if (isLoginPage) {
    return (
      <div className="min-h-screen bg-black w-full text-white">{children}</div>
    );
  }

  // Still checking auth
  if (checking) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center font-mono text-[#FF003C]">
        <div className="w-12 h-12 border-4 border-[#FF003C]/30 border-t-[#FF003C] rounded-full animate-spin mb-4" />
        AUTHENTICATING...
      </div>
    );
  }

  // Not an admin (redirect already triggered in effect)
  if (!adminUser) {
    return null;
  }

  return (
    <div className="flex min-h-screen bg-black text-white">
      <AdminSidebar />
      <div className="flex-1 w-full relative overflow-x-hidden md:ml-64 transition-all duration-300">
        {children}
      </div>
    </div>
  );
}
