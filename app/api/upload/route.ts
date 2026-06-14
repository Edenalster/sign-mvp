import { put } from "@vercel/blob";

export async function POST(req: Request) {
  try {
    console.log("TOKEN EXISTS:", !!process.env.BLOB_READ_WRITE_TOKEN);

    const formData = await req.formData();

    const file = formData.get("file") as File | null;

    if (!file) {
      return Response.json({ error: "No file uploaded" }, { status: 400 });
    }

    const blob = await put(`${Date.now()}-${file.name}`, file, {
      access: "public",
    });

    return Response.json({
      filename: file.name,
      url: blob.url,
    });
  } catch (error) {
    console.error("UPLOAD ERROR:", error);

    return Response.json(
      {
        error: String(error),
      },
      { status: 500 }
    );
  }
}
