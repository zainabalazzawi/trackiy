"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { Priority, ProjectMember, Status, Ticket } from "@/app/types";
import { useParams } from "next/navigation";
import PrioritySelect from "@/app/components/PrioritySelect";
import EditableField from "@/app/components/EditableField";
import StatusSelect from "@/app/components/StatusSelect";
import { useProjectMembers } from "@/app/hooks/useProjects";
import { User } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LoadingState } from "@/app/components/LoadingState";

const TicketPage = () => {
  const params = useParams();
  const { id: projectId, ticketId } = params as {
    id: string;
    ticketId: string;
  };
  const queryClient = useQueryClient();
  const { members } = useProjectMembers(projectId);

  const { data: ticket, isLoading } = useQuery<Ticket>({
    queryKey: ["ticket", ticketId],
    queryFn: async () => {
      const response = await axios.get(
        `/api/projects/${projectId}/tickets/${ticketId}`
      );
      return response.data;
    },
  });

  const { data: statuses } = useQuery({
    queryKey: ["statuses", projectId],
    queryFn: async () => {
      const response = await axios.get(`/api/projects/${projectId}/statuses`);
      return response.data;
    },
  });

  const updateTicketMutation = useMutation({
    mutationFn: async (updateData: Partial<Ticket>) => {
      const response = await axios.patch(
        `/api/projects/${projectId}/tickets/${ticketId}`,
        updateData
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ticket", ticketId] });
    },
  });

  if (isLoading)
    return (
      <LoadingState
        text="Loading ticket detail"
        iconSize={64}
        className="animate-spin text-[#649C9E]"
      />
    );
  if (!ticket) return <div className="p-6">Ticket not found</div>;

  const membersById = members.reduce(
    (acc: Record<string, ProjectMember>, member: ProjectMember) => {
      acc[member.id] = member;
      return acc;
    },
    {}
  );

  const assigneeMember = membersById[ticket.assignee as string] || "unassigned";

  return (
    <div className="p-6 w-full">
      <div className="flex gap-8">
        <div className="w-[70%]">
          <div className="mb-8">
            <EditableField
              value={ticket.title}
              onSave={(value) => updateTicketMutation.mutate({ title: value })}
            />

            <div className="flex items-center gap-60">
              <span>Priority</span>
              <PrioritySelect
                value={ticket.priority}
                onChange={(value) =>
                  updateTicketMutation.mutate({ priority: value as Priority })
                }
              />
            </div>
          </div>

          <EditableField
            value={ticket.description ?? ""}
            onSave={(value) =>
              updateTicketMutation.mutate({ description: value })
            }
            label="Description"
            type="textarea"
          />
        </div>

        <div className="w-[30%]">
          <div>
            <StatusSelect
              statuses={statuses}
              ticket={ticket}
              handleStatusChange={(statusId: string) => {
                updateTicketMutation.mutate({ status: statusId });
              }}
            />
          </div>
          <div className="rounded border">
            <h3 className="text-lg font-medium text-gray-500 border-b mb-2 p-2">
              Details
            </h3>
            <div className="space-y-4 p-3">
              <div className="flex flex-row justify-between">
                <div className="text-sm text-gray-500">Assignee</div>
                <div className="text-sm font-medium">
                  <Select
                    value={assigneeMember}
                    onValueChange={(value) => {
                      const assigneeValue =
                        value === "unassigned" ? "unassigned" : value;
                      updateTicketMutation.mutate({ assignee: assigneeValue });
                    }}
                  >
                    <SelectTrigger className="w-auto border-0 p-0 h-auto bg-transparent hover:bg-gray-50 rounded">
                      <SelectValue>
                        {assigneeMember === "unassigned" ? (
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center">
                              <User className="h-3 w-3 text-gray-500" />
                            </div>
                            <span>Unassigned</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <Avatar className="w-6 h-6">
                              <AvatarImage
                                src={assigneeMember?.image?.replace(
                                  "s96-c",
                                  "s400-c"
                                )}
                                className="object-cover"
                              />
                              <AvatarFallback className="text-xs">
                                {assigneeMember?.name
                                  ?.split(" ")
                                  .map((n: string) => n[0])
                                  .join("")}
                              </AvatarFallback>
                            </Avatar>
                            <span>{assigneeMember?.name}</span>
                          </div>
                        )}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="unassigned">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-gray-500" />
                          <span>Unassigned</span>
                        </div>
                      </SelectItem>
                      {members.map((member: ProjectMember) => (
                        <SelectItem key={member.id} value={member.id}>
                          <div className="flex items-center gap-2">
                            <Avatar className="w-4 h-4">
                              <AvatarImage
                                src={member.image?.replace("s96-c", "s400-c")}
                                className="object-cover"
                              />
                              <AvatarFallback className="text-xs">
                                {member.name
                                  ?.split(" ")
                                  .map((n: string) => n[0])
                                  .join("")}
                              </AvatarFallback>
                            </Avatar>
                            <span>{member.name}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex flex-row justify-between">
                <div className="text-sm text-gray-500">Reporter</div>
                <div className="text-sm font-medium">{ticket?.reporter}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TicketPage;
