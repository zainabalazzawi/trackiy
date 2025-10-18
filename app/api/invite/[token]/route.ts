import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/lib/auth";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    const { token } = await params;

    // Validate the request first.
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (!token) {
      return NextResponse.json(
        { error: "No invitation token provided." },
        { status: 400 }
      );
    }

    // Step 1: Find the invitation by token (regardless of status).
    const invitation = await prisma.invitation.findUnique({
      where: { token },
    });

    // If no invitation is found, stop here.
    if (!invitation) {
      return NextResponse.json(
        { error: "This invitation is invalid or has expired." },
        { status: 400 }
      );
    }

    // Step 2: Check if the user is already a member of the project.
    const isAlreadyMember = await prisma.projectMember.findFirst({
      where: {
        projectId: invitation.projectId,
        userId: session.user.id,
      },
    });

    // If user is already a member, just return success
    if (isAlreadyMember) {
      return NextResponse.json(invitation);
    }

    // Step 3: Add the user to the project.
    try {
      await prisma.projectMember.create({
        data: {
          projectId: invitation.projectId,
          userId: session.user.id,
        },
      });
    } catch (error) {
      console.error("Error creating project member:", error);
    }

    // Step 4: Mark the invitation as accepted. This happens for both
    // new and existing members to ensure the token cannot be used again.
    const acceptedInvitation = await prisma.invitation.update({
      where: { id: invitation.id },
      data: { status: "accepted" },
    });

    // Step 5: Return the invitation details so the frontend can redirect.
    return NextResponse.json(acceptedInvitation);
  } catch (error) {
    console.error("Error accepting invitation:", error);
    return NextResponse.json(
      { error: "Failed to accept invitation" },
      { status: 500 }
    );
  }
}
