import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    await resend.emails.send({
      from: "onboarding@resend.dev",
      to: "office@ezlawyer.co.il",
      subject: "Signed Document",
      html: `
        <h2>Document Signed</h2>

        <p><strong>Name:</strong> ${body.name}</p>

        <p><strong>Email:</strong> ${body.email}</p>
      `,
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
