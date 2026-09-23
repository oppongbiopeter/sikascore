import { StatusChip } from "@/components/status-chip";
import { Sheet } from "@/components/sheet";
import { UsageBar } from "@/components/usage-bar";
import {
  accountUtilization,
  formatMoney,
  usageStatus,
} from "@/lib/credit/model";
import type { CreditAccount } from "@/lib/credit/types";

const PAYMENT_LABEL = {
  current: "Pays as agreed",
  late30: "30 days late",
  late60: "60 days late",
} as const;

export function AccountSheet({
  account,
  onClose,
}: {
  account: CreditAccount | null;
  onClose: () => void;
}) {
  const util = account ? accountUtilization(account) : null;

  return (
    <Sheet open={!!account} onOpenChange={(o) => !o && onClose()} title={account?.name ?? "Account"}>
      {account ? (
        <div className="flex flex-col gap-4">
          <p className="text-sm text-muted">
            {account.kind} · {account.status === "open" ? "Open" : "Closed"}
          </p>
          {util != null && account.limit ? (
            <div className="rounded-xl bg-surface p-5">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted">Credit usage</p>
                <StatusChip status={usageStatus(util)} />
              </div>
              <p className="mt-2 text-3xl font-semibold tabular-nums tracking-tight">
                {Math.round(util * 100)}%
              </p>
              <UsageBar pct={util} className="mt-4" />
              <div className="mt-3 flex justify-between text-sm text-muted">
                <span>{formatMoney(account.balance)} used</span>
                <span>{formatMoney(account.limit)} limit</span>
              </div>
            </div>
          ) : (
            <div className="rounded-xl bg-surface p-5">
              <p className="text-sm text-muted">Remaining balance</p>
              <p className="mt-2 text-3xl font-semibold tabular-nums tracking-tight">
                {formatMoney(account.balance)}
              </p>
              {account.original ? (
                <p className="mt-2 text-sm text-muted">
                  Original {formatMoney(account.original)}
                </p>
              ) : null}
            </div>
          )}
          <dl className="divide-y divide-border rounded-xl bg-surface px-5">
            <Row label="Payment status" value={PAYMENT_LABEL[account.paymentStatus]} />
            <Row
              label="Opened"
              value={new Date(`${account.opened}T00:00:00`).toLocaleDateString("en-US", {
                month: "short",
                year: "numeric",
              })}
            />
            <Row label="Reported" value={account.lastReported.replace("Last reported ", "")} />
          </dl>
        </div>
      ) : null}
    </Sheet>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-4">
      <dt className="text-sm text-muted">{label}</dt>
      <dd className="text-sm font-medium text-fg">{value}</dd>
    </div>
  );
}
