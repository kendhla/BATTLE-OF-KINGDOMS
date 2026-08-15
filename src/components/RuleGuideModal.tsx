import React from 'react';
import { X, BookOpen, Crown, Shield, Trophy, Sparkles } from 'lucide-react';
import { ROLE_DEFINITIONS } from '../types';

interface RuleGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RuleGuideModal: React.FC<RuleGuideModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-[#0c0908]/85 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-300 font-cinzel">
      <div className="bg-[#1c1612] border-4 border-[#8b7355] rounded-3xl max-w-[1400px] w-full max-h-[85vh] overflow-y-auto p-6 sm:p-8 space-y-6 shadow-2xl relative text-[#f3e5ab]">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full bg-[#120e0c] hover:bg-[#2a1c13] border border-[#d4af37] text-[#d4af37] transition-all cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 border-b-2 border-[#8b7355]/40 pb-4">
          <BookOpen className="w-7 h-7 text-[#d4af37]" />
          <div>
            <h2 className="text-2xl font-black font-cinzel text-[#f3e5ab] text-gold-engraved">
              BATTLE OF KINGDOMS — ROYAL RULEBOOK
            </h2>
            <p className="text-xs text-[#e0d6c5] font-serif">
              Master medieval strategy, secret royal roles, and goblet conquest!
            </p>
          </div>
        </div>

        {/* Secret Roles Breakdown Table */}
        <div className="space-y-3 font-serif">
          <h3 className="text-base font-black font-cinzel text-[#f3e5ab] flex items-center gap-2">
            <Crown className="w-5 h-5 text-[#d4af37]" /> 13 Secret Roles & Points System
          </h3>
          <p className="text-xs text-[#e0d6c5] italic">
            Each kingdom conceals 13 secret roles. Additional students hold Citizen status (0 pts). Secret roles remain concealed in dark castles until captured and revealed!
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5 text-xs font-serif">
            {Object.values(ROLE_DEFINITIONS).map((role) => (
              <div
                key={role.type}
                className="p-3 rounded-2xl bg-[#120e0c] border border-[#8b7355]/60 space-y-1 flex flex-col justify-between"
              >
                <div className="flex items-center justify-between">
                  <span className="text-2xl">{role.icon}</span>
                  <span
                    className={`font-mono font-black px-2 py-0.5 rounded text-[11px] ${
                      role.points > 0
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-500'
                        : role.points < 0
                        ? 'bg-rose-950 text-rose-300 border border-rose-500'
                        : 'bg-[#1c1612] text-[#8b7355]'
                    }`}
                  >
                    {role.points > 0 ? `+${role.points}` : role.points} Pts
                  </span>
                </div>
                <div className="font-bold text-[#f3e5ab] font-cinzel">{role.title}</div>
                <div className="text-[10px] text-[#e0d6c5]/80 font-serif italic">{role.description}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Phase Flow Summary */}
        <div className="space-y-4 pt-4 border-t-2 border-[#8b7355]/40 text-xs font-serif">
          <h3 className="text-base font-black font-cinzel text-[#f3e5ab] flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#d4af37]" /> Royal Round Sequence
          </h3>

          <div className="space-y-3 text-[#e0d6c5]">
            <div className="p-3.5 rounded-2xl bg-[#120e0c] border border-[#8b7355]/50 space-y-1">
              <span className="font-bold text-[#d4af37] font-cinzel block">
                Phase 1 — Royal Goblet Challenge
              </span>
              <p className="font-merriweather text-xs">
                Ten magical golden goblets sit upon the King's banquet table. Active kingdoms select goblets in secret. The highest revealed goblet claims the right to select the question scroll!
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#120e0c] border border-[#8b7355]/50 space-y-1">
              <span className="font-bold text-[#d4af37] font-cinzel block">
                Phase 2 — Ancient Question Scroll
              </span>
              <p className="font-merriweather text-xs">
                An ancient parchment scroll unfolds with a question and a giant magical hourglass timer. Answering correctly unlocks the war room attack phase!
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#120e0c] border border-[#8b7355]/50 space-y-1">
              <span className="font-bold text-[#d4af37] font-cinzel block">
                Phase 3 — War Room Conquest & Treasure Chest Reveal
              </span>
              <p className="font-merriweather text-xs">
                Select an opposing castle and choose a secret member nameplate. Opening the royal treasure chest unlocks their secret figure, alters kingdom scores, and marks the member as captured.
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#120e0c] border border-[#8b7355]/50 space-y-1">
              <span className="font-bold text-[#d4af37] font-cinzel block">
                Phase 4 — Hall of Champions Standings
              </span>
              <p className="font-merriweather text-xs">
                Rankings update automatically in the Hall of Champions. The last surviving kingdom with active members claims the realm and is crowned 👑 Grand Ruler!
              </p>
            </div>
          </div>
        </div>

        <div className="pt-2 flex justify-end font-cinzel">
          <button
            onClick={onClose}
            className="px-8 py-3 bg-gradient-to-r from-[#d4af37] via-[#f3e5ab] to-[#d4af37] text-[#120e0c] font-black rounded-2xl text-xs uppercase tracking-widest transition-all hover:scale-105 cursor-pointer shadow-xl border border-[#f3e5ab]"
          >
            Return to Royal Tournament
          </button>
        </div>
      </div>
    </div>
  );
};
