import type { Metadata } from "next";
import { ProjectList } from "@/components/projects/ProjectList";

export const metadata: Metadata = { title: "Projects" };

export default function ProjectsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">Projects</h1>
      </div>
      <ProjectList />
    </div>
  );
}
