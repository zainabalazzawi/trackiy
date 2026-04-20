import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { requireProjectAccess } from "@/app/api/_lib/guards";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string; ticketId: string }> }
) {
  try {
    const { ticketId, id: projectId } = await params;

    const guard = await requireProjectAccess(projectId);
    if (!guard.ok) return guard.response;

    const ticket = await prisma.ticket.findUnique({
      where: {
        id: ticketId,
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

    if (!ticket) {
      return NextResponse.json({ error: "Ticket not found" }, { status: 404 });
    }

    return NextResponse.json(ticket);
  } catch (error) {
    console.error("Error fetching ticket:", error);
    return NextResponse.json(
      { error: "Failed to fetch ticket" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string; ticketId: string }> }
) {
  try {
    const { ticketId, id: projectId } = await params;

    const guard = await requireProjectAccess(projectId);
    if (!guard.ok) return guard.response;

    const body = await request.json();

    const updatedTicket = await prisma.ticket.update({
      where: {
        id: ticketId,
        column: {
          projectId: projectId,
        },
      },
      data: {
        description: body.description,
        title: body.title,
        priority: body.priority,
        assignee: body.assignee,
        labels: body.labels,
        ...(body.statusId && {
          statusId: body.statusId,
          columnId: (
            await prisma.column.findFirstOrThrow({
              where: {
                statusId: body.statusId,
                projectId: projectId,
              },
            })
          ).id,
        }),
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

    return NextResponse.json(updatedTicket);
  } catch (error) {
    console.error("Error updating ticket:", error);
    return NextResponse.json(
      { error: "Failed to update ticket" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string; ticketId: string }> }
) {
  try {
    const { ticketId, id: projectId } = await params;

    const guard = await requireProjectAccess(projectId);
    if (!guard.ok) return guard.response;

    await prisma.ticket.delete({
      where: {
        id: ticketId,
        column: {
          projectId: projectId,
        },
      },
    });

    return NextResponse.json({ message: "Ticket deleted successfully" });
  } catch (error) {
    console.error("Error deleting ticket:", error);
    return NextResponse.json(
      { error: "Failed to delete ticket" },
      { status: 500 }
    );
  }
}
