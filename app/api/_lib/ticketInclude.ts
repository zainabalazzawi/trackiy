/** Shared Prisma include for ticket JSON returned by writes and ticket GETs. */
export const ticketInclude = {
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
