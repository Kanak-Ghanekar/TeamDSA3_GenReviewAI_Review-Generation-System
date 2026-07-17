'use client';

import React, { useState } from 'react';
import { Check, ChevronDown, ChevronUp } from 'lucide-react';
import { KeywordGroup } from './templates';

interface TagSelectorProps {
  aspectGroups: KeywordGroup[];
  onSubmit: (selected: string[]) => void;
  onSkip: () => void;
  stars: number;
}

export default function TagSelector({ aspectGroups, onSubmit, onSkip, stars }: TagSelectorProps) {
  const [selected, setSelected] = useState<string[]>([]);
  const [expandedGroupIdx, setExpandedGroupIdx] = useState<number | null>(0); // Default expand the first aspect group

  const handleTagToggle = (tag: string) => {
    setSelected((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const toggleGroup = (idx: number) => {
    setExpandedGroupIdx(expandedGroupIdx === idx ? null : idx);
  };

  return (
    <div className="flex flex-col justify-between min-h-[460px] px-6 animate-pop-in">
      <div className="text-center mb-4">
        <span className="text-[10px] uppercase font-bold tracking-widest opacity-60 mb-2 block">
          {stars >= 3 ? 'Appreciation Details' : 'Improvement Details'}
        </span>
        <h2 className="text-lg font-bold tracking-tight">
          {stars >= 3 ? 'What did you love about us?' : 'What can we improve?'}
        </h2>
        <p className="text-[11px] text-theme-text/50 mt-1">
          Select keywords below to build your custom AI review draft.
        </p>
      </div>

      {/* Accordion List of Aspect Groups */}
      <div className="flex flex-col gap-3 my-4 max-h-[320px] overflow-y-auto pr-1">
        {aspectGroups.map((group, gIdx) => {
          const isExpanded = expandedGroupIdx === gIdx;
          const selectedInGroup = group.tags.filter(t => selected.includes(t));

          return (
            <div key={group.aspect} className="border border-theme-border/60 rounded-xl overflow-hidden bg-theme-accent/15 transition-all">
              {/* Accordion Header */}
              <button
                onClick={() => toggleGroup(gIdx)}
                className="w-full p-4 flex justify-between items-center bg-theme-card/30 hover:bg-theme-card/50 transition-all"
              >
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-theme-text">{group.aspect}</span>
                  {selectedInGroup.length > 0 && (
                    <span className="bg-theme-primary/10 text-theme-primary text-[9px] font-extrabold px-1.5 py-0.5 rounded-full border border-theme-primary/20">
                      {selectedInGroup.length}
                    </span>
                  )}
                </div>
                {isExpanded ? <ChevronUp size={14} className="opacity-60" /> : <ChevronDown size={14} className="opacity-60" />}
              </button>

              {/* Accordion Body */}
              {isExpanded && (
                <div className="p-3 bg-theme-card/10 grid grid-cols-2 gap-2 border-t border-theme-border/30 animate-slide-down">
                  {group.tags.map((tag) => {
                    const isSelected = selected.includes(tag);
                    return (
                      <button
                        key={tag}
                        onClick={() => handleTagToggle(tag)}
                        className={`p-2.5 rounded-lg text-[11px] font-semibold flex items-center justify-between border transition-all active-scale ${
                          isSelected
                            ? 'bg-theme-primary/10 border-theme-primary text-theme-primary'
                            : 'bg-theme-accent/35 border-theme-border/40 text-theme-text hover:bg-theme-accent/60'
                        }`}
                      >
                        <span className="truncate mr-1">{tag}</span>
                        {isSelected && <Check size={12} className="text-theme-primary shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Action Footer */}
      <div className="flex flex-col gap-2.5 mt-2">
        <button
          onClick={() => onSubmit(selected)}
          disabled={selected.length === 0}
          className="w-full py-3.5 rounded-xl font-bold bg-theme-primary text-white hover:opacity-92 shadow-premium disabled:opacity-50 disabled:cursor-not-allowed transition-all text-xs tracking-wider uppercase"
        >
          Generate AI Draft
        </button>
        <button
          onClick={onSkip}
          className="w-full py-2.5 text-xs font-bold text-theme-text/50 hover:text-theme-text transition-all text-center"
        >
          Skip & Customize Draft
        </button>
      </div>
    </div>
  );
}
