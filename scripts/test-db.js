const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' }); // Load from .env.local as requested

console.log("Testing MongoDB Connection...");
console.log("URI:", process.env.MONGODB_URI ? process.env.MONGODB_URI.split('@')[1] : "UNDEFINED"); // Log part of URI to verify it's loaded but hide credentials

async function testConnection() {
    try {
        await mongoose.connect(process.env.MONGODB_URI, {
            serverSelectionTimeoutMS: 5000
        });
        console.log("✅ Successfully connected to MongoDB!");
        await mongoose.connection.close();
        process.exit(0);
    } catch (error) {
        console.error("❌ Connection failed:", error.message);
        process.exit(1);
    }
}

testConnection();
