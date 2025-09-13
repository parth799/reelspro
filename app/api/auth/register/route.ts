import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import User, { IUser } from "@/models/User";
import { uploadOnCloudinary } from "@/lib/cloudnary";
import fs from "fs";
import path from "path";

export async function POST(request: NextRequest) {
    try {
        const { email, username, password, profilePicture: profilePictureFile } = await request.json();
        
        if(!email || !password) {
            return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
        }

        await connectToDatabase();

        const existingUser = await User.findOne({ email });
        
        if(existingUser) {
            return NextResponse.json({ error: "User already exists" }, { status: 400 });
        }

        let profilePictureUrl = "";

        if (profilePictureFile && profilePictureFile.size > 0) {
            try {
                const bytes = await profilePictureFile.arrayBuffer();
                const buffer = Buffer.from(bytes);
                
                const tempDir = path.join(process.cwd(), "public", "temp");
                const fileName = `profile-${Date.now()}-${Math.round(Math.random() * 1E9)}.${profilePictureFile.name.split('.').pop()}`;
                const tempFilePath = path.join(tempDir, fileName);
                
                if (!fs.existsSync(tempDir)) {
                    fs.mkdirSync(tempDir, { recursive: true });
                }
                
                fs.writeFileSync(tempFilePath, buffer);
                
                const cloudinaryResponse = await uploadOnCloudinary(tempFilePath);
                
                if (cloudinaryResponse && cloudinaryResponse.secure_url) {
                    profilePictureUrl = cloudinaryResponse.secure_url;
                }
            } catch (uploadError) {
                return NextResponse.json({
                    error: "File Uplord Error",
                }, {status: 500})
            }
        }

        const userData: Partial<IUser> = { email, password };
        if (profilePictureUrl) {
            userData.profilePicture = profilePictureUrl;
        }
        if (username) {
            userData.username = username;   
        }

        await User.create(userData);

        return NextResponse.json({ 
            message: "User created successfully",
            profilePicture: profilePictureUrl || null
        }, { status: 201 });
    } catch (error) {
        console.error("Registration error:", error);
        if(error instanceof Error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}