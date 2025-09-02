"use client";

import { useState, useMemo } from "react";
import { useProjects } from "@/app/hooks/useProjects";
import { columns, Project } from "./columns";
import { DataTable } from "./data-table";
import { Suspense } from "react";
import InviteHandler from "./InviteHandler";
import { LoadingState } from "../components/LoadingState";
import SearchInput from "../components/SearchInput";

const ProjectsPage = () => {
  const { projects, isLoading } = useProjects();
  const [searchQuery, setSearchQuery] = useState("");

  const filteredProjects = useMemo(() => {
    const query = searchQuery.toLowerCase();
    return projects?.filter((project: Project) => 
      project.name.toLowerCase().includes(query)
    );
  }, [projects, searchQuery]);

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
      <div className="mb-6">
        <SearchInput
          placeholder="Search projects..."
          value={searchQuery}
          onChange={setSearchQuery}
        />
      </div>
      
      <DataTable columns={columns} data={filteredProjects || []} />

      <Suspense fallback={null}>
        <InviteHandler />
      </Suspense>
    </div>
  );
};

export default ProjectsPage;
