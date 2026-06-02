"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { GoogleButton } from "./GoogleButton";

export function LoginForm() {
  const { login } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login.mutate(form);
  };

  return (
    <div className="space-y-4">
      <GoogleButton label="Sign in with Google" />

      <div className="flex items-center gap-3">
        <div className="flex-1 h-px bg-gray-200" />
        <span className="text-xs text-gray-400">or continue with email</span>
        <div className="flex-1 h-px bg-gray-200" />
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input
            type="email"
            required
            value={form.email}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            placeholder="you@example.com"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
          <input
            type="password"
            required
            value={form.password}
            onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            placeholder="••••••••"
          />
        </div>

        {login.error && (
          <p className="text-sm text-red-600">{(login.error as Error).message}</p>
        )}

        <button
          type="submit"
          disabled={login.isPending}
          className="w-full py-2.5 bg-brand-600 text-white rounded-lg text-sm font-medium hover:bg-brand-700 disabled:opacity-50"
        >
          {login.isPending ? "Signing in..." : "Sign in"}
        </button>
      </form>
    </div>
  );
}
