import { Kingdom, Question, RoleType, Member } from '../types';

export const SECRET_ROLES_BASE: RoleType[] = [
  'king',      // 1
  'queen',     // 1
  'princess',  // 1
  'prince',    // 1
  'knight',    // 3
  'knight',
  'knight',
  'worker',    // 3
  'worker',
  'worker',
  'joker',     // 3
  'joker',
  'joker',
];

/**
 * Shuffles secret roles and assigns them to student names.
 * First 13 names get shuffled secret roles. Any remaining get 'citizen' (0 pts).
 */
export function assignSecretRoles(studentNames: string[]): Member[] {
  // Shuffle base 13 roles
  const shuffledRoles = [...SECRET_ROLES_BASE].sort(() => Math.random() - 0.5);

  return studentNames.map((name, index) => {
    const role: RoleType = index < 13 ? shuffledRoles[index] : 'citizen';
    return {
      id: `m-${index}-${Math.random().toString(36).substr(2, 9)}`,
      name,
      role,
      isCaptured: false,
      capturedByKingdomId: null,
      capturedInRound: null,
    };
  });
}

export interface RoleValidationResult {
  king: number;
  queen: number;
  princess: number;
  prince: number;
  knight: number;
  worker: number;
  joker: number;
  citizen: number;
  isValid: boolean;
  errors: string[];
}

export function validateRoleDistribution(members: Member[]): RoleValidationResult {
  const counts = {
    king: 0,
    queen: 0,
    princess: 0,
    prince: 0,
    knight: 0,
    worker: 0,
    joker: 0,
    citizen: 0,
  };

  members.forEach((m) => {
    if (counts[m.role] !== undefined) {
      counts[m.role]++;
    }
  });

  const errors: string[] = [];
  if (counts.king > 1) errors.push(`King count exceeds 1 (${counts.king})`);
  if (counts.queen > 1) errors.push(`Queen count exceeds 1 (${counts.queen})`);
  if (counts.princess > 1) errors.push(`Princess count exceeds 1 (${counts.princess})`);
  if (counts.prince > 1) errors.push(`Prince count exceeds 1 (${counts.prince})`);
  if (counts.knight > 3) errors.push(`Knight count exceeds 3 (${counts.knight})`);
  if (counts.worker > 3) errors.push(`Worker count exceeds 3 (${counts.worker})`);
  if (counts.joker > 3) errors.push(`Joker count exceeds 3 (${counts.joker})`);

  return {
    ...counts,
    isValid: errors.length === 0,
    errors,
  };
}

