"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import { useOrgStore } from "@/store/org.store";
import type { Task } from "@projectflow/types";

export function useTasks(projectId: string) {
  const orgId = useOrgStore((s) => s.activeOrgId);

  return useQuery({
    queryKey: ["tasks", orgId, projectId],
    queryFn: async () => {
      const res = await api.get<Task[]>(`/orgs/${orgId}/projects/${projectId}/tasks`);
      return res.data;
    },
    enabled: !!orgId && !!projectId,
  });
}

export function useCreateTask(projectId: string) {
  const orgId = useOrgStore((s) => s.activeOrgId);
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<Task>) =>
      api.post<Task>(`/orgs/${orgId}/projects/${projectId}/tasks`, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["tasks", orgId, projectId] }),
  });
}

export function useMoveTask(projectId: string) {
  const orgId = useOrgStore((s) => s.activeOrgId);
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ taskId, status, position }: { taskId: string; status: string; position: number }) =>
      api.patch<Task>(`/orgs/${orgId}/projects/${projectId}/tasks/${taskId}/move`, { status, position }),
    onMutate: async ({ taskId, status, position }) => {
      await qc.cancelQueries({ queryKey: ["tasks", orgId, projectId] });
      const prev = qc.getQueryData<Task[]>(["tasks", orgId, projectId]);
      qc.setQueryData<Task[]>(["tasks", orgId, projectId], (old = []) =>
        old.map((t) => t.id === taskId ? { ...t, status: status as Task["status"], position } : t)
      );
      return { prev };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev) qc.setQueryData(["tasks", orgId, projectId], ctx.prev);
    },
    onSettled: () => qc.invalidateQueries({ queryKey: ["tasks", orgId, projectId] }),
  });
}
