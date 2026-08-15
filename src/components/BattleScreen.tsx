import React, { useState } from 'react';
import {
  GamePhase,
  Kingdom,
  GameSettings,
  Question,
  AttackResult,
  BattleLogEntry,
  SyncStatus,
  TeacherUser,
} from '../types';
import { Header } from './Header';
import { GobletPhase } from './GobletPhase';
import { QuestionPhase } from './QuestionPhase';
import { AttackPhase } from './AttackPhase';
import { LeaderboardPhase } from './LeaderboardPhase';
import { VictoryScreen } from './VictoryScreen';
import { KingdomGonfalonCeremony } from './KingdomGonfalonCeremony';
import { Scroll, Shield, Trophy, Castle, Users, Activity, Crown, Swords, Eye } from 'lucide-react';

interface BattleScreenProps {
  currentPhase: GamePhase;
  kingdoms: Kingdom[];
  roundNumber: number;
  gameCode: string;
  soundEnabled: boolean;
  syncStatus: SyncStatus;
  teacherUser: TeacherUser | null;
  settings: GameSettings;
  activeQuestions: Question[];
  currentQuestionIdx: number;
  gobletWinnerId: string | null;
  tiedKingdomIds: string[];
  roundHistory: any[];
  battleLogs: BattleLogEntry[];
  onToggleSound: () => void;
  onOpenRules: () => void;
  onOpenSettings: () => void;
  onOpenTeacherDb: () => void;
  onRestartGame: () => void;
  onGobletChallengeComplete: (winningKingdomId: string, winningNumber: number) => void;
  onQuestionAnswered: (isCorrect: boolean) => void;
  onAttackComplete: (result: AttackResult) => void;
  onNextRound: () => void;
}

