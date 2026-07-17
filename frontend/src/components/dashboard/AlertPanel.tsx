'use client';

import React from 'react';
import { Mail, Clock, CheckCircle } from 'lucide-react';

export interface AlertItem {
  id: string;
  stars: number;
  feedbackText: string;
  contactInfo?: string;
  status: string;
  sentiment?: string;
  createdAt: string;
}

interface AlertPanelProps {
  alerts: AlertItem[];
  onStatusChange: (id: string, newStatus: 'new' | 'in_progress' | 'resolved') => void;
}

export default function AlertPanel({ alerts, onStatusChange }: AlertPanelProps) {
  return (
    <div className="premium-card p-6 rounded-2xl flex flex-col gap-6">
      <div className="flex justify-between items-center pb-4 border-b border-theme-border/50">
        <h3 className="text-sm font-bold uppercase tracking-wider opacity-60">
          Negative Feedback Alert Tracker
        </h3>
        <span className="text-[10px] bg-red-500/10 text-red-500 px-2 py-0.5 rounded-full font-bold border border-red-500/20">
          {alerts.filter((a) => a.status !== 'resolved').length} Unresolved
        </span>
      </div>

      <div className="flex flex-col gap-4">
        {alerts.length === 0 ? (
          <div className="text-center py-8 text-theme-text/40 text-xs">
            No complaints logged. You have clean sheets!
          </div>
        ) : (
          alerts.map((alert) => (
            <div
              key={alert.id}
              className="p-4 bg-theme-accent/20 border border-theme-border rounded-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 transition-all"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-bold text-red-500 bg-red-500/10 px-2 py-0.5 rounded">
                    {alert.stars} Stars
                  </span>
                  <span className="text-[10px] opacity-40 flex items-center gap-1">
                    <Clock size={10} />
                    {alert.createdAt}
                  </span>
                </div>
                <p className="text-xs opacity-90 leading-relaxed italic mb-1.5">
                  "{alert.feedbackText}"
                </p>
                {alert.contactInfo && (
                  <span className="text-[10px] text-theme-text/60 font-semibold block">
                    Contact Details: {alert.contactInfo}
                  </span>
                )}
              </div>

              {/* Status Actions */}
              <div className="flex gap-2">
                {alert.status === 'new' && (
                  <button
                    onClick={() => onStatusChange(alert.id, 'in_progress')}
                    className="py-1.5 px-3 rounded-lg bg-theme-primary/10 border border-theme-primary/20 text-theme-primary text-[10px] font-bold uppercase tracking-wider hover:bg-theme-primary hover:text-white transition-all"
                  >
                    Mark In-Progress
                  </button>
                )}
                {alert.status !== 'resolved' ? (
                  <button
                    onClick={() => onStatusChange(alert.id, 'resolved')}
                    className="py-1.5 px-3 rounded-lg bg-green-500/10 border border-green-500/20 text-green-500 text-[10px] font-bold uppercase tracking-wider hover:bg-green-500 hover:text-white transition-all flex items-center gap-1"
                  >
                    <CheckCircle size={10} />
                    Resolve Ticket
                  </button>
                ) : (
                  <span className="text-[10px] opacity-40 uppercase font-bold flex items-center gap-1 px-3 py-1.5">
                    ✓ Resolved
                  </span>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
