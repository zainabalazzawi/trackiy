"use client";

import { Priority, ProjectMember, Status, Ticket } from "@/app/types";
import { useParams } from "next/navigation";
import PrioritySelect from "@/app/components/PrioritySelect";
import EditableField from "@/app/components/EditableField";
import StatusSelect from "@/app/components/StatusSelect";
import { useProjectMembers } from "@/app/hooks/useProjects";
import {
  useTicket,
  useUpdateTicket,
  useAllTickets,
} from "@/app/hooks/useTickets";
import { useStatuses } from "@/app/hooks/useStatuses";
import { User } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  MultiSelect,
  MultiSelectContent,
  MultiSelectGroup,
  MultiSelectItem,
  MultiSelectTrigger,
  MultiSelectValue,
} from "@/components/ui/multi-select";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LoadingState } from "@/app/components/LoadingState";
import { findMemberById, formatDate } from "@/lib/utils";
import Comments from "@/app/components/Comments";

const TicketPage = () => {
  const params = useParams();
  const { id: projectId, ticketId } = params as {
    id: string;
    ticketId: string;
  };
  const { members } = useProjectMembers(projectId);
  const { ticket, isLoading } = useTicket(projectId, ticketId);
  const { statuses } = useStatuses(projectId);
  const { updateTicket, isUpdating } = useUpdateTicket(projectId, ticketId);
  const { tickets } = useAllTickets();

  // Get unique labels from all tickets
  const labels = [
    ...new Set(
      tickets?.flatMap((ticket) => ticket.labels || [])
    ),
  ].sort();


  if (isLoading)
    return (
      <LoadingState
        text="Loading ticket detail"
        iconSize={64}
        className="animate-spin text-[#649C9E]"
      />
    );
  if (!ticket) return <div className="p-6">Ticket not found</div>;

  const assigneeMember =
    findMemberById(members, ticket.assignee as string) || "unassigned";

  return (
    <div className="p-6 w-full">
      {ticket.ticketNumber}
      <div className="flex gap-8">
        <div className="w-[70%]">
          <div className="mb-8">
            <EditableField
              value={ticket.title}
              onSave={(value) => updateTicket({ title: value })}
              titleText

            />

            <div className="flex items-center gap-60 mt-3">
              <span>Priority</span>
              <PrioritySelect
                value={ticket.priority}
                onChange={(value) =>
                  updateTicket({ priority: value as Priority })
                }
              />
            </div>
          </div>

          <EditableField
            value={ticket.description ?? ""}
            onSave={(value) => updateTicket({ description: value })}
            label="Description"
            type="textarea"

          />

          {/* Comments Section */}
          <div className="mt-8">
            <Comments projectId={projectId} ticketId={ticketId} />
          </div>
        </div>

        <div className="w-[30%]">
          <div>
            <StatusSelect
              statuses={statuses}
              ticket={ticket}
              handleStatusChange={(statusId: string) => {
                updateTicket({ statusId: statusId });
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
                    value={
                      assigneeMember && assigneeMember !== "unassigned"
                        ? assigneeMember.user.id
                        : "unassigned"
                    }
                    onValueChange={(value) => {
                      const assigneeValue =
                        value === "unassigned" ? "unassigned" : value;
                      updateTicket({ assignee: assigneeValue });
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
                                src={assigneeMember?.user?.image?.replace(
                                  "s96-c",
                                  "s400-c"
                                )}
                                className="object-cover"
                              />
                              <AvatarFallback className="text-xs">
                                {assigneeMember?.user?.name
                                  ?.split(" ")
                                  .map((n: string) => n[0])
                                  .join("")}
                              </AvatarFallback>
                            </Avatar>
                            <span>{assigneeMember?.user.name}</span>
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
                        <SelectItem key={member.id} value={member.user.id}>
                          <div className="flex items-center gap-2">
                            <Avatar className="w-4 h-4">
                              <AvatarImage
                                src={member.user.image?.replace(
                                  "s96-c",
                                  "s400-c"
                                )}
                                className="object-cover"
                              />
                              <AvatarFallback className="text-xs">
                                {member.user.name
                                  ?.split(" ")
                                  .map((n: string) => n[0])
                                  .join("")}
                              </AvatarFallback>
                            </Avatar>
                            <span>{member.user.name}</span>
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
              <div className="flex flex-row justify-between">
                <div className="text-sm text-gray-500">Label</div>
                <div className="w-[80%]">
                  <MultiSelect
                    onValuesChange={(values) => {
                      updateTicket({ labels: values });
                    }}
                    values={ticket?.labels || []}
                  >
                    <MultiSelectTrigger allowTyping>
                      <MultiSelectValue placeholder="Add label" />
                    </MultiSelectTrigger>
                    <MultiSelectContent>
                      <MultiSelectGroup>
                        {labels.map((label) => (
                          <MultiSelectItem key={label} value={label}>
                            {label}
                          </MultiSelectItem>
                        ))}
                      </MultiSelectGroup>
                    </MultiSelectContent>
                  </MultiSelect>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-5 text-[12px] text-gray-600">
            <div>
              Created <span> {formatDate(ticket.createdAt)}</span>
            </div>
            <div>
              Updated <span> {formatDate(ticket.updatedAt)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TicketPage;