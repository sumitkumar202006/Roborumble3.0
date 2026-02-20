/**
 * Shared admin auth helper.
 * Checks BOTH the legacy JWT cookie (used by /api/auth/login) and NextAuth session.
 * Returns the decoded role if authorized as admin, or null if not.
 */
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { auth as nextAuth } from "@/auth";
import connectDB from "@/lib/mongodb";
import AuthUser from "@/app/models/AuthUser";
import Profile from "@/app/models/Profile";

const ADMIN_ROLES = ["ADMIN", "SUPERADMIN"];

export async function verifyAdminRequest(): Promise<{ email: string; role: string } | null> {
  // 1. Try legacy JWT cookie first (set by /api/auth/login for admin users)
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token");
    if (token) {
      const decoded = jwt.verify(
        token.value,
        process.env.JWT_SECRET || "default_secret"
      ) as { userId: string; email: string; role: string };

      if (ADMIN_ROLES.includes(decoded.role?.toUpperCase())) {
        return { email: decoded.email, role: decoded.role };
      }
    }
  } catch {
    // JWT invalid or expired — fall through to NextAuth
  }

  // 2. Try NextAuth session (for social login admins)
  try {
    const session = await nextAuth();
    if (session?.user?.email) {
      // Check role from session (if set) or look up profile
      // @ts-ignore
      const sessionRole = session.user.role?.toUpperCase();
      if (sessionRole && ADMIN_ROLES.includes(sessionRole)) {
        return { email: session.user.email, role: sessionRole };
      }

      // Fallback: look up profile role in DB
      await connectDB();
      const profile = await Profile.findOne({ email: session.user.email.toLowerCase() }).select("role email");
      if (profile && ADMIN_ROLES.includes((profile.role || "").toUpperCase())) {
        return { email: profile.email, role: profile.role };
      }
    }
  } catch {
    // NextAuth error — fall through
  }

  return null;
}
