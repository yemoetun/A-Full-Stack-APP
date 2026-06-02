"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCreateProject } from "@/hooks/useProjects";

interface Props {
  onClose: () => void;
}

export function CreateProjectModal({ onClose }: Props) {
  const createProject = useCreateProject();
  const router = useRouter();
  const [form, setForm] = useState({ name: "", description: "" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    const res = await createProject.mutateAsync({
      name: form.name,
      description: form.description || undefined,
    });
    onClose();
    router.push(`/projects/${res.data.id}`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">New Project</h2>
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600 rounded">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Project name</label>
            <input
              autoFocus
              type="text"
              placeholder="e.g. Mobile App Redesign"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <textarea
              placeholder="What's this project about?"
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 text-sm rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createProject.isPending}
              className="flex-1 px-4 py-2 bg-brand-600 text-white text-sm rounded-lg hover:bg-brand-700 disabled:opacity-50"
            >
              {createProject.isPending ? "Creating..." : "Create project"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
