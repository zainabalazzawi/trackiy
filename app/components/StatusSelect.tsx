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
        defaultValue={ticket?.statusId}
        onValueChange={handleStatusChange}
      >
        <SelectTrigger className="w-full mb-3 rounded">
          <SelectValue placeholder={ticket?.statusId} />
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
