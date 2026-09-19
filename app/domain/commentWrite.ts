import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import type {
  CreateCommentInput,
  UpdateCommentInput,
} from "@/app/api/httpHelpers/schemas";
import { fail, ok, type WriteResult } from "@/app/domain/writeResult";

export type CommentWriteCode = "NOT_FOUND" | "FORBIDDEN";

export type CommentWriteResult<T> = WriteResult<T, CommentWriteCode>;

const commentInclude = {
  user: {
    select: {
      id: true,
      name: true,
      image: true,
    },
  },
} as const;

type CommentWithAuthor = Prisma.CommentGetPayload<{
  include: typeof commentInclude;
}>;

const requireAuthorComment = async (
  projectId: string,
  ticketId: string,
  commentId: string,
  actorId: string
): Promise<CommentWriteResult<{ userId: string }>> => {
  const comment = await prisma.comment.findUnique({
    where: {
      id: commentId,
      ticketId,
      projectId,
    },
    select: { userId: true },
  });

  if (!comment) {
    return fail("NOT_FOUND", "Comment not found");
  }

  if (comment.userId !== actorId) {
    return fail("FORBIDDEN", "Forbidden");
  }

  return ok(comment);
};

const create = async (
  projectId: string,
  ticketId: string,
  authorId: string,
  input: CreateCommentInput
): Promise<CommentWriteResult<CommentWithAuthor>> => {
  const comment = await prisma.comment.create({
    data: {
      content: input.content,
      ticketId,
      userId: authorId,
      projectId,
    },
    include: commentInclude,
  });

  return ok(comment);
};

const patch = async (
  projectId: string,
  ticketId: string,
  commentId: string,
  actorId: string,
  input: UpdateCommentInput
): Promise<CommentWriteResult<CommentWithAuthor>> => {
  const existing = await requireAuthorComment(
    projectId,
    ticketId,
    commentId,
    actorId
  );
  if (!existing.ok) return existing;

  const updated = await prisma.comment.update({
    where: { id: commentId },
    data: { content: input.content },
    include: commentInclude,
  });

  return ok(updated);
};

const deleteComment = async (
  projectId: string,
  ticketId: string,
  commentId: string,
  actorId: string
): Promise<CommentWriteResult<{ id: string }>> => {
  const existing = await requireAuthorComment(
    projectId,
    ticketId,
    commentId,
    actorId
  );
  if (!existing.ok) return existing;

  const deleted = await prisma.comment.delete({
    where: { id: commentId },
  });

  return ok(deleted);
};

export const commentWrite = {
  create,
  patch,
  delete: deleteComment,
};
