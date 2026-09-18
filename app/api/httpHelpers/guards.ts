import { NextResponse } from "next/server";
import { getServerSession, type Session } from "next-auth";
import { authOptions } from "../auth/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  type Permission,
  type Role,
  hasPermission,
  roleAtLeast,
} from "@/lib/permissions";

export type GuardFailure = { ok: false; response: NextResponse };
export type SessionOk = { ok: true; session: Session };
export type ProjectAccessOk = {
  ok: true;
  session: Session;
  role: Role;
};

/**
 * Ensure the request is authenticated.
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
 * Resolve the user's role in a project.
 * Project creators are always treated as OWNER.
 */
export async function getProjectRole(
  userId: string,
  projectId: string
): Promise<Role | null> {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: {
      userId: true,
      members: {
        where: { userId },
        select: { role: true },
      },
    },
  });

  if (!project) return null;

  if (project.userId === userId) return "OWNER";

  const membership = project.members[0];
  return membership?.role ?? null;
}

/**
 * Ensure the request is authenticated AND the user has at least the given role.
 */
export async function requireProjectRole(
  projectId: string,
  minRole: Role
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

  const role = await getProjectRole(session.user.id, projectId);

  if (!role || !roleAtLeast(role, minRole)) {
    return {
      ok: false,
      response: NextResponse.json({ error: "Forbidden" }, { status: 403 }),
    };
  }

  return { ok: true, session, role };
}

/**
 * Ensure the request is authenticated AND the user has the given permission.
 */
export async function requireProjectPermission(
  projectId: string,
  permission: Permission
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

  const role = await getProjectRole(session.user.id, projectId);

  if (!role || !hasPermission(role, permission)) {
    return {
      ok: false,
      response: NextResponse.json({ error: "Forbidden" }, { status: 403 }),
    };
  }

  return { ok: true, session, role };
}

/**
 * Ensure the request is authenticated AND the user can access the project
 * with at least VIEWER role.
 */
export async function requireProjectAccess(
  projectId: string
): Promise<ProjectAccessOk | GuardFailure> {
  return requireProjectRole(projectId, "VIEWER");
}
