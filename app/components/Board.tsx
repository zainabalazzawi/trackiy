"use client";

import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  useSensor,
  useSensors,
  PointerSensor,
  DragStartEvent,
} from "@dnd-kit/core";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Column from "./Column";

import { Button } from "@/components/ui/button";
import axios from "axios";
import { Ticket, Column as ColumnType, ProjectMember } from "../types";
import { useState, useRef } from "react";
import TicketCard from "./TicketCard";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { Check, Plus, X, User } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useSession } from "next-auth/react";
import { useProjectMembers } from "../hooks/useProjects";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface BoardProps {
  projectId: string;
}

const Board = ({ projectId }: BoardProps) => {
  const { data: session } = useSession();
  const { members } = useProjectMembers(projectId);

  const membersById = members.reduce(
    (acc: Record<string, ProjectMember>, member: ProjectMember) => {
      acc[member.id] = member;
      return acc;
    },
    {}
  );

  const [isOpen, setIsOpen] = useState(false);
  const queryClient = useQueryClient();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [isAddingColumn, setIsAddingColumn] = useState(false);
  const [newColumnName, setNewColumnName] = useState("");
  const [isCreatingTicket, setIsCreatingTicket] = useState(false);
  const [newTicket, setNewTicket] = useState("");
  const [selectedAssignee, setSelectedAssignee] =
    useState<string>("unassigned");
  const [isSelectOpen, setIsSelectOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    })
  );

  const getTickets = async (): Promise<Ticket[]> => {
    const response = await axios.get(`/api/projects/${projectId}/tickets`);
    return response.data;
  };

  const getColumns = async (): Promise<ColumnType[]> => {
    const response = await axios.get(`/api/projects/${projectId}/columns`);
    return response.data;
  };

  const { data: tickets = [] } = useQuery({
    queryKey: ["tickets", projectId],
    queryFn: getTickets,
  });

  const { data: columns = [] } = useQuery({
    queryKey: ["columns", projectId],
    queryFn: getColumns,
  });

  const updateTicketMutation = useMutation({
    mutationFn: async ({
      ticketId,
      columnId,
    }: {
      ticketId: string;
      columnId: string;
    }) => {
      const column = columns.find((col) => col.id === columnId);
      const response = await axios.patch(
        `/api/projects/${projectId}/tickets/${ticketId}`,
        {
          status: column?.statusId,
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
      queryClient.setQueryData(["tickets", projectId], (old: Ticket[]) => {
        return old.map((ticket: Ticket) =>
          ticket.id === ticketId ? { ...ticket, columnId } : ticket
        );
      });
    },
  });

  const createColumnMutation = useMutation({
    mutationFn: async (name: string) => {
      const response = await axios.post(`/api/projects/${projectId}/columns`, {
        name,
        projectId,
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["columns", projectId] });
      setIsAddingColumn(false);
      setNewColumnName("");
    },
  });

  const createTicketMutation = useMutation({
    mutationFn: async (ticket: {
      title: string;
      columnId: string;
      assignee?: string;
    }) => {
      const response = await axios.post(
        `/api/projects/${projectId}/tickets`,
        ticket
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tickets", projectId] });
      setIsCreatingTicket(false);
      setNewTicket("");
      setSelectedAssignee("unassigned");
    },
  });

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over) {
      setActiveId(null);
      return;
    }

    if (active.id !== over.id) {
      const overTicket = tickets.find((t) => t.id === over.id);
      const targetColumnId = overTicket ? overTicket.columnId : over.id;

      updateTicketMutation.mutate({
        ticketId: active.id as string,
        columnId: targetColumnId as string,
      });
    }

    setActiveId(null);
  };

  const handleAddColumn = () => {
    if (newColumnName.trim()) {
      createColumnMutation.mutate(newColumnName);
    }
  };

  const handleCreateTicket = (columnId: string) => {
    createTicketMutation.mutate({
      title: newTicket,
      columnId: columnId,
      assignee: selectedAssignee,
    });
  };

  return (
    <div className="h-screen">
      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="flex gap-2 pb-4 h-full">
          {columns.map((column, index) => {
            const columnTickets = tickets.filter(
              (ticket) => ticket.columnId === column.id
            );

            return (
              <Column
                projectId={projectId}
                key={column.id}
                column={{
                  ...column,
                  tickets: columnTickets,
                }}
              >
                <SortableContext
                  items={columnTickets.map((t) => t.id)}
                  strategy={verticalListSortingStrategy}
                >
                  {columnTickets.map((ticket) => (
                    <TicketCard key={ticket.id} ticket={ticket} />
                  ))}
                </SortableContext>
                {index === 0 && (
                  <div className="mt-2">
                    {isCreatingTicket ? (
                      <div className="relative">
                        <Input
                          ref={inputRef}
                          value={newTicket}
                          onChange={(e) => setNewTicket(e.target.value)}
                          placeholder="What needs to be done?"
                          autoFocus
                          className="h-32 text-lg border-ring"
                          onKeyDown={(e) => {
                            if (e.key === "Enter" && newTicket.trim()) {
                              handleCreateTicket(column.id);
                            } else if (e.key === "Escape") {
                              setIsCreatingTicket(false);
                              setNewTicket("");
                              setSelectedAssignee("unassigned");
                            }
                          }}
                          onBlur={() => {
                            if (!isSelectOpen) {
                              setIsCreatingTicket(false);
                              setNewTicket("");
                              setSelectedAssignee("unassigned");
                            }
                          }}
                        />
                        <span className="absolute right-3 bottom-1.5">
                          <Select
                            value={selectedAssignee}
                            onValueChange={setSelectedAssignee}
                            onOpenChange={(open) => {
                              setIsSelectOpen(open);
                              if (!open) {
                                // When Select closes, refocus the input
                                setTimeout(() => {
                                  inputRef.current?.focus();
                                }, 10);
                              }
                            }}
                          >
                            <SelectTrigger
                              className="w-8 h-8 p-0 border-0 bg-transparent hover:bg-gray-100 rounded-full cursor-pointer"
                              hideArrow
                            >
                              <SelectValue>
                                {selectedAssignee !== "unassigned" ? (
                                  <Avatar className="w-8 h-8">
                                    <AvatarImage
                                      src={membersById[
                                        selectedAssignee
                                      ]?.image?.replace("s96-c", "s400-c")}
                                      className="object-cover"
                                    />
                                    <AvatarFallback className="text-xs">
                                      {membersById[selectedAssignee]?.name
                                        ?.split(" ")
                                        .map((n: string) => n[0])
                                        .join("")}
                                    </AvatarFallback>
                                  </Avatar>
                                ) : (
                                  <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                                    <User className="h-4 w-4 text-gray-500" />
                                  </div>
                                )}
                              </SelectValue>
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="unassigned">
                                <User className="h-6 w-6 text-gray-500 mr-2" />
                                <span>Unassigned</span>
                              </SelectItem>
                              {members.map((member: ProjectMember) => (
                                <SelectItem key={member.id} value={member.id}>
                                  <div className="flex items-center gap-2">
                                    <Avatar className="w-6 h-6">
                                      <AvatarImage
                                        src={member.image?.replace(
                                          "s96-c",
                                          "s400-c"
                                        )}
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
                        </span>
                      </div>
                    ) : (
                      <Button
                        variant="ghost"
                        className="flex items-center justify-start gap-2 text-gray-600 text-base font-medium hover:text-gray-800 transition-colors focus:outline-none w-full rounded-sm"
                        onClick={() => setIsCreatingTicket(true)}
                      >
                        <Plus className="h-5 w-5" />
                        Create
                      </Button>
                    )}
                  </div>
                )}
              </Column>
            );
          })}
          {/* add new col */}
          <div className={`${isAddingColumn ? "w-full" : ""}`}>
            {isAddingColumn ? (
              <div className="p-4 rounded-lg bg-gray-200">
                <div className="flex flex-col gap-2">
                  <Input
                    value={newColumnName}
                    onChange={(e) => setNewColumnName(e.target.value)}
                    placeholder="Enter column name"
                    className="bg-white w-full"
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        handleAddColumn();
                      } else if (e.key === "Escape") {
                        setIsAddingColumn(false);
                        setNewColumnName("");
                      }
                    }}
                  />
                  <div className="flex gap-2 justify-end">
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={handleAddColumn}
                      className="h-6 w-6"
                    >
                      <Check className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => {
                        setIsAddingColumn(false);
                        setNewColumnName("");
                      }}
                      className="h-6 w-6"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setIsAddingColumn(true)}
                className="rounded-lg  cursor-pointer border-2 border-dashed border-gray-300 flex items-center justify-center hover:bg-gray-50 transition-colors"
              >
                <Plus className="h-6 w-6 text-gray-400" />
              </button>
            )}
          </div>
        </div>

        <DragOverlay>
          {activeId ? (
            <TicketCard
              ticket={tickets.find((t) => t.id === activeId)!}
              isDragging={true}
            />
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
};

export default Board;
