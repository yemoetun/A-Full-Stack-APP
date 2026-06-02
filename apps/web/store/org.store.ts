import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Org } from "@projectflow/types";

interface OrgState {
  activeOrgId: string | null;
  activeOrg: Org | null;
  setActiveOrg: (org: Org) => void;
  clearOrg: () => void;
}

export const useOrgStore = create<OrgState>()(
  persist(
    (set) => ({
      activeOrgId: null,
      activeOrg: null,
      setActiveOrg: (org) => set({ activeOrgId: org.id, activeOrg: org }),
      clearOrg: () => set({ activeOrgId: null, activeOrg: null }),
    }),
    { name: "active-org" }
  )
);
