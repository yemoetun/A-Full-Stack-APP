import { create } from "zustand";

interface UIState {
  sidebarOpen: boolean;
  createTaskOpen: boolean;
  createProjectOpen: boolean;
  toggleSidebar: () => void;
  setCreateTask: (open: boolean) => void;
  setCreateProject: (open: boolean) => void;
}

export const useUIStore = create<UIState>((set) => ({
  sidebarOpen: true,
  createTaskOpen: false,
  createProjectOpen: false,
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  setCreateTask: (open) => set({ createTaskOpen: open }),
  setCreateProject: (open) => set({ createProjectOpen: open }),
}));
