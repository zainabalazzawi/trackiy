import { useProjectMembers } from "@/app/hooks/useProjects";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ProjectMember, MemberSelection } from "../types";
import { cn } from "@/lib/utils";
import { User } from "lucide-react";

interface MemberProps {
  projectId: string;
  selectedMemberId?: MemberSelection;
  onMemberSelect?: (memberId: MemberSelection) => void;
}

export default function Members({ 
  projectId, 
  selectedMemberId, 
  onMemberSelect 
}: MemberProps) {
  const { members } = useProjectMembers(projectId);

  const handleMemberClick = (memberId: MemberSelection) => {
    if (!onMemberSelect) return;
    
    // Toggle selection: if already selected, deselect; otherwise select
    const newSelection = selectedMemberId === memberId ? null : memberId;
    onMemberSelect(newSelection);
  };

  return (
    <div className="flex items-center">
      {members.slice(0, 5).map((member: ProjectMember) => (
        <Avatar 
          key={member.id}
          className={cn(
            "cursor-pointer transition-all hover:scale-105",
            selectedMemberId === member.user.id && "ring-2 ring-blue-950"
          )}
          onClick={() => handleMemberClick(member.user.id)}
        >
          <AvatarImage
            src={member.user.image?.replace("s96-c", "s400-c")}
            className="object-cover"
          />
          <AvatarFallback className="text-xs bg-gray-200 text-gray-600">
            {member.user.name
              ?.split(" ")
              .map((n: string) => n[0])
              .join("")}
          </AvatarFallback>
        </Avatar>
      ))}
      
      <Avatar 
        className={cn(
          "cursor-pointer transition-all hover:scale-105",
          selectedMemberId === "unassigned" && "ring-2 ring-blue-950"
        )}
        onClick={() => handleMemberClick("unassigned")}
      >
        <AvatarFallback className="text-xs bg-gray-200 text-gray-600">
          <User className="h-4 w-4 text-gray-500" />
        </AvatarFallback>
      </Avatar>
    </div>
  );
}
// add + in case there is more members
