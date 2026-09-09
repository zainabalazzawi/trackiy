"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import type { CreateTicketInput } from "@/app/api/_lib/schemas";
import type { Column, Ticket } from "@/app/types";
import {
  deleteTicketFromSnapshot,
  moveTicketInSnapshot,
} from "@/app/board/boardSnapshotTickets";

type TicketsCacheContext = {
  previousTickets: Ticket[] | undefined;
};

/**
 * Board snapshot: lanes + tickets for a project, and the mutations that
 * change that view. Sole setQueryData writer for ["tickets", projectId] on
 * board mutations (move/delete). Lane list uses ["columns", projectId] via
 * invalidate. Ticket field updates stay in useUpdateTicket.
 */
export function useBoardSnapshot(projectId: string) {
  const queryClient = useQueryClient();
  const ticketsKey = ["tickets", projectId] as const;
  const lanesKey = ["columns", projectId] as const;
  const base = `/api/projects/${projectId}`;

  const invalidateTickets = () =>
    queryClient.invalidateQueries({ queryKey: ticketsKey });
  const invalidateLanes = () =>
    queryClient.invalidateQueries({ queryKey: lanesKey });

  async function optimisticTickets(
    update: (tickets: Ticket[]) => Ticket[]
  ): Promise<TicketsCacheContext> {
    await queryClient.cancelQueries({ queryKey: ticketsKey });
    const previousTickets = queryClient.getQueryData<Ticket[]>(ticketsKey);
    queryClient.setQueryData<Ticket[]>(ticketsKey, (old) =>
      old ? update(old) : old
    );
    return { previousTickets };
  }

  function rollbackTickets(
    _error: unknown,
    _variables: unknown,
    context: TicketsCacheContext | undefined
  ) {
    if (context?.previousTickets !== undefined) {
      queryClient.setQueryData(ticketsKey, context.previousTickets);
    }
  }

  const { data: lanes = [], isLoading: isLoadingLanes } = useQuery<Column[]>({
    queryKey: lanesKey,
    queryFn: () => axios.get(`${base}/columns`).then((r) => r.data),
    enabled: !!projectId,
  });

  const { data: tickets = [], isLoading: isLoadingTickets } = useQuery<
    Ticket[]
  >({
    queryKey: ticketsKey,
    queryFn: () => axios.get(`${base}/tickets`).then((r) => r.data),
    enabled: !!projectId,
  });

  const createTicketMutation = useMutation({
    mutationFn: (ticketData: CreateTicketInput) =>
      axios.post(`${base}/tickets`, ticketData).then((r) => r.data),
    onSuccess: invalidateTickets,
  });

  const moveTicketMutation = useMutation({
    mutationFn: ({
      ticketId,
      laneId,
    }: {
      ticketId: string;
      laneId: string;
    }) =>
      axios
        .patch(`${base}/tickets/${ticketId}`, { columnId: laneId })
        .then((r) => r.data),
    onMutate: ({ ticketId, laneId }) =>
      optimisticTickets((list) => moveTicketInSnapshot(list, ticketId, laneId)),
    onError: rollbackTickets,
    onSuccess: (_data, { ticketId }) => {
      queryClient.invalidateQueries({ queryKey: ["ticket", ticketId] });
      invalidateTickets();
    },
  });

  const deleteTicketMutation = useMutation({
    mutationFn: (ticketId: string) =>
      axios.delete(`${base}/tickets/${ticketId}`).then((r) => r.data),
    onMutate: (ticketId) =>
      optimisticTickets((list) => deleteTicketFromSnapshot(list, ticketId)),
    onError: rollbackTickets,
    onSuccess: invalidateTickets,
  });

  const createLaneMutation = useMutation({
    mutationFn: (name: string) =>
      axios.post(`${base}/columns`, { name, projectId }).then((r) => r.data),
    onSuccess: invalidateLanes,
  });

  const updateLaneMutation = useMutation({
    mutationFn: ({ id, name }: { id: string; name: string }) =>
      axios.patch(`${base}/columns/${id}`, { name }).then((r) => r.data),
    onSuccess: invalidateLanes,
  });

  const deleteLaneMutation = useMutation({
    mutationFn: (id: string) =>
      axios.delete(`${base}/columns/${id}`).then((r) => r.data),
    onSuccess: invalidateLanes,
  });

  return {
    lanes,
    tickets,
    isLoading: isLoadingLanes || isLoadingTickets,
    createTicket: createTicketMutation.mutate,
    isCreatingTicket: createTicketMutation.isPending,
    moveTicket: moveTicketMutation.mutate,
    isMovingTicket: moveTicketMutation.isPending,
    deleteTicket: deleteTicketMutation.mutate,
    isDeletingTicket: deleteTicketMutation.isPending,
    createLane: createLaneMutation.mutate,
    isCreatingLane: createLaneMutation.isPending,
    updateLane: updateLaneMutation.mutate,
    isUpdatingLane: updateLaneMutation.isPending,
    deleteLane: deleteLaneMutation.mutate,
    isDeletingLane: deleteLaneMutation.isPending,
  };
}