export const BattleScreen: React.FC<BattleScreenProps> = ({
  currentPhase,
  kingdoms,
  roundNumber,
  gameCode,
  soundEnabled,
  syncStatus,
  teacherUser,
  settings,
  activeQuestions,
  currentQuestionIdx,
  gobletWinnerId,
  tiedKingdomIds,
  roundHistory,
  battleLogs,
  onToggleSound,
  onOpenRules,
  onOpenSettings,
  onOpenTeacherDb,
  onRestartGame,
  onGobletChallengeComplete,
  onQuestionAnswered,
  onAttackComplete,
  onNextRound,
}) => {
  const [inspectedGonfalonKingdom, setInspectedGonfalonKingdom] = useState<Kingdom | null>(null);

  const activeKingdoms = kingdoms.filter((k) => k.status !== 'defeated');
  const currentQuestion = activeQuestions[currentQuestionIdx % activeQuestions.length];
  const winningKingdom = kingdoms.find((k) => k.id === gobletWinnerId) || activeKingdoms[0];
  const championKingdom =
    activeKingdoms.length === 1
      ? activeKingdoms[0]
      : [...kingdoms].sort((a, b) => b.score - a.score)[0] || kingdoms[0];

  const sortedKingdoms = [...kingdoms].sort((a, b) => b.score - a.score);

  return (
    <div className="h-screen w-screen max-h-screen overflow-hidden bg-transparent text-[#f3e5ab] font-cinzel flex flex-col selection:bg-[#d4af37] selection:text-[#100c0a] relative">
      {/* Top Header */}
      <Header
        currentPhase={currentPhase}
        roundNumber={roundNumber}
        soundEnabled={soundEnabled}
        onToggleSound={onToggleSound}
        onOpenRules={onOpenRules}
        onOpenSettings={onOpenSettings}
        onOpenTeacherDb={onOpenTeacherDb}
        onRestartGame={onRestartGame}
        gameCode={gameCode}
        syncStatus={syncStatus}
        teacherUser={teacherUser}
      />

      {/* Main Classroom Battlefield Arena (2-Column Desktop Layout) */}
      <div className="flex-1 p-2 sm:p-4 grid grid-cols-1 lg:grid-cols-12 gap-4 max-w-[1800px] w-full mx-auto min-h-0 overflow-hidden">
        
        {/* LEFT COLUMN: GAME INFORMATION (Live Standings & Active Realms) */}
        <div className="lg:col-span-3 xl:col-span-3 space-y-4 bg-[#16100c]/80 backdrop-blur-md border-2 border-[#8b7355] rounded-3xl p-3.5 sm:p-4 shadow-2xl h-full flex flex-col min-h-0 overflow-y-auto">
          
          {/* Live Realm Standings Section */}
          <div className="space-y-2">
            <div className="flex items-center justify-between border-b-2 border-[#8b7355]/40 pb-2 shrink-0">
              <h3 className="text-xs font-black text-[#d4af37] uppercase tracking-widest flex items-center gap-1.5">
                <Trophy className="w-4 h-4 text-[#d4af37]" /> Live Realm Standings
              </h3>
              <span className="text-[10px] text-[#8b7355] font-serif font-bold">Round {roundNumber}</span>
            </div>

            <div className="space-y-1.5 font-serif text-xs">
              {sortedKingdoms.map((k, idx) => (
                <div
                  key={k.id}
                  onClick={() => setInspectedGonfalonKingdom(k)}
                  className={`p-2 rounded-xl bg-[#120e0c] border flex items-center justify-between transition-all cursor-pointer hover:border-[#ffd700] hover:scale-[1.02] ${
                    k.id === gobletWinnerId ? 'border-[#d4af37] bg-[#1e1610] shadow-[0_0_10px_rgba(212,175,55,0.2)]' : 'border-[#8b7355]/40'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <span className="font-black text-[#d4af37] font-mono w-4">#{idx + 1}</span>
                    <span className="text-lg">{k.bannerSymbol}</span>
                    <span className="font-bold text-[#f3e5ab] font-cinzel text-xs truncate">{k.name}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono font-black text-[#d4af37] text-xs shrink-0">{k.score} pts</span>
                    <Eye className="w-3.5 h-3.5 text-[#8b7355] hover:text-[#ffd700]" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Active Realms Section */}
          <div className="space-y-2 pt-3 border-t-2 border-[#8b7355]/30 flex-1 flex flex-col min-h-0">
            <div className="flex items-center justify-between border-b border-[#8b7355]/30 pb-2 shrink-0">
              <h3 className="text-xs font-black text-[#d4af37] uppercase tracking-widest flex items-center gap-1.5">
                <Swords className="w-4 h-4 text-[#d4af37]" /> Active Realms ({activeKingdoms.length})
              </h3>
              <span className="text-[10px] font-mono text-[#8b7355]">{gameCode}</span>
            </div>

            <div className="space-y-2 font-serif flex-1 overflow-y-auto pr-1">
              {kingdoms.map((k) => {
                const uncaptured = k.members.filter((m) => !m.isCaptured).length;
                const isDefeated = k.status === 'defeated';
                return (
                  <div
                    key={k.id}
                    className={`p-2.5 rounded-xl border transition-all ${
                      isDefeated
                        ? 'bg-[#120e0c]/40 border-[#8b7355]/20 opacity-40 grayscale'
                        : k.id === gobletWinnerId
                        ? 'bg-[#1e1610] border-[#d4af37] shadow-[0_0_12px_rgba(212,175,55,0.3)]'
                        : 'bg-[#120e0c] border-[#8b7355]/50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 truncate">
                        <span className="text-xl">{k.bannerSymbol}</span>
                        <div className="font-black text-[#f3e5ab] text-xs font-cinzel truncate">
                          {k.name}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setInspectedGonfalonKingdom(k)}
                          title="View Royal Gonfalon Ceremony"
                          className="px-2 py-0.5 bg-[#1f1712] border border-[#d4af37]/60 hover:bg-[#d4af37] hover:text-[#120e0c] text-[#ffd700] rounded text-[10px] font-bold flex items-center gap-1 cursor-pointer transition-colors"
                        >
                          📜 Banner
                        </button>
                        <span className="text-xs font-black font-mono text-[#d4af37] shrink-0">
                          {k.score} Pts
                        </span>
                      </div>
                    </div>

                    {/* Status & Active Warriors */}
                    <div className="mt-1.5 pt-1.5 border-t border-[#8b7355]/20 flex justify-between items-center text-[10px]">
                      <span className="text-[#8b7355] font-bold">
                        ⚔️ {uncaptured} / {k.members.length} Active
                      </span>
                      <span
                        className={`font-black px-2 py-0.5 rounded-full font-cinzel ${
                          isDefeated
                            ? 'bg-rose-950 text-rose-300'
                            : k.status === 'endangered'
                            ? 'bg-amber-950 text-amber-300 animate-pulse'
                            : 'bg-emerald-950 text-emerald-300'
                        }`}
                      >
                        {(k.status || 'active').toUpperCase()}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: MAIN GAMEPLAY AREA (75% width) */}
        <div className="lg:col-span-9 xl:col-span-9 space-y-4 h-full flex flex-col min-h-0 overflow-y-auto">
          {currentPhase === 'goblet' || currentPhase === 'tiebreaker' ? (
            <GobletPhase
              activeKingdoms={activeKingdoms}
              isTieBreaker={currentPhase === 'tiebreaker'}
              tiedKingdomIds={tiedKingdomIds}
              onChallengeComplete={onGobletChallengeComplete}
            />
          ) : currentPhase === 'question' && currentQuestion && winningKingdom ? (
            <QuestionPhase
              winningKingdom={winningKingdom}
              question={currentQuestion}
              timerDuration={settings.questionTimerDuration}
              onQuestionAnswered={onQuestionAnswered}
            />
          ) : currentPhase === 'attack' && winningKingdom ? (
            <AttackPhase
              attackingKingdom={winningKingdom}
              opposingKingdoms={kingdoms.filter(
                (k) => k.id !== winningKingdom.id && k.status !== 'defeated'
              )}
              roundNumber={roundNumber}
              onAttackComplete={onAttackComplete}
            />
          ) : currentPhase === 'leaderboard' ? (
            <LeaderboardPhase
              kingdoms={kingdoms}
              roundNumber={roundNumber}
              onNextRound={onNextRound}
            />
          ) : currentPhase === 'victory' && championKingdom ? (
            <VictoryScreen
              championKingdom={championKingdom}
              allKingdoms={kingdoms}
              roundHistory={roundHistory}
              onRestartGame={onRestartGame}
            />
          ) : null}
        </div>
      </div>

      {/* Bottom Battle Log Live Ticker */}
      <div className="bg-[#120e0c]/80 backdrop-blur-md border-t-2 border-[#8b7355] p-3 text-xs font-serif flex items-center gap-3 overflow-x-auto">
        <div className="flex items-center gap-1.5 font-cinzel font-black text-[#d4af37] shrink-0">
          <Activity className="w-4 h-4 text-[#d4af37] animate-pulse" /> Live Battle Log:
        </div>
        <div className="flex items-center gap-4 text-[#e0d6c5] whitespace-nowrap">
          {battleLogs.slice(0, 3).map((log) => (
            <span key={log.id} className="bg-[#1c1612] px-3 py-1 rounded-full border border-[#8b7355]/40">
              <span className="font-mono text-[#8b7355] mr-1">[{log.timestamp}]</span>
              <strong className="text-[#f3e5ab] font-cinzel">{log.action}:</strong> {log.details}
            </span>
          ))}
        </div>
      </div>

      {/* Standalone Kingdom Gonfalon Ceremony Modal Overlay */}
      {inspectedGonfalonKingdom && (
        <div className="fixed inset-0 z-50 w-full h-full">
          <KingdomGonfalonCeremony
            kingdom={inspectedGonfalonKingdom}
            subtitle="ROYAL GONFALON OF THE REALM"
            onComplete={() => setInspectedGonfalonKingdom(null)}
            autoAdvanceMs={0}
            showNextButton={true}
          />
        </div>
      )}
    </div>
  );
};
