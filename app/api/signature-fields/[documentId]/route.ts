import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { SignatureField } from "@/models/SignatureField";

type Props = {
  params: Promise<{
    documentId: string;
  }>;
};

export async function GET(request: Request, { params }: Props) {
  try {
    await connectDB();

    const { documentId } = await params;

    const fields = await SignatureField.find({
      documentId,
    });

    return NextResponse.json(fields);
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
