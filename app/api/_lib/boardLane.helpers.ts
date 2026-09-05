import { prisma } from "@/lib/prisma";
import { randomBytes } from "crypto";

function uniqueSuffix() {
  return randomBytes(6).toString("hex");
}

export async function createTestProject(options?: { name?: string }) {
  const suffix = uniqueSuffix();
  const user = await prisma.user.create({
    data: {
      email: `boardlane-${suffix}@example.com`,
      name: `BoardLane Tester ${suffix}`,
    },
  });

  const project = await prisma.project.create({
    data: {
      name: options?.name ?? `BoardLane Project ${suffix}`,
      key: `BL${suffix}`.slice(0, 10).toUpperCase(),
      type: "TEAM_MANAGED",
      template: "KANBAN",
      category: "SOFTWARE",
      userId: user.id,
    },
  });

  async function cleanup() {
    await prisma.project.delete({ where: { id: project.id } }).catch(() => {});
    await prisma.user.delete({ where: { id: user.id } }).catch(() => {});
  }

  return { user, project, cleanup };
}

export async function createTicketInColumn(options: {
  columnId: string;
  title?: string;
}) {
  const suffix = uniqueSuffix();
  const column = await prisma.column.findUniqueOrThrow({
    where: { id: options.columnId },
    select: { id: true },
  });

  return prisma.ticket.create({
    data: {
      ticketNumber: `BL-${suffix}`,
      title: options.title ?? `Ticket ${suffix}`,
      columnId: column.id,
    },
  });
}
