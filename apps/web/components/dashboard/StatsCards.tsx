"use client";

import { useQuery } from "@tanstack/react-query";
import { FolderKanban, CheckSquare, Clock, Users } from "lucide-react";
import { api } from "@/lib/api-client";
import { useOrgStore } from "@/store/org.store";
import { useProjects } from "@/hooks/useProjects";

export function StatsCards() {
  const orgId = useOrgStore((s) => s.activeOrgId);
  const { data: projects = [] } = useProjects();
  const activeProjects = projects.filter((p) => p.status === "active").length;

  const { data: stats } = useQuery({
    queryKey: ["dashboard-stats", orgId, projects.length],
    queryFn: async () => {
      const activeOnes = projects.filter((p) => p.status === "active");
      const [membersRes, ...taskResults] = await Promise.all([
        api.get<any[]>(`/orgs/${orgId}/members`),
        ...activeOnes.map((p) => api.get<any[]>(`/orgs/${orgId}/projects/${p.id}/tasks`)),
      ]);

      const allTasks = taskResults.flatMap((r) => r.data);
      const openTasks = allTasks.filter((t) => t.status !== "done").length;

      const now = new Date();
      const weekEnd = new Date();
      weekEnd.setDate(now.getDate() + 7);
      const dueThisWeek = allTasks.filter((t) => {
        if (!t.dueDate || t.status === "done") return false;
        const due = new Date(t.dueDate);
        return due >= now && due <= weekEnd;
      }).length;

      return { openTasks, dueThisWeek, members: membersRes.data.length };
    },
    enabled: !!orgId && projects.length > 0,
  });

  const cards = [
    { label: "Active Projects", value: activeProjects,       icon: FolderKanban, color: "text-blue-600 bg-blue-50" },
    { label: "Open Tasks",      value: stats?.openTasks ?? "—",    icon: CheckSquare,  color: "text-yellow-600 bg-yellow-50" },
    { label: "Due This Week",   value: stats?.dueThisWeek ?? "—",  icon: Clock,        color: "text-red-600 bg-red-50" },
    { label: "Team Members",    value: stats?.members ?? "—",      icon: Users,        color: "text-green-600 bg-green-50" },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map(({ label, value, icon: Icon, color }) => (
        <div key={label} className="bg-white rounded-xl border border-gray-200 p-5">
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${color}`}>
            <Icon className="w-5 h-5" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          <p className="text-sm text-gray-500 mt-1">{label}</p>
        </div>
      ))}
    </div>
  );
}
