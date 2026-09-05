import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { requireSession } from "../_lib/guards";
import { parseJson } from "../_lib/validation";
import { CreateProjectSchema } from "../_lib/schemas";
import { boardLane } from "../_lib/boardLane";

const DEFAULT_TEMPLATE_LANES = [
  "Ready to Development",
  "In Development",
  "Ready for Code Review",
  "Ready for QA",
  "Done",
];

export async function POST(request: Request) {
  try {
    const sessionGuard = await requireSession();
    if (!sessionGuard.ok) return sessionGuard.response;
    const { session } = sessionGuard;

    const body = await parseJson(request, CreateProjectSchema);
    if (!body.ok) return body.response;
    const { name, key, type, template, category } = body.data;
    const memberIds = body.data.memberIds ?? [];

    const existingProject = await prisma.project.findUnique({
      where: { key: key.toUpperCase() },
    });

    if (existingProject) {
      return NextResponse.json(
        { error: "Project key already exists" },
        { status: 400 }
      );
    }

    const allMemberIds = memberIds.includes(session.user.id)
      ? memberIds
      : [...memberIds, session.user.id];

    const project = await prisma.$transaction(async (tx) => {
      const created = await tx.project.create({
        data: {
          name,
          key: key.toUpperCase(),
          category,
          type,
          template,
          userId: session.user.id,
        },
      });

      await Promise.all(
        allMemberIds.map((userId: string) =>
          tx.projectMember.create({
            data: {
              projectId: created.id,
              userId,
              role: userId === session.user.id ? "OWNER" : "MEMBER",
            },
          })
        )
      );

      return created;
    });

    await boardLane.createMany(project.id, DEFAULT_TEMPLATE_LANES);

    const completeProject = await prisma.project.findUniqueOrThrow({
      where: { id: project.id },
      include: {
        columns: {
          include: { tickets: true },
          orderBy: { order: "asc" },
        },
        createdBy: {
          select: { id: true, name: true, email: true, image: true },
        },
        members: {
          include: {
            user: {
              select: { id: true, name: true, email: true, image: true },
            },
          },
        },
      },
    });

    return NextResponse.json(completeProject);
  } catch (error) {
    console.error("Error creating project:", error);
    return NextResponse.json(
      { error: "Failed to create project" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const sessionGuard = await requireSession();
    if (!sessionGuard.ok) return sessionGuard.response;
    const { session } = sessionGuard;

    const projects = await prisma.project.findMany({
      where: {
        OR: [
          { userId: session.user.id },
          {
            members: {
              some: {
                userId: session.user.id,
              },
            },
          },
        ],
      },
      include: {
        columns: {
          include: {
            tickets: true,
          },
          orderBy: {
            order: "asc",
          },
        },
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
        members: {
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
        },
      },
    });

    return NextResponse.json(projects);
  } catch (error) {
    console.error("Error fetching projects:", error);
    return NextResponse.json(
      { error: "Failed to fetch projects" },
      { status: 500 }
    );
  }
}
