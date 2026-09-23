import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/app-shell";
import { BAND_LABEL, BAND_RANGE } from "@/lib/credit/model";
import type { ScoreBand } from "@/lib/credit/types";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/learn")({ component: LearnPage });

const BANDS: ScoreBand[] = ["excellent", "good", "average", "below"];

const FAQS = [
  {
    q: "Does checking this score lower it?",
    a: "No. A person checking their own file is not a lender enquiry. A hard check posts when a bank or lender pulls the file to open a new facility.",
  },
  {
    q: "Is this a real credit score?",
    a: "Licensed bureaus in Ghana are XDS Data Ghana, Dun & Bradstreet, and MyCredit Score. This demo shows a sample file after the fee step. It does not query those bureaus.",
  },
  {
    q: "How often does it update?",
    a: "Lenders, telcos, utilities, and other credit providers report into the Credit Reporting System. Your number moves when they send a new payment, balance, or facility.",
  },
  {
    q: "Why do the three bureaus disagree?",
    a: "XDS, Dun & Bradstreet, and MyCredit Score do not always hold the same facilities, and their models weigh factors differently. A lender may use one of them.",
  },
  {
    q: "What is a good credit score?",
    a: "On the 300–850 scale used here, 661–720 is Good and 721–850 is Excellent. A stronger file usually means an easier yes and a better rate.",
  },
];

function LearnPage() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <AppShell>
      <header className="px-5 pt-6 pb-2">
        <p className="text-sm text-muted">SikaScore</p>
        <h1 className="text-2xl font-semibold tracking-tight">Get to know your credit</h1>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          A stronger score can mean lower insurance, higher limits, and an easier time getting a car, apartment, or home.
        </p>
      </header>

      <section className="mt-6 px-5">
        <h2 className="text-base font-semibold">Score ranges</h2>
        <ul className="mt-3 overflow-hidden rounded-xl bg-surface">
          {BANDS.map((b) => (
            <li
              key={b}
              className="flex items-center justify-between border-b border-border px-4 py-3 last:border-b-0"
            >
              <span className="text-sm font-medium">{BAND_LABEL[b]}</span>
              <span className="text-sm tabular-nums text-muted">{BAND_RANGE[b]}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-8 px-5">
        <h2 className="text-base font-semibold">How it works</h2>
        <ol className="mt-3 flex flex-col gap-3">
          {[
            {
              t: "See your latest score",
              d: "Open Credit Score anytime for the most recent update.",
            },
            {
              t: "Track changes over time",
              d: "A 12-month history shows how payments and balances moved the number.",
            },
            {
              t: "Get the factors",
              d: "Repayment history, dishonored cheques, judgment debt, and the smaller factors — each with a plain-language rating.",
            },
            {
              t: "See the accounts",
              d: "Every facility that feeds the score, including usage by card.",
            },
          ].map((item, i) => (
            <li key={item.t} className="rounded-xl bg-surface px-4 py-3">
              <p className="text-sm font-medium">
                {i + 1}. {item.t}
              </p>
              <p className="mt-1 text-sm text-muted">{item.d}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="mt-8 px-5 pb-8">
        <h2 className="text-base font-semibold">Questions</h2>
        <ul className="mt-3 overflow-hidden rounded-xl bg-surface">
          {FAQS.map((faq, i) => {
            const on = open === i;
            return (
              <li key={faq.q} className="border-b border-border last:border-b-0">
                <button
                  type="button"
                  onClick={() => setOpen(on ? null : i)}
                  className="flex min-h-14 w-full items-center justify-between gap-3 px-4 text-left"
                >
                  <span className="text-sm font-medium">{faq.q}</span>
                  <span className={cn("text-muted", on && "text-fg")}>{on ? "–" : "+"}</span>
                </button>
                {on ? <p className="px-4 pb-4 text-sm leading-relaxed text-muted">{faq.a}</p> : null}
              </li>
            );
          })}
        </ul>
      </section>
    </AppShell>
  );
}
