import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    console.error("MONGODB_URI is not defined in .env.local");
    process.exit(1);
}

async function clearTeams() {
    try {
        await mongoose.connect(MONGODB_URI!);
        console.log("Connected to MongoDB");

        // Use direct collection access to avoid model registration issues in script environment
        const db = mongoose.connection.db;
        if (!db) throw new Error("Database connection not established");

        console.log("--- Starting Database Cleanup ---");

        // 1. Clear Team Collection
        const teamResult = await db.collection("teams").deleteMany({});
        console.log(`✓ Deleted ${teamResult.deletedCount} teams`);

        // 2. Clear Registration Collection
        const regResult = await db.collection("registrations").deleteMany({});
        console.log(`✓ Deleted ${regResult.deletedCount} registrations`);

        // 3. Clear PaymentSubmission Collection
        const paymentResult = await db.collection("paymentsubmissions").deleteMany({});
        console.log(`✓ Deleted ${paymentResult.deletedCount} payment submissions`);

        // 4. Clear Cart Collection
        const cartResult = await db.collection("carts").deleteMany({});
        console.log(`✓ Deleted ${cartResult.deletedCount} carts`);

        // 5. Reset User Profiles
        // Re-initialize team references to null/empty lists
        const profileResult = await db.collection("profiles").updateMany(
            {},
            {
                $set: {
                    currentTeamId: null,
                    esportsTeamId: null,
                    invitations: [],
                    registeredEvents: [],
                    paidEvents: []
                }
            }
        );
        console.log(`✓ Reset team fields for ${profileResult.modifiedCount} user profiles`);

        console.log("--- Cleanup Complete ---");
        console.log("System is now ready for fresh registrations.");

    } catch (error) {
        console.error("Error during cleanup:", error);
    } finally {
        await mongoose.disconnect();
        console.log("Disconnected from MongoDB");
    }
}

clearTeams();
