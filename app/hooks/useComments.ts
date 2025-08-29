import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { Comment } from "@/app/types";

// Hook to get comments for a ticket
export function useComments(projectId: string, ticketId: string) {
  const { data: comments = [], isLoading } = useQuery<Comment[]>({
    queryKey: ["comments", projectId, ticketId],
    queryFn: async () => {
      const response = await axios.get(
        `/api/projects/${projectId}/tickets/${ticketId}/comments`
      );
      return response.data;
    },
    enabled: !!projectId && !!ticketId,
  });

  return {
    comments,
    isLoading,
  };
}

// Hook to create a new comment
export function useCreateComment(projectId: string, ticketId: string) {
  const queryClient = useQueryClient();

  const createCommentMutation = useMutation({
    mutationFn: async (commentData: { content: string }) => {
      const response = await axios.post(
        `/api/projects/${projectId}/tickets/${ticketId}/comments`,
        commentData
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comments", projectId, ticketId] });
      // Also invalidate the ticket query to refresh ticket data
      queryClient.invalidateQueries({ queryKey: ["ticket", ticketId] });
    },
  });

  return {
    createComment: createCommentMutation.mutate,
    isCreating: createCommentMutation.isPending,
    createError: createCommentMutation.error,
  };
}

// Hook to delete a comment
export function useDeleteComment(projectId: string, ticketId: string) {
  const queryClient = useQueryClient();

  const deleteCommentMutation = useMutation({
    mutationFn: async (commentId: string) => {
      const response = await axios.delete(
        `/api/projects/${projectId}/tickets/${ticketId}/comments/${commentId}`
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comments", projectId, ticketId] });
      // Also invalidate the ticket query to refresh ticket data
      queryClient.invalidateQueries({ queryKey: ["ticket", ticketId] });
    },
  });

  return {
    deleteComment: deleteCommentMutation.mutate,
    isDeleting: deleteCommentMutation.isPending,
    deleteError: deleteCommentMutation.error,
  };
}

// Hook to update a comment
export function useUpdateComment(projectId: string, ticketId: string) {
  const queryClient = useQueryClient();

  const updateCommentMutation = useMutation({
    mutationFn: async ({ commentId, content }: { commentId: string; content: string }) => {
      const response = await axios.patch(
        `/api/projects/${projectId}/tickets/${ticketId}/comments/${commentId}`,
        { content }
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comments", projectId, ticketId] });
      // Also invalidate the ticket query to refresh ticket data
      queryClient.invalidateQueries({ queryKey: ["ticket", ticketId] });
    },
  });

  return {
    updateComment: updateCommentMutation.mutate,
    isUpdating: updateCommentMutation.isPending,
    updateError: updateCommentMutation.error,
  };
}
