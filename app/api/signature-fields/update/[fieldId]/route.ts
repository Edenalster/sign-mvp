import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { SignatureField } from "@/models/SignatureField";

type Props = {
  params: Promise<{
    fieldId: string;
  }>;
};

export async function PATCH(request: NextRequest, { params }: Props) {
  try {
    await connectDB();

    const { fieldId } = await params;

    const body = await request.json();

    const field = await SignatureField.findByIdAndUpdate(
      fieldId,
      {
        signedImage: body.signedImage,
      },
      {
        new: true,
      }
    );

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
