import { afterEach, describe, expect, it } from "vitest";
import { prisma } from "@/lib/prisma";
import { boardLane } from "./boardLane";
import { createTestProject, createTicketInColumn } from "./boardLane.helpers";
import { comments } from "./comments";

const cleanups: Array<() => Promise<void>> = [];

afterEach(async () => {
  while (cleanups.length > 0) {
    const cleanup = cleanups.pop();
    if (cleanup) await cleanup();
  }
});

async function withProjectAndTicket() {
  const ctx = await createTestProject();
  cleanups.push(ctx.cleanup);
  const column = await boardLane.create(ctx.project.id, "Todo");
  const ticket = await createTicketInColumn({
    columnId: column.id,
    title: "Commented ticket",
  });
  return { ...ctx, ticket };
}

async function createOtherUser() {
  const other = await prisma.user.create({
    data: {
      email: `other-${Date.now()}-${Math.random().toString(16).slice(2)}@example.com`,
      name: "Other User",
    },
  });
  cleanups.push(async () => {
    await prisma.user.delete({ where: { id: other.id } }).catch(() => {});
  });
  return other;
}

describe("comments", () => {
  it("create stores a comment authored by the given user", async () => {
    const { project, user, ticket } = await withProjectAndTicket();

    const created = await comments.create(
      project.id,
      ticket.id,
      user.id,
      { content: "Hello from author" }
    );

    expect(created.ok).toBe(true);
    if (!created.ok) return;
    expect(created.data.content).toBe("Hello from author");
    expect(created.data.ticketId).toBe(ticket.id);
    expect(created.data.projectId).toBe(project.id);
    expect(created.data.userId).toBe(user.id);
    expect(created.data.user).toMatchObject({
      id: user.id,
      name: user.name,
    });
  });

  it("patch lets the author update their comment", async () => {
    const { project, user, ticket } = await withProjectAndTicket();
    const created = await comments.create(
      project.id,
      ticket.id,
      user.id,
      { content: "Original" }
    );
    expect(created.ok).toBe(true);
    if (!created.ok) return;

    const updated = await comments.patch(
      project.id,
      ticket.id,
      created.data.id,
      user.id,
      { content: "Edited by author" }
    );

    expect(updated.ok).toBe(true);
    if (!updated.ok) return;
    expect(updated.data.content).toBe("Edited by author");
    expect(updated.data.userId).toBe(user.id);
  });

  it("delete lets the author remove their comment", async () => {
    const { project, user, ticket } = await withProjectAndTicket();
    const created = await comments.create(
      project.id,
      ticket.id,
      user.id,
      { content: "To delete" }
    );
    expect(created.ok).toBe(true);
    if (!created.ok) return;

    const deleted = await comments.delete(
      project.id,
      ticket.id,
      created.data.id,
      user.id
    );
    expect(deleted.ok).toBe(true);
    if (!deleted.ok) return;
    expect(deleted.data.id).toBe(created.data.id);

    const again = await comments.patch(
      project.id,
      ticket.id,
      created.data.id,
      user.id,
      { content: "ghost" }
    );
    expect(again).toEqual({
      ok: false,
      code: "NOT_FOUND",
      message: "Comment not found",
    });
  });

  it("patch returns FORBIDDEN when a non-author tries to update", async () => {
    const { project, user, ticket } = await withProjectAndTicket();
    const other = await createOtherUser();

    const created = await comments.create(
      project.id,
      ticket.id,
      user.id,
      { content: "Mine" }
    );
    expect(created.ok).toBe(true);
    if (!created.ok) return;

    const result = await comments.patch(
      project.id,
      ticket.id,
      created.data.id,
      other.id,
      { content: "Hijacked" }
    );
    expect(result).toEqual({
      ok: false,
      code: "FORBIDDEN",
      message: "Forbidden",
    });
  });

  it("delete returns FORBIDDEN when a non-author tries to remove", async () => {
    const { project, user, ticket } = await withProjectAndTicket();
    const other = await createOtherUser();

    const created = await comments.create(
      project.id,
      ticket.id,
      user.id,
      { content: "Mine" }
    );
    expect(created.ok).toBe(true);
    if (!created.ok) return;

    const result = await comments.delete(
      project.id,
      ticket.id,
      created.data.id,
      other.id
    );
    expect(result).toEqual({
      ok: false,
      code: "FORBIDDEN",
      message: "Forbidden",
    });
  });

  it("patch returns NOT_FOUND when the comment is missing", async () => {
    const { project, user, ticket } = await withProjectAndTicket();

    const result = await comments.patch(
      project.id,
      ticket.id,
      "missing-comment",
      user.id,
      { content: "Nope" }
    );
    expect(result).toEqual({
      ok: false,
      code: "NOT_FOUND",
      message: "Comment not found",
    });
  });

  it("delete returns NOT_FOUND when the comment is missing", async () => {
    const { project, user, ticket } = await withProjectAndTicket();

    const result = await comments.delete(
      project.id,
      ticket.id,
      "missing-comment",
      user.id
    );
    expect(result).toEqual({
      ok: false,
      code: "NOT_FOUND",
      message: "Comment not found",
    });
  });
});
