import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../auth/lib/auth";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    const { id : projectId} = await params;

    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const tickets = await prisma.ticket.findMany({
      where: {
        column: {
          projectId: projectId
        }
      },
      include: {
        status: true,
        column: {
          include: {
            project: {
              select: { id: true, name: true, key: true }
            }
          }
        },
      },
    });

    return NextResponse.json(tickets);
  } catch (error) {
    console.error("Error fetching tickets:", error);
    return NextResponse.json(
      { error: "Failed to fetch tickets" },
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
    const body = await request.json();
    const session = await getServerSession(authOptions);

    const firstColumn = await prisma.column.findFirstOrThrow({
      where: { 
        projectId: projectId,
        order: 0 
      },
      include: { status: true },
    });

    // Get project key for ticket number prefix
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      select: { key: true }
    });

    // Generate a random 3-4 digit number and combine with project key
    const randomNumber = Math.floor(Math.random() * 9000) + 1000;
    const ticketNumber = `${project?.key}-${randomNumber}`;

    const ticket = await prisma.ticket.create({
      data: {
        title: body.title,
        description: body.description  ?? null,
        columnId: firstColumn.id,
        statusId: firstColumn.statusId,
        priority: body.priority || "MEDIUM",
        assignee: body.assignee,
        reporter: session?.user.name,
        ticketNumber: ticketNumber
      },
      include: {
        status: true,
        column: true,
      },
    });

    return NextResponse.json(ticket);
  } catch (error) {
    console.error("Error creating ticket:", error);
    return NextResponse.json(
      { error: "Failed to create ticket" },
      { status: 500 }
    );
  }
}