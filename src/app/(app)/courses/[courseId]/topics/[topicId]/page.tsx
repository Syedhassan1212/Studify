import NoteForm from "./note-form";
import MaterialUploadForm from "./material-upload-form";
import FlashcardReview from "./flashcard-review";
import AiAssistantPanel from "@/components/ai/ai-assistant-panel";
import FlashcardGenerator from "@/components/ai/flashcard-generator";
import QuizGenerator from "@/components/ai/quiz-generator";
import NoteSummarizer from "@/components/ai/note-summarizer";
import QuizResultForm from "./quiz-result-form";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/card";
import { notFound } from "next/navigation";
import { supabaseServer } from "@/lib/supabase/server";

export default async function TopicWorkspacePage({
  params,
}: {
  params: Promise<{ courseId: string; topicId: string }>;
}) {
  const { courseId, topicId } = await params;
  const supabase = await supabaseServer();
  const { data: topic } = await supabase
    .from("topics")
    .select("id,title,course_id")
    .eq("id", topicId)
    .eq("course_id", courseId)
    .single();

  if (!topic) {
    notFound();
  }

  const [{ data: materials }, { data: flashcards }, { data: quizzes }, { data: note }] =
    await Promise.all([
      supabase.from("materials").select("id,file_name,file_url").eq("topic_id", topic.id),
      supabase.from("flashcards").select("id,front,back").eq("topic_id", topic.id),
      supabase.from("quizzes").select("id,questions").eq("topic_id", topic.id),
      supabase
        .from("notes")
        .select("id,content")
        .eq("topic_id", topic.id)
        .order("updated_at", { ascending: false })
        .limit(1)
        .maybeSingle(),
    ]);

  const initialContent =
    typeof note?.content?.text === "string" ? note.content.text : "";

  return (
    <div className="flex flex-col gap-6">
      <header>
        <p className="text-xs uppercase tracking-[0.32em] text-[var(--muted)]">Topic Workspace</p>
        <h2 className="text-3xl font-semibold">Study focus: {topic.title}</h2>
        <p className="mt-2 text-sm text-[var(--muted)]">
          Materials, notes, AI tutoring, flashcards, and quizzes live side by side.
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Materials</CardTitle>
            </CardHeader>
            <CardBody>
              <MaterialUploadForm courseId={courseId} topicId={topic.id} />
              <div className="mt-4 grid gap-3 text-sm">
                {(materials ?? []).length === 0 ? (
                  <div className="rounded-2xl bg-white p-3 text-xs text-[var(--muted)]">
                    No materials yet.
                  </div>
                ) : (
                  (materials ?? []).map((file) => (
                    <div key={file.id} className="rounded-2xl bg-white p-3">
                      <p className="font-semibold">{file.file_name ?? "Untitled material"}</p>
                      <p className="text-xs text-[var(--muted)]">
                        {file.file_url ? "Stored in Supabase Storage" : "Pending upload"}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Notes Studio</CardTitle>
            </CardHeader>
            <CardBody>
              <NoteForm
                courseId={courseId}
                topicId={topic.id}
                initialContent={initialContent}
              />
              <div className="mt-4">
                <NoteSummarizer notes={initialContent} />
              </div>
            </CardBody>
          </Card>
        </div>

        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle>AI Assistant</CardTitle>
            </CardHeader>
            <CardBody>
              <AiAssistantPanel topicId={topic.id} />
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Flashcards</CardTitle>
            </CardHeader>
            <CardBody>
              <FlashcardGenerator topicId={topic.id} notes={initialContent} />
              <div className="mt-4 grid gap-3 text-sm">
                {(flashcards ?? []).length === 0 ? (
                  <div className="rounded-2xl bg-white p-3 text-xs text-[var(--muted)]">
                    No flashcards yet.
                  </div>
                ) : (
                  (flashcards ?? []).map((card) => (
                    <div key={card.id} className="rounded-2xl bg-white p-3">
                      <p className="font-semibold">{card.front}</p>
                      <p className="text-xs text-[var(--muted)]">Tap to reveal answer</p>
                      <FlashcardReview
                        courseId={courseId}
                        topicId={topic.id}
                        flashcardId={card.id}
                      />
                    </div>
                  ))
                )}
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quizzes</CardTitle>
            </CardHeader>
            <CardBody>
              <QuizGenerator topicId={topic.id} topicTitle={topic.title} />
              <QuizResultForm courseId={courseId} topicId={topic.id} quizzes={quizzes ?? []} />
              <div className="mt-4 grid gap-2 text-sm">
                {(quizzes ?? []).length === 0 ? (
                  <div className="rounded-2xl bg-white p-3 text-xs text-[var(--muted)]">
                    No quizzes yet.
                  </div>
                ) : (
                  (quizzes ?? []).map((quiz, index) => (
                    <div key={quiz.id} className="rounded-2xl bg-white p-3">
                      <p className="font-semibold">Quiz {index + 1}</p>
                      <p className="text-xs text-[var(--muted)]">
                        {Array.isArray(quiz.questions) ? quiz.questions.length : 0} questions
                      </p>
                    </div>
                  ))
                )}
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}
