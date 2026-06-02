"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { GoogleButton } from "./GoogleButton";

export function RegisterForm() {
  const { register } = useAuth();
  const [form, setForm] = useState({ name: "", email: "", password: "" });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    register.mutate(form);
  };

  return (
    <div className="space-y-4">
      <GoogleButton label="Sign up with Google" />

      <div className="flex items-center gap-3">
        <div className="flex-1 h-px bg-gray-200" />
        <span className="text-xs text-gray-400">or create with email</span>
        <div className="flex-1 h-px bg-gray-200" />
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {(["name", "email", "password"] as const).map((field) => (
          <div key={field}>
            <label className="block text-sm font-medium text-gray-700 mb-1 capitalize">{field}</label>
            <input
              type={field === "password" ? "password" : field === "email" ? "email" : "text"}
              required
              value={form[field]}
              onChange={(e) => setForm((f) => ({ ...f, [field]: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>
        ))}

        {register.error && (
          <p className="text-sm text-red-600">{(register.error as Error).message}</p>
        )}

        <button
          type="submit"
          disabled={register.isPending}
          className="w-full py-2.5 bg-brand-600 text-white rounded-lg text-sm font-medium hover:bg-brand-700 disabled:opacity-50"
        >
          {register.isPending ? "Creating account..." : "Create account"}
        </button>
      </form>
    </div>
  );
}
