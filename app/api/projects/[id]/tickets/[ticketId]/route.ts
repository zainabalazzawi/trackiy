import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import {
  requireProjectAccess,
  requireProjectPermission,
} from "@/app/api/httpHelpers/guards";
import { parseJson } from "@/app/api/httpHelpers/validation";
import { UpdateTicketSchema } from "@/app/api/httpHelpers/schemas";
import { mapTicket, ticketInclude } from "@/app/product/ticketShape";
import { tickets } from "@/app/product/tickets";
import { errorResponse } from "@/app/api/httpHelpers/resultHttp";

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

    return NextResponse.json(mapTicket(ticket));
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

    const updated = await tickets.patch(projectId, ticketId, body.data);
    if (!updated.ok) return errorResponse(updated);
    return NextResponse.json(updated.data);
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

    const deleted = await tickets.delete(projectId, ticketId);
    if (!deleted.ok) return errorResponse(deleted);

    return NextResponse.json({ message: "Ticket deleted successfully" });
  } catch (error) {
    console.error("Error deleting ticket:", error);
    return NextResponse.json(
      { error: "Failed to delete ticket" },
      { status: 500 }
    );
  }
}
