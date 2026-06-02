"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuthStore } from "@/store/auth.store";
import { useOrgStore } from "@/store/org.store";
import { api } from "@/lib/api-client";

export default function AuthCallbackPage() {
  const router = useRouter();
  const params = useSearchParams();
  const { setTokens, setUser } = useAuthStore();

  useEffect(() => {
    const accessToken = params.get("accessToken");
    const refreshToken = params.get("refreshToken");

    if (!accessToken || !refreshToken) {
      router.push("/login?error=oauth_failed");
      return;
    }

    setTokens(accessToken, refreshToken);

    api.get<any>("/auth/me").then((res) => {
      setUser(res.data);
      if (res.data.orgs?.length) {
        useOrgStore.getState().setActiveOrg(res.data.orgs[0]);
      }
      router.push("/dashboard");
    }).catch(() => router.push("/login?error=oauth_failed"));
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="w-8 h-8 border-4 border-brand-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-gray-500 text-sm">Signing you in...</p>
      </div>
    </div>
  );
}
