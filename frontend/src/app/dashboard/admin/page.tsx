'use client';

import React, { useState, useEffect } from 'react';
import ThemeSwitcher from '@/components/ThemeSwitcher';
import { 
  ShieldCheck, Database, FileText, ArrowRight, UserCheck, Eye, Star, 
  Sparkles, Terminal, Activity, Edit3, Trash2, Save, X, Plus, Award, 
  Users, BarChart3, Layers, Briefcase, Lock, CheckCircle, TrendingUp
} from 'lucide-react';
import Link from 'next/link';

type AdminTab = 'main_dashboard' | 'clients' | 'audit_logs' | 'leaderboard' | 'nlp_simulator';

interface BusinessRecord {
  id: string;
  name: string;
  category: string;
  ownerName: string;
  ownerEmail: string;
  threshold: number;
  scans: number;
  completions: number;
  rating: number;
  allowNegative: boolean;
  permissions: {
    canChangeThreshold: boolean;
    canViewAnalytics: boolean;
    canExportData: boolean;
  };
}

export default function AdminDashboardPage() {
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [activeTab, setActiveTab] = useState<AdminTab>('main_dashboard');

  // --- Selected Client Detail Modal ---
  const [selectedClient, setSelectedClient] = useState<BusinessRecord | null>(null);

  // --- NLP Simulator State ---
  const [rawText, setRawText] = useState('');
  const [simulationResult, setSimulationResult] = useState<any>(null);

  // --- Client CRUD Directory States ---
  const [businesses, setBusinesses] = useState<BusinessRecord[]>([
    { 
      id: 'test-restaurant', 
      name: 'Spice Garden Bistro', 
      category: 'restaurant', 
      ownerName: 'Aarav Sharma', 
      ownerEmail: 'owner@spicegarden.com', 
      threshold: 4.0, 
      scans: 142, 
      completions: 88, 
      rating: 4.3, 
      allowNegative: false,
      permissions: { canChangeThreshold: true, canViewAnalytics: true, canExportData: true }
    },
    { 
      id: 'test-tyre-shop', 
      name: 'Super Speed Tyres', 
      category: 'tyre_shop', 
      ownerName: 'Vikram Singh', 
      ownerEmail: 'owner@speedtyres.com', 
      threshold: 4.0, 
      scans: 78, 
      completions: 46, 
      rating: 4.1, 
      allowNegative: true,
      permissions: { canChangeThreshold: true, canViewAnalytics: true, canExportData: false }
    },
    { 
      id: 'test-salon', 
      name: 'Blush & Bloom Salon', 
      category: 'salon_retail', 
      ownerName: 'Priya Patel', 
      ownerEmail: 'owner@bloom.com', 
      threshold: 4.0, 
      scans: 210, 
      completions: 135, 
      rating: 4.6, 
      allowNegative: false,
      permissions: { canChangeThreshold: false, canViewAnalytics: true, canExportData: true }
    },
    { 
      id: 'test-hotel', 
      name: 'Grand Royal Retreat', 
      category: 'hotel', 
      ownerName: 'Kabir Mehta', 
      ownerEmail: 'owner@royalretreat.com', 
      threshold: 4.5, 
      scans: 45, 
      completions: 28, 
      rating: 4.4, 
      allowNegative: false,
      permissions: { canChangeThreshold: true, canViewAnalytics: false, canExportData: false }
    },
  ]);

  // Edit / Add Modal States
  const [editId, setEditId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ name: '', ownerName: '', ownerEmail: '', category: '', threshold: 4.0 });
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addForm, setAddForm] = useState({ name: '', ownerName: '', ownerEmail: '', category: 'restaurant', threshold: 4.0 });

  // Check storage on mount to bypass secondary login
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const session = localStorage.getItem('admin-session');
      if (session === 'true') {
        setIsAdminLoggedIn(true);
      }
    }
  }, []);

  // Fetch real client businesses from database upon admin login
  useEffect(() => {
    if (isAdminLoggedIn) {
      fetch('/api/businesses?email=admin@graphura.com')
        .then(res => res.json())
        .then(data => {
          if (data.success && data.businesses) {
            const mapped = data.businesses.map((b: any) => ({
              id: b.id,
              name: b.name,
              category: b.category,
              ownerName: b.ownerName || 'Business Owner',
              ownerEmail: b.ownerEmail,
              threshold: Number(b.threshold) || 4.0,
              scans: b.scans || 0,
              completions: b.completions || 0,
              rating: b.rating || 5.0,
              allowNegative: b.allowNegative || false,
              permissions: { canChangeThreshold: true, canViewAnalytics: true, canExportData: true }
            }));
            setBusinesses(mapped);
          }
        })
        .catch(err => console.error('Failed to load live admin businesses:', err));
    }
  }, [isAdminLoggedIn]);


  // Sync permissions & settings from local storage if set by owners
  useEffect(() => {
    if (typeof window !== 'undefined' && isAdminLoggedIn) {
      setBusinesses(prev =>
        prev.map(b => {
          const val = localStorage.getItem(`config-allow-negative-${b.id}`);
          if (val !== null) {
            return { ...b, allowNegative: val === 'true' };
          }
          return b;
        })
      );
    }
  }, [isAdminLoggedIn]);

  // Mock audit logs
  const [auditLogs, setAuditLogs] = useState<any[]>([
    { id: 'log-1', entity: 'businesses', action: 'CREATE', performedBy: 'Graphura Onboarding Bot', details: 'Registered test-hotel for Grand Royal Retreat', time: '1 hour ago' },
    { id: 'log-2', entity: 'private_feedback', action: 'STATUS_UPDATE', performedBy: 'owner@spicegarden.com', details: 'Marked feedback-1 (stars: 2) as RESOLVED', time: '3 hours ago' },
    { id: 'log-3', entity: 'businesses', action: 'THRESHOLD_CHANGE', performedBy: 'owner@spicegarden.com', details: 'Adjusted rating_threshold from 4.0 to 4.5', time: '1 day ago' },
    { id: 'log-4', entity: 'users', action: 'PERMISSION_REVOKE', performedBy: 'admin@graphura.com', details: 'Revoked canExportData permission for test-tyre-shop', time: '2 days ago' },
  ]);

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminEmail === 'admin@graphura.com' && adminPassword === 'admin2026') {
      localStorage.setItem('admin-session', 'true');
      setIsAdminLoggedIn(true);
      setErrorMsg('');
    } else {
      setErrorMsg('Invalid Administrator credentials. Use admin@graphura.com and admin2026.');
    }
  };

  const handleAdminLogout = () => {
    localStorage.removeItem('admin-session');
    setIsAdminLoggedIn(false);
  };

  // CRUD: DELETE RESTAURANT
  const handleDeleteBusiness = async (id: string) => {
    const bName = businesses.find(b => b.id === id)?.name;
    if (confirm(`Are you sure you want to remove the business "${bName}" and delete its owner profile?`)) {
      try {
        const res = await fetch(`/api/businesses?id=${id}`, {
          method: 'DELETE'
        });
        const data = await res.json();
        if (data.success) {
          setBusinesses(prev => prev.filter(b => b.id !== id));
          if (selectedClient?.id === id) setSelectedClient(null);
          setAuditLogs(prev => [
            {
              id: `log-${Date.now()}`,
              entity: 'businesses',
              action: 'DELETE',
              performedBy: 'admin@graphura.com',
              details: `Removed business location and owner profile for "${bName}" from database`,
              time: 'Just now',
            },
            ...prev,
          ]);
        } else {
          alert(data.error || 'Failed to delete business from database.');
        }
      } catch (err) {
        console.error('Delete business request failed:', err);
        alert('Network error while deleting business.');
      }
    }
  };


  // CRUD: ADD NEW RESTAURANT / CLIENT
  const handleAddBusiness = (e: React.FormEvent) => {
    e.preventDefault();
    if (!addForm.name.trim() || !addForm.ownerEmail.trim()) return;

    const slugify = (text: string) => {
      return text.toString().toLowerCase().trim().replace(/\s+/g, '-').replace(/[^\w\-]+/g, '').replace(/\-\-+/g, '-');
    };

    const newId = `${slugify(addForm.name)}-${Math.random().toString(36).substring(2, 6)}`;
    const newRecord: BusinessRecord = {
      id: newId,
      name: addForm.name,
      category: addForm.category,
      ownerName: addForm.ownerName || 'New Owner',
      ownerEmail: addForm.ownerEmail,
      threshold: addForm.threshold,
      scans: 0,
      completions: 0,
      rating: 5.0,
      allowNegative: false,
      permissions: { canChangeThreshold: true, canViewAnalytics: true, canExportData: true }
    };

    setBusinesses(prev => [...prev, newRecord]);
    setAuditLogs(prev => [
      {
        id: `log-${Date.now()}`,
        entity: 'businesses',
        action: 'CREATE',
        performedBy: 'admin@graphura.com',
        details: `Created new client profile "${addForm.name}" owned by ${addForm.ownerEmail}`,
        time: 'Just now',
      },
      ...prev,
    ]);

    setIsAddModalOpen(false);
    setAddForm({ name: '', ownerName: '', ownerEmail: '', category: 'restaurant', threshold: 4.0 });
  };

  // CRUD: START EDIT
  const handleStartEdit = (b: BusinessRecord) => {
    setEditId(b.id);
    setEditForm({ name: b.name, ownerName: b.ownerName, ownerEmail: b.ownerEmail, category: b.category, threshold: b.threshold });
  };

  // CRUD: SAVE EDIT
  const handleSaveEdit = async (id: string) => {
    try {
      const res = await fetch('/api/businesses', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id,
          threshold: Number(editForm.threshold)
        })
      });
      const data = await res.json();
      if (data.success) {
        setBusinesses(prev =>
          prev.map(b => (b.id === id ? { ...b, name: editForm.name, ownerName: editForm.ownerName, ownerEmail: editForm.ownerEmail, category: editForm.category, threshold: editForm.threshold } : b))
        );
        if (selectedClient?.id === id) {
          setSelectedClient(prev => prev ? { ...prev, name: editForm.name, ownerName: editForm.ownerName, ownerEmail: editForm.ownerEmail, category: editForm.category, threshold: editForm.threshold } : null);
        }
        setAuditLogs(prev => [
          {
            id: `log-${Date.now()}`,
            entity: 'businesses',
            action: 'UPDATE',
            performedBy: 'admin@graphura.com',
            details: `Updated metadata for client ID "${id}" in database`,
            time: 'Just now',
          },
          ...prev,
        ]);
        setEditId(null);
      } else {
        alert(data.error || 'Failed to update business settings.');
      }
    } catch (err) {
      console.error('Update request failed:', err);
      alert('Network error while updating business settings.');
    }
  };

  // TOGGLE PERMISSIONS
  const handlePermissionToggle = async (id: string, perm: keyof BusinessRecord['permissions']) => {
    const targetBusiness = businesses.find(b => b.id === id);
    if (!targetBusiness) return;

    const newPermValue = !targetBusiness.permissions[perm];
    const updatedPermissions = {
      ...targetBusiness.permissions,
      [perm]: newPermValue
    };

    try {
      const res = await fetch('/api/businesses', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id,
          permissions: updatedPermissions
        })
      });
      const data = await res.json();
      if (data.success) {
        setBusinesses(prev =>
          prev.map(b => {
            if (b.id === id) {
              const updated = { ...b, permissions: updatedPermissions };
              if (selectedClient?.id === id) setSelectedClient(updated);
              return updated;
            }
            return b;
          })
        );
        setAuditLogs(prev => [
          {
            id: `log-${Date.now()}`,
            entity: 'users',
            action: 'PERMISSION_UPDATE',
            performedBy: 'admin@graphura.com',
            details: `Toggled permission "${perm}" for client ID "${id}" in database`,
            time: 'Just now',
          },
          ...prev,
        ]);
      } else {
        alert(data.error || 'Failed to update client permissions.');
      }
    } catch (err) {
      console.error('Failed to toggle client permissions:', err);
      alert('Network error while toggling permissions.');
    }
  };

  const runNlpSimulation = async () => {
    if (!rawText.trim()) return;
    try {
      const res = await fetch('/api/nlp/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: rawText })
      });
      const data = await res.json();
      if (data.success && data.analysis) {
        setSimulationResult({
          aspects: data.analysis.aspect_sentiments,
          overallSentiment: data.analysis.overall_sentiment,
          predictedEmotion: data.analysis.predicted_emotion,
          complaintSeverity: data.analysis.complaint_severity,
          intent: data.analysis.intent
        });
      } else {
        alert(data.error || 'NLP simulation analysis failed.');
      }
    } catch (err) {
      console.error('Failed to analyze review via NLP service:', err);
      alert('NLP analysis microservice is offline. Ensure FastAPI is running on port 8000.');
    }
  };

  // Metrics calculators
  const totalBusinesses = businesses.length;
  const totalScans = businesses.reduce((acc, b) => acc + b.scans, 0);
  const totalReviews = businesses.reduce((acc, b) => acc + b.completions, 0);
  const totalClients = new Set(businesses.map(b => b.ownerEmail)).size;
  const totalCategories = new Set(businesses.map(b => b.category)).size;
  const averageGlobalRating = totalBusinesses > 0 ? (businesses.reduce((acc, b) => acc + b.rating, 0) / totalBusinesses) : 0;

  if (!isAdminLoggedIn) {
    return (
      <div className="min-h-screen bg-[#030712] text-theme-text flex items-center justify-center p-6 transition-colors duration-300">
        <div className="w-full max-w-sm premium-card rounded-2xl p-8 flex flex-col justify-between border border-theme-border">
          <div className="text-center mb-6">
            <div className="w-12 h-12 rounded-xl bg-theme-accent border border-theme-border flex items-center justify-center text-theme-primary mx-auto mb-4">
              <ShieldCheck size={28} className="text-[#10b981]" />
            </div>
            <h2 className="text-xl font-bold tracking-tight text-white">Graphura Admin Portal</h2>
            <p className="text-xs text-theme-text/60 mt-2">Elevated cross-tenant audit access</p>
          </div>

          <form onSubmit={handleAdminLogin} className="flex flex-col gap-4">
            <div>
              <label className="block text-[10px] font-bold text-theme-text/70 uppercase mb-2">Admin Email</label>
              <input
                type="email"
                value={adminEmail}
                onChange={(e) => setAdminEmail(e.target.value)}
                placeholder="admin@graphura.com"
                required
                className="w-full p-3 rounded-xl bg-theme-accent/30 border border-theme-border text-sm text-theme-text placeholder-theme-text/40 focus:outline-none focus:border-theme-primary"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-theme-text/70 uppercase mb-2">Password</label>
              <input
                type="password"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
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
              className="w-full mt-2 py-3.5 rounded-xl font-bold bg-[#10b981] hover:bg-[#059669] text-black text-xs tracking-wider uppercase shadow-premium active-scale"
            >
              Authenticate Admin
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
    <div className="min-h-screen bg-[#030712] text-theme-text font-sans transition-colors duration-300">
      {/* Top Navbar */}
      <header className="border-b border-theme-border bg-theme-card/75 backdrop-blur-md sticky top-0 z-50 px-6 py-4">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#10b981] flex items-center justify-center text-black font-extrabold text-sm">
              G
            </div>
            <div>
              <span className="font-bold text-sm text-white block">Graphura Global Admin Dashboard</span>
              <span className="text-[9px] font-extrabold text-theme-primary block tracking-wider uppercase text-[#10b981]">Cross-Tenant Audit Access</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <ThemeSwitcher />
            <button
              onClick={handleAdminLogout}
              className="py-1.5 px-3 rounded-lg border border-theme-border text-xs font-bold bg-theme-accent/30 hover:bg-theme-accent transition-all text-theme-text"
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>

      {/* Admin Tab Navigation */}
      <div className="max-w-6xl mx-auto px-6 pt-6 flex flex-wrap gap-2">
        {([
          { id: 'main_dashboard', label: 'Main Dashboard' },
          { id: 'clients', label: 'Client Dashboard' },
          { id: 'audit_logs', label: 'Audit Log' },
          { id: 'leaderboard', label: 'Leaderboard' },
          { id: 'nlp_simulator', label: 'NLP Simulator' }
        ] as const).map((tab) => (
          <button
            key={tab.id}
            onClick={() => { setActiveTab(tab.id); setSelectedClient(null); }}
            className={`py-2.5 px-4 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
              activeTab === tab.id
                ? 'bg-[#10b981] text-black shadow-premium'
                : 'bg-theme-card border border-theme-border text-theme-text opacity-70 hover:opacity-100'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Main Content Dashboard */}
      <main className="max-w-6xl mx-auto p-6">
        
        {/* 1. TAB: MAIN DASHBOARD */}
        {activeTab === 'main_dashboard' && (
          <div className="flex flex-col gap-8 animate-slide-up">
            {/* KPI Cards Grid */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="premium-card p-4 rounded-2xl border border-theme-border">
                <div className="text-gray-400 text-[10px] font-bold uppercase tracking-wider mb-2 flex justify-between items-center">
                  <span>Registered Locations</span>
                  <Briefcase size={14} className="text-[#10b981]" />
                </div>
                <div className="text-2xl font-extrabold text-white">{totalBusinesses}</div>
                <span className="text-[9px] text-gray-500 block mt-1">Active business funnels</span>
              </div>

              <div className="premium-card p-4 rounded-2xl border border-theme-border">
                <div className="text-gray-400 text-[10px] font-bold uppercase tracking-wider mb-2 flex justify-between items-center">
                  <span>Total Scans</span>
                  <Eye size={14} className="text-blue-400" />
                </div>
                <div className="text-2xl font-extrabold text-white">{totalScans}</div>
                <span className="text-[9px] text-gray-500 block mt-1">Accumulated QR visits</span>
              </div>

              <div className="premium-card p-4 rounded-2xl border border-theme-border">
                <div className="text-gray-400 text-[10px] font-bold uppercase tracking-wider mb-2 flex justify-between items-center">
                  <span>Total Reviews</span>
                  <CheckCircle size={14} className="text-green-400" />
                </div>
                <div className="text-2xl font-extrabold text-white">{totalReviews}</div>
                <span className="text-[9px] text-green-400 block mt-1 font-bold">
                  {totalScans > 0 ? ((totalReviews / totalScans) * 100).toFixed(0) : 0}% Conv. Rate
                </span>
              </div>

              <div className="premium-card p-4 rounded-2xl border border-theme-border">
                <div className="text-gray-400 text-[10px] font-bold uppercase tracking-wider mb-2 flex justify-between items-center">
                  <span>Total Clients</span>
                  <Users size={14} className="text-purple-400" />
                </div>
                <div className="text-2xl font-extrabold text-white">{totalClients}</div>
                <span className="text-[9px] text-gray-500 block mt-1">Unique merchant owners</span>
              </div>

              <div className="premium-card p-4 rounded-2xl border border-theme-border">
                <div className="text-gray-400 text-[10px] font-bold uppercase tracking-wider mb-2 flex justify-between items-center">
                  <span>Categories</span>
                  <Layers size={14} className="text-yellow-400" />
                </div>
                <div className="text-2xl font-extrabold text-white">{totalCategories}</div>
                <span className="text-[9px] text-gray-500 block mt-1">Diverse business niches</span>
              </div>
            </div>

            {/* Custom Visual Graphs */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="premium-card p-6 rounded-2xl border border-theme-border md:col-span-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-6 flex items-center gap-1.5">
                  <BarChart3 size={14} className="text-[#10b981]" />
                  Monthly Performance Trends (Scans vs Completed reviews)
                </h4>
                <div className="flex flex-col gap-4">
                  {[
                    { month: 'Historical Base', scans: 430, reviews: 262, barWidthScans: '90%', barWidthRev: '55%' },
                    { month: 'Live System Total (All Clients)', scans: totalScans, reviews: totalReviews, barWidthScans: totalScans > 0 ? '100%' : '0%', barWidthRev: totalScans > 0 ? `${Math.min(100, Math.round((totalReviews / totalScans) * 100))}%` : '0%' },
                  ].map((row, idx) => (
                    <div key={idx} className="flex flex-col gap-1 text-xs">
                      <div className="flex justify-between font-bold text-gray-400">
                        <span>{row.month}</span>
                        <span>Scans: {row.scans} | Reviews: {row.reviews}</span>
                      </div>
                      <div className="w-full bg-[#1e293b] h-3 rounded-full overflow-hidden flex flex-col gap-0.5">
                        <div className="bg-[#10b981] h-1.5 rounded-full" style={{ width: row.barWidthScans }} />
                        <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: row.barWidthRev }} />
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex gap-4 mt-6 text-[10px] text-gray-400 font-bold justify-end">
                  <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 bg-[#10b981] rounded-full"></span> Scans</span>
                  <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 bg-blue-500 rounded-full"></span> Reviews</span>
                </div>
              </div>

              <div className="premium-card p-6 rounded-2xl border border-theme-border">
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-6 flex items-center gap-1.5">
                  <Layers size={14} className="text-[#10b981]" />
                  Niche Categories Ratio
                </h4>
                <div className="flex flex-col gap-4 justify-center">
                  {[
                    { category: 'Restaurant & Dining', count: 2, pct: '50%', color: 'bg-emerald-500' },
                    { category: 'Tyre & Auto Shop', count: 1, pct: '25%', color: 'bg-blue-500' },
                    { category: 'Salon & Retail', count: 1, pct: '25%', color: 'bg-purple-500' },
                  ].map((item, idx) => (
                    <div key={idx} className="text-xs">
                      <div className="flex justify-between text-gray-400 mb-1">
                        <span className="font-semibold">{item.category}</span>
                        <span>{item.count} Location ({item.pct})</span>
                      </div>
                      <div className="w-full bg-[#1e293b] h-1.5 rounded-full overflow-hidden">
                        <div className={`${item.color} h-full`} style={{ width: item.pct }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 2. TAB: BUSINESS / CLIENT DASHBOARD */}
        {activeTab === 'clients' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-slide-up">
            
            {/* Left Col: Client Listing */}
            <div className={`lg:col-span-2 premium-card p-6 rounded-3xl border border-theme-border flex flex-col`}>
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-2">
                  <UserCheck size={18} className="text-[#10b981]" />
                  <h3 className="text-sm font-bold text-white">Locations & Client Directory</h3>
                </div>
                <button
                  onClick={() => setIsAddModalOpen(true)}
                  className="py-1.5 px-3 bg-[#10b981] hover:bg-[#059669] text-black text-xs font-bold rounded-lg flex items-center gap-1 transition-all active-scale"
                >
                  <Plus size={14} /> Add Client
                </button>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-theme-border/50 opacity-60 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                      <th className="py-2 pb-3">Client / Business</th>
                      <th className="py-2 pb-3">Category</th>
                      <th className="py-2 pb-3">Owner Contact</th>
                      <th className="py-2 pb-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-theme-border/40">
                    {businesses.map((b) => (
                      <tr 
                        key={b.id} 
                        className={`hover:bg-theme-accent/25 transition-all cursor-pointer ${selectedClient?.id === b.id ? 'bg-theme-accent/30' : ''}`}
                        onClick={() => setSelectedClient(b)}
                      >
                        <td className="py-3.5 font-semibold text-white">
                          {editId === b.id ? (
                            <input
                              type="text"
                              value={editForm.name}
                              onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                              onClick={(e) => e.stopPropagation()}
                              className="p-1.5 rounded bg-[#0d1424] text-xs text-white border border-theme-border"
                            />
                          ) : (
                            b.name
                          )}
                        </td>

                        <td className="py-3.5 capitalize text-gray-400">
                          {editId === b.id ? (
                            <select
                              value={editForm.category}
                              onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                              onClick={(e) => e.stopPropagation()}
                              className="p-1.5 rounded bg-[#0d1424] text-xs text-white border border-theme-border"
                            >
                              <option value="restaurant">Restaurant</option>
                              <option value="tyre_shop">Tyre Shop</option>
                              <option value="salon_retail">Salon Retail</option>
                              <option value="hotel">Hotel</option>
                            </select>
                          ) : (
                            b.category.replace('_', ' ')
                          )}
                        </td>

                        <td className="py-3.5">
                          {editId === b.id ? (
                            <div className="flex flex-col gap-1" onClick={(e) => e.stopPropagation()}>
                              <input
                                type="text"
                                value={editForm.ownerName}
                                onChange={(e) => setEditForm({ ...editForm, ownerName: e.target.value })}
                                className="p-1.5 rounded bg-[#0d1424] text-xs text-white border border-theme-border"
                                placeholder="Owner name"
                              />
                              <input
                                type="email"
                                value={editForm.ownerEmail}
                                onChange={(e) => setEditForm({ ...editForm, ownerEmail: e.target.value })}
                                className="p-1.5 rounded bg-[#0d1424] text-xs text-white border border-theme-border"
                                placeholder="Owner email"
                              />
                            </div>
                          ) : (
                            <div>
                              <span className="block font-medium text-white">{b.ownerName}</span>
                              <span className="block text-[10px] text-gray-500 font-mono">{b.ownerEmail}</span>
                            </div>
                          )}
                        </td>

                        <td className="py-3.5 text-right" onClick={(e) => e.stopPropagation()}>
                          {editId === b.id ? (
                            <div className="flex gap-1.5 justify-end">
                              <button
                                onClick={() => handleSaveEdit(b.id)}
                                className="p-1.5 bg-green-500/10 hover:bg-green-500/20 text-green-400 rounded"
                              >
                                <Save size={14} />
                              </button>
                              <button
                                onClick={() => setEditId(null)}
                                className="p-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded"
                              >
                                <X size={14} />
                              </button>
                            </div>
                          ) : (
                            <div className="flex gap-1.5 justify-end">
                              <button
                                onClick={() => handleStartEdit(b)}
                                className="p-1.5 bg-theme-accent/30 hover:bg-theme-accent text-white rounded"
                              >
                                <Edit3 size={14} />
                              </button>
                              <button
                                onClick={() => handleDeleteBusiness(b.id)}
                                className="p-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Right Col: Permissions and Client Management */}
            <div className="premium-card p-6 rounded-3xl border border-theme-border flex flex-col justify-between">
              {selectedClient ? (
                <div className="flex flex-col gap-6 animate-pop-in">
                  <div>
                    <h3 className="text-sm font-bold text-white mb-1">Client Management Panel</h3>
                    <span className="text-[10px] text-gray-500 uppercase font-mono">Location ID: {selectedClient.id}</span>
                  </div>

                  <div className="p-4 bg-theme-accent/20 border border-theme-border rounded-2xl flex flex-col gap-2">
                    <span className="text-[10px] font-bold text-[#10b981] uppercase tracking-widest block mb-2">Location Summary</span>
                    <div className="flex justify-between text-xs py-1 border-b border-theme-border/50 text-gray-300">
                      <span>Average Rating:</span>
                      <span className="font-bold text-white">{selectedClient.rating} ★</span>
                    </div>
                    <div className="flex justify-between text-xs py-1 border-b border-theme-border/50 text-gray-300">
                      <span>Total QR Scans:</span>
                      <span className="font-bold text-white">{selectedClient.scans}</span>
                    </div>
                    <div className="flex justify-between text-xs py-1 border-b border-theme-border/50 text-gray-300">
                      <span>Completed Reviews:</span>
                      <span className="font-bold text-white">{selectedClient.completions}</span>
                    </div>
                    <div className="flex justify-between text-xs py-1 text-gray-300">
                      <span>Stars Threshold:</span>
                      <span className="font-bold text-white">{selectedClient.threshold} stars</span>
                    </div>
                  </div>

                  {/* Client Permissions Checklist */}
                  <div className="flex flex-col gap-3">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">Client Permissions</span>
                    
                    <label className="flex items-center gap-3 cursor-pointer text-xs select-none text-gray-300">
                      <input
                        type="checkbox"
                        checked={selectedClient.permissions.canChangeThreshold}
                        onChange={() => handlePermissionToggle(selectedClient.id, 'canChangeThreshold')}
                        className="w-4.5 h-4.5 rounded border-theme-border bg-theme-accent text-[#10b981] focus:ring-[#10b981]"
                      />
                      <div>
                        <span>Allow rating threshold modifications</span>
                        <span className="text-[9px] text-gray-500 block">Owner can adjust stars routing setting</span>
                      </div>
                    </label>

                    <label className="flex items-center gap-3 cursor-pointer text-xs select-none text-gray-300">
                      <input
                        type="checkbox"
                        checked={selectedClient.permissions.canViewAnalytics}
                        onChange={() => handlePermissionToggle(selectedClient.id, 'canViewAnalytics')}
                        className="w-4.5 h-4.5 rounded border-theme-border bg-theme-accent text-[#10b981] focus:ring-[#10b981]"
                      />
                      <div>
                        <span>Allow analytics access</span>
                        <span className="text-[9px] text-gray-500 block">Owner can view feedback velocity & conversion rates</span>
                      </div>
                    </label>

                    <label className="flex items-center gap-3 cursor-pointer text-xs select-none text-gray-300">
                      <input
                        type="checkbox"
                        checked={selectedClient.permissions.canExportData}
                        onChange={() => handlePermissionToggle(selectedClient.id, 'canExportData')}
                        className="w-4.5 h-4.5 rounded border-theme-border bg-theme-accent text-[#10b981] focus:ring-[#10b981]"
                      />
                      <div>
                        <span>Allow data exports</span>
                        <span className="text-[9px] text-gray-500 block">Owner can export reviews logs & audit trails</span>
                      </div>
                    </label>
                  </div>
                </div>
              ) : (
                <div className="text-center py-20 text-gray-500 text-xs flex flex-col items-center justify-center h-full">
                  <Lock size={32} className="opacity-40 mb-3" />
                  Select a business location client from the list to manage permissions, settings, and view reports.
                </div>
              )}
            </div>
          </div>
        )}

        {/* 3. TAB: COMPLIANCE AUDIT LOG */}
        {activeTab === 'audit_logs' && (
          <div className="premium-card p-6 rounded-2xl border border-theme-border animate-slide-up">
            <div className="flex items-center gap-2 mb-6">
              <FileText size={18} className="text-[#10b981]" />
              <h3 className="text-sm font-bold text-white">Compliance Audit Log Trail</h3>
            </div>
            
            <div className="flex flex-col gap-4">
              {auditLogs.map((log) => (
                <div key={log.id} className="p-4 bg-theme-accent/20 border border-theme-border rounded-xl text-xs leading-relaxed">
                  <div className="flex justify-between items-center mb-2 opacity-60">
                    <span className="font-bold uppercase tracking-wider text-[9px] text-[#10b981]">{log.action}</span>
                    <span>{log.time}</span>
                  </div>
                  <p className="text-white mb-2 font-medium">{log.details}</p>
                  <div className="text-[10px] text-gray-500 uppercase">Performed by: {log.performedBy}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 4. TAB: LEADERBOARD */}
        {activeTab === 'leaderboard' && (
          <div className="premium-card p-6 rounded-2xl border border-theme-border animate-slide-up flex flex-col gap-6">
            <div className="flex items-center gap-2 mb-2 pb-3 border-b border-theme-border/50">
              <Award size={18} className="text-[#10b981]" />
              <h3 className="text-sm font-bold text-white">GenReview Client Leaderboard</h3>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-theme-border/50 opacity-60 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                    <th className="py-2 pb-3 w-16">Rank</th>
                    <th className="py-2 pb-3">Business Name</th>
                    <th className="py-2 pb-3 text-center">QR Scans</th>
                    <th className="py-2 pb-3 text-center">Google Reviews</th>
                    <th className="py-2 pb-3 text-center">Weighted Score</th>
                    <th className="py-2 pb-3 text-right">Conversion Ratio</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-theme-border/40">
                  {[...businesses]
                    .sort((a, b) => b.rating - a.rating || b.completions - a.completions)
                    .map((client, idx) => {
                      const conversion = client.scans > 0 ? (client.completions / client.scans) * 100 : 0;
                      return (
                        <tr key={client.id} className="hover:bg-theme-accent/25 transition-all">
                          <td className="py-4 font-bold text-lg text-gray-400">
                            {idx === 0 ? '🏆 1' : idx === 1 ? '🥈 2' : idx === 2 ? '🥉 3' : `#${idx + 1}`}
                          </td>
                          <td className="py-4 font-bold text-white">{client.name}</td>
                          <td className="py-4 text-center text-gray-300">{client.scans}</td>
                          <td className="py-4 text-center text-gray-300">{client.completions}</td>
                          <td className="py-4 text-center text-yellow-500 font-bold">{client.rating.toFixed(1)} ★</td>
                          <td className="py-4 text-right text-green-400 font-bold">{conversion.toFixed(0)}%</td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 5. TAB: NLP MODEL SIMULATOR */}
        {activeTab === 'nlp_simulator' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-slide-up">
            <div className="premium-card p-6 rounded-2xl border border-theme-border flex flex-col justify-between min-h-[350px]">
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider opacity-60 mb-4 flex items-center gap-2">
                  <Terminal size={16} className="text-[#10b981]" />
                  DSA NLP Model Simulator
                </h3>
                <p className="text-xs text-gray-400 leading-relaxed mb-6">
                  Paste raw restaurant/auto shop review texts here to test how the classifier model extracts aspects, predicts emotions, and maps escalation severity levels.
                </p>
                <textarea
                  value={rawText}
                  onChange={(e) => setRawText(e.target.value)}
                  placeholder="The food was cold but the manager offered a refund..."
                  rows={5}
                  className="w-full p-3 rounded-xl bg-theme-accent/30 text-white border border-theme-border text-xs focus:outline-none focus:border-[#10b981] mb-4"
                />
              </div>
              <button
                onClick={runNlpSimulation}
                className="py-3 px-6 rounded-xl bg-[#10b981] hover:bg-[#059669] text-black font-bold text-xs uppercase tracking-wider active-scale shadow-premium self-end"
              >
                Analyze Review Text
              </button>
            </div>

            {/* Simulation Outputs */}
            <div className="premium-card p-6 rounded-2xl border border-theme-border min-h-[350px]">
              <h3 className="text-sm font-bold uppercase tracking-wider opacity-60 mb-6 flex items-center gap-2">
                <Activity size={16} className="text-[#10b981]" />
                Extraction Outputs
              </h3>

              {simulationResult ? (
                <div className="flex flex-col gap-4 text-xs animate-pop-in text-gray-300">
                  <div className="flex justify-between items-center py-2 border-b border-theme-border/50">
                    <span className="opacity-60 uppercase font-semibold">Overall Sentiment</span>
                    <span className={`font-bold capitalize ${simulationResult.overallSentiment === 'positive' ? 'text-green-400' : 'text-red-400'}`}>
                      {simulationResult.overallSentiment}
                    </span>
                  </div>
                  <div className="flex flex-col gap-2 py-2 border-b border-theme-border/50">
                    <span className="opacity-60 uppercase font-semibold">Aspect Sentiments</span>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {Object.keys(simulationResult.aspects).length > 0 ? (
                        Object.entries(simulationResult.aspects).map(([aspect, sentiment]) => (
                          <span
                            key={aspect}
                            className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 border ${
                              sentiment === 'positive'
                                ? 'bg-green-500/10 border-green-500/20 text-green-400'
                                : 'bg-red-500/10 border-red-500/20 text-red-400'
                            }`}
                          >
                            {aspect}: {sentiment as string}
                          </span>
                        ))
                      ) : (
                        <span className="text-gray-500 italic">No aspects detected.</span>
                      )}
                    </div>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-theme-border/50">
                    <span className="opacity-60 uppercase font-semibold">Predicted Emotion</span>
                    <span className="font-bold text-yellow-500">{simulationResult.predictedEmotion}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-theme-border/50">
                    <span className="opacity-60 uppercase font-semibold">Neural Severity rating</span>
                    <span className={`font-bold uppercase px-2 py-0.5 rounded ${
                      simulationResult.complaintSeverity === 'critical' ? 'bg-red-500/10 text-red-400' : 'bg-green-500/10 text-green-400'
                    }`}>
                      {simulationResult.complaintSeverity}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="opacity-60 uppercase font-semibold">Inferred Intent</span>
                    <span className="font-bold capitalize text-blue-400">{simulationResult.intent}</span>
                  </div>
                </div>
              ) : (
                <div className="text-center py-16 border border-dashed border-theme-border rounded-xl text-gray-500 text-xs">
                  Run simulation to evaluate outputs.
                </div>
              )}
            </div>
          </div>
        )}

      </main>

      {/* Add Client Modal */}
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

            <h3 className="text-xl font-bold tracking-tight text-white mb-2">Add New Client Location</h3>
            <p className="text-xs text-gray-400 mb-6">Register a new merchant profile and funnel configs.</p>

            <form onSubmit={handleAddBusiness} className="flex flex-col gap-4">
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-2">Business Name</label>
                <input
                  type="text"
                  required
                  value={addForm.name}
                  onChange={(e) => setAddForm({ ...addForm, name: e.target.value })}
                  placeholder="e.g. Delicious Burgers Inc"
                  className="w-full p-3 rounded-xl bg-[#0d1424] border border-theme-border/50 text-sm text-white focus:outline-none focus:border-[#10b981]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase mb-2">Owner Name</label>
                  <input
                    type="text"
                    value={addForm.ownerName}
                    onChange={(e) => setAddForm({ ...addForm, ownerName: e.target.value })}
                    placeholder="Owner full name"
                    className="w-full p-3 rounded-xl bg-[#0d1424] border border-theme-border/50 text-sm text-white focus:outline-none focus:border-[#10b981]"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase mb-2">Category</label>
                  <select
                    value={addForm.category}
                    onChange={(e) => setAddForm({ ...addForm, category: e.target.value })}
                    className="w-full p-3 rounded-xl bg-[#0d1424] border border-theme-border/50 text-sm text-white focus:outline-none focus:border-[#10b981]"
                  >
                    <option value="restaurant">Restaurant</option>
                    <option value="tyre_shop">Tyre Shop</option>
                    <option value="salon_retail">Salon Retail</option>
                    <option value="hotel">Hotel</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-2">Owner Email (Unique Login)</label>
                <input
                  type="email"
                  required
                  value={addForm.ownerEmail}
                  onChange={(e) => setAddForm({ ...addForm, ownerEmail: e.target.value })}
                  placeholder="owner@domain.com"
                  className="w-full p-3 rounded-xl bg-[#0d1424] border border-theme-border/50 text-sm text-white focus:outline-none focus:border-[#10b981]"
                />
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
                  className="flex-1 py-3 rounded-xl font-bold bg-[#10b981] text-black hover:opacity-90 transition-all text-xs tracking-wider uppercase shadow-premium active-scale"
                >
                  Register Client
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
