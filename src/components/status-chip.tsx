import { BAND_COLOR, BAND_LABEL } from "@/lib/credit/model";
import type { ScoreBand } from "@/lib/credit/types";
import { cn } from "@/lib/utils";

export function StatusChip({ status, className }: { status: ScoreBand; className?: string }) {
  return (
    <span
      className={cn("text-sm font-medium", className)}
      style={{ color: BAND_COLOR[status] }}
    >
      {BAND_LABEL[status]}
    </span>
  );
}
