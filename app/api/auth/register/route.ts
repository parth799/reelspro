import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import User from "@/models/User";
import { error } from "console";

export async function POST(request: NextRequest) {
    try {
        const { email, username, password, profilePicture } = await request.json();
        
        if(!email || !password ) {
            return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
        };
        await connectToDatabase();

        const existingUser = await User.findOne({ email });
        if(existingUser) {
            return NextResponse.json({ error: "User already exists" }, { status: 400 });
        }

        await User.create({ email, username, password, profilePicture });

        return NextResponse.json({ message: "User created successfully" }, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}