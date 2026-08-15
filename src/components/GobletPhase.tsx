import React, { useState, useEffect } from 'react';
import { Goblet, Kingdom } from '../types';
import { sound } from '../lib/sound';
import { Sparkles, Lock, Crown, Trophy } from 'lucide-react';
import { KingdomGonfalonCeremony } from './KingdomGonfalonCeremony';
import { CeremonialGoblet } from './CeremonialGoblet';

interface GobletPhaseProps {
  activeKingdoms: Kingdom[];
  isTieBreaker: boolean;
  tiedKingdomIds?: string[];
  onChallengeComplete: (winningKingdomId: string, winningNumber: number) => void;
}

const ROMAN_NUMERALS = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X'];

export const GobletPhase: React.FC<GobletPhaseProps> = ({
  activeKingdoms,
  isTieBreaker,
  tiedKingdomIds = [],
  onChallengeComplete,
}) => {
  const eligibleKingdoms = isTieBreaker
    ? activeKingdoms.filter((k) => tiedKingdomIds.includes(k.id))
    : activeKingdoms;

  const [goblets, setGoblets] = useState<Goblet[]>(() => {
    const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].sort(() => Math.random() - 0.5);
    return Array.from({ length: 10 }, (_, idx) => ({
      id: idx + 1,
      number: numbers[idx],
      selectedByKingdomId: null,
      isRevealed: false,
    }));
  });

  const [currentTurnIdx, setCurrentTurnIdx] = useState<number>(0);
  const [isRevealed, setIsRevealed] = useState<boolean>(false);
  const [winnerInfo, setWinnerInfo] = useState<{ id: string; num: number } | null>(null);
  const [activeGonfalonKingdom, setActiveGonfalonKingdom] = useState<Kingdom | null>(null);

  // Cinematic Ceremony State: 'chest_appears' | 'chest_awakens' | 'goblets_rising' | 'ready' | 'closing'
  type CeremonyStage = 'chest_appears' | 'chest_awakens' | 'goblets_rising' | 'ready' | 'closing';
  const [ceremonyStage, setCeremonyStage] = useState<CeremonyStage>('chest_appears');
  const [risenCount, setRisenCount] = useState<number>(0);

  const currentSelectingKingdom = eligibleKingdoms[currentTurnIdx];
  const requiredPicks = eligibleKingdoms.length;
  const pickedCount = goblets.filter((g) => g.selectedByKingdomId !== null).length;
  const isAllPicked = pickedCount >= requiredPicks;

  // Cinematic Treasure Chest Sequence Controller
  useEffect(() => {
    let timer: NodeJS.Timeout;

    if (ceremonyStage === 'chest_appears') {
      sound.playMagicalHum();
      timer = setTimeout(() => {
        setCeremonyStage('chest_awakens');
      }, 2000);
    } else if (ceremonyStage === 'chest_awakens') {
      timer = setTimeout(() => {
        sound.playChestOpen();
      }, 600);
      const nextTimer = setTimeout(() => {
        setCeremonyStage('goblets_rising');
        setRisenCount(0);
      }, 2000);
      return () => {
        clearTimeout(timer);
        clearTimeout(nextTimer);
      };
    } else if (ceremonyStage === 'goblets_rising') {
      if (risenCount === 0) {
        setRisenCount(10);
        sound.playGobletRise(0);
        sound.playGobletRise(4);
        sound.playGobletRise(8);
        sound.playMagicalHum();
      }
      timer = setTimeout(() => {
        sound.playVictoryFanfare();
        setCeremonyStage('ready');
      }, 3000);
    }

    return () => clearTimeout(timer);
  }, [ceremonyStage, risenCount]);

  const handleSkipCeremony = () => {
    setRisenCount(10);
    setCeremonyStage('ready');
    sound.playVictoryFanfare();
  };

  const handleSelectGoblet = (gobletId: number) => {
    if (ceremonyStage !== 'ready' || isAllPicked || isRevealed || !currentSelectingKingdom) return;

    const target = goblets.find((g) => g.id === gobletId);
    if (!target || target.selectedByKingdomId !== null) return;

    sound.playGobletSelect();

    const updated = goblets.map((g) =>
      g.id === gobletId ? { ...g, selectedByKingdomId: currentSelectingKingdom.id } : g
    );
    setGoblets(updated);

    if (currentTurnIdx + 1 < eligibleKingdoms.length) {
      setCurrentTurnIdx(currentTurnIdx + 1);
    }
  };

  const handleRevealAll = () => {
    if (!isAllPicked || isRevealed) return;

    sound.playGobletReveal();
    setIsRevealed(true);

    const revealedGoblets = goblets.map((g) =>
      g.selectedByKingdomId !== null ? { ...g, isRevealed: true } : g
    );
    setGoblets(revealedGoblets);

    let highestNum = -1;
    let winningKingdomId = '';

    const results = eligibleKingdoms.map((k) => {
      const g = revealedGoblets.find((gob) => gob.selectedByKingdomId === k.id);
      return { kingdomId: k.id, number: g ? g.number : 0 };
    });

    results.forEach((r) => {
      if (r.number > highestNum) {
        highestNum = r.number;
        winningKingdomId = r.kingdomId;
      }
    });

    const highestTied = results.filter((r) => r.number === highestNum);

    setTimeout(() => {
      if (highestTied.length > 1) {
        setCeremonyStage('closing');
        setTimeout(() => {
          onChallengeComplete('', 0);
        }, 1000);
      } else {
        setWinnerInfo({ id: winningKingdomId, num: highestNum });
        setTimeout(() => {
          setCeremonyStage('closing');
          setTimeout(() => {
            onChallengeComplete(winningKingdomId, highestNum);
          }, 1000);
        }, 3000);
      }
    }, 1500);
  };

  const winningKingdom = winnerInfo ? activeKingdoms.find((k) => k.id === winnerInfo.id) : null;

  return (
    <div className={`fixed inset-0 z-50 bg-[#060403]/25 backdrop-blur-sm flex flex-col justify-between items-center p-2 sm:p-4 font-cinzel overflow-hidden select-none transition-opacity duration-1000 ${
      ceremonyStage === 'closing' ? 'opacity-0 scale-95' : 'opacity-100 animate-in fade-in duration-700'
    }`}>
      {/* Skip Button during intro ceremony */}
      {ceremonyStage !== 'ready' && ceremonyStage !== 'closing' && (
        <button
          onClick={handleSkipCeremony}
          className="absolute top-4 right-4 z-50 px-3.5 py-1.5 rounded-xl bg-[#1c1612]/80 border border-[#8b7355]/40 text-[#d4af37] text-xs font-mono tracking-widest uppercase hover:bg-[#d4af37] hover:text-[#1c1612] transition-all duration-200 backdrop-blur cursor-pointer shadow-lg"
        >
          Skip Intro ⏭
        </button>
      )}

      {/* Background Atmosphere Lights, Particles & Cinematic Mist */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute inset-0 bg-radial from-[#2a1a10]/30 via-transparent to-[#080605]/40" />
        <div className="absolute top-4 left-6 text-2xl animate-torch">🔥</div>
        <div className="absolute top-4 right-6 text-2xl animate-torch">🔥</div>
        <div className="absolute top-1/4 left-1/6 text-xs text-amber-300/30 animate-particle">✨</div>
        <div className="absolute top-1/3 right-1/5 text-sm text-yellow-100/30 animate-particle" style={{ animationDelay: '1.2s' }}>✨</div>
        <div className="absolute bottom-1/4 left-1/4 text-xs text-amber-400/20 animate-particle" style={{ animationDelay: '2.5s' }}>✨</div>
        
        {/* Golden Spotlight when ceremony is ready */}
        {(ceremonyStage === 'ready' || ceremonyStage === 'closing') && (
          <div className="absolute top-0 inset-x-0 h-full bg-radial from-amber-400/15 via-yellow-300/5 to-transparent blur-3xl animate-pulse pointer-events-none" />
        )}
      </div>

      {/* TOP SECTION: TITLE, SUBTITLE & SELECTING KINGDOM */}
      <div className="w-full max-w-6xl mx-auto text-center space-y-1.5 relative z-20 pt-2 shrink-0">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#120e0c] border border-[#d4af37] text-[#f3e5ab] text-[11px] font-black uppercase tracking-widest shadow-2xl">
          <Sparkles className="w-3.5 h-3.5 text-[#d4af37]" />
          {isTieBreaker ? '👑 Royal Tie-Breaker Ceremony' : 'Sacred Kingdom Selection'}
        </div>

        {/* Dynamic Titles depending on Ceremony Stage */}
        {ceremonyStage === 'chest_appears' && (
          <div className="space-y-1 animate-chest-rise">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-[#f3e5ab] uppercase tracking-[0.25em] text-gold-engraved">
              ✨ THE ROYAL THRONE HALL ✨
            </h1>
            <p className="text-xs sm:text-sm text-[#8b7355] font-mono tracking-widest uppercase">
              An Ancient Sacred Chest Arises from the Vault...
            </p>
          </div>
        )}

        {ceremonyStage === 'chest_awakens' && (
          <div className="space-y-1 animate-bounce">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-amber-300 uppercase tracking-[0.25em] drop-shadow-[0_0_25px_rgba(255,215,0,0.8)]">
              ⚡ THE CHEST AWAKENS ⚡
            </h1>
            <p className="text-xs sm:text-sm text-[#ffd700] font-mono tracking-widest uppercase">
              Golden Energy Breaks the Medieval Seal...
            </p>
          </div>
        )}

        {ceremonyStage === 'goblets_rising' && (
          <div className="space-y-1">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-[#ffd700] uppercase tracking-wider drop-shadow">
              🏆 THE SACRED GOBLETS ASCEND ({risenCount}/10)
            </h1>
            <p className="text-xs sm:text-sm text-[#e0d6c5] font-serif italic">
              Each golden artifact carries a hidden destiny for the realm...
            </p>
          </div>
        )}

        {(ceremonyStage === 'ready' || ceremonyStage === 'closing') && (
          <div className="space-y-1 sm:space-y-1.5 animate-in zoom-in duration-500">
            <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-black text-[#ffd700] uppercase tracking-wider text-gold-engraved drop-shadow-[0_0_25px_rgba(255,215,0,0.8)]">
              🏆 THE ROYAL GOBLET CEREMONY
            </h1>
            <p className="text-xs sm:text-sm md:text-base text-[#e0d6c5] font-serif italic tracking-wide">
              "Choose wisely, for destiny favors the bold."
            </p>

            {/* Current Turn Indicator */}
            {!isRevealed && !isAllPicked && currentSelectingKingdom && (
              <div className="flex items-center justify-center gap-2 pt-1 font-serif">
                <span className="text-[11px] font-bold text-[#8b7355] uppercase tracking-wider">Selecting Realm:</span>
                <div className="px-3.5 py-1 rounded-full border-2 border-[#d4af37] bg-gradient-to-r from-[#2a1c13] via-[#120e0c] to-[#2a1c13] text-xs sm:text-sm font-black flex items-center gap-2 shadow-2xl">
                  <span className="text-lg">{currentSelectingKingdom.bannerSymbol}</span>
                  <span className="text-[#f3e5ab] font-cinzel text-xs sm:text-sm uppercase font-black">
                    {currentSelectingKingdom.name}
                  </span>
                  <button
                    onClick={() => setActiveGonfalonKingdom(currentSelectingKingdom)}
                    className="ml-1 px-2 py-0.5 bg-[#d4af37] text-[#120e0c] rounded text-[10px] font-black uppercase hover:scale-105 transition-transform cursor-pointer shadow"
                  >
                    📜 Royal Gonfalon
                  </button>
                </div>
              </div>
            )}

            {isAllPicked && !isRevealed && (
              <div className="pt-1 animate-bounce font-serif">
                <span className="text-xs font-black text-amber-300 uppercase tracking-widest bg-[#120e0c] px-4 py-1.5 rounded-full border-2 border-[#d4af37] shadow-2xl">
                  ✨ All kingdoms have chosen their goblets! Click below to reveal.
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* MIDDLE SECTION: 10 REALISTIC MEDIEVAL GOBLETS IN TWO SYMMETRICAL ROWS (I-V & VI-X) */}
      <div className="flex-1 w-full max-w-7xl mx-auto flex flex-col justify-center items-center relative z-20 my-1 sm:my-3 px-2 sm:px-4">
        {(ceremonyStage === 'goblets_rising' || ceremonyStage === 'ready' || ceremonyStage === 'closing') && (
          <div className="w-full flex flex-col justify-center items-center space-y-4 sm:space-y-6">
            {/* ROYAL DAIS BANQUET TABLE BACKDROP */}
            <div className="relative w-full max-w-5xl p-3 sm:p-6 md:p-8 rounded-3xl bg-gradient-to-b from-[#1e1510]/85 via-[#120e0c]/95 to-[#0a0705] border-2 border-[#8b7355]/70 shadow-[0_20px_60px_rgba(0,0,0,0.95)] backdrop-blur-md overflow-hidden">
              {/* Subtle Gold filigree corners */}
              <div className="absolute top-2.5 left-2.5 w-5 h-5 border-t-2 border-l-2 border-[#ffd700]" />
              <div className="absolute top-2.5 right-2.5 w-5 h-5 border-t-2 border-r-2 border-[#ffd700]" />
              <div className="absolute bottom-2.5 left-2.5 w-5 h-5 border-b-2 border-l-2 border-[#ffd700]" />
              <div className="absolute bottom-2.5 right-2.5 w-5 h-5 border-b-2 border-r-2 border-[#ffd700]" />

              {/* TWO SYMMETRICAL ROWS OF 5 GOBLETS (TOP: I-V, BOTTOM: VI-X) WITH CEREMONIAL AISLE */}
              <div className="flex flex-col items-center justify-center space-y-8 sm:space-y-12 md:space-y-16 py-2 sm:py-4">
                {/* TOP ROW: Goblets I - V */}
                <div className="grid grid-cols-5 gap-2 sm:gap-6 md:gap-10 lg:gap-14 w-full justify-items-center items-center z-10">
                  {goblets.slice(0, 5).map((goblet, sliceIdx) => {
                    const idx = sliceIdx;
                    const selectedKingdom = goblet.selectedByKingdomId
                      ? activeKingdoms.find((k) => k.id === goblet.selectedByKingdomId)
                      : null;
                    const isWinnerGoblet =
                      winnerInfo && winnerInfo.id === goblet.selectedByKingdomId && goblet.isRevealed;
                    const isSelected = !!selectedKingdom;
                    const isAnySelected = goblets.some((g) => g.selectedByKingdomId !== null);
                    const isDimmed = isAnySelected && !isSelected && !isRevealed;
                    const isRising = ceremonyStage === 'goblets_rising';
                    const romanLabel = ROMAN_NUMERALS[idx] || `${goblet.id}`;
                    const canSelect = ceremonyStage === 'ready' && !isAllPicked && !isRevealed && !isSelected;

                    return (
                      <CeremonialGoblet
                        key={goblet.id}
                        id={goblet.id}
                        romanNumeral={romanLabel}
                        gobletNumber={goblet.number}
                        selectedKingdom={selectedKingdom}
                        isRevealed={goblet.isRevealed}
                        isWinner={!!isWinnerGoblet}
                        isDimmed={isDimmed}
                        isRising={isRising}
                        onClick={() => handleSelectGoblet(goblet.id)}
                        canSelect={canSelect}
                      />
                    );
                  })}
                </div>

                {/* BOTTOM ROW: Goblets VI - X */}
                <div className="grid grid-cols-5 gap-2 sm:gap-6 md:gap-10 lg:gap-14 w-full justify-items-center items-center z-20">
                  {goblets.slice(5, 10).map((goblet, sliceIdx) => {
                    const idx = sliceIdx + 5;
                    const selectedKingdom = goblet.selectedByKingdomId
                      ? activeKingdoms.find((k) => k.id === goblet.selectedByKingdomId)
                      : null;
                    const isWinnerGoblet =
                      winnerInfo && winnerInfo.id === goblet.selectedByKingdomId && goblet.isRevealed;
                    const isSelected = !!selectedKingdom;
                    const isAnySelected = goblets.some((g) => g.selectedByKingdomId !== null);
                    const isDimmed = isAnySelected && !isSelected && !isRevealed;
                    const isRising = ceremonyStage === 'goblets_rising';
                    const romanLabel = ROMAN_NUMERALS[idx] || `${goblet.id}`;
                    const canSelect = ceremonyStage === 'ready' && !isAllPicked && !isRevealed && !isSelected;

                    return (
                      <CeremonialGoblet
                        key={goblet.id}
                        id={goblet.id}
                        romanNumeral={romanLabel}
                        gobletNumber={goblet.number}
                        selectedKingdom={selectedKingdom}
                        isRevealed={goblet.isRevealed}
                        isWinner={!!isWinnerGoblet}
                        isDimmed={isDimmed}
                        isRising={isRising}
                        onClick={() => handleSelectGoblet(goblet.id)}
                        canSelect={canSelect}
                      />
                    );
                  })}
                </div>
              </div>
            </div>

            {/* WINNER ANNOUNCEMENT CELEBRATION BANNER */}
            {winnerInfo && winningKingdom && (
              <div className="p-3.5 sm:p-4 rounded-2xl bg-gradient-to-r from-[#2a1c13] via-[#120e0c] to-[#2a1c13] border-2 border-[#ffd700] text-center space-y-1 shadow-[0_0_50px_rgba(255,215,0,0.9)] animate-in zoom-in duration-500 z-50">
                <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-amber-950 text-[#ffd700] border border-[#ffd700] text-[11px] sm:text-xs font-black uppercase tracking-widest animate-pulse">
                  <Crown className="w-4 h-4 text-[#ffd700]" /> Goblet Champion Declared!
                </div>
                <h3 className="text-xl sm:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#ffd700] via-[#fff8dc] to-[#d4af37]">
                  {winningKingdom.name} Claims the Question Scroll!
                </h3>
                <p className="text-xs sm:text-sm text-[#e0d6c5] font-serif italic">
                  Drawn Highest Sacred Goblet Number #{winnerInfo.num}!
                </p>
              </div>
            )}

            {/* Action Button: Reveal Royal Goblets */}
            {ceremonyStage === 'ready' && !isRevealed && (
              <div className="flex justify-center pt-2">
                <button
                  type="button"
                  onClick={handleRevealAll}
                  disabled={!isAllPicked}
                  className={`px-8 py-3.5 rounded-2xl text-sm sm:text-base font-black tracking-widest uppercase border-2 transition-all flex items-center gap-2.5 shadow-2xl cursor-pointer ${
                    isAllPicked
                      ? 'bg-gradient-to-r from-[#ffd700] via-[#fff8dc] to-[#ffd700] text-[#120e0c] border-[#ffffff] animate-pulse hover:scale-105 shadow-[0_0_40px_rgba(255,215,0,1)]'
                      : 'bg-[#120e0c] text-[#8b7355] border-[#8b7355]/40 opacity-50 cursor-not-allowed'
                  }`}
                >
                  <Sparkles className="w-5 h-5 text-[#120e0c]" />
                  <span>✨ Reveal Royal Goblets ✨</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* BOTTOM SECTION: ANCIENT OPEN TREASURE CHEST DIRECTLY BELOW CENTER GOBLETS */}
      <div className="w-full max-w-md mx-auto relative z-10 pb-1 shrink-0 flex flex-col items-center justify-end">
        {/* Golden Burst / Mist rising from chest */}
        {(ceremonyStage === 'chest_awakens' || ceremonyStage === 'goblets_rising' || ceremonyStage === 'ready' || ceremonyStage === 'closing') && (
          <div className="absolute -top-20 inset-x-0 h-40 bg-radial from-amber-400/50 via-yellow-300/20 to-transparent blur-2xl animate-pulse pointer-events-none" />
        )}

        {/* The Enchanted Oak Treasure Chest */}
        <div className={`relative w-48 sm:w-60 md:w-72 transition-all duration-1000 flex flex-col items-center ${
          ceremonyStage === 'chest_appears' ? 'animate-chest-rise' : ''
        } ${ceremonyStage === 'chest_awakens' ? 'animate-chest-shake' : ''}`}>
          
          {/* Lid of the Chest */}
          <div className={`w-full h-10 sm:h-12 md:h-14 bg-gradient-to-b from-[#3d2a1d] via-[#2a1c13] to-[#1a120c] border-x-4 border-t-4 border-[#d4af37] rounded-t-2xl shadow-2xl relative flex items-center justify-center transition-all duration-1000 z-10 ${
            ceremonyStage !== 'chest_appears'
              ? '-translate-y-6 sm:-translate-y-8 rotate-[20deg] opacity-90 shadow-[0_0_35px_rgba(255,215,0,0.6)]'
              : ''
          }`}>
            {/* Heavy Gold Metal Bands */}
            <div className="absolute inset-y-0 left-5 w-4 bg-gradient-to-r from-[#ffd700] via-[#8b7355] to-[#ffd700] border-x border-[#3d2a1d] shadow-inner" />
            <div className="absolute inset-y-0 right-5 w-4 bg-gradient-to-r from-[#ffd700] via-[#8b7355] to-[#ffd700] border-x border-[#3d2a1d] shadow-inner" />
            
            {/* Dragon Crest */}
            <div className="z-20 text-xl sm:text-2xl filter drop-shadow-[0_0_15px_rgba(255,215,0,0.9)] animate-pulse">🐉</div>
          </div>

          {/* Glowing Golden Interior Light when Opened */}
          {ceremonyStage !== 'chest_appears' && (
            <div className="absolute top-8 inset-x-4 h-10 bg-gradient-to-t from-amber-400 via-yellow-200 to-white rounded-full blur-md opacity-95 animate-pulse z-0" />
          )}

          {/* Body of the Chest */}
          <div className="w-full h-18 sm:h-22 md:h-24 bg-gradient-to-b from-[#2a1c13] via-[#1c120c] to-[#080604] border-x-4 border-b-4 border-[#d4af37] rounded-b-xl shadow-[0_15px_50px_rgba(0,0,0,0.95)] relative flex items-center justify-center z-10">
            {/* Heavy Gold Metal Bands */}
            <div className="absolute inset-y-0 left-5 w-4 bg-gradient-to-r from-[#ffd700] via-[#8b7355] to-[#ffd700] border-x border-[#3d2a1d] shadow-inner" />
            <div className="absolute inset-y-0 right-5 w-4 bg-gradient-to-r from-[#ffd700] via-[#8b7355] to-[#ffd700] border-x border-[#3d2a1d] shadow-inner" />
            
            {/* Medieval Lock */}
            <div className="absolute -top-4 z-30 w-10 sm:w-12 h-10 sm:h-12 rounded-xl bg-gradient-to-b from-[#ffd700] via-[#d4af37] to-[#8b7355] border-2 border-[#fff8dc] shadow-[0_0_20px_rgba(255,215,0,0.9)] flex items-center justify-center transition-all duration-700">
              <Lock className={`w-5 h-5 text-[#1c120c] transition-all duration-500 ${
                ceremonyStage !== 'chest_appears' ? 'opacity-30 scale-75 rotate-12' : ''
              }`} />
            </div>

            {/* Glowing Magical Runes */}
            <div className="absolute inset-x-8 bottom-3 flex justify-around text-[10px] sm:text-xs text-[#ffd700] opacity-85 animate-pulse font-mono tracking-widest font-bold drop-shadow-[0_0_8px_rgba(255,215,0,1)]">
              <span>ᚠ</span><span>ᚢ</span><span>ᚦ</span><span>ᚨ</span><span>ᚱ</span><span>ᚲ</span><span>ᚷ</span><span>ᚹ</span>
            </div>
          </div>
        </div>
      </div>

      {/* Royal Gonfalon Ceremony Modal */}
      {activeGonfalonKingdom && (
        <div className="fixed inset-0 z-50 w-full h-full">
          <KingdomGonfalonCeremony
            kingdom={activeGonfalonKingdom}
            subtitle="CUP CHALLENGE CONTENDER"
            onComplete={() => setActiveGonfalonKingdom(null)}
            autoAdvanceMs={0}
            showNextButton={true}
          />
        </div>
      )}
    </div>
  );
};

