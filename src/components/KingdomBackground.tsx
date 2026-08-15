import React, { useState, useEffect } from 'react';
import bgCastleMainGate from '../assets/images/bg_castle_main_gate_1785575020360.jpg';
import bgOutsideKingdom from '../assets/images/kingdom_background_1785573512508.jpg';
import bgRoyalWarRoom from '../assets/images/bg_royal_war_room_1785574207727.jpg';
import bgThroneRoom from '../assets/images/bg_throne_room_1785574220429.jpg';
import bgKnightsBarracks from '../assets/images/bg_knights_barracks_1785575036356.jpg';
import bgRoyalCouncil from '../assets/images/bg_royal_council_1785575051592.jpg';
import bgRoyalLibrary from '../assets/images/bg_royal_library_1785574236273.jpg';
import bgTournamentArena from '../assets/images/bg_tournament_arena_1785574302138.jpg';
import bgScrollChamber from '../assets/images/bg_scroll_chamber_1785574315542.jpg';
import bgCastleCourtyard from '../assets/images/bg_castle_courtyard_1785574325754.jpg';
import bgGrandHallChampions from '../assets/images/bg_grand_hall_champions_1785574275719.jpg';
import bgScribesChamber from '../assets/images/bg_scribes_chamber_1785574260643.jpg';
import bgRoyalArchives from '../assets/images/bg_royal_archives_1785574248150.jpg';
import bgHallOfHonor from '../assets/images/bg_hall_of_honor_1785575066108.jpg';
import bgCelebrationCourtyard from '../assets/images/bg_celebration_courtyard_1785574339931.jpg';
import bgRoyalCommand from '../assets/images/bg_royal_command_1785574289048.jpg';
import bgGrandCastleHall from '../assets/images/bg_grand_castle_hall_1785574193682.jpg';
import { MedievalIconDefs } from './MedievalIcons';

export type CastleSection =
  | 'login'
  | 'dashboard'
  | 'wizard'
  | 'kingdom_setup'
  | 'barracks'
  | 'council'
  | 'question_bank'
  | 'goblet'
  | 'question'
  | 'attack'
  | 'champions'
  | 'game_logs'
  | 'reports'
  | 'hall_of_honor'
  | 'victory'
  | 'settings'
  | 'splash'
  | 'ceremony';

export interface RoomMeta {
  title: string;
  sub: string;
  icon: string;
  image: string;
}

export const ROOM_MAPPINGS: Record<CastleSection, RoomMeta> = {
  login: {
    title: 'Castle Main Gate',
    sub: 'Drawbridge & Guard Entrance',
    icon: '🔐',
    image: bgCastleMainGate,
  },
  splash: {
    title: 'Castle Main Gate',
    sub: 'Drawbridge & Guard Entrance',
    icon: '🔐',
    image: bgCastleMainGate,
  },
  dashboard: {
    title: 'Royal Castle Command Center',
    sub: 'Overlooking Kingdom Towers & Village',
    icon: '🏰',
    image: bgOutsideKingdom,
  },
  wizard: {
    title: 'Royal War Room',
    sub: 'Strategy Table & Battle Maps',
    icon: '⚔️',
    image: bgRoyalWarRoom,
  },
  kingdom_setup: {
    title: 'Throne Room',
    sub: 'Royal Throne & Stained Glass',
    icon: '👑',
    image: bgThroneRoom,
  },
  barracks: {
    title: "Knights' Barracks",
    sub: 'Armor Racks & Weapon Stands',
    icon: '👥',
    image: bgKnightsBarracks,
  },
  council: {
    title: 'Royal Council Chamber',
    sub: 'Sealed Scrolls & Confidential Table',
    icon: '🎭',
    image: bgRoyalCouncil,
  },
  question_bank: {
    title: 'Grand Royal Library',
    sub: 'Towering Bookshelves & Ancient Tomes',
    icon: '📚',
    image: bgRoyalLibrary,
  },
  goblet: {
    title: 'Tournament Arena',
    sub: 'Grand Stage & Ceremonial Chalice',
    icon: '🍷',
    image: bgTournamentArena,
  },
  question: {
    title: 'Ancient Scroll Chamber',
    sub: 'Illuminated Parchment & Torches',
    icon: '📜',
    image: bgScrollChamber,
  },
  attack: {
    title: 'Castle Courtyard',
    sub: 'Fortress Walls & Siege Grounds',
    icon: '⚔️',
    image: bgCastleCourtyard,
  },
  champions: {
    title: 'Grand Hall of Champions',
    sub: 'Statues, Trophies & Emblems',
    icon: '🏆',
    image: bgGrandHallChampions,
  },
  game_logs: {
    title: "Scribe's Chamber",
    sub: 'Quills, Ink Bottles & Wax Seals',
    icon: '📜',
    image: bgScribesChamber,
  },
  reports: {
    title: 'Royal Archives',
    sub: 'Historical Ledgers & Record Shelves',
    icon: '📊',
    image: bgRoyalArchives,
  },
  hall_of_honor: {
    title: 'Royal Hall of Honor',
    sub: 'Marble Floors & Golden Pillars',
    icon: '🎖',
    image: bgHallOfHonor,
  },
  victory: {
    title: 'Celebration Courtyard',
    sub: 'Fireworks & Victorious Banners',
    icon: '👑',
    image: bgCelebrationCourtyard,
  },
  settings: {
    title: 'Royal Command Office',
    sub: 'Governance & Realm Administration',
    icon: '⚙️',
    image: bgRoyalCommand,
  },
  ceremony: {
    title: 'Grand Castle Hall',
    sub: 'Opening Royal Procession',
    icon: '🏰',
    image: bgGrandCastleHall,
  },
};

