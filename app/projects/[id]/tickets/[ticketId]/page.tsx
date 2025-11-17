"use client";

import { Priority, ProjectMember } from "@/app/types";
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
  const { updateTicket } = useUpdateTicket(projectId, ticketId);
  const { tickets } = useAllTickets();

  // Get unique labels from all tickets
  const labels = [
    ...new Set(tickets?.flatMap((ticket) => ticket.labels || [])),
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
    <div className="p-3 sm:p-6 w-full bg-gradient-to-br from-slate-50 to-white min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="mb-4 sm:mb-6 bg-gradient-to-br from-white to-slate-50/30 p-4 rounded-xl shadow-md border border-slate-200/80">
          <span className="text-sm sm:text-base font-semibold text-slate-700 bg-gradient-to-r from-slate-100 to-slate-50 px-3 py-1.5 rounded-lg inline-block shadow-sm border border-slate-200/50">
            {ticket.ticketNumber}
          </span>
        </div>
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
          <div className="w-full lg:w-[70%]">
            <div className="mb-6 sm:mb-8 bg-gradient-to-br from-white to-slate-50/30 p-6 rounded-xl shadow-lg border border-slate-200/80">
              <EditableField
                value={ticket.title}
                onSave={(value) => updateTicket({ title: value })}
                titleText
                ticketId={ticketId}
                fieldId="title"
              />
              <div className="mt-6">
                <EditableField
                  value={ticket.description ?? ""}
                  onSave={(value) => updateTicket({ description: value })}
                  label="Description"
                  type="textarea"
                  ticketId={ticketId}
                  fieldId="description"
                />
              </div>
            </div>
          </div>

          <div className="w-full lg:w-[30%] space-y-4">
            <div className="bg-gradient-to-br from-white to-slate-50/30 p-4 rounded-xl shadow-lg border border-slate-200/80">
              <span className="text-sm sm:text-base font-semibold text-slate-800 block mb-2">Priority</span>
              <PrioritySelect
                value={ticket.priority}
                onChange={(value) =>
                  updateTicket({ priority: value as Priority })
                }
              />
            </div>
            <div className="bg-gradient-to-br from-white to-slate-50/30 p-4 rounded-xl shadow-lg border border-slate-200/80">
              <span className="text-sm sm:text-base font-semibold text-slate-800 block mb-2">Status</span>
              <StatusSelect
                statuses={statuses}
                ticket={ticket}
                handleStatusChange={(statusId: string) => {
                  updateTicket({ statusId: statusId });
                }}
              />
            </div>
            <div className="bg-gradient-to-br from-white to-slate-50/30 rounded-xl shadow-lg border border-slate-200/80 overflow-hidden">
              <h3 className="text-base sm:text-lg font-bold text-slate-800 bg-gradient-to-r from-slate-100 via-slate-50 to-slate-100 border-b border-slate-200/80 p-4">
                Details
              </h3>
              <div className="space-y-4 p-4">
              <div className="flex flex-col sm:flex-row sm:justify-between gap-2 sm:gap-4">
                <div className="text-xs sm:text-sm text-slate-600 font-medium">Assignee</div>
                <div className="text-xs sm:text-sm font-medium flex-1 sm:max-w-[60%]">
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
                    <SelectTrigger className="w-full sm:w-auto border-0 p-0 h-auto bg-transparent hover:bg-gray-50 rounded">
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
              <div className="flex flex-col sm:flex-row sm:justify-between gap-2 sm:gap-4">
                <div className="text-xs sm:text-sm text-slate-600 font-medium">Reporter</div>
                <div className="text-xs sm:text-sm font-medium text-slate-700">
                  {ticket?.reporter}
                </div>
              </div>
              <div className="flex flex-col sm:flex-row sm:justify-between gap-2 sm:gap-4">
                <div className="text-sm text-slate-600 font-medium">Labels</div>
                <div className="flex-1 sm:max-w-[60%]">
                  <MultiSelect
                    onValuesChange={(values) => {
                      updateTicket({ labels: values });
                    }}
                    values={ticket?.labels || []}
                  >
                    <MultiSelectTrigger allowTyping>
                      <MultiSelectValue  />
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
          <div className="mt-4 bg-gradient-to-br from-white to-slate-50/30 p-4 rounded-xl shadow-lg border border-slate-200/80">
            <div className="text-xs sm:text-sm text-slate-600 space-y-2">
              <div className="flex items-center gap-2">
                <span className="font-medium">Created:</span>
                <span className="text-slate-700">{formatDate(ticket.createdAt)}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-medium">Updated:</span>
                <span className="text-slate-700">{formatDate(ticket.updatedAt)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Comments Section */}
      <div className="mt-6 sm:mt-8 bg-gradient-to-br from-white to-slate-50/30 p-6 rounded-xl shadow-lg border border-slate-200/80">
        <Comments projectId={projectId} ticketId={ticketId} />
      </div>
      </div>
    </div>
  );
};
export default TicketPage;
