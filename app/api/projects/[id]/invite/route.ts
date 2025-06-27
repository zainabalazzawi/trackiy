import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import sgMail from "@/lib/sendgrid";
import { randomBytes } from "crypto";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { email } = await req.json();
    const { id: projectId } = await params;

    if (!email || !projectId) {
      return NextResponse.json({ error: "Email and projectId are required" }, { status: 400 });
    }

    // Generate a unique token for the invitation
    const token = randomBytes(32).toString("hex");

    // Save the invitation in the database
    await prisma.invitation.create({
      data: {
        email,
        projectId,
        token,
        status: "pending",
      },
    });

    // Build the invitation link - redirect directly to projects page with invite parameter
    const inviteUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/projects?invite=${token}`;

    // Send the invitation email
    const msg = {
      to: email,
      from: process.env.SENDGRID_FROM_EMAIL!, 
      subject: "You're invited to join a project on Trackiy!", // should be the real name of project 
      text: `You've been invited to join a project. Click this link to accept: ${inviteUrl}`,
      html: `<p>You've been invited to join a project.</p><p><a href="${inviteUrl}">Click here to accept the invitation</a></p>`,
    };

    await sgMail.send(msg);

    return NextResponse.json({ message: "Invitation sent successfully!" });
  } catch (error) {
    console.error("Failed to send invitation:", error);
    return NextResponse.json({ error: "Failed to send invitation" }, { status: 500 });
  }
} 