interface KingdomBackgroundProps {
  section?: CastleSection;
  overlayOpacity?: number;
  children?: React.ReactNode;
}

export const KingdomBackground: React.FC<KingdomBackgroundProps> = ({
  section = 'dashboard',
  overlayOpacity = 0.20, // 20% transparent overlay so background medieval artwork is crystal clear and visible
  children,
}) => {
  const [currentSection, setCurrentSection] = useState<CastleSection>(section);
  const [prevImage, setPrevImage] = useState<string>(ROOM_MAPPINGS[section]?.image || bgOutsideKingdom);
  const [currImage, setCurrImage] = useState<string>(ROOM_MAPPINGS[section]?.image || bgOutsideKingdom);
  const [isCrossfading, setIsCrossfading] = useState<boolean>(false);

  useEffect(() => {
    if (section !== currentSection) {
      const nextImg = ROOM_MAPPINGS[section]?.image || bgOutsideKingdom;
      if (nextImg !== currImage) {
        setPrevImage(currImage);
        setCurrImage(nextImg);
        setIsCrossfading(true);

        const timer = setTimeout(() => {
          setIsCrossfading(false);
          setPrevImage(nextImg);
        }, 700); // Smooth crossfade duration

        setCurrentSection(section);
        return () => clearTimeout(timer);
      } else {
        setCurrentSection(section);
      }
    }
  }, [section, currentSection, currImage]);

  const activeMeta = ROOM_MAPPINGS[section] || ROOM_MAPPINGS.dashboard;

  return (
    <div className="relative w-full h-full min-h-screen overflow-hidden bg-[#090706]">
      {/* Include Global Medieval Metallic Icon Defs */}
      <MedievalIconDefs />

      {/* Layer 1: Previous Background Image */}
      <div className="absolute inset-0 z-0 select-none overflow-hidden">
        <img
          src={prevImage}
          alt="Previous Medieval Chamber"
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover object-center transform scale-105"
        />
      </div>

      {/* Layer 2: Current Background Image with Crossfade */}
      <div
        className="absolute inset-0 z-0 select-none overflow-hidden transition-opacity duration-700 ease-in-out"
        style={{
          opacity: isCrossfading ? 1 : 1,
        }}
      >
        <img
          src={currImage}
          alt={activeMeta.title}
          referrerPolicy="no-referrer"
          className={`w-full h-full object-cover object-center transform transition-transform duration-1000 ${
            isCrossfading ? 'scale-100' : 'scale-105'
          }`}
        />
      </div>

      {/* Light Ambient Overlay (20% opacity) for rich scenery visibility with high text readability */}
      <div
        className="absolute inset-0 z-0 transition-opacity duration-500 pointer-events-none"
        style={{
          backgroundColor: '#0a0806',
          opacity: overlayOpacity,
        }}
      />
      <div className="absolute inset-0 z-0 bg-radial-vignette pointer-events-none opacity-40" />

      {/* Ambient Floating Torch Embers */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        {Array.from({ length: 16 }).map((_, i) => {
          const size = (i % 3) + 2;
          const left = (i * 19) % 100;
          const delay = (i * 0.6) % 4;
          const duration = 7 + ((i * 1.1) % 6);

          return (
            <div
              key={i}
              className="absolute rounded-full bg-amber-400/70 opacity-60 filter blur-[0.5px]"
              style={{
                width: `${size}px`,
                height: `${size}px`,
                left: `${left}%`,
                bottom: '-10px',
                animation: `floatUpEmber ${duration}s ease-in-out ${delay}s infinite`,
                boxShadow: '0 0 10px #fbbf24',
              }}
            />
          );
        })}
      </div>

      {/* Subtle Kingdom Chamber Location Indicator Banner */}
      <div className="absolute top-2.5 left-1/2 -translate-x-1/2 z-20 pointer-events-none font-cinzel">
        <div className="flex items-center gap-2 px-4 py-1 bg-[#16100c]/85 border border-[#8b7355]/60 rounded-full shadow-[0_4px_20px_rgba(0,0,0,0.85)] backdrop-blur-md">
          <span className="text-xs">{activeMeta.icon}</span>
          <span className="text-[10px] font-black text-[#d4af37] tracking-wider uppercase">
            {activeMeta.title}
          </span>
          <span className="text-[9px] text-[#8b7355] hidden sm:inline">
            • {activeMeta.sub}
          </span>
        </div>
      </div>

      {/* Main Content Render */}
      <div className="relative z-10 w-full h-full flex flex-col">{children}</div>
    </div>
  );
};
