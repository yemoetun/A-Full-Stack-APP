"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { UserPlus, MoreHorizontal, Trash2 } from "lucide-react";
import { api } from "@/lib/api-client";
import { useOrgStore } from "@/store/org.store";
import { useAuthStore } from "@/store/auth.store";
import { getInitials, formatDate } from "@/lib/utils";
import type { Member } from "@projectflow/types";

const ROLE_COLORS = {
  owner:  "bg-purple-100 text-purple-700",
  admin:  "bg-blue-100 text-blue-700",
  member: "bg-gray-100 text-gray-700",
  viewer: "bg-gray-50 text-gray-500",
};

const ROLES = ["admin", "member", "viewer"] as const;

export function MemberTable() {
  const orgId = useOrgStore((s) => s.activeOrgId);
  const currentUser = useAuthStore((s) => s.user);
  const qc = useQueryClient();

  const [showInvite, setShowInvite] = useState(false);
  const [inviteForm, setInviteForm] = useState({ email: "", role: "member" });
  const [openMenu, setOpenMenu] = useState<string | null>(null);

  const { data: members = [], isLoading } = useQuery({
    queryKey: ["members", orgId],
    queryFn: async () => {
      const res = await api.get<Member[]>(`/orgs/${orgId}/members`);
      return res.data;
    },
    enabled: !!orgId,
  });

  const currentMember = members.find((m) => m.userId === currentUser?.id);
  const canManage = currentMember?.role === "owner" || currentMember?.role === "admin";

  const invite = useMutation({
    mutationFn: () => api.post(`/orgs/${orgId}/members/invite`, inviteForm),
    onSuccess: () => {
      setShowInvite(false);
      setInviteForm({ email: "", role: "member" });
      qc.invalidateQueries({ queryKey: ["members", orgId] });
    },
  });

  const updateRole = useMutation({
    mutationFn: ({ userId, role }: { userId: string; role: string }) =>
      api.patch(`/orgs/${orgId}/members/${userId}/role`, { role }),
    onSuccess: () => {
      setOpenMenu(null);
      qc.invalidateQueries({ queryKey: ["members", orgId] });
    },
  });

  const removeMember = useMutation({
    mutationFn: (userId: string) => api.delete(`/orgs/${orgId}/members/${userId}`),
    onSuccess: () => {
      setOpenMenu(null);
      qc.invalidateQueries({ queryKey: ["members", orgId] });
    },
  });

  if (isLoading) {
    return <div className="space-y-3">{[...Array(4)].map((_, i) => <div key={i} className="h-14 bg-gray-100 rounded-xl animate-pulse" />)}</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">{members.length} member{members.length !== 1 ? "s" : ""}</p>
        {canManage && (
          <button
            onClick={() => setShowInvite(true)}
            className="flex items-center gap-2 px-3 py-1.5 bg-brand-600 text-white text-sm rounded-lg hover:bg-brand-700"
          >
            <UserPlus className="w-4 h-4" />
            Invite member
          </button>
        )}
      </div>

      {showInvite && (
        <div className="bg-brand-50 border border-brand-200 rounded-xl p-4">
          <p className="text-sm font-medium text-gray-900 mb-3">Invite a new member</p>
          <div className="flex gap-3 flex-wrap">
            <input
              autoFocus
              type="email"
              placeholder="email@example.com"
              value={inviteForm.email}
              onChange={(e) => setInviteForm((f) => ({ ...f, email: e.target.value }))}
              className="flex-1 min-w-48 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
            <select
              value={inviteForm.role}
              onChange={(e) => setInviteForm((f) => ({ ...f, role: e.target.value }))}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
            <button
              onClick={() => invite.mutate()}
              disabled={!inviteForm.email || invite.isPending}
              className="px-4 py-2 bg-brand-600 text-white text-sm rounded-lg hover:bg-brand-700 disabled:opacity-50"
            >
              {invite.isPending ? "Sending..." : "Send invite"}
            </button>
            <button
              onClick={() => setShowInvite(false)}
              className="px-3 py-2 border border-gray-300 text-gray-600 text-sm rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
          {invite.isError && <p className="text-sm text-red-600 mt-2">{(invite.error as Error).message}</p>}
          {invite.isSuccess && <p className="text-sm text-green-600 mt-2">✓ Invite sent</p>}
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Member</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Role</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Joined</th>
              {canManage && <th className="px-4 py-3 w-10" />}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {members.map((m) => (
              <tr key={m.userId} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center text-xs font-semibold">
                      {getInitials(m.name)}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        {m.name}
                        {m.userId === currentUser?.id && <span className="ml-2 text-xs text-gray-400">(you)</span>}
                      </p>
                      <p className="text-xs text-gray-500">{m.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${ROLE_COLORS[m.role]}`}>
                    {m.role}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-500">{m.joinedAt ? formatDate(m.joinedAt) : "—"}</td>
                {canManage && (
                  <td className="px-4 py-3 relative">
                    {m.role !== "owner" && m.userId !== currentUser?.id && (
                      <>
                        <button
                          onClick={() => setOpenMenu(openMenu === m.userId ? null : m.userId)}
                          className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded"
                        >
                          <MoreHorizontal className="w-4 h-4" />
                        </button>

                        {openMenu === m.userId && (
                          <>
                            <div className="fixed inset-0 z-10" onClick={() => setOpenMenu(null)} />
                            <div className="absolute right-4 top-10 z-20 w-44 bg-white rounded-lg shadow-lg border border-gray-200 py-1">
                              <p className="px-3 py-1.5 text-xs font-medium text-gray-400 uppercase tracking-wide">Change role</p>
                              {ROLES.filter((r) => r !== m.role).map((role) => (
                                <button
                                  key={role}
                                  onClick={() => updateRole.mutate({ userId: m.userId, role })}
                                  className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 capitalize"
                                >
                                  Set as {role}
                                </button>
                              ))}
                              <div className="border-t border-gray-100 mt-1 pt-1">
                                <button
                                  onClick={() => {
                                    if (confirm(`Remove ${m.name} from the organization?`)) {
                                      removeMember.mutate(m.userId);
                                    }
                                  }}
                                  className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                  Remove member
                                </button>
                              </div>
                            </div>
                          </>
                        )}
                      </>
                    )}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
