import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { Project } from "@/app/types";

// Hook to get all projects
export function useProjects() {
  const { data: projects, isLoading } = useQuery({
    queryKey: ["projects"],
    queryFn: async () => {
      const response = await axios.get("/api/projects");
      return response.data;
    },
  });

  return {
    projects,
    isLoading,
  };
}

// Hook to get a single project by ID
export function useProject(projectId: string) {
  const { data: project, isLoading } = useQuery<Project>({
    queryKey: ["project", projectId],
    queryFn: async () => {
      const response = await axios.get(`/api/projects/${projectId}`);
      return response.data;
    },
    enabled: !!projectId,
  });

  return {
    project,
    isLoading,
  };
}

// Hook to create a new project
export function useCreateProject() {
  const queryClient = useQueryClient();

  const createProjectMutation = useMutation({
    mutationFn: async (projectData: {
      name: string;
      key: string;
      type: "TEAM_MANAGED" | "COMPANY_MANAGED";
      template: "KANBAN" | "CUSTOMER_SERVICE";
      category: "SOFTWARE" | "SERVICE";
      memberIds?: string[];
    }) => {
      const response = await axios.post("/api/projects", projectData);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
  });

  return {
    createProject: createProjectMutation.mutate,
    isCreating: createProjectMutation.isPending,
    createError: createProjectMutation.error,
  };
}

// Hook to delete a project
export function useDeleteProject() {
  const queryClient = useQueryClient();

  const deleteProjectMutation = useMutation({
    mutationFn: async (projectId: string) => {
      const response = await axios.delete(`/api/projects/${projectId}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
  });

  return {
    deleteProject: deleteProjectMutation.mutate,
    isDeleting: deleteProjectMutation.isPending,
    deleteError: deleteProjectMutation.error,
  };
}

export function useProjectMembers(projectId: string) {
  const { data: members, isLoading } = useQuery({
    queryKey: ["project-members", projectId],
    queryFn: async () => {
      const response = await axios.get(`/api/projects/${projectId}/members`);
      return response.data;
    },
  });

  return {
    members: members || [],
  };
} 