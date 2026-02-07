import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Profile from "@/app/models/Profile";
import Team from "@/app/models/Team";

// GET - Search users by username or email
export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const query = searchParams.get("q");
        const clerkId = searchParams.get("clerkId"); // Current user's clerkId to exclude
        const excludeInTeam = searchParams.get("excludeInTeam") === "true";

        if (!query || query.length < 2) {
            return NextResponse.json(
                { message: "Search query must be at least 2 characters" },
                { status: 400 }
            );
        }

        await connectDB();

        // Get current user's profile to exclude from results
        let currentProfile = null;
        if (clerkId) {
            currentProfile = await Profile.findOne({ clerkId });
        }

        // Build search query - search by username OR email
        const searchRegex = new RegExp(query, "i");
        const searchFilter: Record<string, unknown> = {
            $or: [
                { username: searchRegex },
                { email: searchRegex },
                { firstName: searchRegex },
                { lastName: searchRegex },
            ],
            onboardingCompleted: true, // Only show users who completed onboarding
        };

        // Exclude current user
        if (currentProfile) {
            searchFilter._id = { $ne: currentProfile._id };
        }

        // Find matching users
        let users = await Profile.find(searchFilter)
            .select("_id username email firstName lastName avatarUrl college course")
            .limit(15);

        // If excludeInTeam is true, filter out users who are already in a team
        if (excludeInTeam && users.length > 0) {
            const userIds = users.map((u) => u._id);

            // Find all teams that have any of these users
            const teamsWithUsers = await Team.find({
                $or: [
                    { leaderId: { $in: userIds } },
                    { members: { $in: userIds } },
                ],
            }).select("leaderId members");

            // Create a set of user IDs that are in teams
            const usersInTeamsSet = new Set<string>();
            teamsWithUsers.forEach((team) => {
                if (team.leaderId) usersInTeamsSet.add(team.leaderId.toString());
                team.members?.forEach((memberId: { toString: () => string }) => {
                    usersInTeamsSet.add(memberId.toString());
                });
            });

            // Filter out users who are in teams
            users = users.filter((u) => !usersInTeamsSet.has(u._id.toString()));
        }

        // Format the response
        const formattedUsers = users.map((u) => ({
            _id: u._id,
            username: u.username || "No username",
            email: u.email,
            firstName: u.firstName,
            lastName: u.lastName,
            fullName: [u.firstName, u.lastName].filter(Boolean).join(" ") || u.username || "Unknown",
            avatarUrl: u.avatarUrl,
            college: u.college,
            course: u.course,
        }));

        return NextResponse.json({
            users: formattedUsers,
            count: formattedUsers.length,
        });
    } catch (error) {
        console.error("User search error:", error);
        return NextResponse.json(
            { message: "Internal server error" },
            { status: 500 }
        );
    }
}
