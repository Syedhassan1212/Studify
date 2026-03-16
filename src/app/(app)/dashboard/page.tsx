import Link from "next/link";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/card";
import Pill from "@/components/ui/pill";
import ProgressBar from "@/components/ui/progress";
import { getDashboardData } from "@/lib/study-data";

export default async function DashboardPage() {
  const { courses, reviewQueue, studyStreak, tasks, weakTopics } =
    await getDashboardData();

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.32em] text-[var(--muted)]">
            Dashboard
          </p>
          <h2 className="text-3xl font-semibold">Your study command center.</h2>
          <p className="mt-2 text-sm text-[var(--muted)]">
            Track progress, spot weak topics, and launch AI-powered sessions from one place.
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/courses"
            className="rounded-full border border-[color:var(--accent)] px-4 py-2 text-sm font-semibold text-[color:var(--accent)]"
          >
            Generate Quiz
          </Link>
          <Link
            href="/courses"
            className="rounded-full bg-[color:var(--accent)] px-4 py-2 text-sm font-semibold text-white"
          >
            Upload Material
          </Link>
        </div>
      </header>

      <section className="grid gap-4 md:grid-cols-3">
        <Card className="animate-rise">
          <CardHeader>
            <CardTitle>Study Streak</CardTitle>
          </CardHeader>
          <CardBody>
            <div className="text-4xl font-semibold">{studyStreak.current} days</div>
            <p className="text-sm text-[var(--muted)]">Longest: {studyStreak.longest} days</p>
            <div className="mt-2 rounded-2xl bg-[color:var(--surface-2)] px-3 py-2 text-xs uppercase tracking-[0.22em] text-[var(--muted)]">
              Active {studyStreak.lastActive}
            </div>
          </CardBody>
        </Card>
        <Card className="animate-rise">
          <CardHeader>
            <CardTitle>Review Queue</CardTitle>
          </CardHeader>
          <CardBody>
            <div className="flex items-end justify-between">
              <div>
                <p className="text-3xl font-semibold">{reviewQueue.dueToday}</p>
                <p className="text-sm text-[var(--muted)]">Due today</p>
              </div>
              <div>
                <p className="text-2xl font-semibold">{reviewQueue.dueTomorrow}</p>
                <p className="text-sm text-[var(--muted)]">Due tomorrow</p>
              </div>
            </div>
            <div className="mt-2 text-sm text-[var(--muted)]">
              Backlog: {reviewQueue.backlog} cards
            </div>
          </CardBody>
        </Card>
        <Card className="animate-rise">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardBody>
            <div className="grid gap-2">
              {[
                { label: "Create Course", href: "/courses/new" },
                { label: "Generate Flashcards", href: "/courses" },
                { label: "Summarize Notes", href: "/courses" },
                { label: "Start AI Study Session", href: "/courses" },
              ].map((action) => (
                <Link
                  key={action.label}
                  href={action.href}
                  className="rounded-2xl bg-[color:var(--surface-2)] px-3 py-2 text-left text-sm font-semibold text-[color:var(--accent)]"
                >
                  {action.label}
                </Link>
              ))}
            </div>
          </CardBody>
        </Card>
      </section>

      <section className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <Card className="animate-rise">
          <CardHeader>
            <CardTitle>Courses Overview</CardTitle>
            <button className="rounded-full border border-[color:var(--accent)] px-3 py-1 text-xs font-semibold text-[color:var(--accent)]">
              View all
            </button>
          </CardHeader>
          <CardBody>
            <div className="grid gap-4">
              {courses.length === 0 ? (
                <div className="rounded-2xl bg-white p-4 text-sm text-[var(--muted)]">
                  No courses yet. Create your first course to start tracking progress.
                </div>
              ) : (
                courses.map((course) => (
                  <div key={course.id} className="rounded-2xl bg-white p-4">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="text-lg font-semibold">{course.name}</p>
                        <p className="text-sm text-[var(--muted)]">
                          {course.description ?? "No description yet."}
                        </p>
                      </div>
                      <div className="rounded-full bg-[color:var(--surface-2)] px-3 py-1 text-xs font-semibold text-[var(--muted)]">
                        {course.topicsCompleted}/{course.topicsTotal} topics
                      </div>
                    </div>
                    <div className="mt-4">
                      <ProgressBar value={course.progress} />
                      <div className="mt-2 flex items-center justify-between text-xs text-[var(--muted)]">
                        <span>{Math.round(course.progress * 100)}% complete</span>
                        <span>{course.quizzesCompleted} quizzes done</span>
                        <span>{course.nextReview}</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardBody>
        </Card>

        <div className="grid gap-6">
          <Card className="animate-rise">
            <CardHeader>
              <CardTitle>Upcoming Tasks</CardTitle>
            </CardHeader>
            <CardBody>
              <div className="grid gap-3">
                {tasks.length === 0 ? (
                  <div className="rounded-2xl bg-white p-3 text-xs text-[var(--muted)]">
                    No upcoming tasks yet.
                  </div>
                ) : (
                  tasks.map((task) => (
                    <div key={task.id} className="rounded-2xl bg-white p-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-semibold">{task.title}</p>
                          <p className="text-xs text-[var(--muted)]">{task.course ?? "No course"}</p>
                        </div>
                        <Pill label={task.type} type={task.type} />
                      </div>
                      <p className="mt-2 text-xs text-[var(--muted)]">{task.due}</p>
                    </div>
                  ))
                )}
              </div>
            </CardBody>
          </Card>

          <Card className="animate-rise">
            <CardHeader>
              <CardTitle>Weak Topics</CardTitle>
            </CardHeader>
            <CardBody>
              <div className="grid gap-3">
                {weakTopics.length === 0 ? (
                  <div className="rounded-2xl bg-white p-3 text-xs text-[var(--muted)]">
                    No weak topics yet. Complete a quiz to populate insights.
                  </div>
                ) : (
                  weakTopics.map((topic) => (
                    <div key={topic.id} className="rounded-2xl bg-white p-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-semibold">{topic.title}</p>
                          <p className="text-xs text-[var(--muted)]">{topic.course}</p>
                        </div>
                        <span className="rounded-full bg-[color:var(--surface-2)] px-3 py-1 text-xs font-semibold text-[var(--muted)]">
                          {Math.round(topic.accuracy * 100)}% accuracy
                        </span>
                      </div>
                      <p className="mt-2 text-xs text-[var(--muted)]">
                        Last reviewed {topic.lastReviewed}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </CardBody>
          </Card>
        </div>
      </section>
    </div>
  );
}
