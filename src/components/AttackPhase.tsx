import React, { useState, useEffect } from 'react';
import { Kingdom, Member, RoleType, ROLE_DEFINITIONS, AttackResult } from '../types';
import { sound } from '../lib/sound';
import { Swords, Sparkles, Lock, Crown, Flame, Shield, MapPin } from 'lucide-react';
import { KingdomGonfalonCeremony } from './KingdomGonfalonCeremony';

import kingCapturedImg from '../assets/images/scene_king_captured_1785576213458.jpg';
import queenCapturedImg from '../assets/images/scene_queen_captured_1785576230924.jpg';
import princeCapturedImg from '../assets/images/scene_prince_captured_1785576247912.jpg';
import princessCapturedImg from '../assets/images/scene_princess_captured_1785576260644.jpg';
import knightCapturedImg from '../assets/images/scene_knight_captured_1785576275095.jpg';
import workerCapturedImg from '../assets/images/scene_worker_captured_1785576287466.jpg';
import jokerCapturedImg from '../assets/images/scene_joker_captured_1785576298388.jpg';

export interface CaptureSceneConfig {
  bgImage: string;
  location: string;
  title: string;
  scenario: string;
  symbolism: string;
  pointsText: string;
  pointsValue: number;
  badge: string;
  border: string;
  shadow: string;
  particles: string;
  accentColor: string;
  counterBg: string;
}

export const CAPTURE_SCENES: Record<RoleType, CaptureSceneConfig> = {
  king: {
    bgImage: kingCapturedImg,
    location: 'Royal Throne Room',
    title: '👑 THE KING HAS BEEN CAPTURED',
    scenario:
      'The defeated King kneels before the victorious kingdom with hands bound in rope. His royal crown lies fallen upon the stone floor beside him, while royal guards stand watch before the empty throne.',
    symbolism: '👑 Fallen Crown • Empty Throne • Kingdom Captured',
    pointsText: '+50 Points',
    pointsValue: 50,
    badge: 'bg-amber-400 text-[#120e0c] border-[#fff8dc]',
    border: 'border-[#ffd700]',
    shadow: 'shadow-[0_0_80px_rgba(255,215,0,0.9)]',
    particles: 'gold_confetti',
    accentColor: 'text-[#ffd700]',
    counterBg: 'bg-[#ffd700]/25 text-[#ffd700] border-[#ffd700]',
  },
  queen: {
    bgImage: queenCapturedImg,
    location: "Queen's Chamber",
    title: '👸 THE QUEEN HAS BEEN CAPTURED',
    scenario:
      'The Queen kneels gracefully with her hands tied in silk rope. Her royal crown rests upon a nearby marble table while guards escort her through the chamber stained glass.',
    symbolism: '👑 Crown Surrendered • Stained Glass Chamber • Royal Escort',
    pointsText: '+30 Points',
    pointsValue: 30,
    badge: 'bg-[#f3e5ab] text-[#1f1228] border-[#ffffff]',
    border: 'border-[#f3e5ab]',
    shadow: 'shadow-[0_0_70px_rgba(243,229,171,0.85)]',
    particles: 'rose_petals',
    accentColor: 'text-[#f3e5ab]',
    counterBg: 'bg-[#f3e5ab]/25 text-[#f3e5ab] border-[#f3e5ab]',
  },
  prince: {
    bgImage: princeCapturedImg,
    location: 'Castle Armory',
    title: '🤴 THE PRINCE HAS BEEN CAPTURED',
    scenario:
      'The Prince kneels beside dropped steel plate armor and his fallen broadsword. His hands are bound with thick rope while guards stand nearby in the castle armory.',
    symbolism: '⚔️ Dropped Armor • Fallen Blade • Bound Hands',
    pointsText: '+15 Points',
    pointsValue: 15,
    badge: 'bg-[#3b82f6] text-[#ffffff] border-[#93c5fd]',
    border: 'border-[#60a5fa]',
    shadow: 'shadow-[0_0_60px_rgba(96,165,250,0.8)]',
    particles: 'steel_sparks',
    accentColor: 'text-[#60a5fa]',
    counterBg: 'bg-[#3b82f6]/25 text-[#93c5fd] border-[#60a5fa]',
  },
  princess: {
    bgImage: princessCapturedImg,
    location: 'Royal Garden Pavilion',
    title: '👸 THE PRINCESS HAS BEEN CAPTURED',
    scenario:
      'The Princess is seated calmly in the stone garden pavilion, her hands gently bound in silk rope as royal guards escort her through blooming rose arches.',
    symbolism: '🌹 Silk Bound Hands • Garden Escort • Regal Dignity',
    pointsText: '+15 Points',
    pointsValue: 15,
    badge: 'bg-[#ffb6c1] text-[#2e091b] border-[#ffffff]',
    border: 'border-[#ffb6c1]',
    shadow: 'shadow-[0_0_60px_rgba(255,182,193,0.8)]',
    particles: 'cherry_blossoms',
    accentColor: 'text-[#ffb6c1]',
    counterBg: 'bg-[#ffb6c1]/25 text-[#ffb6c1] border-[#ffb6c1]',
  },
  knight: {
    bgImage: knightCapturedImg,
    location: 'Battlefield Camp',
    title: '⚔️ KNIGHT CAPTURED',
    scenario:
      'The valiant Knight kneels after defeat with steel helmet removed and sword laid upon the ground. His hands are tied behind his back as opposing soldiers claim the camp.',
    symbolism: '🛡️ Helmet Removed • Unsheathed Sword • Soldiers Standing',
    pointsText: '+5 Points',
    pointsValue: 5,
    badge: 'bg-[#4b5563] text-[#ffffff] border-[#d1d5db]',
    border: 'border-[#9ca3af]',
    shadow: 'shadow-[0_0_50px_rgba(156,163,175,0.7)]',
    particles: 'steel_sparks',
    accentColor: 'text-[#d1d5db]',
    counterBg: 'bg-[#4b5563]/25 text-[#e5e7eb] border-[#9ca3af]',
  },
  worker: {
    bgImage: workerCapturedImg,
    location: 'Medieval Workshop',
    title: '👷 WORKER CAPTURED',
    scenario:
      'The artisan worker sits upon a wooden crate with bound hands while guards supervise nearby beside the blacksmith anvil and workshop tools.',
    symbolism: '🔨 Wooden Crate • Bound Hands • Supervised Workshop',
    pointsText: '+1 Point',
    pointsValue: 1,
    badge: 'bg-[#b45309] text-[#fffbeb] border-[#fde68a]',
    border: 'border-[#d97706]',
    shadow: 'shadow-[0_0_45px_rgba(217,119,6,0.7)]',
    particles: 'wood_sparks',
    accentColor: 'text-[#f59e0b]',
    counterBg: 'bg-[#b45309]/25 text-[#fcd34d] border-[#f59e0b]',
  },
  joker: {
    bgImage: jokerCapturedImg,
    location: "Jester's Hall",
    title: '🎭 THE JOKER HAS BEEN CAPTURED',
    scenario:
      'The Court Joker sits with loosely tied hands, still smiling mischievously despite being captured amidst colorful festive banners and stage props.',
    symbolism: '🃏 Mischievous Smile • Loose Ropes • Court Trickster',
    pointsText: '−3 Points',
    pointsValue: -3,
    badge: 'bg-[#7e22ce] text-[#f3e8ff] border-[#c084fc]',
    border: 'border-[#a855f7]',
    shadow: 'shadow-[0_0_65px_rgba(168,85,247,0.9)]',
    particles: 'crimson_smoke',
    accentColor: 'text-[#c084fc]',
    counterBg: 'bg-[#7e22ce]/25 text-[#e9d5ff] border-[#a855f7]',
  },
  citizen: {
    bgImage: workerCapturedImg,
    location: 'Royal Square',
    title: '👤 CITIZEN CAPTURED',
    scenario: 'An ordinary citizen of the realm has been unveiled.',
    symbolism: '👤 Common Citizen',
    pointsText: '0 Points',
    pointsValue: 0,
    badge: 'bg-[#574332] text-[#f3e5ab] border-[#8b7355]',
    border: 'border-[#8b7355]',
    shadow: 'shadow-[0_0_30px_rgba(139,115,85,0.6)]',
    particles: 'none',
    accentColor: 'text-[#f3e5ab]',
    counterBg: 'bg-[#574332]/25 text-[#f3e5ab] border-[#8b7355]',
  },
};

