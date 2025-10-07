import { authOptions } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import Video, { IVideo, VIDEO_DIMENSTION } from "@/models/Video";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  try {
    await connectToDatabase();
    const video = await Video.findOne({}).sort({ createAt: -1 }).lean();
    if (!video) {
      return NextResponse.json([], { status: 200 });
    }
    return NextResponse.json(video);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "fail to fatch video!" },
      { status: 400 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorizes User" }, { status: 401 });
    }
    await connectToDatabase();
    const body: Partial<IVideo> = await request.json();
    if (
      !body.title ||
      !body.description ||
      !body.videoUrl ||
      !body.thumbnailUrl
    ) {
      return NextResponse.json(
        { error: "Title, description, videoUrl and thumbnailUrl are required" },
        { status: 400 }
      );
    }
    const transformation = {
      height: body.transformation?.height ?? VIDEO_DIMENSTION.height,
      width: body.transformation?.width ?? VIDEO_DIMENSTION.width,
      quality: body.transformation?.quality ?? 100,
    };
    const video = await Video.create({
      ...body,
      controls: body.controls ?? true,
      transformation,
    });
    return NextResponse.json(video, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Fail to create video" },
      { status: 400 }
    );
  }
}
