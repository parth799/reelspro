import mongoose from "mongoose";

const DATABASE_URL = process.env.DATABASE_URL!;

if (!DATABASE_URL) {
    throw new Error("DATABASE_URL is not defined");
}

let cached = global.mongoose;

if (!cached) {
    cached = global.mongoose = {connection : null, promise : null};
}

export async function connectToDatabase() {
    if (cached.connection) {
        return cached.connection;
    }
    if (!cached.promise) {
        const opts = {
            bufferCommands : true,
            maxPoolSize : 50,
        }
        cached.promise = mongoose.connect(DATABASE_URL, opts).then(() => mongoose.connection);
    }

    try {
        cached.connection = await cached.promise;
        console.log("Connected to database");
    } catch (error) {
        cached.promise = null;
        console.log("Error connecting to database", error);
        throw error;
    }
    return cached.connection;
}
