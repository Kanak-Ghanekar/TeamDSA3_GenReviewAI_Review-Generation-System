'use client';

import React, { useState } from 'react';
import { Send, ArrowRight } from 'lucide-react';

interface PrivateFeedbackFormProps {
  stars: number;
  onSubmit: (text: string, contact: string) => void;
  onPostAnyway: () => void;
}

export default function PrivateFeedbackForm({
  stars,
  onSubmit,
  onPostAnyway,
}: PrivateFeedbackFormProps) {
  const [text, setText] = useState('');
  const [contact, setContact] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    onSubmit(text, contact);
  };

  return (
    <div className="flex flex-col justify-between min-h-[420px] px-6 animate-pop-in">
      <div className="text-center mb-4">
        <span className="text-[10px] uppercase font-bold tracking-widest text-red-500 bg-red-500/10 px-2 py-0.5 rounded border border-red-500/20">
          Private Resolution
        </span>
        <h2 className="text-xl font-bold tracking-tight mt-3">We appreciate your honesty</h2>
        <p className="text-[11px] text-theme-text/50 mt-1.5">
          Your feedback will be sent directly to the business owner to resolve your issues privately.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4 my-2">
        <div>
          <label className="block text-[9px] font-bold text-theme-text/60 uppercase mb-2">
            What went wrong?
          </label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Tell us what we can improve..."
            rows={4}
            required
            className="w-full p-3 rounded-xl bg-theme-accent/30 border border-theme-border text-xs text-theme-text placeholder-theme-text/40 focus:outline-none focus:border-theme-primary leading-relaxed"
          />
        </div>

        <div>
          <label className="block text-[9px] font-bold text-theme-text/60 uppercase mb-2">
            Contact Information (Optional)
          </label>
          <input
            type="text"
            value={contact}
            onChange={(e) => setContact(e.target.value)}
            placeholder="Email or phone number"
            className="w-full p-3 rounded-xl bg-theme-accent/30 border border-theme-border text-xs text-theme-text placeholder-theme-text/40 focus:outline-none focus:border-theme-primary"
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full py-3.5 rounded-xl font-bold bg-theme-primary text-white hover:opacity-92 shadow-premium flex items-center justify-center gap-2 transform active:scale-98 transition-all text-xs tracking-wider uppercase disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Send size={12} />
          {submitting ? 'Submitting...' : 'Submit Feedback'}
        </button>
      </form>

      {/* Compliance Override Link */}
      <button
        onClick={onPostAnyway}
        className="text-[10px] text-theme-text/40 hover:text-theme-text transition-all text-center py-2 flex items-center justify-center gap-1"
      >
        <span>Skip private feedback & write Google Review</span>
        <ArrowRight size={10} />
      </button>
    </div>
  );
}
