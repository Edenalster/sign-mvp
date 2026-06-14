import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Document } from "@/models/Document";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(request: Request, { params }: Props) {
  try {
    await connectDB();

    const { id } = await params;

    const documents = await Document.find({
      envelopeId: id,
    });

    return NextResponse.json(documents);
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
