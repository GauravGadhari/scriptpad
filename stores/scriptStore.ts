import { create } from "zustand";
import { DEFAULT_SHOT_PALETTE, ShotType } from "@/lib/defaults";
import { ScriptItem } from "@/lib/db";

interface ScriptState {
  currentScriptId: string | null;
  title: string;
  wordCount: number;
  shotPalette: ShotType[];
  currentView: "editor" | "dashboard";
  activeShotMenuBlockId: string | null;

  setCurrentScriptId: (id: string | null) => void;
  setTitle: (title: string) => void;
  setWordCount: (count: number) => void;
  setShotPalette: (palette: ShotType[]) => void;
  setCurrentView: (view: "editor" | "dashboard") => void;
  updateShotType: (index: number, updated: Partial<ShotType>) => void;
  addShotType: (shot: ShotType) => void;
  loadScript: (script: ScriptItem) => void;
}

export const useScriptStore = create<ScriptState>((set) => ({
  currentScriptId: null,
  title: "Untitled Documentary Script",
  wordCount: 0,
  shotPalette: DEFAULT_SHOT_PALETTE,
  currentView: "dashboard", // Can switch between dashboard and editor
  activeShotMenuBlockId: null,

  setCurrentScriptId: (currentScriptId) => set({ currentScriptId }),
  setTitle: (title) => set({ title }),
  setWordCount: (wordCount) => set({ wordCount }),
  setShotPalette: (shotPalette) => set({ shotPalette }),
  setCurrentView: (currentView) => set({ currentView }),
  updateShotType: (index, updated) =>
    set((state) => {
      const newPalette = [...state.shotPalette];
      newPalette[index] = { ...newPalette[index], ...updated };
      return { shotPalette: newPalette };
    }),
  addShotType: (shot) =>
    set((state) => ({ shotPalette: [...state.shotPalette, shot] })),
  loadScript: (script) =>
    set({
      currentScriptId: script.id,
      title: script.title,
      wordCount: script.wordCount,
      shotPalette: script.shotPalette?.length ? script.shotPalette : DEFAULT_SHOT_PALETTE,
      currentView: "editor",
    }),
}));
