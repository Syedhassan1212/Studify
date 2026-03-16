import { cn } from "@/lib/utils";

const typeStyles: Record<string, string> = {
  assignment: "bg-[color:var(--accent-2)] text-[color:var(--ink)]",
  quiz: "bg-[color:var(--accent)] text-white",
  exam: "bg-[color:var(--accent-3)] text-white",
  study: "bg-[color:var(--success)] text-white",
  review: "bg-[color:var(--accent)] text-white",
};

export default function Pill({
  label,
  type,
}: {
  label: string;
  type: keyof typeof typeStyles;
}) {
  return (
    <span
      className={cn(
        "rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em]",
        typeStyles[type],
      )}
    >
      {label}
    </span>
  );
}
