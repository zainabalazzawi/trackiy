import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { Status } from "@/app/types";

// Hook to get statuses for a project
export function useStatuses(projectId: string) {
  const { data: statuses = [], isLoading } = useQuery<Status[]>({
    queryKey: ["statuses", projectId],
    queryFn: async () => {
      const response = await axios.get(`/api/projects/${projectId}/statuses`);
      return response.data;
    },
    enabled: !!projectId,
  });

  return {
    statuses,
    isLoading,
  };
}

// Hook to update ticket status/column (for drag and drop)
export function useUpdateTicketStatus(projectId: string) {
  const queryClient = useQueryClient();

  const updateTicketStatusMutation = useMutation({
    mutationFn: async ({
      ticketId,
      columnId,
      statusId,
    }: {
      ticketId: string;
      columnId: string;
      statusId?: string;
    }) => {
      const response = await axios.patch(
        `/api/projects/${projectId}/tickets/${ticketId}`,
        {
          status: statusId,
          projectId,
        }
      );
      return response.data;
    },
    onMutate: ({
      ticketId,
      columnId,
    }: {
      ticketId: string;
      columnId: string;
    }) => {
      // Optimistic update
      queryClient.setQueryData(["tickets", projectId], (old: any[]) => {
        return old?.map((ticket: any) =>
          ticket.id === ticketId ? { ...ticket, columnId } : ticket
        );
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tickets", projectId] });
    },
  });

  return {
    updateTicketStatus: updateTicketStatusMutation.mutate,
    isUpdatingStatus: updateTicketStatusMutation.isPending,
    updateStatusError: updateTicketStatusMutation.error,
  };
}
export const useAllStatuses = () => {
  const { data: allStatuses = [], isLoading } = useQuery<Status[]>({
    queryKey: ["all-statuses"],
    queryFn: async () => {
      const response = await axios.get(`/api/statuses`);
      return response.data;
    },
  });

  return {
    allStatuses,
    isLoading,
  };
};