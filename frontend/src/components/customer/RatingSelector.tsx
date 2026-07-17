'use client';

import React, { useState } from 'react';
import { Star } from 'lucide-react';

interface RatingSelectorProps {
  businessName: string;
  onRatingSelected: (stars: number) => void;
}

export default function RatingSelector({
  businessName,
  onRatingSelected,
}: RatingSelectorProps) {
  const [hoveredStar, setHoveredStar] = useState<number | null>(null);

  return (
    <div className="flex flex-col items-center justify-center min-h-[420px] px-6 text-center animate-pop-in">
      <span className="text-[10px] uppercase font-bold tracking-widest opacity-60 mb-2">Rate Your Visit</span>
      <h2 className="text-xl font-bold tracking-tight mb-8">
        How would you rate your experience at {businessName}?
      </h2>

      {/* 5-Star Row */}
      <div className="flex items-center gap-2.5 mb-10">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            onMouseEnter={() => setHoveredStar(star)}
            onMouseLeave={() => setHoveredStar(null)}
            onClick={() => onRatingSelected(star)}
            className="p-1 transition-transform transform hover:scale-125 duration-150 active-scale"
            aria-label={`Select ${star} stars`}
          >
            <Star
              size={star <= (hoveredStar ?? 0) ? 36 : 34}
              className={`transition-colors duration-150 ${
                star <= (hoveredStar ?? 0)
                  ? 'text-yellow-400 fill-yellow-400'
                  : 'text-theme-border hover:text-yellow-400'
              }`}
            />
          </button>
        ))}
      </div>

      <p className="text-[11px] text-theme-text/50 leading-relaxed max-w-xs">
        Tap a star to continue. High rating options will guide you to our quick Google review tool.
      </p>
    </div>
  );
}
