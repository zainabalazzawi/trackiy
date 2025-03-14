"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { Status, Ticket } from "@/app/types";
import { useParams } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const TicketPage = () => {
  const params = useParams();
  const ticketId = params.id as string;
  const queryClient = useQueryClient();

  const { data: ticket, isLoading } = useQuery<Ticket>({
    queryKey: ["ticket", ticketId],
    queryFn: async () => {
      const response = await axios.get(`/api/tickets/${ticketId}`);
      return response.data;
    },
  });

  const { data: statuses } = useQuery({
    queryKey: ["statuses"],
    queryFn: async () => {
      const response = await axios.get("/api/statuses");
      return response.data;
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async (newStatus: string) => {
      const response = await axios.patch(`/api/tickets/${ticketId}`, {
        status: newStatus,
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ticket", ticketId] });
    },
  });

  const handleStatusChange = (newStatus: string) => {
    updateStatusMutation.mutate(newStatus);
  };

  if (isLoading) {
    return <div className="p-6">loading</div>;
  }


  return (
    <div className="p-6 w-full">
      <div className="flex gap-8">
        <div className="w-[70%]">
          <div className="mb-[2rem]">
            <h1 className="text-2xl font-medium mb-5">{ticket?.title}</h1>
            <div className="flex gap-60">
              <div>Priority</div>
              <span
                className={`px-2 py-1 rounded text-sm font-medium ${
                  ticket?.priority === "HIGH"
                    ? "bg-red-50 text-red-700"
                    : ticket?.priority === "MEDIUM"
                    ? "bg-yellow-50 text-yellow-700"
                    : "bg-green-50 text-green-700"
                }`}
              >
                {ticket?.priority}
              </span>
            </div>
          </div>

          <h2 className="text-base font-medium mb-3">Description</h2>
          <p className="text-gray-700 whitespace-pre-wrap">
            {ticket?.description}
          </p>
        </div>

        <div className="w-[30%]">
          <div>
            <Select
              defaultValue={ticket?.status.id}
              onValueChange={handleStatusChange}
              disabled={updateStatusMutation.isPending}
            >
              <SelectTrigger className="w-[55%] mb-3 rounded">
                <SelectValue placeholder={ticket?.status.id} />
              </SelectTrigger>
              <SelectContent>
                {statuses?.map((status: Status) => (
                  <SelectItem key={status.id} value={status.id}>
                    {status.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="rounded border">
            <h3 className="text-lg font-medium text-gray-500 border-b mb-2 p-2">
              Details
            </h3>
            <div className="space-y-4 p-3">
              {ticket?.assignee && (
                <div className="flex flex-row justify-between">
                  <div className="text-sm text-gray-500">Assignee</div>
                  <div className="text-sm font-medium">{ticket.assignee}</div>
                </div>
              )}
              {ticket?.reporter && (
                <div className="flex flex-row justify-between">
                  <div className="text-sm text-gray-500">Reporter</div>
                  <div className="text-sm font-medium">{ticket?.reporter}</div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TicketPage;
