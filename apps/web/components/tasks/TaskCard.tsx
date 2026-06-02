"use client";

import { MessageSquare, Paperclip, Calendar } from "lucide-react";
import { cn, formatDate, getInitials } from "@/lib/utils";
import type { Task, TaskPriority } from "@projectflow/types";

const PRIORITY_COLORS: Record<TaskPriority, string> = {
  none:   "text-gray-300",
  low:    "text-blue-400",
  medium: "text-yellow-400",
  high:   "text-orange-400",
  urgent: "text-red-500",
};

export function TaskCard({ task, isDragging }: { task: Task; isDragging?: boolean }) {
  return (
    <div className={cn("bg-white rounded-lg border border-gray-200 p-3 cursor-grab hover:shadow-md transition-shadow", isDragging && "shadow-lg ring-2 ring-brand-300")}>
      {/* Priority indicator */}
      <div className={cn("w-1 h-1 rounded-full mb-2", PRIORITY_COLORS[task.priority])} />

      <p className="text-sm font-medium text-gray-900 line-clamp-2 mb-2">{task.title}</p>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs text-gray-400">
          {(task.commentCount ?? 0) > 0 && (
            <span className="flex items-center gap-0.5">
              <MessageSquare className="w-3 h-3" />
              {task.commentCount}
            </span>
          )}
          {(task.fileCount ?? 0) > 0 && (
            <span className="flex items-center gap-0.5">
              <Paperclip className="w-3 h-3" />
              {task.fileCount}
            </span>
          )}
          {task.dueDate && (
            <span className="flex items-center gap-0.5">
              <Calendar className="w-3 h-3" />
              {formatDate(task.dueDate)}
            </span>
          )}
        </div>

        {task.assignee && (
          <div className="w-6 h-6 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center text-xs font-semibold shrink-0">
            {getInitials(task.assignee.name)}
          </div>
        )}
      </div>
    </div>
  );
}
