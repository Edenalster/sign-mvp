import { put } from "@vercel/blob";

export async function POST(req: Request) {
  try {
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
    console.error(error);

    return Response.json({ error: "Upload failed" }, { status: 500 });
  }
}
