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

import CreateTicketForm from "./CreateTicketForm";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import axios from "axios";
import { Ticket, Column as ColumnType } from "../types";
import { useState } from "react";
import TicketCard from "./TicketCard";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { Check, Plus, X } from "lucide-react";
import { Input } from "@/components/ui/input";

const Board = () => {
  const [isOpen, setIsOpen] = useState(false);
  const queryClient = useQueryClient();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [isAddingColumn, setIsAddingColumn] = useState(false);
  const [newColumnName, setNewColumnName] = useState("");

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    })
  );

  const getTickets = async (): Promise<Ticket[]> => {
    const response = await axios.get("/api/tickets");
    return response.data;
  };

  const getColumns = async (): Promise<ColumnType[]> => {
    const response = await axios.get("/api/columns");
    return response.data.sort(
      (a: ColumnType, b: ColumnType) => a.order - b.order
    );
  };

  const { data: tickets = [] } = useQuery({
    queryKey: ["tickets"],
    queryFn: getTickets,
  });

  const { data: columns = [] } = useQuery({
    queryKey: ["columns"],
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
      const response = await axios.patch(`/api/tickets/${ticketId}`, {
        status: column?.statusId,
      });
      return response.data;
    },
    onMutate: ({
      ticketId,
      columnId,
    }: {
      ticketId: string;
      columnId: string;
    }) => {
      queryClient.setQueryData(["tickets"], (old: Ticket[]) => {
        return old.map((ticket: Ticket) =>
          ticket.id === ticketId ? { ...ticket, columnId } : ticket
        );
      });
    },
  });

  const createColumnMutation = useMutation({
    mutationFn: async (name: string) => {
      const response = await axios.post("/api/columns", { name });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["columns"] });
      setIsAddingColumn(false);
      setNewColumnName("");
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

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-8">
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button>Add New Ticket</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Ticket</DialogTitle>
            </DialogHeader>
            <CreateTicketForm onSuccess={() => setIsOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="flex gap-6 overflow-x-auto pb-4">
          {columns.map((column) => {
            const columnTickets = tickets.filter(
              (ticket) => ticket.columnId === column.id
            );

            return (
              <Column
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
              </Column>
            );
          })}

          <div className="w-80">
            {isAddingColumn ? (
              <div className="p-4 rounded-lg bg-gray-200">
                <div className="flex flex-col gap-2">
                  <Input
                    value={newColumnName}
                    onChange={(e) => setNewColumnName(e.target.value)}
                    placeholder="Enter column name"
                    className="bg-white"
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
                className="w-full h-full min-h-[100px] rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center hover:bg-gray-50 transition-colors"
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
