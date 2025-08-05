import { useProjectMembers } from "@/app/hooks/useProjects";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ProjectMember } from "../types";
import { cn } from "@/lib/utils";

interface MemberProps {
  projectId: string;
  selectedMemberId?: string | null;
  onMemberSelect?: (memberId: string | null) => void;
}

export default function Members({ 
  projectId, 
  selectedMemberId, 
  onMemberSelect 
}: MemberProps) {
  const { members } = useProjectMembers(projectId);

  const handleMemberClick = (memberId: string) => {
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
            selectedMemberId === member.id && "ring-2 ring-blue-950"
          )}
          onClick={() => handleMemberClick(member.id)}
        >
          <AvatarImage
            src={member.image?.replace("s96-c", "s400-c")}
            className="object-cover"
          />
          <AvatarFallback className="text-xs bg-gray-200 text-gray-600">
            {member.name
              ?.split(" ")
              .map((n: string) => n[0])
              .join("")}
          </AvatarFallback>
        </Avatar>
      ))}
    </div>
  );
}
// add + in case there is more members
