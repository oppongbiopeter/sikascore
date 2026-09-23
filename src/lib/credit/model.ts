import type {
  CreditAccount,
  CreditProfile,
  FactorId,
  FactorStatus,
  ScoreBand,
} from "./types";

export const SCORE_MIN = 300;
export const SCORE_MAX = 850;

export function scoreBand(score: number): ScoreBand {
  if (score >= 721) return "excellent";
  if (score >= 661) return "good";
  if (score >= 601) return "average";
  return "below";
}

export const BAND_LABEL: Record<ScoreBand, string> = {
  excellent: "Excellent",
  good: "Good",
  average: "Average",
  below: "Below average",
};

export const BAND_RANGE: Record<ScoreBand, string> = {
  excellent: "721–850",
  good: "661–720",
  average: "601–660",
  below: "300–600",
};

export const BAND_COLOR: Record<ScoreBand, string> = {
  excellent: "var(--color-excellent)",
  good: "var(--color-good)",
  average: "var(--color-average)",
  below: "var(--color-below)",
};

export function utilization(accounts: CreditAccount[]): number {
  const revolving = accounts.filter((a) => a.type === "revolving" && a.status === "open" && a.limit);
  const used = revolving.reduce((s, a) => s + a.balance, 0);
  const limit = revolving.reduce((s, a) => s + (a.limit ?? 0), 0);
  if (!limit) return 0;
  return used / limit;
}

export function availableCredit(accounts: CreditAccount[]): number {
  return accounts
    .filter((a) => a.type === "revolving" && a.status === "open" && a.limit)
    .reduce((s, a) => s + Math.max(0, (a.limit ?? 0) - a.balance), 0);
}

export function totalLimit(accounts: CreditAccount[]): number {
  return accounts
    .filter((a) => a.type === "revolving" && a.status === "open" && a.limit)
    .reduce((s, a) => s + (a.limit ?? 0), 0);
}

export function accountUtilization(account: CreditAccount): number | null {
  if (account.type !== "revolving" || !account.limit) return null;
  return account.balance / account.limit;
}

export function formatMoney(n: number): string {
  return new Intl.NumberFormat("en-GH", {
    style: "currency",
    currency: "GHS",
    maximumFractionDigits: 0,
  }).format(n);
}

export function formatAge(months: number): string {
  const y = Math.floor(months / 12);
  const m = months % 12;
  if (y <= 0) return `${m} mo`;
  if (m === 0) return y === 1 ? "1 yr" : `${y} yrs`;
  return `${y} yr ${m} mo`;
}

export function delta(profile: CreditProfile): number {
  return profile.score - profile.previousScore;
}

export function usageStatus(pct: number): FactorStatus {
  if (pct <= 0.09) return "excellent";
  if (pct <= 0.29) return "good";
  if (pct <= 0.49) return "average";
  return "below";
}

export function paymentStatus(rate: number): FactorStatus {
  if (rate >= 0.99) return "excellent";
  if (rate >= 0.97) return "good";
  if (rate >= 0.9) return "average";
  return "below";
}

export function ageStatus(months: number): FactorStatus {
  if (months >= 108) return "excellent";
  if (months >= 72) return "good";
  if (months >= 36) return "average";
  return "below";
}

export function availableStatus(limit: number): FactorStatus {
  if (limit >= 25000) return "excellent";
  if (limit >= 10000) return "good";
  if (limit >= 4000) return "average";
  return "below";
}

export function inquiryStatus(count: number): FactorStatus {
  if (count <= 1) return "excellent";
  if (count <= 2) return "good";
  if (count <= 4) return "average";
  return "below";
}

export type FactorView = {
  id: FactorId;
  title: string;
  summary: string;
  detail: string;
  tip: string;
  status: FactorStatus;
  value: string;
  weight: string;
};

