import { describe, expect, it } from "vitest";
import {
  deleteTicketFromSnapshot,
  moveTicketInSnapshot,
} from "./boardSnapshotTickets";
import type { Ticket } from "@/app/types";

function ticket(partial: Pick<Ticket, "id" | "columnId"> & Partial<Ticket>): Ticket {
  return {
    ticketNumber: "T-1",
    title: "Ticket",
    priority: "MEDIUM",
    column: {
      id: partial.columnId,
      name: "Lane",
      project: { id: "p1", name: "Proj", key: "PRJ" },
    },
    createdAt: "",
    updatedAt: "",
    ...partial,
  };
}

describe("boardSnapshotTickets", () => {
  it("moveTicketInSnapshot updates only that ticket's lane membership", () => {
    const tickets = [
      ticket({ id: "a", columnId: "lane-1" }),
      ticket({ id: "b", columnId: "lane-1" }),
    ];

    const next = moveTicketInSnapshot(tickets, "a", "lane-2");

    expect(next).toEqual([
      expect.objectContaining({ id: "a", columnId: "lane-2" }),
      expect.objectContaining({ id: "b", columnId: "lane-1" }),
    ]);
    expect(tickets[0].columnId).toBe("lane-1");
  });

  it("deleteTicketFromSnapshot removes only that ticket", () => {
    const tickets = [
      ticket({ id: "a", columnId: "lane-1" }),
      ticket({ id: "b", columnId: "lane-1" }),
    ];

    const next = deleteTicketFromSnapshot(tickets, "a");

    expect(next.map((t) => t.id)).toEqual(["b"]);
    expect(tickets).toHaveLength(2);
  });
});
