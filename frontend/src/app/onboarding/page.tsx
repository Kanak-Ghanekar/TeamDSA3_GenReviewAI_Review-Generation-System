'use client';

import React, { useState, useEffect } from 'react';
import { ArrowLeft, ArrowRight, Download, Info } from 'lucide-react';
import Link from 'next/link';

export default function OnboardingPage() {
  const [step, setStep] = useState<number>(1);
  const [hostUrl, setHostUrl] = useState('http://localhost:3000');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    businessName: '',
    category: 'restaurant',
    address: '',
    city: '',
    googlePlaceId: '',
    threshold: 4.0,
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setHostUrl(window.location.origin);
    }
  }, []);

  const [createdBusinessId, setCreatedBusinessId] = useState('test-restaurant');

  const handleNext = async () => {
    if (step === 3) {
      try {
        const res = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: 'Business Owner',
            email: formData.email.trim(),
            businessName: formData.businessName.trim(),
            category: formData.category,
            googlePlaceId: formData.googlePlaceId.trim()
          })
        });

        const data = await res.json();
        if (res.ok && data.success) {
          localStorage.setItem('owner-session', 'true');
          localStorage.setItem('owner-email', data.ownerEmail);
          localStorage.setItem('active-business-id', data.businessId);
          setCreatedBusinessId(data.businessId);
          setStep(4);
        } else {
          alert(data.error || 'Failed to register business.');
        }
      } catch (err) {
        console.error(err);
        alert('Network error during registration.');
      }
    } else {
      setStep((s) => s + 1);
    }
  };

  const handleBack = () => setStep((s) => s - 1);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleDownloadAssets = () => {
    const qrUrl = `${hostUrl}/r/${createdBusinessId}`;
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(qrUrl)}`;
    window.open(qrCodeUrl, '_blank');
  };

  return (
    <div className="min-h-screen bg-theme-bg text-theme-text flex items-center justify-center p-6 font-sans transition-colors duration-300">
      <div className="w-full max-w-lg premium-card rounded-3xl p-8 flex flex-col justify-between min-h-[550px]">
        {/* Header */}
        <div className="mb-6 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-1.5 text-xs text-theme-text/60 hover:text-theme-text transition-all">
            <ArrowLeft size={14} />
            Back Home
          </Link>
          <span className="text-xs font-bold text-theme-text/40">
            Step {step} of 4
          </span>
        </div>

        {/* Step Content */}
        <div className="flex-grow flex flex-col justify-center">
          {step === 1 && (
            <div className="animate-pop-in">
              <h2 className="text-2xl font-extrabold text-theme-text tracking-tight mb-2">Create Owner Account</h2>
              <p className="text-xs text-theme-text/60 mb-6">Enter your email and credentials to begin onboarding.</p>

              <div className="flex flex-col gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-theme-text/70 uppercase mb-2">Email Address</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="name@business.com"
                    required
                    className="w-full p-3 rounded-xl bg-theme-accent/30 border border-theme-border text-sm text-theme-text placeholder-theme-text/40 focus:outline-none focus:border-theme-primary"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-theme-text/70 uppercase mb-2">Password</label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="••••••••"
                    required
                    className="w-full p-3 rounded-xl bg-theme-accent/30 border border-theme-border text-sm text-theme-text placeholder-theme-text/40 focus:outline-none focus:border-theme-primary"
                  />
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="animate-pop-in">
              <h2 className="text-2xl font-extrabold text-theme-text tracking-tight mb-2">Business Profile</h2>
              <p className="text-xs text-theme-text/60 mb-6">Provide details about your primary business location.</p>

              <div className="flex flex-col gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-theme-text/70 uppercase mb-2">Business Name</label>
                  <input
                    type="text"
                    name="businessName"
                    value={formData.businessName}
                    onChange={handleInputChange}
                    placeholder="e.g. Spice Garden Bistro"
                    required
                    className="w-full p-3 rounded-xl bg-theme-accent/30 border border-theme-border text-sm text-theme-text placeholder-theme-text/40 focus:outline-none focus:border-theme-primary"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-theme-text/70 uppercase mb-2">Category</label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      className="w-full p-3 rounded-xl bg-theme-accent/30 border border-theme-border text-sm text-theme-text focus:outline-none focus:border-theme-primary"
                    >
                      <option value="restaurant">Restaurant</option>
                      <option value="tyre_shop">Tyre & Auto Shop</option>
                      <option value="salon_retail">Salon & Retail</option>
                      <option value="hotel">Boutique Hotel</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-theme-text/70 uppercase mb-2">City</label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      placeholder="e.g. New Delhi"
                      required
                      className="w-full p-3 rounded-xl bg-theme-accent/30 border border-theme-border text-sm text-theme-text placeholder-theme-text/40 focus:outline-none focus:border-theme-primary"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="animate-pop-in">
              <h2 className="text-2xl font-extrabold text-theme-text tracking-tight mb-2">Google Place ID Settings</h2>
              <p className="text-xs text-theme-text/60 mb-6">Enter your official Google Place ID to configure redirects.</p>

              <div className="flex flex-col gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-theme-text/70 uppercase mb-2">Google Place ID</label>
                  <input
                    type="text"
                    name="googlePlaceId"
                    value={formData.googlePlaceId}
                    onChange={handleInputChange}
                    placeholder="e.g. ChIJN1t_tDeuEmsRUsoyG83VSY4"
                    required
                    className="w-full p-3 rounded-xl bg-theme-accent/30 border border-theme-border text-sm text-theme-text placeholder-theme-text/40 focus:outline-none focus:border-theme-primary font-mono"
                  />
                </div>
                <div className="p-3.5 bg-theme-accent/30 rounded-xl border border-theme-border text-xs text-theme-text/60 flex gap-2.5 leading-relaxed">
                  <Info size={16} className="text-theme-primary shrink-0 mt-0.5" />
                  <div>
                    Your Place ID connects customers directly to your Google review page. You can find it using Google's free Place ID Finder Tool online.
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="flex flex-col items-center text-center animate-pop-in">
              <h2 className="text-2xl font-extrabold text-theme-text tracking-tight mb-2">Setup Complete!</h2>
              <p className="text-xs text-theme-text/60 mb-6">
                Your QR review asset is ready to download and place at your checkout counter.
              </p>

              <div className="p-4 bg-white rounded-xl mb-6 shadow-md flex items-center justify-center border border-slate-200">
                <img 
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(`${hostUrl}/r/${createdBusinessId}`)}`} 
                  alt="Scannable Review QR Code" 
                  className="w-36 h-36"
                />
              </div>

              <div className="w-full flex gap-3 max-w-xs justify-center mb-4">
                <button
                  onClick={handleDownloadAssets}
                  className="py-3 px-5 rounded-xl font-bold bg-theme-card text-theme-text border border-theme-border hover:bg-theme-accent/50 text-xs flex items-center gap-1.5 transition-all"
                >
                  <Download size={14} />
                  Download Assets
                </button>
                <Link
                  href="/dashboard"
                  className="py-3 px-5 rounded-xl font-bold bg-theme-primary text-white hover:opacity-90 text-xs flex items-center gap-1.5 transition-all active-scale"
                >
                  Dashboard
                  <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Footer Navigation Buttons */}
        {step < 4 && (
          <div className="flex justify-between items-center mt-8 pt-4 border-t border-theme-border">
            {step > 1 ? (
              <button
                onClick={handleBack}
                className="py-2.5 px-4 rounded-xl font-bold text-xs text-theme-text/50 hover:text-theme-text transition-all"
              >
                Back
              </button>
            ) : (
              <div />
            )}
            <button
              onClick={handleNext}
              className="py-3 px-6 rounded-xl font-bold text-xs bg-theme-primary text-white hover:opacity-92 flex items-center gap-2 transform active:scale-95 shadow-premium transition-all"
            >
              Continue
              <ArrowRight size={16} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
