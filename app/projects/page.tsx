"use client";

import { useProjects } from "@/app/hooks/useProjects";
import { columns } from "./columns";
import { DataTable } from "./data-table";
import { Suspense } from "react";
import InviteHandler from "./InviteHandler";

const ProjectsPage = () => {
  const { projects, isLoading } = useProjects();

  if (isLoading) return <div className="p-6">Loading...</div>;

  return (
    <div className="container mx-auto py-10">
      <DataTable columns={columns} data={projects || []} />
      
      <Suspense fallback={null}>
        <InviteHandler />
      </Suspense>
    </div>
  );
};

export default ProjectsPage; 