import { writeFile } from "fs/promises";
import { join } from "path";

export async function POST(req: Request) {
  const formData = await req.formData();

  const file = formData.get("file") as File;

  if (!file) {
    return Response.json({ error: "No file" }, { status: 400 });
  }

  const bytes = await file.arrayBuffer();

  const buffer = Buffer.from(bytes);

  const filename = `${Date.now()}-${file.name}`;

  const path = join(process.cwd(), "public", "uploads", filename);

  await writeFile(path, buffer);

  return Response.json({
    filename,
    url: `/uploads/${filename}`,
  });
}
