import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import College from "@/app/models/College";

// GET /api/colleges?q=searchterm - Search colleges
export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const query = searchParams.get("q")?.trim();

        await connectDB();

        if (!query || query.length < 2) {
            // Return popular/recent colleges when no search query
            const colleges = await College.find({})
                .sort({ name: 1 })
                .limit(30)
                .select("name");
            return NextResponse.json({
                colleges: colleges.map((c) => c.name),
            });
        }

        // Case-insensitive regex search
        const colleges = await College.find({
            name: { $regex: query, $options: "i" },
        })
            .sort({ name: 1 })
            .limit(20)
            .select("name");

        return NextResponse.json({
            colleges: colleges.map((c) => c.name),
        });
    } catch (error) {
        console.error("College search error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

// POST /api/colleges - Add a new college
export async function POST(req: Request) {
    try {
        const { name } = await req.json();

        if (!name || typeof name !== "string") {
            return NextResponse.json(
                { error: "College name is required" },
                { status: 400 }
            );
        }

        const trimmed = name.trim();

        // Validate: must be at least 4 characters
        if (trimmed.length < 4) {
            return NextResponse.json(
                { error: "Please enter the full college name (no abbreviations)" },
                { status: 400 }
            );
        }

        // Validate: reject pure abbreviations (all uppercase, no spaces, < 10 chars)
        if (trimmed.length < 10 && /^[A-Z]+$/.test(trimmed)) {
            return NextResponse.json(
                { error: "Please enter the full college name without abbreviations" },
                { status: 400 }
            );
        }

        await connectDB();

        // Check if already exists (case-insensitive)
        const existing = await College.findOne({
            name: { $regex: `^${trimmed.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, $options: "i" },
        });

        if (existing) {
            return NextResponse.json({ name: existing.name, exists: true });
        }

        // Create new college
        const college = await College.create({ name: trimmed });

        return NextResponse.json(
            { name: college.name, exists: false },
            { status: 201 }
        );
    } catch (error) {
        console.error("Add college error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
