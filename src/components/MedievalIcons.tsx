import React from 'react';

interface IconProps {
  className?: string;
  size?: number;
}

// Metallic Defs wrapper for reusable gradients and filters
export const MedievalIconDefs: React.FC = () => (
  <svg className="absolute w-0 h-0 overflow-hidden" aria-hidden="true">
    <defs>
      {/* Burnished Gold Gradient */}
      <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#fef08a" />
        <stop offset="30%" stopColor="#eab308" />
        <stop offset="70%" stopColor="#ca8a04" />
        <stop offset="100%" stopColor="#854d0e" />
      </linearGradient>

      {/* Forged Steel Gradient */}
      <linearGradient id="steelGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#f1f5f9" />
        <stop offset="40%" stopColor="#94a3b8" />
        <stop offset="70%" stopColor="#475569" />
        <stop offset="100%" stopColor="#1e293b" />
      </linearGradient>

      {/* Aged Brass / Bronze Gradient */}
      <linearGradient id="brassGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#fde047" />
        <stop offset="50%" stopColor="#b45309" />
        <stop offset="100%" stopColor="#78350f" />
      </linearGradient>

      {/* Royal Ruby Gold */}
      <linearGradient id="rubyGoldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#fef08a" />
        <stop offset="50%" stopColor="#dc2626" />
        <stop offset="100%" stopColor="#7f1d1d" />
      </linearGradient>

      {/* Forged Iron Shadow */}
      <filter id="forgedShadow" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#000000" floodOpacity="0.8" />
      </filter>
    </defs>
  </svg>
);

// ⚔️ Realistic Forged Steel Crossed Swords
export const ForgedSwordsIcon: React.FC<IconProps> = ({ className = "w-6 h-6", size }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    className={className}
    style={{ filter: 'drop-shadow(0px 2px 4px rgba(0,0,0,0.8))' }}
  >
    {/* Sword 1 */}
    <path d="M19.5 4.5L13.5 10.5M13.5 10.5L6.5 17.5M13.5 10.5L16.5 13.5" stroke="url(#steelGradient)" strokeWidth="2" strokeLinecap="round" />
    <path d="M19.5 4.5L20.5 3.5L18.5 2.5L17.5 3.5L19.5 4.5Z" fill="url(#goldGradient)" />
    <path d="M5.5 16.5L3.5 18.5L4.5 20.5L6.5 19.5L5.5 16.5Z" fill="url(#brassGradient)" />
    <circle cx="4" cy="20" r="1.5" fill="url(#goldGradient)" />

    {/* Sword 2 */}
    <path d="M4.5 4.5L10.5 10.5M10.5 10.5L17.5 17.5M10.5 10.5L7.5 13.5" stroke="url(#steelGradient)" strokeWidth="2" strokeLinecap="round" />
    <path d="M4.5 4.5L3.5 3.5L5.5 2.5L6.5 3.5L4.5 4.5Z" fill="url(#goldGradient)" />
    <path d="M18.5 16.5L20.5 18.5L19.5 20.5L17.5 19.5L18.5 16.5Z" fill="url(#brassGradient)" />
    <circle cx="20" cy="20" r="1.5" fill="url(#goldGradient)" />

    {/* Center Emblem */}
    <circle cx="12" cy="12" r="2" fill="url(#goldGradient)" stroke="#451a03" strokeWidth="0.5" />
  </svg>
);

