'use client';

import React, { useState, useEffect } from 'react';
import DashboardShell, { OwnerTab } from '@/components/dashboard/DashboardShell';
import MetricsSummary from '@/components/dashboard/MetricsSummary';
import AlertPanel, { AlertItem } from '@/components/dashboard/AlertPanel';
import SettingsForm from '@/components/dashboard/SettingsForm';
import { ShieldCheck, Mail, Send, Calendar, CheckCircle2, TrendingUp, HelpCircle, BellRing, History, Layers, Sparkles } from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  const [isOwnerLoggedIn, setIsOwnerLoggedIn] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [activeTab, setActiveTab] = useState<OwnerTab>('overview');

  // --- Real-time Alerts / Notifications State ---
  const [notification, setNotification] = useState<{ id: string; stars: number; text: string } | null>(null);

  const [ownerEmail, setOwnerEmail] = useState('');

  // Check storage on mount to bypass secondary login
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const session = localStorage.getItem('owner-session');
      const email = localStorage.getItem('owner-email') || '';
      setOwnerEmail(email);
      if (session === 'true') {
        setIsOwnerLoggedIn(true);
      }
    }
  }, []);

  const [businesses, setBusinesses] = useState<any[]>([]);
  const [activeBusinessId, setActiveBusinessId] = useState('test-restaurant');
  const [alerts, setAlerts] = useState<AlertItem[]>([]);

  // Fetch businesses list when logged in
  useEffect(() => {
    if (isOwnerLoggedIn && ownerEmail) {
      fetch(`/api/businesses?email=${encodeURIComponent(ownerEmail)}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.success && data.businesses.length > 0) {
            setBusinesses(data.businesses);
            // Default to the first business ID in the database
            setActiveBusinessId(data.businesses[0].id);
          }
        })
        .catch((err) => console.error('Failed to load businesses from DB:', err));
    }
  }, [isOwnerLoggedIn, ownerEmail]);

  // Fetch private feedback / alerts from database based on active business
  useEffect(() => {
    if (activeBusinessId && activeBusinessId !== 'test-restaurant') {
      fetch(`/api/feedback?businessId=${activeBusinessId}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            setAlerts(data.feedbacks);
          }
        })
        .catch((err) => console.error('Failed to fetch private feedback:', err));
    }
  }, [activeBusinessId]);

  // Track active location in localStorage
  useEffect(() => {
    if (activeBusinessId) {
      localStorage.setItem('active-business-id', activeBusinessId);
    }
  }, [activeBusinessId]);

  const [mlData, setMlData] = useState<any>(null);
  const activeBusinessName = businesses.find(b => b.id === activeBusinessId)?.name || '';

  // Fetch real ML CSV outputs dynamically based on active location name
  useEffect(() => {
    if (activeBusinessName) {
      fetch(`/api/analytics?restaurantName=${encodeURIComponent(activeBusinessName)}`)
        .then(res => res.json())
        .then(data => {
          if (data.success && data.data) {
            setMlData(data.data);
          } else {
            setMlData(null);
          }
        })
        .catch(err => {
          console.error("Failed to load ML analytics:", err);
          setMlData(null);
        });
    } else {
      setMlData(null);
    }
  }, [activeBusinessName]);

  // Modal and form states for adding a location
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newLocName, setNewLocName] = useState('');
  const [newLocCategory, setNewLocCategory] = useState('restaurant');
  const [newLocPlaceId, setNewLocPlaceId] = useState('');

  const handleAddLocation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLocName.trim() || !ownerEmail) return;

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Business Owner',
          email: ownerEmail,
          businessName: newLocName.trim(),
          category: newLocCategory,
          googlePlaceId: newLocPlaceId.trim()
        })
      });

      const data = await res.json();
      if (data.success) {
        // Refresh businesses list
        const fetchRes = await fetch(`/api/businesses?email=${encodeURIComponent(ownerEmail)}`);
        const fetchVal = await fetchRes.json();
        if (fetchVal.success) {
          setBusinesses(fetchVal.businesses);
        }
        setIsAddModalOpen(false);
        setNewLocName('');
        setNewLocPlaceId('');
        setActiveBusinessId(data.businessId);
      }
    } catch (error) {
      console.error('Failed to add location:', error);
    }
  };

  // Configurations mapping (stores if negative reviews are allowed per business location)
  const [businessConfigs, setBusinessConfigs] = useState<Record<string, { threshold: number; channels: any; allowNegative: boolean }>>({
    'test-restaurant': { threshold: 4.0, channels: { dashboard: true, whatsapp: true, email: false }, allowNegative: false },
  });



  const handleOwnerLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), role: 'owner' })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        localStorage.setItem('owner-session', 'true');
        localStorage.setItem('owner-email', data.email);
        localStorage.setItem('active-business-id', data.businessId);
        setOwnerEmail(data.email);
        setIsOwnerLoggedIn(true);
        setErrorMsg('');
      } else {
        setErrorMsg(data.error || 'Invalid Owner credentials.');
      }
    } catch (err) {
      console.error(err);
      setErrorMsg('Login network error.');
    }
  };

  const handleStatusChange = async (id: string, newStatus: 'new' | 'in_progress' | 'resolved') => {
    try {
      const res = await fetch('/api/feedback', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ feedbackId: id, status: newStatus })
      });
      const data = await res.json();
      if (data.success) {
        setAlerts((prev) =>
          prev.map((alert) => (alert.id === id ? { ...alert, status: newStatus } : alert))
        );
      }
    } catch (error) {
      console.error('Failed to change status:', error);
    }
  };




  const handleSaveConfigs = (
    threshold: number,
    channels: { dashboard: boolean; whatsapp: boolean; email: boolean },
    allowNegative: boolean
  ) => {
    setBusinessConfigs((prev) => ({
      ...prev,
      [activeBusinessId]: { threshold, channels, allowNegative },
    }));

    if (typeof window !== 'undefined') {
      localStorage.setItem(`config-allow-negative-${activeBusinessId}`, String(allowNegative));
    }
  };

  const handleOwnerLogout = () => {
    localStorage.removeItem('owner-session');
    localStorage.removeItem('owner-email');
    setIsOwnerLoggedIn(false);
  };

  const defaultMetrics = {
    scans: 0,
    ratingsCount: 0,
    completions: 0,
    averageRating: 5.0,
    distribution: [
      { stars: 1, count: 0 },
      { stars: 2, count: 0 },
      { stars: 3, count: 0 },
      { stars: 4, count: 0 },
      { stars: 5, count: 0 },
    ],
  };

  // Resolve metrics from real business properties
  const activeBusiness = businesses.find(b => b.id === activeBusinessId);
  const metrics = activeBusiness ? {
    scans: activeBusiness.scans || 0,
    ratingsCount: activeBusiness.ratingsCount || 0,
    completions: activeBusiness.completions || 0,
    averageRating: activeBusiness.rating || 5.0,
    distribution: [
      { stars: 1, count: 0 },
      { stars: 2, count: 0 },
      { stars: 3, count: 0 },
      { stars: 4, count: 0 },
      { stars: 5, count: activeBusiness.ratingsCount || 0 },
    ],
  } : defaultMetrics;

  const activeConfig = businessConfigs[activeBusinessId] || { threshold: 4.0, channels: { dashboard: true, whatsapp: true, email: false }, allowNegative: false };

  if (!isOwnerLoggedIn) {
    return (
      <div className="min-h-screen bg-theme-bg text-theme-text flex items-center justify-center p-6 transition-colors duration-300">
        <div className="w-full max-w-sm premium-card rounded-2xl p-8 flex flex-col justify-between">
          <div className="text-center mb-6">
            <div className="w-12 h-12 rounded-xl bg-theme-accent border border-theme-border flex items-center justify-center text-theme-primary mx-auto mb-4">
              <ShieldCheck size={28} />
            </div>
            <h2 className="text-xl font-bold tracking-tight">Owner Console Login</h2>
            <p className="text-xs text-theme-text/60 mt-2">Access metrics, alerts, and settings</p>
          </div>

          <form onSubmit={handleOwnerLogin} className="flex flex-col gap-4">
            <div>
              <label className="block text-[10px] font-bold text-theme-text/70 uppercase mb-2">Owner Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="owner@spicegarden.com"
                required
                className="w-full p-3 rounded-xl bg-theme-accent/30 border border-theme-border text-sm text-theme-text placeholder-theme-text/40 focus:outline-none focus:border-theme-primary"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-theme-text/70 uppercase mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full p-3 rounded-xl bg-theme-accent/30 border border-theme-border text-sm text-theme-text placeholder-theme-text/40 focus:outline-none focus:border-theme-primary"
              />
            </div>

            {errorMsg && (
              <p className="text-[10px] text-red-500 font-bold bg-red-500/10 p-2 rounded-lg border border-red-500/20 text-center">
                {errorMsg}
              </p>
            )}

            <button
              type="submit"
              className="w-full mt-2 py-3.5 rounded-xl font-bold bg-theme-primary text-white hover:opacity-90 transition-all text-xs tracking-wider uppercase shadow-premium active-scale"
            >
              Sign In to Console
            </button>
          </form>

          <div className="text-center mt-6">
            <Link href="/" className="text-xs opacity-60 hover:opacity-100 flex items-center justify-center gap-1.5">
              Back to Portal
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <DashboardShell
        userEmail={ownerEmail}
        userRole="owner"
        businesses={businesses}
        currentBusinessId={activeBusinessId}
        onBusinessChange={setActiveBusinessId}
        onLogout={handleOwnerLogout}
        onAddLocation={() => setIsAddModalOpen(true)}
      >
      {/* Real-time Toast Notification banner */}
      {notification && (
        <div className="fixed bottom-6 right-6 z-50 max-w-sm bg-red-500 border border-red-600 rounded-2xl p-4 shadow-2xl text-white flex gap-3 animate-pop-in">
          <BellRing size={20} className="shrink-0 mt-0.5 animate-bounce" />
          <div className="flex-1">
            <div className="flex justify-between items-start mb-1">
              <span className="text-xs font-bold uppercase tracking-wider">Urgent Alert Received!</span>
              <button onClick={() => setNotification(null)} className="text-xs hover:opacity-60 font-bold">✕</button>
            </div>
            <p className="text-[11px] leading-relaxed mb-3 opacity-90">
              A customer just left a {notification.stars} ★ rating: "{notification.text.slice(0, 50)}..."
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => { setNotification(null); }}
                className="py-1 px-3 bg-red-600 hover:bg-red-700 text-[10px] font-bold rounded-lg transition-all"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 1. OVERVIEW TAB */}
      <div key="overview">


        <MetricsSummary
          scans={metrics.scans}
          ratingsCount={metrics.ratingsCount}
          completions={metrics.completions}
          averageRating={metrics.averageRating}
          distribution={metrics.distribution}
        />
        <AlertPanel alerts={alerts} onStatusChange={handleStatusChange} />
      </div>

      {/* 2. FEEDBACK TICKETS TAB */}
      <div key="feedback" className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-slide-up">
        <div className="lg:col-span-2 flex flex-col gap-4">
          {alerts.length === 0 ? (
            <div className="premium-card p-8 rounded-2xl border border-theme-border text-center text-xs opacity-60">
              No reviews or feedback sessions recorded yet.
            </div>
          ) : (
            alerts.map((alert) => (
              <div key={alert.id} className="premium-card p-6 rounded-2xl flex flex-col gap-4">
                <div className="flex justify-between items-center pb-3 border-b border-theme-border/50">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-yellow-500 bg-yellow-500/10 px-2.5 py-1 rounded">
                      {alert.stars} Stars
                    </span>
                    <span className="text-[10px] opacity-50 flex items-center gap-1">
                      <Calendar size={12} />
                      {alert.createdAt}
                    </span>
                  </div>
                  {/* NLP Sentiment Badge */}
                  <span className={`text-[10px] px-3 py-1 rounded-full font-extrabold uppercase border ${
                    alert.sentiment === 'positive'
                      ? 'bg-green-500/10 border-green-500/20 text-green-400'
                      : alert.sentiment === 'negative'
                      ? 'bg-red-500/10 border-red-500/20 text-red-400'
                      : 'bg-gray-500/10 border-gray-500/20 text-gray-400'
                  }`}>
                    {alert.sentiment}
                  </span>
                </div>

                <p className="text-xs opacity-90 leading-relaxed italic">"{alert.feedbackText}"</p>

                <div className="p-3 bg-theme-accent/30 rounded-xl border border-theme-border text-xs flex justify-between items-center">
                  <span className="opacity-60 text-[10px]">Contact left: <strong>{alert.contactInfo}</strong></span>
                  <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${
                    alert.status === 'new' 
                      ? 'bg-red-500/10 text-red-500 border-red-500/20' 
                      : alert.status === 'resolved' 
                      ? 'bg-green-500/10 text-green-500 border-green-500/20' 
                      : 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
                  }`}>
                    Status: {alert.status}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* NLP Sentiment Analysis summary snapshot on the right */}
        <div className="premium-card p-6 rounded-2xl flex flex-col gap-6 h-fit border border-theme-border">
          <div className="flex items-center gap-2 pb-3 border-b border-theme-border/50">
            <Layers size={16} className="text-theme-primary" />
            <h3 className="text-sm font-bold">NLP Sentiment Breakdown</h3>
          </div>

          <div className="flex flex-col gap-5 text-xs">
            <div>
              <div className="flex justify-between font-bold text-gray-400 mb-1.5">
                <span>Positive Sentiment</span>
                <span className="text-green-400">
                  {alerts.length > 0 ? ((alerts.filter(a => a.sentiment === 'positive').length / alerts.length) * 100).toFixed(0) : 0}%
                </span>
              </div>
              <div className="w-full bg-[#1e293b] h-2 rounded-full overflow-hidden">
                <div
                  className="bg-green-500 h-full rounded-full"
                  style={{ width: `${alerts.length > 0 ? (alerts.filter(a => a.sentiment === 'positive').length / alerts.length) * 100 : 0}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between font-bold text-gray-400 mb-1.5">
                <span>Neutral Sentiment</span>
                <span className="text-gray-400">
                  {alerts.length > 0 ? ((alerts.filter(a => a.sentiment === 'neutral').length / alerts.length) * 100).toFixed(0) : 0}%
                </span>
              </div>
              <div className="w-full bg-[#1e293b] h-2 rounded-full overflow-hidden">
                <div
                  className="bg-gray-400 h-full rounded-full"
                  style={{ width: `${alerts.length > 0 ? (alerts.filter(a => a.sentiment === 'neutral').length / alerts.length) * 100 : 0}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between font-bold text-gray-400 mb-1.5">
                <span>Negative Sentiment</span>
                <span className="text-red-400">
                  {alerts.length > 0 ? ((alerts.filter(a => a.sentiment === 'negative').length / alerts.length) * 100).toFixed(0) : 0}%
                </span>
              </div>
              <div className="w-full bg-[#1e293b] h-2 rounded-full overflow-hidden">
                <div
                  className="bg-red-500 h-full rounded-full"
                  style={{ width: `${alerts.length > 0 ? (alerts.filter(a => a.sentiment === 'negative').length / alerts.length) * 100 : 0}%` }}
                />
              </div>
            </div>
          </div>

          <div className="p-4 bg-theme-accent/20 border border-theme-border/60 rounded-xl mt-2 text-[10px] text-gray-400 leading-relaxed">
            <span className="block font-bold text-white uppercase mb-1">Funnel Insights</span>
            These metrics show the total sentiment breakdown of all reviews generated after scanning the location's QR code.
          </div>
        </div>
      </div>


      {/* 4. COMPLIANCE LEDGER TAB */}
      <div key="compliance" className="premium-card p-6 rounded-2xl animate-slide-up flex flex-col gap-6">
        <div className="flex items-center gap-2 mb-4 pb-3 border-b border-theme-border/50">
          <ShieldCheck className="text-green-500" />
          <h3 className="text-sm font-bold">Client Integrity Audit Ledger</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
          <div className="p-4 bg-theme-accent/30 border border-theme-border rounded-xl">
            <CheckCircle2 className="mx-auto text-green-500 mb-2" size={24} />
            <span className="block text-xs font-bold">100% Star-Gating Proof</span>
            <span className="text-[10px] opacity-60 block mt-1">Routing routes customer but never blocks Google Reviews</span>
          </div>
          <div className="p-4 bg-theme-accent/30 border border-theme-border rounded-xl">
            <CheckCircle2 className="mx-auto text-green-500 mb-2" size={24} />
            <span className="block text-xs font-bold">Editable AI Text Logs</span>
            <span className="text-[10px] opacity-60 block mt-1">Review text remains fully editable to avoid automated flags</span>
          </div>
          <div className="p-4 bg-theme-accent/30 border border-theme-border rounded-xl">
            <CheckCircle2 className="mx-auto text-green-500 mb-2" size={24} />
            <span className="block text-xs font-bold">Device Anonymization</span>
            <span className="text-[10px] opacity-60 block mt-1">GDPR & DPDP compliant. Customer contacts are strictly opt-in</span>
          </div>
        </div>
      </div>

      {/* 5. CONFIGS/SETTINGS TAB */}
      <div key="settings">
        <SettingsForm
          businessId={activeBusinessId}
          initialThreshold={activeConfig.threshold}
          initialChannels={activeConfig.channels}
          initialAllowNegative={activeConfig.allowNegative}
          onSave={handleSaveConfigs}
        />
      </div>
      </DashboardShell>

      {/* Register Location Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md bg-[#090f1d] border border-theme-border rounded-3xl p-8 shadow-2xl relative animate-pop-in">
            <button
              onClick={() => setIsAddModalOpen(false)}
              className="absolute right-6 top-6 text-gray-400 hover:text-white font-bold text-sm"
              type="button"
            >
              ✕
            </button>

            <h3 className="text-xl font-bold tracking-tight text-white mb-2">Register New Location</h3>
            <p className="text-xs text-gray-400 mb-6">Create a new customer-facing review funnel and QR code.</p>

            <form onSubmit={handleAddLocation} className="flex flex-col gap-4">
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-2">Business Name</label>
                <input
                  type="text"
                  required
                  value={newLocName}
                  onChange={(e) => setNewLocName(e.target.value)}
                  placeholder="e.g. Tasty Pizza Cafe"
                  className="w-full p-3 rounded-xl bg-[#0d1424] border border-theme-border/50 text-sm text-white focus:outline-none focus:border-theme-primary"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-2">Category</label>
                <select
                  value={newLocCategory}
                  onChange={(e) => setNewLocCategory(e.target.value)}
                  className="w-full p-3 rounded-xl bg-[#0d1424] border border-theme-border/50 text-sm text-white focus:outline-none focus:border-theme-primary"
                >
                  <option value="restaurant">Restaurant & Dining</option>
                  <option value="tyre_shop">Tyre Shop & Auto</option>
                  <option value="salon_retail">Salon & Retail</option>
                  <option value="hotel">Boutique Hotel</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-2">Google Place ID (Optional)</label>
                <input
                  type="text"
                  value={newLocPlaceId}
                  onChange={(e) => setNewLocPlaceId(e.target.value)}
                  placeholder="e.g. ChIJN1t_tDeuEmsRUsoyG83VSY4"
                  className="w-full p-3 rounded-xl bg-[#0d1424] border border-theme-border/50 text-sm text-white focus:outline-none focus:border-theme-primary font-mono"
                />
                <span className="text-[9px] text-gray-500 mt-1 block leading-normal">
                  Used to generate direct review write links on Google. Fallback test ID is used if left blank.
                </span>
              </div>

              <div className="flex gap-3 mt-4">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="flex-1 py-3 rounded-xl font-bold bg-[#0c1222] border border-theme-border/60 hover:bg-[#121b30] text-gray-400 text-xs tracking-wider uppercase transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 rounded-xl font-bold bg-theme-primary text-white hover:opacity-90 transition-all text-xs tracking-wider uppercase shadow-premium active-scale"
                >
                  Create & Select
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
