import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import React from "react";
import { Ticket } from "../types";

interface StatusSelectProps {
  columns?: { id: string; name: string }[];
  ticket?: Ticket;
  onColumnChange: (columnId: string) => void;
}
const StatusSelect = ({
  columns,
  ticket,
  onColumnChange,
}: StatusSelectProps) => {
  return (
    <div>
      <Select
        defaultValue={ticket?.columnId}
        onValueChange={onColumnChange}
      >
        <SelectTrigger className="w-full mb-3">
          <SelectValue placeholder={ticket?.columnId} />
        </SelectTrigger>
        <SelectContent>
          {columns?.map((column) => (
            <SelectItem key={column.id} value={column.id}>
              {column.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default StatusSelect;
