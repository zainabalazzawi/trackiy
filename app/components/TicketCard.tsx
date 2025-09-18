import { Ticket, ProjectMember } from "../types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useProjectMembers } from "../hooks/useProjects";
import { User, Trash2, MoreHorizontal, Circle } from "lucide-react";
import { findMemberById } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useDeleteTicket } from "@/app/hooks/useTickets";

interface CardProps {
  ticket: Ticket;
  isDragging?: boolean;
  onTicketDeleted?: (ticketId: string) => void;
}

const TicketCard = ({
  ticket,
  isDragging = false,
  onTicketDeleted,
}: CardProps) => {
  const router = useRouter();
  const { members = [] } = useProjectMembers(ticket.column.project.id);
  const [open, setOpen] = useState(false);


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

  const assigneeMember = findMemberById(members, ticket.assignee as string);

  const { deleteTicket, isDeleting } = useDeleteTicket(ticket.column.project.id);

  const handleDeleteTicket = (ticketId: string) => {
    deleteTicket(ticketId, {
      onSuccess: () => {
        onTicketDeleted?.(ticketId);
        setOpen(false);
      },
    });
  };

  const handleCardClick = (e: React.MouseEvent) => {
      if (!isCurrentlyDragging) {
            router.push(
              `/projects/${ticket.column.project.id}/tickets/${ticket.id}`
            );
          }
  };

  return (
    <>
      <div
        ref={setNodeRef}
        style={style}
        {...attributes}
        {...listeners}
        className={`
          touch-none 
          transition-opacity
          pb-1
          ${isCurrentlyDragging ? "opacity-50" : "opacity-100"}
        `}
      >
        <Card
          className="
            hover:shadow-md 
            transition-all
            cursor-pointer
            py-2 px-0"
          onClick={handleCardClick}
        >
          <CardHeader className="pb-2 px-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">{ticket.title}</CardTitle>
              <DropdownMenu >
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="pt-0">
                    <MoreHorizontal size={20} />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation();
                      setOpen(true);
                    }}
                    className="text-red-800"
                  >
                    <Trash2 className="mr-2 text-red-800" size={16} />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </CardHeader>
          <CardContent className="px-3">
            <div className="flex items-center justify-between">
              {ticket.ticketNumber}

              <div title={ticket.priority}>
                <Circle
                  size={16}
                  className={`
                    ${
                      ticket.priority === "HIGH"
                        ? "text-red-900 fill-red-900"
                        : ticket.priority === "MEDIUM"
                        ? "text-yellow-500 fill-yellow-500"
                        : "text-green-900 fill-green-900"
                    }
                  `}
                />
              </div>

              {ticket.assignee === "unassigned" ? (
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center">
                    <User className="h-4 w-4 text-gray-500" />
                  </div>
                </div>
              ) : (
                assigneeMember && (
                  <div className="flex items-center gap-2">
                    <Avatar className="w-6 h-6">
                      <AvatarImage
                        src={assigneeMember.user.image?.replace("s96-c", "s400-c")}
                        className="object-cover"
                      />
                      <AvatarFallback className="text-xs">
                        {assigneeMember.user.name
                          ?.split(" ")
                          .map((n: string) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                )
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Ticket?</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{ticket.title}"? This action
              cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button
              variant="destructive"
              onClick={() => {
                handleDeleteTicket(ticket.id);
              }}
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default TicketCard;
