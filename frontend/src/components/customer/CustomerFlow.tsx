'use client';

import React, { useReducer, useEffect } from 'react';
import Splash from './Splash';
import RatingSelector from './RatingSelector';
import TagSelector from './TagSelector';
import PrivateFeedbackForm from './PrivateFeedbackForm';
import AIDrafts from './AIDrafts';
import FeedbackConfirm from './FeedbackConfirm';
import { TEMPLATES } from './templates';
import ThemeSwitcher from '../ThemeSwitcher';
import { Utensils, Wrench, Sparkles, Hotel, HelpCircle } from 'lucide-react';

export type FlowStep =
  | 'SPLASH'
  | 'RATING'
  | 'TAGS'
  | 'AI_DRAFTS'
  | 'PRIVATE_FEEDBACK'
  | 'FEEDBACK_CONFIRM'
  | 'COMPLETION';

interface FlowState {
  step: FlowStep;
  stars: number | null;
  selectedTags: string[];
  feedbackText: string;
  contactInfo: string;
}

type FlowAction =
  | { type: 'START' }
  | { type: 'SELECT_RATING'; stars: number }
  | { type: 'SUBMIT_TAGS'; tags: string[] }
  | { type: 'SKIP_TAGS' }
  | { type: 'GO_TO_PRIVATE_FEEDBACK' }
  | { type: 'SUBMIT_PRIVATE_FEEDBACK'; text: string; contact: string }
  | { type: 'POST_ANYWAY' }
  | { type: 'COMPLETE_DRAFT' }
  | { type: 'RESET' };

const initialState: FlowState = {
  step: 'SPLASH',
  stars: null,
  selectedTags: [],
  feedbackText: '',
  contactInfo: '',
};

function flowReducer(state: FlowState, action: FlowAction): FlowState {
  switch (action.type) {
    case 'START':
      return { ...state, step: 'RATING' };
    case 'SELECT_RATING': {
      return {
        ...state,
        stars: action.stars,
        step: 'TAGS',
      };
    }
    case 'SUBMIT_TAGS':
      return { ...state, selectedTags: action.tags, step: 'AI_DRAFTS' };
    case 'SKIP_TAGS':
      return { ...state, selectedTags: [], step: 'AI_DRAFTS' };
    case 'GO_TO_PRIVATE_FEEDBACK':
      return { ...state, step: 'PRIVATE_FEEDBACK' };
    case 'SUBMIT_PRIVATE_FEEDBACK':
      return {
        ...state,
        feedbackText: action.text,
        contactInfo: action.contact,
        step: 'FEEDBACK_CONFIRM',
      };
    case 'POST_ANYWAY':
      return { ...state, step: 'AI_DRAFTS' };
    case 'COMPLETE_DRAFT':
      return { ...state, step: 'COMPLETION' };
    case 'RESET':
      return initialState;
    default:
      return state;
  }
}

interface CustomerFlowProps {
  businessId: string;
  businessName: string;
  category: string;
  googlePlaceId: string;
  ratingThreshold?: number;
}

