import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { FEE_GHS, useAccount, WALLETS } from "@/lib/account/store";
import { formatMoney } from "@/lib/credit/model";
import { PROFILES } from "@/lib/credit/profiles";
import { useCredit } from "@/lib/credit/store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/settings")({ component: SettingsPage });

function SettingsPage() {
  const navigate = useNavigate();
  const hidden = useCredit((s) => s.hidden);
  const setHidden = useCredit((s) => s.setHidden);
  const profileId = useCredit((s) => s.profileId);
  const setProfileId = useCredit((s) => s.setProfileId);
  const account = useAccount((s) => s.account);
  const signOut = useAccount((s) => s.signOut);
  const profile = PROFILES.find((p) => p.id === profileId) ?? PROFILES[0];
  const wallet = WALLETS.find((w) => w.id === account?.paidVia)?.label;

  return (
    <AppShell>
      <header className="px-5 pt-6 pb-2">
        <p className="text-sm text-muted">SikaScore</p>
        <h1 className="text-2xl font-semibold tracking-tight">You</h1>
      </header>

      <section className="mt-4 px-5">
        <div className="rounded-xl bg-surface p-5">
          <p className="text-sm text-muted">Account</p>
          <p className="mt-1 text-lg font-semibold">{account?.fullName}</p>
          <p className="mt-1 text-sm text-muted">{account?.phone}</p>
          <p className="mt-3 text-sm text-muted">Ghana Card</p>
          <p className="mt-1 text-sm font-medium uppercase">{account?.cardPin}</p>
          <p className="mt-1 text-sm text-muted">
            {account?.cardMethod === "photo" ? "Photo captured" : "Typed in"} · {account?.city}
          </p>
          {account?.paid ? (
            <p className="mt-3 text-sm text-muted">
              {formatMoney(FEE_GHS)} via {wallet}
              {account.paidAt ? ` · ${new Date(account.paidAt).toLocaleDateString("en-GH")}` : ""}
            </p>
          ) : null}
        </div>
      </section>

      <section className="mt-6 px-5">
        <h2 className="text-base font-semibold">Display</h2>
        <button
          type="button"
          onClick={() => setHidden(!hidden)}
          className="mt-3 flex min-h-14 w-full items-center justify-between rounded-xl bg-surface px-4"
        >
          <span className="text-sm font-medium">Hide score</span>
          <span
            className={cn(
              "relative h-7 w-12 rounded-full transition-colors duration-150",
              hidden ? "bg-lime" : "bg-surface-2",
            )}
          >
            <span
              className={cn(
                "absolute top-0.5 left-0.5 size-6 rounded-full bg-fg transition-transform duration-150",
                hidden && "translate-x-5",
              )}
            />
          </span>
        </button>
        <p className="mt-2 px-1 text-xs text-subtle">
          Hides the number on Home and Credit Score until you show it again.
        </p>
      </section>

      <section className="mt-8 px-5">
        <h2 className="text-base font-semibold">Demo files</h2>
        <p className="mt-1 text-sm text-muted">
          The paid pull used your Ghana Card. These samples show other bureau files. They are not a second search.
        </p>
        <ul className="mt-3 flex flex-col gap-2">
          {PROFILES.map((p) => {
            const active = p.id === profileId;
            return (
              <li key={p.id}>
                <button
                  type="button"
                  onClick={() => setProfileId(p.id)}
                  className={cn(
                    "flex min-h-14 w-full items-center justify-between rounded-xl px-4 text-left",
                    active ? "bg-lime text-lime-fg" : "bg-surface text-fg",
                  )}
                >
                  <span className="text-sm font-medium">{p.name}</span>
                  <span className={cn("text-sm tabular-nums", active ? "text-lime-fg" : "text-muted")}>
                    {p.label}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </section>

      <section className="mt-8 px-5 pb-8">
        <h2 className="text-base font-semibold">About this score</h2>
        <div className="mt-3 space-y-3 rounded-xl bg-surface p-5 text-sm leading-relaxed text-muted">
          <p>
            A real check is sold by the licensed bureaus — XDS Data Ghana, Dun & Bradstreet Credit Bureau Limited, and MyCredit Score Limited — under the Credit Reporting Act, 2007 (Act 726).
          </p>
          <p>
            This app is a front-end demo of that journey. It does not submit your Ghana Card, does not move mobile money, and is not affiliated with those bureaus or the Bank of Ghana.
          </p>
        </div>
        <button
          type="button"
          className="mt-4 min-h-11 text-sm text-muted"
          onClick={() => {
            signOut();
            navigate({ to: "/join" });
          }}
        >
          Log out
        </button>
      </section>
    </AppShell>
  );
}