export const PRESET_QUESTION_BANKS: Record<string, Question[]> = {
  'World History': [
    {
      id: 'h1',
      category: 'World History',
      question: 'Which ancient civilization built the Great Pyramid of Giza?',
      options: ['Ancient Romans', 'Ancient Egyptians', 'Mesopotamians', 'Ancient Greeks'],
      correctIndex: 1,
      explanation: 'The Great Pyramid of Giza was commissioned by Pharaoh Khufu in Ancient Egypt around 2560 BCE.',
    },
    {
      id: 'h2',
      category: 'World History',
      question: 'Who was the first Emperor of Rome?',
      options: ['Julius Caesar', 'Augustus Caesar', 'Nero', 'Marcus Aurelius'],
      correctIndex: 1,
      explanation: 'Augustus Caesar (Octavian) became the first official Roman Emperor in 27 BCE.',
    },
    {
      id: 'h3',
      category: 'World History',
      question: 'Which medieval charter signed in 1215 limited the power of the English King?',
      options: ['Declaration of Independence', 'Magna Carta', 'Edict of Nantes', 'Treaty of Verdun'],
      correctIndex: 1,
      explanation: 'The Magna Carta ("Great Charter") was signed by King John at Runnymede in 1215.',
    },
    {
      id: 'h4',
      category: 'World History',
      question: 'What trade route connected East Asia with the Mediterranean World during medieval times?',
      options: ['Spice Route', 'Amber Road', 'Silk Road', 'Trans-Saharan Route'],
      correctIndex: 2,
      explanation: 'The Silk Road was an extensive network of Eurasian trade routes active from Han Dynasty times.',
    },
    {
      id: 'h5',
      category: 'World History',
      question: 'Which Renaissance figure painted the ceiling of the Sistine Chapel?',
      options: ['Leonardo da Vinci', 'Raphael', 'Michelangelo', 'Donatello'],
      correctIndex: 2,
      explanation: 'Michelangelo painted the Sistine Chapel ceiling between 1508 and 1512.',
    },
    {
      id: 'h6',
      category: 'World History',
      question: 'In which century did the Gutenberg Printing Press revolutionize European bookmaking?',
      options: ['13th Century', '15th Century', '17th Century', '18th Century'],
      correctIndex: 1,
      explanation: 'Johannes Gutenberg developed the movable-type printing press around 1440 in the 15th century.',
    },
  ],

  'Science & Nature': [
    {
      id: 's1',
      category: 'Science & Nature',
      question: 'What process do green plants use to convert sunlight into food energy?',
      options: ['Respiration', 'Photosynthesis', 'Fermentation', 'Transpiration'],
      correctIndex: 1,
      explanation: 'Photosynthesis uses chlorophyll to turn carbon dioxide, water, and sunlight into glucose and oxygen.',
    },
    {
      id: 's2',
      category: 'Science & Nature',
      question: 'Which chemical element has the symbol "Au" on the periodic table?',
      options: ['Silver', 'Gold', 'Copper', 'Aluminum'],
      correctIndex: 1,
      explanation: 'Au comes from the Latin word "Aurum", meaning glowing dawn or gold.',
    },
    {
      id: 's3',
      category: 'Science & Nature',
      question: 'What is the largest planet in our solar system?',
      options: ['Saturn', 'Neptune', 'Jupiter', 'Uranus'],
      correctIndex: 2,
      explanation: 'Jupiter is a gas giant and the largest planet in our solar system by far.',
    },
    {
      id: 's4',
      category: 'Science & Nature',
      question: 'What force keeps planets orbiting around the Sun?',
      options: ['Magnetism', 'Friction', 'Gravity', 'Centrifugal Force'],
      correctIndex: 2,
      explanation: 'Gravitational attraction between the massive Sun and planets keeps them in stable orbits.',
    },
    {
      id: 's5',
      category: 'Science & Nature',
      question: 'Which gas makes up the largest percentage of Earth’s atmosphere?',
      options: ['Oxygen', 'Carbon Dioxide', 'Nitrogen', 'Argon'],
      correctIndex: 2,
      explanation: 'Nitrogen makes up approximately 78% of Earth’s atmosphere, followed by oxygen at 21%.',
    },
  ],

  'Mathematics & Logic': [
    {
      id: 'm1',
      category: 'Mathematics & Logic',
      question: 'What is the sum of interior angles in any triangle?',
      options: ['90 degrees', '180 degrees', '270 degrees', '360 degrees'],
      correctIndex: 1,
      explanation: 'In Euclidean geometry, the three interior angles of a triangle always add up to 180°.',
    },
    {
      id: 'm2',
      category: 'Mathematics & Logic',
      question: 'What is the value of 7 squared minus 15?',
      options: ['34', '32', '30', '28'],
      correctIndex: 0,
      explanation: '7 squared = 49. 49 - 15 = 34.',
    },
    {
      id: 'm3',
      category: 'Mathematics & Logic',
      question: 'What is the smallest prime number?',
      options: ['0', '1', '2', '3'],
      correctIndex: 2,
      explanation: '2 is the smallest prime number and the only even prime number.',
    },
    {
      id: 'm4',
      category: 'Mathematics & Logic',
      question: 'If a kingdom marches 12 miles each day, how many miles will it march in 8 days?',
      options: ['84 miles', '92 miles', '96 miles', '104 miles'],
      correctIndex: 2,
      explanation: '12 × 8 = 96 miles.',
    },
  ],

  'Medieval Fantasy & Lore': [
    {
      id: 'f1',
      category: 'Medieval Fantasy & Lore',
      question: 'What mythical fire-breathing creature is commonly depicted guarding royal treasure in castles?',
      options: ['Griffin', 'Dragon', 'Basilisk', 'Phoenix'],
      correctIndex: 1,
      explanation: 'Dragons are legendary reptilian beasts famous in medieval myth for hoarding gold and breathing fire.',
    },
    {
      id: 'f2',
      category: 'Medieval Fantasy & Lore',
      question: 'What was the heavy protective coat of linked metal rings worn by medieval knights called?',
      options: ['Plate Armor', 'Chainmail', 'Leather Cuirass', 'Gauntlet'],
      correctIndex: 1,
      explanation: 'Chainmail armor was constructed of thousands of interlocking metal rings to stop slashing strikes.',
    },
    {
      id: 'f3',
      category: 'Medieval Fantasy & Lore',
      question: 'What medieval defensive feature was a deep, water-filled ditch surrounding a castle wall?',
      options: ['Keep', 'Moat', 'Drawbridge', 'Portcullis'],
      correctIndex: 1,
      explanation: 'A moat encircled castle fortifications to prevent siege engines and tunneling attackers.',
    },
    {
      id: 'f4',
      category: 'Medieval Fantasy & Lore',
      question: 'In legend, what famous sword was pulled from a stone by King Arthur?',
      options: ['Durandal', 'Excalibur', 'Joyouse', 'Glamdring'],
      correctIndex: 1,
      explanation: 'Excalibur is the legendary sword associated with King Arthur’s divine right to rule Britain.',
    },
  ],
};

