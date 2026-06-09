import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Document } from "@/models/Document";
import { SignatureField } from "@/models/SignatureField";

import { PDFDocument } from "pdf-lib";

import fs from "fs/promises";
import path from "path";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(request: Request, { params }: Props) {
  try {
    await connectDB();

    const { id } = await params;

    const document = await Document.findById(id);

    if (!document) {
      return NextResponse.json(
        {
          success: false,
          message: "Document not found",
        },
        {
          status: 404,
        }
      );
    }

    const fields = await SignatureField.find({
      documentId: id,
      signedImage: {
        $ne: null,
      },
    });

    const pdfPath = path.join(process.cwd(), "public", document.pdfUrl);

    const pdfBytes = await fs.readFile(pdfPath);

    const pdfDoc = await PDFDocument.load(pdfBytes);

    for (const field of fields) {
      const page = pdfDoc.getPage(field.page - 1);

      if (!page) continue;

      const { width, height } = page.getSize();

      const base64 = field.signedImage.split(",")[1];

      const imageBytes = Buffer.from(base64, "base64");

      const image = await pdfDoc.embedPng(imageBytes);

      const x = field.xPercent * width;

      const y = height - field.yPercent * height;

      page.drawImage(image, {
        x: x - 90,
        y: y - 30,
        width: 180,
        height: 60,
      });
    }

    const finalPdf = await pdfDoc.save();

    const buffer = Buffer.from(finalPdf);

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": 'attachment; filename="signed-document.pdf"',
      },
    });
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
