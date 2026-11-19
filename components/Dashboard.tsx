"use client";

import React, { useEffect, useState } from "react";
import {
  ScriptItem,
  getAllScripts,
  createNewScript,
  deleteScript,
  initializeDatabaseWithSeed,
} from "@/lib/db";
import { useScriptStore } from "@/stores/scriptStore";

export function Dashboard() {
  const [scripts, setScripts] = useState<ScriptItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { loadScript, setCurrentView } = useScriptStore();

  const fetchScripts = async () => {
    setIsLoading(true);
    await initializeDatabaseWithSeed();
    const data = await getAllScripts();
    setScripts(data);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchScripts();
  }, []);

  const handleCreateNew = async () => {
    const newDoc = await createNewScript("Untitled Script");
    loadScript(newDoc);
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (confirm("Are you sure you want to delete this script?")) {
      await deleteScript(id);
      setScripts((prev) => prev.filter((s) => s.id !== id));
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-8 py-10 pb-20">
      {/* Dashboard Top Header */}
      <div className="flex items-center justify-between pb-8 border-b border-[#E5E5EA]">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#1D1D1F] font-display">
            Your Scripts
          </h1>
          <p className="text-xs text-[#86868B] mt-1">
            Persisted securely in your browser storage with shot metadata and thumbnails.
          </p>
        </div>

        <button
          onClick={handleCreateNew}
          className="flex items-center gap-1.5 px-4 py-2 bg-[#1D1D1F] hover:bg-black text-white rounded-lg text-xs font-semibold tracking-tight transition-all shadow-sm cursor-pointer"
        >
          <span className="text-sm leading-none">+</span>
          <span>New Script</span>
        </button>
      </div>

      {/* Scripts Grid */}
      {isLoading ? (
        <div className="py-24 text-center text-xs text-[#86868B]">
          Loading your script library...
        </div>
      ) : scripts.length === 0 ? (
        <div className="py-24 text-center space-y-3">
          <p className="text-sm text-[#86868B]">No scripts found in your library.</p>
          <button
            onClick={handleCreateNew}
            className="px-3.5 py-1.5 bg-[#1D1D1F] text-white rounded-md text-xs font-medium"
          >
            Create Your First Script
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-8">
          {scripts.map((script) => {
            const formattedDate = new Date(script.updatedAt).toLocaleDateString(
              undefined,
              {
                month: "short",
                day: "numeric",
                year: "numeric",
              }
            );

            return (
              <div
                key={script.id}
                onClick={() => loadScript(script)}
                className="group flex flex-col bg-white border border-[#E5E5EA] hover:border-[#1D1D1F] rounded-xl overflow-hidden transition-all duration-200 cursor-pointer shadow-xs hover:shadow-md"
              >
                {/* Thumbnail Header Area */}
                {script.thumbnail ? (
                  <div className="w-full h-44 bg-[#F5F5F7] overflow-hidden border-b border-[#E5E5EA] relative">
                    <img
                      src={script.thumbnail}
                      alt={script.title}
                      className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-300"
                    />
                  </div>
                ) : (
                  <div className="w-full h-36 bg-[#FAFAFA] border-b border-[#E5E5EA] flex flex-col justify-center items-center text-[#86868B] p-4 text-center">
                    <div className="text-2xl mb-1 opacity-40">📄</div>
                    <span className="text-[11px] font-mono tracking-tight opacity-70">
                      Text Script
                    </span>
                  </div>
                )}

                {/* Content Details */}
                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-[#1D1D1F] group-hover:text-black line-clamp-1 font-display">
                      {script.title || "Untitled Script"}
                    </h3>

                    <p className="text-xs text-[#86868B] line-clamp-2 mt-1.5 leading-relaxed font-sans">
                      {script.previewText || "Empty script..."}
                    </p>
                  </div>

                  {/* Metadata Footer */}
                  <div className="pt-4 mt-3 border-t border-[#F0F0F2] flex items-center justify-between text-[11px] text-[#86868B]">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-[#1D1D1F]">
                        {script.wordCount} words
                      </span>
                      <span>•</span>
                      <span className="font-mono">~{script.durationString}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span>{formattedDate}</span>
                      <button
                        onClick={(e) => handleDelete(e, script.id)}
                        className="opacity-0 group-hover:opacity-100 hover:text-rose-600 text-[12px] p-0.5 transition-opacity"
                        title="Delete script"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
