import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../auth/lib/auth";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    const { id: projectId } = await params;

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch all project members
    const projectMembers = await prisma.projectMember.findMany({
      where: { projectId },
      include: { user: true },
    });

    const members = projectMembers.map((member) => ({
      id: member.id, // ProjectMember record ID (for React keys)
      user: {
        id: member.user.id,
        name: member.user.name,
        email: member.user.email,
        image: member.user.image,
      },
    }));

    return NextResponse.json(members);
  } catch (error) {
    console.error("Error fetching project members:", error);
    return NextResponse.json({ error: "Failed to fetch members" }, { status: 500 });
  }
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    const { id: projectId } = await params;
    const body = await request.json();
    const { memberIds } = body;

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }


    // Add members to the project
    const projectMembers = await Promise.all(
      memberIds.map(async (userId: string) => {
        return prisma.projectMember.create({
          data: {
            projectId,
            userId,
          },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                image: true,
              },
            },
          },
        });
      })
    );

    const members = projectMembers.map((member) => ({
      id: member.id, // ProjectMember record ID (for React keys)
      user: {
        id: member.user.id,
        name: member.user.name,
        email: member.user.email,
        image: member.user.image,
      },
    }));

    return NextResponse.json(members);
  } catch (error) {
    console.error("Error adding project members:", error);
    return NextResponse.json({ error: "Failed to add members" }, { status: 500 });
  }
} 