export interface KingdomPresetConfig {
  name: string;
  bannerSymbol: string;
  colorName: string;
  colorGradient: string;
  borderColor: string;
  textColor: string;
  castleStyle: string;
  element: string;
  primaryColors: string;
  coatOfArms: string;
  identity: string;
  bannerColor: string;
  members: string[];
}

export const PRESET_KINGDOMS: KingdomPresetConfig[] = [
  {
    name: 'Kingdom of Lireo',
    bannerSymbol: '🌬️',
    colorName: 'sky',
    colorGradient: 'from-sky-700 via-sky-900 to-slate-950',
    borderColor: 'border-sky-400/80',
    textColor: 'text-sky-300',
    castleStyle: 'Floating Sky Citadel & Watchtowers',
    element: 'Air',
    primaryColors: 'Silver White & Sky Blue',
    coatOfArms: 'Golden Phoenix with outstretched wings soaring through the sky',
    identity:
      'A majestic kingdom built on towering cliffs and floating mountain fortresses. Windmills, soaring watchtowers, banners dancing in the wind, and high stone castles symbolize freedom, honor, and swiftness.',
    bannerColor: '#0284c7',
    members: [
      'Amihan the Soaring',
      'Ybrahim of Lireo',
      'Danaya the Valiant',
      'Alena of the Breeze',
      'Aquil the Commander',
      'Muros the Guardian',
      'Aria Sterling',
      'Zephyr Vance',
      'Gale Windwalker',
      'Skyline Sentinel',
      'Celeste Falcon',
      'Orion Soarer',
      'Aura Whisper',
      'Skye Highborn',
      'Breeze Keeper',
    ],
  },
  {
    name: 'Kingdom of Adamya',
    bannerSymbol: '💧',
    colorName: 'blue',
    colorGradient: 'from-blue-800 via-indigo-950 to-slate-950',
    borderColor: 'border-blue-400/80',
    textColor: 'text-blue-300',
    castleStyle: 'Maritime Ocean Fortress & Canals',
    element: 'Water',
    primaryColors: 'Sapphire Blue & Silver',
    coatOfArms: 'Silver Trident above ocean waves',
    identity:
      'A maritime kingdom surrounded by rivers, waterfalls, lakes, and harbors. Elegant white stone castles, fountains, canals, and aquatic motifs represent wisdom, serenity, and adaptability.',
    bannerColor: '#1d4ed8',
    members: [
      'Imaw the Wise Elder',
      'Ayna the Seer',
      'Nereus Tidecaller',
      'Marina Oceanus',
      'Caspian Wave',
      'Trident Guard',
      'Triton Silverfall',
      'Coralia Sapphire',
      'River Brooks',
      'Oceanus Reed',
      'Kaelen Cascade',
      'Serena Waters',
      'Mora Current',
      'Kaius Driftwood',
      'Isla Tideborn',
    ],
  },
  {
    name: 'Kingdom of Sapiro',
    bannerSymbol: '🌿',
    colorName: 'emerald',
    colorGradient: 'from-emerald-800 via-teal-950 to-amber-950',
    borderColor: 'border-emerald-400/80',
    textColor: 'text-emerald-300',
    castleStyle: 'Ancient Mountain Tree Citadel',
    element: 'Earth',
    primaryColors: 'Emerald Green & Bronze',
    coatOfArms: 'Ancient Tree growing from a mountain',
    identity:
      'A kingdom surrounded by forests and mountains, with stone citadels, timber halls, vines, and moss-covered architecture representing strength, prosperity, and harmony with nature.',
    bannerColor: '#059669',
    members: [
      'Armeo the Ancient King',
      'Raquim the Brave',
      'Lira of the Woods',
      'Sylvan Arbor',
      'Terran Roots',
      'Cedar Bronzehall',
      'Gideon Moss',
      'Ivy Greenheart',
      'Forest Ranger',
      'Rowan Bark',
      'Hazel Timber',
      'Thorn Stoneguard',
      'Flora Earthweaver',
      'Sylvanus Oak',
      'Verdant Warden',
    ],
  },
  {
    name: 'Kingdom of Hathoria',
    bannerSymbol: '🔥',
    colorName: 'red',
    colorGradient: 'from-red-800 via-amber-950 to-stone-950',
    borderColor: 'border-red-500/80',
    textColor: 'text-red-300',
    castleStyle: 'Volcanic Lava Stone Fortress',
    element: 'Fire',
    primaryColors: 'Crimson Red & Gold',
    coatOfArms: 'Flaming Lion surrounded by blazing fire',
    identity:
      'A powerful kingdom forged among volcanic mountains and lava fields. Black volcanic stone fortresses, burning braziers, crimson banners, and massive iron gates symbolize courage, determination, and military strength.',
    bannerColor: '#dc2626',
    members: [
      'Hagorn the Crimson Monarch',
      'Pirena the Flame-Master',
      'Mira the Fiery Heir',
      'Asval the Warlord',
      'Agane the Flameguard',
      'Ignis Blaze',
      'Vulcan Ironsmith',
      'Ember Crimson',
      'Pyro Lionheart',
      'Sear Braziers',
      'Ash Drake',
      'Blaze Striker',
      'Cinder Forge',
      'Phoenix Redfall',
      'Scorched Warden',
    ],
  },
  {
    name: 'Kingdom of Mineave',
    bannerSymbol: '❄️',
    colorName: 'cyan',
    colorGradient: 'from-cyan-700 via-sky-900 to-slate-950',
    borderColor: 'border-cyan-300/80',
    textColor: 'text-cyan-200',
    castleStyle: 'Frozen Northern Crystal Palace',
    element: 'Ice',
    primaryColors: 'Ice Blue & White',
    coatOfArms: 'Crystal Snowflake surrounding a brilliant Ice Crystal',
    identity:
      'A frozen northern kingdom with magnificent ice castles, snow-covered towers, frozen waterfalls, glaciers, and shimmering crystal architecture. It represents resilience, discipline, and endurance.',
    bannerColor: '#0284c7',
    members: [
      'Avria the Frost Empress',
      'Boreas Ice-Lord',
      'Crystal Snowflake',
      'Glacier Watcher',
      'Frostbite Guardian',
      'Eira Snowfall',
      'Winter Chill',
      'Rime Sentinel',
      'Siren Crystal',
      'Polaris North',
      'Yukon Endurance',
      'Crystalline Guard',
      'Avalanche Striker',
      'Blizzard Warden',
      'Frostpeak Herald',
    ],
  },
  {
    name: 'Kingdom of Etheria',
    bannerSymbol: '⚔️',
    colorName: 'purple',
    colorGradient: 'from-purple-900 via-fuchsia-950 to-black',
    borderColor: 'border-purple-500/80',
    textColor: 'text-purple-300',
    castleStyle: 'Obsidian Gothic Spire & Moonlit Ruins',
    element: 'Dark Magic',
    primaryColors: 'Black & Royal Purple',
    coatOfArms: 'Black Raven perched upon a Dark Crown beneath a solar eclipse',
    identity:
      'A mysterious kingdom of dark sorcery with towering obsidian castles, gothic spires, enchanted forests, ravens, moonlit courtyards, and ancient magical ruins. It represents ambition, secrecy, and forbidden knowledge.',
    bannerColor: '#581c87',
    members: [
      'Etheria Raven-Queen',
      'Andora the Sorceress',
      'Jana the Shadow Blade',
      'Odessa the Spellbinder',
      'Raven Darkcrown',
      'Obsidian Shadow',
      'Eclipse Sorcerer',
      'Nocturne Secrecy',
      'Void Spellweaver',
      'Gothic Spireguard',
      'Vesper Nightfall',
      'Nyx Sorceress',
      'Malakor Shadowlord',
      'Umbra Raven',
      'Forbidden Seer',
    ],
  },
];
