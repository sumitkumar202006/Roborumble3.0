import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import Registration from "../app/models/Registration";
import Profile from "../app/models/Profile";

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    console.error("Please define the MONGODB_URI environment variable inside .env.local");
    process.exit(1);
}

async function clearRegistrations() {
    try {
        console.log("Connecting to MongoDB...");
        await mongoose.connect(MONGODB_URI!);
        console.log("Connected successfully.");

        // 1. Delete all registrations
        const regResult = await Registration.deleteMany({});
        console.log(`Deleted ${regResult.deletedCount} registrations.`);

        // 2. Reset Profile registration arrays
        const profileResult = await Profile.updateMany(
            {},
            {
                $set: {
                    registeredEvents: [],
                    paidEvents: []
                }
            }
        );
        console.log(`Reset registration status for ${profileResult.modifiedCount} profiles.`);

        console.log("Cleanup completed successfully.");

    } catch (error) {
        console.error("Cleanup Error:", error);
    } finally {
        await mongoose.disconnect();
        console.log("Disconnected from MongoDB.");
    }
}

clearRegistrations();
