import { create } from "zustand";
import { persist } from "zustand/middleware";
import { DEFAULT_PROFILE_ID } from "./profiles";

export const LOAN_AMOUNT = 300;
export const MONTHLY_DUE = 25;
export const TERM_MONTHS = 12;
export const LOCKED_PORTION = 24;

export type BuilderState = {
  enrolled: boolean;
  monthsPaid: number;
  contribution: number;
  autopay: boolean;
  cardOn: boolean;
  checking: number;
  cardSpent: number;
  cardPayoffs: number;
};

const freshBuilder = (): BuilderState => ({
  enrolled: false,
  monthsPaid: 0,
  contribution: 1,
  autopay: true,
  cardOn: false,
  checking: 640,
  cardSpent: 0,
  cardPayoffs: 0,
});

type CreditState = {
  profileId: string;
  hidden: boolean;
  builder: BuilderState;
  readIds: string[];
  setProfileId: (id: string) => void;
  setHidden: (v: boolean) => void;
  enrollBuilder: () => void;
  setContribution: (n: number) => void;
  payBuilderMonth: () => void;
  setAutopay: (v: boolean) => void;
  setCardOn: (v: boolean) => void;
  swipeCard: (amount: number) => void;
  payCard: () => void;
  resetBuilder: () => void;
  markRead: (id: string) => void;
  markAllRead: (ids: string[]) => void;
};

export const useCredit = create<CreditState>()(
  persist(
    (set, get) => ({
      profileId: DEFAULT_PROFILE_ID,
      hidden: false,
      builder: freshBuilder(),
      readIds: [],
      setProfileId: (id) => set({ profileId: id }),
      setHidden: (v) => set({ hidden: v }),
      enrollBuilder: () =>
        set({
          builder: { ...freshBuilder(), enrolled: true, cardOn: true },
        }),
      setContribution: (n) =>
        set({ builder: { ...get().builder, contribution: Math.min(25, Math.max(1, n)) } }),
      payBuilderMonth: () => {
        const b = get().builder;
        if (!b.enrolled || b.monthsPaid >= TERM_MONTHS) return;
        set({ builder: { ...b, monthsPaid: b.monthsPaid + 1 } });
      },
      setAutopay: (v) => set({ builder: { ...get().builder, autopay: v } }),
      setCardOn: (v) => set({ builder: { ...get().builder, cardOn: v, cardSpent: v ? get().builder.cardSpent : 0 } }),
      swipeCard: (amount) => {
        const b = get().builder;
        if (!b.cardOn) return;
        const room = b.checking - b.cardSpent;
        if (amount <= 0 || amount > room) return;
        set({ builder: { ...b, cardSpent: b.cardSpent + amount } });
      },
      payCard: () => {
        const b = get().builder;
        set({
          builder: {
            ...b,
            cardSpent: 0,
            cardPayoffs: b.cardSpent > 0 ? b.cardPayoffs + 1 : b.cardPayoffs,
          },
        });
      },
      resetBuilder: () => set({ builder: freshBuilder() }),
      markRead: (id) => {
        const ids = get().readIds;
        if (ids.includes(id)) return;
        set({ readIds: [...ids, id] });
      },
      markAllRead: (ids) =>
        set({ readIds: [...new Set([...get().readIds, ...ids])] }),
    }),
    {
      name: "onescore-credit",
      partialize: (s) => ({
        profileId: s.profileId,
        hidden: s.hidden,
        builder: s.builder,
        readIds: s.readIds,
      }),
      merge: (persisted, current) => {
        const saved = persisted as Partial<CreditState> | undefined;
        return {
          ...current,
          ...saved,
          readIds: saved?.readIds ?? [],
          builder: { ...freshBuilder(), ...(saved?.builder ?? {}) },
        };
      },
    },
  ),
);
