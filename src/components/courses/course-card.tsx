import Link from "next/link";
import type { CourseOverview } from "@/lib/types";
import ProgressBar from "@/components/ui/progress";

export default function CourseCard({ course }: { course: CourseOverview }) {
  return (
    <div className="app-surface rounded-[28px] p-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.32em] text-[var(--muted)]">Course</p>
          <Link
            href={`/courses/${course.id}`}
            className="text-2xl font-semibold text-[var(--ink)] hover:underline"
          >
            {course.name}
          </Link>
          <p className="mt-2 text-sm text-[var(--muted)]">{course.description}</p>
        </div>
        <div className="rounded-full bg-[color:var(--surface-2)] px-4 py-2 text-xs font-semibold text-[var(--muted)]">
          {course.topicsCompleted}/{course.topicsTotal} topics complete
        </div>
      </div>

      <div className="mt-4">
        <ProgressBar value={course.progress} />
        <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-[var(--muted)]">
          <span>{Math.round(course.progress * 100)}% mastered</span>
          <span>{course.quizzesCompleted} quizzes completed</span>
          <span>Next review: {course.nextReview}</span>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        <Link
          href={`/courses/${course.id}`}
          className="rounded-full bg-[color:var(--accent)] px-3 py-1 text-xs font-semibold text-white"
        >
          Open Course
        </Link>
        <Link
          href={`/courses/${course.id}`}
          className="rounded-full border border-[color:var(--accent)] px-3 py-1 text-xs font-semibold text-[color:var(--accent)]"
        >
          Add Topic
        </Link>
      </div>

      <div className="mt-6 grid gap-3">
        {course.topics.map((topic) => (
          <div key={topic.id} className="rounded-2xl bg-white p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold">{topic.title}</p>
                <p className="text-xs text-[var(--muted)]">
                  {topic.materials} materials - {topic.notes} notes - {topic.flashcards} flashcards
                </p>
              </div>
              <div className="rounded-full bg-[color:var(--surface-2)] px-3 py-1 text-xs font-semibold text-[var(--muted)]">
                {Math.round(topic.mastery * 100)}% mastery
              </div>
            </div>
            <div className="mt-3 grid gap-2 text-xs text-[var(--muted)] md:grid-cols-3">
              <span>{topic.quizzes} quizzes</span>
              <span>AI tutor ready</span>
              <span>Spaced review scheduled</span>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {[
                "Open Notes",
                "Ask AI",
                "Generate Quiz",
                "Make Flashcards",
              ].map((action) => (
                <button
                  key={action}
                  className="rounded-full bg-[color:var(--surface-2)] px-3 py-1 text-xs font-semibold text-[color:var(--accent)]"
                >
                  {action}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
