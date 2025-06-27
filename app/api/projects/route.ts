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
    const { name, key, type, template, category, memberIds = [] } = body;

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
        category: category === "SOFTWARE" ? "SOFTWARE" : "SERVICE",
        type: type === "TEAM_MANAGED" ? "TEAM_MANAGED" : "COMPANY_MANAGED",
        template: template  === "KANBAN" ? "KANBAN" : "CUSTOMER_SERVICE",
        userId: session.user.id,
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

    // Add the project creator as a member
    const allMemberIds = memberIds.includes(session.user.id) 
      ? memberIds 
      : [...memberIds, session.user.id];

    await Promise.all(
      allMemberIds.map(async (userId: string) => {
        return prisma.projectMember.create({
          data: {
            projectId: project.id,
            userId,
          },
        });
      })
    );

    // Update default columns to match the ones in columns route
    const defaultColumns = [
      "Ready to Development",
      "In Development",
      "Ready for Code Review",
      "Ready for QA",
      "Done"
    ];
    
    // First, get or create all statuses
    const statuses = await Promise.all(
      defaultColumns.map(async (columnName) => {
        // Try to find existing status
        const existingStatus = await prisma.status.findFirst({
          where: { name: columnName }
        });

        if (existingStatus) {
          return existingStatus;
        }

        // Create new status if it doesn't exist
        return prisma.status.create({
          data: { name: columnName }
        });
      })
    );

    // Then create columns with the statuses
    await prisma.column.createMany({
      data: statuses.map((status, index) => ({
        name: status.name,
        statusId: status.id,
        order: index,  // We keep the order in the Column model
        projectId: project.id,
      })),
    });

    // Fetch the complete project with columns
    const completeProject = await prisma.project.findUnique({
      where: { id: project.id },
      include: {
        columns: {
          include: {
            tickets: true,
            status: true
          },
          orderBy: {
            order: 'asc'
          }
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
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const projects = await prisma.project.findMany({
      where: {
        OR: [
          // Projects created by the user
          { userId: session.user.id },
          // Projects where the user is a member
          {
            members: {
              some: {
                userId: session.user.id
              }
            }
          }
        ]
      },
      include: {
        columns: {
          include: {
            tickets: true,
            status: true
          },
          orderBy: {
            order: 'asc'
          }
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