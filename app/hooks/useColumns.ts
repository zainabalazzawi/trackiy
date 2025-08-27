import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { Column } from "@/app/types";

// Hook to get columns for a project
export function useColumns(projectId: string) {
  const { data: columns = [], isLoading } = useQuery<Column[]>({
    queryKey: ["columns", projectId],
    queryFn: async () => {
      const response = await axios.get(`/api/projects/${projectId}/columns`);
      return response.data;
    },
    enabled: !!projectId,
  });

  return {
    columns,
    isLoading,
  };
}

// Hook to create a new column
export function useCreateColumn(projectId: string) {
  const queryClient = useQueryClient();

  const createColumnMutation = useMutation({
    mutationFn: async (name: string) => {
      const response = await axios.post(`/api/projects/${projectId}/columns`, {
        name,
        projectId,
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["columns", projectId] });
    },
  });

  return {
    createColumn: createColumnMutation.mutate,
    isCreating: createColumnMutation.isPending,
    createError: createColumnMutation.error,
  };
}

// Hook to update a column
export function useUpdateColumn(projectId: string) {
  const queryClient = useQueryClient();

  const updateColumnMutation = useMutation({
    mutationFn: async ({ id, name }: { id: string; name: string }) => {
      const response = await axios.patch(`/api/projects/${projectId}/columns`, {
        id,
        name,
        status: name,
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["columns", projectId] });
    },
  });

  return {
    updateColumn: updateColumnMutation.mutate,
    isUpdating: updateColumnMutation.isPending,
    updateError: updateColumnMutation.error,
  };
}

// Hook to delete a column
export function useDeleteColumn(projectId: string) {
  const queryClient = useQueryClient();

  const deleteColumnMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await axios.delete(`/api/projects/${projectId}/columns`, {
        data: { id },
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["columns", projectId] });
    },
  });

  return {
    deleteColumn: deleteColumnMutation.mutate,
    isDeleting: deleteColumnMutation.isPending,
    deleteError: deleteColumnMutation.error,
  };
}


