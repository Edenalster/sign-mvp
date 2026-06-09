import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { SignatureField } from "@/models/SignatureField";

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();

    const field = await SignatureField.create({
      documentId: body.documentId,
      page: body.page,
      xPercent: body.xPercent,
      yPercent: body.yPercent,
    });

    return NextResponse.json(field);
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
