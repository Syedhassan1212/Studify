import Link from "next/link";

export default function CourseDetailPage() {
  return (
    <div className="flex flex-col gap-6">
      <header>
        <p className="text-xs uppercase tracking-[0.32em] text-[var(--muted)]">Course</p>
        <h2 className="text-3xl font-semibold">Course Overview</h2>
        <p className="mt-2 text-sm text-[var(--muted)]">
          Pick a topic to open its workspace, upload materials, and start an AI study session.
        </p>
      </header>
      <div className="app-surface rounded-[32px] p-6">
        <p className="text-sm text-[var(--muted)]">
          This page will show course analytics, topic mastery, and study history.
        </p>
        <Link
          href="/courses/algorithms/topics/graphs"
          className="mt-4 inline-flex rounded-full bg-[color:var(--accent)] px-4 py-2 text-sm font-semibold text-white"
        >
          Open Sample Topic Workspace
        </Link>
      </div>
    </div>
  );
}
