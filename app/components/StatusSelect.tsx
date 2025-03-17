import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import React from "react";
import { Status, Ticket } from "../types";

interface StatusSelectProps {
  statuses?: Status[];
  ticket?: Ticket;
  handleStatusChange: (statusId: string) => void;
}
const StatusSelect = ({
  statuses,
  ticket,
  handleStatusChange,
}: StatusSelectProps) => {
  return (
    <div>
      <Select
        defaultValue={ticket?.status.id}
        onValueChange={handleStatusChange}
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
  );
};

export default StatusSelect;
