import Link from "next/link";
import CourseCard from "@/components/courses/course-card";
import { getCourseOverviews } from "@/lib/study-data";

export default async function CoursesPage() {
  const courses = await getCourseOverviews();
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
            href={courses[0] ? `/courses/${courses[0].id}` : "/courses/new"}
            className="rounded-full border border-[color:var(--accent)] px-4 py-2 text-sm font-semibold text-[color:var(--accent)]"
          >
            Open Course
          </Link>
          <Link
            href="/courses/new"
            className="rounded-full border border-[color:var(--accent)] px-4 py-2 text-sm font-semibold text-[color:var(--accent)]"
          >
            Import Course
          </Link>
          <Link
            href="/courses/new"
            className="rounded-full bg-[color:var(--accent)] px-4 py-2 text-sm font-semibold text-white"
          >
            Create Course
          </Link>
        </div>
      </header>

      <div className="grid gap-6">
        {courses.length === 0 ? (
          <div className="app-surface rounded-[28px] p-6 text-sm text-[var(--muted)]">
            No courses yet. Create one to start organizing your study plan.
          </div>
        ) : (
          courses.map((course) => <CourseCard key={course.id} course={course} />)
        )}
      </div>
    </div>
  );
}
