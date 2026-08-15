import React from 'react';
import { Kingdom } from '../types';
import { Sparkles, CheckCircle2 } from 'lucide-react';

interface CeremonialGobletProps {
  id: number;
  romanNumeral: string;
  gobletNumber: number;
  selectedKingdom: Kingdom | null;
  isRevealed: boolean;
  isWinner: boolean;
  isDimmed?: boolean;
  isRising?: boolean;
  onClick: () => void;
  canSelect: boolean;
}

export const CeremonialGoblet: React.FC<CeremonialGobletProps> = ({
  id,
  romanNumeral,
  gobletNumber,
  selectedKingdom,
  isRevealed,
  isWinner,
  isDimmed = false,
  isRising = false,
  onClick,
  canSelect,
}) => {
  const isSelected = !!selectedKingdom;

  return (
    <div
      onClick={onClick}
      className={`relative flex flex-col items-center cursor-pointer select-none transition-all duration-500 group ${
        isRising ? `animate-goblet-summon-${id - 1} z-30` : 'animate-goblet-float'
      } ${isDimmed ? 'opacity-35 scale-95 blur-[0.3px]' : ''} ${
        isSelected
          ? '-translate-y-5 sm:-translate-y-7 scale-105 sm:scale-110 z-40'
          : canSelect
          ? 'hover:-translate-y-3 sm:hover:-translate-y-4 hover:scale-105 sm:hover:scale-110'
          : ''
      }`}
    >
      {/* Floating Selected Kingdom Crown Banner */}
      {selectedKingdom && (
        <div className="absolute -top-8 sm:-top-10 px-3 py-0.5 sm:py-1 rounded-full text-xs sm:text-sm font-black border-2 border-[#ffd700] bg-[#120e0c] text-[#ffd700] shadow-[0_0_25px_rgba(255,215,0,0.95)] flex items-center gap-1.5 z-50 animate-in zoom-in duration-300">
          <span className="text-base sm:text-lg">{selectedKingdom.bannerSymbol}</span>
          <span className="truncate max-w-[90px] sm:max-w-[120px] font-cinzel uppercase text-[10px] sm:text-xs">
            {selectedKingdom.name.replace('Kingdom of the ', '').replace('Kingdom of ', '')}
          </span>
        </div>
      )}

      {/* Upward Golden Light Beam for Winner */}
      {isWinner && (
        <div className="absolute -top-40 inset-x-0 h-60 bg-gradient-to-t from-amber-400/90 via-yellow-200/50 to-transparent blur-2xl animate-pulse pointer-events-none z-10" />
      )}

      {/* Confetti / Sparkle Particles for Winner */}
      {isWinner && (
        <div className="absolute -top-28 inset-x-[-50px] h-40 pointer-events-none z-50 flex justify-around">
          <span className="text-2xl animate-bounce text-amber-300" style={{ animationDelay: '0.1s' }}>✨</span>
          <span className="text-xl animate-bounce text-[#ffd700]" style={{ animationDelay: '0.3s' }}>👑</span>
          <span className="text-2xl animate-bounce text-yellow-200" style={{ animationDelay: '0.2s' }}>✨</span>
          <span className="text-base animate-bounce text-amber-400" style={{ animationDelay: '0.4s' }}>⭐</span>
        </div>
      )}

      {/* Golden Light Rays / Soft Aura behind Goblet */}
      <div
        className={`absolute -inset-4 sm:-inset-7 rounded-full pointer-events-none transition-all duration-500 ${
          isWinner
            ? 'bg-radial from-amber-300/90 via-yellow-400/50 to-transparent blur-2xl opacity-100 animate-pulse scale-130'
            : isSelected
            ? 'bg-radial from-amber-400/70 via-yellow-300/40 to-transparent blur-xl opacity-95 scale-110'
            : 'bg-radial from-amber-400/30 via-yellow-300/15 to-transparent blur-lg opacity-50 group-hover:opacity-90 group-hover:scale-105'
        }`}
      />

      {/* REVEALED NUMBER BADGE RISING FROM GOBLET */}
      {isRevealed && (
        <div className="absolute -top-12 sm:-top-16 z-50 flex flex-col items-center animate-in zoom-in slide-in-from-bottom duration-700">
          <div className="flex items-center justify-center bg-gradient-to-r from-[#ffd700] via-[#fff8dc] to-[#ffd700] text-[#120e0c] px-3.5 sm:px-5 py-1 sm:py-1.5 rounded-full border-2 border-[#120e0c] shadow-[0_0_35px_rgba(255,215,0,1)] font-cinzel font-black text-2xl sm:text-3xl md:text-4xl tracking-tight">
            #{gobletNumber}
          </div>
          {isWinner && (
            <span className="text-[10px] sm:text-xs font-black font-cinzel text-amber-300 tracking-widest uppercase bg-[#120e0c] px-2.5 py-0.5 rounded border border-[#ffd700] mt-1 shadow-lg animate-pulse">
              👑 HIGHEST DRAW
            </span>
          )}
        </div>
      )}

      {/* REALISTIC 3D-STYLE MEDIEVAL GOBLET SVG - 50-70% LARGER */}
      <div className="relative w-20 sm:w-28 md:w-36 lg:w-40 h-24 sm:h-34 md:h-44 lg:h-48 transition-transform duration-300 group-hover:rotate-2 group-hover:scale-105">
        <svg
          viewBox="0 0 120 140"
          className="w-full h-full filter drop-shadow-[0_12px_24px_rgba(0,0,0,0.9)]"
        >
          <defs>
            {/* Polished Gold Linear Gradient */}
            <linearGradient id={`goldGrad-${id}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fff8dc" />
              <stop offset="20%" stopColor="#ffd700" />
              <stop offset="45%" stopColor="#d4af37" />
              <stop offset="70%" stopColor="#8b6508" />
              <stop offset="85%" stopColor="#b8860b" />
              <stop offset="100%" stopColor="#fef08a" />
            </linearGradient>

            {/* Specular Highlight Overlay Gradient */}
            <linearGradient id={`goldHighlight-${id}`} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.75" />
              <stop offset="25%" stopColor="#ffffff" stopOpacity="0.25" />
              <stop offset="60%" stopColor="#000000" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#ffffff" stopOpacity="0.55" />
            </linearGradient>

            {/* Bowl Interior Shadow Gradient */}
            <radialGradient id={`bowlInterior-${id}`} cx="50%" cy="30%" r="50%">
              <stop offset="0%" stopColor="#2a1a08" />
              <stop offset="60%" stopColor="#5c3f0c" />
              <stop offset="100%" stopColor="#8b6508" />
            </radialGradient>

            {/* Ruby Gem Radial Gradient */}
            <radialGradient id={`rubyGem-${id}`} cx="35%" cy="35%" r="65%">
              <stop offset="0%" stopColor="#ff7675" />
              <stop offset="40%" stopColor="#d63031" />
              <stop offset="100%" stopColor="#580000" />
            </radialGradient>

            {/* Sapphire Gem Radial Gradient */}
            <radialGradient id={`sapphireGem-${id}`} cx="35%" cy="35%" r="65%">
              <stop offset="0%" stopColor="#74b9ff" />
              <stop offset="40%" stopColor="#0984e3" />
              <stop offset="100%" stopColor="#001845" />
            </radialGradient>

            {/* Emerald Gem Radial Gradient */}
            <radialGradient id={`emeraldGem-${id}`} cx="35%" cy="35%" r="65%">
              <stop offset="0%" stopColor="#55efc4" />
              <stop offset="40%" stopColor="#00b894" />
              <stop offset="100%" stopColor="#00382b" />
            </radialGradient>

            {/* Torchlight Reflection Glow */}
            <linearGradient id={`torchGlow-${id}`} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#ffe066" stopOpacity="0.95" />
              <stop offset="100%" stopColor="#ff9f43" stopOpacity="0.35" />
            </linearGradient>

            {/* Metallic Drop Shadow */}
            <filter id={`chaliceShadow-${id}`} x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="5" stdDeviation="5" floodColor="#000000" floodOpacity="0.9" />
            </filter>
          </defs>

          {/* 1. HEAVY ORNATE PEDESTAL BASE OF CHALICE */}
          <g filter={`url(#chaliceShadow-${id})`}>
            {/* Outer Base Foot Ring */}
            <ellipse cx="60" cy="122" rx="38" ry="10" fill={`url(#goldGrad-${id})`} />
            <ellipse cx="60" cy="122" rx="38" ry="10" fill={`url(#goldHighlight-${id})`} />
            <ellipse cx="60" cy="120" rx="34" ry="8" fill="#5c3f0c" />

            {/* Stepped Pedestal Base Tier 2 */}
            <path
              d="M30 118 C30 114, 90 114, 90 118 L84 108 C84 106, 36 106, 36 108 Z"
              fill={`url(#goldGrad-${id})`}
            />

            {/* Beaded Trim on Base Step */}
            <ellipse cx="60" cy="116" rx="28" ry="6" fill={`url(#goldGrad-${id})`} />
            {/* Jewels on Base */}
            <circle cx="42" cy="116" r="2.8" fill={`url(#emeraldGem-${id})`} />
            <circle cx="60" cy="117" r="3.5" fill={`url(#rubyGem-${id})`} />
            <circle cx="78" cy="116" r="2.8" fill={`url(#sapphireGem-${id})`} />

            {/* Stepped Pedestal Base Tier 1 */}
            <path
              d="M40 108 C40 102, 80 102, 80 108 L72 96 C72 94, 48 94, 48 96 Z"
              fill={`url(#goldGrad-${id})`}
            />

            {/* 2. KNOPPED ORNATE STEM */}
            {/* Lower Stem Shaft */}
            <path d="M54 96 L54 82 L66 82 L66 96 Z" fill={`url(#goldGrad-${id})`} />
            <path d="M54 96 L54 82 L60 82 L60 96 Z" fill={`url(#goldHighlight-${id})`} />

            {/* Central Knop (Jeweled Golden Orb) */}
            <circle cx="60" cy="78" r="10" fill={`url(#goldGrad-${id})`} />
            <circle cx="60" cy="78" r="10" fill={`url(#goldHighlight-${id})`} />
            <circle cx="60" cy="78" r="7" fill={`url(#goldGrad-${id})`} />
            {/* Center Knop Jewel */}
            <circle cx="60" cy="78" r="4.8" fill={`url(#rubyGem-${id})`} />
            <circle cx="58.5" cy="76.5" r="1.6" fill="#ffffff" opacity="0.85" />

            {/* Upper Stem Shaft & Filigree Ring */}
            <path d="M54 74 L54 60 L66 60 L66 74 Z" fill={`url(#goldGrad-${id})`} />
            <ellipse cx="60" cy="60" rx="12" ry="4" fill={`url(#goldGrad-${id})`} />

            {/* 3. CEREMONIAL BOWL & CUP BODY */}
            {/* Outer Cup Silhouette */}
            <path
              d="M20 22 C20 48, 42 62, 60 62 C78 62, 100 48, 100 22 L98 18 C98 18, 60 22, 22 18 Z"
              fill={`url(#goldGrad-${id})`}
            />

            {/* Specular Metallic Overlay for Bowl Depth */}
            <path
              d="M20 22 C20 48, 42 62, 60 62 C78 62, 100 48, 100 22 L98 18 L22 18 Z"
              fill={`url(#goldHighlight-${id})`}
            />

            {/* Bowl Interior Opening & Rim */}
            <ellipse cx="60" cy="20" rx="40" ry="10" fill={`url(#bowlInterior-${id})`} />
            <ellipse cx="60" cy="20" rx="40" ry="10" stroke={`url(#goldGrad-${id})`} strokeWidth="3" fill="none" />
            <ellipse cx="60" cy="20" rx="38" ry="8" stroke="#fff8dc" strokeWidth="1" fill="none" opacity="0.8" />

            {/* Engraved Filigree Arches & Medieval Crest Reliefs on Cup */}
            <path
              d="M32 26 C36 42, 44 48, 60 48 C76 48, 84 42, 88 26"
              stroke="#8b6508"
              strokeWidth="1.8"
              fill="none"
              strokeDasharray="3 2"
            />
            <path
              d="M26 24 C30 38, 40 44, 60 44 C80 44, 90 38, 94 24"
              stroke="#ffd700"
              strokeWidth="1"
              fill="none"
            />

            {/* Embedded Jewels on Cup Body */}
            {/* Left Ruby */}
            <circle cx="38" cy="34" r="3.8" fill={`url(#rubyGem-${id})`} />
            <circle cx="37" cy="33" r="1.2" fill="#ffffff" opacity="0.95" />

            {/* Center Sapphire */}
            <circle cx="60" cy="38" r="4.8" fill={`url(#sapphireGem-${id})`} />
            <circle cx="58.5" cy="36.5" r="1.6" fill="#ffffff" opacity="0.95" />

            {/* Right Ruby */}
            <circle cx="82" cy="34" r="3.8" fill={`url(#rubyGem-${id})`} />
            <circle cx="81" cy="33" r="1.2" fill="#ffffff" opacity="0.95" />

            {/* Gold Stud Beading line along cup upper rim */}
            <circle cx="28" cy="22" r="1.5" fill="#fff8dc" />
            <circle cx="44" cy="23" r="1.5" fill="#fff8dc" />
            <circle cx="76" cy="23" r="1.5" fill="#fff8dc" />
            <circle cx="92" cy="22" r="1.5" fill="#fff8dc" />

            {/* Torchlight Edge Highlight */}
            <path
              d="M22 20 C22 42, 40 56, 58 58"
              stroke={`url(#torchGlow-${id})`}
              strokeWidth="2.8"
              fill="none"
              strokeLinecap="round"
            />
          </g>
        </svg>

        {/* Metallic Sparkle Shimmer Effect */}
        <div className="absolute top-1 right-2 text-sm text-amber-200 animate-spin duration-1000 pointer-events-none opacity-85 group-hover:opacity-100">
          ✨
        </div>
      </div>

      {/* REALISTIC PROPORTIONAL STONE & OAK PEDESTAL */}
      <div className="relative w-24 sm:w-32 md:w-40 lg:w-44 flex flex-col items-center -mt-1 sm:-mt-2">
        {/* Pedestal Top Surface Shadow */}
        <div className="w-full h-2 bg-[#0d0907] rounded-t-sm shadow-inner" />

        {/* Pedestal Main Body: Carved Oak & Ancient Stone */}
        <div className={`w-full bg-gradient-to-b from-[#2a1e17] via-[#1c140f] to-[#120c09] border-x-2 border-t-2 border-[#8b7355]/80 rounded-b-xl p-2 sm:p-2.5 text-center shadow-2xl relative transition-all duration-300 ${
          isSelected
            ? 'border-[#ffd700] shadow-[0_0_25px_rgba(255,215,0,0.7)]'
            : 'group-hover:border-[#d4af37]'
        }`}>
          {/* Gold Trim Corner Brackets */}
          <div className="absolute top-0 left-0 w-2.5 h-2.5 border-t-2 border-l-2 border-[#ffd700]" />
          <div className="absolute top-0 right-0 w-2.5 h-2.5 border-t-2 border-r-2 border-[#ffd700]" />
          <div className="absolute bottom-0 left-0 w-2.5 h-2.5 border-b-2 border-l-2 border-[#ffd700]" />
          <div className="absolute bottom-0 right-0 w-2.5 h-2.5 border-b-2 border-r-2 border-[#ffd700]" />

          {/* Brass Engraved Roman Numeral Plaque - ENLARGED & PROMINENT */}
          <div className="bg-gradient-to-r from-[#8b6508] via-[#d4af37] to-[#8b6508] p-0.5 rounded-md border border-[#ffd700]/80 shadow-inner my-0.5">
            <div className="bg-[#120e0c] px-2 py-0.5 sm:py-1 rounded-xs flex items-center justify-center">
              <span className="text-sm sm:text-base md:text-lg lg:text-xl font-black font-cinzel text-transparent bg-clip-text bg-gradient-to-r from-[#ffd700] via-[#fff8dc] to-[#d4af37] tracking-widest drop-shadow-md">
                {romanNumeral}
              </span>
            </div>
          </div>

          {/* Kingdom Selection Label or Prompt */}
          <div className="mt-1">
            {selectedKingdom ? (
              <span className="text-[10px] sm:text-xs text-amber-200 font-bold font-serif italic block truncate">
                {selectedKingdom.name.split(' ')[0]}
              </span>
            ) : (
              <span className="text-[10px] sm:text-xs text-[#8b7355] font-serif italic group-hover:text-[#ffd700] block truncate">
                {canSelect ? 'Select Chalice' : 'Chalice'}
              </span>
            )}
          </div>
        </div>

        {/* Pedestal Base Ring / Selection Glow Ring */}
        <div
          className={`w-[108%] h-3.5 sm:h-4 rounded-full mt-0.5 transition-all duration-300 ${
            isSelected
              ? 'bg-gradient-to-r from-[#ffd700] via-[#fff8dc] to-[#ffd700] border border-[#ffffff] shadow-[0_0_25px_rgba(255,215,0,1)] animate-pulse'
              : 'bg-gradient-to-r from-[#1c140f] via-[#3a281c] to-[#1c140f] border border-[#8b7355]/40 group-hover:border-[#d4af37]'
          }`}
        />
      </div>
    </div>
  );
};
