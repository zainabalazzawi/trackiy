import { afterEach, describe, expect, it } from "vitest";
import { prisma } from "@/lib/prisma";
import { createTestProject } from "./boardLane.helpers";
import { projectMembers } from "./projectMembers";

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

async function createOtherUser() {
  const other = await prisma.user.create({
    data: {
      email: `member-${Date.now()}-${Math.random().toString(16).slice(2)}@example.com`,
      name: "New Member",
    },
  });
  cleanups.push(async () => {
    await prisma.user.delete({ where: { id: other.id } }).catch(() => {});
  });
  return other;
}

describe("projectMembers", () => {
  it("add stores a MEMBER for the given user", async () => {
    const { project } = await withProject();
    const other = await createOtherUser();

    const added = await projectMembers.add(project.id, other.id);

    expect(added.ok).toBe(true);
    if (!added.ok) return;
    expect(typeof added.data.id).toBe("string");
    expect(added.data.id.length).toBeGreaterThan(0);
    expect(added.data.role).toBe("MEMBER");
    expect(added.data.user).toEqual({
      id: other.id,
      name: other.name,
      email: other.email,
      image: other.image,
    });
  });

  it("add returns ALREADY_MEMBER when the user is already on the project", async () => {
    const { project } = await withProject();
    const other = await createOtherUser();

    const first = await projectMembers.add(project.id, other.id);
    expect(first.ok).toBe(true);

    const duplicate = await projectMembers.add(project.id, other.id);
    expect(duplicate).toEqual({
      ok: false,
      code: "ALREADY_MEMBER",
      message: "Already a member",
    });
  });
});
