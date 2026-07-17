'use client';

import React from 'react';
import { Utensils, Wrench, Sparkles, Hotel, HelpCircle } from 'lucide-react';

interface SplashProps {
  businessName: string;
  icon: string;
  onNext: () => void;
}

export default function Splash({ businessName, icon, onNext }: SplashProps) {
  const renderIcon = () => {
    const iconClass = "text-theme-primary";
    switch (icon) {
      case 'Utensils': return <Utensils size={32} className={iconClass} />;
      case 'Wrench': return <Wrench size={32} className={iconClass} />;
      case 'Sparkles': return <Sparkles size={32} className={iconClass} />;
      case 'Hotel': return <Hotel size={32} className={iconClass} />;
      default: return <HelpCircle size={32} className={iconClass} />;
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[420px] px-6 text-center animate-pop-in">
      <div className="w-16 h-16 rounded-2xl bg-theme-accent/50 border border-theme-border flex items-center justify-center mb-8">
        {renderIcon()}
      </div>
      
      <span className="text-[10px] uppercase font-bold tracking-widest opacity-60 mb-2">Welcome</span>
      <h1 className="text-2xl font-extrabold text-theme-text tracking-tight mb-3">
        {businessName}
      </h1>
      
      <p className="text-xs text-theme-text/60 leading-relaxed mb-8 max-w-xs">
        We would love to know how your visit went today. Your feedback helps our local crew improve.
      </p>

      <button
        onClick={onNext}
        className="w-full py-3.5 px-6 rounded-xl font-bold bg-theme-primary text-white hover:opacity-92 shadow-premium transform active:scale-98 transition-all text-xs tracking-wider uppercase"
        id="btn-get-started"
      >
        Leave Feedback
      </button>
    </div>
  );
}
