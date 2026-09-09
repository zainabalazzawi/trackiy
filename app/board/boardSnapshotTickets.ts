import type { Ticket } from "@/app/types";

/** Apply a lane move to a board ticket list (immutable). */
export function moveTicketInSnapshot(
  tickets: Ticket[],
  ticketId: string,
  laneId: string
): Ticket[] {
  return tickets.map((ticket) =>
    ticket.id === ticketId ? { ...ticket, columnId: laneId } : ticket
  );
}

/** Remove a ticket from a board ticket list (immutable). */
export function deleteTicketFromSnapshot(
  tickets: Ticket[],
  ticketId: string
): Ticket[] {
  return tickets.filter((ticket) => ticket.id !== ticketId);
}
