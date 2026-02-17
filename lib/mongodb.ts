import mongoose from "mongoose";

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
    const MONGODB_URI = process.env.MONGODB_URI;

    if (!MONGODB_URI) {
        console.warn("Please define the MONGODB_URI environment variable. Using mock for build.");
    }

    const validURI = MONGODB_URI || "mongodb://mock-build-uri";

    if (cached.conn) {
        return cached.conn;
    }

    if (!cached.promise) {
        const opts = {
            bufferCommands: false,
            serverSelectionTimeoutMS: 10000,
            socketTimeoutMS: 45000,
            maxPoolSize: 50,
            minPoolSize: 10,
            retryWrites: true,
            retryReads: true,
        };

        if (validURI === "mongodb://mock-build-uri") {
            console.warn("Mocking MongoDB connection for build.");
            // Return a mock object or handle gracefully for build time
            cached.promise = Promise.resolve(mongoose);
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
