"use client";

import { useProjects } from "@/app/hooks/useProjects";
import { columns } from "./columns";
import { DataTable } from "./data-table";
import { Suspense } from "react";
import InviteHandler from "./InviteHandler";
import { LoadingState } from "../components/LoadingState";

const ProjectsPage = () => {
  const { projects, isLoading } = useProjects();

  if (isLoading)
    return (
        <LoadingState
          text="Loading projects list"
          iconSize={64}
          className="animate-spin text-[#649C9E]"
        />
    );

  return (
    <div className="px-5 py-10">
      <DataTable columns={columns} data={projects || []} />

      <Suspense fallback={null}>
        <InviteHandler />
      </Suspense>
    </div>
  );
};

export default ProjectsPage;
