"use client";

import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import Board from "@/app/components/Board";
import { Project } from "@prisma/client";
import { use } from "react";

export default function ProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  
  const { data: project, isLoading } = useQuery<Project>({
    queryKey: ["project", resolvedParams.id],
    queryFn: async () => {
      const response = await axios.get(`/api/projects/${resolvedParams.id}`);
      return response.data;
    },
  });

  if (isLoading) return <div className="p-6">Loading...</div>;
  if (!project) return <div className="p-6">Project not found</div>;

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">{project.name}</h1>
        <p className="text-gray-600">Key: {project.key}</p>
      </div>
      <Board projectId={resolvedParams.id} />
    </div>
  );
}