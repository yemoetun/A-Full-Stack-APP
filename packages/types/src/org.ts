export type OrgPlan = "free" | "pro" | "enterprise";

export interface Org {
  id: string;
  name: string;
  slug: string;
  plan: OrgPlan;
  createdAt: string;
}
