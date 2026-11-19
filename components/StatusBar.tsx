"use client";

import React from "react";
import { useScriptStore } from "@/stores/scriptStore";

interface StatusBarProps {
  onExport: () => void;
}

export function StatusBar({ onExport }: StatusBarProps) {
  const { wordCount } = useScriptStore();

  // Average speaking pace for documentary video narration: 145-155 words per minute
  const totalMinutes = wordCount > 0 ? wordCount / 150 : 0;
  const minutes = Math.floor(totalMinutes);
  const seconds = Math.round((totalMinutes - minutes) * 60);

  const durationString =
    wordCount === 0
      ? "0:00"
      : `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;

  return (
    <footer className="fixed bottom-0 left-0 right-0 h-10 bg-white/95 border-t border-[#E5E5EA] px-8 flex items-center justify-between text-xs text-[#86868B] select-none z-40 backdrop-blur-[2px]">
      <div className="flex items-center gap-6">
        <div>
          <span className="font-medium text-[#1D1D1F]">{wordCount.toLocaleString()}</span> words
        </div>
        <div className="flex items-center gap-1.5">
          <span>Est. Voiceover Duration:</span>
          <span className="font-medium text-[#1D1D1F] font-mono">~{durationString}</span>
          <span className="text-[11px] text-[#86868B]/70">(@ 150 wpm)</span>
        </div>
        <div className="text-[11px] text-[#86868B]/60 hidden md:inline">
          Shortcuts: ⌘1–6 (Shot color), ⌘0 (Clear), ⌘B/I/U (Format)
        </div>
      </div>

      <div className="flex items-center gap-4">
        <span className="text-[11px] text-emerald-600 font-medium flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Auto-saved
        </span>
        <button
          onClick={onExport}
          className="text-xs font-medium text-[#1D1D1F] hover:text-black hover:underline cursor-pointer transition-colors"
        >
          Export Markdown
        </button>
      </div>
    </footer>
  );
}
