import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Document } from "@/models/Document";
export async function GET() {
  return Response.json({
    success: true,
    message: "Documents API Working",
  });
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();

    const document = await Document.create({
      title: body.title,
      pdfUrl: body.pdfUrl,
      status: "draft",
    });

    return NextResponse.json(document);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to create document",
      },
      {
        status: 500,
      }
    );
  }
}
