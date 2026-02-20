import { NextResponse } from "next/server";
import { auth as nextAuth } from "@/auth";
import mongoose from "mongoose";
import connectDB from "@/lib/mongodb";
import Profile from "@/app/models/Profile";
import Event from "@/app/models/Event";
import Team from "@/app/models/Team";
import Registration from "@/app/models/Registration";

export async function POST(req: Request) {
    try {
        let email = "";

        // Check NextAuth
        const nextSession = await nextAuth();
        if (nextSession?.user?.email) {
            email = nextSession.user.email;
        }

        if (!email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { eventId, teamId, selectedMembers } = await req.json();

        if (!eventId) {
            return NextResponse.json({ error: "Event ID required" }, { status: 400 });
        }

        await connectDB();

        // Validate Event exists in MongoDB
        const event = await Event.findOne({ eventId, isLive: true });
        if (!event) {
            return NextResponse.json({ error: "Event not found or not available" }, { status: 400 });
        }

        // Find user profile by email
        const profile = await Profile.findOne({ email });
        if (!profile) {
            return NextResponse.json({ error: "Complete profile details. Complete onboarding first." }, { status: 404 });
        }

        // Type assertion to ensure _id exists
        const profileId = profile._id as mongoose.Types.ObjectId;

        // --- TEAM REGISTRATION FLOW ---
        if (teamId && Array.isArray(selectedMembers) && selectedMembers.length > 0) {
            const team = await Team.findById(teamId);
            if (!team) {
                return NextResponse.json({ error: "Team not found" }, { status: 404 });
            }

            // Verify Leader
            if (team.leaderId.toString() !== profileId.toString()) {
                return NextResponse.json({ error: "Only the Team Leader can register the team" }, { status: 403 });
            }

            // Validate Roster Selection
            const validMemberIds = team.members.map(m => m.toString());
            const areAllMembersValid = selectedMembers.every((m: string) => validMemberIds.includes(m));

            if (!areAllMembersValid) {
                return NextResponse.json({ error: "One or more selected members are not in your team" }, { status: 400 });
            }

            // Validate Team Size Limits
            if (selectedMembers.length < event.minTeamSize || selectedMembers.length > event.maxTeamSize) {
                return NextResponse.json({
                    error: `Team size must be between ${event.minTeamSize} and ${event.maxTeamSize} for this event`
                }, { status: 400 });
            }

            // Check if Team already registered
            const existingReg = await Registration.findOne({ teamId, eventId: event._id });
            if (existingReg) {
                return NextResponse.json({ error: "Team already registered for this event" }, { status: 400 });
            }

            // Create Registration
            const newRegistration = await Registration.create({
                teamId,
                eventId: event._id,
                selectedMembers,
                paymentStatus: event.fees === 0 ? "paid" : "initiated",
                amountExpected: event.fees,
                currency: "INR"
            });

            // Lock team for paid events (prevent disband/leave after registration)
            if (event.fees > 0) {
                await Team.findByIdAndUpdate(teamId, { isLocked: true });
            }

            // Update Profiles of ALL selected members
            await Profile.updateMany(
                { _id: { $in: selectedMembers } },
                {
                    $addToSet: { registeredEvents: eventId },
                    $set: { updatedAt: new Date() }
                }
            );

            // If free, mark as paid
            if (event.fees === 0) {
                await Profile.updateMany(
                    { _id: { $in: selectedMembers } },
                    { $addToSet: { paidEvents: eventId } }
                );
                await Event.findOneAndUpdate(
                    { eventId },
                    { $inc: { currentRegistrations: 1 } }
                );
            }

            return NextResponse.json({
                message: "Team successfully registered!",
                registrationId: newRegistration._id,
                eventId,
                eventTitle: event.title,
                fees: event.fees
            }, { status: 200 });
        }

        // --- INDIVIDUAL REGISTRATION FLOW (Fallback) ---
        // Check if already registered
        const registeredEvents = profile.registeredEvents || [];
        if (registeredEvents.includes(eventId)) {
            return NextResponse.json({ message: "Already registered for this event" }, { status: 200 });
        }

        // Check max registrations
        if (event.maxRegistrations && event.currentRegistrations >= event.maxRegistrations) {
            return NextResponse.json({ error: "Event is fully booked" }, { status: 400 });
        }

        // Create Registration document for individual event
        const newRegistration = await Registration.create({
            eventId: event._id,
            selectedMembers: [profileId], // Individual participant
            paymentStatus: event.fees === 0 ? "paid" : "initiated",
            amountExpected: event.fees,
            currency: "INR"
        });

        // Add event to registered events. Use profileId instead of clerkId for robustness
        await Profile.findByIdAndUpdate(
            profileId,
            {
                $addToSet: { registeredEvents: eventId },
                $set: { updatedAt: new Date() }
            }
        );

        // For free events, also add to paidEvents and increment count
        if (event.fees === 0) {
            await Profile.findByIdAndUpdate(
                profileId,
                { $addToSet: { paidEvents: eventId } }
            );
            await Event.findOneAndUpdate(
                { eventId },
                { $inc: { currentRegistrations: 1 } }
            );
        }

        return NextResponse.json({
            message: "Successfully registered!",
            registrationId: newRegistration._id,
            eventId,
            eventTitle: event.title,
            fees: event.fees
        }, { status: 200 });

    } catch (error) {
        console.error("Event Registration Error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
