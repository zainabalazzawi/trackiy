import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { requireSession } from "../_lib/guards";
import { parseJson } from "../_lib/validation";
import { CreateProjectSchema } from "../_lib/schemas";

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

    const defaultColumns = [
      "Ready to Development",
      "In Development",
      "Ready for Code Review",
      "Ready for QA",
      "Done",
    ];

    const completeProject = await prisma.$transaction(async (tx) => {
      const project = await tx.project.create({
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
            data: { projectId: project.id, userId },
          })
        )
      );

      const statuses = await Promise.all(
        defaultColumns.map((columnName) =>
          tx.status.create({
            data: { name: columnName, projectId: project.id },
          })
        )
      );

      await tx.column.createMany({
        data: statuses.map((status, index) => ({
          name: status.name,
          statusId: status.id,
          order: index,
          projectId: project.id,
        })),
      });

      return tx.project.findUniqueOrThrow({
        where: { id: project.id },
        include: {
          columns: {
            include: { tickets: true, status: true },
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
            status: true,
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
