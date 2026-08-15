import React from 'react';
import { Kingdom } from '../types';
import { Trophy, Crown, Shield, Users, ArrowRight, Skull, AlertCircle } from 'lucide-react';

interface LeaderboardPhaseProps {
  kingdoms: Kingdom[];
  roundNumber: number;
  onNextRound: () => void;
}

export const LeaderboardPhase: React.FC<LeaderboardPhaseProps> = ({
  kingdoms,
  roundNumber,
  onNextRound,
}) => {
  // Sort kingdoms by score descending
  const sortedKingdoms = [...kingdoms].sort((a, b) => b.score - a.score);

  return (
    <div className="max-w-5xl mx-auto p-4 space-y-6 animate-in fade-in duration-500 font-cinzel">
      {/* Header Banner */}
      <div className="text-center space-y-3 bg-[#1c1612]/80 backdrop-blur-md border-4 border-[#8b7355] rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute top-4 left-4 text-2xl animate-torch">🔥</div>
        <div className="absolute top-4 right-4 text-2xl animate-torch">🔥</div>

        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#120e0c]/90 border border-[#d4af37] text-[#f3e5ab] text-xs font-black uppercase tracking-widest shadow-xl">
          <Trophy className="w-4 h-4 text-[#d4af37]" /> Phase 4: Hall of Champions Standings
        </div>

        <h2 className="text-2xl sm:text-4xl font-black text-[#f3e5ab] uppercase tracking-wider text-gold-engraved">
          Official Kingdom Rankings — Round {roundNumber}
        </h2>
        <p className="text-xs text-[#e0d6c5] max-w-xl mx-auto font-merriweather italic">
          The kingdom conquest continues! Review scores and captured royal figures before entering the next Royal Goblet Challenge.
        </p>
      </div>

      {/* Leaderboard Table / Cards */}
      <div className="bg-[#1c1612]/80 backdrop-blur-md border-4 border-[#8b7355] rounded-3xl p-4 sm:p-6 shadow-2xl space-y-6">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b-2 border-[#8b7355]/40 text-xs font-black uppercase tracking-widest text-[#d4af37] bg-[#120e0c]/80">
                <th className="p-3.5">Rank</th>
                <th className="p-3.5">Kingdom Realm</th>
                <th className="p-3.5 text-center">Score</th>
                <th className="p-3.5 text-center">Remaining</th>
                <th className="p-3.5 text-center">Captured</th>
                <th className="p-3.5 text-center">Realm Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#8b7355]/30 font-serif">
              {sortedKingdoms.map((kingdom, idx) => {
                const rank = idx + 1;
                const isRankOne = rank === 1 && kingdom.status !== 'defeated';
                const isDefeated = kingdom.status === 'defeated';
                const totalMembers = kingdom.members.length;
                const uncapturedCount = kingdom.members.filter((m) => !m.isCaptured).length;
                const capturedCount = totalMembers - uncapturedCount;

                // Elimination percentage (0% = safe, 100% = defeated)
                const eliminationPct = Math.round((capturedCount / totalMembers) * 100);

                return (
                  <tr
                    key={kingdom.id}
                    className={`transition-all ${
                      isDefeated
                        ? 'bg-[#120e0c]/50 opacity-40 grayscale'
                        : 'hover:bg-[#120e0c]/90'
                    }`}
                  >
                    {/* Rank */}
                    <td className="p-3.5 font-black text-sm font-cinzel">
                      <div className="flex items-center gap-2">
                        {isRankOne && (
                          <span className="text-xl animate-bounce" title="Grand Leader">
                            👑
                          </span>
                        )}
                        <span
                          className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black font-mono shadow-md border ${
                            rank === 1
                              ? 'bg-[#d4af37] text-[#120e0c] border-[#f3e5ab]'
                              : rank === 2
                              ? 'bg-slate-300 text-[#120e0c] border-slate-100'
                              : rank === 3
                              ? 'bg-amber-800 text-[#f3e5ab] border-amber-600'
                              : 'bg-[#120e0c] text-[#8b7355] border-[#8b7355]'
                          }`}
                        >
                          {rank}
                        </span>
                      </div>
                    </td>

                    {/* Kingdom Banner */}
                    <td className="p-3.5">
                      <div className="flex items-center gap-3">
                        <span className="text-3xl">{kingdom.bannerSymbol}</span>
                        <div>
                          <div className="font-black text-[#f3e5ab] text-base font-cinzel">
                            {kingdom.name}
                          </div>
                          <div className="text-[11px] text-[#8b7355] font-merriweather italic">
                            {kingdom.castleStyle}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Score */}
                    <td className="p-3.5 text-center">
                      <span className="text-2xl font-black font-mono text-[#d4af37]">
                        {kingdom.score}
                      </span>
                    </td>

                    {/* Remaining */}
                    <td className="p-3.5 text-center">
                      <span className="font-mono font-black text-emerald-400 text-base">
                        {uncapturedCount}
                      </span>
                    </td>

                    {/* Captured */}
                    <td className="p-3.5 text-center">
                      <span className="font-mono font-black text-rose-400 text-base">
                        {capturedCount}
                      </span>
                    </td>

                    {/* Status Pill */}
                    <td className="p-3.5 text-center font-cinzel">
                      {kingdom.status === 'active' && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-emerald-950 text-emerald-300 border border-emerald-500">
                          🟢 Active
                        </span>
                      )}
                      {kingdom.status === 'endangered' && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-amber-950 text-amber-300 border border-amber-500 animate-pulse">
                          🟡 Endangered
                        </span>
                      )}
                      {kingdom.status === 'defeated' && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-rose-950 text-rose-300 border border-rose-500">
                          🔴 Defeated
                        </span>
                      )}

                      {/* Elimination progress bar */}
                      <div className="w-24 mx-auto mt-2 h-1.5 bg-[#120e0c] rounded-full overflow-hidden border border-[#8b7355]">
                        <div
                          className={`h-full transition-all duration-500 ${
                            eliminationPct >= 80 ? 'bg-rose-500' : 'bg-emerald-500'
                          }`}
                          style={{ width: `${eliminationPct}%` }}
                        />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Proceed to Next Round Button */}
        <div className="pt-4 flex justify-center font-cinzel">
          <button
            onClick={onNextRound}
            className="px-8 py-4 bg-gradient-to-r from-[#d4af37] via-[#f3e5ab] to-[#d4af37] text-[#120e0c] font-black text-sm tracking-widest uppercase rounded-2xl shadow-2xl border-2 border-[#f3e5ab] flex items-center gap-3 hover:scale-105 active:scale-95 transition-all cursor-pointer"
          >
            Start Round {roundNumber + 1} Royal Goblet Challenge
            <ArrowRight className="w-5 h-5 text-[#120e0c]" />
          </button>
        </div>
      </div>
    </div>
  );
};
