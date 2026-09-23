import { StatusChip } from "@/components/status-chip";
import { Sheet } from "@/components/sheet";
import type { FactorView } from "@/lib/credit/model";

export function FactorSheet({
  factor,
  onClose,
}: {
  factor: FactorView | null;
  onClose: () => void;
}) {
  return (
    <Sheet open={!!factor} onOpenChange={(o) => !o && onClose()} title={factor?.title ?? "Factor"}>
      {factor ? (
        <div className="flex flex-col gap-5">
          <div className="rounded-xl bg-surface p-5">
            <p className="text-sm text-muted">Where you stand</p>
            <div className="mt-2 flex items-end justify-between gap-3">
              <p className="text-2xl font-semibold tracking-tight tabular-nums text-fg">
                {factor.value}
              </p>
              <StatusChip status={factor.status} />
            </div>
            <p className="mt-3 text-sm text-muted">{factor.weight} of the score</p>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-fg">Why it matters</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted">{factor.detail}</p>
          </div>
          <div className="rounded-xl bg-surface p-5">
            <h3 className="text-sm font-semibold text-fg">What to do</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted">{factor.tip}</p>
          </div>
        </div>
      ) : null}
    </Sheet>
  );
}
