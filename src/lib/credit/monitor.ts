import { SCORE_MAX, SCORE_MIN, utilization } from "@/lib/credit/model";
import type { CreditProfile } from "@/lib/credit/types";

export type AlertLevel = "info" | "watch" | "urgent";

export type MonitorAlert = {
  id: string;
  profileId: string;
  title: string;
  body: string;
  date: string;
  level: AlertLevel;
};

export type Inquiry = {
  id: string;
  profileId: string;
  creditor: string;
  date: string;
  kind: "hard" | "soft";
};

export type CollectionItem = {
  id: string;
  profileId: string;
  agency: string;
  originalCreditor: string;
  amount: number;
  opened: string;
  status: "unpaid" | "paid";
};

export const ALERTS: MonitorAlert[] = [
  {
    id: "a-score",
    profileId: "ama",
    title: "Score moved +8",
    body: "The combined file went from 679 to 687. Ecobank reported a lower balance.",
    date: "Sep 22, 2026",
    level: "info",
  },
  {
    id: "a-util",
    profileId: "ama",
    title: "Fido is at 90%",
    body: "That digital loan is nearly full. Paying it down is the fastest lever on this file.",
    date: "Sep 8, 2026",
    level: "watch",
  },
  {
    id: "a-inq",
    profileId: "ama",
    title: "Enquiry from CalBank",
    body: "Posted when the salary loan was opened. A lender check can stay on the file for about two years.",
    date: "Jun 1, 2025",
    level: "watch",
  },
  {
    id: "k-score",
    profileId: "akosua",
    title: "Score moved +6",
    body: "The combined file went from 736 to 742. Card balances stayed low.",
    date: "Sep 22, 2026",
    level: "info",
  },
  {
    id: "k-inq",
    profileId: "akosua",
    title: "Enquiry from Republic Bank",
    body: "A home-loan enquiry. Shopping one mortgage in a short window is often treated as a single check.",
    date: "Feb 1, 2025",
    level: "info",
  },
  {
    id: "w-late",
    profileId: "kwame",
    title: "30 days late at Bayport",
    body: "A late instalment was reported. Repayment history is 60% of the score. Getting current stops new lates from stacking.",
    date: "Sep 12, 2026",
    level: "urgent",
  },
  {
    id: "w-col",
    profileId: "kwame",
    title: "Collection: Bolton",
    body: "GHS 640 from a charged-off Quick Credit facility. Collections stay high-impact until paid or removed.",
    date: "Aug 3, 2026",
    level: "urgent",
  },
  {
    id: "w-score",
    profileId: "kwame",
    title: "Score moved −13",
    body: "The combined file went from 591 to 578 after the late payment and a new enquiry.",
    date: "Sep 22, 2026",
    level: "watch",
  },
];

export const INQUIRIES: Inquiry[] = [
  { id: "a1", profileId: "ama", creditor: "CalBank", date: "Jun 1, 2025", kind: "hard" },
  { id: "a2", profileId: "ama", creditor: "Ecobank", date: "Aug 4, 2024", kind: "hard" },
  { id: "a3", profileId: "ama", creditor: "SikaScore", date: "Sep 22, 2026", kind: "soft" },
  { id: "k1", profileId: "akosua", creditor: "Republic Bank", date: "Feb 1, 2025", kind: "hard" },
  { id: "k2", profileId: "akosua", creditor: "SikaScore", date: "Sep 22, 2026", kind: "soft" },
  { id: "w1", profileId: "kwame", creditor: "Bayport", date: "Feb 11, 2025", kind: "hard" },
  { id: "w2", profileId: "kwame", creditor: "Letshego", date: "Jan 20, 2026", kind: "hard" },
  { id: "w3", profileId: "kwame", creditor: "GCB Bank", date: "Sep 14, 2025", kind: "hard" },
  { id: "w4", profileId: "kwame", creditor: "Fido", date: "Mar 2, 2026", kind: "hard" },
  { id: "w5", profileId: "kwame", creditor: "Quick Credit", date: "May 18, 2026", kind: "hard" },
  { id: "w6", profileId: "kwame", creditor: "Fidelity", date: "Jul 9, 2026", kind: "hard" },
  { id: "w7", profileId: "kwame", creditor: "SikaScore", date: "Sep 22, 2026", kind: "soft" },
];

