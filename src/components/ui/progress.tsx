import { cn } from "@/lib/utils";

export default function ProgressBar({
  value,
  className,
}: {
  value: number;
  className?: string;
}) {
  const percent = Math.max(0, Math.min(100, Math.round(value * 100)));
  return (
    <div className={cn("h-2 w-full rounded-full bg-[color:var(--surface-3)]", className)}>
      <div
        className="h-full rounded-full bg-[color:var(--accent)]"
        style={{ width: `${percent}%` }}
      />
    </div>
  );
}
