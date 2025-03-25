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
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';

const Board = () => {
  const [isOpen, setIsOpen] = useState(false);
  const queryClient = useQueryClient();
  const [activeId, setActiveId] = useState<string | null>(null);

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
      const overTicket = tickets.find(t => t.id === over.id);
      const targetColumnId = overTicket ? overTicket.columnId : over.id;

      updateTicketMutation.mutate({
        ticketId: active.id as string,
        columnId: targetColumnId as string,
      });
    }

    setActiveId(null);
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
                  items={columnTickets.map(t => t.id)}
                  strategy={verticalListSortingStrategy}
                >
                  {columnTickets.map((ticket) => (
                    <TicketCard 
                      key={ticket.id} 
                      ticket={ticket}
                    />
                  ))}
                </SortableContext>
              </Column>
            );
          })}
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
