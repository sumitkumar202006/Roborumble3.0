import mongoose from "mongoose";
import dotenv from "dotenv";
import { createObjectCsvWriter } from 'csv-writer';

dotenv.config({ path: ".env.local" });

async function exportSimpleRegistrations() {
    const mongoUri = process.env.MONGODB_URI;

    if (!mongoUri) {
        console.error("❌ MONGODB_URI not found in environment variables");
        process.exit(1);
    }

    try {
        console.log("🔗 Connecting to MongoDB...");
        await mongoose.connect(mongoUri);
        
        // 1. Fetch RAW data directly using mongoose.connection.db
        // This bypasses ALL mongoose schema/population bugs
        const db = mongoose.connection.db;
        if (!db) throw new Error("Database connection not established");
        
        const registrations = await db.collection("registrations").find({
            paymentStatus: { $in: ["initiated", "pending", "verification_pending", "paid", "manual_verified", "verified"] }
        }).toArray();

        const events = await db.collection("events").find({}).toArray();
        const teams = await db.collection("teams").find({}).toArray();
        const profiles = await db.collection("profiles").find({}).toArray();

        // 2. Create quick lookup dictionaries
        const eventMap = new Map();
        for (const e of events) {
            // Some events might have _id as string, some as ObjectId. Map both just in case.
            eventMap.set(e._id.toString(), e.title);
            if (e.eventId) eventMap.set(e.eventId.toString(), e.title); 
        }

        const teamMap = new Map();
        for (const t of teams) teamMap.set(t._id.toString(), t);

        const profileMap = new Map();
        for (const p of profiles) profileMap.set(p._id.toString(), p);

        // 3. Process the data
        const csvData = [];

        for (const reg of registrations) {
            // Find Event Name
            const rawEventId = reg.eventId?.toString();
            const eventName = eventMap.get(rawEventId) || "Unknown Event";

            // Find Team & Leader Info
            let teamName = "Individual";
            let leaderName = "N/A";
            let leaderPhone = "N/A";
            let leaderEmail = "N/A";
            let leaderCollege = "N/A";
            
            const rawTeamId = reg.teamId?.toString();
            const team = rawTeamId ? teamMap.get(rawTeamId) : null;

            if (team) {
                teamName = team.teamName || "Unnamed Team";
                const leaderId = team.leaderId?.toString();
                const leader = profileMap.get(leaderId);
                
                if (leader) {
                    leaderName = `${leader.firstName || ''} ${leader.lastName || ''}`.trim() || leader.username || "Unknown";
                    leaderPhone = leader.phone || "N/A";
                    leaderEmail = leader.email || "N/A";
                    leaderCollege = leader.college || "N/A";
                }
            } else if (reg.selectedMembers && reg.selectedMembers.length > 0) {
                // If individual, the first member is the leader
                const memberId = reg.selectedMembers[0]?.toString();
                const member = profileMap.get(memberId);
                
                if (member) {
                    leaderName = `${member.firstName || ''} ${member.lastName || ''}`.trim() || member.username || "Unknown";
                    leaderPhone = member.phone || "N/A";
                    leaderEmail = member.email || "N/A";
                    leaderCollege = member.college || "N/A";
                }
            }

            // Get All Members with full details
            const allMembers = [];
            for (const mId of (reg.selectedMembers || [])) {
                const member = profileMap.get(mId.toString());
                if (member) {
                    const fullName = `${member.firstName || ''} ${member.lastName || ''}`.trim() || member.username || "Unknown";
                    const phone = member.phone || "N/A";
                    const email = member.email || "N/A";
                    const college = member.college || "N/A";
                    const rollNo = member.rollNo || "N/A";
                    const gender = member.gender || "N/A";
                    
                    allMembers.push(`${fullName} (Phone: ${phone}, Email: ${email}, College: ${college}, Roll: ${rollNo}, Gender: ${gender})`);
                }
            }

            csvData.push({
                EventName: eventName,
                TeamName: teamName,
                LeaderName: leaderName,
                LeaderPhone: leaderPhone,
                LeaderEmail: leaderEmail,
                LeaderCollege: leaderCollege,
                PaymentStatus: reg.paymentStatus || "Unknown",
                AllMembers: allMembers.join(", ")
            });
        }

        // 4. Write CSV
        console.log(`Writing ${csvData.length} clean records to CSV...`);
        
        const csvWriter = createObjectCsvWriter({
            path: 'clean_registrations_export.csv',
            header: [
                { id: 'EventName', title: 'Event Name' },
                { id: 'TeamName', title: 'Team Name' },
                { id: 'LeaderName', title: 'Leader Name' },
                { id: 'LeaderPhone', title: 'Leader Phone' },
                { id: 'LeaderEmail', title: 'Leader Email' },
                { id: 'LeaderCollege', title: 'Leader College' },
                { id: 'PaymentStatus', title: 'Payment Status' },
                { id: 'AllMembers', title: 'Members' }
            ]
        });

        await csvWriter.writeRecords(csvData);
        console.log("✅ Successfully created clean_registrations_export.csv");

    } catch (error) {
        console.error("❌ Export failed:", error);
    } finally {
        await mongoose.disconnect();
        console.log("🔌 Disconnected from MongoDB");
    }
}

exportSimpleRegistrations();
