"use client";

import { useState } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { TaskCard } from "./TaskCard";
import { TaskDetailPanel } from "./TaskDetailPanel";
import type { Task } from "@projectflow/types";

interface Props {
  task: Task;
  projectId?: string;
}

export function SortableTaskCard({ task, projectId = "" }: Props) {
  const [showDetail, setShowDetail] = useState(false);
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  return (
    <>
      <div
        ref={setNodeRef}
        style={style}
        {...attributes}
        {...listeners}
        onClick={() => !isDragging && setShowDetail(true)}
      >
        <TaskCard task={task} isDragging={isDragging} />
      </div>

      {showDetail && (
        <TaskDetailPanel
          task={task}
          projectId={projectId}
          onClose={() => setShowDetail(false)}
        />
      )}
    </>
  );
}
