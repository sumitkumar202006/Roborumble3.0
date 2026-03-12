import mongoose from "mongoose";
import dotenv from "dotenv";
import { createObjectCsvWriter } from 'csv-writer';

import Event from "../app/models/Event";
import Profile from "../app/models/Profile";
import Team from "../app/models/Team";
import Registration from "../app/models/Registration";

dotenv.config({ path: ".env.local" });

async function exportRegistrations() {
    const mongoUri = process.env.MONGODB_URI;

    if (!mongoUri) {
        console.error("❌ MONGODB_URI not found in environment variables");
        process.exit(1);
    }

    try {
        console.log("🔗 Connecting to MongoDB...");
        await mongoose.connect(mongoUri);
        console.log("✅ Connected to MongoDB");

        console.log("📥 Fetching registrations...");
        const registrations: any = await Registration.find({
            paymentStatus: { $in: ["initiated", "paid", "verification_pending", "verified", "manual_verified"] }
        })
        .populate("teamId")
        .populate("selectedMembers")
        .lean();

        // Fetch events and build a reliable map using their stringified ObjectIds
        const eventsList = await Event.find().lean();
        const eventMap = new Map();
        for (const ev of eventsList) {
            // @ts-ignore
             eventMap.set(ev._id.toString(), ev.title);
        }

        const csvData = [];

        for (const reg of registrations) {
            const rawEventId = (reg.eventId?._id || reg.eventId)?.toString();
            // Reliable map lookup
            const eventTitle = eventMap.get(rawEventId) || reg.eventId?.title || reg.eventId?.eventId || "Unknown Event";
            const isTeamEvent = !!reg.teamId;
            const teamName = reg.teamId?.teamName || "Individual";
            
            let leaderName = "N/A";
            let leaderPhone = "N/A";
            let leaderEmail = "N/A";
            
            const allMembers = [];

            if (isTeamEvent && reg.teamId?.leaderId) {
                const leaderProfile = await Profile.findById(reg.teamId.leaderId).lean();
                if (leaderProfile) {
                    leaderName = `${leaderProfile.firstName || ''} ${leaderProfile.lastName || ''}`.trim() || "Unknown";
                    leaderPhone = leaderProfile.phone || "N/A";
                    leaderEmail = leaderProfile.email || "N/A";
                }
            } else if (!isTeamEvent && reg.selectedMembers && reg.selectedMembers.length > 0) {
                 const singleMember = reg.selectedMembers[0];
                 leaderName = `${singleMember.firstName || ''} ${singleMember.lastName || ''}`.trim() || "Unknown";
                 leaderPhone = singleMember.phone || "N/A";
                 leaderEmail = singleMember.email || "N/A";
            }

            for (const member of (reg.selectedMembers || [])) {
                 allMembers.push(`${member.firstName || ''} ${member.lastName || ''}`.trim() || "Unknown");
            }

            csvData.push({
                EventName: eventTitle,
                TeamName: teamName,
                LeaderName: leaderName,
                LeaderPhone: leaderPhone,
                LeaderEmail: leaderEmail,
                AllMembers: allMembers.join(", "),
                MemberCount: allMembers.length,
                PaymentStatus: reg.paymentStatus || "Unknown"
            });
        }

        console.log(`Writing ${csvData.length} team/individual records to CSV...`);
        
        const csvWriter = createObjectCsvWriter({
            path: 'registrations_export_by_team.csv',
            header: [
                { id: 'EventName', title: 'Event Name' },
                { id: 'TeamName', title: 'Team/Individual Name' },
                { id: 'LeaderName', title: 'Leader Name' },
                { id: 'LeaderPhone', title: 'Leader Phone' },
                { id: 'LeaderEmail', title: 'Leader Email' },
                { id: 'AllMembers', title: 'All Participating Members' },
                { id: 'MemberCount', title: 'Total Members' },
                { id: 'PaymentStatus', title: 'Payment Status' }
            ]
        });

        await csvWriter.writeRecords(csvData);
        console.log("✅ Successfully created registrations_export_by_team.csv with " + csvData.length + " entries");

    } catch (error) {
        console.error("❌ Export failed:", error);
    } finally {
        await mongoose.disconnect();
        console.log("🔌 Disconnected from MongoDB");
    }
}

exportRegistrations();
