import type { ApiResponse, ApiError, PaginatedResponse } from "@projectflow/types";

const API_URL = "http://localhost:4000";

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private getToken(): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("accessToken");
  }

  private async request<T>(
    path: string,
    options: RequestInit = {}
  ): Promise<T> {
    const token = this.getToken();
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...(options.headers as Record<string, string>),
    };
    if (token) headers["Authorization"] = `Bearer ${token}`;

    // Attach active org
    const orgId = useOrgStore?.getState?.()?.activeOrgId;
    if (orgId) headers["X-Org-Id"] = orgId;

    const res = await fetch(`${this.baseUrl}/api/v1${path}`, {
      ...options,
      headers,
    });

    if (res.status === 401) {
      // Don't redirect on auth/me — just throw so the query can handle it
      if (path === "/auth/me") throw new Error("Unauthenticated");
      // Try refresh on other endpoints
      const refreshed = await this.refreshTokens();
      if (refreshed) return this.request<T>(path, options);
      window.location.href = "/login";
      throw new Error("Session expired");
    }

    if (!res.ok) {
      const error: ApiError = await res.json();
      throw Object.assign(new Error(error.message), { statusCode: error.statusCode, error });
    }

    if (res.status === 204) return undefined as T;
    return res.json();
  }

  private async refreshTokens(): Promise<boolean> {
    try {
      const refreshToken = localStorage.getItem("refreshToken");
      if (!refreshToken) return false;

      const res = await fetch(`${this.baseUrl}/api/v1/auth/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken }),
      });

      if (!res.ok) return false;
      const { data } = await res.json();
      localStorage.setItem("accessToken", data.accessToken);
      localStorage.setItem("refreshToken", data.refreshToken);
      return true;
    } catch {
      return false;
    }
  }

  get<T>(path: string) { return this.request<ApiResponse<T>>(path, { method: "GET" }); }
  post<T>(path: string, body?: unknown) { return this.request<ApiResponse<T>>(path, { method: "POST", body: JSON.stringify(body) }); }
  patch<T>(path: string, body?: unknown) { return this.request<ApiResponse<T>>(path, { method: "PATCH", body: JSON.stringify(body) }); }
  delete(path: string) { return this.request<void>(path, { method: "DELETE" }); }

  async upload<T>(path: string, formData: FormData) {
    const token = this.getToken();
    const headers: Record<string, string> = {};
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const res = await fetch(`${this.baseUrl}/api/v1${path}`, {
      method: "POST",
      headers,
      body: formData,
    });

    if (!res.ok) {
      const error: ApiError = await res.json();
      throw new Error(error.message);
    }
    return res.json() as Promise<ApiResponse<T>>;
  }
}

// Lazy import to avoid circular dependency
let useOrgStore: typeof import("../store/org.store").useOrgStore;
import("../store/org.store").then((m) => { useOrgStore = m.useOrgStore; });

export const api = new ApiClient(API_URL);
