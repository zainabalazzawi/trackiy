import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { Ticket } from "@/app/types";

// Hook to get all tickets across all projects
export function useAllTickets() {
  const { data: tickets = [], isLoading } = useQuery<Ticket[]>({
    queryKey: ["all-tickets"],
    queryFn: async () => {
      const response = await axios.get(`/api/tickets`);
      return response.data;
    },
  });

  return {
    tickets,
    isLoading,
  };
}

// Hook to get a single ticket by ID
export function useTicket(projectId: string, ticketId: string) {
  const { data: ticket, isLoading } = useQuery<Ticket>({
    queryKey: ["ticket", ticketId],
    queryFn: async () => {
      const response = await axios.get(
        `/api/projects/${projectId}/tickets/${ticketId}`
      );
      return response.data;
    },
    enabled: !!projectId && !!ticketId,
  });

  return {
    ticket,
    isLoading,
  };
}

// Hook to update a ticket (fields other than lane membership)
export function useUpdateTicket(projectId: string, ticketId?: string) {
  const queryClient = useQueryClient();

  const updateTicketMutation = useMutation({
    mutationFn: async (updateData: Partial<Ticket>) => {
      const response = await axios.patch(
        `/api/projects/${projectId}/tickets/${ticketId}`,
        updateData
      );
      return response.data;
    },
    onSuccess: () => {
      if (ticketId) {
        queryClient.invalidateQueries({ queryKey: ["ticket", ticketId] });
      }
      queryClient.invalidateQueries({ queryKey: ["tickets", projectId] });

      console.log("✅ Ticket updated successfully");
    },
    onError: (error) => {
      console.error("❌ Failed to update ticket:", error);
    },
  });

  return {
    updateTicket: updateTicketMutation.mutate,
    isUpdating: updateTicketMutation.isPending,
    updateError: updateTicketMutation.error,
  };
}
