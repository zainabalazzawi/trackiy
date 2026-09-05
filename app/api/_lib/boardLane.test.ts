import { afterEach, describe, expect, it } from "vitest";
import { boardLane } from "./boardLane";
import { createTestProject, createTicketInColumn } from "./boardLane.helpers";

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

describe("boardLane", () => {
  it("create makes a column listable for the project", async () => {
    const { project } = await withProject();

    const created = await boardLane.create(project.id, "Backlog");

    expect(created.name).toBe("Backlog");
    expect(created.projectId).toBe(project.id);
    expect(created.order).toBe(0);

    const columns = await boardLane.list(project.id);
    expect(columns).toEqual([
      expect.objectContaining({
        id: created.id,
        name: "Backlog",
        order: 0,
      }),
    ]);
  });

  it("create appends columns after the highest existing order", async () => {
    const { project } = await withProject();

    await boardLane.create(project.id, "Todo");
    const second = await boardLane.create(project.id, "Doing");

    expect(second.order).toBe(1);
    const columns = await boardLane.list(project.id);
    expect(columns.map((c) => c.name)).toEqual(["Todo", "Doing"]);
  });

  it("createMany creates template lanes in the given order", async () => {
    const { project } = await withProject();

    const created = await boardLane.createMany(project.id, [
      "Ready to Development",
      "In Development",
      "Done",
    ]);

    expect(created.map((c) => ({ name: c.name, order: c.order }))).toEqual([
      { name: "Ready to Development", order: 0 },
      { name: "In Development", order: 1 },
      { name: "Done", order: 2 },
    ]);

    const columns = await boardLane.list(project.id);
    expect(columns.map((c) => c.name)).toEqual([
      "Ready to Development",
      "In Development",
      "Done",
    ]);
  });

  it("rename updates the column name returned by list", async () => {
    const { project } = await withProject();
    const created = await boardLane.create(project.id, "Old Name");

    const renamed = await boardLane.rename(project.id, created.id, "New Name");
    expect(renamed.ok).toBe(true);
    if (!renamed.ok) return;
    expect(renamed.data.name).toBe("New Name");

    const columns = await boardLane.list(project.id);
    expect(columns[0]?.name).toBe("New Name");
  });

  it("reorder persists the new column order across list", async () => {
    const { project } = await withProject();
    const a = await boardLane.create(project.id, "A");
    const b = await boardLane.create(project.id, "B");
    const c = await boardLane.create(project.id, "C");

    const reordered = await boardLane.reorder(project.id, [c.id, a.id, b.id]);
    expect(reordered.ok).toBe(true);

    const columns = await boardLane.list(project.id);
    expect(columns.map((col) => col.name)).toEqual(["C", "A", "B"]);
    expect(columns.map((col) => col.order)).toEqual([0, 1, 2]);
  });

  it("moveTicket places the ticket in the target column", async () => {
    const { project } = await withProject();
    const source = await boardLane.create(project.id, "Todo");
    const target = await boardLane.create(project.id, "Done");
    const ticket = await createTicketInColumn({
      columnId: source.id,
      title: "Move me",
    });

    const moved = await boardLane.moveTicket(project.id, ticket.id, target.id);
    expect(moved.ok).toBe(true);
    if (!moved.ok) return;
    expect(moved.data.columnId).toBe(target.id);
  });

  it("moveTicket applies lane and field changes in one update", async () => {
    const { project } = await withProject();
    const source = await boardLane.create(project.id, "Todo");
    const target = await boardLane.create(project.id, "Done");
    const ticket = await createTicketInColumn({
      columnId: source.id,
      title: "Move me",
    });

    const moved = await boardLane.moveTicket(project.id, ticket.id, target.id, {
      title: "Moved and renamed",
      priority: "HIGH",
    });
    expect(moved.ok).toBe(true);
    if (!moved.ok) return;
    expect(moved.data.columnId).toBe(target.id);
    expect(moved.data.title).toBe("Moved and renamed");
    expect(moved.data.priority).toBe("HIGH");
  });

  it("delete removes an empty column from list", async () => {
    const { project } = await withProject();
    const created = await boardLane.create(project.id, "Temp");

    const deleted = await boardLane.delete(project.id, created.id);
    expect(deleted.ok).toBe(true);

    expect(await boardLane.list(project.id)).toEqual([]);
  });

  it("delete refuses when the column still has tickets", async () => {
    const { project } = await withProject();
    const created = await boardLane.create(project.id, "Busy");
    await createTicketInColumn({
      columnId: created.id,
    });

    const result = await boardLane.delete(project.id, created.id);
    expect(result).toEqual({
      ok: false,
      code: "NOT_EMPTY",
      message: "Cannot delete a column that still has tickets",
    });

    const columns = await boardLane.list(project.id);
    expect(columns).toHaveLength(1);
    expect(columns[0]?.id).toBe(created.id);
  });
});
