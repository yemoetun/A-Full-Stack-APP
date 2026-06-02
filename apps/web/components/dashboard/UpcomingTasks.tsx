"use client";

import { useQuery } from "@tanstack/react-query";
import { Calendar } from "lucide-react";
import Link from "next/link";
import { api } from "@/lib/api-client";
import { useOrgStore } from "@/store/org.store";
import { formatDate } from "@/lib/utils";
import type { Task } from "@projectflow/types";

export function UpcomingTasks() {
  const orgId = useOrgStore((s) => s.activeOrgId);

  const { data: tasks = [], isLoading } = useQuery({
    queryKey: ["upcoming-tasks", orgId],
    queryFn: async () => {
      const projectsRes = await api.get<any[]>(`/orgs/${orgId}/projects`);
      const projects = projectsRes.data.filter((p: any) => p.status === "active");

      const allTasks: (Task & { projectId: string })[] = [];
      await Promise.all(
        projects.map(async (p: any) => {
          const res = await api.get<Task[]>(`/orgs/${orgId}/projects/${p.id}/tasks`);
          allTasks.push(...res.data.map((t) => ({ ...t, projectId: p.id })));
        })
      );

      const now = new Date();
      const weekEnd = new Date();
      weekEnd.setDate(now.getDate() + 7);

      return allTasks
        .filter((t) => {
          if (!t.dueDate || t.status === "done") return false;
          const due = new Date(t.dueDate);
          return due >= now && due <= weekEnd;
        })
        .sort((a, b) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime())
        .slice(0, 5);
    },
    enabled: !!orgId,
  });

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <h3 className="font-semibold text-gray-900 mb-4">Due This Week</h3>
      {isLoading ? (
        <div className="space-y-2">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-10 bg-gray-100 rounded animate-pulse" />
          ))}
        </div>
      ) : tasks.length === 0 ? (
        <p className="text-sm text-gray-400 py-4 text-center">Nothing due this week 🎉</p>
      ) : (
        <div className="space-y-2">
          {tasks.map((task: any) => (
            <Link
              key={task.id}
              href={`/projects/${task.projectId}`}
              className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer"
            >
              <div className={`w-2 h-2 rounded-full shrink-0 ${
                task.priority === "urgent" ? "bg-red-400" :
                task.priority === "high" ? "bg-orange-400" :
                task.priority === "medium" ? "bg-yellow-400" : "bg-gray-300"
              }`} />
              <p className="flex-1 text-sm text-gray-700 truncate">{task.title}</p>
              <span className="flex items-center gap-1 text-xs text-gray-400 shrink-0">
                <Calendar className="w-3 h-3" />
                {formatDate(task.dueDate!)}
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
