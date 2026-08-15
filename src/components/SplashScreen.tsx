import React, { useState, useEffect } from 'react';
import { Sparkles, Shield, Swords, Database, CheckCircle2, RefreshCw, Flame, Wifi } from 'lucide-react';

interface SplashScreenProps {
  onComplete: () => void;
  syncStatus: string;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onComplete, syncStatus }) => {
  const [progress, setProgress] = useState(0);
  const [currentStepIdx, setCurrentStepIdx] = useState(0);

  const loadingSteps = [
    { label: 'Checking internet connection & server latency...', icon: '🌐' },
    { label: 'Connecting to Google Sheets Central Database...', icon: '📊' },
    { label: 'Loading Royal Application & Sound Engine Settings...', icon: '⚙️' },
    { label: 'Loading Teacher Accounts & Permissions...', icon: '🔐' },
    { label: 'Loading Classroom Question Bank Archives...', icon: '📜' },
    { label: 'Loading Saved Kingdom Battles & Standings...', icon: '🏰' },
    { label: 'Verifying Database Integrity & Sync Logs...', icon: '🛡️' },
    { label: 'Restoring Interrupted Synchronization States...', icon: '✨' },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          setTimeout(() => {
            onComplete();
          }, 600);
          return 100;
        }
        const next = prev + 2;
        const step = Math.min(
          loadingSteps.length - 1,
          Math.floor((next / 100) * loadingSteps.length)
        );
        setCurrentStepIdx(step);
        return next;
      });
    }, 40);

    return () => clearInterval(timer);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-50 text-[#f3e5ab] font-cinzel flex flex-col items-center justify-center p-6 overflow-hidden select-none">
      {/* Subtle overlay grid */}
      <div className="absolute inset-0 bg-[radial-gradient(#d4af37_1px,transparent_1px)] [background-size:24px_24px] opacity-10 pointer-events-none" />

      {/* Torches on sides */}
      <div className="absolute top-10 left-10 text-4xl animate-torch hidden sm:block">🔥</div>
      <div className="absolute top-10 right-10 text-4xl animate-torch hidden sm:block">🔥</div>
      <div className="absolute bottom-10 left-10 text-4xl animate-torch hidden sm:block">🔥</div>
      <div className="absolute bottom-10 right-10 text-4xl animate-torch hidden sm:block">🔥</div>

      {/* Main Content Card */}
      <div className="relative z-10 max-w-xl w-full text-center space-y-8 bg-[#16100c]/80 backdrop-blur-md border-4 border-[#8b7355] rounded-3xl p-8 sm:p-12 shadow-[0_0_80px_rgba(212,175,55,0.3)] animate-in zoom-in-95 duration-500">
        
        {/* Banners & Sword Header */}
        <div className="relative flex justify-center items-center">
          <div className="absolute -top-16 text-6xl animate-bounce filter drop-shadow-[0_0_15px_rgba(212,175,55,0.8)]">
            ⚔️
          </div>
          <div className="w-20 h-20 rounded-full bg-[#120e0c] border-2 border-[#d4af37] flex items-center justify-center text-4xl shadow-2xl mt-4">
            🏰
          </div>
        </div>

        {/* Title & Version */}
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-[#120e0c] border border-[#d4af37] text-xs font-black text-[#d4af37] uppercase tracking-widest shadow-lg">
            <Sparkles className="w-3.5 h-3.5 text-[#d4af37]" /> v2.5 Royal Edition
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-[#f3e5ab] tracking-wider uppercase text-gold-engraved italic">
            Battle of Kingdoms
          </h1>
          <p className="text-xs text-[#e0d6c5] font-serif italic max-w-md mx-auto">
            The Classroom Fantasy Medieval Strategy & Knowledge Arena
          </p>
        </div>

        {/* Progress Bar Container */}
        <div className="space-y-3 pt-2">
          <div className="flex justify-between items-center text-xs font-bold text-[#8b7355]">
            <span className="flex items-center gap-1.5 font-serif">
              <span>{loadingSteps[currentStepIdx].icon}</span>
              <span>{loadingSteps[currentStepIdx].label}</span>
            </span>
            <span className="font-mono text-[#d4af37] text-sm">{progress}%</span>
          </div>

          <div className="w-full h-4 bg-[#120e0c] rounded-full overflow-hidden border-2 border-[#8b7355] p-0.5 shadow-inner">
            <div
              className="h-full bg-gradient-to-r from-[#8b7355] via-[#d4af37] to-[#f3e5ab] rounded-full transition-all duration-200 shadow-[0_0_12px_rgba(212,175,55,0.8)]"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* System Diagnostics Checklist */}
        <div className="grid grid-cols-2 gap-2 text-[11px] font-serif text-left pt-2 border-t-2 border-[#8b7355]/30">
          <div className="flex items-center gap-2 p-2 bg-[#120e0c] rounded-xl border border-[#8b7355]/40">
            <Wifi className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-[#f3e5ab] font-bold">Network: Online</span>
          </div>
          <div className="flex items-center gap-2 p-2 bg-[#120e0c] rounded-xl border border-[#8b7355]/40">
            <Database className="w-3.5 h-3.5 text-[#d4af37]" />
            <span className="text-[#f3e5ab] font-bold">Sheets Sync: Active</span>
          </div>
          <div className="flex items-center gap-2 p-2 bg-[#120e0c] rounded-xl border border-[#8b7355]/40">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-[#f3e5ab] font-bold">Audio Engine: Ready</span>
          </div>
          <div className="flex items-center gap-2 p-2 bg-[#120e0c] rounded-xl border border-[#8b7355]/40">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span className="text-[#f3e5ab] font-bold">Question Bank: Loaded</span>
          </div>
        </div>

        {/* Manual Skip Button if user wants instant entry */}
        <button
          onClick={onComplete}
          className="w-full py-3.5 bg-gradient-to-r from-[#d4af37] via-[#f3e5ab] to-[#d4af37] text-[#120e0c] font-black text-xs uppercase tracking-widest rounded-2xl border-2 border-[#f3e5ab] shadow-2xl hover:scale-105 active:scale-95 transition-all cursor-pointer"
        >
          Enter Teacher Command Portal
        </button>
      </div>
    </div>
  );
};
