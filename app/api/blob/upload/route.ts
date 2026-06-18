import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const body = (await request.json()) as HandleUploadBody;

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async () => {
        return {
          allowedContentTypes: ["application/pdf"],
        };
      },
      onUploadCompleted: async () => {
        console.log("Upload completed");
      },
    });

    return NextResponse.json(jsonResponse);
  } catch (error) {
    console.error("BLOB ERROR:", error);

    return NextResponse.json(
      {
        error: String(error),
      },
      {
        status: 400,
      }
    );
  }
}
