'use client';

import React from 'react';
import { ArrowRight, CornerUpLeft } from 'lucide-react';

interface FeedbackConfirmProps {
  onPostAnyway: () => void;
  onReset: () => void;
}

export default function FeedbackConfirm({
  onPostAnyway,
  onReset,
}: FeedbackConfirmProps) {
  return (
    <div className="flex flex-col justify-between min-h-[420px] px-6 text-center animate-pop-in">
      <div className="flex-grow flex flex-col items-center justify-center">
        <div className="text-4xl mb-6">📬</div>
        <h2 className="text-xl font-bold tracking-tight mb-3">Feedback Received</h2>
        <p className="text-xs text-theme-text/60 leading-relaxed max-w-xs mb-8">
          Thank you for letting us know. Your complaints and details have been sent directly to the local managers.
        </p>

        <div className="flex flex-col gap-3 w-full">
          <button
            onClick={onReset}
            className="w-full py-3.5 rounded-xl font-bold bg-theme-accent/30 border border-theme-border text-theme-text hover:bg-theme-accent flex items-center justify-center gap-1.5 transition-all text-xs"
          >
            <CornerUpLeft size={14} />
            Back to Start
          </button>
          <button
            onClick={onPostAnyway}
            className="w-full py-3 rounded-xl text-[10px] font-bold text-theme-text/40 hover:text-theme-text flex items-center justify-center gap-1 transition-all"
          >
            <span>Write public Google review instead</span>
            <ArrowRight size={12} />
          </button>
        </div>
      </div>
    </div>
  );
}
