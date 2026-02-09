"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import AdminSidebar from "./AdminSidebar";

export default function AdminLayoutClient({
  children,
  isAdmin,
}: {
  children: React.ReactNode;
  isAdmin: boolean;
}) {
  const pathname = usePathname();
  const router = useRouter();

  const isLoginPage = pathname === "/admin/login";

  useEffect(() => {
    // If not on login page and not admin, redirect
    if (!isLoginPage && !isAdmin) {
      router.push("/admin/login");
    }
  }, [isAdmin, isLoginPage, router]);

  if (isLoginPage) {
    return (
      <div className="min-h-screen bg-black w-full">
        {children}
      </div>
    );
  }

  // Protected Admin Area Layout
  if (!isAdmin) {
    // Show nothing while redirecting or for unauthorized users
    return <div className="min-h-screen bg-black flex items-center justify-center font-mono text-[#FF003C]">AUTHENTICATING...</div>;
  }

  return (
    <div className="flex min-h-screen bg-black">
      <AdminSidebar />
      <div className="flex-1 w-full relative overflow-x-hidden md:ml-64 transition-all duration-300">
        {children}
      </div>
    </div>
  );
}
