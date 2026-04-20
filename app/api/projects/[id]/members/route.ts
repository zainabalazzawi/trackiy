import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { requireProjectAccess } from "@/app/api/_lib/guards";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: projectId } = await params;

    const guard = await requireProjectAccess(projectId);
    if (!guard.ok) return guard.response;

    const projectMembers = await prisma.projectMember.findMany({
      where: { projectId },
      include: { user: true },
    });

    const members = projectMembers.map((member) => ({
      id: member.id,
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
    return NextResponse.json(
      { error: "Failed to fetch members" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: projectId } = await params;

    const guard = await requireProjectAccess(projectId);
    if (!guard.ok) return guard.response;

    const body = await request.json();
    const { memberIds } = body;

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
      id: member.id,
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
    return NextResponse.json(
      { error: "Failed to add members" },
      { status: 500 }
    );
  }
}
