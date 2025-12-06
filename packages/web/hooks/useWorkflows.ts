import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";

export interface Workflow {
  id: string;
  name: string;
  description?: string;
  status: "DRAFT" | "ACTIVE" | "PAUSED" | "COMPLETED" | "FAILED" | "ARCHIVED";
  conditions: any[];
  actions: any[];
  safeAddress?: string;
  safeNetwork?: string;
  maxExecutions?: number;
  executionCount: number;
  createdAt: string;
  updatedAt: string;
  lastExecutedAt?: string;
  _count?: {
    executions: number;
  };
}

export interface CreateWorkflowInput {
  name: string;
  description?: string;
  conditions: any[];
  actions: any[];
  safeAddress?: string;
  safeNetwork?: string;
  maxExecutions?: number;
}

export interface UpdateWorkflowInput extends Partial<CreateWorkflowInput> {
  status?: Workflow["status"];
}

/**
 * Hook for managing workflows
 * Provides CRUD operations for workflows with React Query caching
 */
export function useWorkflows(status?: string) {
  const { data: session } = useSession();
  const queryClient = useQueryClient();

  // Fetch workflows
  const {
    data: workflows = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["workflows", status],
    queryFn: async () => {
      const url = status
        ? `/api/workflows?status=${status}`
        : "/api/workflows";
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error("Failed to fetch workflows");
      }
      
      const data = await response.json();
      return data.workflows as Workflow[];
    },
    enabled: !!session,
  });

  // Create workflow
  const createWorkflow = useMutation({
    mutationFn: async (workflow: CreateWorkflowInput) => {
      const response = await fetch("/api/workflows", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(workflow),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create workflow");
      }
      
      const data = await response.json();
      console.log("✅ Workflow created:", data.workflow.id);
      return data.workflow as Workflow;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workflows"] });
    },
  });

  // Update workflow
  const updateWorkflow = useMutation({
    mutationFn: async ({
      id,
      ...data
    }: UpdateWorkflowInput & { id: string }) => {
      const response = await fetch(`/api/workflows/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update workflow");
      }
      
      const result = await response.json();
      console.log("✅ Workflow updated:", id);
      return result.workflow as Workflow;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workflows"] });
    },
  });

  // Delete workflow
  const deleteWorkflow = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/workflows/${id}`, {
        method: "DELETE",
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to delete workflow");
      }
      
      console.log("✅ Workflow deleted:", id);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workflows"] });
    },
  });

  // Activate workflow
  const activateWorkflow = async (id: string) => {
    return updateWorkflow.mutateAsync({ id, status: "ACTIVE" });
  };

  // Pause workflow
  const pauseWorkflow = async (id: string) => {
    return updateWorkflow.mutateAsync({ id, status: "PAUSED" });
  };

  return {
    // Data
    workflows,
    
    // Loading states
    isLoading,
    isCreating: createWorkflow.isPending,
    isUpdating: updateWorkflow.isPending,
    isDeleting: deleteWorkflow.isPending,
    
    // Error states
    error,
    createError: createWorkflow.error,
    updateError: updateWorkflow.error,
    deleteError: deleteWorkflow.error,
    
    // Actions
    createWorkflow: createWorkflow.mutateAsync,
    updateWorkflow: updateWorkflow.mutateAsync,
    deleteWorkflow: deleteWorkflow.mutateAsync,
    activateWorkflow,
    pauseWorkflow,
    refetch,
  };
}

/**
 * Hook for fetching a single workflow by ID
 */
export function useWorkflow(id: string) {
  const { data: session } = useSession();

  const {
    data: workflow,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["workflow", id],
    queryFn: async () => {
      const response = await fetch(`/api/workflows/${id}`);
      
      if (!response.ok) {
        throw new Error("Failed to fetch workflow");
      }
      
      const data = await response.json();
      return data.workflow as Workflow & {
        executions: any[];
      };
    },
    enabled: !!session && !!id,
  });

  return {
    workflow,
    isLoading,
    error,
    refetch,
  };
}
