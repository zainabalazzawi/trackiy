import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { Project } from "@/app/types";
import { hasPermission, type Permission } from "@/lib/permissions";

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
    mutationFn: async (projectData: { name: string; key: string }) => {
      const response = await axios.post("/api/projects", projectData);
      return response.data as Project;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
  });

  return {
    createProject: createProjectMutation.mutateAsync,
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
  const { data: members } = useQuery({
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

export function useProjectPermissions(projectId: string) {
  const { project } = useProject(projectId);
  const role = project?.currentUserRole ?? null;

  const can = (permission: Permission) => hasPermission(role, permission);

  return {
    role,
    canView: can("view"),
    canEditTickets: can("edit_ticket"),
    canManageMembers: can("manage_members"),
    canManageColumns: can("manage_columns"),
    canDeleteProject: can("delete_project"),
  };
}