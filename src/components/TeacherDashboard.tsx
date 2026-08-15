import React, { useState } from 'react';
import {
  TeacherUser,
  SyncStatus,
  SavedGameSummary,
  BattleLogEntry,
  Kingdom,
} from '../types';
import { PRESET_KINGDOMS } from '../data/presetData';
import {
  Play,
  PlusCircle,
  BookOpen,
  Castle,
  BarChart2,
  Scroll,
  Trophy,
  Settings,
  Database,
  LogOut,
  Sparkles,
  CheckCircle2,
  Clock,
  Shield,
  ArrowRight,
  UserCheck,
  RefreshCw,
  FolderOpen,
} from 'lucide-react';
import {
  ForgedSwordsIcon,
  RoyalCrownIcon,
  StoneCastleIcon,
  AgedScrollIcon,
  MedievalBooksIcon,
  GoldenChaliceIcon,
  MedievalGearIcon,
  RoyalChartIcon,
} from './MedievalIcons';

interface TeacherDashboardProps {
  teacherUser: TeacherUser | null;
  syncStatus: SyncStatus;
  savedGames: SavedGameSummary[];
  battleLogs: BattleLogEntry[];
  spreadsheetUrl: string | null;
  onOpenCreateWizard: () => void;
  onOpenQuestionBank: () => void;
  onOpenKingdomManager: () => void;
  onOpenStats: () => void;
  onOpenHistory: () => void;
  onOpenLeaderboards: () => void;
  onOpenSettings: () => void;
  onLoadSavedGame: (game: SavedGameSummary) => void;
  onLogout: () => void;
  onManualSync: () => void;
}

