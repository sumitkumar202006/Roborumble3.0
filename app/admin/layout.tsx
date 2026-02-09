import { Metadata } from "next";
import AdminSidebar from "../components/AdminSidebar";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import connectToDB from "@/lib/mongodb";
import Profile from "@/app/models/Profile";
import AdminLayoutClient from "../components/AdminLayoutClient";

export const metadata: Metadata = {
  title: "Admin Console | Robo Rumble 3.0",
  description: "Restricted Access Area",
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await currentUser();

  // We allow /admin/login even if not logged in via Clerk
  // (though the sidebar and redirect logic needs to be careful)

  // Checking admin status for protected routes
  const checkAdminStatus = async () => {
    if (!user) return false;
    await connectToDB();
    const profile = await Profile.findOne({ clerkId: user.id });
    return !!(profile && ["admin", "superadmin"].includes(profile.role));
  };

  const isAdmin = await checkAdminStatus();

  return <AdminLayoutClient isAdmin={isAdmin}>{children}</AdminLayoutClient>;
}
