import { describe, expect, it } from "vitest";
import { mapTicket, TicketSchema } from "./ticketShape";

const person = {
  id: "u1",
  name: "Ada",
  email: "ada@example.com",
  image: null as string | null,
};

const prismaRow = {
  id: "t1",
  ticketNumber: "TRK-1000",
  title: "Ship mapper",
  description: "Flatten the wire shape",
  priority: "HIGH" as const,
  labels: ["api"],
  columnId: "col-1",
  assigneeId: "u1",
  reporterId: "u2",
  createdAt: new Date("2026-01-15T10:00:00.000Z"),
  updatedAt: new Date("2026-01-16T12:00:00.000Z"),
  assignee: person,
  reporter: { ...person, id: "u2", name: "Grace" },
  column: {
    id: "col-1",
    name: "Doing",
    projectId: "p1",
    order: 1,
    project: {
      id: "p1",
      name: "Trackiy",
      key: "TRK",
    },
  },
};

describe("mapTicket", () => {
  it("flattens project and lane fields and drops nested column/project", () => {
    const ticket = mapTicket(prismaRow);

    expect(TicketSchema.parse(ticket)).toEqual({
      id: "t1",
      ticketNumber: "TRK-1000",
      title: "Ship mapper",
      description: "Flatten the wire shape",
      priority: "HIGH",
      labels: ["api"],
      columnId: "col-1",
      columnName: "Doing",
      projectId: "p1",
      projectName: "Trackiy",
      assigneeId: "u1",
      assignee: person,
      reporterId: "u2",
      reporter: { ...person, id: "u2", name: "Grace" },
      createdAt: "2026-01-15T10:00:00.000Z",
      updatedAt: "2026-01-16T12:00:00.000Z",
    });
    expect(ticket).not.toHaveProperty("column");
  });
});
