import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import type { ProjectMember } from "@/app/types";
import { fail, ok, type WriteResult } from "@/app/domain/writeResult";

export type ProjectMemberWriteCode = "ALREADY_MEMBER";

export type ProjectMemberWriteResult<T> = WriteResult<T, ProjectMemberWriteCode>;

export const memberInclude = {
  user: {
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
    },
  },
} as const;

const add = async (
  projectId: string,
  userId: string
): Promise<ProjectMemberWriteResult<ProjectMember>> => {
  try {
    const member = await prisma.projectMember.create({
      data: {
        projectId,
        userId,
        role: "MEMBER",
      },
      include: memberInclude,
    });
    return ok({
      id: member.id,
      role: member.role,
      user: member.user,
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return fail("ALREADY_MEMBER", "Already a member");
    }
    throw error;
  }
};

export const projectMemberWrite = {
  add,
};
