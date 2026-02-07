import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import mongoose from "mongoose";
import connectDB from "@/lib/mongodb";
import AuthUser from "@/app/models/AuthUser";

export async function GET() {
  try {
    await connectDB();

    const cookieStore = await cookies();
    const token = cookieStore.get("token");

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify Token
    const decoded = jwt.verify(
      token.value,
      process.env.JWT_SECRET || "default_secret"
    ) as { userId: string };

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(decoded.userId)) {
      return NextResponse.json({ error: "Invalid User ID in token" }, { status: 401 });
    }

    // Fetch User
    const user = await AuthUser.findById(decoded.userId).select(
      "name email college events paymentStatus role teamName paidEvents createdAt"
    );

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(
      {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          college: user.college,
          events: user.events,
          paymentStatus: user.paymentStatus,
          role: user.role,
          teamName: user.teamName,
          paidEvents: user.paidEvents,
          createdAt: user.createdAt,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Session Error:", error);
    return NextResponse.json({ error: "Invalid Token" }, { status: 401 });
  }
}
