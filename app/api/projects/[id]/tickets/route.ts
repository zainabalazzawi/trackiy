import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../auth/lib/auth";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    const { id } = await params;

    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const tickets = await prisma.ticket.findMany({
      where: {
        column: {
          projectId: id
        }
      },
      include: {
        status: true,
        column: true,
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