export const TeacherDashboard: React.FC<TeacherDashboardProps> = ({
  teacherUser,
  syncStatus,
  savedGames,
  battleLogs,
  spreadsheetUrl,
  onOpenCreateWizard,
  onOpenQuestionBank,
  onOpenKingdomManager,
  onOpenStats,
  onOpenHistory,
  onOpenLeaderboards,
  onOpenSettings,
  onLoadSavedGame,
  onLogout,
  onManualSync,
}) => {
  const [selectedTab, setSelectedTab] = useState<'overview' | 'saved' | 'activity'>('overview');

  const dashboardCards = [
    {
      id: 'create',
      title: 'Create New Game',
      desc: 'Launch the Guided Battle Setup in the Royal War Room',
      iconComponent: <ForgedSwordsIcon className="w-10 h-10" />,
      color: 'border-[#d4af37] bg-gradient-to-b from-[#2a1c13]/80 to-[#120e0c]/70 backdrop-blur-md',
      badge: 'Royal War Room',
      onClick: onOpenCreateWizard,
    },
    {
      id: 'continue',
      title: 'Continue Saved Game',
      desc: 'Resume active classroom battles from Google Sheets',
      iconComponent: <StoneCastleIcon className="w-10 h-10" />,
      color: 'border-[#8b7355] bg-[#120e0c]/65 backdrop-blur-md',
      badge: `${savedGames.length} Saved`,
      onClick: () => setSelectedTab('saved'),
    },
    {
      id: 'questions',
      title: 'Question Bank & AI',
      desc: 'Inscribe, edit & conjure questions in the Royal Library',
      iconComponent: <MedievalBooksIcon className="w-10 h-10" />,
      color: 'border-[#8b7355] bg-[#120e0c]/65 backdrop-blur-md',
      badge: 'Royal Library',
      onClick: onOpenQuestionBank,
    },
    {
      id: 'kingdoms',
      title: 'Kingdom Management',
      desc: 'Customize heraldic banners, crowns & castles in Throne Room',
      iconComponent: <RoyalCrownIcon className="w-10 h-10" />,
      color: 'border-[#8b7355] bg-[#120e0c]/65 backdrop-blur-md',
      badge: 'Throne Room',
      onClick: onOpenKingdomManager,
    },
    {
      id: 'stats',
      title: 'Statistics & Analytics',
      desc: 'Analyze question accuracy & win rates in Royal Archives',
      iconComponent: <RoyalChartIcon className="w-10 h-10" />,
      color: 'border-[#8b7355] bg-[#120e0c]/65 backdrop-blur-md',
      badge: 'Royal Archives',
      onClick: onOpenStats,
    },
    {
      id: 'history',
      title: 'Battle History & Logs',
      desc: "Review round logs & chronicles in Scribe's Chamber",
      iconComponent: <AgedScrollIcon className="w-10 h-10" />,
      color: 'border-[#8b7355] bg-[#120e0c]/65 backdrop-blur-md',
      badge: `${battleLogs.length} Events`,
      onClick: onOpenHistory,
    },
    {
      id: 'hall',
      title: 'Hall of Champions',
      desc: 'View historic standings in Grand Hall of Honor',
      iconComponent: <GoldenChaliceIcon className="w-10 h-10" />,
      color: 'border-[#8b7355] bg-[#120e0c]/65 backdrop-blur-md',
      badge: 'Hall of Honor',
      onClick: onOpenLeaderboards,
    },
    {
      id: 'settings',
      title: 'Database Settings',
      desc: 'Configure timer & audio in Royal Command Office',
      iconComponent: <MedievalGearIcon className="w-10 h-10" />,
      color: 'border-[#8b7355] bg-[#120e0c]/65 backdrop-blur-md',
      badge: (syncStatus || 'offline').toUpperCase(),
      onClick: onOpenSettings,
    },
  ];

  return (
    <div className="max-w-[1700px] w-full mx-auto p-4 sm:p-6 space-y-6 font-cinzel animate-in fade-in duration-500">
      {/* Teacher Command Center Header */}
      <div className="bg-[#1c1612]/75 border-4 border-[#8b7355] rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-md relative overflow-hidden flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4 text-left">
          <div className="w-16 h-16 rounded-2xl bg-[#120e0c] border-2 border-[#d4af37] flex items-center justify-center shadow-xl shrink-0">
            <RoyalCrownIcon className="w-10 h-10" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-[#d4af37] uppercase tracking-widest font-serif">
                Kingdom Command Center
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-[#120e0c] border border-[#d4af37] text-[10px] text-[#f3e5ab] font-bold">
                Grand Castle Hall
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-[#f3e5ab] uppercase tracking-wider text-gold-engraved">
              {teacherUser?.displayName || 'Master Teacher'}
            </h1>
            <p className="text-xs text-[#e0d6c5] font-serif italic">
              {teacherUser?.email || 'teacher@school.edu'} • Authenticated Educator
            </p>
          </div>
        </div>

        {/* Sync & Logout Controls */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={onManualSync}
            className="px-4 py-2 bg-[#120e0c] hover:bg-[#2a1c13] border border-[#d4af37] text-[#f3e5ab] text-xs font-bold rounded-xl flex items-center gap-2 shadow-lg cursor-pointer transition-all"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${syncStatus === 'syncing' ? 'animate-spin text-[#d4af37]' : ''}`} />
            <span>Sync Sheets</span>
          </button>

          {spreadsheetUrl && (
            <a
              href={spreadsheetUrl}
              target="_blank"
              rel="noreferrer"
              className="px-4 py-2 bg-[#120e0c] hover:bg-[#2a1c13] border border-emerald-500 text-emerald-300 text-xs font-bold rounded-xl flex items-center gap-2 shadow-lg transition-all"
            >
              <Database className="w-3.5 h-3.5 text-emerald-400" />
              <span>Open Google Sheet</span>
            </a>
          )}

          <button
            onClick={onLogout}
            className="px-4 py-2 bg-rose-950/80 hover:bg-rose-900 border border-rose-600 text-rose-200 text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-lg cursor-pointer transition-all"
          >
            <LogOut className="w-3.5 h-3.5" /> Logout
          </button>
        </div>
      </div>

      {/* Main Grid of Command Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {dashboardCards.map((card) => (
          <div
            key={card.id}
            onClick={card.onClick}
            className={`p-5 rounded-3xl border-2 transition-all cursor-pointer select-none group flex flex-col justify-between min-h-[160px] shadow-xl hover:scale-105 ${card.color}`}
          >
            <div className="flex items-start justify-between">
              <div className="filter drop-shadow-[0_4px_8px_rgba(0,0,0,0.8)] group-hover:scale-110 transition-transform">
                {card.iconComponent}
              </div>
              <span className="px-2.5 py-1 rounded-full bg-[#120e0c] border border-[#8b7355] text-[10px] font-bold text-[#d4af37] uppercase tracking-wider font-serif">
                {card.badge}
              </span>
            </div>

            <div className="space-y-1 mt-4">
              <h3 className="text-base font-black text-[#f3e5ab] group-hover:text-amber-300 transition-colors">
                {card.title}
              </h3>
              <p className="text-xs text-[#e0d6c5]/80 font-serif italic line-clamp-2">
                {card.desc}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Saved Games & Activity Section */}
      <div className="bg-[#1c1612] border-4 border-[#8b7355] rounded-3xl p-6 shadow-2xl space-y-4">
        <div className="flex border-b-2 border-[#8b7355]/40 gap-4 font-cinzel">
          <button
            onClick={() => setSelectedTab('overview')}
            className={`pb-3 text-xs font-black uppercase tracking-wider border-b-2 transition-all cursor-pointer ${
              selectedTab === 'overview'
                ? 'border-[#d4af37] text-[#f3e5ab]'
                : 'border-transparent text-[#8b7355] hover:text-[#f3e5ab]'
            }`}
          >
            🎮 Active & Saved Games ({savedGames.length})
          </button>
          <button
            onClick={() => setSelectedTab('activity')}
            className={`pb-3 text-xs font-black uppercase tracking-wider border-b-2 transition-all cursor-pointer ${
              selectedTab === 'activity'
                ? 'border-[#d4af37] text-[#f3e5ab]'
                : 'border-transparent text-[#8b7355] hover:text-[#f3e5ab]'
            }`}
          >
            📜 Recent Activity Feed ({battleLogs.length})
          </button>
        </div>

        {selectedTab === 'overview' && (
          <div className="space-y-3 font-serif">
            {savedGames.length === 0 ? (
              <div className="p-8 text-center bg-[#120e0c] rounded-2xl border border-[#8b7355]/40 space-y-2">
                <p className="text-sm font-bold text-[#f3e5ab]">No saved games recorded yet.</p>
                <p className="text-xs text-[#8b7355] italic">
                  Click "Create New Game" above to start your first classroom kingdom war!
                </p>
              </div>
            ) : (
              savedGames.map((game) => (
                <div
                  key={game.gameCode}
                  className="p-4 bg-[#120e0c] rounded-2xl border border-[#8b7355]/60 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-md hover:border-[#d4af37] transition-all"
                >
                  <div className="space-y-1 text-left w-full sm:w-auto">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded bg-[#1c1612] border border-[#d4af37] text-xs font-mono font-bold text-[#d4af37]">
                        {game.gameCode}
                      </span>
                      <span className="font-bold text-[#f3e5ab] text-sm font-cinzel">
                        {game.gameName}
                      </span>
                    </div>
                    <p className="text-xs text-[#e0d6c5] italic">
                      Round {game.currentRound} • {game.numberOfKingdoms} Kingdoms • Status:{' '}
                      <span className="text-emerald-400 font-bold">{game.gameStatus}</span>
                    </p>
                  </div>

                  <button
                    onClick={() => onLoadSavedGame(game)}
                    className="px-5 py-2.5 bg-gradient-to-r from-[#d4af37] to-[#f3e5ab] text-[#120e0c] font-black font-cinzel text-xs uppercase tracking-widest rounded-xl shadow-lg hover:scale-105 cursor-pointer flex items-center gap-1.5 shrink-0"
                  >
                    <Play className="w-3.5 h-3.5 fill-[#120e0c]" /> Resume Game
                  </button>
                </div>
              ))
            )}
          </div>
        )}

        {selectedTab === 'activity' && (
          <div className="space-y-2 font-serif text-xs max-h-64 overflow-y-auto pr-1">
            {battleLogs.length === 0 ? (
              <p className="text-xs text-[#8b7355] italic p-4 text-center">No battle logs recorded in current session.</p>
            ) : (
              battleLogs.map((log) => (
                <div
                  key={log.id}
                  className="p-2.5 bg-[#120e0c] rounded-xl border border-[#8b7355]/30 flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-[#8b7355]">{log.timestamp}</span>
                    <span className="font-bold text-[#d4af37] font-cinzel">{log.action}:</span>
                    <span className="text-[#e0d6c5]">{log.details}</span>
                  </div>
                  <span className="text-[10px] font-mono bg-[#1c1612] px-2 py-0.5 rounded border border-[#8b7355] text-[#8b7355]">
                    {log.gameCode}
                  </span>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};
