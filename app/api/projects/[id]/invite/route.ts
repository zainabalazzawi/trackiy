import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import sgMail from "@/lib/sendgrid";
import { randomBytes } from "crypto";
import { requireProjectAccess } from "@/app/api/_lib/guards";
import { parseJson } from "@/app/api/_lib/validation";
import { SendInviteSchema } from "@/app/api/_lib/schemas";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: projectId } = await params;

    const guard = await requireProjectAccess(projectId);
    if (!guard.ok) return guard.response;

    const body = await parseJson(req, SendInviteSchema);
    if (!body.ok) return body.response;
    const { email } = body.data;

    const token = randomBytes(32).toString("hex");

    await prisma.invitation.create({
      data: {
        email,
        projectId,
        token,
        status: "pending",
      },
    });

    const inviteUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/projects?invite=${token}`;

    const msg = {
      to: email,
      from: process.env.SENDGRID_FROM_EMAIL!,
      subject: "You're invited to join a project on Trackiy!",
      text: `You've been invited to join a project. Click this link to accept: ${inviteUrl}`,
      html: `<p>You've been invited to join a project.</p><p><a href="${inviteUrl}">Click here to accept the invitation</a></p>`,
    };

    await sgMail.send(msg);

    return NextResponse.json({ message: "Invitation sent successfully!" });
  } catch (error) {
    console.error("Failed to send invitation:", error);
    return NextResponse.json(
      { error: "Failed to send invitation" },
      { status: 500 }
    );
  }
}
