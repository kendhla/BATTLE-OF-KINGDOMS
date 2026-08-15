import React from 'react';
import {
  Home,
  Swords,
  Crown,
  BookOpen,
  BarChart3,
  Scroll,
  Trophy,
  Settings,
  Sparkles,
  ChevronRight,
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

export type SidebarTab =
  | 'dashboard'
  | 'battle'
  | 'kingdoms'
  | 'questions'
  | 'stats'
  | 'logs'
  | 'awards'
  | 'settings';

interface MedievalSidebarProps {
  activeTab: SidebarTab;
  onSelectTab: (tab: SidebarTab) => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
  gameCode?: string;
  roundNumber?: number;
}

export const MedievalSidebar: React.FC<MedievalSidebarProps> = ({
  activeTab,
  onSelectTab,
  isOpenMobile,
  onCloseMobile,
  gameCode,
  roundNumber,
}) => {
  const navItems: { id: SidebarTab; label: string; iconComponent: React.ReactNode; badge?: string }[] = [
    { id: 'dashboard', label: 'Dashboard', iconComponent: <StoneCastleIcon className="w-5 h-5" /> },
    { id: 'battle', label: 'Battle Arena', iconComponent: <ForgedSwordsIcon className="w-5 h-5" />, badge: gameCode ? `R#${roundNumber || 1}` : undefined },
    { id: 'kingdoms', label: 'Kingdoms', iconComponent: <RoyalCrownIcon className="w-5 h-5" /> },
    { id: 'questions', label: 'Question Bank', iconComponent: <MedievalBooksIcon className="w-5 h-5" /> },
    { id: 'stats', label: 'Statistics', iconComponent: <RoyalChartIcon className="w-5 h-5" /> },
    { id: 'logs', label: 'Battle Logs', iconComponent: <AgedScrollIcon className="w-5 h-5" /> },
    { id: 'awards', label: 'Hall of Fame', iconComponent: <GoldenChaliceIcon className="w-5 h-5" /> },
    { id: 'settings', label: 'Settings & Sync', iconComponent: <MedievalGearIcon className="w-5 h-5" /> },
  ];

  const handleItemClick = (tab: SidebarTab) => {
    onSelectTab(tab);
    if (isOpenMobile) {
      onCloseMobile();
    }
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpenMobile && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 lg:hidden animate-in fade-in"
        />
      )}

      {/* Sidebar Notice Board */}
      <aside
        className={`fixed top-16 bottom-0 left-0 w-64 bg-[#1a120b] border-r-4 border-[#8b7355] z-40 transform transition-transform duration-300 ease-in-out shadow-[10px_0_30px_rgba(0,0,0,0.8)] font-cinzel flex flex-col justify-between ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
        style={{
          backgroundImage: `radial-gradient(circle at 50% 0%, rgba(212,175,55,0.15), transparent 70%), linear-gradient(180deg, #22170f 0%, #120d08 100%)`,
        }}
      >
        {/* Top Header / Notice Board Banner */}
        <div className="p-4 border-b-2 border-[#8b7355]/50 relative">
          <div className="flex items-center gap-2.5 px-3 py-2 bg-[#120e0c] rounded-2xl border border-[#d4af37] shadow-inner">
            <AgedScrollIcon className="w-6 h-6 shrink-0" />
            <div>
              <h2 className="text-xs font-black text-[#f3e5ab] uppercase tracking-wider text-gold-engraved">
                Royal Notice Board
              </h2>
              <p className="text-[10px] text-[#8b7355] font-serif italic">Kingdom Navigation</p>
            </div>
          </div>

          {/* Wooden Nails */}
          <div className="absolute top-2 left-2 w-2 h-2 rounded-full bg-[#8b7355] border border-amber-900 shadow-md" />
          <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[#8b7355] border border-amber-900 shadow-md" />
        </div>

        {/* Menu Items List */}
        <div className="flex-1 overflow-y-auto py-4 px-3 space-y-2">
          {navItems.map((item) => {
            const isSelected = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleItemClick(item.id)}
                className={`w-full group relative flex items-center justify-between px-3.5 py-3 rounded-xl border-2 transition-all duration-200 cursor-pointer select-none ${
                  isSelected
                    ? 'bg-gradient-to-r from-[#3d2b1f] via-[#2a1c13] to-[#3d2b1f] border-[#d4af37] shadow-[0_0_15px_rgba(212,175,55,0.3)] text-[#f3e5ab] scale-[1.02]'
                    : 'bg-[#150f0a]/90 hover:bg-[#251b13] border-[#8b7355]/40 hover:border-[#d4af37]/80 text-[#e0d6c5] hover:text-[#f3e5ab] hover:scale-[1.01]'
                }`}
              >
                {/* Active Indicator Crown */}
                {isSelected && (
                  <span className="absolute -left-2 top-1/2 -translate-y-1/2">
                    <RoyalCrownIcon className="w-4 h-4" />
                  </span>
                )}

                <div className="flex items-center gap-3">
                  <span className="group-hover:scale-125 transition-transform duration-200">
                    {item.iconComponent}
                  </span>
                  <span className="text-xs font-bold uppercase tracking-wider font-cinzel">
                    {item.label}
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  {item.badge && (
                    <span className="px-2 py-0.5 text-[9px] font-mono font-black rounded-full bg-[#120e0c] border border-[#d4af37] text-[#d4af37]">
                      {item.badge}
                    </span>
                  )}
                  <ChevronRight
                    className={`w-4 h-4 transition-transform duration-200 ${
                      isSelected
                        ? 'text-[#d4af37] translate-x-1'
                        : 'text-[#8b7355] opacity-50 group-hover:opacity-100 group-hover:translate-x-0.5'
                    }`}
                  />
                </div>
              </button>
            );
          })}
        </div>

        {/* Footer Notice Board Banner */}
        <div className="p-4 border-t-2 border-[#8b7355]/50 bg-[#120e0c]/80 text-center font-serif text-[11px] text-[#8b7355]">
          <div className="flex items-center justify-center gap-1.5 text-[#d4af37] font-bold font-cinzel mb-1 text-xs">
            <Sparkles className="w-3.5 h-3.5 text-[#d4af37]" /> Battle of Kingdoms
          </div>
          <p className="italic text-[10px]">Royal Educator Edition v2.5</p>
        </div>
      </aside>
    </>
  );
};
