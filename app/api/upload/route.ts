import { put } from "@vercel/blob";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();

    const file = formData.get("file") as File;
    if (!file) {
      return Response.json({ error: "No file uploaded" }, { status: 400 });
    }
    console.log("UPLOAD SIZE MB:", (file.size / 1024 / 1024).toFixed(2));

    const blob = await put(`${Date.now()}-${file.name}`, file, {
      access: "public",
    });

    return Response.json({
      filename: file.name,
      url: blob.url,
    });
  } catch (error) {
    console.error("UPLOAD ERROR:", error);

    return Response.json({ error: String(error) }, { status: 500 });
  }
}
