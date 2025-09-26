"use client";

import { Button } from "@/components/ui/button";
import { Clock, X } from "lucide-react";
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
    <div className="absolute left-64 top-20 w-80 bg-white shadow-lg">
      <div className="flex flex-col">
        <div className="p-4 border-b flex items-center justify-between">
          <h2 className="text-[14px] font-semibold">Recent</h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        {recentProjects.map((project: RecentProject) => (
          <div
            key={project.id}
            className="flex items-center justify-between p-4 text-gray-500 text-xs hover:bg-gray-50 rounded cursor-pointer"
            onClick={() => handleProjectClick(project)}
          >
            <div>
              <h4 className="font-medium text-sm text-black">{project.name}</h4>
              <p>{project.key}</p>
            </div>
            <span>{formatTimeAgo(project.lastViewed)}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecentProjectsCard;
