'use client';

import React, { useEffect, useState } from 'react';
import { Sun, Moon } from 'lucide-react';

export default function ThemeSwitcher() {
  const [isLight, setIsLight] = useState(false);

  useEffect(() => {
    const root = document.documentElement;
    const hasLight = root.classList.contains('light');
    setIsLight(hasLight);
  }, []);

  const toggleTheme = () => {
    const root = document.documentElement;
    if (isLight) {
      root.classList.remove('light');
      setIsLight(false);
      localStorage.setItem('theme-preference', 'dark');
    } else {
      root.classList.add('light');
      setIsLight(true);
      localStorage.setItem('theme-preference', 'light');
    }
  };

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-xl bg-theme-accent/50 border border-theme-border text-theme-text hover:bg-theme-accent active:scale-95 transition-all flex items-center justify-center"
      aria-label="Toggle light/dark theme"
    >
      {isLight ? <Moon size={16} /> : <Sun size={16} className="text-yellow-400" />}
    </button>
  );
}
