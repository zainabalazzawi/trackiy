import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import {
  requireProjectAccess,
  requireProjectPermission,
} from "@/app/api/httpHelpers/guards";
import { parseJson } from "@/app/api/httpHelpers/validation";
import { AddMembersSchema } from "@/app/api/httpHelpers/schemas";
import {
  projectMemberInclude,
  projectMembers,
} from "@/app/product/projectMembers";
import { errorResponse } from "@/app/api/httpHelpers/resultHttp";
import type { ProjectMember, Role } from "@/app/types";

function toMemberResponse(member: {
  id: string;
  role: Role;
  user: ProjectMember["user"];
}): ProjectMember {
  return {
    id: member.id,
    role: member.role,
    user: member.user,
  };
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: projectId } = await params;

    const guard = await requireProjectAccess(projectId);
    if (!guard.ok) return guard.response;

    const memberships = await prisma.projectMember.findMany({
      where: { projectId },
      include: projectMemberInclude,
    });

    return NextResponse.json(memberships.map(toMemberResponse));
  } catch (error) {
    console.error("Error fetching project members:", error);
    return NextResponse.json(
      { error: "Failed to fetch members" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: projectId } = await params;

    const guard = await requireProjectPermission(projectId, "manage_members");
    if (!guard.ok) return guard.response;

    const body = await parseJson(request, AddMembersSchema);
    if (!body.ok) return body.response;
    const { memberIds } = body.data;

    const members = [];
    for (const userId of memberIds) {
      const added = await projectMembers.add(projectId, userId);
      if (!added.ok) return errorResponse(added);
      members.push(added.data);
    }

    return NextResponse.json(members);
  } catch (error) {
    console.error("Error adding project members:", error);
    return NextResponse.json(
      { error: "Failed to add members" },
      { status: 500 }
    );
  }
}
