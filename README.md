# ScriptPad

> A dedicated, Apple-grade YouTube script writing web app built for creators who record to their own scripts. Featuring block-level camera angle direction, curved margin brackets for narrative labeling, persistent browser storage, and an all-scripts dashboard.

---

## ✨ Features

- **Apple-Grade White Aesthetic**: Pure `#FFFFFF` background, native SF Pro typography, zero AI UI slop.
- **Block-Level Camera Direction (Shot Colors)**:
  - Talking Head (Camera A)
  - B-Roll / Voiceover
  - Screen / Visual Demo
  - Emphasis / Key Quote
  - Camera B (Tight Angle)
  - Stage Notes & Directions
- **Ruled Notebook Baseline Grid**: Notebook-style ruled baselines on lines and empty paragraphs.
- **Narrative Script Labels & Curved Margin Brackets**: Select any sentence or block and tag it (Hook, Story Arc, Core Thesis, Tension / Climax, Call to Action) with smooth curved bezier bracket lines pointing out to the right margin with zero text overlap.
- **Rich Media & Content**: Paste images directly with clipboard `⌘V`, embed links, toggle H1/H2 acts and scenes.
- **Touch-Optimized Mobile View**: Compact `[Shots]` popover menu that prevents pill overflow on mobile viewports.
- **All Scripts Dashboard**: Multi-script library with automatic first-image thumbnail extraction and word-count duration estimates (~150 wpm).
- **IndexedDB Storage Persistence**: Permanent local persistence across browser sessions.
- **Markdown Export**: One-click export to annotated `.md` files.

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm

### Installation

```bash
# Clone the repository
git clone https://github.com/GauravGadhari/scriptpad.git
cd scriptpad

# Install dependencies
npm install

# Run the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) (or the port indicated in terminal) in your browser.

### Production Build

```bash
npm run build
npm run start
```

---

## 🛠️ Tech Stack

- **Framework**: Next.js 15+ (App Router)
- **Editor Engine**: Tiptap 2 (ProseMirror core)
- **State Management**: Zustand
- **Database**: IndexedDB (`idb`)
- **Typography**: SF Pro Display & SF Pro Text
- **Styling**: Tailwind CSS
