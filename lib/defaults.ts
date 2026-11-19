export interface ShotType {
  id: string;
  label: string;
  color: string; // Background tint hex
  shortcut: number; // 1-6
}

export const DEFAULT_SHOT_PALETTE: ShotType[] = [
  { id: "talking-head", label: "Talking Head (Camera A)", color: "#DBEAFE", shortcut: 1 }, // Soft blue
  { id: "broll-vo", label: "B-Roll / Voiceover", color: "#FEF3C7", shortcut: 2 }, // Warm amber
  { id: "screen-demo", label: "Screen / Visual Demo", color: "#D1FAE5", shortcut: 3 }, // Light emerald
  { id: "key-quote", label: "Emphasis / Key Insight", color: "#FCE7F3", shortcut: 4 }, // Soft rose
  { id: "secondary-cam", label: "Camera B (Tight Angle)", color: "#EDE9FE", shortcut: 5 }, // Soft lavender
  { id: "director-note", label: "Stage Note / Direction", color: "#F3F4F6", shortcut: 6 }, // Neutral gray
];

export const INITIAL_SCRIPT_CONTENT = {
  type: "doc",
  content: [
    {
      type: "paragraph",
      attrs: { shotType: "talking-head", shotColor: "#DBEAFE", shotLabel: "Talking Head (Camera A)" },
      content: [
        {
          type: "text",
          text: "What if everything you thought you knew about documentary pacing was backward?",
        },
      ],
    },
    {
      type: "paragraph",
      attrs: { shotType: "broll-vo", shotColor: "#FEF3C7", shotLabel: "B-Roll / Voiceover" },
      content: [
        {
          type: "text",
          text: "[Cut to archival footage: high contrast, fast-paced editing sequence showing the London office in 2010.]",
        },
      ],
    },
    {
      type: "paragraph",
      attrs: { shotType: "secondary-cam", shotColor: "#EDE9FE", shotLabel: "Camera B (Tight Angle)" },
      content: [
        {
          type: "text",
          text: "Over the next twenty minutes, we will break down the exact mathematical structure behind the world's most viral stories.",
        },
      ],
    },
    {
      type: "paragraph",
      attrs: { shotType: "director-note", shotColor: "#F3F4F6", shotLabel: "Stage Note / Direction" },
      content: [
        {
          type: "text",
          text: "[Hold gaze directly on lens. Lower voice pitch by 10%. Complete stillness.]",
        },
      ],
    },
    {
      type: "paragraph",
      attrs: { shotType: null, shotColor: null, shotLabel: null },
      content: [
        {
          type: "text",
          text: "And it starts with one single question that almost nobody asked...",
        },
      ],
    },
    {
      type: "paragraph",
      attrs: { shotType: null, shotColor: null, shotLabel: null },
    },
  ],
};
