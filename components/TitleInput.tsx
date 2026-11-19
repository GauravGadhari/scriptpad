"use client";

import React, { useState } from "react";
import { useScriptStore } from "@/stores/scriptStore";
import { getScriptById, saveScript } from "@/lib/db";

export function TitleInput() {
  const { title, setTitle, currentScriptId } = useScriptStore();
  const [isEditing, setIsEditing] = useState(false);

  const handleSaveTitle = async (newTitle: string) => {
    setTitle(newTitle);
    if (currentScriptId) {
      const existing = await getScriptById(currentScriptId);
      if (existing) {
        await saveScript({
          ...existing,
          title: newTitle,
        });
      }
    }
  };

  return (
    <div className="mb-6 group">
      {isEditing ? (
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onBlur={(e) => {
            setIsEditing(false);
            handleSaveTitle(e.target.value);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              setIsEditing(false);
              handleSaveTitle((e.target as HTMLInputElement).value);
            }
          }}
          autoFocus
          className="w-full text-3xl font-bold tracking-tight text-[#1D1D1F] bg-transparent outline-none border-b border-[#E5E5EA] pb-1 font-display"
        />
      ) : (
        <h1
          onClick={() => setIsEditing(true)}
          className="text-3xl font-bold tracking-tight text-[#1D1D1F] cursor-text pb-1 border-b border-transparent hover:border-[#E5E5EA] transition-colors font-display"
          title="Click to rename script"
        >
          {title || "Untitled Script"}
        </h1>
      )}
    </div>
  );
}
