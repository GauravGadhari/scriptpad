"use client";

import React, { useState } from "react";

interface LabelDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (name: string, color: string) => void;
  initialName?: string;
  initialColor?: string;
}

const PRESET_LABELS = [
  { name: "Hook", color: "#E11D48" }, // Crimson
  { name: "Story Arc", color: "#2563EB" }, // Royal blue
  { name: "Core Thesis", color: "#7C3AED" }, // Purple
  { name: "Evidence / Proof", color: "#059669" }, // Emerald green
  { name: "Tension / Climax", color: "#D97706" }, // Amber
  { name: "Call To Action", color: "#0284C7" }, // Sky
];

export function LabelDialog({
  isOpen,
  onClose,
  onApply,
  initialName = "",
  initialColor = "#E11D48",
}: LabelDialogProps) {
  const [labelName, setLabelName] = useState(initialName);
  const [labelColor, setLabelColor] = useState(initialColor);

  if (!isOpen) return null;

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (labelName.trim()) {
      onApply(labelName.trim(), labelColor);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/25 backdrop-blur-[1px]">
      <div
        className="bg-white rounded-xl shadow-2xl border border-[#E5E5EA] w-full max-w-sm p-5 space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-2 border-b border-[#E5E5EA]">
          <h3 className="text-sm font-semibold text-[#1D1D1F] font-display">
            Add Script Label
          </h3>
          <button
            onClick={onClose}
            className="text-[#86868B] hover:text-[#1D1D1F] text-base leading-none p-1"
          >
            ✕
          </button>
        </div>

        {/* Quick Presets */}
        <div>
          <label className="text-[10px] uppercase tracking-wider font-semibold text-[#86868B] block mb-2">
            Suggested Presets
          </label>
          <div className="flex flex-wrap gap-1.5">
            {PRESET_LABELS.map((p) => (
              <button
                type="button"
                key={p.name}
                onClick={() => {
                  setLabelName(p.name);
                  setLabelColor(p.color);
                }}
                className={`px-2.5 py-1 rounded-full text-xs font-medium border transition-all cursor-pointer flex items-center gap-1.5 ${
                  labelName === p.name
                    ? "border-[#1D1D1F] shadow-xs"
                    : "border-black/5 hover:border-black/20"
                }`}
                style={{ backgroundColor: p.color + "18", color: p.color }}
              >
                <span
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ backgroundColor: p.color }}
                />
                <span>{p.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Custom Input */}
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="text-[10px] uppercase tracking-wider font-semibold text-[#86868B] block mb-1">
              Label Name
            </label>
            <input
              type="text"
              placeholder="e.g. 0-15s Hook, Retain Loop..."
              value={labelName}
              onChange={(e) => setLabelName(e.target.value)}
              autoFocus
              className="w-full px-3 py-2 text-xs border border-[#E5E5EA] rounded-lg outline-none focus:border-[#1D1D1F] focus:ring-1 focus:ring-[#1D1D1F]"
            />
          </div>

          <div>
            <label className="text-[10px] uppercase tracking-wider font-semibold text-[#86868B] block mb-1">
              Connector Line Color
            </label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={labelColor}
                onChange={(e) => setLabelColor(e.target.value)}
                className="w-8 h-8 rounded border border-[#E5E5EA] cursor-pointer p-0.5 bg-white"
              />
              <span className="text-xs font-mono text-[#86868B]">{labelColor}</span>
            </div>
          </div>

          <div className="flex justify-end items-center gap-2 pt-2 border-t border-[#E5E5EA]">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 text-xs text-[#86868B] hover:text-[#1D1D1F] rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!labelName.trim()}
              className="px-4 py-1.5 text-xs bg-[#1D1D1F] text-white font-medium rounded-lg hover:bg-black transition-colors disabled:opacity-40 cursor-pointer"
            >
              Add Label
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
