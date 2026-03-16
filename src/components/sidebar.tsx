"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CalendarDays,
  FolderKanban,
  LayoutDashboard,
  Sparkles,
  Upload,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/calendar", label: "Calendar", icon: CalendarDays },
  { href: "/courses", label: "Courses", icon: FolderKanban },
];

const actions = [
  { label: "Create Course", icon: Sparkles },
  { label: "Upload Material", icon: Upload },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="app-surface flex h-full flex-col justify-between rounded-[32px] p-6">
      <div className="flex flex-col gap-10">
        <div>
          <p className="font-serif text-sm uppercase tracking-[0.32em] text-[var(--muted)]">
            StudyOS
          </p>
          <h1 className="mt-3 text-2xl font-semibold">Personal Study Command</h1>
          <p className="mt-2 text-sm text-[var(--muted)]">
            All your courses, notes, and AI tutoring in one flow.
          </p>
        </div>

        <nav className="flex flex-col gap-2">
          {navItems.map((item) => {
            const active = pathname.startsWith(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition",
                  active
                    ? "bg-[color:var(--accent)] text-white"
                    : "text-[var(--muted)] hover:bg-[color:var(--surface-2)] hover:text-[var(--ink)]",
                )}
              >
                <Icon size={18} />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="rounded-3xl bg-[color:var(--surface-2)] p-4">
        <p className="text-xs uppercase tracking-[0.28em] text-[var(--muted)]">
          Quick Actions
        </p>
        <div className="mt-3 flex flex-col gap-2">
          {actions.map((action) => {
            const Icon = action.icon;
            return (
              <button
                key={action.label}
                type="button"
                className="flex items-center gap-3 rounded-2xl bg-white px-3 py-2 text-sm font-semibold text-[var(--accent)] shadow-[0_8px_18px_rgba(27,58,75,0.12)]"
              >
                <Icon size={16} />
                {action.label}
              </button>
            );
          })}
        </div>
        <form action="/logout" method="post" className="mt-4">
          <button
            type="submit"
            className="w-full rounded-2xl border border-[color:var(--surface-3)] bg-white px-3 py-2 text-sm font-semibold text-[var(--muted)]"
          >
            Sign out
          </button>
        </form>
      </div>
    </aside>
  );
}
