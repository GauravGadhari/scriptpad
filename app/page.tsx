"use client";

import React, { useState } from "react";
import { Editor } from "@/components/Editor";
import { Dashboard } from "@/components/Dashboard";
import { TitleInput } from "@/components/TitleInput";
import { ShotPaletteHeader } from "@/components/ShotPaletteHeader";
import { StatusBar } from "@/components/StatusBar";
import { useScriptStore } from "@/stores/scriptStore";

export default function ScriptPadPage() {
  const [exportFn, setExportFn] = useState<(() => void) | null>(null);
  const { currentView, setCurrentView } = useScriptStore();

  return (
    <div className="min-h-screen bg-white text-[#1D1D1F] flex flex-col font-sans">
      {/* Apple-grade Minimal Top Bar */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-[2px] border-b border-[#E5E5EA] px-8 h-14 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setCurrentView("dashboard")}
            className="flex items-center gap-2 text-base font-semibold tracking-tight text-[#1D1D1F] font-display hover:opacity-75 transition-opacity cursor-pointer"
            title="Go to Scripts Library"
          >
            <span>ScriptPad</span>
          </button>

          <span className="text-xs text-[#86868B] hidden sm:inline">
            / Documentary & Video Engine
          </span>

          <div className="h-4 w-[1px] bg-[#E5E5EA] mx-1" />

          {/* Navigation Pill Toggle */}
          <div className="flex items-center bg-[#F5F5F7] p-0.5 rounded-lg text-xs">
            <button
              onClick={() => setCurrentView("dashboard")}
              className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                currentView === "dashboard"
                  ? "bg-white text-[#1D1D1F] shadow-xs"
                  : "text-[#86868B] hover:text-[#1D1D1F]"
              }`}
            >
              All Scripts
            </button>
            <button
              onClick={() => setCurrentView("editor")}
              className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                currentView === "editor"
                  ? "bg-white text-[#1D1D1F] shadow-xs"
                  : "text-[#86868B] hover:text-[#1D1D1F]"
              }`}
            >
              Editor
            </button>
          </div>
        </div>

        {/* Shot Palette Controls (visible in editor view) */}
        {currentView === "editor" && <ShotPaletteHeader />}
      </header>

      {/* Main Content View Switcher */}
      {currentView === "dashboard" ? (
        <main className="flex-1">
          <Dashboard />
        </main>
      ) : (
        <>
          <main className="flex-1 w-full max-w-5xl mx-auto px-8 lg:pr-36 py-10 pb-28">
            {/* Document Title Header */}
            <TitleInput />

            {/* Ruled Notebook Notion-Style Editor with Marginalia Bracket Lines */}
            <Editor onExportReady={(fn) => setExportFn(() => fn)} />
          </main>

          {/* Bottom Production Status Bar */}
          <StatusBar onExport={() => exportFn?.()} />
        </>
      )}
    </div>
  );
}
