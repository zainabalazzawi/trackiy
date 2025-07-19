import { Ticket, ProjectMember } from "../types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useProjectMembers } from "../hooks/useProjects";
import { User } from "lucide-react";

interface CardProps {
  ticket: Ticket;
  isDragging?: boolean;
}

const TicketCard = ({ ticket, isDragging = false }: CardProps) => {
  const router = useRouter();
  const { members = [] } = useProjectMembers(ticket.column.projectId);

  const membersById = members.reduce(
    (acc: Record<string, ProjectMember>, member: ProjectMember) => {
      acc[member.id] = member;
      return acc;
    },
    {}
  );

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

  const assigneeMember = membersById[ticket.assignee as string];

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`
        touch-none 
        transition-opacity
        pb-2
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
            router.push(
              `/projects/${ticket.column.projectId}/tickets/${ticket.id}`
            );
          }
        }}
      >
        <CardHeader className="pb-2">
          <CardTitle className="text-base">{ticket.title}</CardTitle>
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

            {ticket.assignee === "unassigned" ? (
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center">
                  <User className="h-4 w-4 text-gray-500" />
                </div>
              </div>
            ) : assigneeMember && (
              <div className="flex items-center gap-2">
                <Avatar className="w-6 h-6">
                  <AvatarImage
                    src={assigneeMember.image?.replace("s96-c", "s400-c")}
                    className="object-cover"
                  />
                  <AvatarFallback className="text-xs">
                    {assigneeMember.name
                      ?.split(" ")
                      .map((n: string) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TicketCard;
