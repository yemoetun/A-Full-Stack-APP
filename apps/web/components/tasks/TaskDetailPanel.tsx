"use client";

import { useState } from "react";
import { X, Calendar, Flag, MessageSquare, Paperclip, Trash2 } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import { useOrgStore } from "@/store/org.store";
import { formatDate, formatRelative, getInitials, cn } from "@/lib/utils";
import type { Task, Comment } from "@projectflow/types";

const PRIORITY_LABELS = { none: "None", low: "Low", medium: "Medium", high: "High", urgent: "Urgent" };
const PRIORITY_COLORS = {
  none: "text-gray-400", low: "text-blue-500", medium: "text-yellow-500",
  high: "text-orange-500", urgent: "text-red-500",
};

interface Props {
  task: Task;
  projectId: string;
  onClose: () => void;
}

export function TaskDetailPanel({ task, projectId, onClose }: Props) {
  const orgId = useOrgStore((s) => s.activeOrgId);
  const qc = useQueryClient();
  const [comment, setComment] = useState("");

  const { data: comments = [] } = useQuery({
    queryKey: ["comments", orgId, task.id],
    queryFn: async () => {
      const res = await api.get<Comment[]>(`/orgs/${orgId}/tasks/${task.id}/comments`);
      return res.data;
    },
    enabled: !!orgId,
  });

  const addComment = useMutation({
    mutationFn: () =>
      api.post(`/orgs/${orgId}/tasks/${task.id}/comments`, { body: comment }),
    onSuccess: () => {
      setComment("");
      qc.invalidateQueries({ queryKey: ["comments", orgId, task.id] });
    },
  });

  const deleteTask = useMutation({
    mutationFn: () =>
      api.delete(`/orgs/${orgId}/projects/${projectId}/tasks/${task.id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["tasks", orgId, projectId] });
      onClose();
    },
  });

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div className="flex-1 bg-black/20" onClick={onClose} />

      {/* Panel */}
      <div className="w-full max-w-lg bg-white shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <span className={cn("text-xs font-medium px-2 py-0.5 rounded-full",
            task.status === "done" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"
          )}>
            {task.status.replace("_", " ")}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => deleteTask.mutate()}
              className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <button onClick={onClose} className="p-1.5 text-gray-400 hover:text-gray-600 rounded">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {/* Title + meta */}
          <div className="px-6 py-5 border-b border-gray-100">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">{task.title}</h2>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-xs text-gray-400 mb-1">Priority</p>
                <span className={cn("font-medium", PRIORITY_COLORS[task.priority])}>
                  <Flag className="w-3 h-3 inline mr-1" />
                  {PRIORITY_LABELS[task.priority]}
                </span>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-1">Due date</p>
                <span className="text-gray-700 flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {task.dueDate ? formatDate(task.dueDate) : "No due date"}
                </span>
              </div>
              {task.assignee && (
                <div>
                  <p className="text-xs text-gray-400 mb-1">Assignee</p>
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center text-xs font-semibold">
                      {getInitials(task.assignee.name)}
                    </div>
                    <span className="text-gray-700">{task.assignee.name}</span>
                  </div>
                </div>
              )}
              <div>
                <p className="text-xs text-gray-400 mb-1">Created</p>
                <span className="text-gray-700">{formatDate(task.createdAt)}</span>
              </div>
            </div>
          </div>

          {/* Description */}
          {task.description && (
            <div className="px-6 py-4 border-b border-gray-100">
              <p className="text-xs text-gray-400 mb-2">Description</p>
              <p className="text-sm text-gray-700 whitespace-pre-wrap">{task.description}</p>
            </div>
          )}

          {/* Comments */}
          <div className="px-6 py-4">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-4 flex items-center gap-1">
              <MessageSquare className="w-3 h-3" />
              Comments ({comments.length})
            </p>

            <div className="space-y-4 mb-4">
              {comments.map((c: any) => (
                <div key={c.id} className="flex gap-3">
                  <div className="w-7 h-7 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center text-xs font-semibold shrink-0">
                    {getInitials(c.author_name || "?")}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium text-gray-900">{c.author_name}</span>
                      <span className="text-xs text-gray-400">{formatRelative(c.created_at)}</span>
                    </div>
                    <p className="text-sm text-gray-700">{c.body}</p>
                  </div>
                </div>
              ))}
              {comments.length === 0 && (
                <p className="text-sm text-gray-400">No comments yet.</p>
              )}
            </div>

            {/* Add comment */}
            <div className="flex gap-2">
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Write a comment..."
                rows={2}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && (e.metaKey || e.ctrlKey) && comment.trim()) {
                    addComment.mutate();
                  }
                }}
              />
              <button
                onClick={() => comment.trim() && addComment.mutate()}
                disabled={!comment.trim() || addComment.isPending}
                className="px-3 py-2 bg-brand-600 text-white text-sm rounded-lg hover:bg-brand-700 disabled:opacity-40 self-end"
              >
                Send
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
