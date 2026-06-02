"use client";

import Link from "next/link";
import { FolderKanban, Plus } from "lucide-react";
import { useProjects } from "@/hooks/useProjects";
import { useUIStore } from "@/store/ui.store";
import { formatDate } from "@/lib/utils";

export function ProjectList() {
  const { data: projects = [], isLoading } = useProjects();
  const setCreateProject = useUIStore((s) => s.setCreateProject);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-32 bg-gray-100 rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  if (!projects.length) {
    return (
      <div className="text-center py-20">
        <FolderKanban className="w-12 h-12 text-gray-300 mx-auto mb-4" />
        <p className="text-gray-500 mb-4">No projects yet</p>
        <button
          onClick={() => setCreateProject(true)}
          className="px-4 py-2 bg-brand-600 text-white text-sm rounded-lg hover:bg-brand-700"
        >
          Create your first project
        </button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {projects.map((project) => (
        <Link
          key={project.id}
          href={`/projects/${project.id}`}
          className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition-shadow"
        >
          <div className="flex items-start justify-between mb-3">
            <h3 className="font-semibold text-gray-900">{project.name}</h3>
            <span className={`text-xs px-2 py-0.5 rounded-full ${
              project.status === "active"
                ? "bg-green-100 text-green-700"
                : "bg-gray-100 text-gray-500"
            }`}>
              {project.status}
            </span>
          </div>
          {project.description && (
            <p className="text-sm text-gray-500 line-clamp-2 mb-3">{project.description}</p>
          )}
          <div className="flex items-center justify-between text-xs text-gray-400">
            <span>{(project as any).open_task_count ?? 0} open tasks</span>
            <span>{formatDate(project.createdAt)}</span>
          </div>
        </Link>
      ))}

      <button
        onClick={() => setCreateProject(true)}
        className="border-2 border-dashed border-gray-200 rounded-xl p-5 flex flex-col items-center justify-center gap-2 text-gray-400 hover:border-brand-300 hover:text-brand-500 transition-colors"
      >
        <Plus className="w-6 h-6" />
        <span className="text-sm font-medium">New Project</span>
      </button>
    </div>
  );
}
