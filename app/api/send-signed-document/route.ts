import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

export async function POST(request: NextRequest) {
  const resend = new Resend(process.env.RESEND_API_KEY);
  try {
    const body = await request.json();
    const pdfResponse = await fetch(
      `${request.nextUrl.origin}/api/documents/${body.documentId}/download`
    );

    if (!pdfResponse.ok) {
      throw new Error("Failed to generate signed PDF");
    }

    const pdfBuffer = Buffer.from(await pdfResponse.arrayBuffer());

    await resend.emails.send({
      from: "onboarding@resend.dev",
      to: "office@ezlawyer.co.il",
      subject: "מסמך חתום",
      html: `
        <h2>מסמך נחתם</h2>

        <p><strong>Name:</strong> ${body.name}</p>

        <p><strong>Email:</strong> ${body.email}</p>
      `,
      attachments: [
        {
          filename: "signed-document.pdf",
          content: pdfBuffer,
        },
      ],
    });

    return NextResponse.json({
      success: true,
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
