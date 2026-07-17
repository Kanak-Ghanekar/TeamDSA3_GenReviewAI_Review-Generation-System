'use client';

import React, { useState } from 'react';
import { LayoutDashboard, Settings, LogOut, ShieldAlert, Building, MessageSquare, BarChart3, ShieldCheck } from 'lucide-react';
import ThemeSwitcher from '../ThemeSwitcher';

interface BusinessItem {
  id: string;
  name: string;
  category: string;
}

interface DashboardShellProps {
  userEmail: string;
  userRole: 'owner' | 'graphura_admin';
  businesses: BusinessItem[];
  currentBusinessId: string;
  onBusinessChange: (id: string) => void;
  children: React.ReactNode;
  onLogout?: () => void;
  onAddLocation?: () => void;
}

export type OwnerTab = 'overview' | 'feedback' | 'compliance' | 'settings';

export default function DashboardShell({
  userEmail,
  userRole,
  businesses,
  currentBusinessId,
  onBusinessChange,
  children,
  onLogout,
  onAddLocation,
}: DashboardShellProps) {
  const [activeTab, setActiveTab] = useState<OwnerTab>('overview');

  const selectedBusiness = businesses.find((b) => b.id === currentBusinessId) || businesses[0] || { name: 'Loading...' };

  const renderChildren = () => {
    return React.Children.map(children, (child) => {
      if (!React.isValidElement(child)) return null;
      if (child.key === activeTab) return child;
      return null;
    });
  };

  return (
    <div className="min-h-screen bg-theme-bg text-theme-text flex flex-col md:flex-row transition-colors duration-300">
      
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-theme-card border-r border-theme-border flex flex-col justify-between shrink-0 p-4">
        <div>
          {/* Logo */}
          <div className="flex items-center gap-3 px-2 py-4 mb-6 border-b border-theme-border">
            <span className="text-2xl">📈</span>
            <span className="font-extrabold text-base tracking-tight">GenReview AI</span>
          </div>

          {/* Elevated Admin Indicator */}
          {userRole === 'graphura_admin' && (
            <div className="mb-4 mx-2 p-2 bg-theme-primary/10 border border-theme-primary/20 text-theme-primary rounded-lg flex items-center gap-2 text-xs font-semibold">
              <ShieldAlert size={14} />
              <span>Elevated Admin Logs</span>
            </div>
          )}

          {/* Location Dropdown Switcher / Static Display */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2 px-2">
              <label className="block text-[10px] font-bold opacity-50 uppercase tracking-widest">
                Active Location
              </label>
              {userRole !== 'owner' && onAddLocation && (
                <button
                  onClick={onAddLocation}
                  type="button"
                  className="text-[9px] font-extrabold text-theme-primary hover:opacity-85 uppercase tracking-wider bg-theme-primary/10 px-1.5 py-0.5 rounded transition-all active-scale"
                >
                  + Add
                </button>
              )}
            </div>
            <div className="relative">
              {userRole === 'owner' ? (
                <div className="w-full p-2.5 pl-8 bg-theme-accent/30 border border-theme-border rounded-xl text-xs text-theme-text font-semibold flex items-center gap-2">
                  <span>{selectedBusiness?.name || 'Active Location'}</span>
                </div>
              ) : (
                <select
                  value={currentBusinessId}
                  onChange={(e) => onBusinessChange(e.target.value)}
                  className="w-full p-2.5 pl-8 bg-theme-accent/30 border border-theme-border rounded-xl text-xs text-theme-text focus:outline-none focus:ring-1 focus:ring-theme-primary appearance-none font-medium"
                >
                  {businesses.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name}
                    </option>
                  ))}
                </select>
              )}
              <Building size={14} className="absolute left-2.5 top-3.5 opacity-60" />
            </div>
          </div>

          {/* Tab Navigation Links */}
          <nav className="flex flex-col gap-1">
            <button
              onClick={() => setActiveTab('overview')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
                activeTab === 'overview'
                  ? 'bg-theme-primary text-white shadow-premium'
                  : 'opacity-60 hover:opacity-100 hover:bg-theme-accent/50 text-theme-text'
              }`}
            >
              <LayoutDashboard size={16} />
              Overview Feed
            </button>
            <button
              onClick={() => setActiveTab('feedback')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
                activeTab === 'feedback'
                  ? 'bg-theme-primary text-white shadow-premium'
                  : 'opacity-60 hover:opacity-100 hover:bg-theme-accent/50 text-theme-text'
              }`}
            >
              <MessageSquare size={16} />
              Feedback Tickets
            </button>


            <button
              onClick={() => setActiveTab('compliance')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
                activeTab === 'compliance'
                  ? 'bg-theme-primary text-white shadow-premium'
                  : 'opacity-60 hover:opacity-100 hover:bg-theme-accent/50 text-theme-text'
              }`}
            >
              <ShieldCheck size={16} />
              Compliance Log
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
                activeTab === 'settings'
                  ? 'bg-theme-primary text-white shadow-premium'
                  : 'opacity-60 hover:opacity-100 hover:bg-theme-accent/50 text-theme-text'
              }`}
            >
              <Settings size={16} />
              Configurations
            </button>
          </nav>
        </div>

        {/* Footer Info */}
        <div className="pt-4 border-t border-theme-border mt-6 flex flex-col gap-2">
          <div className="px-2">
            <span className="block text-xs font-bold truncate">{userEmail}</span>
            <span className="block text-[10px] opacity-50 capitalize">{userRole} account</span>
          </div>
          <button
            onClick={onLogout || (() => alert('Logging out...'))}
            className="w-full flex items-center gap-3 px-3 py-2 text-red-500 hover:bg-red-500/10 rounded-lg text-xs font-bold transition-all mt-2 active-scale"
          >
            <LogOut size={14} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-6 md:p-10 overflow-y-auto">
        <header className="flex justify-between items-center mb-8 pb-4 border-b border-theme-border">
          <div>
            <h1 className="text-2xl font-bold tracking-tight capitalize">
              {activeTab === 'overview' && 'Dashboard Overview'}
              {activeTab === 'feedback' && 'Customer Feedback Management'}
              {activeTab === 'compliance' && 'Compliance Ledger'}
              {activeTab === 'settings' && 'Location Configuration'}
            </h1>
            <p className="text-xs opacity-60 mt-1">
              Currently viewing logs for <span className="text-theme-primary font-bold">{selectedBusiness?.name || 'Loading...'}</span>
            </p>
          </div>
          <div className="flex items-center gap-3">
            <ThemeSwitcher />
          </div>
        </header>

        {renderChildren()}
      </main>
    </div>
  );
}
