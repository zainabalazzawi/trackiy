import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { resend } from "@/lib/resend";
import { randomBytes } from "crypto";
import { requireProjectPermission } from "@/app/api/_lib/guards";
import { parseJson } from "@/app/api/_lib/validation";
import { SendInviteSchema } from "@/app/api/_lib/schemas";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: projectId } = await params;

    const guard = await requireProjectPermission(projectId, "manage_members");
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

    const { error } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL!,
      to: email,
      subject: "You're invited to join a project on Trackiy!",
      text: `You've been invited to join a project. Click this link to accept: ${inviteUrl}`,
      html: `<p>You've been invited to join a project.</p><p><a href="${inviteUrl}">Click here to accept the invitation</a></p>`,
    });

    if (error) {
      console.error("Failed to send invitation:", error);
      return NextResponse.json(
        { error: "Failed to send invitation" },
        { status: 500 }
      );
    }

    return NextResponse.json({ message: "Invitation sent successfully!" });
  } catch (error) {
    console.error("Failed to send invitation:", error);
    return NextResponse.json(
      { error: "Failed to send invitation" },
      { status: 500 }
    );
  }
}
