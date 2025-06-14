import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";


export function useProjects() {
  const queryClient = useQueryClient();

  const { data: projects, isLoading } = useQuery({
    queryKey: ["projects"],
    queryFn: async () => {
      const response = await axios.get("/api/projects");
      return response.data;
    },
  });

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
    projects,
    isLoading,
    createProject: createProjectMutation.mutate,
    isCreating: createProjectMutation.isPending,
    createError: createProjectMutation.error,
  };
} 