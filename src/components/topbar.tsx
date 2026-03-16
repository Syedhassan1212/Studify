import Link from "next/link";
import { Sparkles } from "lucide-react";

export default function Topbar() {
  return (
    <div className="app-surface flex flex-wrap items-center justify-between gap-4 rounded-[28px] px-6 py-4">
      <div>
        <p className="text-xs uppercase tracking-[0.32em] text-[var(--muted)]">
          Today
        </p>
        <h2 className="text-xl font-semibold">Keep the momentum going.</h2>
      </div>
      <div className="flex flex-1 items-center justify-end gap-3">
        <input
          className="hidden w-full max-w-xs rounded-full bg-white px-4 py-2 text-sm text-[var(--muted)] shadow-inner md:block"
          placeholder="Search notes, materials, or questions..."
        />
        <Link
          href="/courses"
          className="flex items-center gap-2 rounded-full bg-[color:var(--accent)] px-4 py-2 text-sm font-semibold text-white shadow-[0_12px_24px_rgba(27,58,75,0.2)]"
        >
          <Sparkles size={16} />
          Start AI Session
        </Link>
      </div>
    </div>
  );
}
