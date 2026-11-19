"use client";

import React, { useEffect, useState } from "react";

export interface ScriptAnnotation {
  id: string;
  name: string;
  color: string;
  top: number;
  height: number;
}

interface LabelMarginaliaOverlayProps {
  containerRef: React.RefObject<HTMLDivElement | null>;
  onRemoveLabel: (labelId: string) => void;
}

export function LabelMarginaliaOverlay({
  containerRef,
  onRemoveLabel,
}: LabelMarginaliaOverlayProps) {
  const [annotations, setAnnotations] = useState<ScriptAnnotation[]>([]);

  useEffect(() => {
    const updatePositions = () => {
      if (!containerRef.current) return;
      const containerRect = containerRef.current.getBoundingClientRect();

      const labelElements = containerRef.current.querySelectorAll(
        ".script-annotated-label[data-label-id]"
      );

      // Group elements by label id (in case selection spanned multiple spans/paragraphs)
      const labelMap = new Map<
        string,
        { name: string; color: string; top: number; bottom: number }
      >();

      labelElements.forEach((el) => {
        const id = el.getAttribute("data-label-id");
        if (!id) return;
        const name = el.getAttribute("data-label-name") || "Label";
        const color = el.getAttribute("data-label-color") || "#0066cc";
        const rect = el.getBoundingClientRect();

        const topRel = rect.top - containerRect.top;
        const bottomRel = rect.bottom - containerRect.top;

        if (labelMap.has(id)) {
          const existing = labelMap.get(id)!;
          existing.top = Math.min(existing.top, topRel);
          existing.bottom = Math.max(existing.bottom, bottomRel);
        } else {
          labelMap.set(id, { name, color, top: topRel, bottom: bottomRel });
        }
      });

      const list: ScriptAnnotation[] = [];
      labelMap.forEach((val, id) => {
        list.push({
          id,
          name: val.name,
          color: val.color,
          top: val.top,
          height: Math.max(val.bottom - val.top, 24),
        });
      });

      // Sort by vertical position
      list.sort((a, b) => a.top - b.top);
      setAnnotations(list);
    };

    updatePositions();

    // MutationObserver: re-measure only when the DOM inside the editor actually changes
    // (label spans added/removed, text nodes mutated). Much cheaper than 300ms polling.
    let rafId: ReturnType<typeof requestAnimationFrame> | null = null;
    const scheduleUpdate = () => {
      if (rafId) return; // coalesce rapid mutations into one rAF
      rafId = requestAnimationFrame(() => {
        rafId = null;
        updatePositions();
      });
    };

    const observer = new MutationObserver(scheduleUpdate);
    if (containerRef.current) {
      observer.observe(containerRef.current, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ["data-label-id", "data-label-name", "data-label-color"],
      });
    }

    // Slow interval as a safety net for position drift (scroll, resize, layout shift)
    const interval = setInterval(updatePositions, 2000);
    window.addEventListener("resize", updatePositions);
    window.addEventListener("scroll", updatePositions, true);

    return () => {
      observer.disconnect();
      if (rafId) cancelAnimationFrame(rafId);
      clearInterval(interval);
      window.removeEventListener("resize", updatePositions);
      window.removeEventListener("scroll", updatePositions, true);
    };
  }, [containerRef]);

  if (annotations.length === 0) return null;

  return (
    // Positioned completely in the clear margin space outside the text column
    <div className="absolute top-0 -right-44 bottom-0 pointer-events-none w-[170px] overflow-visible">
      {annotations.map((ann) => {
        const bracketTop = ann.top;
        const bracketHeight = Math.max(ann.height, 26);
        const bracketCenterY = bracketTop + bracketHeight / 2;
        
        // Starts at x=0 (the right boundary of the text writing surface)
        // Curves outwards into the right margin and ends at label anchor
        const startX = 0;
        const bracketBendX = 14;
        const stemX = 24;
        const labelX = 36; // Positioned cleanly in the margin

        const pathD =
          bracketHeight <= 28
            ? `M ${startX} ${bracketTop + 3} Q ${bracketBendX} ${bracketTop + 3} ${stemX} ${bracketCenterY} L ${labelX - 4} ${bracketCenterY}`
            : `M ${startX} ${bracketTop + 3} 
               Q ${bracketBendX} ${bracketTop + 3} ${bracketBendX} ${bracketTop + 14} 
               L ${bracketBendX} ${bracketCenterY - 10} 
               Q ${bracketBendX} ${bracketCenterY} ${stemX} ${bracketCenterY} 
               L ${labelX - 4} ${bracketCenterY} 
               M ${startX} ${bracketTop + bracketHeight - 3} 
               Q ${bracketBendX} ${bracketTop + bracketHeight - 3} ${bracketBendX} ${bracketTop + bracketHeight - 14} 
               L ${bracketBendX} ${bracketCenterY + 10} 
               Q ${bracketBendX} ${bracketCenterY} ${stemX} ${bracketCenterY}`;

        return (
          <div key={ann.id} className="absolute left-0 top-0 w-full h-full pointer-events-none">
            {/* SVG Connecting Branch */}
            <svg
              className="absolute left-0 top-0 overflow-visible w-full h-full pointer-events-none"
              style={{ filter: "drop-shadow(0 1px 1px rgba(0,0,0,0.03))" }}
            >
              <path
                d={pathD}
                fill="none"
                stroke={ann.color}
                strokeWidth="1.75"
                strokeLinecap="round"
                strokeLinejoin="round"
                opacity="0.85"
              />
              <circle
                cx={labelX - 4}
                cy={bracketCenterY}
                r="2.5"
                fill={ann.color}
              />
            </svg>

            {/* Right Side Text Label Tag in Right Margin */}
            <div
              className="absolute flex items-center gap-1.5 pointer-events-auto group cursor-pointer"
              style={{
                left: `${labelX}px`,
                top: `${bracketCenterY - 11}px`,
              }}
              title="Click × to remove label"
            >
              <div
                className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold tracking-tight shadow-sm border border-black/5 transition-transform group-hover:scale-105 select-none whitespace-nowrap"
                style={{
                  backgroundColor: ann.color + "18",
                  color: ann.color,
                  borderLeft: `2.5px solid ${ann.color}`,
                }}
              >
                <span>{ann.name}</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemoveLabel(ann.id);
                  }}
                  className="opacity-40 group-hover:opacity-100 hover:text-black ml-1 text-[11px] leading-none"
                >
                  ×
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
