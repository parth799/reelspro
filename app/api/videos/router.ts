import { connectToDatabase } from "@/lib/db";
import Video from "@/models/Video";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        await connectToDatabase();
        const video = await Video.findOne({}).sort({createAt: -1}).lean();
        if (!video || video.length === 0) {
            return NextResponse.json([], {status: 200})
        }
        return NextResponse.json(video)
    } catch (error) {
        return NextResponse.json({error: "fail to fatch video!"}, {status: 400})
    }
}