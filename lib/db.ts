import { openDB, DBSchema, IDBPDatabase } from "idb";
import { JSONContent } from "@tiptap/react";
import { ShotType, DEFAULT_SHOT_PALETTE, INITIAL_SCRIPT_CONTENT } from "./defaults";
import { nanoid } from "nanoid";

export interface ScriptItem {
  id: string;
  title: string;
  thumbnail: string | null; // Data URL or image src extracted from first image in doc
  previewText: string;
  wordCount: number;
  durationString: string;
  createdAt: number;
  updatedAt: number;
  content: JSONContent;
  shotPalette: ShotType[];
}

interface ScriptPadDB extends DBSchema {
  scripts: {
    key: string;
    value: ScriptItem;
    indexes: {
      "by-updated": number;
    };
  };
}

const DB_NAME = "scriptpad_database";
const DB_VERSION = 1;

let dbPromise: Promise<IDBPDatabase<ScriptPadDB>> | null = null;

function getDB() {
  if (typeof window === "undefined") return null;
  if (!dbPromise) {
    dbPromise = openDB<ScriptPadDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        const store = db.createObjectStore("scripts", { keyPath: "id" });
        store.createIndex("by-updated", "updatedAt");
      },
    });
  }
  return dbPromise;
}

// Helper to extract first image and clean preview text from Tiptap JSON content
export function extractThumbnailAndPreview(content: JSONContent): {
  thumbnail: string | null;
  previewText: string;
} {
  let thumbnail: string | null = null;
  let textAccumulator = "";

  function traverse(node: JSONContent) {
    if (!thumbnail && node.type === "image" && node.attrs?.src) {
      thumbnail = node.attrs.src;
    }
    if (node.type === "text" && node.text) {
      textAccumulator += " " + node.text;
    }
    if (node.content) {
      for (const child of node.content) {
        traverse(child);
      }
    }
  }

  traverse(content);

  const previewText = textAccumulator.trim().slice(0, 160);
  return { thumbnail, previewText };
}

// Compute voiceover duration
export function computeDuration(wordCount: number): string {
  if (wordCount <= 0) return "0:00";
  const totalMinutes = wordCount / 150;
  const minutes = Math.floor(totalMinutes);
  const seconds = Math.round((totalMinutes - minutes) * 60);
  return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
}

export async function getAllScripts(): Promise<ScriptItem[]> {
  const db = await getDB();
  if (!db) return [];
  const all = await db.getAllFromIndex("scripts", "by-updated");
  return all.reverse(); // Newest first
}

export async function getScriptById(id: string): Promise<ScriptItem | null> {
  const db = await getDB();
  if (!db) return null;
  const item = await db.get("scripts", id);
  return item || null;
}

export async function saveScript(
  script: Omit<ScriptItem, "updatedAt"> & { updatedAt?: number }
): Promise<ScriptItem> {
  const db = await getDB();
  const now = Date.now();
  const item: ScriptItem = {
    ...script,
    updatedAt: now,
  };
  if (db) {
    await db.put("scripts", item);
  }
  return item;
}

export async function deleteScript(id: string): Promise<void> {
  const db = await getDB();
  if (!db) return;
  await db.delete("scripts", id);
}

export async function createNewScript(title = "Untitled Script"): Promise<ScriptItem> {
  const newId = nanoid(10);
  const emptyContent: JSONContent = {
    type: "doc",
    content: [
      {
        type: "paragraph",
        attrs: { shotType: null, shotColor: null, shotLabel: null },
      },
    ],
  };

  const newScript: ScriptItem = {
    id: newId,
    title,
    thumbnail: null,
    previewText: "",
    wordCount: 0,
    durationString: "0:00",
    createdAt: Date.now(),
    updatedAt: Date.now(),
    content: emptyContent,
    shotPalette: DEFAULT_SHOT_PALETTE,
  };

  return await saveScript(newScript);
}

// Migrate legacy single script if first time using IndexedDB
export async function initializeDatabaseWithSeed(): Promise<void> {
  const db = await getDB();
  if (!db) return;
  const count = await db.count("scripts");
  if (count === 0) {
    // Check localStorage for any existing draft from previous sessions
    let initialContent = INITIAL_SCRIPT_CONTENT;
    try {
      const saved = localStorage.getItem("scriptpad_document_v1");
      if (saved) {
        initialContent = JSON.parse(saved);
      }
    } catch {
      // ignore
    }

    const { thumbnail, previewText } = extractThumbnailAndPreview(initialContent);
    const seedScript: ScriptItem = {
      id: "seed-doc-1",
      title: "The Architecture of a 400M View Documentary",
      thumbnail,
      previewText: previewText || "What if everything you thought you knew about documentary pacing was backward?",
      wordCount: 52,
      durationString: "0:21",
      createdAt: Date.now(),
      updatedAt: Date.now(),
      content: initialContent,
      shotPalette: DEFAULT_SHOT_PALETTE,
    };
    await db.put("scripts", seedScript);
  }
}
