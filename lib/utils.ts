import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { ProjectMember, Project } from "@/app/types"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return '';

  return new Intl.DateTimeFormat('en-US', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  }).format(date).replace(',', '');
};

// Utility function to find a member by user ID from an array of members
export const findMemberById = (members: ProjectMember[], userId: string): ProjectMember | undefined => {
  return members.find((member: ProjectMember) => member?.user.id === userId);
};

// Utility function to get assignee display name from assignee ID
export const getAssigneeName = (assigneeId: string | undefined, projects: Project[]): string => {
  
  const userName = projects
    ?.flatMap((project: Project) => project.members || [])
    .find((member: ProjectMember) => member?.user.id === assigneeId);
  
  return userName?.user.name || "Unassigned";
};
