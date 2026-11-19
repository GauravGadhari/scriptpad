"use client";

import React, { useState } from "react";
import { useScriptStore } from "@/stores/scriptStore";
import { ShotType } from "@/lib/defaults";

export function ShotPaletteHeader() {
  const { shotPalette, updateShotType } = useScriptStore();
  const [editingShot, setEditingShot] = useState<ShotType | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="relative">
      {/* Desktop View: Clean horizontal pills */}
      <div className="hidden lg:flex items-center gap-1.5 flex-wrap">
        {shotPalette.map((shot) => (
          <button
            key={shot.id}
            onClick={() => setEditingShot(shot)}
            className="group flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium text-[#1D1D1F] border border-transparent hover:border-[#E5E5EA] transition-all duration-150 cursor-pointer"
            style={{ backgroundColor: shot.color }}
            title={`Shortcut: ⌘${shot.shortcut} / Ctrl+${shot.shortcut} — Click to customize`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#1D1D1F]/40" />
            <span>{shot.label}</span>
            <span className="text-[10px] text-[#1D1D1F]/50 font-mono ml-0.5">⌘{shot.shortcut}</span>
          </button>
        ))}
      </div>

      {/* Mobile / Narrow Screen View: Compact camera shot palette icon button */}
      <div className="lg:hidden">
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-[#E5E5EA] bg-white text-[#1D1D1F] hover:bg-[#F5F5F7] transition-all text-xs font-medium shadow-xs"
          title="Shot Palette & Camera Angles"
        >
          <span className="flex items-center gap-0.5">
            <span className="w-2 h-2 rounded-full bg-[#DBEAFE] border border-black/10" />
            <span className="w-2 h-2 rounded-full bg-[#FEF3C7] border border-black/10" />
            <span className="w-2 h-2 rounded-full bg-[#D1FAE5] border border-black/10" />
          </span>
          <span className="text-xs font-medium">Shots</span>
          <span className="text-[10px] text-[#86868B]">{isMobileMenuOpen ? "▲" : "▼"}</span>
        </button>

        {isMobileMenuOpen && (
          <div className="absolute right-0 top-11 bg-white border border-[#E5E5EA] shadow-2xl rounded-xl p-2.5 z-50 w-64 space-y-1.5">
            <div className="text-[10px] uppercase font-semibold text-[#86868B] px-1 pb-1 border-b border-[#E5E5EA] flex justify-between items-center">
              <span>Camera Shots</span>
              <span className="text-[10px] text-[#86868B]/70">Tap to customize</span>
            </div>

            <div className="space-y-1">
              {shotPalette.map((shot) => (
                <button
                  key={shot.id}
                  onClick={() => {
                    setEditingShot(shot);
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium text-[#1D1D1F] flex items-center justify-between transition-transform active:scale-95"
                  style={{ backgroundColor: shot.color }}
                >
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-black/40" />
                    <span>{shot.label}</span>
                  </div>
                  <span className="text-[10px] font-mono opacity-60">⌘{shot.shortcut}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Edit Shot Modal Dialog */}
      {editingShot && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/25 backdrop-blur-[1px] p-4">
          <div
            className="bg-white border border-[#E5E5EA] shadow-2xl rounded-xl p-4 w-full max-w-xs space-y-3"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-2 border-b border-[#E5E5EA]">
              <div className="text-xs font-semibold text-[#1D1D1F] font-display">
                Customize Shot Angle
              </div>
              <button
                onClick={() => setEditingShot(null)}
                className="text-xs text-[#86868B] hover:text-[#1D1D1F]"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2.5">
              <div>
                <label className="text-[10px] uppercase tracking-wider text-[#86868B] block mb-1">
                  Shot Name
                </label>
                <input
                  type="text"
                  value={editingShot.label}
                  onChange={(e) => {
                    const updated = { ...editingShot, label: e.target.value };
                    setEditingShot(updated);
                    const idx = shotPalette.findIndex((s) => s.id === editingShot.id);
                    if (idx !== -1) updateShotType(idx, { label: e.target.value });
                  }}
                  className="w-full text-xs px-2.5 py-1.5 border border-[#E5E5EA] rounded-lg focus:outline-none focus:border-[#1D1D1F]"
                />
              </div>

              <div>
                <label className="text-[10px] uppercase tracking-wider text-[#86868B] block mb-1">
                  Background Tint
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={editingShot.color}
                    onChange={(e) => {
                      const updated = { ...editingShot, color: e.target.value };
                      setEditingShot(updated);
                      const idx = shotPalette.findIndex((s) => s.id === editingShot.id);
                      if (idx !== -1) updateShotType(idx, { color: e.target.value });
                    }}
                    className="w-8 h-8 rounded border border-[#E5E5EA] cursor-pointer p-0.5 bg-white"
                  />
                  <span className="text-xs font-mono text-[#86868B]">{editingShot.color}</span>
                </div>
              </div>
            </div>

            <div className="mt-3 flex justify-end pt-2 border-t border-[#E5E5EA]">
              <button
                onClick={() => setEditingShot(null)}
                className="text-xs px-3 py-1.5 bg-[#1D1D1F] text-white rounded-lg font-medium hover:bg-black transition-colors"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
