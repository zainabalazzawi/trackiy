"use client";

import { useState, useMemo } from "react";
import { useProjects } from "@/app/hooks/useProjects";
import { columns } from "./columns";
import { Project } from "@/app/types";
import { DataTable } from "./data-table";
import { Suspense } from "react";
import InviteHandler from "./InviteHandler";
import { LoadingState } from "../components/LoadingState";
import SearchInput from "../components/SearchInput";
import {
  MultiSelect,
  MultiSelectContent,
  MultiSelectGroup,
  MultiSelectItem,
  MultiSelectTrigger,
  MultiSelectValue,
} from "@/components/ui/multi-select";

const ProjectsPage = () => {
  const { projects, isLoading } = useProjects();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);

  // Filter projects by search query and type
  const filteredProjects = useMemo(() => {
    let filtered = projects || [];
    
    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((project: Project) => 
        project.name.toLowerCase().includes(query)
      );
    }
    
    // Filter by type
    if (selectedTypes.length > 0) {
      filtered = filtered.filter((project: Project) => 
        selectedTypes.includes(project.type)
      );
    }
    
    return filtered;
  }, [projects, searchQuery, selectedTypes]);

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
      <div className="mb-6 flex gap-6">
          <SearchInput
            placeholder="Search projects..."
            value={searchQuery}
            onChange={setSearchQuery}
          />
          <MultiSelect onValuesChange={setSelectedTypes} values={selectedTypes}>
            <MultiSelectTrigger className="w-[30%]">
              <MultiSelectValue placeholder="Filter by project types" />
            </MultiSelectTrigger>
            <MultiSelectContent>
              <MultiSelectGroup>
                <MultiSelectItem value="TEAM_MANAGED">Team-managed</MultiSelectItem>
                <MultiSelectItem value="COMPANY_MANAGED">Service-management</MultiSelectItem>
              </MultiSelectGroup>
            </MultiSelectContent>
          </MultiSelect>
      </div>
      
      <DataTable columns={columns} data={filteredProjects || []} />

      <Suspense fallback={null}>
        <InviteHandler />
      </Suspense>
    </div>
  );
};

export default ProjectsPage;
