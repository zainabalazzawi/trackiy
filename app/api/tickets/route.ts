import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const tickets = await prisma.ticket.findMany({
    include: {
      status: true,
      column: true,
    },
  });
  return NextResponse.json(tickets);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    const { projectId } = body;
    
    if (!projectId) {
      return NextResponse.json(
        { error: "Project ID is required" },
        { status: 400 }
      );
    }

    const firstColumn = await prisma.column.findFirstOrThrow({
      where: { 
        projectId: projectId,
        order: 0 
      },
      include: { status: true },
    });

    const ticket = await prisma.ticket.create({
      data: {
        title: body.title,
        description: body.description,
        columnId: firstColumn.id,
        statusId: firstColumn.statusId,
        priority: body.priority || "MEDIUM",
        assignee: body.assignee,
        reporter: body.reporter,
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

