import type { Metadata } from "next";
import { KanbanBoard } from "@/components/tasks/KanbanBoard";

export const metadata: Metadata = { title: "Board" };

export default function ProjectBoardPage({ params }: { params: { projectId: string } }) {
  return <KanbanBoard projectId={params.projectId} />;
}
