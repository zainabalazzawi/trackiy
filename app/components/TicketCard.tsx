import { Ticket } from "../types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface CardProps {
  ticket: Ticket;
}

const TicketCard = ({ ticket }: CardProps) => {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">{ticket.title}</CardTitle>
        <CardDescription className="text-sm line-clamp-2">
          {ticket.description}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div
            className={`p-1 rounded-b-sm ${
              ticket.priority === "HIGH"
                ? "bg-red-100 text-red-800"
                : ticket.priority === "MEDIUM"
                ? "bg-yellow-100 text-yellow-800"
                : "bg-green-100 text-green-800"
            }`}
          >
            {ticket.priority}
          </div>

          {ticket.assignee && (
            <span className="text-sm text-muted-foreground">
              {ticket.assignee}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default TicketCard;
