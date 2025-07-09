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

    // Step 1: Find a valid, pending invitation.
    const invitation = await prisma.invitation.findUnique({
      where: { token, status: "pending" },
    });

    // If no valid invite is found, stop here.
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

    // Step 3: If they are a new user, add them to the project.
    if (!isAlreadyMember) {
      await prisma.projectMember.create({
        data: {
          projectId: invitation.projectId,
          userId: session.user.id,
        },
      });
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
