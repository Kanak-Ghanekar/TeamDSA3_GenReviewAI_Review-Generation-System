'use client';

import React from 'react';
import { Eye, CheckCircle2, TrendingUp } from 'lucide-react';

interface MetricsSummaryProps {
  scans: number;
  ratingsCount: number;
  completions: number;
  averageRating: number;
  distribution: { stars: number; count: number }[];
}

export default function MetricsSummary({
  scans,
  ratingsCount,
  completions,
  averageRating,
}: MetricsSummaryProps) {
  const completionRate = scans > 0 ? (completions / scans) * 100 : 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {/* Total Scans Card */}
      <div className="premium-card p-5 rounded-2xl flex flex-col justify-between min-h-[120px]">
        <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-wider opacity-60">
          <span>QR Scans</span>
          <Eye size={16} />
        </div>
        <div className="mt-3">
          <span className="text-3xl font-extrabold">{scans}</span>
          <span className="text-[10px] text-theme-text/50 block mt-0.5 font-medium">Total customer scans</span>
        </div>
      </div>

      {/* Ratings Clicked */}
      <div className="premium-card p-5 rounded-2xl flex flex-col justify-between min-h-[120px]">
        <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-wider opacity-60">
          <span>Ratings Left</span>
          <TrendingUp size={16} />
        </div>
        <div className="mt-3">
          <span className="text-3xl font-extrabold">{ratingsCount}</span>
          <span className="text-[10px] text-theme-text/50 block mt-0.5 font-medium">Stars tapped</span>
        </div>
      </div>

      {/* Conversions count */}
      <div className="premium-card p-5 rounded-2xl flex flex-col justify-between min-h-[120px]">
        <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-wider opacity-60">
          <span>Google Posts</span>
          <CheckCircle2 size={16} className="text-green-500" />
        </div>
        <div className="mt-3">
          <span className="text-3xl font-extrabold">{completions}</span>
          <span className="text-[10px] text-green-500 block mt-0.5 font-bold">{completionRate.toFixed(0)}% conversion rate</span>
        </div>
      </div>

      {/* Average rating summary (High Contrast Color Shift) */}
      <div className="premium-card p-5 rounded-2xl flex flex-col justify-between min-h-[120px]">
        <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-wider opacity-60">
          <span>Average Rating</span>
          <span className="text-yellow-600 dark:text-yellow-400 font-extrabold">★</span>
        </div>
        <div className="mt-3">
          <span className="text-3xl font-extrabold text-yellow-600 dark:text-yellow-400">{averageRating.toFixed(1)}</span>
          <span className="text-[10px] text-theme-text/50 block mt-0.5 font-medium">Weighted customer score</span>
        </div>
      </div>
    </div>
  );
}
