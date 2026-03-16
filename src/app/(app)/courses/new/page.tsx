import CourseForm from "./course-form";

export default function NewCoursePage() {
  return (
    <div className="flex flex-col gap-6">
      <header>
        <p className="text-xs uppercase tracking-[0.32em] text-[var(--muted)]">
          New Course
        </p>
        <h2 className="text-3xl font-semibold">Create a new course</h2>
        <p className="mt-2 text-sm text-[var(--muted)]">
          Add a course to organize topics, notes, and materials.
        </p>
      </header>
      <div className="app-surface rounded-[32px] p-6">
        <CourseForm />
      </div>
    </div>
  );
}
