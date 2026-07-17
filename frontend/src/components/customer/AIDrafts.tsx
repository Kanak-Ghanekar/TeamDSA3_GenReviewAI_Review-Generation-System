'use client';

import React, { useState, useEffect } from 'react';
import { Copy, Check, ExternalLink, Sparkles, RefreshCw } from 'lucide-react';

interface AIDraftsProps {
  stars: number;
  selectedTags: string[];
  toneDescriptor: string;
  businessName: string;
  googlePlaceId: string;
  onComplete: () => void;
  onGoToPrivateFeedback?: () => void;
}

export default function AIDrafts({
  stars,
  selectedTags,
  toneDescriptor,
  businessName,
  googlePlaceId,
  onComplete,
  onGoToPrivateFeedback,
}: AIDraftsProps) {
  const [drafts, setDrafts] = useState<string[]>([]);
  const [draft, setDraft] = useState('');
  const [selectedDraftIndex, setSelectedDraftIndex] = useState<number | null>(null);
  
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [copiedFinal, setCopiedFinal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [customKeywords, setCustomKeywords] = useState('');

  // Sync selected tags to input box as initial comma-separated keywords
  useEffect(() => {
    if (selectedTags && selectedTags.length > 0) {
      setCustomKeywords(selectedTags.join(', '));
    }
  }, [selectedTags]);

  const generateReviews = async (tagsToUse: string[]) => {
    if (tagsToUse.length === 0) {
      setError('Please provide at least one keyword tag.');
      return;
    }

    setLoading(true);
    setError('');
    setSelectedDraftIndex(null);
    try {
      const response = await fetch('/api/review/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          keywords: tagsToUse,
          businessName,
          stars,
          toneDescriptor,
        }),
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to generate reviews.');
      }

      setDrafts(data.reviews);
      
      // Auto-select the first review on successful load
      if (data.reviews && data.reviews.length > 0) {
        setSelectedDraftIndex(0);
        setDraft(data.reviews[0]);
      }
    } catch (err: any) {
      console.error('Failed to generate review drafts:', err);
      setError(err.message || 'An unexpected error occurred while generating reviews.');
      
      // Dynamic natural keyword-blending fallback reviews
      const firstTag = tagsToUse[0] ? tagsToUse[0].toLowerCase() : (stars <= 2 ? 'service issues' : 'service');
      const secondTag = tagsToUse[1] ? tagsToUse[1].toLowerCase() : (stars <= 2 ? 'handling' : 'experience');
      const thirdTag = tagsToUse[2] ? tagsToUse[2].toLowerCase() : (stars <= 2 ? 'frustrating aspect' : 'overall quality');

      const fallbacks = stars <= 2 ? [
        `Extremely disappointed with my visit to ${businessName}. The ${firstTag} was highly unsatisfactory, and the ${secondTag} made the whole visit frustrating. I hope they fix this soon.`,
        `Disappointed with ${businessName}. We experienced major issues with the ${firstTag} and ${secondTag}. The quality was definitely not up to the mark.`,
        `Had a subpar experience here. The ${thirdTag} really fell short of expectations, and the overall quality was lacking.`
      ] : [
        `I had a great experience at ${businessName}. The ${firstTag} was outstanding, and the ${secondTag} was perfect. Everything was handled professionally and the quality was top-notch!`,
        `Really happy with my visit to ${businessName}. The ${firstTag} and ${secondTag} made our day. Service was quick and efficient. Will definitely be returning!`,
        `A solid 5-star experience. The ${thirdTag} really stood out and the team went above and beyond to make us comfortable.`
      ];
      setDrafts(fallbacks);
      setSelectedDraftIndex(0);
      setDraft(fallbacks[0]);
    } finally {
      setLoading(false);
    }
  };

  // Generate automatically on mount if tags are available
  useEffect(() => {
    if (selectedTags && selectedTags.length > 0) {
      generateReviews(selectedTags);
    } else {
      // If user skipped selecting tags, show offline default drafts
      const offlineDrafts = stars <= 2 ? [
        `Subpar experience at ${businessName}. The customer service was highly disappointing and the wait times were far too long.`,
        `Not satisfied with our visit. The quality fell short and several items were handled poorly. Would not recommend.`,
        `Unfortunately, this visit did not meet expectations. The staff seemed unorganized and the overall experience was frustrating.`
      ] : [
        `I had a great experience at ${businessName}. Everything was handled perfectly and the quality was top notch. Highly recommend!`,
        `Very pleased with the service and quality. Clean space, friendly staff, and smooth experience all around.`,
        `Excellent visit. Staff went above and beyond, and the overall experience was fantastic. Will return.`
      ];
      setDrafts(offlineDrafts);
      setSelectedDraftIndex(0);
      setDraft(offlineDrafts[0]);
    }
  }, []);

  const handleRegenerate = () => {
    const tags = customKeywords
      .split(',')
      .map((k) => k.trim())
      .filter((k) => k.length > 0);
    generateReviews(tags);
  };

  const copyToClipboard = (text: string) => {
    try {
      if (navigator.clipboard && typeof window !== 'undefined' && window.isSecureContext) {
        navigator.clipboard.writeText(text);
      } else {
        const textArea = document.createElement("textarea");
        textArea.value = text;
        textArea.style.position = "fixed";
        textArea.style.top = "0";
        textArea.style.left = "0";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      }
    } catch (err) {
      console.error("Fallback copy failed:", err);
    }
  };

  const handleCopyCardText = (text: string, idx: number) => {
    copyToClipboard(text);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleCopyFinalText = () => {
    copyToClipboard(draft);
    setCopiedFinal(true);
    setTimeout(() => setCopiedFinal(false), 2000);
  };

  const handleSelectDraft = (index: number) => {
    setSelectedDraftIndex(index);
    setDraft(drafts[index]);
  };

  const handlePostReview = () => {
    let googleReviewUrl = `https://search.google.com/local/writereview?placeid=${googlePlaceId}`;
    if (googlePlaceId.startsWith('http://') || googlePlaceId.startsWith('https://')) {
      googleReviewUrl = googlePlaceId;
    }
    window.open(googleReviewUrl, '_blank');
    onComplete();
  };

  return (
    <div className="flex flex-col justify-between min-h-[500px] px-6 animate-pop-in">
      <div className="text-center mb-4">
        <span className="text-[10px] uppercase font-bold tracking-widest text-theme-primary bg-theme-primary/10 px-2.5 py-1 rounded border border-theme-primary/20 inline-flex items-center gap-1.5">
          <Sparkles size={11} className={loading ? 'animate-spin' : ''} />
          Gemini AI Review Assistant
        </span>
        <h2 className="text-xl font-bold tracking-tight mt-3">
          {loading ? 'Generating draft reviews...' : 'Choose a review draft below'}
        </h2>
        <p className="text-[11px] text-theme-text/50 mt-1.5 leading-relaxed">
          {loading
            ? 'Gemini 2.0 Flash is writing three distinct drafts based on your feedback.'
            : 'Select one of the three generated drafts, make any edits at the bottom, and proceed to Google.'}
        </p>
      </div>

      <div className="flex flex-col gap-4 my-2 max-h-[380px] overflow-y-auto pr-1">
        {loading ? (
          /* Premium Shimmer Loaders for 3 Cards */
          <div className="flex flex-col gap-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="w-full h-24 rounded-xl bg-theme-accent/20 border border-theme-border/50 p-4 flex flex-col gap-2 justify-center animate-pulse">
                <div className="h-3 bg-theme-text/10 rounded w-11/12" />
                <div className="h-3 bg-theme-text/10 rounded w-9/12" />
                <div className="h-2 bg-theme-text/10 rounded w-5/12 mt-1" />
              </div>
            ))}
          </div>
        ) : (
          <>
            {/* Displaying 3 Drafts stacked vertically */}
            <div className="flex flex-col gap-3">
              {drafts.map((d, index) => {
                const isSelected = selectedDraftIndex === index;
                const charCount = d.length;
                return (
                  <div
                    key={index}
                    onClick={() => handleSelectDraft(index)}
                    className={`p-4 rounded-xl border transition-all duration-300 flex flex-col gap-2.5 cursor-pointer relative ${
                      isSelected
                        ? 'bg-theme-primary/10 border-theme-primary shadow-premium'
                        : 'bg-theme-accent/20 border-theme-border/60 hover:bg-theme-accent/35'
                    }`}
                  >
                    <div className="flex justify-between items-center text-[9px] opacity-60">
                      <span className={`font-extrabold uppercase px-2 py-0.5 rounded ${
                        isSelected ? 'bg-theme-primary text-white' : 'bg-theme-accent text-theme-text'
                      }`}>
                        Draft {index + 1}
                      </span>
                      <span className="font-semibold text-theme-text">{charCount} chars</span>
                    </div>

                    <p className="text-[11px] leading-relaxed text-theme-text opacity-90 italic">
                      "{d}"
                    </p>

                    <div className="flex justify-end gap-2 mt-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCopyCardText(d, index);
                        }}
                        className="py-1 px-2.5 rounded bg-theme-card border border-theme-border/70 text-theme-text/80 hover:text-theme-text active-scale transition-all flex items-center gap-1 text-[9px] font-bold"
                        title="Copy this draft text"
                      >
                        {copiedIndex === index ? <Check size={10} className="text-green-500" /> : <Copy size={10} />}
                        <span>Copy</span>
                      </button>
                      
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelectDraft(index);
                        }}
                        className={`py-1 px-2.5 rounded text-[9px] font-extrabold uppercase tracking-wider transition-all active-scale ${
                          isSelected
                            ? 'bg-theme-primary text-white shadow-premium'
                            : 'bg-theme-accent border border-theme-border text-theme-text hover:bg-theme-accent/80'
                        }`}
                      >
                        {isSelected ? 'Selected' : 'Use This Review'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Actions for Regeneration */}
            <div className="flex flex-col gap-2.5 mt-2 bg-theme-accent/10 border border-theme-border/40 rounded-xl p-3">
              <div className="flex justify-between items-center">
                <label className="block text-[9px] font-bold text-theme-text/60 uppercase">
                  Customize Keywords
                </label>
                <button
                  onClick={handleRegenerate}
                  disabled={loading}
                  className="text-[9px] font-extrabold text-theme-primary hover:opacity-80 flex items-center gap-1 uppercase tracking-wider"
                >
                  <RefreshCw size={9} />
                  Generate 3 New Drafts
                </button>
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g. friendly staff, fast service, delicious food"
                  value={customKeywords}
                  onChange={(e) => setCustomKeywords(e.target.value)}
                  className="flex-grow p-2 rounded-lg bg-theme-card border border-theme-border/60 text-xs focus:outline-none focus:border-theme-primary text-theme-text"
                />
                <button
                  onClick={handleRegenerate}
                  disabled={loading || !customKeywords.trim()}
                  className="px-3 py-2 rounded-lg bg-theme-primary text-white hover:opacity-90 transition-all flex items-center justify-center gap-1 active-scale disabled:opacity-50 text-[10px] font-bold uppercase tracking-wider"
                >
                  Regen
                </button>
              </div>
            </div>
          </>
        )}

        {/* Finalized Review Textbox at the bottom */}
        {!loading && drafts.length > 0 && (
          <div className="flex flex-col gap-2 border-t border-theme-border/50 pt-4 mt-2 animate-fade-in">
            <label className="block text-[10px] font-bold text-theme-text/60 uppercase">
              Finalized Review Copy (You can edit this)
            </label>
            <div className="relative">
              <textarea
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                rows={4}
                disabled={loading}
                className="w-full p-4 rounded-xl bg-theme-accent/30 border border-theme-border text-xs text-theme-text leading-relaxed focus:outline-none focus:border-theme-primary pr-12 font-medium"
                placeholder="Select a draft review card from above, then customize it here..."
              />
              <button
                onClick={handleCopyFinalText}
                disabled={!draft}
                className="absolute right-3.5 top-3.5 p-2 rounded-lg bg-theme-card/85 border border-theme-border/60 text-theme-text/70 hover:text-theme-text hover:bg-theme-card active-scale transition-all"
                aria-label="Copy final review"
              >
                {copiedFinal ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-2.5 mt-4">
        {stars <= 2 ? (
          <>
            <button
              onClick={onGoToPrivateFeedback}
              className="w-full py-4 rounded-xl font-bold bg-theme-primary text-white hover:opacity-92 shadow-premium flex items-center justify-center gap-2 transform active:scale-98 transition-all text-xs tracking-wider uppercase"
            >
              Submit Privately to Owner
            </button>
            <button
              onClick={handlePostReview}
              disabled={loading || !draft}
              className="w-full py-2.5 rounded-xl font-bold border border-red-500/40 text-red-400 hover:bg-red-500/5 flex items-center justify-center gap-2 transition-all text-xs tracking-wider uppercase disabled:opacity-50"
            >
              <ExternalLink size={12} />
              Forcefully Post on Google
            </button>
          </>
        ) : (
          <button
            onClick={handlePostReview}
            disabled={loading || !draft}
            className="w-full py-4 rounded-xl font-bold bg-theme-primary text-white hover:opacity-92 shadow-premium flex items-center justify-center gap-2 transform active:scale-98 transition-all text-xs tracking-wider uppercase disabled:opacity-50"
          >
            <ExternalLink size={14} />
            Go to Google Reviews
          </button>
        )}
        <span className="text-[9px] text-center text-theme-text/40 leading-relaxed block max-w-xs mx-auto">
          Compliance Notice: Google rules require reviews to be posted by the customer directly. This tool generates drafts for your convenience.
        </span>
      </div>
    </div>
  );
}
