import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { formatMoney } from "@/lib/credit/model";
import {
  LOCKED_PORTION,
  LOAN_AMOUNT,
  MONTHLY_DUE,
  TERM_MONTHS,
  useCredit,
} from "@/lib/credit/store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/build")({ component: BuildPage });

const CONTRIBUTIONS = [1, 5, 10, 25];

function BuildPage() {
  const builder = useCredit((s) => s.builder);
  const enrollBuilder = useCredit((s) => s.enrollBuilder);
  const setContribution = useCredit((s) => s.setContribution);
  const payBuilderMonth = useCredit((s) => s.payBuilderMonth);
  const setAutopay = useCredit((s) => s.setAutopay);
  const setCardOn = useCredit((s) => s.setCardOn);
  const swipeCard = useCredit((s) => s.swipeCard);
  const payCard = useCredit((s) => s.payCard);
  const resetBuilder = useCredit((s) => s.resetBuilder);

  const done = builder.monthsPaid >= TERM_MONTHS;
  const returned = builder.contribution * TERM_MONTHS;
  const userPays = builder.contribution;
  const fromLock = MONTHLY_DUE - userPays;
  const available = builder.checking - builder.cardSpent;
  const progress = builder.monthsPaid / TERM_MONTHS;

  return (
    <AppShell>
      <header className="px-5 pt-6 pb-2">
        <p className="text-sm text-muted">SikaScore</p>
        <h1 className="text-2xl font-semibold tracking-tight">Credit Builder</h1>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          Loan and card together. On-time payments from both show up on Credit Score. Neither is a hard pull.
        </p>
      </header>

      {!builder.enrolled ? (
        <section className="mt-4 px-5">
          <div className="rounded-xl bg-surface p-5">
            <p className="text-xs font-medium uppercase tracking-wider text-muted">Builder loan</p>
            <p className="mt-2 text-3xl font-semibold tracking-tight tabular-nums">
              {formatMoney(LOAN_AMOUNT)}
            </p>
            <p className="mt-2 text-sm leading-relaxed text-muted">
              A 12-month, 0% loan. Each month {formatMoney(MONTHLY_DUE)} is reported as paid on time.
              You put in as little as ₵1. The other {formatMoney(LOCKED_PORTION)} comes from the locked loan.
              Your contributions come back at the end.
            </p>
            <Button className="mt-5 w-full" onClick={enrollBuilder}>
              Start loan and card
            </Button>
          </div>
        </section>
      ) : (
        <section className="mt-4 px-5">
          <div className="rounded-xl bg-surface p-5">
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium uppercase tracking-wider text-muted">Builder loan</p>
              <p className="text-sm tabular-nums text-muted">
                {builder.monthsPaid}/{TERM_MONTHS}
              </p>
            </div>
            <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-surface-2">
              <div
                className="h-full rounded-full bg-lime"
                style={{ width: `${progress * 100}%` }}
              />
            </div>
            {done ? (
              <>
                <p className="mt-4 text-lg font-semibold">Program complete</p>
                <p className="mt-2 text-sm leading-relaxed text-muted">
                  {formatMoney(returned)} in contributions is back in savings. Twelve on-time payments were reported.
                </p>
                <Button variant="secondary" className="mt-4 w-full" onClick={resetBuilder}>
                  Start again
                </Button>
              </>
            ) : (
              <>
                <p className="mt-4 text-sm text-muted">This month you pay</p>
                <p className="mt-1 text-3xl font-semibold tabular-nums tracking-tight">
                  {formatMoney(userPays)}
                </p>
                <p className="mt-1 text-sm text-muted">
                  {formatMoney(fromLock)} from the locked {formatMoney(LOAN_AMOUNT)} · {formatMoney(MONTHLY_DUE)} reported
                </p>
                <div className="mt-4 flex gap-2">
                  {CONTRIBUTIONS.map((n) => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setContribution(n)}
                      className={cn(
                        "h-11 flex-1 rounded-full text-sm font-medium tabular-nums",
                        builder.contribution === n ? "bg-lime text-lime-fg" : "bg-surface-2 text-fg",
                      )}
                    >
                      ₵{n}
                    </button>
                  ))}
                </div>
                <Button className="mt-4 w-full" onClick={payBuilderMonth}>
                  Pay month {builder.monthsPaid + 1}
                </Button>
              </>
            )}
          </div>

          <ol className="mt-3 overflow-hidden rounded-xl bg-surface">
            {Array.from({ length: TERM_MONTHS }, (_, i) => {
              const paid = i < builder.monthsPaid;
              const current = i === builder.monthsPaid && !done;
              return (
                <li
                  key={i}
                  className="flex items-center justify-between border-b border-border px-4 py-3 last:border-b-0"
                >
                  <span className="text-sm">Month {i + 1}</span>
                  <span
                    className={cn(
                      "text-sm tabular-nums",
                      paid ? "text-excellent" : current ? "text-fg" : "text-subtle",
                    )}
                  >
                    {paid ? "Reported" : current ? formatMoney(MONTHLY_DUE) : "Upcoming"}
                  </span>
                </li>
              );
            })}
          </ol>
        </section>
      )}

      <section className="mt-8 px-5">
        <h2 className="text-base font-semibold">Builder Card</h2>
        <p className="mt-1 text-sm text-muted">
          Spend only what’s already in checking. Purchases lock that cash so it can’t be spent twice. Autopay reports an on-time payment. No interest, no deposit, no credit check.
        </p>
        <div className="mt-3 rounded-xl bg-surface p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium">{builder.cardOn ? "Card on" : "Card off"}</p>
            <button
              type="button"
              onClick={() => setCardOn(!builder.cardOn)}
              className={cn(
                "relative h-7 w-12 rounded-full transition-colors duration-150",
                builder.cardOn ? "bg-lime" : "bg-surface-2",
              )}
              aria-pressed={builder.cardOn}
              aria-label={builder.cardOn ? "Turn card off" : "Turn card on"}
            >
              <span
                className={cn(
                  "absolute top-0.5 left-0.5 size-6 rounded-full bg-fg transition-transform duration-150",
                  builder.cardOn && "translate-x-5",
                )}
              />
            </button>
          </div>
          <p className="mt-4 text-sm text-muted">Available to spend</p>
          <p className="mt-1 text-3xl font-semibold tabular-nums tracking-tight">
            {formatMoney(builder.cardOn ? available : builder.checking)}
          </p>
          <p className="mt-1 text-sm text-muted">
            Checking {formatMoney(builder.checking)}
            {builder.cardOn && builder.cardSpent > 0
              ? ` · ${formatMoney(builder.cardSpent)} locked`
              : ""}
          </p>
          {builder.cardOn ? (
            <div className="mt-4 flex gap-2">
              <Button
                variant="secondary"
                className="flex-1"
                onClick={() => swipeCard(24)}
                disabled={available < 24}
              >
                Spend ₵24
              </Button>
              <Button
                variant="secondary"
                className="flex-1"
                onClick={payCard}
                disabled={builder.cardSpent === 0}
              >
                Pay off
              </Button>
            </div>
          ) : null}
          <button
            type="button"
            onClick={() => setAutopay(!builder.autopay)}
            className="mt-4 flex min-h-11 w-full items-center justify-between text-sm"
          >
            <span>Autopay</span>
            <span className={builder.autopay ? "text-excellent" : "text-muted"}>
              {builder.autopay ? "On" : "Off"}
            </span>
          </button>
        </div>
      </section>

      <section className="mt-6 px-5 pb-8">
        <p className="text-xs leading-relaxed text-subtle">
          Sample program only. Paying here does not move real money or report to a bureau. A real builder reports the combined on-time payment; it does not guarantee a higher score.{" "}
          <Link to="/score" className="text-muted underline">
            Check the score
          </Link>
          .
        </p>
        {builder.enrolled ? (
          <button type="button" onClick={resetBuilder} className="mt-4 min-h-11 text-sm text-muted">
            Reset builder demo
          </button>
        ) : null}
      </section>
    </AppShell>
  );
}
