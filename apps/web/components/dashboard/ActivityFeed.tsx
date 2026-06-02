"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { api } from "@/lib/api-client";
import { useOrgStore } from "@/store/org.store";
import { formatRelative } from "@/lib/utils";

const STATUS_COLORS: Record<string, string> = {
  done:        "bg-green-100 text-green-700",
  in_progress: "bg-yellow-100 text-yellow-700",
  in_review:   "bg-purple-100 text-purple-700",
  todo:        "bg-blue-100 text-blue-700",
  backlog:     "bg-gray-100 text-gray-500",
};

export function ActivityFeed() {
  const orgId = useOrgStore((s) => s.activeOrgId);

  const { data: activities = [], isLoading } = useQuery({
    queryKey: ["activity", orgId],
    queryFn: async () => {
      const projectsRes = await api.get<any[]>(`/orgs/${orgId}/projects`);
      const projects = projectsRes.data.filter((p: any) => p.status === "active");

      const allTasks: any[] = [];
      await Promise.all(
        projects.map(async (p: any) => {
          const res = await api.get<any[]>(`/orgs/${orgId}/projects/${p.id}/tasks`);
          allTasks.push(...res.data.map((t: any) => ({ ...t, projectName: p.name, projectId: p.id })));
        })
      );

      return allTasks
        .sort((a, b) =>
          new Date(b.updatedAt || b.createdAt).getTime() -
          new Date(a.updatedAt || a.createdAt).getTime()
        )
        .slice(0, 8);
    },
    enabled: !!orgId,
  });

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <h3 className="font-semibold text-gray-900 mb-4">Recent Activity</h3>
      {isLoading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex gap-3">
              <div className="w-7 h-7 rounded-full bg-gray-100 shrink-0 animate-pulse" />
              <div className="flex-1 space-y-1.5">
                <div className="h-3.5 bg-gray-100 rounded w-48 animate-pulse" />
                <div className="h-2.5 bg-gray-50 rounded w-24 animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      ) : activities.length === 0 ? (
        <p className="text-sm text-gray-400 py-4 text-center">No recent activity</p>
      ) : (
        <div className="space-y-3">
          {activities.map((task) => (
            <Link key={task.id} href={`/projects/${task.projectId}`} className="flex gap-3 hover:bg-gray-50 rounded-lg p-1 -m-1 transition-colors">
              <span className={`text-xs px-1.5 py-0.5 rounded font-medium shrink-0 h-fit mt-0.5 ${STATUS_COLORS[task.status] ?? "bg-gray-100 text-gray-500"}`}>
                {task.status.replace("_", " ")}
              </span>
              <div>
                <p className="text-sm text-gray-800 font-medium leading-snug">{task.title}</p>
                <p className="text-xs text-gray-400 mt-0.5">
                  {task.projectName} · {formatRelative(task.updatedAt || task.createdAt)}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
