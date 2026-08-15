import React, { useEffect } from 'react';
import { Kingdom, RoundHistoryItem, ROLE_DEFINITIONS } from '../types';
import { sound } from '../lib/sound';
import confetti from 'canvas-confetti';
import { Trophy, Crown, Sparkles, RotateCcw, Award, Shield, Users } from 'lucide-react';
import { RoyalCrownIcon, KnightShieldIcon, GoldenChaliceIcon, MedievalBooksIcon } from './MedievalIcons';

interface VictoryScreenProps {
  championKingdom: Kingdom;
  allKingdoms: Kingdom[];
  roundHistory: RoundHistoryItem[];
  onRestartGame: () => void;
}

export const VictoryScreen: React.FC<VictoryScreenProps> = ({
  championKingdom,
  allKingdoms,
  roundHistory,
  onRestartGame,
}) => {
  // Trigger victory effects on mount
  useEffect(() => {
    sound.playVictoryFanfare();

    // Trigger canvas confetti bursts
    const duration = 3.5 * 1000;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 5,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
      });
      confetti({
        particleCount: 5,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };
    frame();
  }, []);

  const sortedKingdoms = [...allKingdoms].sort((a, b) => b.score - a.score);

  // Compute Battle Stats
  const totalRounds = roundHistory.length;
  let totalAttacks = 0;
  let kingsCaptured = 0;
  let jokersCaptured = 0;

  roundHistory.forEach((rh) => {
    if (rh.attackResult) {
      totalAttacks++;
      if (rh.attackResult.role === 'king') kingsCaptured++;
      if (rh.attackResult.role === 'joker') jokersCaptured++;
    }
  });

  return (
    <div className="max-w-5xl mx-auto p-4 space-y-8 animate-in fade-in zoom-in duration-700 font-cinzel">
      {/* Grand Champion Hero Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-[#5c4033]/90 via-[#3d2a1d]/90 to-[#120e0c]/90 backdrop-blur-md border-4 border-[#d4af37] p-8 sm:p-12 text-center shadow-[0_0_60px_rgba(212,175,55,0.6)] space-y-4">
        {/* Torches on top corners */}
        <div className="absolute top-4 left-4 text-3xl animate-torch">🔥</div>
        <div className="absolute top-4 right-4 text-3xl animate-torch">🔥</div>

        <div className="pt-6 space-y-3">
          <div className="inline-flex items-center gap-2 px-5 py-1.5 rounded-full bg-[#120e0c] text-[#f3e5ab] text-xs font-black uppercase tracking-widest shadow-2xl border border-[#d4af37]">
            <RoyalCrownIcon className="w-5 h-5" /> Crowned Grand Ruler of the Realm
          </div>

          <h1 className="text-4xl sm:text-6xl font-black text-[#f3e5ab] text-gold-engraved drop-shadow-[0_4px_16px_rgba(0,0,0,0.9)]">
            {championKingdom.name}
          </h1>

          <p className="text-[#e0d6c5] text-sm sm:text-base font-serif italic max-w-lg mx-auto">
            Victorious in battle through strategy, royal knowledge, and territorial conquest!
          </p>
        </div>

        {/* Score & Emblem */}
        <div className="pt-2 flex justify-center items-center gap-4">
          <div className="p-5 rounded-2xl bg-[#120e0c]/90 border-2 border-[#d4af37] text-center shadow-2xl">
            <span className="text-xs font-bold text-[#d4af37] uppercase tracking-widest block font-serif">
              Grand Final Score
            </span>
            <span className="text-4xl sm:text-5xl font-black font-mono text-[#f3e5ab]">
              {championKingdom.score} Pts
            </span>
          </div>
        </div>
      </div>

      {/* Royal Hall of Honor: Special Badges & Battle Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Special Royal Title Badges */}
        <div className="bg-[#1c1612]/90 backdrop-blur-md border-4 border-[#8b7355] rounded-3xl p-6 shadow-2xl space-y-4">
          <h3 className="text-lg font-black text-[#f3e5ab] font-cinzel flex items-center gap-2 border-b-2 border-[#8b7355]/30 pb-3">
            <GoldenChaliceIcon className="w-6 h-6" /> Royal Honors & Titles
          </h3>

          <div className="space-y-3 font-serif text-xs">
            <div className="p-3 bg-[#120e0c] rounded-2xl border border-[#d4af37] flex items-center gap-3">
              <RoyalCrownIcon className="w-8 h-8 shrink-0" />
              <div>
                <span className="font-bold text-[#f3e5ab] font-cinzel block">Grand Ruler of the Realm</span>
                <span className="text-[#8b7355]">{championKingdom.name}</span>
              </div>
            </div>

            <div className="p-3 bg-[#120e0c] rounded-2xl border border-[#8b7355]/60 flex items-center gap-3">
              <KnightShieldIcon className="w-8 h-8 shrink-0" />
              <div>
                <span className="font-bold text-[#f3e5ab] font-cinzel block">Unbreakable Fortress</span>
                <span className="text-[#8b7355]">Fewest captured royal members</span>
              </div>
            </div>

            <div className="p-3 bg-[#120e0c] rounded-2xl border border-[#8b7355]/60 flex items-center gap-3">
              <MedievalBooksIcon className="w-8 h-8 shrink-0" />
              <div>
                <span className="font-bold text-[#f3e5ab] font-cinzel block">Scholars of Wisdom</span>
                <span className="text-[#8b7355]">Highest academic question accuracy</span>
              </div>
            </div>
          </div>
        </div>

        {/* Final Standings Summary */}
        <div className="bg-[#1c1612]/90 backdrop-blur-md border-4 border-[#8b7355] rounded-3xl p-6 shadow-2xl space-y-4">
          <h3 className="text-lg font-black text-[#f3e5ab] font-cinzel flex items-center gap-2 border-b-2 border-[#8b7355]/30 pb-3">
            <GoldenChaliceIcon className="w-6 h-6" /> Final Realm Standings
          </h3>

          <div className="space-y-2.5 font-serif">
            {sortedKingdoms.map((k, idx) => (
              <div
                key={k.id}
                className="flex items-center justify-between p-3 rounded-2xl bg-[#120e0c] border border-[#8b7355]/40 text-xs"
              >
                <div className="flex items-center gap-3">
                  <span className="font-black text-[#d4af37] font-mono w-5 text-sm">
                    #{idx + 1}
                  </span>
                  <span className="text-2xl">{k.bannerSymbol}</span>
                  <span className="font-black font-cinzel text-[#f3e5ab]">{k.name}</span>
                </div>
                <span className="font-mono font-black text-[#d4af37] text-sm">{k.score} Pts</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Export & Action Controls */}
      <div className="flex flex-wrap items-center justify-center gap-4 pt-4 font-cinzel">
        <button
          onClick={() => window.print()}
          className="px-6 py-3.5 bg-[#120e0c] hover:bg-[#2a1c13] text-[#f3e5ab] font-black text-xs uppercase tracking-widest rounded-2xl border-2 border-[#d4af37] shadow-xl flex items-center gap-2 cursor-pointer transition-all"
        >
          🖨️ Print Royal Certificate & Results
        </button>

        <button
          onClick={onRestartGame}
          className="px-10 py-5 bg-gradient-to-r from-[#d4af37] via-[#f3e5ab] to-[#d4af37] text-[#120e0c] font-black text-base tracking-widest uppercase rounded-2xl shadow-2xl border-2 border-[#f3e5ab] flex items-center gap-3 hover:scale-105 active:scale-95 transition-all cursor-pointer"
        >
          <RotateCcw className="w-6 h-6 text-[#120e0c]" />
          COMMENCE NEW KINGDOM WAR
        </button>
      </div>
    </div>
  );
};
