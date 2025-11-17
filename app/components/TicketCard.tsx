import { Ticket } from "../types";
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
import { Badge } from "@/components/ui/badge";
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

  const handleCardClick = () => {
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
          transition-all
          duration-200
          ${isCurrentlyDragging ? "opacity-50 scale-95" : "opacity-100 scale-100"}
        `}
      >
        <Card
          className="
            hover:shadow-xl 
            hover:scale-[1.03]
            hover:border-[#649C9E]/50
            hover:shadow-primary
            transition-all
            duration-300
            cursor-pointer
            py-2 px-0
            bg-gradient-to-br from-white to-slate-50/30
            border-slate-200
            shadow-md
            backdrop-blur-sm"
          onClick={handleCardClick}
        >
          <CardHeader className="pb-2 px-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent line-clamp-2">{ticket.title}</CardTitle>
              <DropdownMenu >
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="pt-0 hover:bg-slate-100 rounded-lg h-8 w-8">
                    <MoreHorizontal size={18} className="text-slate-600" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48 shadow-lg border-slate-200">
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation();
                      setOpen(true);
                    }}
                    className="text-red-600 hover:bg-red-50 cursor-pointer"
                  >
                    <Trash2 className="mr-2 text-red-600" size={16} />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </CardHeader>
          <CardContent className="px-3">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Badge variant="secondary" className="text-xs font-medium text-slate-600">
                  {ticket.ticketNumber}
                </Badge>

                <div title={ticket.priority} className="flex items-center gap-1">
                  <Circle
                    size={14}
                    className={`
                      ${
                        ticket.priority === "HIGH"
                          ? "text-red-500 fill-red-500"
                          : ticket.priority === "MEDIUM"
                          ? "text-amber-500 fill-amber-500"
                          : "text-emerald-500 fill-emerald-500"
                      }
                    `}
                  />
                </div>

                {ticket.assignee === "unassigned" ? (
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-slate-200 flex items-center justify-center shadow-sm">
                      <User className="h-4 w-4 text-slate-500" />
                    </div>
                  </div>
                ) : (
                  assigneeMember && (
                    <div className="flex items-center gap-2">
                      <Avatar className="w-7 h-7 border-2 border-white shadow-sm">
                        <AvatarImage
                          src={assigneeMember.user.image?.replace("s96-c", "s400-c")}
                          className="object-cover"
                        />
                        <AvatarFallback className="text-xs bg-gradient-to-br from-[#649C9E] to-[#527f81] text-white">
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
              {ticket.labels && ticket.labels.length > 0 && (
                <div className="flex justify-start gap-1.5 flex-wrap">
                  {ticket.labels.slice(0, 2).map((label) => (
                    <Badge key={label} variant="secondary" className="text-xs bg-gradient-to-r from-[#649C9E]/15 to-[#527f81]/10 text-[#649C9E] hover:from-[#649C9E]/25 hover:to-[#527f81]/20 border border-[#649C9E]/30 shadow-sm transition-all">
                      {label}
                    </Badge>
                  ))}
                  {ticket.labels.length > 2 && (
                    <Badge variant="secondary" className="text-xs bg-gradient-to-r from-slate-100 to-slate-50 text-slate-700 border border-slate-200 shadow-sm">
                      +{ticket.labels.length - 2}
                    </Badge>
                  )}
                </div>
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
              Are you sure you want to delete &quot;{ticket.title}&quot;? This action
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
