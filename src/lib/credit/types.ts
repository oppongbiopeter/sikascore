export type ScoreBand = "excellent" | "good" | "average" | "below";
export type FactorId =
  | "repayment"
  | "cheques"
  | "judgments"
  | "socio"
  | "assets"
  | "demographics";
export type AccountType = "revolving" | "installment";
export type PaymentStatus = "current" | "late30" | "late60";

export type CreditAccount = {
  id: string;
  name: string;
  kind: string;
  type: AccountType;
  balance: number;
  limit?: number;
  original?: number;
  opened: string;
  lastReported: string;
  paymentStatus: PaymentStatus;
  status: "open" | "closed";
};

export type ScorePoint = {
  date: string;
  score: number;
};

export type BureauScores = {
  xds: number;
  dnb: number;
  mcs: number;
};

export type CreditProfile = {
  id: string;
  name: string;
  label: string;
  score: number;
  previousScore: number;
  updatedLabel: string;
  onTimeRate: number;
  ageMonths: number;
  inquiries24mo: number;
  cheques: number;
  judgments: number;
  socio: string;
  assets: string;
  bureaus: BureauScores;
  history: ScorePoint[];
  accounts: CreditAccount[];
};

export type FactorStatus = ScoreBand;