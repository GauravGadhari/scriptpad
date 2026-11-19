"use client";

import React, { useState } from "react";
import { Editor } from "@tiptap/react";
import { ShotType } from "@/lib/defaults";

interface FloatingToolbarProps {
  editor: Editor | null;
  shotPalette: ShotType[];
  onOpenLabelDialog: () => void;
}

export function FloatingToolbar({
  editor,
  shotPalette,
  onOpenLabelDialog,
}: FloatingToolbarProps) {
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");

  if (!editor) return null;

  const currentAttrs = editor.getAttributes("paragraph");
  const currentShotColor = currentAttrs?.shotColor;
  const isLabelActive = editor.isActive("scriptLabel");

  const setLink = () => {
    if (linkUrl.trim()) {
      let finalUrl = linkUrl.trim();
      if (!/^https?:\/\//i.test(finalUrl)) {
        finalUrl = "https://" + finalUrl;
      }
      editor.chain().focus().extendMarkRange("link").setLink({ href: finalUrl }).run();
    } else {
      editor.chain().focus().unsetLink().run();
    }
    setShowLinkInput(false);
    setLinkUrl("");
  };

  return (
    <div className="flex flex-col bg-white border border-[#E5E5EA] shadow-xl rounded-lg p-1 text-xs text-[#1D1D1F] z-50">
      <div className="flex items-center gap-1">
        <button
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`px-2 py-1 rounded font-semibold transition-colors ${
            editor.isActive("bold") ? "bg-[#1D1D1F] text-white" : "hover:bg-[#F5F5F7]"
          }`}
          title="Bold (⌘B)"
        >
          B
        </button>

        <button
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`px-2 py-1 rounded italic transition-colors ${
            editor.isActive("italic") ? "bg-[#1D1D1F] text-white" : "hover:bg-[#F5F5F7]"
          }`}
          title="Italic (⌘I)"
        >
          I
        </button>

        <button
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={`px-2 py-1 rounded underline transition-colors ${
            editor.isActive("underline") ? "bg-[#1D1D1F] text-white" : "hover:bg-[#F5F5F7]"
          }`}
          title="Underline (⌘U)"
        >
          U
        </button>

        <button
          onClick={() => editor.chain().focus().toggleHighlight().run()}
          className={`px-2 py-1 rounded transition-colors ${
            editor.isActive("highlight") ? "bg-amber-200 text-amber-900" : "hover:bg-[#F5F5F7]"
          }`}
          title="Inline Highlight"
        >
          H
        </button>

        {/* Narrative & Script Label Button - Opens dedicated dialog */}
        <button
          onClick={() => {
            setShowLinkInput(false);
            onOpenLabelDialog();
          }}
          className={`px-2.5 py-1 rounded font-medium transition-colors flex items-center gap-1.5 cursor-pointer ${
            isLabelActive
              ? "bg-[#1D1D1F] text-white"
              : "hover:bg-[#F5F5F7] text-[#1D1D1F]"
          }`}
          title="Label this section with margin bracket lines"
        >
          <span>🏷️</span>
          <span>Label</span>
        </button>

        <button
          onClick={() => {
            if (editor.isActive("link")) {
              editor.chain().focus().unsetLink().run();
            } else {
              const previousUrl = editor.getAttributes("link").href || "";
              setLinkUrl(previousUrl);
              setShowLinkInput(true);
            }
          }}
          className={`px-2 py-1 rounded transition-colors ${
            editor.isActive("link") ? "bg-[#1D1D1F] text-white" : "hover:bg-[#F5F5F7]"
          }`}
          title="Link (URL)"
        >
          🔗
        </button>

        <div className="h-4 w-[1px] bg-[#E5E5EA] mx-1" />

        {/* Section Heading toggles */}
        <button
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          className={`px-1.5 py-1 rounded font-bold font-display ${
            editor.isActive("heading", { level: 1 }) ? "bg-[#1D1D1F] text-white" : "hover:bg-[#F5F5F7]"
          }`}
          title="Main Section (H1)"
        >
          H1
        </button>

        <button
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={`px-1.5 py-1 rounded font-semibold font-display ${
            editor.isActive("heading", { level: 2 }) ? "bg-[#1D1D1F] text-white" : "hover:bg-[#F5F5F7]"
          }`}
          title="Sub Section (H2)"
        >
          H2
        </button>

        <div className="h-4 w-[1px] bg-[#E5E5EA] mx-1" />

        {/* Shot color quick application for current block */}
        <div className="flex items-center gap-1">
          {shotPalette.map((shot) => (
            <button
              key={shot.id}
              onClick={() => {
                editor
                  .chain()
                  .focus()
                  .setShotType({
                    shotType: shot.id,
                    shotColor: shot.color,
                    shotLabel: shot.label,
                  })
                  .run();
              }}
              className={`w-5 h-5 rounded-full border border-black/10 transition-transform ${
                currentShotColor === shot.color ? "ring-2 ring-[#1D1D1F] scale-110" : "hover:scale-105"
              }`}
              style={{ backgroundColor: shot.color }}
              title={`Set Shot: ${shot.label} (⌘${shot.shortcut})`}
            />
          ))}

          <button
            onClick={() => editor.chain().focus().unsetShotType().run()}
            className="text-[11px] text-[#86868B] hover:text-[#1D1D1F] px-1.5 py-0.5 rounded hover:bg-[#F5F5F7]"
            title="Clear Shot Direction (⌘0)"
          >
            Clear
          </button>
        </div>
      </div>

      {showLinkInput && (
        <div className="mt-1.5 pt-1.5 border-t border-[#E5E5EA] flex items-center gap-1.5 px-0.5">
          <input
            type="text"
            placeholder="Paste or type URL (e.g. https://...)"
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                setLink();
              } else if (e.key === "Escape") {
                setShowLinkInput(false);
              }
            }}
            autoFocus
            className="flex-1 px-2 py-1 text-xs border border-[#E5E5EA] rounded outline-none focus:border-[#1D1D1F]"
          />
          <button
            onClick={setLink}
            className="px-2 py-1 bg-[#1D1D1F] text-white rounded text-xs font-medium hover:bg-black"
          >
            Save
          </button>
          <button
            onClick={() => setShowLinkInput(false)}
            className="px-2 py-1 text-xs text-[#86868B] hover:text-[#1D1D1F]"
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );
}
