"use client";

import { useState } from "react";
import { Bell, Plus } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { getInitials } from "@/lib/utils";
import { CreateProjectModal } from "@/components/projects/CreateProjectModal";

export function Topbar() {
  const { user } = useAuth();
  const [showCreateProject, setShowCreateProject] = useState(false);

  return (
    <>
      <header className="h-16 flex items-center justify-between px-6 bg-white border-b border-gray-200 shrink-0">
        <div />
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowCreateProject(true)}
            className="flex items-center gap-2 px-3 py-1.5 bg-brand-600 text-white text-sm rounded-lg hover:bg-brand-700"
          >
            <Plus className="w-4 h-4" />
            New Project
          </button>
          <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg">
            <Bell className="w-5 h-5" />
          </button>
          {user && (
            <div className="w-8 h-8 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center text-xs font-semibold">
              {getInitials(user.name)}
            </div>
          )}
        </div>
      </header>

      {showCreateProject && (
        <CreateProjectModal onClose={() => setShowCreateProject(false)} />
      )}
    </>
  );
}
