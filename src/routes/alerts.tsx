import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { applyBuilder, BAND_LABEL, formatMoney, scoreBand } from "@/lib/credit/model";
import {
  ANNUAL_REPORT,
  BUREAUS,
  DISPUTE_REASONS,
  alertsFor,
  collectionsFor,
  disputeLetter,
  inquiriesFor,
  revolvingUsed,
  simulateScore,
  type AlertLevel,
  type DisputeReason,
} from "@/lib/credit/monitor";
import { PROFILES } from "@/lib/credit/profiles";
import { useCredit } from "@/lib/credit/store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/alerts")({ component: MonitorPage });

const LEVEL: Record<AlertLevel, string> = {
  info: "text-muted",
  watch: "text-average",
  urgent: "text-below",
};

function MonitorPage() {
  const profileId = useCredit((s) => s.profileId);
  const builder = useCredit((s) => s.builder);
  const readIds = useCredit((s) => s.readIds);
  const markRead = useCredit((s) => s.markRead);
  const markAllRead = useCredit((s) => s.markAllRead);
  const base = PROFILES.find((p) => p.id === profileId) ?? PROFILES[0];
  const profile = applyBuilder(base, builder);
  const alerts = alertsFor(profileId);
  const inquiries = inquiriesFor(profileId);
  const collections = collectionsFor(profileId);
  const hard = inquiries.filter((i) => i.kind === "hard");
  const used = revolvingUsed(profile);

  const [paydown, setPaydown] = useState(0);
  const [newInquiry, setNewInquiry] = useState(false);
  const [missed, setMissed] = useState(false);
  const paid = Math.min(paydown, used);
  const sim = simulateScore(profile, paid, newInquiry, missed);

  const items = [
    ...profile.accounts.map((a) => a.name),
    ...collections.map((c) => `${c.agency} collection`),
  ];
  const [item, setItem] = useState(items[0] ?? "");
  const selected = items.includes(item) ? item : (items[0] ?? "");
  const [reason, setReason] = useState<DisputeReason>(DISPUTE_REASONS[0]);
  const [bureauName, setBureauName] = useState<(typeof BUREAUS)[number]["name"]>("XDS Data Ghana");
  const bureau = BUREAUS.find((b) => b.name === bureauName) ?? BUREAUS[0];
  const letter = disputeLetter({
    name: profile.name,
    item: selected,
    reason,
    bureauMail: bureau.mail,
  });
  const [copied, setCopied] = useState(false);

  return (
    <AppShell>
      <header className="px-5 pt-6 pb-2">
        <p className="text-sm text-muted">SikaScore</p>
        <h1 className="text-2xl font-semibold tracking-tight">Monitor</h1>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          Alerts and a score simulator on the file that was pulled. Bureau sites open for real disputes.
        </p>
      </header>

      <section className="mt-6 px-5">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold">Alerts</h2>
          {alerts.some((a) => !readIds.includes(a.id)) ? (
            <button
              type="button"
              onClick={() => markAllRead(alerts.map((a) => a.id))}
              className="min-h-11 text-sm text-muted"
            >
              Mark read
            </button>
          ) : null}
        </div>
        <ul className="mt-3 overflow-hidden rounded-xl bg-surface">
          {alerts.map((a) => {
            const unread = !readIds.includes(a.id);
            return (
              <li key={a.id} className="border-b border-border last:border-b-0">
                <button
                  type="button"
                  onClick={() => markRead(a.id)}
                  className="flex w-full flex-col gap-1 px-4 py-3 text-left"
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-medium">
                      {unread ? <span className="mr-2 inline-block size-1.5 rounded-full bg-below align-middle" /> : null}
                      {a.title}
                    </p>
                    <span className={cn("shrink-0 text-xs font-medium uppercase tracking-wide", LEVEL[a.level])}>
                      {a.level}
                    </span>
                  </div>
                  <p className="text-sm leading-relaxed text-muted">{a.body}</p>
                  <p className="text-xs text-subtle">{a.date}</p>
                </button>
              </li>
            );
          })}
        </ul>
      </section>

      <section className="mt-8 px-5">
        <h2 className="text-base font-semibold">Score simulator</h2>
        <p className="mt-1 text-sm text-muted">
          Estimate only. Bureaus do not publish the exact score math.
        </p>
        <div className="mt-3 rounded-xl bg-surface p-5">
          <div className="flex items-end justify-between">
            <div>
              <p className="text-sm text-muted">Projected</p>
              <p className="mt-1 text-3xl font-semibold tabular-nums tracking-tight">{sim.score}</p>
            </div>
            <p className={cn("text-sm tabular-nums", sim.delta >= 0 ? "text-excellent" : "text-below")}>
              {sim.delta >= 0 ? "+" : ""}
              {sim.delta}
            </p>
          </div>
          <p className="mt-1 text-xs text-subtle">
            Now {profile.score} · {BAND_LABEL[scoreBand(sim.score)]} · usage {Math.round(sim.newUtil * 100)}%
          </p>
          <label className="mt-5 block text-sm">
            <span className="flex justify-between">
              <span>Pay down revolving</span>
              <span className="tabular-nums text-muted">{formatMoney(paid)}</span>
            </span>
            <input
              type="range"
              min={0}
              max={Math.max(used, 1)}
              step={25}
              value={paid}
              disabled={used === 0}
              onChange={(e) => setPaydown(Number(e.target.value))}
              className="mt-3 w-full accent-lime"
            />
          </label>
          <div className="mt-4 flex flex-col gap-2">
            <Toggle on={newInquiry} label="Add a hard inquiry" onClick={() => setNewInquiry((v) => !v)} />
            <Toggle on={missed} label="Miss a payment" onClick={() => setMissed((v) => !v)} />
          </div>
        </div>
      </section>

      <section className="mt-8 px-5">
        <h2 className="text-base font-semibold">Inquiries</h2>
        <p className="mt-1 text-sm text-muted">{hard.length} lender checks in the last 24 months. Looking at your own file does not count.</p>
        <ul className="mt-3 overflow-hidden rounded-xl bg-surface">
          {inquiries.map((q) => (
            <li
              key={q.id}
              className="flex items-center justify-between gap-3 border-b border-border px-4 py-3 last:border-b-0"
            >
              <div>
                <p className="text-sm font-medium">{q.creditor}</p>
                <p className="text-xs text-subtle">{q.date}</p>
              </div>
              <span className={cn("text-xs font-medium uppercase tracking-wide", q.kind === "hard" ? "text-average" : "text-muted")}>
                {q.kind}
              </span>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-8 px-5">
        <h2 className="text-base font-semibold">Collections</h2>
        {collections.length === 0 ? (
          <p className="mt-3 rounded-xl bg-surface px-4 py-4 text-sm text-muted">None on this file.</p>
        ) : (
          <ul className="mt-3 overflow-hidden rounded-xl bg-surface">
            {collections.map((c) => (
              <li key={c.id} className="border-b border-border px-4 py-3 last:border-b-0">
                <div className="flex items-baseline justify-between gap-3">
                  <p className="text-sm font-medium">{c.agency}</p>
                  <p className="text-sm font-semibold tabular-nums">{formatMoney(c.amount)}</p>
                </div>
                <p className="mt-1 text-sm text-muted">
                  {c.originalCreditor} · {c.status} · opened {c.opened}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mt-8 px-5">
        <h2 className="text-base font-semibold">Official tools</h2>
        <p className="mt-1 text-sm text-muted">These leave the demo and open the licensed bureaus or Bank of Ghana.</p>
        <ul className="mt-3 overflow-hidden rounded-xl bg-surface">
          <li className="border-b border-border">
            <a
              href={ANNUAL_REPORT}
              target="_blank"
              rel="noreferrer"
              className="flex min-h-14 items-center justify-between px-4 text-sm font-medium"
            >
              Free official bureau list
              <span className="text-muted">Bank of Ghana</span>
            </a>
          </li>
          {BUREAUS.map((b) => (
            <li key={b.name} className="border-b border-border last:border-b-0">
              <div className="flex items-center justify-between gap-3 px-4 py-3">
                <p className="text-sm font-medium">{b.name}</p>
                <a href={b.freeze} target="_blank" rel="noreferrer" className="text-muted underline">
                  Open
                </a>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-8 px-5 pb-8">
        <h2 className="text-base font-semibold">Dispute letter</h2>
        <p className="mt-1 text-sm text-muted">
          A draft you can copy. It is not filed with a bureau from this app.
        </p>
        <div className="mt-3 flex flex-col gap-2">
          <Select
            label="Item"
            value={selected}
            onChange={setItem}
            options={items.map((name) => ({ value: name, label: name }))}
          />
          <Select
            label="Reason"
            value={reason}
            onChange={(v) => setReason(v as DisputeReason)}
            options={DISPUTE_REASONS.map((r) => ({ value: r, label: r }))}
          />
          <Select
            label="Bureau"
            value={bureauName}
            onChange={(v) => setBureauName(v as (typeof BUREAUS)[number]["name"])}
            options={BUREAUS.map((b) => ({ value: b.name, label: b.name }))}
          />
        </div>
        <pre className="mt-3 whitespace-pre-wrap rounded-xl bg-surface p-4 font-sans text-sm leading-relaxed text-muted">
          {letter}
        </pre>
        <Button
          className="mt-3 w-full"
          onClick={() => {
            void navigator.clipboard.writeText(letter).then(() => {
              setCopied(true);
              window.setTimeout(() => setCopied(false), 1600);
            });
          }}
        >
          {copied ? "Copied" : "Copy letter"}
        </Button>
      </section>
    </AppShell>
  );
}

function Toggle({ on, label, onClick }: { on: boolean; label: string; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className="flex min-h-11 items-center justify-between text-sm">
      <span>{label}</span>
      <span className={on ? "text-below" : "text-muted"}>{on ? "On" : "Off"}</span>
    </button>
  );
}

function Select({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <label className="flex flex-col gap-1 text-sm">
      <span className="text-muted">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-11 rounded-xl bg-surface px-3 text-fg"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}
