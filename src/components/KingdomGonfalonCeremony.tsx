import React, { useState, useEffect } from 'react';
import { Kingdom } from '../types';
import { sound } from '../lib/sound';
import { Flame, Shield, Swords, Crown, Trophy, Sparkles, ChevronRight } from 'lucide-react';

interface KingdomGonfalonCeremonyProps {
  kingdom: Kingdom;
  onComplete?: () => void;
  subtitle?: string;
  autoAdvanceMs?: number; // Optional auto advance time in ms
  showNextButton?: boolean;
}

export const KingdomGonfalonCeremony: React.FC<KingdomGonfalonCeremonyProps> = ({
  kingdom,
  onComplete,
  subtitle = 'ROYAL PROCLAMATION OF THE REALM',
  autoAdvanceMs = 3800,
  showNextButton = true,
}) => {
  const [unfurlStage, setUnfurlStage] = useState<'rolling' | 'settled' | 'raising'>('rolling');

  // Trigger sound effects and animation timing on mount
  useEffect(() => {
    // Play realistic ceremonial sounds
    sound.playCastleWind();
    sound.playTorchFlames();
    sound.playTrumpetFanfare();
    sound.playScrollOpen();

    const timer1 = setTimeout(() => {
      sound.playWarDrum();
      setUnfurlStage('settled');
    }, 900);

    let autoTimer: NodeJS.Timeout | null = null;
    if (autoAdvanceMs > 0 && onComplete) {
      autoTimer = setTimeout(() => {
        handleProceed();
      }, autoAdvanceMs);
    }

    return () => {
      clearTimeout(timer1);
      if (autoTimer) clearTimeout(autoTimer);
    };
  }, [kingdom.id, autoAdvanceMs]);

  const handleProceed = () => {
    if (unfurlStage === 'raising') return;
    setUnfurlStage('raising');
    sound.playScrollOpen();
    setTimeout(() => {
      if (onComplete) onComplete();
    }, 600);
  };

  // Determine main banner color palette
  const bannerBgColor = kingdom.bannerColor || '#8b0000'; // Default royal crimson

  return (
    <div className="relative w-full h-screen bg-[#080605]/75 backdrop-blur-md text-[#e0d6c5] overflow-hidden flex flex-col items-center justify-between font-serif select-none z-50 py-6 px-4">
      {/* Background Castle Environment with Torchlight & Light Rays */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Subtle Vignette Layer */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_transparent_20%,_#080605_85%)]" />

        {/* Sunlight Ray Beam through Gothic Window */}
        <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-[600px] h-[900px] bg-gradient-to-b from-amber-200/10 via-amber-500/5 to-transparent blur-2xl transform -rotate-12 pointer-events-none" />

        {/* Left Wall Torch */}
        <div className="absolute top-1/4 left-6 sm:left-16 flex flex-col items-center z-10 hidden sm:flex">
          <div className="relative">
            <Flame className="w-8 h-8 text-amber-500 animate-torch filter drop-shadow-[0_0_20px_rgba(245,158,11,0.9)]" />
            <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-12 h-12 bg-amber-500/20 rounded-full blur-md animate-pulse" />
          </div>
          <div className="w-2 h-12 bg-gradient-to-b from-stone-700 to-stone-900 border-x border-amber-900/40 rounded-b shadow-lg" />
          <div className="w-8 h-4 bg-[#2b1f18] border border-[#574332] rounded-t-sm" />
        </div>

        {/* Right Wall Torch */}
        <div className="absolute top-1/4 right-6 sm:right-16 flex flex-col items-center z-10 hidden sm:flex">
          <div className="relative">
            <Flame className="w-8 h-8 text-amber-500 animate-torch filter drop-shadow-[0_0_20px_rgba(245,158,11,0.9)]" />
            <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-12 h-12 bg-amber-500/20 rounded-full blur-md animate-pulse" />
          </div>
          <div className="w-2 h-12 bg-gradient-to-b from-stone-700 to-stone-900 border-x border-amber-900/40 rounded-b shadow-lg" />
          <div className="w-8 h-4 bg-[#2b1f18] border border-[#574332] rounded-t-sm" />
        </div>

        {/* Weathered Stone Pillars Frame */}
        <div className="absolute inset-y-0 left-0 w-12 sm:w-24 bg-gradient-to-r from-[#120d0a] via-[#1a1410] to-transparent border-r border-[#3d2a1d]/30 opacity-80" />
        <div className="absolute inset-y-0 right-0 w-12 sm:w-24 bg-gradient-to-l from-[#120d0a] via-[#1a1410] to-transparent border-l border-[#3d2a1d]/30 opacity-80" />
      </div>

      {/* Header Announcement Bar */}
      <div className="relative z-20 text-center mt-2 animate-proclamation-rise">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#1c1612]/90 border border-[#8b7355]/60 shadow-[0_4px_20px_rgba(0,0,0,0.8)] backdrop-blur">
          <Crown className="w-4 h-4 text-amber-400 animate-bounce" />
          <span className="text-xs sm:text-sm font-mono tracking-[0.25em] text-[#d4af37] uppercase font-bold">
            {subtitle}
          </span>
          <Crown className="w-4 h-4 text-amber-400 animate-bounce" />
        </div>
      </div>

      {/* CENTRAL GONFALON BANNER ASSEMBLY */}
      <div className="relative z-30 flex flex-col items-center justify-start my-auto w-full max-w-lg px-2">
        {/* 1. Forged Iron Wall Brackets & Oak Wooden Beam */}
        <div className="relative z-40 w-full max-w-[360px] sm:max-w-[440px] flex items-center justify-center">
          {/* Forged Iron Bracket Left */}
          <div className="absolute -left-6 -top-2 w-8 h-10 bg-gradient-to-b from-[#2a221b] to-[#140f0c] border border-[#574332] rounded-md shadow-2xl flex flex-col justify-around p-1">
            <div className="w-1.5 h-1.5 rounded-full bg-amber-900/80 border border-black" />
            <div className="w-1.5 h-1.5 rounded-full bg-amber-900/80 border border-black" />
          </div>

          {/* Forged Iron Bracket Right */}
          <div className="absolute -right-6 -top-2 w-8 h-10 bg-gradient-to-b from-[#2a221b] to-[#140f0c] border border-[#574332] rounded-md shadow-2xl flex flex-col justify-around p-1">
            <div className="w-1.5 h-1.5 rounded-full bg-amber-900/80 border border-black" />
            <div className="w-1.5 h-1.5 rounded-full bg-amber-900/80 border border-black" />
          </div>

          {/* Carved Oak Wooden Crossbar */}
          <div className="relative w-full h-7 sm:h-9 bg-oak-wood border-t border-amber-200/20 border-b border-black rounded-lg shadow-[0_10px_25px_rgba(0,0,0,0.9)] flex items-center justify-between px-2">
            {/* Brass Finial Left */}
            <div className="absolute -left-4 w-6 h-8 bg-gradient-to-r from-[#d4af37] via-[#ffd700] to-[#8b7355] border border-[#3d2a1d] rounded-l-full shadow-lg flex items-center justify-center">
              <div className="w-2 h-2 rounded-full bg-[#1c1612]" />
            </div>

            {/* Leather Suspension Straps */}
            <div className="w-full flex justify-around px-8">
              <div className="w-5 h-8 bg-[#3a2211] border-x border-[#1a0e07] shadow-inner" />
              <div className="w-5 h-8 bg-[#3a2211] border-x border-[#1a0e07] shadow-inner" />
              <div className="w-5 h-8 bg-[#3a2211] border-x border-[#1a0e07] shadow-inner" />
            </div>

            {/* Brass Finial Right */}
            <div className="absolute -right-4 w-6 h-8 bg-gradient-to-l from-[#d4af37] via-[#ffd700] to-[#8b7355] border border-[#3d2a1d] rounded-r-full shadow-lg flex items-center justify-center">
              <div className="w-2 h-2 rounded-full bg-[#1c1612]" />
            </div>

            {/* Hanging Golden Tassels Left & Right */}
            <div className="absolute -left-2 top-8 flex flex-col items-center animate-tassel-dangle">
              <div className="w-1.5 h-10 bg-[#d4af37]" />
              <div className="w-4 h-6 bg-gradient-to-b from-[#ffd700] to-[#8b7355] rounded-b-md shadow-md" />
            </div>
            <div className="absolute -right-2 top-8 flex flex-col items-center animate-tassel-dangle">
              <div className="w-1.5 h-10 bg-[#d4af37]" />
              <div className="w-4 h-6 bg-gradient-to-b from-[#ffd700] to-[#8b7355] rounded-b-md shadow-md" />
            </div>
          </div>
        </div>

        {/* 2. Vertical Gonfalon Banner Container */}
        <div
          className={`relative w-full max-w-[320px] sm:max-w-[380px] transition-all duration-700 ease-out origin-top ${
            unfurlStage === 'rolling'
              ? 'scale-y-0 opacity-20'
              : unfurlStage === 'raising'
              ? 'scale-y-0 opacity-0'
              : 'scale-y-100 opacity-100 animate-gonfalon-sway'
          }`}
        >
          {/* Main Velvet Banner Canvas */}
          <div
            style={{ backgroundColor: bannerBgColor }}
            className="relative w-full border-x-4 border-amber-500/70 shadow-[0_20px_60px_rgba(0,0,0,0.95)] flex flex-col items-center pt-8 pb-12 px-6 overflow-hidden min-h-[460px] sm:min-h-[520px]"
          >
            {/* Realistic Handcrafted Fabric Woven Texture & Shadows */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(0,0,0,0.45)_0%,rgba(255,255,255,0.12)_15%,rgba(0,0,0,0.2)_35%,rgba(255,255,255,0.15)_50%,rgba(0,0,0,0.25)_75%,rgba(0,0,0,0.6)_100%)] pointer-events-none" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_transparent_30%,_rgba(0,0,0,0.6)_100%)] pointer-events-none" />

            {/* Embroidered Gold Border Trim */}
            <div className="absolute inset-2 border-2 border-amber-300/40 rounded-sm pointer-events-none" />
            <div className="absolute top-4 left-4 w-4 h-4 border-t-2 border-l-2 border-[#ffd700]" />
            <div className="absolute top-4 right-4 w-4 h-4 border-t-2 border-r-2 border-[#ffd700]" />

            {/* Heraldic Shield / Coat of Arms */}
            <div className="relative mb-4 transform hover:scale-105 transition-transform duration-300 z-10">
              {/* Outer Golden Laurel Frame */}
              <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-full bg-gradient-to-b from-[#ffd700] via-[#b8860b] to-[#3d2a1d] p-1.5 shadow-[0_10px_30px_rgba(0,0,0,0.8)] flex items-center justify-center relative">
                {/* Inner Shield Mantling */}
                <div className="w-full h-full rounded-full bg-gradient-to-b from-[#1c1612] via-[#2a1e14] to-[#0f0b08] border-2 border-[#f3e5ab] flex flex-col items-center justify-center relative overflow-hidden shadow-inner">
                  {/* Subtle Sparkle Shine */}
                  <div className="absolute -top-10 -left-10 w-24 h-24 bg-white/15 rounded-full blur-lg" />
                  
                  {/* Kingdom Heraldic Banner Symbol */}
                  <div className="text-4xl sm:text-5xl filter drop-shadow-[0_4px_8px_rgba(0,0,0,0.9)]">
                    {kingdom.bannerSymbol || '🏰'}
                  </div>
                  
                  <div className="mt-1 flex items-center gap-1">
                    <Shield className="w-4 h-4 text-amber-400 filter drop-shadow" />
                    {kingdom.element && (
                      <span className="text-[10px] font-black uppercase text-[#ffd700] tracking-widest font-mono">
                        {kingdom.element}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Kingdom Name (Calligraphy & Engraved Serif) */}
            <div className="text-center z-10 w-full mb-1">
              <h2 className="text-2xl sm:text-3xl font-black font-cinzel text-transparent bg-clip-text bg-gradient-to-b from-[#ffffff] via-[#ffd700] to-[#d4af37] tracking-wider uppercase drop-shadow-[0_4px_12px_rgba(0,0,0,0.9)] px-2 leading-tight">
                {kingdom.name}
              </h2>
              {kingdom.primaryColors && (
                <p className="text-[11px] font-mono font-bold text-amber-200/90 tracking-wide mt-0.5">
                  Colors: {kingdom.primaryColors}
                </p>
              )}
            </div>

            {/* Decorative Gold Ribbon Divider */}
            <div className="w-32 h-0.5 bg-gradient-to-r from-transparent via-[#ffd700] to-transparent my-1.5 z-10" />

            {/* Coat of Arms Badge */}
            {kingdom.coatOfArms && (
              <div className="mb-2 z-10 px-3 py-1 bg-[#120c08]/80 border border-[#ffd700]/50 rounded-full text-center shadow-md">
                <span className="text-[10px] sm:text-xs font-serif italic text-[#f3e5ab]">
                  ⚜️ {kingdom.coatOfArms}
                </span>
              </div>
            )}

            {/* Pinned Parchment Scroll Ribbon (Identity & Roster Stats) */}
            <div className="z-10 w-full max-w-[280px] sm:max-w-[320px] p-3 bg-parchment border border-[#8b7355] rounded-md shadow-lg text-center relative text-[#2b1f1d] space-y-2">
              {kingdom.identity && (
                <p className="text-[11px] leading-tight font-serif italic text-[#3a281c] border-b border-[#8b7355]/40 pb-2">
                  "{kingdom.identity}"
                </p>
              )}

              <div className="flex items-center justify-center gap-3 text-xs sm:text-sm font-bold font-serif pt-0.5">
                <div className="flex items-center gap-1 text-[#8b0000]">
                  <Trophy className="w-4 h-4 text-amber-600" />
                  <span>{kingdom.score} PTS</span>
                </div>
                <span className="text-[#8b7355]">|</span>
                <div className="flex items-center gap-1 text-[#1c1612]">
                  <Shield className="w-4 h-4 text-stone-700" />
                  <span>{kingdom.members.length} Warriors</span>
                </div>
              </div>

              {/* Pinned Wax Seal Accent */}
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-6 h-6 rounded-full bg-red-800 border border-amber-400 shadow flex items-center justify-center text-[10px] text-amber-200">
                ★
              </div>
            </div>

            {/* Gonfalon Triple Swallowtail Bottom Cutouts & Fringe */}
            <div className="absolute -bottom-10 inset-x-0 h-12 flex justify-between pointer-events-none">
              {/* Swallowtail Point 1 */}
              <div
                style={{ backgroundColor: bannerBgColor }}
                className="w-1/3 h-full border-b-4 border-l-4 border-amber-500/70 transform origin-top-left -skew-y-12 shadow-xl"
              />
              {/* Swallowtail Point 2 */}
              <div
                style={{ backgroundColor: bannerBgColor }}
                className="w-1/3 h-full border-b-4 border-amber-500/70 shadow-xl scale-y-110"
              />
              {/* Swallowtail Point 3 */}
              <div
                style={{ backgroundColor: bannerBgColor }}
                className="w-1/3 h-full border-b-4 border-r-4 border-amber-500/70 transform origin-top-right skew-y-12 shadow-xl"
              />
            </div>

            {/* Gold Bullion Fringe */}
            <div className="absolute -bottom-14 inset-x-0 h-5 flex justify-around pointer-events-none overflow-hidden">
              {Array.from({ length: 18 }).map((_, i) => (
                <div key={i} className="w-1.5 h-5 bg-gradient-to-b from-[#ffd700] via-[#d4af37] to-[#8b7355] rounded-b shadow-md" />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Footer Controls / Proceed Button */}
      {showNextButton && (
        <div className="relative z-40 mb-4 animate-proclamation-rise">
          <button
            onClick={handleProceed}
            className="group px-8 py-3.5 rounded-xl bg-gradient-to-r from-[#2a1c13] via-[#3d2a1d] to-[#2a1c13] border-2 border-[#d4af37] text-[#ffd700] font-black font-cinzel tracking-widest uppercase hover:scale-105 hover:bg-[#d4af37] hover:text-[#120c08] transition-all duration-300 shadow-[0_8px_30px_rgba(212,175,55,0.3)] flex items-center gap-3 cursor-pointer"
          >
            <span>Enter Tournament</span>
            <ChevronRight className="w-5 h-5 text-amber-400 group-hover:text-[#120c08] group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      )}
    </div>
  );
};
