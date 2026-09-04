import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { Status } from "@/app/types";

// Hook to get statuses for a project
export function useStatuses(projectId: string) {
  const { data: statuses = [], isLoading } = useQuery<Status[]>({
    queryKey: ["statuses", projectId],
    queryFn: async () => {
      const response = await axios.get(`/api/projects/${projectId}/statuses`);
      return response.data;
    },
    enabled: !!projectId,
  });

  return {
    statuses,
    isLoading,
  };
}

export const useAllStatuses = () => {
  const { data: allStatuses = [], isLoading } = useQuery<Status[]>({
    queryKey: ["all-statuses"],
    queryFn: async () => {
      const response = await axios.get(`/api/statuses`);
      return response.data;
    },
  });

  return {
    allStatuses,
    isLoading,
  };
};
