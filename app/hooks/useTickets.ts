import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { Ticket } from "@/app/types";

// Hook to get all tickets for a project
export function useTickets(projectId: string) {
  const { data: tickets = [], isLoading } = useQuery<Ticket[]>({
    queryKey: ["tickets", projectId],
    queryFn: async () => {
      const response = await axios.get(`/api/projects/${projectId}/tickets`);
      return response.data;
    },
    enabled: !!projectId,
  });

  return {
    tickets,
    isLoading,
  };
}

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



// Hook to create a new ticket
export function useCreateTicket(projectId: string) {
  const queryClient = useQueryClient();

  const createTicketMutation = useMutation({
    mutationFn: async (ticketData: {
      title: string;
      columnId: string;
      assignee?: string;
    }) => {
      const response = await axios.post(
        `/api/projects/${projectId}/tickets`,
        ticketData
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tickets", projectId] });
    },
  });

  return {
    createTicket: createTicketMutation.mutate,
    isCreating: createTicketMutation.isPending,
    createError: createTicketMutation.error,
  };
}

// Hook to update a ticket
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
      
      // Simple success notification
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



// Hook to delete a ticket
export function useDeleteTicket(projectId: string) {
  const queryClient = useQueryClient();

  const deleteTicketMutation = useMutation({
    mutationFn: async (ticketId: string) => {
      const response = await axios.delete(
        `/api/projects/${projectId}/tickets/${ticketId}`
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tickets", projectId] });
    },
  });

  return {
    deleteTicket: deleteTicketMutation.mutate,
    isDeleting: deleteTicketMutation.isPending,
    deleteError: deleteTicketMutation.error,
  };
}