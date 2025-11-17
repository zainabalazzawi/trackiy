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
    <div className="px-4 sm:px-6 lg:px-8 py-8 mx-auto space-y-6 bg-gradient-to-br from-slate-50 to-white min-h-screen">
      <div className="flex flex-col sm:flex-row gap-4 bg-gradient-to-br from-white to-slate-50/50 p-5  shadow-md border border-slate-200/80">
        <SearchInput
          placeholder="Search projects..."
          value={searchQuery}
          onChange={setSearchQuery}
        />
        <MultiSelect onValuesChange={setSelectedTypes} values={selectedTypes}>
          <MultiSelectTrigger className="sm:w-[280px] border-slate-300 hover:border-[#649C9E] transition-colors">
            <MultiSelectValue placeholder="Filter by project types" />
          </MultiSelectTrigger>
          <MultiSelectContent className="shadow-lg">
            <MultiSelectGroup>
              <MultiSelectItem value="TEAM_MANAGED">Team-managed</MultiSelectItem>
              <MultiSelectItem value="COMPANY_MANAGED">Service-management</MultiSelectItem>
            </MultiSelectGroup>
          </MultiSelectContent>
        </MultiSelect>
      </div>
      
      <div className="bg-gradient-to-br from-white to-slate-50/30  shadow-lg border border-slate-200/80 overflow-hidden">
        <DataTable columns={columns} data={filteredProjects || []} />
      </div>

      <Suspense fallback={null}>
        <InviteHandler />
      </Suspense>
    </div>
  );
};

export default ProjectsPage;
