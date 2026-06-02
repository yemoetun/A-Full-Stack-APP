import type { Metadata } from "next";
import { StatsCards } from "@/components/dashboard/StatsCards";
import { ActivityFeed } from "@/components/dashboard/ActivityFeed";
import { UpcomingTasks } from "@/components/dashboard/UpcomingTasks";

export const metadata: Metadata = { title: "Dashboard" };

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
      <StatsCards />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <UpcomingTasks />
        <ActivityFeed />
      </div>
    </div>
  );
}
