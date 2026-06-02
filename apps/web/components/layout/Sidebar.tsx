"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, FolderKanban, Users, Settings, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { useOrgStore } from "@/store/org.store";

const NAV = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/projects",  label: "Projects",  icon: FolderKanban },
  { href: "/members",   label: "Members",   icon: Users },
  { href: "/settings",  label: "Settings",  icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const { logout } = useAuth();
  const org = useOrgStore((s) => s.activeOrg);

  return (
    <aside className="w-60 flex flex-col bg-white border-r border-gray-200 shrink-0">
      {/* Logo + Org */}
      <div className="h-16 flex items-center px-4 border-b border-gray-200">
        <div>
          <p className="font-bold text-gray-900">ProjectFlow</p>
          {org && <p className="text-xs text-gray-500 truncate">{org.name}</p>}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1">
        {NAV.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
              pathname.startsWith(href)
                ? "bg-brand-50 text-brand-600"
                : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
            )}
          >
            <Icon className="w-4 h-4" />
            {label}
          </Link>
        ))}
      </nav>

      {/* Logout */}
      <div className="p-3 border-t border-gray-200">
        <button
          onClick={() => logout.mutate()}
          className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-100"
        >
          <LogOut className="w-4 h-4" />
          Sign out
        </button>
      </div>
    </aside>
  );
}
