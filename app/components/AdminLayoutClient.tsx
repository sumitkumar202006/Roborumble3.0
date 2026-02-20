"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
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

  const isLoginPage = pathname === "/admin/login";

  useEffect(() => {
    // Skip auth check on the login page itself
    if (isLoginPage) {
      setChecking(false);
      return;
    }

    // Check auth via the me endpoint (reads JWT cookie from admin login)
    fetch("/api/auth/me")
      .then((res) => {
        if (!res.ok) throw new Error("Not authenticated");
        return res.json();
      })
      .then((data) => {
        const role = data?.user?.role?.toLowerCase();
        if (role === "admin" || role === "superadmin") {
          setAdminUser(data.user);
        } else {
          // Authenticated but not admin
          router.push("/admin/login");
        }
      })
      .catch(() => {
        router.push("/admin/login");
      })
      .finally(() => {
        setChecking(false);
      });
  }, [isLoginPage, router]);

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
