import { NextResponse } from "next/server";
import { getServerSession, type Session } from "next-auth";
import { authOptions } from "../auth/lib/auth";
import { prisma } from "@/lib/prisma";

export type GuardFailure = { ok: false; response: NextResponse };
export type SessionOk = { ok: true; session: Session };
export type ProjectAccessOk = { ok: true; session: Session };

/**
 * Ensure the request is authenticated.
 * Usage:
 *   const guard = await requireSession();
 *   if (!guard.ok) return guard.response;
 *   const { session } = guard;
 */
export async function requireSession(): Promise<SessionOk | GuardFailure> {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return {
      ok: false,
      response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }
  return { ok: true, session };
}

/**
 * Ensure the request is authenticated AND the user can access the given project,
 * either as its creator or as a ProjectMember.
 */
export async function requireProjectAccess(
  projectId: string
): Promise<ProjectAccessOk | GuardFailure> {
  const sessionGuard = await requireSession();
  if (!sessionGuard.ok) return sessionGuard;
  const { session } = sessionGuard;

  if (!projectId) {
    return {
      ok: false,
      response: NextResponse.json(
        { error: "Missing projectId" },
        { status: 400 }
      ),
    };
  }

  const project = await prisma.project.findFirst({
    where: {
      id: projectId,
      OR: [
        { userId: session.user.id },
        { members: { some: { userId: session.user.id } } },
      ],
    },
    select: { id: true },
  });

  if (!project) {
    return {
      ok: false,
      response: NextResponse.json({ error: "Forbidden" }, { status: 403 }),
    };
  }

  return { ok: true, session };
}
