"use client";

import { useState, useMemo } from "react";
import { useAllTickets } from "@/app/hooks/useTickets";
import { useProjects } from "@/app/hooks/useProjects";
import { columns } from "./columns";
import { DataTable } from "@/app/projects/data-table";
import { LoadingState } from "@/app/components/LoadingState";
import { FilterBar } from "@/app/components/FilterBar";
import { Star, ArrowLeft } from "lucide-react";
import { Ticket, PRIORITIES } from "@/app/types";
import { useAllStatuses } from "../hooks/useStatuses";
import { getAssigneeName } from "@/lib/utils";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const ItemsPage = () => {
  const { tickets, isLoading: ticketsLoading } = useAllTickets();
  const { projects, isLoading: projectsLoading } = useProjects();
  const { allStatuses, isLoading: statusesLoading } = useAllStatuses();

  // Remove duplicates using Set
  const uniqueNames = [...new Set(allStatuses.map((s) => s.name))];
  const statuses = uniqueNames.map(
    (name) => allStatuses.find((s) => s.name === name)!
  );
  // Simple assignees - get unique assignee IDs and convert to names
  const assignees = [
    ...new Set(
      tickets?.flatMap((ticket) => ticket.assignee)
    ),
  ].map(assigneeId => getAssigneeName(assigneeId, projects || [])) 
   .sort();

  // Get unique labels from tickets
  const labels = [
    ...new Set(
      tickets?.flatMap((ticket) => ticket.labels || [])
    ),
  ].sort();

  
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProjects, setSelectedProjects] = useState<string[]>([]);
  const [selectedAssignees, setSelectedAssignees] = useState<string[]>([]);
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [selectedPriorities, setSelectedPriorities] = useState<string[]>([]);
  const [selectedLabels, setSelectedLabels] = useState<string[]>([]);

  // Simple filtering without excessive useMemo
  const filteredItems = useMemo(() => {
    let filtered = tickets || [];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (ticket: Ticket) =>
          ticket.title.toLowerCase().includes(query) ||
          ticket.ticketNumber.toLowerCase().includes(query)
      );
    }

    // Project filter
    if (selectedProjects.length > 0) {
      filtered = filtered.filter((ticket: Ticket) =>
        selectedProjects.includes(ticket.column.project.id)
      );
    }

    // Assignee filter
    if (selectedAssignees.length > 0) {
      filtered = filtered.filter((ticket: Ticket) => {
        const assigneeName = getAssigneeName(ticket.assignee, projects || []);
        return selectedAssignees.includes(assigneeName);
      });
    }

    // Status filter
    if (selectedStatuses.length > 0) {
      filtered = filtered.filter((ticket: Ticket) => {
        const statusName =
          typeof ticket.status === "object"
            ? ticket.status.name
            : ticket.status;
        return selectedStatuses.includes(statusName);
      });
    }

    // Priority filter
    if (selectedPriorities.length > 0) {
      filtered = filtered.filter((ticket: Ticket) =>
        selectedPriorities.includes(ticket.priority)
      );
    }

    // Label filter
    if (selectedLabels.length > 0) {
      filtered = filtered.filter((ticket: Ticket) =>
        ticket.labels && ticket.labels.some(label => selectedLabels.includes(label))
      );
    }

    return filtered;
  }, [
    tickets,
    projects,
    searchQuery,
    selectedProjects,
    selectedAssignees,
    selectedStatuses,
    selectedPriorities,
    selectedLabels,
  ]);

  if (ticketsLoading || projectsLoading || statusesLoading) {
    return <LoadingState text="Loading work items" iconSize={64} />;
  }


  console.log('selectedAssignees',selectedAssignees)
  return (
    <>
       <Button variant="outline" asChild className="mt-4">
          <Link href="/" className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to project page
          </Link>
        </Button>
    <div className="px-5 py-4">
      <div className="mb-6 flex items-center gap-2">
        <h1 className="text-2xl font-medium">All work items</h1>
        <Star className="h-5 w-5 text-gray-400 cursor-pointer hover:text-yellow-500" />
      </div>

      {/* Filters */}
      <FilterBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        projects={projects || []}
        selectedProjects={selectedProjects}
        onProjectsChange={setSelectedProjects}
        assignees={assignees}
        selectedAssignees={selectedAssignees}
        onAssigneesChange={setSelectedAssignees}
        statuses={statuses}
        selectedStatuses={selectedStatuses}
        onStatusesChange={setSelectedStatuses}
        priorities={PRIORITIES}
        selectedPriorities={selectedPriorities}
        onPrioritiesChange={setSelectedPriorities}
        labels={labels || []}
        selectedLabels={selectedLabels}
        onLabelsChange={setSelectedLabels}
      />
      {/* Data Table */}
      <DataTable columns={columns} data={filteredItems} />
    </div>
    </>
  );
};

export default ItemsPage;
