import { create } from "zustand";
import { persist } from "zustand/middleware";

export type CardMethod = "photo" | "fields";
export type Wallet = "mtn" | "telecel" | "at";

export type Account = {
  signedIn: boolean;
  fullName: string;
  phone: string;
  email: string;
  password: string;
  dob: string;
  sex: "Female" | "Male";
  digitalAddress: string;
  city: string;
  occupation: string;
  cardMethod: CardMethod;
  cardPin: string;
  cardSurname: string;
  cardFirstNames: string;
  cardDoc: string;
  cardExpiry: string;
  cardPhoto: string | null;
  paid: boolean;
  paidVia: Wallet | null;
  paidAt: string | null;
};

type AccountState = {
  account: Account | null;
  saveAccount: (account: Account) => void;
  patch: (partial: Partial<Account>) => void;
  signOut: () => void;
  reset: () => void;
};

export const useAccount = create<AccountState>()(
  persist(
    (set, get) => ({
      account: null,
      saveAccount: (account) => set({ account }),
      patch: (partial) => {
        const current = get().account;
        if (!current) return;
        set({ account: { ...current, ...partial } });
      },
      signOut: () => {
        const current = get().account;
        if (!current) return;
        set({ account: { ...current, signedIn: false } });
      },
      reset: () => set({ account: null }),
    }),
    { name: "sikascore-account" },
  ),
);

export const FEE_GHS = 20;

export const WALLETS: { id: Wallet; label: string }[] = [
  { id: "mtn", label: "MTN MoMo" },
  { id: "telecel", label: "Telecel Cash" },
  { id: "at", label: "AT Money" },
];

export function normalizePin(pin: string) {
  return pin.toUpperCase().replace(/\s+/g, "");
}

export function validPin(pin: string) {
  return /^GHA-\d{9}-\d$/.test(normalizePin(pin));
}