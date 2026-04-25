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
        assignee: { select: { id: true, name: true, email: true, image: true } },
        reporter: { select: { id: true, name: true, email: true, image: true } },
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
    const { title, description, priority, assigneeId, labels } = body.data;

    const firstColumn = await prisma.column.findFirstOrThrow({
      where: {
        projectId: projectId,
        order: 0,
      },
      include: { status: true },
    });

    const ticket = await prisma.$transaction(async (tx) => {
      const project = await tx.project.update({
        where: { id: projectId },
        data: { nextTicketSeq: { increment: 1 } },
        select: { key: true, nextTicketSeq: true },
      });
      const seq = project.nextTicketSeq - 1;
      const ticketNumber = `${project.key}-${seq}`;

      return tx.ticket.create({
        data: {
          title,
          description: description ?? null,
          columnId: firstColumn.id,
          statusId: firstColumn.statusId,
          priority: priority ?? "MEDIUM",
          assigneeId: assigneeId ?? null,
          reporterId: session.user.id,
          labels: labels ?? [],
          ticketNumber,
        },
        include: {
          status: true,
          assignee: { select: { id: true, name: true, email: true, image: true } },
          reporter: { select: { id: true, name: true, email: true, image: true } },
          column: true,
        },
      });
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
