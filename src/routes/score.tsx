import { createFileRoute } from "@tanstack/react-router";
import { ChevronRight, Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { AccountSheet } from "@/components/account-sheet";
import { AppShell } from "@/components/app-shell";
import { FactorSheet } from "@/components/factor-sheet";
import { HistoryChart } from "@/components/history-chart";
import { ScoreRing } from "@/components/score-ring";
import { StatusChip } from "@/components/status-chip";
import { UsageBar } from "@/components/usage-bar";
import {
  BAND_LABEL,
  BAND_RANGE,
  accountUtilization,
  applyBuilder,
  availableCredit,
  builderBoost,
  delta,
  factorsFor,
  formatMoney,
  scoreBand,
  totalLimit,
  utilization,
} from "@/lib/credit/model";
import { PROFILES } from "@/lib/credit/profiles";
import { useCredit } from "@/lib/credit/store";
import type { CreditAccount } from "@/lib/credit/types";

export const Route = createFileRoute("/score")({ component: ScorePage });

function ScorePage() {
  const profileId = useCredit((s) => s.profileId);
  const hidden = useCredit((s) => s.hidden);
  const setHidden = useCredit((s) => s.setHidden);
  const builder = useCredit((s) => s.builder);
  const base = PROFILES.find((p) => p.id === profileId) ?? PROFILES[0];
  const profile = applyBuilder(base, builder);
  const boost = builderBoost(builder);
  const change = delta(profile);
  const band = scoreBand(profile.score);
  const factors = factorsFor(profile);
  const [factorId, setFactorId] = useState<string | null>(null);
  const [account, setAccount] = useState<CreditAccount | null>(null);
  const factor = factors.find((f) => f.id === factorId) ?? null;
  const revolving = profile.accounts.filter((a) => a.type === "revolving" && a.status === "open");
  const util = utilization(profile.accounts);
  const avail = availableCredit(profile.accounts);
  const limit = totalLimit(profile.accounts);

  return (
    <AppShell>
      <header className="px-5 pt-6 pb-2">
        <h1 className="text-2xl font-semibold tracking-tight">Credit Score</h1>
      </header>

      <ScoreRing
        score={profile.score}
        hidden={hidden}
        updatedLabel={profile.updatedLabel}
        className="mt-4"
      />

      <div className="flex justify-center">
        <button
          type="button"
          onClick={() => setHidden(!hidden)}
          className="flex min-h-11 items-center gap-2 rounded-full px-4 text-sm font-medium text-muted hover:bg-surface-2 hover:text-fg"
        >
          {hidden ? <Eye className="size-4" /> : <EyeOff className="size-4" />}
          {hidden ? "Show score" : "Hide score"}
        </button>
      </div>

      <div className="mx-5 mt-3 rounded-xl bg-surface p-4">
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted">This week</p>
          <StatusChip status={band} />
        </div>
        <p className="mt-1 text-xl font-semibold tabular-nums">
          {hidden ? "•••" : (
            <>
              {change >= 0 ? "+" : ""}
              {change}{" "}
              <span className="text-sm font-medium text-muted">
                {BAND_LABEL[band]} · {BAND_RANGE[band]}
              </span>
            </>
          )}
        </p>
        <p className="mt-2 text-xs leading-relaxed text-subtle">
          Combined score from the three licensed bureaus, on a 300–850 scale. Looking up your own file does not lower it.
          {boost > 0 ? ` Builder activity is adding ${boost} points in this demo.` : ""}
        </p>
      </div>

      <section className="mt-8 px-5">
        <h2 className="text-base font-semibold">Track changes over time</h2>
        <p className="mt-1 text-sm text-muted">Weekly snapshots from this sample file.</p>
        <div className="mt-4 rounded-xl bg-surface p-3 pt-4">
          <HistoryChart history={profile.history} />
        </div>
      </section>

      <section className="mt-8 px-5">
        <h2 className="text-base font-semibold">Score factors</h2>
        <p className="mt-1 text-sm text-muted">Where you stand on the drivers of this model.</p>
        <ul className="mt-3 overflow-hidden rounded-xl bg-surface">
          {factors.map((f) => (
            <li key={f.id} className="border-b border-border last:border-b-0">
              <button
                type="button"
                onClick={() => setFactorId(f.id)}
                className="flex min-h-16 w-full items-center gap-3 px-4 py-3 text-left"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-fg">{f.title}</p>
                  <p className="truncate text-sm text-muted">{f.value}</p>
                </div>
                <StatusChip status={f.status} />
                <ChevronRight className="size-4 text-subtle" />
              </button>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-8 px-5">
        <h2 className="text-base font-semibold">Credit usage by account</h2>
        <p className="mt-1 text-sm text-muted">
          {Math.round(util * 100)}% used · {formatMoney(avail)} available of {formatMoney(limit)}
        </p>
        <ul className="mt-3 flex flex-col gap-3">
          {revolving.map((a) => {
            const u = accountUtilization(a) ?? 0;
            return (
              <li key={a.id}>
                <button
                  type="button"
                  onClick={() => setAccount(a)}
                  className="w-full rounded-xl bg-surface p-4 text-left"
                >
                  <div className="flex items-baseline justify-between gap-3">
                    <p className="text-sm font-semibold uppercase tracking-wide">{a.name}</p>
                    <p className="text-sm font-semibold tabular-nums">{Math.round(u * 100)}%</p>
                  </div>
                  <p className="mt-1 text-xs text-muted">{a.lastReported}</p>
                  <UsageBar pct={u} className="mt-3" />
                  <div className="mt-2 flex justify-between text-xs text-muted">
                    <span>{formatMoney(a.balance)} used</span>
                    <span>{formatMoney(a.limit ?? 0)} limit</span>
                  </div>
                </button>
              </li>
            );
          })}
        </ul>
      </section>

      <section className="mt-8 px-5 pb-8">
        <h2 className="text-base font-semibold">Accounts that impact your score</h2>
        <ul className="mt-3 overflow-hidden rounded-xl bg-surface">
          {profile.accounts.map((a) => (
            <li key={a.id} className="border-b border-border last:border-b-0">
              <button
                type="button"
                onClick={() => setAccount(a)}
                className="flex min-h-16 w-full items-center gap-3 px-4 py-3 text-left"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-fg">{a.name}</p>
                  <p className="text-sm text-muted">
                    {a.kind} · {formatMoney(a.balance)}
                  </p>
                </div>
                <ChevronRight className="size-4 text-subtle" />
              </button>
            </li>
          ))}
        </ul>
        <p className="mt-4 text-xs leading-relaxed text-subtle">
          Demo file shaped like a Ghana bureau pull. SikaScore is not connected to XDS, Dun & Bradstreet, or MyCredit Score, and this check is not a live report.
        </p>
      </section>

      <FactorSheet factor={factor} onClose={() => setFactorId(null)} />
      <AccountSheet account={account} onClose={() => setAccount(null)} />
    </AppShell>
  );
}
