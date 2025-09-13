import React from 'react';
import SearchInput from '@/app/components/SearchInput';
import {
  MultiSelect,
  MultiSelectContent,
  MultiSelectGroup,
  MultiSelectItem,
  MultiSelectTrigger,
  MultiSelectValue,
} from '@/components/ui/multi-select';
import { Project, Status } from '@/app/types';

interface FilterBarProps {
  searchQuery: string;
  onSearchChange: (search: string) => void;
  projects: Project[];
  selectedProjects: string[];
  onProjectsChange: (projects: string[]) => void;
  assignees: string[];
  selectedAssignees: string[];
  onAssigneesChange: (assignees: string[]) => void;
  statuses: Status[];
  selectedStatuses: string[];
  onStatusesChange: (statuses: string[]) => void;
  priorities: string[];
  selectedPriorities: string[];
  onPrioritiesChange: (priorities: string[]) => void;
}

export function FilterBar({
  searchQuery,
  onSearchChange,
  projects,
  selectedProjects,
  onProjectsChange,
  assignees,
  selectedAssignees,
  onAssigneesChange,
  statuses,
  selectedStatuses,
  onStatusesChange,
  priorities,
  selectedPriorities,
  onPrioritiesChange,
}: FilterBarProps) {
  return (
    <div className="mb-6 flex gap-4">
      {/* Search */}
      <SearchInput
        placeholder="Search work"
        value={searchQuery}
        onChange={onSearchChange}
      />

      {/* Project Filter */}
      <MultiSelect
        onValuesChange={onProjectsChange}
        values={selectedProjects}
      >
        <MultiSelectTrigger>
          <MultiSelectValue placeholder="Project" />
        </MultiSelectTrigger>
        <MultiSelectContent>
          <MultiSelectGroup>
            {projects?.map((project: Project) => (
              <MultiSelectItem key={project.id} value={project.id}>
                {project.name}
              </MultiSelectItem>
            ))}
          </MultiSelectGroup>
        </MultiSelectContent>
      </MultiSelect>

      {/* Assignee Filter */}
      <MultiSelect
        onValuesChange={onAssigneesChange}
        values={selectedAssignees}
      >
        <MultiSelectTrigger>
          <MultiSelectValue placeholder="Assignee" />
        </MultiSelectTrigger>
        <MultiSelectContent>
          <MultiSelectGroup>
            {assignees.map((assignee) => (
              <MultiSelectItem key={assignee} value={assignee}>
                {assignee}
              </MultiSelectItem>
            ))}
          </MultiSelectGroup>
        </MultiSelectContent>
      </MultiSelect>

      {/* Status Filter */}
      <MultiSelect
        onValuesChange={onStatusesChange}
        values={selectedStatuses}
      >
        <MultiSelectTrigger>
          <MultiSelectValue placeholder="Status" />
        </MultiSelectTrigger>
        <MultiSelectContent>
          <MultiSelectGroup>
            {statuses.map((status) => (
              <MultiSelectItem key={status.id} value={status.name}>
                {status.name}
              </MultiSelectItem>
            ))}
          </MultiSelectGroup>
        </MultiSelectContent>
      </MultiSelect>

      {/* Priority Filter */}
      <MultiSelect
        onValuesChange={onPrioritiesChange}
        values={selectedPriorities}
      >
        <MultiSelectTrigger>
          <MultiSelectValue placeholder="Priority" />
        </MultiSelectTrigger>
        <MultiSelectContent>
          <MultiSelectGroup>
            {priorities.map((priority) => (
              <MultiSelectItem key={priority} value={priority}>
                {priority}
              </MultiSelectItem>
            ))}
          </MultiSelectGroup>
        </MultiSelectContent>
      </MultiSelect>
    </div>
  );
}
