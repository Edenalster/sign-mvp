import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Envelope } from "@/models/Envelope";

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();

    const envelope = await Envelope.create({
      title: body.title,
      status: "draft",
    });

    return NextResponse.json(envelope);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
      },
      {
        status: 500,
      }
    );
  }
}
