"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api-client";
import { useAuthStore } from "@/store/auth.store";
import { useOrgStore } from "@/store/org.store";
import type { User, AuthTokens } from "@projectflow/types";

async function fetchAndSetUser() {
  const res = await api.get<User & { orgs?: { id: string; name: string; slug: string; role: string }[] }>("/auth/me");
  useAuthStore.getState().setUser(res.data);
  // Auto-select first org if none selected
  if (res.data.orgs?.length && !useOrgStore.getState().activeOrgId) {
    useOrgStore.getState().setActiveOrg(res.data.orgs[0] as any);
  }
  return res.data;
}

export function useAuth() {
  const { user, setUser, setTokens, logout: clearAuth, accessToken } = useAuthStore();
  const qc = useQueryClient();
  const router = useRouter();

  const hasToken =
    !!accessToken ||
    (typeof window !== "undefined" && !!localStorage.getItem("accessToken"));

  const { isLoading } = useQuery({
    queryKey: ["me"],
    queryFn: fetchAndSetUser,
    enabled: hasToken,
    retry: false,
  });

  const login = useMutation({
    mutationFn: (credentials: { email: string; password: string }) =>
      api.post<AuthTokens>("/auth/login", credentials),
    onSuccess: async (res) => {
      setTokens(res.data.accessToken, res.data.refreshToken);
      try { await fetchAndSetUser(); } catch {}
      router.push("/dashboard");
    },
  });

  const register = useMutation({
    mutationFn: (data: { email: string; name: string; password: string }) =>
      api.post<AuthTokens>("/auth/register", data),
    onSuccess: async (res) => {
      setTokens(res.data.accessToken, res.data.refreshToken);
      try { await fetchAndSetUser(); } catch {}
      router.push("/dashboard");
    },
  });

  const logout = useMutation({
    mutationFn: () => api.post("/auth/logout"),
    onSettled: () => {
      clearAuth();
      useOrgStore.getState().clearOrg();
      qc.clear();
      router.push("/login");
    },
  });

  return { user, isLoading, login, register, logout };
}
