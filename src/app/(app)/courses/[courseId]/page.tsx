import Link from "next/link";
import { notFound } from "next/navigation";
import { supabaseServer } from "@/lib/supabase/server";
import TopicForm from "./topic-form";
import KnowledgeGraph from "@/components/graph/knowledge-graph";

export default async function CourseDetailPage({
  params,
}: {
  params: { courseId: string };
}) {
  const supabase = await supabaseServer();
  const { data: course } = await supabase
    .from("courses")
    .select("id,name,description")
    .eq("id", params.courseId)
    .single();

  if (!course) {
    notFound();
  }

  const { data: topics } = await supabase
    .from("topics")
    .select("id,title")
    .eq("course_id", course.id)
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
        <h2 className="text-3xl font-semibold">{course.name}</h2>
        <p className="mt-2 text-sm text-[var(--muted)]">
          {course.description ||
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
              <Link
                key={topic.id}
                href={`/courses/${course.id}/topics/${topic.id}`}
                className="rounded-2xl bg-white p-4 text-sm font-semibold text-[var(--ink)]"
              >
                {topic.title}
              </Link>
            ))
          )}
        </div>
        <div className="mt-6 border-t border-[color:var(--surface-2)] pt-4">
          <p className="text-xs uppercase tracking-[0.28em] text-[var(--muted)]">
            Add Topic
          </p>
          <TopicForm courseId={course.id} />
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