// 👑 Ornate Golden Royal Crown
export const RoyalCrownIcon: React.FC<IconProps> = ({ className = "w-6 h-6", size }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    className={className}
    style={{ filter: 'drop-shadow(0px 2px 4px rgba(0,0,0,0.8))' }}
  >
    <path
      d="M3 18H21L19.5 8L15 12L12 4L9 12L4.5 8L3 18Z"
      fill="url(#goldGradient)"
      stroke="#78350f"
      strokeWidth="1"
      strokeLinejoin="round"
    />
    <path d="M3 18H21V20C21 20.5523 20.5523 21 20 21H4C3.44772 21 3 20.5523 3 20V18Z" fill="url(#brassGradient)" stroke="#451a03" strokeWidth="1" />
    {/* Jewels */}
    <circle cx="12" cy="4" r="1.5" fill="#ef4444" stroke="#fef08a" strokeWidth="0.5" />
    <circle cx="4.5" cy="8" r="1.2" fill="#3b82f6" stroke="#fef08a" strokeWidth="0.5" />
    <circle cx="19.5" cy="8" r="1.2" fill="#3b82f6" stroke="#fef08a" strokeWidth="0.5" />
    <circle cx="12" cy="16" r="1" fill="#10b981" />
    <circle cx="8" cy="16" r="1" fill="#ef4444" />
    <circle cx="16" cy="16" r="1" fill="#ef4444" />
  </svg>
);

// 🏰 Detailed Stone Fortress Castle Silhouette
export const StoneCastleIcon: React.FC<IconProps> = ({ className = "w-6 h-6", size }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    className={className}
    style={{ filter: 'drop-shadow(0px 2px 4px rgba(0,0,0,0.8))' }}
  >
    {/* Castle Body */}
    <path
      d="M2 21H22V11L19 11V7H17V9H15V7H13V9H11V7H9V9H7V7H5V11L2 11V21Z"
      fill="url(#steelGradient)"
      stroke="#1e293b"
      strokeWidth="1"
    />
    {/* Central Tower */}
    <path d="M9 11H15V4H13V2H11V4H9V11Z" fill="url(#brassGradient)" stroke="#451a03" strokeWidth="0.5" />
    {/* Door Gate */}
    <path d="M10 21V16C10 14.8954 10.8954 14 12 14C13.1046 14 14 14.8954 14 16V21H10Z" fill="#18181b" stroke="url(#goldGradient)" strokeWidth="1" />
    {/* Flag */}
    <path d="M12 2V4L15 3L12 2Z" fill="#dc2626" />
  </svg>
);

// 📜 Aged Parchment Scroll
export const AgedScrollIcon: React.FC<IconProps> = ({ className = "w-6 h-6", size }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    className={className}
    style={{ filter: 'drop-shadow(0px 2px 4px rgba(0,0,0,0.8))' }}
  >
    <path
      d="M19 4H7.5C5.567 4 4 5.567 4 7.5C4 9.433 5.567 11 7.5 11H18.5C19.8807 11 21 12.1193 21 13.5C21 14.8807 19.8807 16 18.5 16H6"
      stroke="url(#brassGradient)"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <rect x="5" y="3" width="14" height="17" rx="2" fill="#fef3c7" stroke="url(#brassGradient)" strokeWidth="1.5" />
    {/* Text lines */}
    <line x1="8" y1="7" x2="16" y2="7" stroke="#92400e" strokeWidth="1.5" strokeLinecap="round" />
    <line x1="8" y1="10" x2="15" y2="10" stroke="#92400e" strokeWidth="1.5" strokeLinecap="round" />
    <line x1="8" y1="13" x2="13" y2="13" stroke="#92400e" strokeWidth="1.5" strokeLinecap="round" />
    {/* Wax Seal */}
    <circle cx="16" cy="15" r="2.5" fill="#b91c1c" stroke="#fef08a" strokeWidth="0.5" />
  </svg>
);

