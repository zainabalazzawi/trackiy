import { Ticket } from "../types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface CardProps {
  ticket: Ticket;
  isDragging?: boolean;
}

const TicketCard = ({ ticket, isDragging = false }: CardProps) => {
  const router = useRouter();
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({
    id: ticket.id,
    data: ticket,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const isCurrentlyDragging = isDragging || isSortableDragging;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`
        touch-none 
        transition-opacity
        ${isCurrentlyDragging ? "opacity-50" : "opacity-100"}
      `}
    >
      <Card
        className="
          hover:shadow-md 
          transition-all
          cursor-pointer"
        onClick={(e) => {
          if (!isCurrentlyDragging) {
            router.push(`/tickets/${ticket.id}`);
          }
        }}
      >
        <CardHeader className="pb-2">
          <CardTitle className="text-base">{ticket.title}</CardTitle>
          <CardDescription className="text-sm line-clamp-2">
            {ticket.description}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div
              className={`
                p-1 
                rounded-b-sm 
                ${
                  ticket.priority === "HIGH"
                    ? "bg-red-100 text-red-800"
                    : ticket.priority === "MEDIUM"
                    ? "bg-yellow-100 text-yellow-800"
                    : "bg-green-100 text-green-800"
                }
              `}
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
    </div>
  );
};

export default TicketCard;
