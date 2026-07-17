'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowRight, ShieldCheck, Sparkles, Building, Key, Mail, UserPlus, Info } from 'lucide-react';

type ModalType = 'auth' | null;
type AuthTab = 'register' | 'owner_login' | 'admin_login';

export default function HomePage() {
  const router = useRouter();
  const [modal, setModal] = useState<ModalType>(null);
  const [activeTab, setActiveTab] = useState<AuthTab>('register');
  const [errorMessage, setErrorMessage] = useState('');

  // Form states
  const [regData, setRegData] = useState({ name: '', email: '', password: '', placeId: '' });
  const [ownerCreds, setOwnerCreds] = useState({ email: '', password: '' });
  const [adminCreds, setAdminCreds] = useState({ email: '', password: '' });

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regData.name.trim() || !regData.email.trim()) return;

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Business Owner',
          email: regData.email.trim(),
          businessName: regData.name.trim(),
          category: 'restaurant',
          googlePlaceId: regData.placeId.trim()
        })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setErrorMessage(data.error || 'Failed to register business.');
        return;
      }

      localStorage.setItem('owner-session', 'true');
      localStorage.setItem('owner-email', data.ownerEmail);
      localStorage.setItem('active-business-id', data.businessId);

      alert(`Registration Successful! Registered: "${data.businessName}"`);
      setModal(null);
      setErrorMessage('');
      router.push('/dashboard');
    } catch (err: any) {
      console.error(err);
      setErrorMessage('Network error during registration.');
    }
  };

  const handleOwnerLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: ownerCreds.email.trim(),
          role: 'owner'
        })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setErrorMessage(data.error || 'Invalid credentials.');
        return;
      }

      localStorage.setItem('owner-session', 'true');
      localStorage.setItem('owner-email', data.email);
      localStorage.setItem('active-business-id', data.businessId);

      setModal(null);
      setErrorMessage('');
      router.push('/dashboard');
    } catch (err) {
      console.error(err);
      setErrorMessage('Network error during login.');
    }
  };

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: adminCreds.email.trim(),
          password: adminCreds.password,
          role: 'admin'
        })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setErrorMessage(data.error || 'Invalid credentials.');
        return;
      }

      localStorage.setItem('admin-session', 'true');
      localStorage.setItem('admin-email', data.email);

      setModal(null);
      setErrorMessage('');
      router.push('/dashboard/admin');
    } catch (err) {
      console.error(err);
      setErrorMessage('Network error during admin login.');
    }
  };

  return (
    <div className="min-h-screen bg-[#030712] text-theme-text flex flex-col justify-between font-sans transition-colors duration-300 relative overflow-hidden">
      
      {/* Dynamic Background Glows matching the mockup */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-emerald-500/10 blur-[120px] rounded-full pointer-events-none" />

      {/* Top Navbar Header */}
      <header className="sticky top-0 z-40 py-5 px-6 sm:px-12 flex justify-between items-center max-w-6xl mx-auto w-full">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#10b981] flex items-center justify-center text-black font-extrabold text-lg tracking-tighter">
            G
          </div>
          <span className="font-extrabold text-lg text-white tracking-tight">GenReview AI</span>
        </Link>

        <div className="flex items-center gap-4">
          <button
            onClick={() => { setModal('auth'); setActiveTab('owner_login'); setErrorMessage(''); }}
            className="text-xs font-semibold text-[#f3f4f6] bg-[#0c1222] border border-theme-border/60 hover:bg-[#121b30] px-5 py-2.5 rounded-xl transition-all active-scale"
          >
            Sign In / Register
          </button>
        </div>
      </header>

      {/* Hero Core Segment */}
      <main className="max-w-4xl mx-auto w-full px-6 py-20 flex-grow flex flex-col items-center justify-center text-center relative z-10">
        
        <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/5 text-emerald-400 text-[10px] font-bold tracking-widest uppercase mb-8">
          <Sparkles size={11} className="animate-pulse" />
          Compliance-First Review Funnels
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white max-w-3xl leading-[1.1] mb-6">
          Turn Real Customer Feedback into <span className="text-[#10b981]">Google Growth.</span>
        </h1>

        <p className="text-sm sm:text-base text-gray-400 leading-relaxed max-w-2xl mb-12">
          QR-code funnels route high ratings to editable AI draft copies for quick Google posting, while privately capturing critique to save customer relations. Fully compliant.
        </p>

        <button
          onClick={() => { setModal('auth'); setActiveTab('register'); setErrorMessage(''); }}
          className="px-8 py-4 rounded-full bg-[#10b981] hover:bg-[#059669] text-black font-extrabold text-sm tracking-wider uppercase transition-all shadow-premium active-scale"
        >
          Get Started
        </button>
      </main>

      {/* Interactive Authentication & Portals Modal */}
      {modal === 'auth' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-md bg-[#090f1d] border border-theme-border rounded-3xl p-8 shadow-2xl relative animate-pop-in">
            <button
              onClick={() => setModal(null)}
              className="absolute right-6 top-6 text-gray-400 hover:text-white font-bold text-sm"
            >
              ✕
            </button>

            {/* Modal Navigation Tabs */}
            <div className="flex border-b border-theme-border/50 pb-3 mb-6 gap-2">
              <button
                onClick={() => { setActiveTab('register'); setErrorMessage(''); }}
                className={`flex-1 py-2 text-center text-xs font-bold uppercase tracking-wider transition-all ${
                  activeTab === 'register' ? 'text-[#10b981] border-b-2 border-[#10b981]' : 'text-gray-400'
                }`}
              >
                Register
              </button>
              <button
                onClick={() => { setActiveTab('owner_login'); setErrorMessage(''); }}
                className={`flex-1 py-2 text-center text-xs font-bold uppercase tracking-wider transition-all ${
                  activeTab === 'owner_login' ? 'text-[#10b981] border-b-2 border-[#10b981]' : 'text-gray-400'
                }`}
              >
                Owner Login
              </button>
              <button
                onClick={() => { setActiveTab('admin_login'); setErrorMessage(''); }}
                className={`flex-1 py-2 text-center text-xs font-bold uppercase tracking-wider transition-all ${
                  activeTab === 'admin_login' ? 'text-[#10b981] border-b-2 border-[#10b981]' : 'text-gray-400'
                }`}
              >
                Admin Login
              </button>
            </div>

            {/* Tab 1: REGISTER NEW RESTAURANT */}
            {activeTab === 'register' && (
              <form onSubmit={handleRegister} className="flex flex-col gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase mb-2">Restaurant Name</label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={regData.name}
                      onChange={(e) => setRegData({ ...regData, name: e.target.value })}
                      placeholder="e.g. Olive Garden"
                      className="w-full p-3 pl-10 rounded-xl bg-[#0d1424] border border-theme-border/50 text-sm focus:outline-none focus:border-[#10b981]"
                    />
                    <Building size={14} className="absolute left-3.5 top-4 opacity-50" />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase mb-2">Owner Email</label>
                  <div className="relative">
                    <input
                      type="email"
                      required
                      value={regData.email}
                      onChange={(e) => setRegData({ ...regData, email: e.target.value })}
                      placeholder="owner@olivegarden.com"
                      className="w-full p-3 pl-10 rounded-xl bg-[#0d1424] border border-theme-border/50 text-sm focus:outline-none focus:border-[#10b981]"
                    />
                    <Mail size={14} className="absolute left-3.5 top-4 opacity-50" />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase mb-2">Google Place ID</label>
                  <input
                    type="text"
                    required
                    value={regData.placeId}
                    onChange={(e) => setRegData({ ...regData, placeId: e.target.value })}
                    placeholder="e.g. ChIJN1t_tDeuEmsRUsoyG83VSY4"
                    className="w-full p-3 rounded-xl bg-[#0d1424] border border-theme-border/50 text-sm focus:outline-none focus:border-[#10b981] font-mono"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full mt-4 py-3.5 rounded-xl font-bold bg-[#10b981] text-black hover:opacity-90 transition-all text-xs tracking-wider uppercase flex items-center justify-center gap-1.5 active-scale"
                >
                  <UserPlus size={14} />
                  Register a New Business
                </button>
              </form>
            )}

            {/* Tab 2: OWNER LOGIN */}
            {activeTab === 'owner_login' && (
              <form onSubmit={handleOwnerLogin} className="flex flex-col gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase mb-2">Owner Email</label>
                  <div className="relative">
                    <input
                      type="email"
                      required
                      value={ownerCreds.email}
                      onChange={(e) => setOwnerCreds({ ...ownerCreds, email: e.target.value })}
                      placeholder="owner@spicegarden.com"
                      className="w-full p-3 pl-10 rounded-xl bg-[#0d1424] border border-theme-border/50 text-sm focus:outline-none focus:border-[#10b981]"
                    />
                    <Mail size={14} className="absolute left-3.5 top-4 opacity-50" />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase mb-2">Password</label>
                  <div className="relative">
                    <input
                      type="password"
                      required
                      value={ownerCreds.password}
                      onChange={(e) => setOwnerCreds({ ...ownerCreds, password: e.target.value })}
                      placeholder="••••••••"
                      className="w-full p-3 pl-10 rounded-xl bg-[#0d1424] border border-theme-border/50 text-sm focus:outline-none focus:border-[#10b981]"
                    />
                    <Key size={14} className="absolute left-3.5 top-4 opacity-50" />
                  </div>
                </div>

                {errorMessage && (
                  <p className="text-[10px] text-red-500 font-bold bg-red-500/10 p-2 rounded-lg border border-red-500/20 text-center">
                    {errorMessage}
                  </p>
                )}

                <div className="p-3 bg-[#0c1222] border border-theme-border/30 rounded-xl text-[10px] text-gray-400 flex gap-2">
                  <Info size={14} className="text-[#10b981] shrink-0" />
                  <span>Demo: Use <strong>owner@spicegarden.com</strong> / <strong>owner2026</strong></span>
                </div>

                <button
                  type="submit"
                  className="w-full mt-2 py-3.5 rounded-xl font-bold bg-[#10b981] text-black hover:opacity-90 transition-all text-xs tracking-wider uppercase active-scale"
                >
                  Enter Owner Console
                </button>
              </form>
            )}

            {/* Tab 3: ADMIN LOGIN */}
            {activeTab === 'admin_login' && (
              <form onSubmit={handleAdminLogin} className="flex flex-col gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase mb-2">Admin Email</label>
                  <div className="relative">
                    <input
                      type="email"
                      required
                      value={adminCreds.email}
                      onChange={(e) => setAdminCreds({ ...adminCreds, email: e.target.value })}
                      placeholder="admin@graphura.com"
                      className="w-full p-3 pl-10 rounded-xl bg-[#0d1424] border border-theme-border/50 text-sm focus:outline-none focus:border-[#10b981]"
                    />
                    <Mail size={14} className="absolute left-3.5 top-4 opacity-50" />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase mb-2">Password</label>
                  <div className="relative">
                    <input
                      type="password"
                      required
                      value={adminCreds.password}
                      onChange={(e) => setAdminCreds({ ...adminCreds, password: e.target.value })}
                      placeholder="••••••••"
                      className="w-full p-3 pl-10 rounded-xl bg-[#0d1424] border border-theme-border/50 text-sm focus:outline-none focus:border-[#10b981]"
                    />
                    <Key size={14} className="absolute left-3.5 top-4 opacity-50" />
                  </div>
                </div>

                {errorMessage && (
                  <p className="text-[10px] text-red-500 font-bold bg-red-500/10 p-2 rounded-lg border border-red-500/20 text-center">
                    {errorMessage}
                  </p>
                )}

                <div className="p-3 bg-[#0c1222] border border-theme-border/30 rounded-xl text-[10px] text-gray-400 flex gap-2">
                  <Info size={14} className="text-[#10b981] shrink-0" />
                  <span>Demo: Use <strong>admin@graphura.com</strong> / <strong>admin2026</strong></span>
                </div>

                <button
                  type="submit"
                  className="w-full mt-2 py-3.5 rounded-xl font-bold bg-[#10b981] text-black hover:opacity-90 transition-all text-xs tracking-wider uppercase active-scale"
                >
                  Enter Admin Console
                </button>
              </form>
            )}

          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="border-t border-theme-border bg-[#030712] py-8 text-center text-xs opacity-50">
        GenReview AI • Graphura DSA Reputation Suite
      </footer>
    </div>
  );
}
