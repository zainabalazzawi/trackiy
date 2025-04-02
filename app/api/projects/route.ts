import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/lib/auth";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { name, key, type } = body;

    // Validate required fields
    if (!name || !key || !type) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Check if project key is unique
    const existingProject = await prisma.project.findUnique({
      where: { key },
    });

    if (existingProject) {
      return NextResponse.json(
        { error: "Project key already exists" },
        { status: 400 }
      );
    }

    // Create project
    const project = await prisma.project.create({
      data: {
        name,
        key: key.toUpperCase(),
        type: type === "team-managed" ? "TEAM_MANAGED_SOFTWARE" : "SERVICE_MANAGEMENT",
        userId: session.user.id,
        lead: session.user.id,
      },
      include: {
        columns: true,
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
    });

    // Update default columns to match the ones in columns route
    const defaultColumns = [
      "Ready to Development",
      "In Development",
      "Ready for Code Review",
      "Done"
    ];
    
    await Promise.all(
      defaultColumns.map(async (columnName, index) => {
        // Create status first
        const status = await prisma.status.create({
          data: { name: columnName },
        });

        // Then create column
        return prisma.column.create({
          data: {
            name: columnName,
            statusId: status.id,
            order: index,
            projectId: project.id,
          },
        });
      })
    );

    return NextResponse.json(project);
  } catch (error) {
    console.error("Error creating project:", error);
    return NextResponse.json(
      { error: "Failed to create project" },
      { status: 500 }
    );
  }
} 