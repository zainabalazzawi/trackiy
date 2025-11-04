"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { X } from "lucide-react";
import { useRouter } from "next/navigation";
import useRecentProjectsStore from "@/app/stores/recentProjectsStore";

interface RecentProject {
  id: string;
  name: string;
  key: string;
  type: string;
  lastViewed: string;
}

interface RecentProjectsCardProps {
  isOpen: boolean;
  onClose: () => void;
}

const RecentProjectsCard = ({ isOpen, onClose }: RecentProjectsCardProps) => {
  const router = useRouter();
  const recentProjects = useRecentProjectsStore((state) => state.recentProjects);

  const handleProjectClick = (project: RecentProject) => {
    router.push(`/projects/${project.id}`);
    onClose();
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60)
    );

    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  if (!isOpen) return null;

  return (
    <Card className="absolute left-[15.5rem] top-20 w-80 p-0 gap-0">
      <CardHeader className="flex flex-row items-center justify-between p-2 py-0">
        <CardTitle className="text-[14px] font-semibold">Recent</CardTitle>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="p-0">
        {recentProjects.map((project: RecentProject) => (
          <div
            key={project.id}
            className="flex items-center justify-between p-2 text-gray-500 text-xs hover:bg-gray-50 cursor-pointer"
            onClick={() => handleProjectClick(project)}
          >
            <div>
              <h4 className="font-medium text-sm text-black">{project.name}</h4>
              <p>{project.key}</p>
            </div>
            <span>{formatTimeAgo(project.lastViewed)}</span>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default RecentProjectsCard;
