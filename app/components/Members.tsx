import { useProjectMembers } from "@/app/hooks/useProjects";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ProjectMember } from "../types";

interface MemberProps {
  projectId: string;
}
export default function Members({ projectId }: MemberProps) {
  const { members } = useProjectMembers(projectId);

  return (
    <div className="flex items-center">
      {members.slice(0, 5).map((member: ProjectMember) => (
        <Avatar key={member.id}>
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