interface AttackPhaseProps {
  attackingKingdom: Kingdom;
  opposingKingdoms: Kingdom[];
  roundNumber: number;
  onAttackComplete: (result: AttackResult) => void;
}

const getCardWidthClass = (count: number) => {
  if (count > 10) return 'w-[46%] sm:w-[30%] lg:w-[18%] max-w-[210px]'; // 5 per row (e.g. 5, 5, 3)
  if (count >= 9) return 'w-[46%] sm:w-[30%] lg:w-[18%] max-w-[210px]'; // 5 per row (e.g. 5, 5)
  if (count >= 7) return 'w-[46%] sm:w-[46%] lg:w-[22.5%] max-w-[240px]'; // 4 per row (e.g. 4, 4)
  if (count >= 5) return 'w-[46%] sm:w-[46%] lg:w-[30%] max-w-[280px]'; // 3 per row (e.g. 3, 3)
  if (count === 4) return 'w-[46%] sm:w-[46%] lg:w-[44%] max-w-[320px]'; // 2 per row (e.g. 2, 2)
  if (count === 3) return 'w-[46%] sm:w-[46%] lg:w-[30%] max-w-[280px]'; // 3 per row (e.g. 3)
  return 'w-[80%] sm:w-[50%] lg:w-[44%] max-w-[320px]'; // 2 or 1 per row
};

type InvasionStage = 'idle' | 'gate_sealed' | 'gate_shaking' | 'gate_opening' | 'courtyard_entered';
type CardRevealStage = 'idle' | 'rising' | 'flipping_back' | 'flipping_front' | 'flipped';

