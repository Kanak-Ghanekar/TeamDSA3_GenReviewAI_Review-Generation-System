'use client';

import React, { useState, useEffect } from 'react';
import { Save, Download, ExternalLink, AlertTriangle } from 'lucide-react';

interface SettingsFormProps {
  businessId: string;
  initialThreshold: number;
  initialChannels: { dashboard: boolean; whatsapp: boolean; email: boolean };
  initialAllowNegative: boolean;
  onSave: (threshold: number, channels: { dashboard: boolean; whatsapp: boolean; email: boolean }, allowNegative: boolean) => void;
}

export default function SettingsForm({
  businessId,
  initialThreshold,
  initialChannels,
  initialAllowNegative = false,
  onSave,
}: SettingsFormProps) {
  const [threshold, setThreshold] = useState(initialThreshold);
  const [channels, setChannels] = useState(initialChannels);
  const [allowNegative, setAllowNegative] = useState(initialAllowNegative);
  const [saved, setSaved] = useState(false);
  const [hostUrl, setHostUrl] = useState('http://localhost:3000');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setHostUrl(window.location.origin);
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(threshold, channels, allowNegative);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleChannelToggle = (key: keyof typeof channels) => {
    setChannels((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleDownloadQR = () => {
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(`${hostUrl}/r/${businessId}`)}`;
    window.open(qrCodeUrl, '_blank');
  };

  const qrUrl = `/r/${businessId}`;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-slide-up">
      {/* Settings Options */}
      <form onSubmit={handleSubmit} className="lg:col-span-2 bg-theme-card border border-theme-border p-6 rounded-3xl shadow-premium flex flex-col justify-between min-h-[420px]">
        <div className="flex flex-col gap-6">
          <h3 className="text-lg font-bold text-theme-text mb-2">Location Configurations</h3>

          {/* Rating Slider */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-sm font-semibold text-theme-text/80">
                Negative Feedback Routing Threshold
              </label>
              <span className="text-sm font-extrabold text-theme-primary bg-theme-primary/10 px-2.5 py-0.5 rounded">
                {threshold.toFixed(1)} Stars
              </span>
            </div>
            <input
              type="range"
              min="3.0"
              max="4.5"
              step="0.5"
              value={threshold}
              onChange={(e) => setThreshold(parseFloat(e.target.value))}
              disabled={allowNegative}
              className="w-full h-2 bg-theme-accent rounded-lg appearance-none cursor-pointer accent-theme-primary disabled:opacity-30"
            />
            <span className="text-[10px] text-theme-text/50 block mt-2">
              Ratings below this score will route to private feedback. Ratings at/above will advance to Google drafts.
            </span>
          </div>

          {/* Compliance Option: Allow Negative Reviews to bypass private routing */}
          <div className="p-4 bg-red-500/5 border border-red-500/20 rounded-2xl flex flex-col gap-3">
            <label className="flex items-start gap-3 cursor-pointer select-none text-theme-text/80 text-sm font-semibold">
              <input
                type="checkbox"
                checked={allowNegative}
                onChange={(e) => setAllowNegative(e.target.checked)}
                className="w-4.5 h-4.5 mt-0.5 rounded border-theme-border bg-theme-accent text-red-500 focus:ring-red-500"
              />
              <div className="flex-1">
                <span>Allow Negative Reviews to post on Google Reviews</span>
                <span className="text-[10px] text-theme-text/50 block mt-1 leading-relaxed">
                  Compliance Override: Bypass private routing. If checked, detractors are NOT guided to private surveys and can post low-rating reviews directly on Google.
                </span>
              </div>
            </label>
          </div>

          {/* Alert Toggles */}
          <div>
            <label className="text-sm font-semibold text-theme-text/80 block mb-3">
              Alert Notifications Channels
            </label>
            <div className="flex flex-col gap-3">
              {(['dashboard', 'whatsapp', 'email'] as const).map((channel) => (
                <label key={channel} className="flex items-center gap-3 cursor-pointer select-none text-theme-text/80 text-sm">
                  <input
                    type="checkbox"
                    checked={channels[channel]}
                    onChange={() => handleChannelToggle(channel)}
                    className="w-4 h-4 rounded border-theme-border bg-theme-accent text-theme-primary focus:ring-theme-primary"
                  />
                  <span className="capitalize">{channel} alerts</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        <button
          type="submit"
          className="mt-8 py-3 px-6 rounded-xl font-bold bg-theme-primary text-white hover:opacity-90 flex items-center justify-center gap-2 transform active:scale-95 shadow-premium self-end text-xs uppercase tracking-wider"
        >
          <Save size={14} />
          {saved ? 'Settings Saved!' : 'Save Changes'}
        </button>
      </form>

      {/* QR Asset Manager */}
      <div className="bg-theme-card border border-theme-border p-6 rounded-3xl shadow-premium flex flex-col justify-between items-center text-center">
        <div className="flex flex-col items-center">
          <h3 className="text-lg font-bold text-theme-text mb-2">Review QR Code</h3>
          <p className="text-xs text-theme-text/50 mb-6">
            Place this QR on table tents, menus, or receipts to capture reviews.
          </p>

          <div className="p-4 bg-white rounded-xl mb-6 shadow-md border border-slate-200 flex items-center justify-center">
            <img 
              src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(`${hostUrl}/r/${businessId}`)}`} 
              alt="Scannable Review QR Code" 
              className="w-36 h-36"
            />
          </div>
        </div>

        <div className="w-full flex flex-col gap-2">
          <button
            onClick={handleDownloadQR}
            className="w-full py-3 rounded-xl font-bold border border-theme-border text-theme-text hover:bg-theme-accent/50 flex items-center justify-center gap-2 transition-all text-xs"
          >
            Download Print Assets
          </button>
          <a
            href={qrUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-3 rounded-xl font-bold bg-theme-primary text-white flex items-center justify-center gap-2 transition-all text-xs active-scale"
          >
            <ExternalLink size={14} />
            Test Live Flow
          </a>
        </div>
      </div>
    </div>
  );
}
