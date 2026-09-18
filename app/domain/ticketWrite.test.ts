import { afterEach, describe, expect, it } from "vitest";
import { boardLane } from "./boardLane";
import { createTestProject, createTicketInColumn } from "./boardLane.helpers";
import { ticketWrite } from "./ticketWrite";

const cleanups: Array<() => Promise<void>> = [];

afterEach(async () => {
  while (cleanups.length > 0) {
    const cleanup = cleanups.pop();
    if (cleanup) await cleanup();
  }
});

async function withProject() {
  const ctx = await createTestProject();
  cleanups.push(ctx.cleanup);
  return ctx;
}

describe("ticketWrite", () => {
  it("create numbers tickets from nextTicketSeq and places them on order-0 lane", async () => {
    const { project, user } = await withProject();
    const backlog = await boardLane.create(project.id, "Backlog");
    await boardLane.create(project.id, "Doing");

    const first = await ticketWrite.create(project.id, user.id, {
      title: "First ticket",
    });
    expect(first.ok).toBe(true);
    if (!first.ok) return;
    expect(first.data.ticketNumber).toBe(`${project.key}-1000`);
    expect(first.data.columnId).toBe(backlog.id);
    expect(first.data.reporterId).toBe(user.id);
    expect(first.data.priority).toBe("MEDIUM");
    expect(first.data.labels).toEqual([]);
    expect(first.data.description).toBeNull();
    expect(first.data.assigneeId).toBeNull();

    const second = await ticketWrite.create(project.id, user.id, {
      title: "Second ticket",
    });
    expect(second.ok).toBe(true);
    if (!second.ok) return;
    expect(second.data.ticketNumber).toBe(`${project.key}-1001`);
    expect(second.data.columnId).toBe(backlog.id);
    expect(second.data.reporterId).toBe(user.id);
  });

  it("create returns NOT_FOUND when the project has no order-0 lane", async () => {
    const { project, user } = await withProject();

    const result = await ticketWrite.create(project.id, user.id, {
      title: "Orphan",
    });
    expect(result).toEqual({
      ok: false,
      code: "NOT_FOUND",
      message: "Column not found",
    });
  });

  it("patch applies lane and field changes together", async () => {
    const { project } = await withProject();
    const source = await boardLane.create(project.id, "Todo");
    const target = await boardLane.create(project.id, "Done");
    const ticket = await createTicketInColumn({
      columnId: source.id,
      title: "Move me",
    });

    const moved = await ticketWrite.patch(project.id, ticket.id, {
      columnId: target.id,
      title: "Moved and renamed",
      priority: "HIGH",
    });
    expect(moved.ok).toBe(true);
    if (!moved.ok) return;
    expect(moved.data.columnId).toBe(target.id);
    expect(moved.data.title).toBe("Moved and renamed");
    expect(moved.data.priority).toBe("HIGH");
  });

  it("patch moves a ticket when only columnId is provided", async () => {
    const { project } = await withProject();
    const source = await boardLane.create(project.id, "Todo");
    const target = await boardLane.create(project.id, "Done");
    const ticket = await createTicketInColumn({
      columnId: source.id,
      title: "Move me",
    });

    const moved = await ticketWrite.patch(project.id, ticket.id, {
      columnId: target.id,
    });
    expect(moved.ok).toBe(true);
    if (!moved.ok) return;
    expect(moved.data.columnId).toBe(target.id);
    expect(moved.data.title).toBe("Move me");
  });

  it("patch returns NOT_FOUND when the target column is missing from the project", async () => {
    const { project } = await withProject();
    const source = await boardLane.create(project.id, "Todo");
    const ticket = await createTicketInColumn({
      columnId: source.id,
      title: "Stuck",
    });

    const result = await ticketWrite.patch(project.id, ticket.id, {
      columnId: "missing-column",
    });
    expect(result).toEqual({
      ok: false,
      code: "NOT_FOUND",
      message: "Column not found",
    });
  });

  it("patch updates fields without changing the lane", async () => {
    const { project } = await withProject();
    const column = await boardLane.create(project.id, "Todo");
    const ticket = await createTicketInColumn({
      columnId: column.id,
      title: "Original",
    });

    const updated = await ticketWrite.patch(project.id, ticket.id, {
      title: "Updated title",
      priority: "LOW",
      description: "New description",
    });
    expect(updated.ok).toBe(true);
    if (!updated.ok) return;
    expect(updated.data.title).toBe("Updated title");
    expect(updated.data.priority).toBe("LOW");
    expect(updated.data.description).toBe("New description");
    expect(updated.data.columnId).toBe(column.id);
  });

  it("patch returns NOT_FOUND when the ticket is missing from the project", async () => {
    const { project } = await withProject();

    const result = await ticketWrite.patch(project.id, "missing-ticket", {
      title: "Nope",
    });
    expect(result).toEqual({
      ok: false,
      code: "NOT_FOUND",
      message: "Ticket not found",
    });
  });

  it("delete removes the ticket from the project", async () => {
    const { project } = await withProject();
    const column = await boardLane.create(project.id, "Todo");
    const ticket = await createTicketInColumn({
      columnId: column.id,
      title: "Delete me",
    });

    const deleted = await ticketWrite.delete(project.id, ticket.id);
    expect(deleted.ok).toBe(true);
    if (!deleted.ok) return;
    expect(deleted.data.id).toBe(ticket.id);

    const stillThere = await ticketWrite.patch(project.id, ticket.id, {
      title: "ghost",
    });
    expect(stillThere.ok).toBe(false);
  });

  it("delete returns NOT_FOUND for a missing ticket", async () => {
    const { project } = await withProject();

    const result = await ticketWrite.delete(project.id, "missing-ticket");
    expect(result).toEqual({
      ok: false,
      code: "NOT_FOUND",
      message: "Ticket not found",
    });
  });
});
