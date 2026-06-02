"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import { useOrgStore } from "@/store/org.store";
import type { Project } from "@projectflow/types";

export function useProjects() {
  const orgId = useOrgStore((s) => s.activeOrgId);

  return useQuery({
    queryKey: ["projects", orgId],
    queryFn: async () => {
      const res = await api.get<Project[]>(`/orgs/${orgId}/projects`);
      return res.data;
    },
    enabled: !!orgId,
  });
}

export function useProject(projectId: string) {
  const orgId = useOrgStore((s) => s.activeOrgId);

  return useQuery({
    queryKey: ["project", orgId, projectId],
    queryFn: async () => {
      const res = await api.get<Project>(`/orgs/${orgId}/projects/${projectId}`);
      return res.data;
    },
    enabled: !!orgId && !!projectId,
  });
}

export function useCreateProject() {
  const orgId = useOrgStore((s) => s.activeOrgId);
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (data: { name: string; description?: string }) =>
      api.post<Project>(`/orgs/${orgId}/projects`, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["projects", orgId] }),
  });
}
