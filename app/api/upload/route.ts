import { put } from "@vercel/blob";

export async function POST(req: Request) {
  try {
    return Response.json({
      BLOB_READ_WRITE_TOKEN: !!process.env.BLOB_READ_WRITE_TOKEN,
      BLOB_STORE_ID: !!process.env.BLOB_STORE_ID,
      BLOB_WEBHOOK_PUBLIC_KEY: !!process.env.BLOB_WEBHOOK_PUBLIC_KEY,
    });
  } catch (error) {
    return Response.json(
      {
        error: String(error),
      },
      { status: 500 }
    );
  }
}
