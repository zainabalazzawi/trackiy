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
import { useQueryClient } from "@tanstack/react-query";
import Column from "./Column";

import { Button } from "@/components/ui/button";
import { Ticket, ProjectMember, MemberSelection } from "../types";
import { useState, useRef } from "react";
import TicketCard from "./TicketCard";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { Check, Plus, X, User } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useProjectMembers } from "../hooks/useProjects";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCreateTicket, useTickets } from "../hooks/useTickets";
import { useColumns, useCreateColumn } from "../hooks/useColumns";
import { useUpdateTicketStatus } from "../hooks/useStatuses";
import { findMemberById } from "@/lib/utils";

interface BoardProps {
  projectId: string;
  selectedMemberId?: MemberSelection;
}

const Board = ({ projectId, selectedMemberId }: BoardProps) => {
  const { members } = useProjectMembers(projectId);
  const { tickets } = useTickets(projectId);
  const { updateTicketStatus } = useUpdateTicketStatus(projectId);
  const { createTicket } = useCreateTicket(projectId);
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

  const { columns } = useColumns(projectId);

  const { createColumn } = useCreateColumn(projectId);


  const handleTicketDeleted = (ticketId: string) => {
    // Optimistically remove the ticket from the local state
    queryClient.setQueryData(["tickets", projectId], (old: Ticket[]) => {
      return old.filter((ticket: Ticket) => ticket.id !== ticketId);
    });
    
  };

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

      const column = columns.find((col) => col.id === targetColumnId);
      updateTicketStatus({
        ticketId: active.id as string,
        columnId: targetColumnId as string,
        statusId: column?.statusId,
      });
    }

    setActiveId(null);
  };

  const handleAddColumn = () => {
    if (newColumnName.trim()) {
      createColumn(newColumnName, {
        onSuccess: () => {
          setIsAddingColumn(false);
          setNewColumnName("");
        },
      });
    }
  };

  const handleCreateTicket = (columnId: string) => {
    createTicket({
      title: newTicket,
      columnId: columnId,
      assignee: selectedAssignee,
    }, {
      onSuccess: () => {
        setIsCreatingTicket(false);
        setNewTicket("");
        setSelectedAssignee("unassigned");
      },
    });
  };

  return (
    <div className="h-screen">
      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="flex gap-2 pb-4 h-full overflow-x-auto">
          {columns.map((column, index) => {
            const columnTickets = tickets.filter((ticket) => 
              ticket.columnId === column.id && 
              (!selectedMemberId || 
               (selectedMemberId === "unassigned" ? 
                 !ticket.assignee || ticket.assignee === "unassigned" : 
                 ticket.assignee === selectedMemberId))
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
                    <TicketCard 
                      key={ticket.id} 
                      ticket={ticket} 
                      onTicketDeleted={handleTicketDeleted}
                    />
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
                          className="h-24 sm:h-32 text-sm sm:text-lg border-slate-300 bg-white rounded-lg"
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
                                      src={findMemberById(members, selectedAssignee)?.user.image?.replace("s96-c", "s400-c")}
                                      className="object-cover"
                                    />
                                    <AvatarFallback className="text-xs">
                                      {findMemberById(members, selectedAssignee)?.user.name
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
                                <SelectItem key={member.id} value={member.user.id}>
                                  <div className="flex items-center gap-2">
                                    <Avatar className="w-6 h-6">
                                      <AvatarImage
                                        src={member?.user.image?.replace(
                                          "s96-c",
                                          "s400-c"
                                        )}
                                        className="object-cover"
                                      />
                                      <AvatarFallback className="text-xs">
                                        {member?.user.name
                                          ?.split(" ")
                                          .map((n: string) => n[0])
                                          .join("")}
                                      </AvatarFallback>
                                    </Avatar>
                                    <span>{member?.user.name}</span>
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
                        className="flex items-center justify-start gap-2 text-slate-600 text-sm sm:text-base font-medium hover:text-[#649C9E] hover:bg-white/60 transition-all focus:outline-none w-full rounded-lg"
                        onClick={() => setIsCreatingTicket(true)}
                      >
                        <Plus className="h-4 w-4 sm:h-5 sm:w-5" />
                        Create Ticket
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
              <div className="p-4 rounded-xl bg-gradient-to-br from-slate-100 via-slate-50 to-white border border-slate-200 min-w-[200px]">
                <div className="flex flex-col gap-2">
                  <Input
                    value={newColumnName}
                    onChange={(e) => setNewColumnName(e.target.value)}
                    placeholder="Enter column name"
                    className="bg-white w-full text-sm sm:text-base border-slate-300"
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
                      className="h-8 w-8 hover:bg-[#649C9E] hover:text-white bg-white border border-slate-300"
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
                      className="h-8 w-8 hover:bg-red-100 hover:text-red-600 bg-white border border-slate-300"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <Button
                onClick={() => setIsAddingColumn(true)}
                size='icon'
                variant="ghost"
                className="cursor-pointer border-2 border-dashed  transition-all duration-300"
              >
                <Plus className="h-4 w-4 text-slate-500" />
              </Button>
            )}
          </div>
        </div>

        <DragOverlay>
          {activeId ? (
            <TicketCard
              ticket={tickets.find((t) => t.id === activeId)!}
              isDragging={true}
              onTicketDeleted={handleTicketDeleted}
            />
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
};

export default Board;
