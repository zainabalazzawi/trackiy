import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { requireProjectAccess } from "@/app/api/_lib/guards";
import { parseJson } from "@/app/api/_lib/validation";
import { CreateTicketSchema } from "@/app/api/_lib/schemas";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: projectId } = await params;

    const guard = await requireProjectAccess(projectId);
    if (!guard.ok) return guard.response;

    const tickets = await prisma.ticket.findMany({
      where: {
        column: {
          projectId: projectId,
        },
      },
      include: {
        status: true,
        column: {
          include: {
            project: {
              select: { id: true, name: true, key: true },
            },
          },
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

    const guard = await requireProjectAccess(projectId);
    if (!guard.ok) return guard.response;
    const { session } = guard;

    const body = await parseJson(request, CreateTicketSchema);
    if (!body.ok) return body.response;
    const { title, description, priority, assignee, labels } = body.data;

    const firstColumn = await prisma.column.findFirstOrThrow({
      where: {
        projectId: projectId,
        order: 0,
      },
      include: { status: true },
    });

    const project = await prisma.project.findUnique({
      where: { id: projectId },
      select: { key: true },
    });

    const randomNumber = Math.floor(Math.random() * 9000) + 1000;
    const ticketNumber = `${project?.key}-${randomNumber}`;

    const ticket = await prisma.ticket.create({
      data: {
        title,
        description: description ?? null,
        columnId: firstColumn.id,
        statusId: firstColumn.statusId,
        priority: priority ?? "MEDIUM",
        assignee: assignee ?? null,
        reporter: session.user.name,
        labels: labels ?? [],
        ticketNumber,
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
