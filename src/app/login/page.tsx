import LoginForm from "./login-form";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--bg)] px-6 py-10">
      <div className="flex w-full max-w-5xl flex-col gap-10 rounded-[40px] bg-[color:var(--surface-2)] p-10 shadow-[0_40px_80px_rgba(27,58,75,0.12)] md:flex-row md:items-center">
        <div className="flex-1">
          <p className="text-xs uppercase tracking-[0.32em] text-[var(--muted)]">
            StudyOS
          </p>
          <h2 className="mt-4 text-3xl font-semibold">
            Your daily study system, powered by AI.
          </h2>
          <p className="mt-3 text-sm text-[var(--muted)]">
            Plan sessions, upload materials, and get AI tutoring with the context
            from your notes.
          </p>
          <ul className="mt-6 grid gap-3 text-sm text-[var(--muted)]">
            <li>Structured notes and topic workspaces</li>
            <li>RAG-powered AI answers with citations</li>
            <li>Spaced repetition and progress tracking</li>
          </ul>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}
