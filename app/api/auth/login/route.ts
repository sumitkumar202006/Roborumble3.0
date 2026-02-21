import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import connectDB from "@/lib/mongodb";
import AuthUser from "@/app/models/AuthUser";

export async function POST(req: Request) {
  try {
    await connectDB();

    const body = await req.json();
    const { email, password } = body;

    console.log("Login attempt for:", email);

    if (!email || !password) {
      return NextResponse.json({ error: "Missing credentials" }, { status: 400 });
    }

    // Find user by email
    const user = await AuthUser.findOne({ email });

    if (!user) {
      console.log("User not found:", email);
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Verify password
    const isValid = await bcrypt.compare(password, user.password);

    if (!isValid) {
      console.log("Invalid password for:", email);
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    // Create Token
    const token = jwt.sign(
      { userId: user._id.toString(), email: user.email, role: user.role },
      process.env.JWT_SECRET || "default_secret",
      { expiresIn: "7d" }
    );

    // Set Cookie
    (await cookies()).set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    });

    console.log("Login successful:", email);
    return NextResponse.json(
      {
        message: "Login successful",
        user: {
          name: user.name,
          email: user.email,
          role: user.role,
          teamName: user.teamName,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Login Error Details:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
