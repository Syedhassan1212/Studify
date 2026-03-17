export default function AppLoading() {
  return (
    <div className="flex flex-col gap-6 animate-pulse">
      <div className="app-surface rounded-[28px] p-6">
        <div className="h-3 w-28 rounded bg-[color:var(--surface-2)]" />
        <div className="mt-3 h-8 w-72 rounded bg-[color:var(--surface-2)]" />
        <div className="mt-3 h-4 w-96 max-w-full rounded bg-[color:var(--surface-2)]" />
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="app-surface rounded-[28px] p-6">
          <div className="h-5 w-36 rounded bg-[color:var(--surface-2)]" />
          <div className="mt-5 space-y-3">
            <div className="h-16 rounded-2xl bg-[color:var(--surface-2)]" />
            <div className="h-16 rounded-2xl bg-[color:var(--surface-2)]" />
            <div className="h-16 rounded-2xl bg-[color:var(--surface-2)]" />
          </div>
        </div>
        <div className="app-surface rounded-[28px] p-6">
          <div className="h-5 w-32 rounded bg-[color:var(--surface-2)]" />
          <div className="mt-5 space-y-3">
            <div className="h-12 rounded-2xl bg-[color:var(--surface-2)]" />
            <div className="h-12 rounded-2xl bg-[color:var(--surface-2)]" />
            <div className="h-12 rounded-2xl bg-[color:var(--surface-2)]" />
          </div>
        </div>
      </div>
    </div>
  );
}
