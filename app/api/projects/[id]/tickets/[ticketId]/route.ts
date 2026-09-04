import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import {
  requireProjectAccess,
  requireProjectPermission,
} from "@/app/api/_lib/guards";
import { parseJson } from "@/app/api/_lib/validation";
import { UpdateTicketSchema } from "@/app/api/_lib/schemas";
import { boardLane } from "@/app/api/_lib/boardLane";

const ticketInclude = {
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
} as const;

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
      include: ticketInclude,
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

    const guard = await requireProjectPermission(projectId, "edit_ticket");
    if (!guard.ok) return guard.response;

    const body = await parseJson(request, UpdateTicketSchema);
    if (!body.ok) return body.response;
    const data = body.data;

    const otherFields = {
      ...(data.title !== undefined && { title: data.title }),
      ...(data.description !== undefined && { description: data.description }),
      ...(data.priority !== undefined && { priority: data.priority }),
      ...(data.assigneeId !== undefined && { assigneeId: data.assigneeId }),
      ...(data.labels !== undefined && { labels: data.labels }),
    };

    if (data.statusId !== undefined) {
      const column = await prisma.column.findFirst({
        where: { statusId: data.statusId, projectId },
      });
      if (!column) {
        return NextResponse.json({ error: "Column not found" }, { status: 404 });
      }
      const moved = await boardLane.moveTicket(
        projectId,
        ticketId,
        column.id,
        otherFields
      );
      if (!moved.ok) {
        const status = moved.code === "NOT_FOUND" ? 404 : 400;
        return NextResponse.json({ error: moved.message }, { status });
      }
      return NextResponse.json(moved.data);
    }

    if (Object.keys(otherFields).length > 0) {
      const updatedTicket = await prisma.ticket.update({
        where: {
          id: ticketId,
          column: { projectId },
        },
        data: otherFields,
        include: ticketInclude,
      });
      return NextResponse.json(updatedTicket);
    }

    const updatedTicket = await prisma.ticket.findUniqueOrThrow({
      where: { id: ticketId },
      include: ticketInclude,
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

    const guard = await requireProjectPermission(projectId, "edit_ticket");
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
