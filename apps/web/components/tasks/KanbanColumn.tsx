"use client";

import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { Plus } from "lucide-react";
import { SortableTaskCard } from "./SortableTaskCard";
import { cn } from "@/lib/utils";
import type { Task, TaskStatus } from "@projectflow/types";

interface Props {
  status: TaskStatus;
  label: string;
  tasks: Task[];
  projectId: string;
  onMove: (taskId: string, position: number) => void;
  onAddTask: () => void;
}

const STATUS_COLORS: Record<TaskStatus, string> = {
  backlog:     "bg-gray-400",
  todo:        "bg-blue-400",
  in_progress: "bg-yellow-400",
  in_review:   "bg-purple-400",
  done:        "bg-green-400",
};

export function KanbanColumn({ status, label, tasks, projectId, onAddTask }: Props) {
  const { setNodeRef, isOver } = useDroppable({ id: status });

  return (
    <div className="w-72 shrink-0 flex flex-col bg-gray-50 rounded-xl border border-gray-200">
      <div className="flex items-center justify-between p-3 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${STATUS_COLORS[status]}`} />
          <span className="text-sm font-medium text-gray-700">{label}</span>
          <span className="text-xs text-gray-400 bg-gray-200 rounded-full px-1.5">
            {tasks.length}
          </span>
        </div>
        <button
          onClick={onAddTask}
          className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      <div
        ref={setNodeRef}
        className={cn(
          "flex-1 p-2 space-y-2 overflow-y-auto min-h-[120px] transition-colors",
          isOver && "bg-brand-50"
        )}
      >
        <SortableContext items={tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
          {tasks.map((task) => (
            <SortableTaskCard key={task.id} task={task} projectId={projectId} />
          ))}
        </SortableContext>

        {tasks.length === 0 && (
          <div
            onClick={onAddTask}
            className="text-center py-8 text-sm text-gray-400 cursor-pointer hover:text-gray-500"
          >
            + Add task
          </div>
        )}
      </div>
    </div>
  );
}
