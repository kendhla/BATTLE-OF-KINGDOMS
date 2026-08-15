import React, { useState, useEffect } from 'react';
import {
  Volume2,
  VolumeX,
  RotateCcw,
  BookOpen,
  Settings,
  Database,
  Bell,
  Clock,
  LogOut,
  Sparkles,
  Shield,
  Menu,
} from 'lucide-react';
import { GamePhase, SyncStatus, TeacherUser } from '../types';
import { StoneCastleIcon, RoyalCrownIcon, ForgedSwordsIcon, AgedScrollIcon, GoldenChaliceIcon } from './MedievalIcons';

interface HeaderProps {
  currentPhase: GamePhase;
  roundNumber: number;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onOpenRules: () => void;
  onOpenSettings: () => void;
  onOpenTeacherDb: () => void;
  onRestartGame: () => void;
  gameCode: string;
  gameName?: string;
  syncStatus: SyncStatus;
  teacherUser: TeacherUser | null;
  onOpenSidebarMobile?: () => void;
  onLogout?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentPhase,
  roundNumber,
  soundEnabled,
  onToggleSound,
  onOpenRules,
  onOpenSettings,
  onOpenTeacherDb,
  onRestartGame,
  gameCode,
  gameName = 'Royal Classroom Battle',
  syncStatus,
  teacherUser,
  onOpenSidebarMobile,
  onLogout,
}) => {
  const [showConfirmReset, setShowConfirmReset] = useState(false);
  const [currentTime, setCurrentTime] = useState<string>('');
  const [showNotifications, setShowNotifications] = useState<boolean>(false);

  // Live Clock Effect
  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      );
    };
    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  const notificationsList = [
    { id: 1, text: `Tournament active under Code: ${gameCode}`, time: 'Just now', iconComp: <ForgedSwordsIcon className="w-4 h-4" /> },
    { id: 2, text: `Teacher ${teacherUser?.displayName || 'Educator'} logged in.`, time: '5m ago', iconComp: <RoyalCrownIcon className="w-4 h-4" /> },
    { id: 3, text: `Google Sheets status: ${syncStatus.toUpperCase()}`, time: 'Live', iconComp: <AgedScrollIcon className="w-4 h-4" /> },
  ];

  return (
    <header className="sticky top-0 bg-[#1c1612]/90 backdrop-blur-md border-b-4 border-[#8b7355] flex flex-wrap items-center justify-between px-3 sm:px-6 py-2.5 shadow-[0_10px_30px_rgba(0,0,0,0.85)] z-40 font-cinzel">
      {/* Left Branding & Mobile Menu Toggle */}
      <div className="flex items-center gap-3">
        {onOpenSidebarMobile && (
          <button
            onClick={onOpenSidebarMobile}
            className="p-2 rounded-xl bg-[#120e0c] border border-[#8b7355] text-[#d4af37] lg:hidden cursor-pointer"
            title="Open Royal Notice Board"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}

        <div className="w-10 h-10 sm:w-11 sm:h-11 bg-gradient-to-tr from-[#2a1c13] to-[#120e0c] rounded-2xl border-2 border-[#d4af37] shadow-[0_0_15px_rgba(212,175,55,0.4)] flex items-center justify-center shrink-0">
          <StoneCastleIcon className="w-7 h-7" />
        </div>

        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-base sm:text-lg font-black tracking-widest uppercase text-[#f3e5ab] text-gold-engraved">
              Battle of Kingdoms
            </h1>
            <span className="hidden sm:inline-block px-2 py-0.5 rounded bg-[#120e0c] border border-[#d4af37] text-[10px] font-mono text-[#d4af37] font-bold">
              {gameCode}
            </span>
          </div>
          <p className="text-[10px] uppercase tracking-[0.2em] font-serif text-[#8b7355]">
            {gameName}
          </p>
        </div>
      </div>

      {/* Center Round & Phase Indicator */}
      {currentPhase !== 'setup' && currentPhase !== 'victory' && (
        <div className="hidden md:flex items-center gap-4 px-5 py-1.5 bg-[#120e0c] border-2 border-[#8b7355] rounded-xl shadow-inner">
          <div className="text-center">
            <p className="text-[9px] uppercase tracking-wider text-[#8b7355] font-serif font-bold">
              Round
            </p>
            <p className="text-lg font-bold font-mono text-[#d4af37]">
              {roundNumber < 10 ? `0${roundNumber}` : roundNumber}
            </p>
          </div>
          <div className="h-6 w-px bg-[#8b7355] opacity-40" />
          <div className="text-right">
            <p className="text-[9px] uppercase tracking-wider text-[#d4af37] font-serif font-bold">
              Phase
            </p>
            <p className="text-xs italic font-semibold text-[#f3e5ab]">
              {currentPhase === 'goblet' && '⚔️ Goblet Challenge'}
              {currentPhase === 'tiebreaker' && '👑 Royal Tie-Breaker'}
              {currentPhase === 'question' && '📜 Question Scroll'}
              {currentPhase === 'attack' && '🏰 Kingdom Conquest'}
              {currentPhase === 'leaderboard' && '🏆 Hall of Champions'}
            </p>
          </div>
        </div>
      )}

      {/* Right Controls: Clock, Notifications, Actions */}
      <div className="flex items-center gap-2 font-serif">
        {/* Live Clock Indicator */}
        <div className="hidden xl:flex items-center gap-1.5 px-3 py-1.5 bg-[#120e0c] border border-[#8b7355]/60 rounded-xl text-xs font-mono font-bold text-[#d4af37]">
          <Clock className="w-3.5 h-3.5 text-[#8b7355]" />
          <span>{currentTime || '12:00 PM'}</span>
        </div>

        {/* Notifications Bell Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 rounded-xl bg-[#120e0c] hover:bg-[#2a1c13] border border-[#8b7355] text-[#d4af37] relative cursor-pointer transition-all hover:scale-105"
            title="Royal Tournament Notifications"
          >
            <Bell className="w-4 h-4 text-[#d4af37]" />
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-amber-400 animate-ping" />
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-72 bg-[#1c1612] border-2 border-[#d4af37] rounded-2xl shadow-2xl p-3 z-50 animate-in fade-in space-y-2 text-xs font-serif">
              <div className="flex items-center justify-between border-b border-[#8b7355]/40 pb-2">
                <span className="font-bold font-cinzel text-[#f3e5ab]">Royal Dispatch Feed</span>
                <span className="text-[10px] text-[#8b7355] font-mono">3 Alerts</span>
              </div>
              <div className="space-y-1.5">
                {notificationsList.map((n) => (
                  <div key={n.id} className="p-2 bg-[#120e0c] rounded-xl border border-[#8b7355]/30 flex items-start gap-2">
                    <span className="shrink-0 pt-0.5">{n.iconComp}</span>
                    <div className="flex-1">
                      <p className="text-[#e0d6c5] text-[11px] leading-tight">{n.text}</p>
                      <span className="text-[9px] text-[#8b7355] font-mono">{n.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Teacher DB / Sync Button */}
        <button
          onClick={onOpenTeacherDb}
          className="px-2.5 py-1.5 rounded-xl bg-[#120e0c] hover:border-[#d4af37] text-[#f3e5ab] border border-[#8b7355] transition-all flex items-center gap-1.5 text-xs font-bold shadow cursor-pointer hover:scale-105"
          title="Teacher Control Database & Sheets Sync"
        >
          <Database className="w-3.5 h-3.5 text-[#d4af37]" />
          <span className="hidden sm:inline">Teacher DB</span>
          {syncStatus === 'synced' && <span className="w-2 h-2 rounded-full bg-emerald-400" />}
          {syncStatus === 'syncing' && <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />}
        </button>

        {/* Rules */}
        <button
          onClick={onOpenRules}
          className="p-2 sm:px-2.5 rounded-xl bg-[#120e0c] hover:bg-[#2a1c13] text-[#e0d6c5] border border-[#8b7355]/60 hover:border-[#d4af37] transition-all flex items-center gap-1 text-xs font-bold cursor-pointer"
          title="Game Rulebook"
        >
          <BookOpen className="w-3.5 h-3.5 text-[#d4af37]" />
          <span className="hidden md:inline">Rules</span>
        </button>

        {/* Question Bank */}
        <button
          onClick={onOpenSettings}
          className="p-2 sm:px-2.5 rounded-xl bg-[#120e0c] hover:bg-[#2a1c13] text-[#e0d6c5] border border-[#8b7355]/60 hover:border-[#d4af37] transition-all flex items-center gap-1 text-xs font-bold cursor-pointer"
          title="Question Bank"
        >
          <Settings className="w-3.5 h-3.5 text-[#d4af37]" />
          <span className="hidden md:inline">Bank</span>
        </button>

        {/* Sound Toggle */}
        <button
          onClick={onToggleSound}
          className="p-2 rounded-xl bg-[#120e0c] hover:bg-[#2a1c13] text-[#e0d6c5] border border-[#8b7355]/60 transition-all text-xs font-bold cursor-pointer"
          title={soundEnabled ? 'Mute Sound' : 'Unmute Sound'}
        >
          {soundEnabled ? (
            <Volume2 className="w-3.5 h-3.5 text-[#d4af37]" />
          ) : (
            <VolumeX className="w-3.5 h-3.5 text-[#8b7355]" />
          )}
        </button>

        {/* Reset Game Button */}
        {currentPhase !== 'setup' && (
          <div className="relative">
            {!showConfirmReset ? (
              <button
                onClick={() => setShowConfirmReset(true)}
                className="p-2 sm:px-2.5 rounded-xl bg-rose-950 hover:bg-rose-900 text-rose-100 border border-rose-600 transition-all text-xs font-bold flex items-center gap-1 shadow cursor-pointer hover:scale-105"
                title="Reset Tournament"
              >
                <RotateCcw className="w-3.5 h-3.5 text-rose-300" />
                <span className="hidden sm:inline">Reset</span>
              </button>
            ) : (
              <div className="flex items-center gap-1 bg-rose-950 border border-rose-600 rounded-xl p-1 animate-in fade-in">
                <span className="text-[10px] text-white font-bold px-1">Reset?</span>
                <button
                  onClick={() => {
                    setShowConfirmReset(false);
                    onRestartGame();
                  }}
                  className="px-2 py-0.5 bg-amber-400 text-slate-950 rounded text-[10px] font-black cursor-pointer"
                >
                  Yes
                </button>
                <button
                  onClick={() => setShowConfirmReset(false)}
                  className="px-2 py-0.5 bg-[#120e0c] text-slate-300 rounded text-[10px] font-bold cursor-pointer"
                >
                  No
                </button>
              </div>
            )}
          </div>
        )}

        {/* Logout Button if Handler Provided */}
        {onLogout && (
          <button
            onClick={onLogout}
            className="p-2 rounded-xl bg-rose-950/80 hover:bg-rose-900 border border-rose-600 text-rose-200 transition-all cursor-pointer"
            title="Logout Teacher Account"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </header>
  );
};
