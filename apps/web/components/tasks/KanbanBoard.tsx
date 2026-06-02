"use client";

import { useState } from "react";
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
} from "@dnd-kit/core";
import { useTasks, useMoveTask } from "@/hooks/useTasks";
import { KanbanColumn } from "./KanbanColumn";
import { TaskCard } from "./TaskCard";
import { CreateTaskModal } from "./CreateTaskModal";
import { TASK_STATUSES } from "@projectflow/config";
import type { Task, TaskStatus } from "@projectflow/types";

const COLUMN_LABELS: Record<TaskStatus, string> = {
  backlog:     "Backlog",
  todo:        "To Do",
  in_progress: "In Progress",
  in_review:   "In Review",
  done:        "Done",
};

export function KanbanBoard({ projectId }: { projectId: string }) {
  const { data: tasks = [], isLoading } = useTasks(projectId);
  const moveTask = useMoveTask(projectId);
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [createStatus, setCreateStatus] = useState<TaskStatus | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  if (isLoading) {
    return (
      <div className="flex gap-4 h-full">
        {TASK_STATUSES.map((s) => (
          <div key={s} className="w-72 shrink-0 bg-gray-100 rounded-xl animate-pulse h-64" />
        ))}
      </div>
    );
  }

  const tasksByStatus = TASK_STATUSES.reduce<Record<string, Task[]>>((acc, status) => {
    acc[status] = tasks.filter((t) => t.status === status).sort((a, b) => a.position - b.position);
    return acc;
  }, {});

  const handleDragStart = (e: DragStartEvent) => {
    const task = tasks.find((t) => t.id === e.active.id);
    if (task) setActiveTask(task);
  };

  const handleDragEnd = (e: DragEndEvent) => {
    setActiveTask(null);
    const { active, over } = e;
    if (!over) return;

    const taskId = active.id as string;
    const overId = over.id as string;

    // overId is either a column status or a task id
    const newStatus = (TASK_STATUSES as readonly string[]).includes(overId)
      ? (overId as TaskStatus)
      : tasks.find((t) => t.id === overId)?.status;

    if (!newStatus) return;

    const columnTasks = tasksByStatus[newStatus];
    const overTaskIndex = columnTasks.findIndex((t) => t.id === overId);
    const newPosition = overTaskIndex >= 0
      ? (columnTasks[overTaskIndex].position + (columnTasks[overTaskIndex - 1]?.position ?? 0)) / 2
      : (columnTasks[columnTasks.length - 1]?.position ?? 0) + 1000;

    moveTask.mutate({ taskId, status: newStatus, position: newPosition });
  };

  return (
    <>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="flex gap-4 h-full overflow-x-auto pb-4">
          {TASK_STATUSES.map((status) => (
            <KanbanColumn
              key={status}
              status={status}
              label={COLUMN_LABELS[status]}
              tasks={tasksByStatus[status]}
              projectId={projectId}
              onMove={(taskId, position) => moveTask.mutate({ taskId, status, position })}
              onAddTask={() => setCreateStatus(status)}
            />
          ))}
        </div>

        <DragOverlay>
          {activeTask && <TaskCard task={activeTask} isDragging />}
        </DragOverlay>
      </DndContext>

      {createStatus && (
        <CreateTaskModal
          projectId={projectId}
          defaultStatus={createStatus}
          onClose={() => setCreateStatus(null)}
        />
      )}
    </>
  );
}
