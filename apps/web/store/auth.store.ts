import { create } from "zustand";
import type { User } from "@projectflow/types";

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  setTokens: (accessToken: string, refreshToken: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: typeof window !== "undefined" ? localStorage.getItem("accessToken") : null,
  isLoading: true,

  setUser: (user) => set({ user, isLoading: false }),

  setTokens: (accessToken, refreshToken) => {
    localStorage.setItem("accessToken", accessToken);
    localStorage.setItem("refreshToken", refreshToken);
    set({ accessToken });
  },

  logout: () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    set({ user: null, accessToken: null });
  },
}));
