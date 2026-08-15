export type RoleType =
  | 'king'
  | 'queen'
  | 'princess'
  | 'prince'
  | 'knight'
  | 'worker'
  | 'joker'
  | 'citizen';

export interface RoleInfo {
  type: RoleType;
  title: string;
  icon: string;
  points: number;
  description: string;
  rarityColor: string;
}

export const ROLE_DEFINITIONS: Record<RoleType, RoleInfo> = {
  king: {
    type: 'king',
    title: 'King',
    icon: '👑',
    points: 50,
    description: 'The supreme ruler! Worth +50 points.',
    rarityColor: 'from-amber-400 to-yellow-600 text-amber-950',
  },
  queen: {
    type: 'queen',
    title: 'Queen',
    icon: '👑',
    points: 30,
    description: 'The majestic monarch! Worth +30 points.',
    rarityColor: 'from-purple-400 to-fuchsia-600 text-purple-950',
  },
  princess: {
    type: 'princess',
    title: 'Princess',
    icon: '👸',
    points: 15,
    description: 'Royal Highness! Worth +15 points.',
    rarityColor: 'from-pink-400 to-rose-500 text-rose-950',
  },
  prince: {
    type: 'prince',
    title: 'Prince',
    icon: '🤴',
    points: 15,
    description: 'Royal Heir! Worth +15 points.',
    rarityColor: 'from-sky-400 to-blue-600 text-blue-950',
  },
  knight: {
    type: 'knight',
    title: 'Knight',
    icon: '⚔️',
    points: 5,
    description: 'Brave Defender! Worth +5 points.',
    rarityColor: 'from-slate-300 to-slate-500 text-slate-950',
  },
  worker: {
    type: 'worker',
    title: 'Worker',
    icon: '👷',
    points: 1,
    description: 'Hardworking Citizen! Worth +1 point.',
    rarityColor: 'from-emerald-400 to-teal-600 text-emerald-950',
  },
  joker: {
    type: 'joker',
    title: 'Joker',
    icon: '🎭',
    points: -3,
    description: 'Tricky Court Fool! Subtracts 3 points.',
    rarityColor: 'from-violet-600 to-red-600 text-white',
  },
  citizen: {
    type: 'citizen',
    title: 'Citizen',
    icon: '👤',
    points: 0,
    description: 'Loyal Villager! Worth 0 points.',
    rarityColor: 'from-stone-400 to-stone-600 text-stone-900',
  },
};

export interface Member {
  id: string;
  name: string;
  role: RoleType;
  isCaptured: boolean;
  capturedByKingdomId: string | null;
  capturedInRound: number | null;
}

export type KingdomStatus = 'active' | 'endangered' | 'defeated';

export interface Kingdom {
  id: string;
  name: string;
  bannerSymbol: string;
  colorName: string; // e.g., 'sky', 'blue', 'emerald', 'red', 'cyan', 'purple'
  colorGradient: string;
  borderColor: string;
  textColor: string;
  castleStyle: string;
  score: number;
  members: Member[];
  status: KingdomStatus;
  gobletWins?: number;
  element?: string;
  primaryColors?: string;
  coatOfArms?: string;
  identity?: string;
  bannerColor?: string;
}

export interface Goblet {
  id: number; // 1..10
  number: number; // 1..10 hidden
  selectedByKingdomId: string | null;
  isRevealed: boolean;
}

export interface Question {
  id: string;
  category: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation?: string;
  subject?: string;
  gradeLevel?: string;
  difficulty?: string;
}

export interface RecycledQuestion {
  question: Question;
  deletedAt: string;
}

export type GamePhase =
  | 'setup'
  | 'goblet'
  | 'tiebreaker'
  | 'question'
  | 'attack'
  | 'leaderboard'
  | 'victory';

export interface GameSettings {
  questionTimerDuration: number; // e.g. 10, 20, 30, 45, 60
  soundEnabled: boolean;
  category: string;
  autoRevealGoblets: boolean;
}

export interface AttackResult {
  attackerKingdomId: string;
  defenderKingdomId: string;
  memberId: string;
  memberName: string;
  role: RoleType;
  pointsDelta: number;
  round: number;
}

export interface RoundHistoryItem {
  round: number;
  gobletWinnerId: string;
  winningNumber: number;
  questionAnswered: boolean;
  attackResult?: AttackResult;
}

export interface TeacherUser {
  uid: string;
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
}

export interface BattleLogEntry {
  id: string;
  gameCode: string;
  timestamp: string;
  teacher: string;
  round: number;
  action: string;
  details: string;
}

export interface SavedGameSummary {
  gameCode: string;
  gameName: string;
  teacherId: string;
  dateCreated: string;
  dateModified: string;
  currentRound: number;
  currentPhase: GamePhase;
  numberOfKingdoms: number;
  timerDuration: number;
  gameStatus: 'In Progress' | 'Completed' | 'Archived';
  winnerKingdom?: string;
  kingdoms?: Kingdom[];
  settings?: GameSettings;
}

export type SyncStatus = 'offline' | 'syncing' | 'synced' | 'error';
