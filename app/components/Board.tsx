"use client";

import { useQuery } from "@tanstack/react-query";
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

const Board = () => {
  const [isOpen, setIsOpen] = useState(false);

  const getTickets = async (): Promise<Ticket[]> => {
    const response = await axios.get('/api/tickets');
    return response.data;
  };

  const getColumns = async (): Promise<ColumnType[]> => {
    const response = await axios.get('/api/columns');
    return response.data.sort((a:ColumnType, b: ColumnType) => a.order - b.order);
  };

  const { data: tickets = [] } = useQuery({
    queryKey: ["tickets"],
    queryFn: getTickets
  });

  const { data: columns = [] } = useQuery({
    queryKey: ['columns'],
    queryFn: getColumns
  });

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Trackiy</h1>
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

      <div className="flex gap-6 overflow-x-auto pb-4">
        {columns.map((column) => (
          <Column
            key={column.id}
            column={{
              ...column,
              tickets: tickets.filter((ticket) => ticket.columnId === column.id),
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default Board;