export const AttackPhase: React.FC<AttackPhaseProps> = ({
  attackingKingdom,
  opposingKingdoms,
  roundNumber,
  onAttackComplete,
}) => {
  const [selectedDefenderId, setSelectedDefenderId] = useState<string | null>(null);
  const [isOverlayOpen, setIsOverlayOpen] = useState<boolean>(true);
  const [animatingSelectionId, setAnimatingSelectionId] = useState<string | null>(null);

  // Castle Invasion Sequence State
  const [invasionStage, setInvasionStage] = useState<InvasionStage>('idle');

  // Secret Citizen Card Selection State
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [cardRevealStage, setCardRevealStage] = useState<CardRevealStage>('idle');
  const [animatedPoints, setAnimatedPoints] = useState<number>(0);
  const [viewGonfalonKingdom, setViewGonfalonKingdom] = useState<Kingdom | null>(null);

  const selectedDefender = opposingKingdoms.find((k) => k.id === selectedDefenderId);

  // Select Target Kingdom from Overlay -> Start Castle Invasion!
  const handleSelectDefenderOverlay = (defenderId: string) => {
    sound.playGobletSelect();
    setAnimatingSelectionId(defenderId);

    setTimeout(() => {
      setSelectedDefenderId(defenderId);
      setSelectedMember(null);
      setCardRevealStage('idle');
      setIsOverlayOpen(false);
      setAnimatingSelectionId(null);

      // Start Castle Invasion Sequence
      setInvasionStage('gate_sealed');
    }, 800);
  };

  // Handle Castle Invasion Timers
  useEffect(() => {
    if (!selectedDefenderId || invasionStage === 'idle' || invasionStage === 'courtyard_entered') return;

    let timer: NodeJS.Timeout;

    if (invasionStage === 'gate_sealed') {
      timer = setTimeout(() => {
        setInvasionStage('gate_shaking');
        sound.playGateRattle();
      }, 1200);
    } else if (invasionStage === 'gate_shaking') {
      timer = setTimeout(() => {
        setInvasionStage('gate_opening');
        sound.playGateOpen();
      }, 1800);
    } else if (invasionStage === 'gate_opening') {
      timer = setTimeout(() => {
        setInvasionStage('courtyard_entered');
      }, 1800);
    }

    return () => clearTimeout(timer);
  }, [invasionStage, selectedDefenderId]);

  // Click a Secret Citizen Card
  const handleSelectMemberCard = (member: Member) => {
    if (member.isCaptured || cardRevealStage !== 'idle' || invasionStage !== 'courtyard_entered') return;

    sound.playMagicalHum();
    setSelectedMember(member);
    setCardRevealStage('flipping_back');

    // At midpoint (450ms), switch from back of card to front of card!
    setTimeout(() => {
      setCardRevealStage('flipping_front');
      sound.playCardFlip();
    }, 450);

    // At 900ms, complete flip and trigger reveal celebration!
    setTimeout(() => {
      setCardRevealStage('flipped');
      sound.playGobletReveal();
      const roleInfo = ROLE_DEFINITIONS[member.role];

      // Play role-specific celebration sound
      switch (member.role) {
        case 'king':
          sound.playVictoryFanfare();
          break;
        case 'queen':
        case 'princess':
          sound.playHarpFlourish();
          break;
        case 'prince':
          sound.playBattleHorn();
          break;
        case 'knight':
          sound.playSwordClash();
          break;
        case 'worker':
          sound.playHammerImpact();
          break;
        case 'joker':
          sound.playJokerSound();
          break;
        default:
          sound.playChestUnlock(roleInfo.points >= 0);
          break;
      }

      // Stepwise Animated Score Counter over 1.4s
      const targetPts = roleInfo.points;
      const stepCount = Math.min(Math.abs(targetPts), 10);
      if (stepCount > 0) {
        let current = 0;
        const intervalTime = Math.max(60, Math.floor(1100 / stepCount));
        const timer = setInterval(() => {
          if (targetPts >= 0) {
            current += Math.ceil(targetPts / stepCount);
            if (current >= targetPts) {
              current = targetPts;
              clearInterval(timer);
            }
          } else {
            current -= Math.ceil(Math.abs(targetPts) / stepCount);
            if (current <= targetPts) {
              current = targetPts;
              clearInterval(timer);
            }
          }
          setAnimatedPoints(current);
          sound.playScoreTick(targetPts >= 0);
        }, intervalTime);
      } else {
        setAnimatedPoints(0);
      }

      // Complete attack after 4.5s of celebration
      const attackResult: AttackResult = {
        attackerKingdomId: attackingKingdom.id,
        defenderKingdomId: selectedDefenderId,
        memberId: member.id,
        memberName: member.name,
        role: member.role,
        pointsDelta: roleInfo.points,
        round: roundNumber,
      };

      setTimeout(() => {
        onAttackComplete(attackResult);
      }, 4500);
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#060403]/25 backdrop-blur-sm flex flex-col justify-between items-center p-2 sm:p-4 font-cinzel overflow-hidden select-none">
      {/* Background Castle Atmosphere, Fog & Torches */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute inset-0 bg-radial from-[#2a1a10]/30 via-transparent to-[#080605]/40" />
        <div className="absolute top-4 left-6 text-3xl sm:text-4xl animate-torch">🔥</div>
        <div className="absolute top-4 right-6 text-3xl sm:text-4xl animate-torch">🔥</div>
        <div className="absolute bottom-1/3 left-10 text-xs text-amber-400/20 animate-particle">✨</div>
        <div className="absolute top-1/4 right-1/4 text-xs text-amber-300/30 animate-particle" style={{ animationDelay: '1.5s' }}>✨</div>
      </div>

      {/* HEADER BANNER (CENTERED, SMALLER TITLE WITHOUT 'PHASE 3:') */}
      <div className="w-full max-w-6xl mx-auto text-center space-y-1.5 relative z-20 pt-1 shrink-0">
        <div className="inline-flex items-center gap-1.5 px-3.5 py-0.5 rounded-full bg-[#120e0c] border border-[#d4af37] text-[#f3e5ab] text-[10px] sm:text-xs font-black uppercase tracking-widest shadow-xl">
          <Swords className="w-3.5 h-3.5 text-rose-500 animate-pulse" /> Royal Kingdom Assault
        </div>

        <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-[#f3e5ab] uppercase tracking-[0.25em] text-gold-engraved drop-shadow-[0_0_20px_rgba(255,215,0,0.8)]">
          ⚔️ ROYAL WAR ROOM
        </h1>

        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-4 pt-0.5">
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-bold text-[#8b7355] uppercase font-serif">Attacker:</span>
            <div className={`px-3 py-0.5 rounded-full border text-xs sm:text-sm font-black flex items-center gap-1.5 shadow bg-gradient-to-r ${attackingKingdom.colorGradient} ${attackingKingdom.borderColor}`}>
              <span className="text-base sm:text-lg">{attackingKingdom.bannerSymbol}</span>
              <span className="text-[#f3e5ab] font-cinzel">{attackingKingdom.name}</span>
            </div>
          </div>

          {selectedDefender && (
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-black text-rose-500">⚔</span>
              <span className="text-[11px] font-bold text-[#8b7355] uppercase font-serif">Target:</span>
              <div className={`px-3 py-0.5 rounded-full border text-xs sm:text-sm font-black flex items-center gap-1.5 shadow bg-gradient-to-r ${selectedDefender.colorGradient} ${selectedDefender.borderColor}`}>
                <span className="text-base sm:text-lg">{selectedDefender.bannerSymbol}</span>
                <span className="text-[#f3e5ab] font-cinzel">{selectedDefender.name}</span>
              </div>

              <button
                type="button"
                onClick={() => setIsOverlayOpen(true)}
                className="ml-2 px-2.5 py-1 bg-[#120e0c] hover:bg-[#2a1c13] text-[#d4af37] border border-[#8b7355] rounded-lg text-[10px] font-bold flex items-center gap-1 cursor-pointer transition-all shadow hover:scale-105"
              >
                ⚔ Change Target
              </button>
            </div>
          )}
        </div>
      </div>

      {/* CINEMATIC ENEMY KINGDOM SELECTION OVERLAY */}
      {isOverlayOpen && (
        <div className="fixed inset-0 z-50 bg-[#060403]/95 backdrop-blur-md flex flex-col items-center justify-center p-4 sm:p-6 font-cinzel overflow-y-auto animate-in fade-in duration-300">
          <div className="w-full max-w-5xl text-center space-y-6 my-auto">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#120e0c] border border-[#d4af37] text-[#d4af37] text-xs font-black uppercase tracking-widest shadow-2xl">
                <Swords className="w-4 h-4 text-rose-500 animate-pulse" /> Royal Council of War
              </div>

              <h2 className="text-2xl sm:text-4xl font-black text-[#f3e5ab] uppercase tracking-wider text-gold-engraved">
                ⚔ CHOOSE YOUR TARGET KINGDOM ⚔
              </h2>

              <p className="text-xs sm:text-sm text-[#e0d6c5] max-w-md mx-auto font-merriweather italic leading-relaxed">
                Select an opposing kingdom to storm their castle fortress.
              </p>

              <div className="flex items-center justify-center gap-2 pt-1 text-xs">
                <span className="text-[#8b7355] font-serif">Attacking Realm:</span>
                <span className="font-bold text-[#f3e5ab] px-3.5 py-1 bg-[#120e0c] rounded-full border border-[#d4af37] flex items-center gap-1.5">
                  <span className="text-lg">{attackingKingdom.bannerSymbol}</span>
                  <span>{attackingKingdom.name}</span>
                </span>
              </div>
            </div>

            {/* Floating Dynamic Kingdom Cards Grid */}
            <div className="flex flex-wrap items-center justify-center gap-5 sm:gap-8 pt-2 max-w-4xl mx-auto">
              {opposingKingdoms.map((defender, idx) => {
                const isTargeted = animatingSelectionId === defender.id;
                const isOtherFaded = animatingSelectionId !== null && !isTargeted;
                const remainingCount = defender.members.filter((m) => !m.isCaptured).length;

                const floatClass =
                  idx % 3 === 0
                    ? 'animate-magical-float-1'
                    : idx % 3 === 1
                    ? 'animate-magical-float-2'
                    : 'animate-magical-float-3';

                return (
                  <div
                    key={defender.id}
                    onClick={() => handleSelectDefenderOverlay(defender.id)}
                    className={`w-64 sm:w-72 p-5 rounded-3xl border-2 transition-all duration-500 cursor-pointer select-none relative overflow-hidden group shadow-2xl ${
                      isTargeted
                        ? 'bg-[#1e1610] border-[#f3e5ab] ring-4 ring-[#d4af37] scale-110 shadow-[0_0_50px_rgba(212,175,55,0.9)] z-20'
                        : isOtherFaded
                        ? 'opacity-30 blur-[1px] scale-95 pointer-events-none'
                        : `bg-[#16100c]/90 hover:bg-[#1e1610] ${defender.borderColor} hover:border-[#f3e5ab] hover:scale-[1.04] hover:-translate-y-3 ${floatClass} animate-gold-aura`
                    }`}
                  >
                    <div className="absolute top-2.5 right-3 text-xs text-[#d4af37]/50 pointer-events-none group-hover:animate-spin">
                      ✨
                    </div>

                    <div className="flex flex-col items-center text-center space-y-3 relative z-10">
                      <div className="w-16 h-16 rounded-2xl bg-[#120e0c] border-2 border-[#d4af37] flex items-center justify-center text-4xl shadow-inner group-hover:scale-110 transition-transform">
                        {defender.bannerSymbol}
                      </div>

                      <div>
                        <h3 className="font-cinzel font-black text-[#f3e5ab] text-lg sm:text-xl tracking-wide">
                          {defender.name}
                        </h3>
                        <p className="text-xs font-mono font-bold text-[#d4af37] mt-0.5">
                          Score: {defender.score} Pts
                        </p>
                      </div>

                      <div className="w-full pt-2 border-t border-[#8b7355]/30 flex items-center justify-between text-xs font-serif text-[#e0d6c5]">
                        <span className="text-[#8b7355]">Citizens:</span>
                        <span className="font-bold text-amber-300 font-mono">
                          ⚔ {remainingCount} / {defender.members.length} Hidden
                        </span>
                      </div>

                      <div className="pt-1 w-full">
                        <span className="block w-full py-2 bg-[#120e0c] group-hover:bg-[#d4af37] group-hover:text-[#120e0c] text-[#d4af37] border border-[#d4af37] rounded-xl text-xs font-black uppercase tracking-wider transition-all">
                          {isTargeted ? '⚔ TARGET DECLARED! ⚔' : 'Storm Fortress'}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* MAIN CONTENT AREA: CASTLE INVASION OR COURTYARD WITH HIDDEN CARDS */}
      <div className="flex-1 w-full max-w-[96vw] xl:max-w-7xl mx-auto flex flex-col justify-center items-center relative z-20 my-1 overflow-hidden">
        {selectedDefender ? (
          <>
            {/* SCENES 1, 2, 3: THE CASTLE INVASION GATE SEQUENCE */}
            {invasionStage !== 'courtyard_entered' && (
              <div className="w-full flex flex-col items-center justify-center space-y-6 sm:space-y-8 animate-in fade-in duration-500 my-auto">
                {/* Castle Fortress Crest */}
                <div className="text-center space-y-2">
                  <div className="text-5xl sm:text-7xl filter drop-shadow-[0_0_30px_rgba(255,215,0,0.8)] animate-pulse">
                    🏰
                  </div>
                  <div className="text-xs font-mono tracking-[0.3em] text-[#d4af37] opacity-80">
                    ═══════════════════════════
                  </div>
                  <h2 className="text-2xl sm:text-4xl md:text-5xl font-black text-[#f3e5ab] uppercase tracking-widest text-gold-engraved drop-shadow-[0_0_35px_rgba(255,215,0,0.9)]">
                    {selectedDefender.name}
                  </h2>
                  <div className="text-xs font-mono tracking-[0.3em] text-[#d4af37] opacity-80">
                    ═══════════════════════════
                  </div>
                </div>

                {/* Massive Dark Oak & Iron Castle Gates */}
                <div className="relative w-72 sm:w-96 md:w-[460px] h-48 sm:h-64 md:h-72 flex justify-center items-center overflow-hidden rounded-t-full border-x-8 border-t-8 border-[#3d2a1d] shadow-[0_20px_70px_rgba(0,0,0,0.95)] bg-[#0c0806]">
                  {/* Torchlight shining from behind doors when opening */}
                  <div className="absolute inset-0 bg-radial from-amber-500/80 via-yellow-400/40 to-transparent animate-pulse opacity-90 z-0" />

                  {/* Left Gate Door */}
                  <div
                    className={`absolute top-0 bottom-0 left-0 w-1/2 bg-gradient-to-r from-[#2a1a10] via-[#1c120c] to-[#0f0a07] border-r-2 border-[#120e0c] flex flex-col justify-between p-4 z-10 shadow-2xl ${
                      invasionStage === 'gate_shaking' ? 'animate-gate-shake' : ''
                    } ${invasionStage === 'gate_opening' ? 'animate-gate-swing-left' : ''}`}
                  >
                    {/* Iron Reinforcement Bands */}
                    <div className="w-full h-3 bg-gradient-to-r from-[#5c4033] via-[#8b7355] to-[#3d2a1d] border-y border-[#120e0c] shadow-inner mt-6" />
                    <div className="w-full h-3 bg-gradient-to-r from-[#5c4033] via-[#8b7355] to-[#3d2a1d] border-y border-[#120e0c] shadow-inner" />
                    <div className="w-full h-3 bg-gradient-to-r from-[#5c4033] via-[#8b7355] to-[#3d2a1d] border-y border-[#120e0c] shadow-inner mb-6" />
                  </div>

                  {/* Right Gate Door */}
                  <div
                    className={`absolute top-0 bottom-0 right-0 w-1/2 bg-gradient-to-l from-[#2a1a10] via-[#1c120c] to-[#0f0a07] border-l-2 border-[#120e0c] flex flex-col justify-between p-4 z-10 shadow-2xl ${
                      invasionStage === 'gate_shaking' ? 'animate-gate-shake' : ''
                    } ${invasionStage === 'gate_opening' ? 'animate-gate-swing-right' : ''}`}
                  >
                    {/* Iron Reinforcement Bands */}
                    <div className="w-full h-3 bg-gradient-to-l from-[#5c4033] via-[#8b7355] to-[#3d2a1d] border-y border-[#120e0c] shadow-inner mt-6" />
                    <div className="w-full h-3 bg-gradient-to-l from-[#5c4033] via-[#8b7355] to-[#3d2a1d] border-y border-[#120e0c] shadow-inner" />
                    <div className="w-full h-3 bg-gradient-to-l from-[#5c4033] via-[#8b7355] to-[#3d2a1d] border-y border-[#120e0c] shadow-inner mb-6" />
                  </div>

                  {/* Royal Lock Emblem in Center */}
                  {invasionStage !== 'gate_opening' && (
                    <div className="absolute z-20 w-16 h-16 rounded-full bg-gradient-to-b from-[#ffd700] via-[#d4af37] to-[#8b7355] border-4 border-[#fff8dc] shadow-[0_0_30px_rgba(255,215,0,0.9)] flex items-center justify-center animate-pulse">
                      <Lock className="w-7 h-7 text-[#1c120c]" />
                    </div>
                  )}

                  {/* Magical Smoke escaping when opening */}
                  {invasionStage === 'gate_opening' && (
                    <div className="absolute inset-x-0 bottom-0 text-center text-4xl animate-smoke-rise z-20">
                      💨✨💨
                    </div>
                  )}
                </div>

                {/* Status Notice */}
                <div className="h-8 flex items-center justify-center">
                  {invasionStage === 'gate_sealed' && (
                    <p className="text-sm sm:text-base font-serif italic text-[#8b7355] animate-pulse">
                      The gates are sealed...
                    </p>
                  )}
                  {invasionStage === 'gate_shaking' && (
                    <p className="text-base sm:text-lg font-black font-cinzel text-amber-300 uppercase tracking-widest animate-bounce drop-shadow-[0_0_15px_rgba(255,215,0,1)]">
                      ⚡ BREAKING CASTLE DEFENSES! ⚡
                    </p>
                  )}
                  {invasionStage === 'gate_opening' && (
                    <p className="text-base sm:text-lg font-black font-cinzel text-[#ffd700] uppercase tracking-widest animate-pulse drop-shadow-[0_0_20px_rgba(255,215,0,1)]">
                      ✨ ENTERING THE ROYAL COURTYARD! ✨
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* SCENE 4: THE CASTLE COURTYARD WITH HIDDEN CITIZEN SHIELD CARDS */}
            {invasionStage === 'courtyard_entered' && (
              <div className="w-full flex flex-col items-center justify-between flex-1 animate-courtyard-zoom">
                {/* Courtyard Subtitle */}
                <div className="text-center space-y-1 mb-2 shrink-0">
                  <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-[#120e0c]/90 border border-[#d4af37] text-[#f3e5ab] text-xs font-black uppercase tracking-widest shadow-xl">
                    <Sparkles className="w-3.5 h-3.5 text-[#d4af37]" /> Inside {selectedDefender.name} Fortress
                  </div>
                  <p className="text-xs sm:text-sm text-[#e0d6c5] font-merriweather italic">
                    Choose a secret royal citizen. Their true identity and reward will be unveiled upon selection!
                  </p>
                </div>

                {/* HIDDEN MEMBER CARDS RESPONSIVE SYMMETRICAL GRID */}
                {(() => {
                  const remainingMembers = selectedDefender.members.filter((m) => !m.isCaptured);
                  const cardWidthClass = getCardWidthClass(remainingMembers.length);

                  return (
                    <div className="flex flex-wrap justify-center items-stretch gap-3 sm:gap-4 md:gap-5 max-w-6xl mx-auto w-full px-4 py-2 flex-1">
                      {remainingMembers.map((member, idx) => (
                        <div
                          key={member.id}
                          onClick={() => handleSelectMemberCard(member)}
                          style={{ animationDelay: `${idx * 50}ms` }}
                          className={`group relative ${cardWidthClass} bg-gradient-to-b from-[#3d2a1d] via-[#2a1c13] to-[#160e0a] hover:from-[#4d3525] hover:via-[#362419] hover:to-[#1e140e] border-2 border-[#d4af37] rounded-t-2xl rounded-b-3xl sm:rounded-b-[2.5rem] p-4 sm:p-5 flex flex-col items-center justify-between text-center transition-all duration-300 cursor-pointer select-none shadow-[0_8px_25px_rgba(0,0,0,0.8)] min-h-[125px] sm:min-h-[150px] md:min-h-[160px] hover:-translate-y-2.5 hover:scale-[1.03] hover:border-[#fff8dc] hover:ring-2 hover:ring-[#ffd700] hover:shadow-[0_0_35px_rgba(255,215,0,0.8)] animate-card-slide-in overflow-hidden`}
                        >
                          {/* Hover Magical Sparkles */}
                          <div className="absolute top-2.5 right-2.5 text-sm opacity-0 group-hover:opacity-100 transition-opacity text-amber-300 pointer-events-none animate-spin">
                            ✨
                          </div>

                          {/* Top Shield Emblem / Royal Crest */}
                          <div className="w-12 sm:w-14 md:w-16 h-12 sm:h-14 md:h-16 rounded-full bg-[#120e0c] border-2 border-[#d4af37] flex items-center justify-center text-2xl sm:text-3xl mt-1 shadow-inner group-hover:scale-110 group-hover:rotate-6 transition-all transform group-hover:border-[#ffd700] group-hover:shadow-[0_0_15px_rgba(255,215,0,0.5)]">
                            ❓
                          </div>

                          {/* Warrior Card Details: Student Name, Kingdom & Hidden Role */}
                          <div className="my-2 w-full space-y-1">
                            {/* 👤 Student Name */}
                            <span className="block text-sm sm:text-base font-black text-[#f3e5ab] font-cinzel tracking-wider group-hover:text-amber-200 drop-shadow-sm uppercase truncate">
                              {member.name}
                            </span>

                            {/* 🏰 Kingdom Name & Banner */}
                            <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#120e0c]/80 border border-[#8b7355]/60 text-[10px] sm:text-xs text-[#e0d6c5] max-w-full">
                              <span className="shrink-0">{selectedDefender.bannerSymbol}</span>
                              <span className="font-serif truncate">{selectedDefender.name}</span>
                            </div>

                            {/* ❓ Role Hidden */}
                            <span className="block text-[10px] sm:text-xs text-[#d4af37] font-serif italic pt-0.5">
                              🔒 Role Hidden
                            </span>
                          </div>

                          {/* Bottom Shield Tip Accent */}
                          <div className="w-10 h-1.5 bg-gradient-to-r from-transparent via-[#d4af37]/60 to-transparent rounded-full mb-0.5 group-hover:bg-amber-300 group-hover:shadow-[0_0_10px_rgba(255,215,0,0.8)] transition-all" />
                        </div>
                      ))}
                    </div>
                  );
                })()}
              </div>
            )}
          </>
        ) : (
          <div className="text-center p-8 sm:p-12 bg-[#16100c] border-2 border-[#8b7355] rounded-3xl space-y-3">
            <p className="text-sm text-[#e0d6c5] italic font-serif">
              No target kingdom selected yet.
            </p>
            <button
              type="button"
              onClick={() => setIsOverlayOpen(true)}
              className="px-6 py-2.5 bg-gradient-to-r from-[#d4af37] via-[#f3e5ab] to-[#d4af37] text-[#120e0c] font-black uppercase text-xs rounded-xl shadow-xl hover:scale-105 transition-all cursor-pointer"
            >
              ⚔ Open War Council & Target Kingdom
            </button>
          </div>
        )}
      </div>

      {/* FOOTER ATMOSPHERE DIVIDER */}
      <div className="w-full max-w-4xl mx-auto h-2 bg-gradient-to-r from-transparent via-[#8b7355]/40 to-transparent rounded-full shrink-0" />

      {/* FULL CINEMATIC CARD RISE, ROTATE & REVEAL OVERLAY */}
      {cardRevealStage !== 'idle' && selectedMember && (() => {
        const sceneConfig = CAPTURE_SCENES[selectedMember.role] || CAPTURE_SCENES.citizen;
        const roleDef = ROLE_DEFINITIONS[selectedMember.role];

        return (
          <div className="fixed inset-0 z-50 bg-[#060403]/96 backdrop-blur-xl flex flex-col items-center justify-center p-4 sm:p-6 font-cinzel overflow-hidden animate-in fade-in duration-300">
            {/* Stage 1: Card Flipping (Back Half - Left to Right) */}
            {(cardRevealStage === 'rising' || cardRevealStage === 'flipping_back') && (
              <div className="flex flex-col items-center justify-center space-y-6 animate-card-flip-back">
                <div className="w-56 sm:w-64 h-72 sm:h-88 rounded-3xl bg-gradient-to-b from-[#3d2a1d] via-[#2a1c13] to-[#160e0a] border-4 border-[#ffd700] shadow-[0_0_60px_rgba(255,215,0,0.9)] flex flex-col items-center justify-center p-6 text-center space-y-2">
                  <div className="w-20 h-20 rounded-full bg-[#120e0c] border-4 border-[#d4af37] flex items-center justify-center text-5xl mb-2 shadow-inner animate-pulse">
                    ❓
                  </div>
                  <h3 className="text-xl sm:text-2xl font-black text-[#f3e5ab] font-cinzel tracking-wider uppercase">
                    {selectedMember.name}
                  </h3>
                  <p className="text-xs text-[#d4af37] font-serif italic">
                    {selectedDefender?.name} • Unmasking Role...
                  </p>
                </div>
                <p className="text-base sm:text-lg font-black text-amber-300 tracking-widest animate-pulse">
                  ✨ ROYAL REVEAL IN PROGRESS ✨
                </p>
              </div>
            )}

            {/* Stage 2: Card Flipping (Front Half - Revealed Face Emerges with Golden Light Burst) */}
            {cardRevealStage === 'flipping_front' && (
              <div className="flex flex-col items-center justify-center space-y-6 animate-card-flip-front relative z-20">
                <div className="absolute -inset-20 bg-radial from-amber-300 via-yellow-200/50 to-transparent blur-2xl opacity-80 animate-pulse pointer-events-none" />
                <div className={`w-56 sm:w-64 h-72 sm:h-88 rounded-3xl bg-gradient-to-b from-[#3d2a1d] via-[#2a1c13] to-[#160e0a] ${sceneConfig.border} ${sceneConfig.shadow} flex flex-col items-center justify-center p-6 text-center relative overflow-hidden space-y-2`}>
                  <div className="text-6xl sm:text-7xl filter drop-shadow-[0_0_30px_rgba(255,215,0,1)] animate-bounce">
                    {roleDef.icon}
                  </div>
                  <h3 className="text-xl sm:text-2xl font-black text-[#f3e5ab] font-cinzel uppercase tracking-wide">
                    {selectedMember.name}
                  </h3>
                  <h4 className="text-sm sm:text-base font-bold text-[#ffd700] font-cinzel tracking-wide">
                    {roleDef.title} of {selectedDefender?.name}
                  </h4>
                  <p className="text-xs text-emerald-400 font-mono font-bold">
                    {sceneConfig.pointsText}
                  </p>
                </div>
                <p className="text-base sm:text-lg font-black text-amber-300 tracking-widest animate-pulse relative z-10">
                  ✨ IDENTITY UNVEILED! ✨
                </p>
              </div>
            )}

            {/* Stage 3: Flipped Cinematic Prisoner Capture Scene Reveal */}
            {cardRevealStage === 'flipped' && (() => {
              const sceneConfig = CAPTURE_SCENES[selectedMember.role] || CAPTURE_SCENES.citizen;

              return (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-hidden animate-in fade-in duration-700 select-none">
                  {/* Fullscreen Realistic Medieval Capture Artwork Background */}
                  <div className="absolute inset-0 z-0">
                    <img
                      src={sceneConfig.bgImage}
                      alt={sceneConfig.location}
                      className="w-full h-full object-cover filter brightness-[0.65] contrast-[1.15] scale-105 animate-pulse-subtle"
                    />
                    {/* Dark gradient vignettes around edges for high legibility */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#060403] via-transparent to-[#060403]/80" />
                    <div className="absolute inset-0 bg-radial from-transparent via-[#060403]/30 to-[#060403]/85" />
                  </div>

                  {/* Atmospheric Animated Torch Flames & Particles */}
                  <div className="absolute top-6 left-8 text-3xl sm:text-4xl animate-torch pointer-events-none z-10">🔥</div>
                  <div className="absolute top-6 right-8 text-3xl sm:text-4xl animate-torch pointer-events-none z-10">🔥</div>
                  <div className="absolute bottom-8 left-10 text-xs text-amber-300/40 animate-particle pointer-events-none z-10">✨</div>
                  <div className="absolute top-1/3 right-12 text-xs text-amber-400/30 animate-particle pointer-events-none z-10" style={{ animationDelay: '1.2s' }}>✨</div>

                  {/* CENTER CONTENT: Semi-transparent Glassmorphic Capture Proclamation Panel (15-30% opacity) */}
                  <div className="relative z-20 w-full max-w-2xl bg-[#120e0c]/25 backdrop-blur-md border-4 border-[#d4af37] rounded-3xl p-6 sm:p-8 text-center space-y-5 shadow-[0_0_90px_rgba(0,0,0,0.95)] animate-proclamation-rise">
                    
                    {/* Location Badge */}
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#120e0c]/80 border border-[#d4af37] text-[#d4af37] text-xs font-black uppercase tracking-widest shadow-xl">
                      <MapPin className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                      <span>{sceneConfig.location}</span>
                    </div>

                    {/* Bold Reveal Title */}
                    <div className="space-y-1">
                      <h2 className="text-2xl sm:text-4xl font-black text-[#f3e5ab] uppercase tracking-wider text-gold-engraved drop-shadow-[0_0_25px_rgba(255,215,0,0.9)] font-cinzel">
                        {sceneConfig.title}
                      </h2>
                      <div className="text-xl sm:text-3xl font-black text-[#ffd700] font-cinzel tracking-widest pt-1">
                        {selectedMember.name}
                      </div>
                      <p className="text-sm sm:text-base font-bold text-[#f3e5ab] font-cinzel tracking-wide">
                        {roleDef.title} of {selectedDefender?.name}
                      </p>
                    </div>

                    {/* Scenario Narrative Box */}
                    <div className="p-4 sm:p-5 rounded-2xl bg-[#0c0806]/50 border border-[#8b7355]/60 text-left space-y-2 backdrop-blur-sm">
                      <div className="flex flex-wrap items-center justify-between text-[11px] font-mono text-[#d4af37] uppercase tracking-widest border-b border-[#8b7355]/40 pb-1.5 gap-2">
                        <span>📜 Royal Scribe's Chronicle</span>
                        <span className="text-amber-200/90 font-serif text-[10px]">{sceneConfig.symbolism}</span>
                      </div>
                      <p className="text-xs sm:text-sm text-[#f3e5ab] font-merriweather italic leading-relaxed pt-1">
                        "{sceneConfig.scenario}"
                      </p>
                    </div>

                    {/* Score Award Animated Counter Pill */}
                    <div className="pt-2 flex flex-col items-center justify-center">
                      <div className={`px-8 py-3.5 rounded-2xl text-2xl sm:text-3xl font-black font-mono shadow-2xl border-2 transition-all ${sceneConfig.counterBg} animate-bounce`}>
                        <span className="text-[10px] sm:text-xs font-serif block text-amber-200/90 uppercase tracking-widest font-bold mb-0.5">
                          {sceneConfig.pointsValue >= 0 ? 'ROYAL REWARD SCORE' : 'COURT TRICKSTER PENALTY'}
                        </span>
                        {animatedPoints > 0 ? `+${animatedPoints}` : animatedPoints} ROYAL POINTS
                      </div>
                    </div>

                    {/* Leaderboard updating footer notice */}
                    <p className="text-xs text-[#d4af37] italic font-bold animate-pulse font-serif pt-1">
                      ⚔️ Updating Kingdom Standings in the Hall of Champions...
                    </p>
                  </div>
                </div>
              );
            })()}
          </div>
        );
      })()}
      {/* Royal Gonfalon Ceremony Modal */}
      {viewGonfalonKingdom && (
        <div className="fixed inset-0 z-50 w-full h-full">
          <KingdomGonfalonCeremony
            kingdom={viewGonfalonKingdom}
            subtitle="ROYAL GONFALON OF THE REALM"
            onComplete={() => setViewGonfalonKingdom(null)}
            autoAdvanceMs={0}
            showNextButton={true}
          />
        </div>
      )}
    </div>
  );
};

