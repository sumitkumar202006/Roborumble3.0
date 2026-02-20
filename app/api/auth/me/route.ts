import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import mongoose from "mongoose";

import { auth as nextAuth } from "@/auth";
import connectDB from "@/lib/mongodb";
import AuthUser from "@/app/models/AuthUser";
import Profile from "@/app/models/Profile";

export async function GET() {
  try {
    await connectDB();

    const cookieStore = await cookies();
    const token = cookieStore.get("token");

    // 1. Try Legacy Auth first (Custom JWT)
    if (token) {
      try {
        const decoded = jwt.verify(
          token.value,
          process.env.JWT_SECRET || "default_secret"
        ) as { userId: string };

        if (mongoose.Types.ObjectId.isValid(decoded.userId)) {
          const legacyUser = await AuthUser.findById(decoded.userId).select(
            "name email college events paymentStatus role teamName paidEvents createdAt"
          );

          if (legacyUser) {
            return NextResponse.json({
              user: {
                id: legacyUser._id,
                name: legacyUser.name,
                email: legacyUser.email,
                college: legacyUser.college,
                events: legacyUser.events,
                paymentStatus: legacyUser.paymentStatus,
                role: legacyUser.role,
                teamName: legacyUser.teamName,
                paidEvents: legacyUser.paidEvents,
                createdAt: legacyUser.createdAt,
              },
            });
          }
        }
      } catch (e) {
        console.error("Legacy JWT verify failed:", e);
      }
    }

    // 2. Try NextAuth
    const nextAuthSession = await nextAuth();
    if (nextAuthSession?.user?.email) {
         const profile = await Profile.findOne({ email: nextAuthSession.user.email });
         if (profile) {
              return NextResponse.json({
                user: {
                    id: profile._id,
                    name: profile.firstName ? `${profile.firstName} ${profile.lastName || ""}`.trim() : nextAuthSession.user.name || "User",
                    email: profile.email,
                    college: profile.college || "N/A",
                    events: profile.registeredEvents || [],
                    role: profile.role || "user",
                    teamName: profile.username,
                    paymentStatus: profile.paidEvents?.length ? "paid" : "pending",
                    onboardingCompleted: profile.onboardingCompleted || false
                }
            });
         }
    }

    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  } catch (error) {
    console.error("Session Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
