import Link from "next/link";
import { redirect } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { supabaseServer } from "@/lib/supabase/server";
import TopicForm from "./topic-form";
import { deleteTopic } from "./actions";
import KnowledgeGraph from "@/components/graph/knowledge-graph";

export default async function CourseDetailPage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const { courseId } = await params;
  const supabase = await supabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: course } = await supabase
    .from("courses")
    .select("id,name,description")
    .eq("id", courseId)
    .single();

  let resolvedCourse = course;
  if (!resolvedCourse) {
    const admin = supabaseAdmin();
    const { data: adminCourse } = await admin
      .from("courses")
      .select("id,name,description,user_id")
      .eq("id", courseId)
      .single();

    if (adminCourse && adminCourse.user_id === user.id) {
      resolvedCourse = {
        id: adminCourse.id,
        name: adminCourse.name,
        description: adminCourse.description,
      };
    }
  }

  if (!resolvedCourse) {
    const { data: userCourses } = await supabase
      .from("courses")
      .select("id,name,description")
      .order("created_at", { ascending: false });

    return (
      <div className="flex flex-col gap-6">
        <header>
          <p className="text-xs uppercase tracking-[0.32em] text-[var(--muted)]">Course</p>
          <h2 className="text-3xl font-semibold">Course not found</h2>
          <p className="mt-2 text-sm text-[var(--muted)]">
            We couldn&apos;t load that course. Pick one below.
          </p>
        </header>
        <div className="app-surface rounded-[32px] p-6">
          <div className="grid gap-3">
            {(userCourses ?? []).length === 0 ? (
              <div className="rounded-2xl bg-white p-4 text-sm text-[var(--muted)]">
                No courses yet. Create one from the Courses page.
              </div>
            ) : (
              (userCourses ?? []).map((item) => (
                <Link
                  key={item.id}
                  href={`/courses/${item.id}`}
                  className="rounded-2xl bg-white p-4 text-sm font-semibold text-[var(--ink)]"
                >
                  {item.name}
                </Link>
              ))
            )}
          </div>
        </div>
      </div>
    );
  }

  const { data: topics } = await supabase
    .from("topics")
    .select("id,title")
    .eq("course_id", resolvedCourse.id)
    .order("created_at", { ascending: true });

  const topicIds = (topics ?? []).map((topic) => topic.id);
  const { data: relations } =
    topicIds.length > 0
      ? await supabase
          .from("topic_relations")
          .select("from_topic_id,to_topic_id")
          .or(`from_topic_id.in.(${topicIds.join(",")}),to_topic_id.in.(${topicIds.join(",")})`)
      : { data: [] };

  return (
    <div className="flex flex-col gap-6">
      <header>
        <p className="text-xs uppercase tracking-[0.32em] text-[var(--muted)]">Course</p>
        <h2 className="text-3xl font-semibold">{resolvedCourse.name}</h2>
        <p className="mt-2 text-sm text-[var(--muted)]">
          {resolvedCourse.description ||
            "Pick a topic to open its workspace, upload materials, and start an AI study session."}
        </p>
      </header>
      <div className="app-surface rounded-[32px] p-6">
        <p className="text-sm text-[var(--muted)]">Topics</p>
        <div className="mt-4 grid gap-3">
          {(topics ?? []).length === 0 ? (
            <div className="rounded-2xl bg-white p-4 text-sm text-[var(--muted)]">
              No topics yet. Create one to start organizing materials.
            </div>
          ) : (
            (topics ?? []).map((topic) => (
              <div
                key={topic.id}
                className="flex items-center justify-between gap-3 rounded-2xl bg-white p-4"
              >
                <Link
                  href={`/courses/${resolvedCourse.id}/topics/${topic.id}`}
                  className="text-sm font-semibold text-[var(--ink)] hover:underline"
                >
                  {topic.title}
                </Link>
                <form action={deleteTopic}>
                  <input type="hidden" name="courseId" value={resolvedCourse.id} />
                  <input type="hidden" name="topicId" value={topic.id} />
                  <button
                    type="submit"
                    className="rounded-full border border-rose-200 px-3 py-1 text-xs font-semibold text-rose-600"
                  >
                    Delete
                  </button>
                </form>
              </div>
            ))
          )}
        </div>
        <div className="mt-6 border-t border-[color:var(--surface-2)] pt-4">
          <p className="text-xs uppercase tracking-[0.28em] text-[var(--muted)]">
            Add Topic
          </p>
          <TopicForm courseId={resolvedCourse.id} />
        </div>
      </div>

      <div className="app-surface rounded-[32px] p-6">
        <p className="text-xs uppercase tracking-[0.28em] text-[var(--muted)]">
          Knowledge Graph
        </p>
        <div className="mt-4">
          <KnowledgeGraph
            nodes={(topics ?? []).map((topic) => ({ id: topic.id, label: topic.title }))}
            edges={(relations ?? []).map((edge) => ({
              from: edge.from_topic_id,
              to: edge.to_topic_id,
            }))}
          />
        </div>
      </div>
    </div>
  );
}
