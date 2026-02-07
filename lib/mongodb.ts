import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI!;

// Fallback for build phase
if (!MONGODB_URI) {
    console.warn("Please define the MONGODB_URI environment variable. Using mock for build.");
}
// Ensure we have a string to prevent types issues, even if it fails connection later
const validURI = MONGODB_URI || "mongodb://mock-build-uri";

interface MongooseCache {
    conn: typeof mongoose | null;
    promise: Promise<typeof mongoose> | null;
}

declare global {
    // eslint-disable-next-line no-var
    var mongoose: MongooseCache | undefined;
}

const cached: MongooseCache = global.mongoose || { conn: null, promise: null };

if (!global.mongoose) {
    global.mongoose = cached;
}

async function connectDB(): Promise<typeof mongoose> {
    if (cached.conn) {
        return cached.conn;
    }

    if (!cached.promise) {
        const opts = {
            bufferCommands: false, // Disable buffering
            serverSelectionTimeoutMS: 10000, // Timeout after 10s instead of default 30s
            socketTimeoutMS: 45000, // Close sockets after 45s
        };

        if (validURI === "mongodb://mock-build-uri") {
             console.warn("Mocking MongoDB connection for build.");
             cached.promise = Promise.resolve({} as any);
        } else {
             cached.promise = mongoose.connect(validURI, opts).then((mongoose) => {
                 console.log("Connected to MongoDB Atlas");
                 return mongoose;
             });
        }
    }

    try {
        cached.conn = await cached.promise;
    } catch (e) {
        cached.promise = null;
        throw e;
    }

    return cached.conn;
}

export default connectDB;
