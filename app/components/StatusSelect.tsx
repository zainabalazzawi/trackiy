import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import React from "react";
import { Ticket } from "../types";

interface StatusSelectProps {
  lanes?: { id: string; name: string }[];
  ticket?: Ticket;
  onLaneChange: (laneId: string) => void;
}

const StatusSelect = ({
  lanes,
  ticket,
  onLaneChange,
}: StatusSelectProps) => {
  return (
    <div>
      <Select
        defaultValue={ticket?.columnId}
        onValueChange={onLaneChange}
      >
        <SelectTrigger className="w-full mb-3">
          <SelectValue placeholder={ticket?.columnId} />
        </SelectTrigger>
        <SelectContent>
          {lanes?.map((lane) => (
            <SelectItem key={lane.id} value={lane.id}>
              {lane.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default StatusSelect;
