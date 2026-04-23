import { create } from "zustand";

import type { Interactable } from "@/types/game";

type DialogState = {
  open: boolean;
  title: string;
  body: string;
  accent?: string;
  sourceId?: string;
  skipped: boolean;
  complete: boolean;
};

type GameState = {
  floorId: number;
  interacted: Set<string>;
  contentInteracted: Set<string>;
  totalContentCount: number;
  dialog: DialogState;
  playerHp: number;
  maxHp: number;
  defeatedEnemies: Set<string>;
  deathOverlayOpen: boolean;
  contactOpen: boolean;
  muted: boolean;
  resumeOpen: boolean;
  helpOpen: boolean;
  profileOpen: boolean;
  chatOpen: boolean;
  loading: boolean;

  setFloor: (id: number) => void;
  setTotalContentCount: (n: number) => void;
  lightProgress: () => number;
  openDialog: (i: Interactable) => void;
  closeDialog: () => void;
  skipDialogTypewriter: () => void;
  markDialogComplete: () => void;
  openContact: () => void;
  closeContact: () => void;
  toggleMute: () => void;
  setResumeOpen: (v: boolean) => void;
  setHelpOpen: (v: boolean) => void;
  setProfileOpen: (v: boolean) => void;
  setChatOpen: (v: boolean) => void;
  setLoading: (v: boolean) => void;
  markInteracted: (id: string, isContent?: boolean) => void;
  isInteracted: (id: string) => boolean;
  clearInteracted: () => void;
  damagePlayer: (amt: number) => void;
  healPlayer: (amt: number) => void;
  resetHp: () => void;
  markEnemyDefeated: (id: string) => void;
  isEnemyDefeated: (id: string) => boolean;
  setDeathOverlayOpen: (v: boolean) => void;
};

export const useGame = create<GameState>((set, get) => ({
  floorId: 0,
  interacted: new Set(),
  contentInteracted: new Set(),
  totalContentCount: 1,
  playerHp: 3,
  maxHp: 3,
  defeatedEnemies: new Set(),
  deathOverlayOpen: false,
  dialog: { open: false, title: "", body: "", skipped: false, complete: false },
  contactOpen: false,
  muted: false,
  resumeOpen: false,
  helpOpen: false,
  profileOpen: false,
  chatOpen: false,
  loading: true,

  setFloor: (id) => set({ floorId: id }),
  setTotalContentCount: (n) => set({ totalContentCount: Math.max(1, n) }),
  lightProgress: () => {
    const { contentInteracted, totalContentCount } = get();
    return Math.min(1, contentInteracted.size / totalContentCount);
  },
  openDialog: (i) =>
    set({
      dialog: {
        open: true,
        title: i.title,
        body: i.body,
        accent: i.accent,
        sourceId: i.id,
        skipped: false,
        complete: false,
      },
    }),
  closeDialog: () =>
    set((s) => ({
      dialog: { ...s.dialog, open: false, skipped: false, complete: false },
    })),
  skipDialogTypewriter: () =>
    set((s) => ({ dialog: { ...s.dialog, skipped: true } })),
  markDialogComplete: () =>
    set((s) => ({ dialog: { ...s.dialog, complete: true } })),
  openContact: () => set({ contactOpen: true }),
  closeContact: () => set({ contactOpen: false }),
  toggleMute: () => set((s) => ({ muted: !s.muted })),
  setResumeOpen: (v) => set({ resumeOpen: v }),
  setHelpOpen: (v) => set({ helpOpen: v }),
  setProfileOpen: (v) => set({ profileOpen: v }),
  setChatOpen: (v) => set({ chatOpen: v }),
  setLoading: (v) => set({ loading: v }),
  markInteracted: (id, isContent) => {
    const next = new Set(get().interacted);
    next.add(id);
    const patch: Partial<GameState> = { interacted: next };
    if (isContent) {
      const cnext = new Set(get().contentInteracted);
      cnext.add(id);
      patch.contentInteracted = cnext;
    }
    set(patch);
  },
  isInteracted: (id) => get().interacted.has(id),
  clearInteracted: () => set({ interacted: new Set() }),
  damagePlayer: (amt) => {
    const hp = Math.max(0, get().playerHp - amt);
    set({ playerHp: hp });
    if (hp === 0) set({ deathOverlayOpen: true });
  },
  healPlayer: (amt) =>
    set((s) => ({ playerHp: Math.min(s.maxHp, s.playerHp + amt) })),
  resetHp: () => set((s) => ({ playerHp: s.maxHp, deathOverlayOpen: false })),
  markEnemyDefeated: (id) => {
    const next = new Set(get().defeatedEnemies);
    next.add(id);
    set({ defeatedEnemies: next });
  },
  isEnemyDefeated: (id) => get().defeatedEnemies.has(id),
  setDeathOverlayOpen: (v) => set({ deathOverlayOpen: v }),
}));