// 📚 Leather-Bound Medieval Books
export const MedievalBooksIcon: React.FC<IconProps> = ({ className = "w-6 h-6", size }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    className={className}
    style={{ filter: 'drop-shadow(0px 2px 4px rgba(0,0,0,0.8))' }}
  >
    {/* Book 1 */}
    <rect x="3" y="4" width="14" height="17" rx="2" fill="#451a03" stroke="url(#goldGradient)" strokeWidth="1.5" />
    <rect x="6" y="2" width="14" height="17" rx="2" fill="#78350f" stroke="url(#brassGradient)" strokeWidth="1.5" />
    {/* Gold Book Spine details */}
    <line x1="8" y1="5" x2="8" y2="17" stroke="url(#goldGradient)" strokeWidth="2" />
    <path d="M12 8H16M12 11H16" stroke="url(#goldGradient)" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

// 🛡 Engraved Knight Shield
export const KnightShieldIcon: React.FC<IconProps> = ({ className = "w-6 h-6", size }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    className={className}
    style={{ filter: 'drop-shadow(0px 2px 4px rgba(0,0,0,0.8))' }}
  >
    <path
      d="M12 2L4 5V11C4 16.55 7.4 21.74 12 23C16.6 21.74 20 16.55 20 11V5L12 2Z"
      fill="url(#steelGradient)"
      stroke="url(#goldGradient)"
      strokeWidth="1.5"
      strokeLinejoin="round"
    />
    {/* Cross emblem */}
    <path d="M12 6V18M6 10H18" stroke="url(#rubyGoldGradient)" strokeWidth="2.5" strokeLinecap="round" />
  </svg>
);

// 🏆 Golden Medieval Chalice Trophy
export const GoldenChaliceIcon: React.FC<IconProps> = ({ className = "w-6 h-6", size }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    className={className}
    style={{ filter: 'drop-shadow(0px 2px 4px rgba(0,0,0,0.8))' }}
  >
    {/* Cup */}
    <path d="M6 3H18V10C18 13.3137 15.3137 16 12 16C8.68629 16 6 13.3137 6 10V3Z" fill="url(#goldGradient)" stroke="#78350f" strokeWidth="1" />
    {/* Handles */}
    <path d="M6 5H3V9C3 10.1046 3.89543 11 5 11H6" stroke="url(#goldGradient)" strokeWidth="1.5" />
    <path d="M18 5H21V9C21 10.1046 20.1046 11 19 11H18" stroke="url(#goldGradient)" strokeWidth="1.5" />
    {/* Stem & Base */}
    <rect x="11" y="16" width="2" height="4" fill="url(#brassGradient)" />
    <path d="M7 21H17V20C17 18.8954 16.1046 18 15 18H9C7.89543 18 7 18.8954 7 20V21Z" fill="url(#goldGradient)" stroke="#451a03" strokeWidth="1" />
    {/* Gems */}
    <circle cx="12" cy="8" r="1.5" fill="#dc2626" />
  </svg>
);

// ⚙️ Iron Gear with Medieval Craftsmanship
export const MedievalGearIcon: React.FC<IconProps> = ({ className = "w-6 h-6", size }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    className={className}
    style={{ filter: 'drop-shadow(0px 2px 4px rgba(0,0,0,0.8))' }}
  >
    <path
      d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z"
      fill="url(#brassGradient)"
      stroke="url(#goldGradient)"
      strokeWidth="1"
    />
    <path
      d="M19.4 15A1.65 1.65 0 0020 12A1.65 1.65 0 0019.4 9L21 7.4L19.6 6L18 7.6A1.65 1.65 0 0015 7V4.8H13V7A1.65 1.65 0 0010 7L8.4 5.4L7 6.8L8.6 8.4A1.65 1.65 0 008 10H5.8V12H8A1.65 1.65 0 008.6 15.6L7 17.2L8.4 18.6L10 17A1.65 1.65 0 0013 17.6V20H15V17.8A1.65 1.65 0 0018 17.2L19.6 18.8L21 17.4L19.4 15Z"
      fill="url(#steelGradient)"
      stroke="url(#goldGradient)"
      strokeWidth="1"
    />
  </svg>
);

// 📊 Royal Archives Report Chart Icon
export const RoyalChartIcon: React.FC<IconProps> = ({ className = "w-6 h-6", size }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    className={className}
    style={{ filter: 'drop-shadow(0px 2px 4px rgba(0,0,0,0.8))' }}
  >
    <rect x="3" y="3" width="18" height="18" rx="3" fill="#1c1917" stroke="url(#brassGradient)" strokeWidth="1.5" />
    <rect x="6" y="12" width="3" height="6" fill="url(#brassGradient)" rx="0.5" />
    <rect x="10.5" y="8" width="3" height="10" fill="url(#goldGradient)" rx="0.5" />
    <rect x="15" y="5" width="3" height="13" fill="url(#rubyGoldGradient)" rx="0.5" />
  </svg>
);