export const COLLECTIONS: CollectionItem[] = [
  {
    id: "w-bolton",
    profileId: "kwame",
    agency: "Bolton",
    originalCreditor: "Quick Credit",
    amount: 640,
    opened: "Aug 3, 2026",
    status: "unpaid",
  },
];

export const BUREAUS = [
  {
    name: "XDS Data Ghana",
    freeze: "https://www.xdsdata.com",
    dispute: "https://www.xdsdata.com",
    mail: "XDS Data Ghana, Octagon, Accra",
  },
  {
    name: "Dun & Bradstreet",
    freeze: "https://www.dnbghana.com",
    dispute: "https://www.dnbghana.com",
    mail: "Dun & Bradstreet Credit Bureau Limited, Cantonments, Accra",
  },
  {
    name: "MyCredit Score",
    freeze: "https://mycreditscore.com.gh",
    dispute: "https://mycreditscore.com.gh",
    mail: "MyCredit Score Limited, East Legon, Accra",
  },
] as const;

export const ANNUAL_REPORT = "https://www.bog.gov.gh/supervision-regulation/fsd/licensed-credit-bureaus/";

export const DISPUTE_REASONS = [
  "This account is not mine",
  "The balance is wrong",
  "This was paid, but still shows late",
  "This is a duplicate",
] as const;

export type DisputeReason = (typeof DISPUTE_REASONS)[number];

export function alertsFor(profileId: string) {
  return ALERTS.filter((a) => a.profileId === profileId);
}

export function inquiriesFor(profileId: string) {
  return INQUIRIES.filter((a) => a.profileId === profileId);
}

export function collectionsFor(profileId: string) {
  return COLLECTIONS.filter((a) => a.profileId === profileId);
}

export function revolvingUsed(profile: CreditProfile) {
  return profile.accounts
    .filter((a) => a.type === "revolving" && a.status === "open")
    .reduce((s, a) => s + a.balance, 0);
}

export function simulateScore(
  profile: CreditProfile,
  paydown: number,
  newInquiry: boolean,
  missedPayment: boolean,
) {
  const used = revolvingUsed(profile);
  const paid = Math.min(Math.max(0, paydown), used);
  const oldUtil = utilization(profile.accounts);
  const limit = profile.accounts
    .filter((a) => a.type === "revolving" && a.status === "open" && a.limit)
    .reduce((s, a) => s + (a.limit ?? 0), 0);
  const newUtil = limit ? Math.max(0, used - paid) / limit : 0;
  let delta = Math.round((oldUtil - newUtil) * 70);
  if (oldUtil > 0.3 && newUtil <= 0.3) delta += 8;
  if (oldUtil > 0.1 && newUtil <= 0.1) delta += 6;
  if (newInquiry) delta -= 6;
  if (missedPayment) delta -= profile.score >= 700 ? 70 : 45;
  const score = Math.min(SCORE_MAX, Math.max(SCORE_MIN, profile.score + delta));
  return { score, delta: score - profile.score, newUtil, paid };
}

export function disputeLetter(input: {
  name: string;
  item: string;
  reason: DisputeReason;
  bureauMail: string;
}) {
  return [
    input.name,
    "Sample file — not a live bureau dispute",
    "",
    input.bureauMail,
    "",
    "Re: Request for investigation",
    "",
    `I am writing to dispute the following item on my credit report: ${input.item}.`,
    `Reason: ${input.reason}.`,
    "Please investigate this item and delete or correct it if you cannot verify it. Send the results to me in writing.",
    "",
    input.name,
  ].join("\n");
}
