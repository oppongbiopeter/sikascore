import { Link, Navigate, useRouterState } from "@tanstack/react-router";
import { Bell, CreditCard, Gauge, Home, Settings } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { useAccount } from "@/lib/account/store";
import { alertsFor } from "@/lib/credit/monitor";
import { useCredit } from "@/lib/credit/store";
import { cn } from "@/lib/utils";

const TABS = [
  { to: "/", label: "Home", icon: Home },
  { to: "/score", label: "Score", icon: Gauge },
  { to: "/alerts", label: "Alerts", icon: Bell },
  { to: "/build", label: "Build", icon: CreditCard },
  { to: "/settings", label: "You", icon: Settings },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const account = useAccount((s) => s.account);
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    if (useAccount.persist.hasHydrated()) {
      setHydrated(true);
      return;
    }
    return useAccount.persist.onFinishHydration(() => setHydrated(true));
  }, []);
  const ready = Boolean(account?.signedIn && account.cardPin && account.paid);
  const profileId = useCredit((s) => s.profileId);
  const readIds = useCredit((s) => s.readIds);
  const unread = alertsFor(profileId).filter((a) => !readIds.includes(a.id)).length;

  if (!hydrated || !ready) {
    return (
      <div className="flex min-h-dvh justify-center bg-bg text-fg">
        <div className="w-full max-w-md px-5 pt-8">
          <p className="text-sm text-muted">SikaScore</p>
          <h1 className="mt-6 text-2xl font-semibold tracking-tight">Check the file on your Ghana Card</h1>
        </div>
        {hydrated && pathname !== "/join" ? <Navigate to="/join" /> : null}
      </div>
    );
  }

  return (
    <div className="flex min-h-dvh justify-center bg-bg text-fg">
      <div className="flex h-dvh w-full max-w-md flex-col">
        <main className="flex-1 overflow-y-auto overscroll-contain">{children}</main>
        <nav
          className="shrink-0 border-t border-border bg-bg pb-[env(safe-area-inset-bottom)]"
          aria-label="Primary"
        >
          <ul className="grid grid-cols-5">
            {TABS.map((tab) => {
              const active =
                tab.to === "/"
                  ? pathname === "/"
                  : pathname === tab.to || pathname.startsWith(`${tab.to}/`);
              const Icon = tab.icon;
              return (
                <li key={tab.to}>
                  <Link
                    to={tab.to}
                    className={cn(
                      "flex min-h-14 flex-col items-center justify-center gap-1 text-[11px] font-medium transition-colors duration-150",
                      active ? "text-fg" : "text-muted",
                    )}
                  >
                    <span className="relative">
                      <Icon className="size-5" strokeWidth={active ? 2.2 : 1.8} />
                      {tab.to === "/alerts" && unread > 0 ? (
                        <span className="absolute -top-0.5 -right-1 size-1.5 rounded-full bg-below" />
                      ) : null}
                    </span>
                    {tab.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
    </div>
  );
}
