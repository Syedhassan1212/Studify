import NoteEditor from "@/components/notes/note-editor";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/card";

export default function TopicWorkspacePage() {
  return (
    <div className="flex flex-col gap-6">
      <header>
        <p className="text-xs uppercase tracking-[0.32em] text-[var(--muted)]">Topic Workspace</p>
        <h2 className="text-3xl font-semibold">Study focus: Graph Theory</h2>
        <p className="mt-2 text-sm text-[var(--muted)]">
          Materials, notes, AI tutoring, flashcards, and quizzes live side by side.
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Materials</CardTitle>
              <button className="rounded-full bg-[color:var(--accent)] px-3 py-1 text-xs font-semibold text-white">
                Upload PDF
              </button>
            </CardHeader>
            <CardBody>
              <div className="grid gap-3 text-sm">
                {["Lecture 12 - Graphs.pdf", "BFS Cheat Sheet.txt", "Shortest Paths Notes.pdf"].map(
                  (file) => (
                    <div key={file} className="rounded-2xl bg-white p-3">
                      <p className="font-semibold">{file}</p>
                      <p className="text-xs text-[var(--muted)]">Embedded for semantic search</p>
                    </div>
                  ),
                )}
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Notes Studio</CardTitle>
              <button className="rounded-full border border-[color:var(--accent)] px-3 py-1 text-xs font-semibold text-[color:var(--accent)]">
                Summarize
              </button>
            </CardHeader>
            <CardBody>
              <NoteEditor />
            </CardBody>
          </Card>
        </div>

        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle>AI Assistant</CardTitle>
              <button className="rounded-full bg-[color:var(--accent-2)] px-3 py-1 text-xs font-semibold text-[var(--ink)]">
                Explain Like I'm Dumb
              </button>
            </CardHeader>
            <CardBody>
              <div className="rounded-2xl bg-white p-4 text-sm text-[var(--muted)]">
                Ask questions, get contextual answers from your notes and materials. The AI will cite
                relevant chunks.
              </div>
              <input
                className="mt-3 w-full rounded-full border border-[color:var(--surface-2)] bg-white px-4 py-2 text-sm"
                placeholder="Ask about Dijkstra, BFS, or MST..."
              />
              <button className="mt-2 rounded-full bg-[color:var(--accent)] px-4 py-2 text-sm font-semibold text-white">
                Ask AI
              </button>
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Flashcards</CardTitle>
              <button className="rounded-full border border-[color:var(--accent)] px-3 py-1 text-xs font-semibold text-[color:var(--accent)]">
                Generate
              </button>
            </CardHeader>
            <CardBody>
              <div className="grid gap-3 text-sm">
                {["Define BFS", "What is Dijkstra's algorithm?", "Explain edge relaxation"].map(
                  (front) => (
                    <div key={front} className="rounded-2xl bg-white p-3">
                      <p className="font-semibold">{front}</p>
                      <p className="text-xs text-[var(--muted)]">Tap to reveal answer</p>
                    </div>
                  ),
                )}
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quizzes</CardTitle>
              <button className="rounded-full bg-[color:var(--accent)] px-3 py-1 text-xs font-semibold text-white">
                Generate Quiz
              </button>
            </CardHeader>
            <CardBody>
              <div className="grid gap-2 text-sm">
                <div className="rounded-2xl bg-white p-3">
                  <p className="font-semibold">Graph Theory Checkpoint</p>
                  <p className="text-xs text-[var(--muted)]">8 questions · 75% avg</p>
                </div>
                <div className="rounded-2xl bg-white p-3">
                  <p className="font-semibold">Shortest Paths Drill</p>
                  <p className="text-xs text-[var(--muted)]">5 questions · 62% avg</p>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}
