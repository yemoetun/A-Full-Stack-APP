"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import { useOrgStore } from "@/store/org.store";
import { useAuthStore } from "@/store/auth.store";

export default function SettingsPage() {
  const org = useOrgStore((s) => s.activeOrg);
  const setActiveOrg = useOrgStore((s) => s.setActiveOrg);
  const user = useAuthStore((s) => s.user);
  const qc = useQueryClient();

  const [orgName, setOrgName] = useState(org?.name ?? "");
  const [passwords, setPasswords] = useState({ current: "", next: "", confirm: "" });
  const [saved, setSaved] = useState<string | null>(null);

  const updateOrg = useMutation({
    mutationFn: () => api.patch(`/orgs/${org?.id}`, { name: orgName }),
    onSuccess: (res: any) => {
      setActiveOrg({ ...org!, name: res.data.name });
      qc.invalidateQueries({ queryKey: ["projects"] });
      setSaved("org");
      setTimeout(() => setSaved(null), 2000);
    },
  });

  const updatePassword = useMutation({
    mutationFn: () =>
      api.patch(`/auth/password`, {
        currentPassword: passwords.current,
        newPassword: passwords.next,
      }),
    onSuccess: () => {
      setPasswords({ current: "", next: "", confirm: "" });
      setSaved("password");
      setTimeout(() => setSaved(null), 2000);
    },
  });

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwords.next !== passwords.confirm) {
      alert("New passwords don't match");
      return;
    }
    updatePassword.mutate();
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="text-2xl font-semibold text-gray-900">Settings</h1>

      {/* Organization */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-base font-semibold text-gray-900 mb-1">Organization</h2>
        <p className="text-sm text-gray-500 mb-4">Update your organization's display name.</p>
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <input
              type="text"
              value={orgName}
              onChange={(e) => setOrgName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Plan</label>
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-brand-100 text-brand-700 capitalize">
              {org?.plan ?? "free"}
            </span>
          </div>
          <button
            onClick={() => updateOrg.mutate()}
            disabled={updateOrg.isPending || orgName === org?.name}
            className="px-4 py-2 bg-brand-600 text-white text-sm rounded-lg hover:bg-brand-700 disabled:opacity-50"
          >
            {updateOrg.isPending ? "Saving..." : saved === "org" ? "✓ Saved" : "Save changes"}
          </button>
        </div>
      </div>

      {/* Profile */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-base font-semibold text-gray-900 mb-1">Your Profile</h2>
        <p className="text-sm text-gray-500 mb-4">Your account information.</p>
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <input
              type="text"
              defaultValue={user?.name}
              readOnly
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 text-gray-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              defaultValue={user?.email}
              readOnly
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 text-gray-500"
            />
          </div>
        </div>
      </div>

      {/* Security */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-base font-semibold text-gray-900 mb-1">Security</h2>
        <p className="text-sm text-gray-500 mb-4">Change your password.</p>
        <form onSubmit={handlePasswordSubmit} className="space-y-3">
          {(["current", "next", "confirm"] as const).map((field) => (
            <div key={field}>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {field === "current" ? "Current password" : field === "next" ? "New password" : "Confirm new password"}
              </label>
              <input
                type="password"
                value={passwords[field]}
                onChange={(e) => setPasswords((p) => ({ ...p, [field]: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                required
                minLength={field !== "current" ? 8 : 1}
              />
            </div>
          ))}
          <button
            type="submit"
            disabled={updatePassword.isPending}
            className="px-4 py-2 bg-brand-600 text-white text-sm rounded-lg hover:bg-brand-700 disabled:opacity-50"
          >
            {updatePassword.isPending ? "Updating..." : saved === "password" ? "✓ Updated" : "Update password"}
          </button>
          {updatePassword.isError && (
            <p className="text-sm text-red-600">{(updatePassword.error as Error).message}</p>
          )}
        </form>
      </div>

      {/* Billing */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-base font-semibold text-gray-900 mb-1">Billing</h2>
        <p className="text-sm text-gray-500 mb-4">Manage your subscription.</p>
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div>
            <p className="text-sm font-medium text-gray-900 capitalize">{org?.plan ?? "Free"} plan</p>
            <p className="text-xs text-gray-500 mt-0.5">
              {org?.plan === "free" ? "Up to 3 projects, 10 members" : "Unlimited projects and members"}
            </p>
          </div>
          {org?.plan === "free" && (
            <button className="px-3 py-1.5 bg-brand-600 text-white text-sm rounded-lg hover:bg-brand-700">
              Upgrade to Pro
            </button>
          )}
        </div>
      </div>

      {/* Danger zone */}
      <div className="bg-white rounded-xl border border-red-200 p-6">
        <h2 className="text-base font-semibold text-red-600 mb-1">Danger zone</h2>
        <p className="text-sm text-gray-500 mb-4">
          Permanently delete this organization and all its data. This cannot be undone.
        </p>
        <button
          onClick={() => {
            if (confirm(`Are you sure you want to delete "${org?.name}"? This cannot be undone.`)) {
              api.delete(`/orgs/${org?.id}`).then(() => {
                useOrgStore.getState().clearOrg();
                window.location.href = "/dashboard";
              });
            }
          }}
          className="px-4 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700"
        >
          Delete organization
        </button>
      </div>
    </div>
  );
}
