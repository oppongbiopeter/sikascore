import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronRight, Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { FactorSheet } from "@/components/factor-sheet";
import { ScoreRing } from "@/components/score-ring";
import { StatusChip } from "@/components/status-chip";
import { UsageBar } from "@/components/usage-bar";
import { useAccount } from "@/lib/account/store";
import { accountUtilization, applyBuilder, builderBoost, delta, factorsFor, formatMoney, scoreBand } from "@/lib/credit/model";
import { alertsFor } from "@/lib/credit/monitor";
import { PROFILES } from "@/lib/credit/profiles";
import { useCredit } from "@/lib/credit/store";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  const profileId = useCredit((s) => s.profileId);
  const hidden = useCredit((s) => s.hidden);
  const setHidden = useCredit((s) => s.setHidden);
  const builder = useCredit((s) => s.builder);
  const account = useAccount((s) => s.account);
  const readIds = useCredit((s) => s.readIds);
  const base = PROFILES.find((p) => p.id === profileId) ?? PROFILES[0];
  const profile = {
    ...applyBuilder(base, builder),
    name: account?.fullName || base.name,
  };
  const boost = builderBoost(builder);
  const change = delta(profile);
  const band = scoreBand(profile.score);
  const factors = factorsFor(profile);
  const [factorId, setFactorId] = useState<string | null>(null);
  const factor = factors.find((f) => f.id === factorId) ?? null;
  const revolving = profile.accounts.filter((a) => a.type === "revolving" && a.status === "open");
  const unread = alertsFor(profileId).filter((a) => !readIds.includes(a.id)).length;

  return (
    <AppShell>
      <header className="px-5 pt-6 pb-2">
        <p className="text-sm text-muted">SikaScore</p>
        <h1 className="text-2xl font-semibold tracking-tight">{profile.name}</h1>
      </header>

      <p className="px-5 text-xs text-subtle">
        {account?.cardPin || "Ghana Card"} · XDS, D&B, and MyCredit Score
      </p>

      <ScoreRing
        score={profile.score}
        hidden={hidden}
        updatedLabel={profile.updatedLabel}
        className="mt-6"
      />

      <div className="mx-5 mt-4 grid grid-cols-3 gap-2">
        {(
          [
            ["XDS", base.bureaus.xds],
            ["D&B", base.bureaus.dnb],
            ["MCS", base.bureaus.mcs],
          ] as const
        ).map(([label, score]) => (
          <div key={label} className="rounded-xl bg-surface px-2 py-3 text-center">
            <p className="text-[11px] text-muted">{label}</p>
            <p className="mt-1 text-lg font-semibold tabular-nums">{hidden ? "•••" : score + boost}</p>
          </div>
        ))}
      </div>
      <div className="mx-5 mt-3 flex flex-col items-center gap-2 text-sm">
        <div className="flex items-center gap-2">
          <StatusChip status={band} />
          {!hidden ? (
            <span className={change >= 0 ? "text-excellent" : "text-below"}>
              {change >= 0 ? "+" : ""}
              {change} this week
            </span>
          ) : (
            <span className="text-muted">Score hidden</span>
          )}
        </div>
        <button
          type="button"
          onClick={() => setHidden(!hidden)}
          className="flex min-h-11 items-center gap-2 rounded-full px-4 text-sm font-medium text-muted hover:bg-surface-2 hover:text-fg"
        >
          {hidden ? <Eye className="size-4" /> : <EyeOff className="size-4" />}
          {hidden ? "Show score" : "Hide score"}
        </button>
        {unread > 0 ? (
          <Link to="/alerts" className="text-sm font-medium text-below">
            {unread} monitoring {unread === 1 ? "alert" : "alerts"}
          </Link>
        ) : null}
      </div>

      <section className="mt-8 px-5">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold">Score factors</h2>
          <Link to="/score" className="text-sm text-muted">
            See all
          </Link>
        </div>
        <ul className="mt-3 overflow-hidden rounded-xl bg-surface">
          {factors.slice(0, 3).map((f) => (
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

      <section className="mt-8 px-5 pb-6">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold">Credit usage by account</h2>
          <Link to="/score" className="text-sm text-muted">
            Details
          </Link>
        </div>
        <ul className="mt-3 flex flex-col gap-3">
          {revolving.map((a) => {
            const util = accountUtilization(a) ?? 0;
            return (
              <li key={a.id} className="rounded-xl bg-surface p-4">
                <div className="flex items-baseline justify-between gap-3">
                  <p className="text-sm font-semibold uppercase tracking-wide">{a.name}</p>
                  <p className="text-sm font-semibold tabular-nums">{Math.round(util * 100)}%</p>
                </div>
                <p className="mt-1 text-xs text-muted">{a.lastReported}</p>
                <UsageBar pct={util} className="mt-3" />
                <div className="mt-2 flex justify-between text-xs text-muted">
                  <span>{formatMoney(a.balance)} used</span>
                  <span>{formatMoney(a.limit ?? 0)} limit</span>
                </div>
              </li>
            );
          })}
        </ul>
        <Button asChild className="mt-5 w-full">
          <Link to="/build">{builder.enrolled ? "Open Credit Builder" : "Start loan and card"}</Link>
        </Button>
        <Button asChild variant="secondary" className="mt-3 w-full">
          <Link to="/score">Open Credit Score</Link>
        </Button>
      </section>

      <FactorSheet factor={factor} onClose={() => setFactorId(null)} />
    </AppShell>
  );
}