export function factorsFor(profile: CreditProfile): FactorView[] {
  const limit = totalLimit(profile.accounts);
  return [
    {
      id: "repayment",
      title: "Repayment history",
      summary: "On-time payments on reported facilities",
      detail:
        "Credit profile and repayment history is about 60% of a Ghana consumer score. Lenders want facilities paid as agreed. A 30-day late stays on the file and is shared across the credit reporting system.",
      tip: "Bring any past-due loan current, then keep the next instalments on time. A standing order beats hoping to remember.",
      status: paymentStatus(profile.onTimeRate),
      value: `${Math.round(profile.onTimeRate * 100)}% on time`,
      weight: "60%",
    },
    {
      id: "cheques",
      title: "Dishonored cheques",
      summary: "Cheques returned for lack of funds",
      detail:
        "Dishonored cheques are about 15% of the score. A returned cheque is reported and weighs more than a single card balance.",
      tip: "Do not issue a cheque you cannot fund. If one bounced, settle it with the bank and the payee so it can be marked cleared.",
      status: profile.cheques === 0 ? "excellent" : profile.cheques === 1 ? "average" : "below",
      value: profile.cheques === 0 ? "None" : `${profile.cheques} returned`,
      weight: "15%",
    },
    {
      id: "judgments",
      title: "Judgment debt",
      summary: "Court judgments on the file",
      detail:
        "Judgment debt is about 10% of the score. A court judgment is a public record the bureaus pick up until it is satisfied.",
      tip: "If a judgment is yours, pay it and keep the receipt. If it is not yours, dispute it with the bureau that is showing it.",
      status: profile.judgments === 0 ? "excellent" : "below",
      value: profile.judgments === 0 ? "None" : `${profile.judgments} on file`,
      weight: "10%",
    },
    {
      id: "socio",
      title: "Socio-economic",
      summary: "Work, income pattern, and stability",
      detail:
        "Socio-economic factors are about 7%. Bureaus look at whether income looks steady — salaried work, a traceable address, and a Ghana Card that matches the file.",
      tip: "Keep your employer and GhanaPost GPS address current with the lenders that report you.",
      status: profile.socio.startsWith("Salaried") ? "good" : "average",
      value: profile.socio,
      weight: "7%",
    },
    {
      id: "assets",
      title: "Economic assets",
      summary: "Room and assets behind the file",
      detail:
        "Economic assets are about 5%. Unused card limits, a performing home or auto loan, and other assets tell a lender you are not stretched thin.",
      tip: "Paying down the fullest facility helps this more than opening a new one.",
      status: availableStatus(limit),
      value: profile.assets,
      weight: "5%",
    },
    {
      id: "demographics",
      title: "Demographics",
      summary: "Age of file and identity match",
      detail:
        "Demographics are about 3%. A longer credit history and a Ghana Card that matches the name on the facilities make the file easier to trust. Checking your own report is not a hard inquiry.",
      tip: "Use the same name and Ghana Card PIN with every lender so the three bureaus can match you.",
      status: ageStatus(profile.ageMonths),
      value: formatAge(profile.ageMonths),
      weight: "3%",
    },
  ];
}

export const FACTOR_ORDER: FactorId[] = [
  "repayment",
  "cheques",
  "judgments",
  "socio",
  "assets",
  "demographics",
];

export type BuilderActivity = {
  enrolled: boolean;
  monthsPaid: number;
  cardOn: boolean;
  checking: number;
  cardSpent: number;
  cardPayoffs: number;
};

const BUILDER_LOAN = 300;
const BUILDER_DUE = 25;

export function builderBoost(activity: BuilderActivity): number {
  return Math.min(36, activity.monthsPaid * 3 + Math.min(6, activity.cardPayoffs * 2));
}

export function applyBuilder(profile: CreditProfile, activity: BuilderActivity): CreditProfile {
  const accounts: CreditAccount[] = [...profile.accounts];
  if (activity.cardOn) {
    accounts.unshift({
      id: "builder-card",
      name: "SikaScore Builder Card",
      kind: "Credit card",
      type: "revolving",
      balance: activity.cardSpent,
      limit: activity.checking,
      opened: "2026-09-01",
      lastReported: "Last reported today",
      paymentStatus: "current",
      status: "open",
    });
  }
  if (activity.enrolled) {
    accounts.unshift({
      id: "builder-loan",
      name: "SikaScore Builder",
      kind: "Credit builder loan",
      type: "installment",
      balance: Math.max(0, BUILDER_LOAN - activity.monthsPaid * BUILDER_DUE),
      original: BUILDER_LOAN,
      opened: "2026-09-01",
      lastReported: activity.monthsPaid > 0 ? "Last reported today" : "Opened today",
      paymentStatus: "current",
      status: "open",
    });
  }
  const boost = builderBoost(activity);
  const score = Math.min(SCORE_MAX, profile.score + boost);
  const history = profile.history.map((point, i) =>
    i === profile.history.length - 1 ? { ...point, score } : point,
  );
  const onTimeRate =
    activity.monthsPaid > 0
      ? Math.min(1, profile.onTimeRate + activity.monthsPaid * 0.004)
      : profile.onTimeRate;
  return {
    ...profile,
    score,
    previousScore: profile.score === profile.previousScore ? profile.previousScore : profile.previousScore,
    label: `${BAND_LABEL[scoreBand(score)]} · ${score}`,
    onTimeRate,
    history,
    accounts,
    updatedLabel: boost > 0 ? "Updated today · includes builder" : profile.updatedLabel,
  };
}
