import type { Metadata } from "next";
import { MemberTable } from "@/components/members/MemberTable";

export const metadata: Metadata = { title: "Members" };

export default function MembersPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-gray-900">Members</h1>
      <MemberTable />
    </div>
  );
}
