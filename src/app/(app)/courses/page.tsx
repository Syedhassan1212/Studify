import Link from "next/link";
import CourseCard from "@/components/courses/course-card";
import { courses } from "@/lib/mock-data";

export default function CoursesPage() {
  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.32em] text-[var(--muted)]">Courses</p>
          <h2 className="text-3xl font-semibold">Your learning map.</h2>
          <p className="mt-2 text-sm text-[var(--muted)]">
            Organize topics, materials, notes, and AI support in one unified workspace.
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/courses/algorithms/topics/graphs"
            className="rounded-full border border-[color:var(--accent)] px-4 py-2 text-sm font-semibold text-[color:var(--accent)]"
          >
            Open Topic Workspace
          </Link>
          <button className="rounded-full border border-[color:var(--accent)] px-4 py-2 text-sm font-semibold text-[color:var(--accent)]">
            Import Course
          </button>
          <button className="rounded-full bg-[color:var(--accent)] px-4 py-2 text-sm font-semibold text-white">
            Create Course
          </button>
        </div>
      </header>

      <div className="grid gap-6">
        {courses.map((course) => (
          <CourseCard key={course.id} course={course} />
        ))}
      </div>
    </div>
  );
}
