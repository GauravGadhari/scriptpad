"use client";

import React, { useEffect, useRef, useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Highlight from "@tiptap/extension-highlight";
import Underline from "@tiptap/extension-underline";
import Placeholder from "@tiptap/extension-placeholder";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import { BubbleMenu } from "@tiptap/react/menus";
import { nanoid } from "nanoid";

import { ShotParagraph } from "@/extensions/ShotParagraph";
import { ScriptLabelMark } from "@/extensions/ScriptLabelMark";
import { LabelMarginaliaOverlay } from "./LabelMarginaliaOverlay";
import { LabelDialog } from "./LabelDialog";
import { useScriptStore } from "@/stores/scriptStore";
import { FloatingToolbar } from "./FloatingToolbar";
import {
  saveScript,
  getScriptById,
  extractThumbnailAndPreview,
  computeDuration,
} from "@/lib/db";

interface EditorProps {
  onExportReady: (exportFn: () => void) => void;
}

export function Editor({ onExportReady }: EditorProps) {
  const {
    currentScriptId,
    shotPalette,
    setWordCount,
    title,
  } = useScriptStore();
  const [isClient, setIsClient] = useState(false);
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [isLabelDialogOpen, setIsLabelDialogOpen] = useState(false);
  const editorContainerRef = useRef<HTMLDivElement>(null);

  // Debounce refs — keep stable across renders without triggering re-renders
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const latestTitleRef = useRef(title);
  const latestShotPaletteRef = useRef(shotPalette);
  const latestScriptIdRef = useRef(currentScriptId);

  // Keep refs in sync with latest store values without rebuilding the editor
  useEffect(() => { latestTitleRef.current = title; }, [title]);
  useEffect(() => { latestShotPaletteRef.current = shotPalette; }, [shotPalette]);
  useEffect(() => { latestScriptIdRef.current = currentScriptId; }, [currentScriptId]);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        paragraph: false, // Replaced by our custom ShotParagraph
      }),
      ShotParagraph,
      ScriptLabelMark,
      Underline,
      Highlight.configure({ multicolor: true }),
      Placeholder.configure({
        placeholder: "Start typing your script or narration line...",
        emptyEditorClass: "is-editor-empty",
        emptyNodeClass: "is-empty",
      }),
      Image.configure({
        inline: false,
        allowBase64: true,
      }),
      Link.configure({
        openOnClick: false,
        autolink: true,
        defaultProtocol: "https",
        HTMLAttributes: {
          target: "_blank",
          rel: "noopener noreferrer",
        },
      }),
    ],
    content: null,
    editorProps: {
      attributes: {
        class: "focus:outline-none min-h-[500px]",
      },
      handlePaste: (view, event) => {
        const items = event.clipboardData?.items;
        if (items) {
          for (let i = 0; i < items.length; i++) {
            const item = items[i];
            if (item.type.indexOf("image") !== -1) {
              const file = item.getAsFile();
              if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                  const base64 = e.target?.result as string;
                  if (base64 && editor) {
                    editor.chain().focus().setImage({ src: base64 }).run();
                  }
                };
                reader.readAsDataURL(file);
                return true;
              }
            }
          }
        }
        return false;
      },
      handleKeyDown: (view, event) => {
        // Handle shortcuts: Cmd/Ctrl + 1..6 for shots, 0 for clear
        if (event.metaKey || event.ctrlKey) {
          const keyNum = parseInt(event.key, 10);
          if (keyNum >= 1 && keyNum <= 6) {
            event.preventDefault();
            const targetShot = shotPalette.find((s) => s.shortcut === keyNum);
            if (targetShot && editor) {
              editor
                .chain()
                .focus()
                .setShotType({
                  shotType: targetShot.id,
                  shotColor: targetShot.color,
                  shotLabel: targetShot.label,
                })
                .run();
              return true;
            }
          } else if (event.key === "0") {
            event.preventDefault();
            if (editor) {
              editor.chain().focus().unsetShotType().run();
              return true;
            }
          }
        }
        return false;
      },
    },
    onUpdate: ({ editor }) => {
      // Cancel any pending save timer — debounce all work to after 600ms of idle
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);

      saveTimerRef.current = setTimeout(() => {
        const text = editor.getText();
        const words = text.trim() ? text.trim().split(/\s+/).length : 0;
        setWordCount(words);

        const scriptId = latestScriptIdRef.current;
        if (scriptId) {
          const json = editor.getJSON();
          const { thumbnail, previewText } = extractThumbnailAndPreview(json);
          const durationString = computeDuration(words);

          saveScript({
            id: scriptId,
            title: latestTitleRef.current,
            content: json,
            thumbnail,
            previewText,
            wordCount: words,
            durationString,
            shotPalette: latestShotPaletteRef.current,
            createdAt: Date.now(),
          }).catch((err) => console.error("Auto-save failed:", err));
        }
      }, 600);
    },
  });

  // Cleanup debounce timer on unmount
  useEffect(() => {
    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, []);

  // Load active script from IndexedDB whenever currentScriptId changes
  useEffect(() => {
    if (!editor || !isClient || !currentScriptId) return;

    let isMounted = true;
    getScriptById(currentScriptId).then((script) => {
      if (!isMounted || !script) return;
      editor.commands.setContent(script.content);
      const text = editor.getText();
      const words = text.trim() ? text.trim().split(/\s+/).length : 0;
      setWordCount(words);
    });

    return () => {
      isMounted = false;
    };
  }, [editor, isClient, currentScriptId, setWordCount]);

  // Export Markdown handler
  useEffect(() => {
    if (!editor) return;

    const handleExport = () => {
      const json = editor.getJSON();
      let md = `# ${title}\n\n`;

      if (json.content) {
        for (const node of json.content) {
          if (node.type === "heading") {
            const level = node.attrs?.level || 1;
            const prefix = "#".repeat(level);
            let headingText = "";
            if (node.content) {
              for (const child of node.content as Array<{ type: string; text?: string }>) {
                if (child.type === "text") headingText += child.text || "";
              }
            }
            md += `${prefix} ${headingText}\n\n`;
          } else if (node.type === "image") {
            const src = node.attrs?.src || "";
            const alt = node.attrs?.alt || "Image";
            md += `![${alt}](${src})\n\n`;
          } else if (node.type === "paragraph") {
            const shotLabel = node.attrs?.shotLabel;
            let text = "";
            if (node.content) {
              for (const child of node.content as Array<{
                type: string;
                text?: string;
                marks?: Array<{
                  type: string;
                  attrs?: { href?: string; name?: string };
                }>;
              }>) {
                if (child.type === "text") {
                  let chunk = child.text || "";
                  if (child.marks) {
                    for (const mark of child.marks) {
                      if (mark.type === "bold") chunk = `**${chunk}**`;
                      if (mark.type === "italic") chunk = `*${chunk}*`;
                      if (mark.type === "highlight") chunk = `==${chunk}==`;
                      if (mark.type === "link")
                        chunk = `[${chunk}](${mark.attrs?.href || ""})`;
                      if (mark.type === "scriptLabel")
                        chunk = `{${chunk}}[Label: ${mark.attrs?.name || "Hook"}]`;
                    }
                  }
                  text += chunk;
                }
              }
            }

            if (shotLabel) {
              md += `> [!NOTE] **[${shotLabel}]**\n> ${text}\n\n`;
            } else {
              md += `${text}\n\n`;
            }
          }
        }
      }

      const blob = new Blob([md], { type: "text/markdown;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${title.toLowerCase().replace(/\s+/g, "_") || "script"}.md`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    };

    onExportReady(() => handleExport);
  }, [editor, title, onExportReady]);

  const applyLabelFromDialog = (name: string, color: string) => {
    if (!editor || !name.trim()) return;
    const labelId = `lbl_${nanoid(6)}`;
    editor
      .chain()
      .focus()
      .setScriptLabel({
        id: labelId,
        name: name.trim(),
        color,
      })
      .run();
  };

  const removeLabelById = (labelId: string) => {
    if (!editor) return;
    const { doc, tr } = editor.state;
    const labelMarkType = editor.schema.marks.scriptLabel;
    if (!labelMarkType) return;

    doc.descendants((node, pos) => {
      if (node.marks) {
        node.marks.forEach((mark) => {
          if (mark.type === labelMarkType && mark.attrs.id === labelId) {
            tr.removeMark(pos, pos + node.nodeSize, labelMarkType);
          }
        });
      }
    });

    editor.view.dispatch(tr);
  };

  const addNewBlock = (
    type: "clean-line" | "shot" | "h1" | "h2",
    shotId?: string
  ) => {
    if (!editor) return;
    editor.chain().focus("end").run();

    if (type === "clean-line") {
      editor
        .chain()
        .focus("end")
        .insertContent({
          type: "paragraph",
          attrs: { shotType: null, shotColor: null, shotLabel: null },
        })
        .run();
    } else if (type === "shot" && shotId) {
      const shot = shotPalette.find((s) => s.id === shotId);
      if (shot) {
        editor
          .chain()
          .focus("end")
          .insertContent({
            type: "paragraph",
            attrs: {
              shotType: shot.id,
              shotColor: shot.color,
              shotLabel: shot.label,
            },
          })
          .run();
      }
    } else if (type === "h1") {
      editor
        .chain()
        .focus("end")
        .insertContent({
          type: "heading",
          attrs: { level: 1 },
          content: [{ type: "text", text: "New Section" }],
        })
        .run();
    } else if (type === "h2") {
      editor
        .chain()
        .focus("end")
        .insertContent({
          type: "heading",
          attrs: { level: 2 },
          content: [{ type: "text", text: "Sub-Section" }],
        })
        .run();
    }
    setShowAddMenu(false);
  };

  if (!isClient || !editor) {
    return (
      <div className="py-20 text-center text-sm text-[#86868B]">
        Loading ScriptPad...
      </div>
    );
  }

  return (
    <div className="relative ruled-surface">
      {editor && (
        <BubbleMenu editor={editor}>
          <FloatingToolbar
            editor={editor}
            shotPalette={shotPalette}
            onOpenLabelDialog={() => setIsLabelDialogOpen(true)}
          />
        </BubbleMenu>
      )}

      {/* Dedicated Label Customization Dialog */}
      <LabelDialog
        isOpen={isLabelDialogOpen}
        onClose={() => setIsLabelDialogOpen(false)}
        onApply={applyLabelFromDialog}
      />

      {/* Editor Content with Right Marginalia Anchor */}
      <div ref={editorContainerRef} className="relative min-h-[500px]">
        <EditorContent editor={editor} />
        {/* Branching Marginalia Line Connector Overlay */}
        <LabelMarginaliaOverlay
          containerRef={editorContainerRef}
          onRemoveLabel={removeLabelById}
        />
      </div>

      {/* Persistent Bottom Add Block Surface */}
      <div className="mt-8 pt-4 border-t border-[#E5E5EA] flex items-center justify-between text-xs text-[#86868B]">
        <div className="relative">
          <button
            onClick={() => setShowAddMenu(!showAddMenu)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-md border border-[#E5E5EA] hover:border-[#1D1D1F] hover:text-[#1D1D1F] transition-all bg-white font-medium cursor-pointer"
            title="Add a separate line, section, or camera shot block"
          >
            <span className="text-sm font-semibold leading-none">+</span>
            <span>Add Block / Section</span>
          </button>

          {showAddMenu && (
            <div className="absolute left-0 bottom-9 bg-white border border-[#E5E5EA] shadow-xl rounded-lg p-2 z-50 w-64 space-y-1">
              <div className="text-[10px] uppercase font-semibold text-[#86868B] px-2 py-1">
                Standard Blocks
              </div>
              <button
                onClick={() => addNewBlock("clean-line")}
                className="w-full text-left px-2 py-1.5 rounded hover:bg-[#F5F5F7] text-xs flex items-center justify-between"
              >
                <span>Clean New Line</span>
                <span className="text-[10px] text-[#86868B]">Enter</span>
              </button>
              <button
                onClick={() => addNewBlock("h1")}
                className="w-full text-left px-2 py-1.5 rounded hover:bg-[#F5F5F7] text-xs flex items-center justify-between font-bold"
              >
                <span>Section Heading (H1)</span>
                <span className="text-[10px] text-[#86868B]">Act / Scene</span>
              </button>
              <button
                onClick={() => addNewBlock("h2")}
                className="w-full text-left px-2 py-1.5 rounded hover:bg-[#F5F5F7] text-xs flex items-center justify-between font-semibold"
              >
                <span>Sub-Section (H2)</span>
                <span className="text-[10px] text-[#86868B]">Topic</span>
              </button>

              <div className="border-t border-[#E5E5EA] my-1" />
              <div className="text-[10px] uppercase font-semibold text-[#86868B] px-2 py-1">
                Camera Shot Blocks
              </div>
              {shotPalette.map((shot) => (
                <button
                  key={shot.id}
                  onClick={() => addNewBlock("shot", shot.id)}
                  className="w-full text-left px-2 py-1.5 rounded hover:opacity-90 text-xs flex items-center gap-2"
                  style={{ backgroundColor: shot.color }}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-black/40" />
                  <span className="font-medium text-[#1D1D1F]">
                    {shot.label}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="text-[11px] text-[#86868B]/80 flex items-center gap-3">
          <span>
            Tip: Select text & tap Label to configure in the dialogue
          </span>
        </div>
      </div>
    </div>
  );
}