export default function CustomerFlow({
  businessId,
  businessName,
  category,
  googlePlaceId,
}: CustomerFlowProps) {
  const [state, dispatch] = useReducer(flowReducer, initialState);
  const template = TEMPLATES[category] || TEMPLATES.restaurant;

  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('data-theme', category);
    return () => {
      root.removeAttribute('data-theme');
    };
  }, [category]);

  const handleRatingSelected = (stars: number) => {
    dispatch({ type: 'SELECT_RATING', stars });
  };

  const handleTagsSubmit = async (tags: string[]) => {
    // For positive stars, save rating immediately upon tag generation
    if (state.stars && state.stars >= 3) {
      try {
        await fetch('/api/review/submit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            businessId,
            stars: state.stars,
            selectedTags: tags
          })
        });
      } catch (err) {
        console.error('Failed to log rating details:', err);
      }
    }
    dispatch({ type: 'SUBMIT_TAGS', tags });
  };

  const handleTagsSkip = async () => {
    if (state.stars && state.stars >= 3) {
      try {
        await fetch('/api/review/submit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            businessId,
            stars: state.stars,
            selectedTags: []
          })
        });
      } catch (err) {
        console.error('Failed to log skipped rating:', err);
      }
    }
    dispatch({ type: 'SKIP_TAGS' });
  };

  const handlePrivateFeedbackSubmit = async (text: string, contact: string) => {
    try {
      // Log the detractor rating
      const ratingRes = await fetch('/api/review/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessId,
          stars: state.stars || 1,
          selectedTags: state.selectedTags
        })
      });
      const ratingData = await ratingRes.json();
      
      if (ratingData.success && ratingData.ratingId) {
        // Submit the private feedback ticket linked to this rating
        await fetch('/api/feedback/submit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ratingId: ratingData.ratingId,
            feedbackText: text,
            contactInfo: contact
          })
        });
      }
    } catch (err) {
      console.error('Failed to save offline feedback ticket:', err);
    }
    dispatch({ type: 'SUBMIT_PRIVATE_FEEDBACK', text, contact });
  };

  const handlePostAnyway = async () => {
    try {
      await fetch('/api/review/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessId,
          stars: state.stars || 1,
          selectedTags: state.selectedTags
        })
      });
    } catch (err) {
      console.error('Failed to log post anyway rating override:', err);
    }
    dispatch({ type: 'POST_ANYWAY' });
  };

  const renderHeaderIcon = () => {
    const iconClass = "text-theme-primary";
    switch (template.icon) {
      case 'Utensils': return <Utensils size={18} className={iconClass} />;
      case 'Wrench': return <Wrench size={18} className={iconClass} />;
      case 'Sparkles': return <Sparkles size={18} className={iconClass} />;
      case 'Hotel': return <Hotel size={18} className={iconClass} />;
      default: return <HelpCircle size={18} className={iconClass} />;
    }
  };

  return (
    <div className="min-h-screen bg-theme-bg text-theme-text font-sans flex items-center justify-center p-4 transition-colors duration-300">
      <div className="w-full max-w-md premium-card rounded-3xl overflow-hidden min-h-[500px] flex flex-col justify-between transition-all duration-300">
        <header className="p-4 border-b border-theme-border flex items-center justify-between bg-theme-accent/20">
          <div className="flex items-center gap-2">
            {renderHeaderIcon()}
            <span className="font-bold text-sm text-theme-text/80">{businessName}</span>
          </div>
          <div className="flex items-center gap-2">
            <ThemeSwitcher />
            <span className="text-[10px] px-2 py-1 rounded-full bg-theme-primary/10 text-theme-primary font-bold uppercase tracking-wider">
              V1.0
            </span>
          </div>
        </header>

        <main className="flex-grow flex flex-col justify-center py-6">
          {state.step === 'SPLASH' && (
            <Splash
              businessName={businessName}
              icon={template.icon}
              onNext={() => dispatch({ type: 'START' })}
            />
          )}

          {state.step === 'RATING' && (
            <RatingSelector
              businessName={businessName}
              onRatingSelected={handleRatingSelected}
            />
          )}

          {state.step === 'TAGS' && (
            <TagSelector
              aspectGroups={state.stars && state.stars >= 3 ? template.positiveAspectGroups : template.negativeAspectGroups}
              onSubmit={handleTagsSubmit}
              onSkip={handleTagsSkip}
              stars={state.stars || 5}
            />
          )}

          {state.step === 'PRIVATE_FEEDBACK' && (
            <PrivateFeedbackForm
              stars={state.stars || 1}
              onSubmit={handlePrivateFeedbackSubmit}
              onPostAnyway={handlePostAnyway}
            />
          )}

          {state.step === 'AI_DRAFTS' && (
            <AIDrafts
              stars={state.stars || 5}
              selectedTags={state.selectedTags}
              toneDescriptor={template.toneDescriptor}
              businessName={businessName}
              googlePlaceId={googlePlaceId}
              onComplete={() => dispatch({ type: 'COMPLETE_DRAFT' })}
              onGoToPrivateFeedback={() => dispatch({ type: 'GO_TO_PRIVATE_FEEDBACK' })}
            />
          )}

          {state.step === 'FEEDBACK_CONFIRM' && (
            <FeedbackConfirm
              onPostAnyway={handlePostAnyway}
              onReset={() => dispatch({ type: 'RESET' })}
            />
          )}

          {state.step === 'COMPLETION' && (
            <div className="flex flex-col items-center justify-center p-6 text-center animate-pop-in">
              <div className="text-4xl mb-4">✨</div>
              <h3 className="text-2xl font-bold mb-2">Thank you!</h3>
              <p className="text-sm opacity-70 mb-6">
                Your review has been successfully processed. We appreciate your support!
              </p>
              <button
                onClick={() => dispatch({ type: 'RESET' })}
                className="py-3 px-6 bg-theme-primary text-white rounded-xl font-bold shadow hover:opacity-90 transform active:scale-95 transition-all text-sm"
              >
                Back to Start
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
