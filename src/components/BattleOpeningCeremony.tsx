import React, { useState, useEffect } from 'react';
import { Kingdom } from '../types';
import { sound } from '../lib/sound';
import { Flame, Sparkles, Shield, Swords, Crown, Trophy } from 'lucide-react';
import { KingdomGonfalonCeremony } from './KingdomGonfalonCeremony';

interface BattleOpeningCeremonyProps {
  kingdoms: Kingdom[];
  onComplete: () => void;
}

type CeremonyScene = 1 | 2 | 3 | 4 | 5;

export const BattleOpeningCeremony: React.FC<BattleOpeningCeremonyProps> = ({
  kingdoms,
  onComplete,
}) => {
  const [scene, setScene] = useState<CeremonyScene>(1);
  const [rollCallIndex, setRollCallIndex] = useState<number>(0);
  const [countdownNumber, setCountdownNumber] = useState<number>(3);
  const [fade, setFade] = useState<boolean>(true);

  // Scene Progression Controller
  useEffect(() => {
    let timer: NodeJS.Timeout;

    if (scene === 1) {
      // Scene 1: Castle Awakens (2.6 seconds)
      sound.playWarDrum();
      timer = setTimeout(() => {
        setFade(false);
        setTimeout(() => {
          setScene(2);
          setFade(true);
        }, 400);
      }, 2600);
    } else if (scene === 2) {
      // Scene 2: Royal Announcement (2.5 seconds)
      sound.playVictoryFanfare();
      timer = setTimeout(() => {
        setFade(false);
        setTimeout(() => {
          setScene(3);
          setRollCallIndex(0);
          setFade(true);
        }, 400);
      }, 2500);
    } else if (scene === 4) {
      // Scene 4: Countdown (3, 2, 1)
      sound.playWarDrum();
      if (countdownNumber > 1) {
        timer = setTimeout(() => {
          setCountdownNumber((prev) => prev - 1);
        }, 1000);
      } else {
        timer = setTimeout(() => {
          setScene(5);
        }, 1000);
      }
    } else if (scene === 5) {
      // Scene 5: Battle Begins (2.5 seconds)
      sound.playSwordSlash();
      setTimeout(() => {
        sound.playVictoryFanfare();
        sound.playWarDrum();
      }, 300);

      timer = setTimeout(() => {
        setFade(false);
        setTimeout(() => {
          onComplete();
        }, 500);
      }, 3000);
    }

    return () => clearTimeout(timer);
  }, [scene, countdownNumber, onComplete]);

  const handleNextKingdomInRollCall = () => {
    if (rollCallIndex < kingdoms.length - 1) {
      setRollCallIndex((prev) => prev + 1);
    } else {
      setFade(false);
      setTimeout(() => {
        setScene(4);
        setCountdownNumber(3);
        setFade(true);
      }, 400);
    }
  };

  return (
    <div className="relative w-full h-screen bg-[#080605]/30 backdrop-blur-sm text-[#e0d6c5] overflow-hidden flex items-center justify-center font-serif select-none z-50">
      {/* Background Atmosphere & Floating Particles */}
      <div className="absolute inset-0 bg-radial-gradient from-[#2a1a10]/30 via-transparent to-[#080605]/40 pointer-events-none" />
      <div className="absolute inset-0 animate-pulse bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-900/10 via-transparent to-transparent pointer-events-none" />
      
      {/* Skip Button */}
      <button
        onClick={onComplete}
        className="absolute top-6 right-6 z-50 px-4 py-2 rounded-xl bg-[#1c1612]/80 border border-[#8b7355]/40 text-[#d4af37] text-xs font-mono tracking-widest uppercase hover:bg-[#d4af37] hover:text-[#1c1612] transition-all duration-200 backdrop-blur cursor-pointer shadow-lg"
      >
        Skip Intro ⏭
      </button>

      {/* SCENE 1: CASTLE AWAKENS */}
      {scene === 1 && (
        <div
          className={`flex flex-col items-center justify-center text-center px-4 transition-opacity duration-500 animate-slow-zoom ${
            fade ? 'opacity-100' : 'opacity-0'
          }`}
        >
          {/* Dark Castle Silhouette with Torches */}
          <div className="relative mb-8">
            <div className="w-48 sm:w-64 h-32 sm:h-40 bg-[#120e0c] border-t-4 border-x-4 border-[#3d2a1d] rounded-t-3xl flex items-end justify-around pb-0 shadow-[0_0_80px_rgba(217,119,6,0.15)] relative">
              {/* Towers */}
              <div className="w-12 h-44 bg-[#1a1410] border-t-4 border-x-2 border-[#574332] absolute -top-12 left-2 rounded-t-lg flex flex-col justify-between p-1">
                <div className="flex justify-between">
                  <div className="w-2 h-3 bg-[#3d2a1d]" />
                  <div className="w-2 h-3 bg-[#3d2a1d]" />
                </div>
                {/* Torch Left */}
                <div className="mx-auto mb-6 flex flex-col items-center">
                  <Flame className="w-5 h-5 text-amber-500 animate-bounce filter drop-shadow-[0_0_10px_rgba(245,158,11,1)]" />
                  <div className="w-1.5 h-4 bg-stone-600" />
                </div>
              </div>

              <div className="w-12 h-44 bg-[#1a1410] border-t-4 border-x-2 border-[#574332] absolute -top-12 right-2 rounded-t-lg flex flex-col justify-between p-1">
                <div className="flex justify-between">
                  <div className="w-2 h-3 bg-[#3d2a1d]" />
                  <div className="w-2 h-3 bg-[#3d2a1d]" />
                </div>
                {/* Torch Right */}
                <div className="mx-auto mb-6 flex flex-col items-center">
                  <Flame className="w-5 h-5 text-amber-500 animate-bounce filter drop-shadow-[0_0_10px_rgba(245,158,11,1)]" />
                  <div className="w-1.5 h-4 bg-stone-600" />
                </div>
              </div>

              {/* Main Gate */}
              <div className="w-20 h-24 bg-[#080605] border-t-4 border-x-4 border-[#574332] rounded-t-full flex items-center justify-center shadow-inner relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-t from-amber-600/20 to-transparent animate-pulse" />
                <Shield className="w-8 h-8 text-[#8b7355]/40" />
              </div>
            </div>
          </div>

          <h1 className="text-2xl sm:text-4xl md:text-5xl font-black font-cinzel text-[#f3e5ab] tracking-widest uppercase drop-shadow-[0_0_25px_rgba(243,229,171,0.6)] animate-pulse">
            THE KINGDOMS HAVE GATHERED...
          </h1>
          <p className="mt-4 text-sm sm:text-base text-[#8b7355] font-mono uppercase tracking-[0.3em]">
            War Drums Echo Across the Realm
          </p>
        </div>
      )}

      {/* SCENE 2: ROYAL ANNOUNCEMENT */}
      {scene === 2 && (
        <div
          className={`flex flex-col items-center justify-center text-center max-w-4xl px-6 transition-opacity duration-500 ${
            fade ? 'opacity-100' : 'opacity-0'
          }`}
        >
          {/* Illuminated Parchment Banner */}
          <div className="relative p-8 sm:p-14 bg-gradient-to-b from-[#2a1e14] via-[#1c140e] to-[#120c08] border-4 border-[#d4af37] rounded-3xl shadow-[0_0_90px_rgba(212,175,55,0.4)] animate-proclamation-rise">
            {/* Corner Ornaments */}
            <div className="absolute -top-3 -left-3 w-8 h-8 border-t-4 border-l-4 border-[#ffd700] rounded-tl-xl" />
            <div className="absolute -top-3 -right-3 w-8 h-8 border-t-4 border-r-4 border-[#ffd700] rounded-tr-xl" />
            <div className="absolute -bottom-3 -left-3 w-8 h-8 border-b-4 border-l-4 border-[#ffd700] rounded-bl-xl" />
            <div className="absolute -bottom-3 -right-3 w-8 h-8 border-b-4 border-r-4 border-[#ffd700] rounded-br-xl" />

            {/* Sparkle effects */}
            <div className="absolute top-4 left-6 animate-spin duration-1000 text-amber-400">
              <Sparkles className="w-6 h-6" />
            </div>
            <div className="absolute bottom-4 right-6 animate-spin duration-1000 text-amber-400">
              <Sparkles className="w-6 h-6" />
            </div>

            <div className="flex justify-center mb-4">
              <Crown className="w-14 h-14 text-[#ffd700] filter drop-shadow-[0_0_15px_rgba(255,215,0,0.8)] animate-bounce" />
            </div>

            <h1 className="text-[min(4.5vw,2.2rem)] sm:text-[min(4vw,3.2rem)] md:text-[min(3.5vw,4rem)] lg:text-5xl font-black font-cinzel text-transparent bg-clip-text bg-gradient-to-r from-[#ffd700] via-[#fff8dc] to-[#d4af37] tracking-tight sm:tracking-wider uppercase mb-4 drop-shadow whitespace-nowrap overflow-hidden max-w-full">
              ⚔️ ROYAL CLASSROOM CHAMPIONSHIP ⚔️
            </h1>

            <div className="w-48 h-0.5 mx-auto bg-gradient-to-r from-transparent via-[#d4af37] to-transparent my-6" />

            <p className="text-lg sm:text-2xl font-serif italic text-[#f3e5ab] tracking-wider">
              "The Great Tournament of Knowledge Begins"
            </p>
          </div>
        </div>
      )}

      {/* SCENE 3: KINGDOM ROLL CALL (REALISTIC GONFALON CEREMONY) */}
      {scene === 3 && kingdoms[rollCallIndex] && (
        <div className="absolute inset-0 z-40 w-full h-full">
          <KingdomGonfalonCeremony
            kingdom={kingdoms[rollCallIndex]}
            subtitle={`CONTENDING REALM (${rollCallIndex + 1} OF ${kingdoms.length})`}
            onComplete={handleNextKingdomInRollCall}
            autoAdvanceMs={3800}
            showNextButton={true}
          />
        </div>
      )}

      {/* SCENE 4: COUNTDOWN */}
      {scene === 4 && (
        <div
          className={`flex flex-col items-center justify-center text-center transition-opacity duration-300 animate-screen-shake ${
            fade ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <div className="text-3xl sm:text-4xl mb-4 animate-bounce">⚔️</div>

          <div className="relative">
            {/* Fire and glowing aura around countdown */}
            <div className="absolute -inset-10 bg-radial-gradient from-amber-500/30 via-rose-600/10 to-transparent blur-xl animate-pulse pointer-events-none" />
            
            <span
              key={countdownNumber}
              className="text-8xl sm:text-9xl font-black font-cinzel text-transparent bg-clip-text bg-gradient-to-b from-[#ffffff] via-[#ffd700] to-[#b45309] drop-shadow-[0_0_50px_rgba(255,215,0,0.9)] animate-proclamation-rise block"
            >
              {countdownNumber}
            </span>
          </div>

          <div className="text-3xl sm:text-4xl mt-4 animate-bounce">⚔️</div>

          <p className="mt-8 text-base sm:text-lg font-mono text-amber-500 uppercase tracking-[0.4em] animate-pulse">
            Prepare Your Shields...
          </p>
        </div>
      )}

      {/* SCENE 5: BATTLE BEGINS */}
      {scene === 5 && (
        <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
          {/* Opening Gates Effect */}
          <div className="absolute inset-y-0 left-0 w-1/2 bg-[#120e0c] border-r-4 border-[#d4af37] z-20 animate-gate-left flex items-center justify-end pr-8 shadow-2xl">
            <Swords className="w-16 h-16 text-[#8b7355]/40" />
          </div>
          <div className="absolute inset-y-0 right-0 w-1/2 bg-[#120e0c] border-l-4 border-[#d4af37] z-20 animate-gate-right flex items-center justify-start pl-8 shadow-2xl">
            <Swords className="w-16 h-16 text-[#8b7355]/40" />
          </div>

          {/* Sword Slash VFX Beam */}
          <div className="absolute inset-0 z-30 pointer-events-none flex items-center justify-center overflow-hidden">
            <div className="w-full h-4 bg-gradient-to-r from-transparent via-white to-amber-300 shadow-[0_0_40px_rgba(255,255,255,1)] animate-sword-slash transform -rotate-12" />
          </div>

          {/* Main Proclamation */}
          <div className="relative z-10 text-center px-6 animate-proclamation-rise">
            <div className="flex justify-center items-center gap-4 mb-6">
              <Flame className="w-10 h-10 text-rose-500 animate-bounce" />
              <Swords className="w-16 h-16 text-[#ffd700] filter drop-shadow-[0_0_25px_rgba(255,215,0,0.9)]" />
              <Flame className="w-10 h-10 text-amber-500 animate-bounce" />
            </div>

            <h1 className="text-[min(5vw,2.5rem)] sm:text-[min(4.5vw,3.5rem)] md:text-[min(4vw,4.5rem)] font-black font-cinzel text-transparent bg-clip-text bg-gradient-to-r from-[#ffd700] via-[#ffffff] to-[#d4af37] tracking-tight sm:tracking-widest uppercase mb-6 drop-shadow-[0_0_35px_rgba(212,175,55,0.8)] whitespace-nowrap">
              ⚔️ LET THE WAR BEGIN! ⚔️
            </h1>

            <div className="inline-block px-8 py-3 rounded-full bg-amber-950/80 border-2 border-[#ffd700] shadow-[0_0_30px_rgba(245,158,11,0.5)]">
              <span className="text-sm sm:text-lg font-mono font-bold text-amber-300 uppercase tracking-[0.3em]">
                May the Wisest Champions Prevail!
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
