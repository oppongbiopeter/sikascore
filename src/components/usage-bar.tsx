import { cn } from "@/lib/utils";

type UsageBarProps = {
  pct: number;
  className?: string;
};

export function UsageBar({ pct, className }: UsageBarProps) {
  const clamped = Math.min(1, Math.max(0, pct));
  return (
    <div
      className={cn("h-1.5 w-full overflow-hidden rounded-full bg-surface-2", className)}
      role="meter"
      aria-valuenow={Math.round(clamped * 100)}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div
        className="h-full rounded-full"
        style={{
          width: `${clamped * 100}%`,
          background:
            "linear-gradient(90deg, var(--color-gauge-mint), var(--color-gauge-yellow), var(--color-gauge-orange), var(--color-gauge-red))",
        }}
      />
    </div>
  );
}
