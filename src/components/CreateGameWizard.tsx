import React, { useState, useMemo } from 'react';
import { Kingdom, GameSettings, Question, Member, RoleType, ROLE_DEFINITIONS } from '../types';
import {
  PRESET_KINGDOMS,
  PRESET_QUESTION_BANKS,
  assignSecretRoles,
  validateRoleDistribution,
} from '../data/presetData';
import {
  Shield,
  Clock,
  Sparkles,
  Users,
  Castle,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Wand2,
  Play,
  RotateCcw,
  BookOpen,
  Shuffle,
  Volume2,
  VolumeX,
  Eye,
  EyeOff,
  Crown,
  Lock,
  Unlock,
  AlertCircle,
  Check,
  Layers,
  Dices,
  Search,
  AlertTriangle,
  Scroll,
} from 'lucide-react';

interface CreateGameWizardProps {
  onStartGame: (kingdoms: Kingdom[], settings: GameSettings, questions: Question[]) => void;
  availableQuestions: Record<string, Question[]>;
  onOpenQuestionArchive?: () => void;
  onGenerateAIQuestions?: (topic: string) => Promise<Question[] | null>;
  onCancel: () => void;
}

export const CreateGameWizard: React.FC<CreateGameWizardProps> = ({
  onStartGame,
  availableQuestions,
  onOpenQuestionArchive,
  onGenerateAIQuestions,
  onCancel,
}) => {
  const [currentStep, setCurrentStep] = useState<number>(1);

  // Step 1: Game Info
  const [gameName, setGameName] = useState('Royal Classroom Championship');
  const [numKingdoms, setNumKingdoms] = useState<number>(4);
  const [timerDuration, setTimerDuration] = useState<number>(30);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [theme, setTheme] = useState('Classic Medieval');

  // Step 2 & 3: Kingdoms & Members
  const [kingdoms, setKingdoms] = useState<Kingdom[]>(() => {
    return PRESET_KINGDOMS.slice(0, 4).map((k, idx) => ({
      ...k,
      id: `k-${idx + 1}`,
      score: 0,
      status: 'active' as const,
      members: assignSecretRoles([
        `${k.name} Champion 1`,
        `${k.name} Champion 2`,
        `${k.name} Champion 3`,
        `${k.name} Champion 4`,
        `${k.name} Champion 5`,
      ]),
    }));
  });

  // Step 5: Question Scroll Archive Selection
  const [selectedArchiveKey, setSelectedArchiveKey] = useState<string>(() => {
    const keys = Object.keys(availableQuestions);
    return keys.length > 0 ? keys[0] : 'World History';
  });
  const [loadMode, setLoadMode] = useState<'all' | 'custom'>('all');
  const [customQuestionCount, setCustomQuestionCount] = useState<number>(20);
  const [orderMode, setOrderMode] = useState<'shuffle' | 'original'>('shuffle');
  const [previewSearch, setPreviewSearch] = useState<string>('');

  const [selectedCategory, setSelectedCategory] = useState<string>('World History');
  const [activeQuestionsList, setActiveQuestionsList] = useState<Question[]>(
    availableQuestions['World History'] || PRESET_QUESTION_BANKS['World History'] || []
  );

  // Derived raw questions for selected archive
  const rawArchiveQuestions = useMemo(() => {
    if (availableQuestions[selectedArchiveKey] !== undefined) {
      return availableQuestions[selectedArchiveKey];
    }
    if (PRESET_QUESTION_BANKS[selectedArchiveKey] !== undefined) {
      return PRESET_QUESTION_BANKS[selectedArchiveKey];
    }
    return [];
  }, [availableQuestions, selectedArchiveKey]);

  // Derived final questions for battle based on selection & order options
  const finalQuestionsForBattle = useMemo(() => {
    if (!rawArchiveQuestions || rawArchiveQuestions.length === 0) return [];

    let list = [...rawArchiveQuestions];

    // Custom Number mode selects random questions from the archive
    if (loadMode === 'custom') {
      const count = Math.max(1, Math.min(customQuestionCount, list.length));
      const randomCopy = [...list];
      for (let i = randomCopy.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [randomCopy[i], randomCopy[j]] = [randomCopy[j], randomCopy[i]];
      }
      list = randomCopy.slice(0, count);
    }

    // Shuffle questions if enabled
    if (orderMode === 'shuffle') {
      const shuffled = [...list];
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
      return shuffled;
    }

    return list;
  }, [rawArchiveQuestions, loadMode, customQuestionCount, orderMode]);

  // Filtered list for the Game Scroll Preview search
  const previewQuestionsList = useMemo(() => {
    if (!previewSearch.trim()) return finalQuestionsForBattle;
    const query = previewSearch.toLowerCase();
    return finalQuestionsForBattle.filter(
      (q) =>
        q.question.toLowerCase().includes(query) ||
        q.options.some((opt) => opt.toLowerCase().includes(query)) ||
        (q.subject && q.subject.toLowerCase().includes(query)) ||
        (q.category && q.category.toLowerCase().includes(query))
    );
  }, [finalQuestionsForBattle, previewSearch]);

  // Archive metadata summary
  const archiveMetadata = useMemo(() => {
    const subject =
      rawArchiveQuestions[0]?.subject ||
      rawArchiveQuestions[0]?.category ||
      selectedArchiveKey.split('–')[0]?.trim() ||
      'General';
    const gradeLevel =
      rawArchiveQuestions[0]?.gradeLevel ||
      (selectedArchiveKey.includes('Grade')
        ? selectedArchiveKey.match(/Grade\s*\d+/i)?.[0] || 'Grade 11'
        : 'Grade 11');
    const difficulty = rawArchiveQuestions[0]?.difficulty || 'Mixed';
    const totalQuestions = rawArchiveQuestions.length;
    const questionsSelected = finalQuestionsForBattle.length;

    return {
      subject,
      gradeLevel,
      difficulty,
      totalQuestions,
      questionsSelected,
    };
  }, [rawArchiveQuestions, selectedArchiveKey, finalQuestionsForBattle]);

  // Synchronize numKingdoms with kingdoms array
  const handleNumKingdomsChange = (num: number) => {
    setNumKingdoms(num);
    if (num > kingdoms.length) {
      const extra = PRESET_KINGDOMS.slice(kingdoms.length, num).map((k, idx) => ({
        ...k,
        id: `k-${kingdoms.length + idx + 1}`,
        score: 0,
        status: 'active' as const,
        members: assignSecretRoles([
          `${k.name} Champion 1`,
          `${k.name} Champion 2`,
          `${k.name} Champion 3`,
          `${k.name} Champion 4`,
          `${k.name} Champion 5`,
        ]),
      }));
      setKingdoms([...kingdoms, ...extra]);
    } else {
      setKingdoms(kingdoms.slice(0, num));
    }
  };

  // Step 3: Member Text Area per Kingdom
  const handleMemberTextChange = (kIdx: number, text: string) => {
    const names = text
      .split('\n')
      .map((n) => n.trim())
      .filter(Boolean);
    const updated = [...kingdoms];
    const k = updated[kIdx];
    updated[kIdx].members = assignSecretRoles(
      names.length > 0 ? names : [`${updated[kIdx].name} Knight`]
    );
    setKingdoms(updated);
    // Reset confirmation for this kingdom if roster changes
    if (k && confirmedKingdomIds.includes(k.id)) {
      setConfirmedKingdomIds(confirmedKingdomIds.filter((id) => id !== k.id));
    }
  };

  // Step 4: Kingdom-by-Kingdom Role Assignment Wizard State
  const [activeRoleKingdomIdx, setActiveRoleKingdomIdx] = useState<number>(0);
  const [confirmedKingdomIds, setConfirmedKingdomIds] = useState<string[]>([]);
  const [assignedKingdomIds, setAssignedKingdomIds] = useState<string[]>([]);
  const [showRolesPreview, setShowRolesPreview] = useState<boolean>(true);
  const [roleNotice, setRoleNotice] = useState<string | null>(null);

  const allKingdomsConfirmed =
    kingdoms.length > 0 && kingdoms.every((k) => confirmedKingdomIds.includes(k.id));

  // Assign or Randomize secret roles for specific kingdom
  const handleAssignKingdomRoles = (kIdx: number) => {
    const k = kingdoms[kIdx];
    if (!k) return;
    const updated = [...kingdoms];
    updated[kIdx] = {
      ...k,
      members: assignSecretRoles(k.members.map((m) => m.name)),
    };
    setKingdoms(updated);
    setRoleNotice(null);
    if (!assignedKingdomIds.includes(k.id)) {
      setAssignedKingdomIds([...assignedKingdomIds, k.id]);
    }
  };

  // Confirm assignment and advance to next kingdom
  const handleConfirmKingdomRoles = (kIdx: number) => {
    const k = kingdoms[kIdx];
    if (!k) return;

    // Enforce strict validation
    const val = validateRoleDistribution(k.members);
    if (!val.isValid) {
      setRoleNotice(`⚠️ Invalid role counts for ${k.name}: ${val.errors.join(', ')}`);
      return;
    }

    setRoleNotice(null);
    if (!confirmedKingdomIds.includes(k.id)) {
      setConfirmedKingdomIds([...confirmedKingdomIds, k.id]);
    }
    if (!assignedKingdomIds.includes(k.id)) {
      setAssignedKingdomIds([...assignedKingdomIds, k.id]);
    }

    // Auto-advance to next kingdom if available
    if (kIdx + 1 < kingdoms.length) {
      setActiveRoleKingdomIdx(kIdx + 1);
    }
  };

  const handleRoleChange = (kIdx: number, mIdx: number, newRole: RoleType) => {
    const updated = [...kingdoms];
    const updatedMembers = [...updated[kIdx].members];
    updatedMembers[mIdx] = {
      ...updatedMembers[mIdx],
      role: newRole,
    };
    updated[kIdx] = {
      ...updated[kIdx],
      members: updatedMembers,
    };
    setKingdoms(updated);
    // Un-confirm if manual changes break rules or require re-confirmation
    const targetK = updated[kIdx];
    if (confirmedKingdomIds.includes(targetK.id)) {
      setConfirmedKingdomIds(confirmedKingdomIds.filter((id) => id !== targetK.id));
    }
  };

  // Final submit
  const handleStartBattle = () => {
    if (!allKingdomsConfirmed) {
      setRoleNotice('⚠️ Role assignment is incomplete. Please confirm roles for all kingdoms before starting the battle.');
      setCurrentStep(4);
      return;
    }
    const settings: GameSettings = {
      questionTimerDuration: timerDuration,
      soundEnabled,
      category: selectedCategory,
      autoRevealGoblets: false,
    };
    onStartGame(kingdoms, settings, activeQuestionsList);
  };

  return (
    <div className="max-w-[1700px] w-full mx-auto p-3 sm:p-6 font-cinzel animate-in fade-in duration-500">
      <div className="flex flex-col lg:flex-row gap-6 items-start">
        {/* Permanent Left Sidebar Navigation */}
        <aside className="w-full lg:w-72 xl:w-80 shrink-0 bg-[#1c1612]/90 backdrop-blur-md border-4 border-[#8b7355] rounded-3xl p-5 shadow-2xl lg:sticky lg:top-4 text-[#f3e5ab] space-y-5">
          {/* Brand & Game Header */}
          <div className="text-center space-y-1 pb-3 border-b-2 border-[#8b7355]/40">
            <div className="flex items-center justify-center gap-1.5 text-[11px] font-black text-[#d4af37] uppercase tracking-widest font-cinzel">
              <Castle className="w-4 h-4 text-[#d4af37]" /> ROYAL CLASSROOM
            </div>
            <h2 className="text-sm font-black text-[#f3e5ab] font-cinzel uppercase tracking-wider text-gold-engraved">
              CHAMPIONSHIP
            </h2>
            <div className="text-[11px] text-[#e0d6c5] italic font-serif truncate max-w-[240px] mx-auto pt-0.5">
              ⚔️ {gameName}
            </div>
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#120e0c] border border-[#d4af37] text-xs font-black text-[#d4af37] uppercase tracking-wider justify-center shadow">
            <Wand2 className="w-3.5 h-3.5 text-[#d4af37]" /> Create New Game
          </div>

          {/* Sidebar Navigation Items */}
          <nav className="space-y-1.5 font-cinzel">
            {[
              { num: 1, label: '① Information', icon: '🛡️' },
              { num: 2, label: '② Realms', icon: '🏰' },
              { num: 3, label: '③ Roster', icon: '👥' },
              { num: 4, label: '④ Roles', icon: '👑' },
              { num: 5, label: '⑤ Questions', icon: '📜' },
              { num: 6, label: '⑥ Preview', icon: '⚔️' },
            ].map((stepItem) => {
              const isCurrent = currentStep === stepItem.num;
              const isCompleted = currentStep > stepItem.num;
              return (
                <button
                  key={stepItem.num}
                  type="button"
                  onClick={() => {
                    if (currentStep === 4 && stepItem.num > 4 && !allKingdomsConfirmed) {
                      setRoleNotice('⚠️ Please complete and confirm role assignment for all kingdoms before proceeding!');
                      return;
                    }
                    setRoleNotice(null);
                    setCurrentStep(stepItem.num);
                  }}
                  className={`w-full p-2.5 rounded-xl border text-xs font-black uppercase transition-all flex items-center justify-between cursor-pointer ${
                    isCurrent
                      ? 'bg-gradient-to-r from-[#d4af37] via-[#f3e5ab] to-[#d4af37] text-[#120e0c] border-[#f3e5ab] shadow-xl font-black scale-[1.02]'
                      : isCompleted
                      ? 'bg-emerald-950/60 hover:bg-emerald-900/80 text-emerald-300 border-emerald-600'
                      : 'bg-[#120e0c] hover:bg-[#2a1c13] text-[#8b7355] hover:text-[#f3e5ab] border-[#8b7355]/40'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-sm">{stepItem.icon}</span>
                    <span>{stepItem.label}</span>
                  </div>
                  {isCurrent ? (
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#120e0c] text-[#d4af37] border border-[#d4af37]">
                      ★ Active
                    </span>
                  ) : isCompleted ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  ) : (
                    <span className="text-[10px] text-[#8b7355]">🔒</span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Setup Progress Widget */}
          <div className="p-3.5 bg-[#120e0c] border border-[#8b7355] rounded-2xl space-y-2 font-serif text-xs">
            <div className="flex justify-between items-center font-cinzel text-[11px] font-black text-[#d4af37]">
              <span>Progress</span>
              <span>{Math.round((currentStep / 6) * 100)}%</span>
            </div>
            <div className="w-full bg-[#1c1612] h-2.5 rounded-full border border-[#8b7355]/60 overflow-hidden p-0.5">
              <div
                className="bg-gradient-to-r from-[#8b7355] via-[#d4af37] to-[#f3e5ab] h-full rounded-full transition-all duration-300"
                style={{ width: `${Math.round((currentStep / 6) * 100)}%` }}
              />
            </div>
            <div className="text-right text-[10px] text-[#8b7355] font-mono">
              Step {currentStep} of 6
            </div>
          </div>

          {/* Sidebar Nav Buttons */}
          <div className="pt-3 border-t-2 border-[#8b7355]/40 space-y-2 font-cinzel">
            <div className="flex gap-2">
              {currentStep > 1 ? (
                <button
                  type="button"
                  onClick={() => setCurrentStep(currentStep - 1)}
                  className="flex-1 py-2.5 bg-[#120e0c] hover:bg-[#2a1c13] text-[#f3e5ab] font-black text-xs uppercase rounded-xl border border-[#8b7355] flex items-center justify-center gap-1.5 cursor-pointer transition-all"
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> Back
                </button>
              ) : (
                <button
                  type="button"
                  onClick={onCancel}
                  className="flex-1 py-2.5 bg-[#120e0c] hover:bg-[#2a1c13] text-[#8b7355] hover:text-[#f3e5ab] font-black text-xs uppercase rounded-xl border border-[#8b7355]/40 cursor-pointer transition-all"
                >
                  Cancel
                </button>
              )}

              {currentStep < 6 && (
                <button
                  type="button"
                  onClick={() => {
                    if (currentStep === 4 && !allKingdomsConfirmed) {
                      setRoleNotice('⚠️ Please complete and confirm role assignment for all kingdoms before proceeding!');
                      return;
                    }
                    setRoleNotice(null);
                    setCurrentStep(currentStep + 1);
                  }}
                  className="flex-1 py-2.5 bg-gradient-to-r from-[#d4af37] via-[#f3e5ab] to-[#d4af37] text-[#120e0c] font-black text-xs uppercase rounded-xl shadow hover:scale-105 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  Next <ArrowRight className="w-3.5 h-3.5 text-[#120e0c]" />
                </button>
              )}
            </div>
          </div>
        </aside>

        {/* Main Workspace Area */}
        <main className="flex-1 min-w-0 w-full space-y-6">

      {/* Step 1: Game Information */}
      {currentStep === 1 && (
        <div className="bg-[#1c1612] border-4 border-[#8b7355] rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 font-serif text-xs">
          <h3 className="text-lg font-black text-[#f3e5ab] font-cinzel border-b-2 border-[#8b7355]/40 pb-3 flex items-center gap-2">
            <Shield className="w-5 h-5 text-[#d4af37]" /> Step 1: General Battle Settings
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="font-bold text-[#d4af37] font-cinzel">Game Title:</label>
              <input
                type="text"
                value={gameName}
                onChange={(e) => setGameName(e.target.value)}
                className="w-full bg-[#120e0c] border border-[#8b7355] rounded-xl p-3 text-[#f3e5ab] text-sm focus:outline-none focus:border-[#d4af37]"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-[#d4af37] font-cinzel">Number of Kingdoms (2 to 6):</label>
              <select
                value={numKingdoms}
                onChange={(e) => handleNumKingdomsChange(Number(e.target.value))}
                className="w-full bg-[#120e0c] border border-[#8b7355] rounded-xl p-3 text-[#f3e5ab] text-sm focus:outline-none focus:border-[#d4af37]"
              >
                <option value={2}>2 Kingdoms</option>
                <option value={3}>3 Kingdoms</option>
                <option value={4}>4 Kingdoms (Default)</option>
                <option value={5}>5 Kingdoms</option>
                <option value={6}>6 Kingdoms</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="font-bold text-[#d4af37] font-cinzel">Hourglass Question Timer:</label>
              <select
                value={timerDuration}
                onChange={(e) => setTimerDuration(Number(e.target.value))}
                className="w-full bg-[#120e0c] border border-[#8b7355] rounded-xl p-3 text-[#f3e5ab] text-sm focus:outline-none focus:border-[#d4af37]"
              >
                <option value={10}>10 Seconds (Speed Duel)</option>
                <option value={20}>20 Seconds (Fast)</option>
                <option value={30}>30 Seconds (Standard)</option>
                <option value={45}>45 Seconds (Relaxed)</option>
                <option value={60}>60 Seconds (Complex)</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="font-bold text-[#d4af37] font-cinzel">Sound Effects & Fanfare:</label>
              <button
                type="button"
                onClick={() => setSoundEnabled(!soundEnabled)}
                className={`w-full p-3 rounded-xl border flex items-center justify-between font-bold cursor-pointer ${
                  soundEnabled
                    ? 'bg-emerald-950/80 border-emerald-500 text-emerald-300'
                    : 'bg-rose-950/80 border-rose-500 text-rose-300'
                }`}
              >
                <span>{soundEnabled ? '🔊 Sound Engine Enabled' : '🔇 Muted Mode'}</span>
                {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Step 2: Create Kingdoms */}
      {currentStep === 2 && (
        <div className="bg-[#1c1612] border-4 border-[#8b7355] rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 font-serif text-xs">
          <h3 className="text-lg font-black text-[#f3e5ab] font-cinzel border-b-2 border-[#8b7355]/40 pb-3 flex items-center gap-2">
            <Castle className="w-5 h-5 text-[#d4af37]" /> Step 2: Configure Kingdom Banners & Styles
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {kingdoms.map((k, idx) => (
              <div key={k.id || `k-${idx}`} className="p-4 bg-[#120e0c] rounded-2xl border border-[#8b7355] space-y-2.5">
                <div className="flex items-center gap-3">
                  <span className="text-3xl p-1 rounded-lg bg-[#1c1612] border border-[#8b7355]">{k.bannerSymbol}</span>
                  <div className="flex-1">
                    <input
                      type="text"
                      value={k.name}
                      onChange={(e) => {
                        const updated = [...kingdoms];
                        updated[idx].name = e.target.value;
                        setKingdoms(updated);
                      }}
                      className="bg-[#1c1612] border border-[#8b7355] rounded-xl p-2 font-cinzel font-bold text-[#f3e5ab] text-sm w-full"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px] pt-1 border-t border-[#8b7355]/30">
                  <div>
                    <span className="text-[#8b7355]">Domain:</span>{' '}
                    <span className="text-[#d4af37] font-bold">{k.element || 'Medieval Realm'}</span>
                  </div>
                  <div>
                    <span className="text-[#8b7355]">Colors:</span>{' '}
                    <span className="text-[#f3e5ab] font-mono text-[10px]">{k.primaryColors || k.colorName}</span>
                  </div>
                </div>

                {k.coatOfArms && (
                  <div className="text-[11px] text-[#8b7355]">
                    ⚜️ Coat of Arms: <span className="text-[#f3e5ab] font-serif italic">{k.coatOfArms}</span>
                  </div>
                )}

                <div className="text-[11px] text-[#8b7355]">
                  🏰 Castle: <span className="text-[#f3e5ab]">{k.castleStyle}</span>
                </div>

                {k.identity && (
                  <p className="text-[10px] text-[#e0d6c5]/80 italic border-t border-[#8b7355]/20 pt-2 leading-tight">
                    "{k.identity}"
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Step 3: Add Members */}
      {currentStep === 3 && (
        <div className="bg-[#1c1612] border-4 border-[#8b7355] rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 font-serif text-xs">
          <h3 className="text-lg font-black text-[#f3e5ab] font-cinzel border-b-2 border-[#8b7355]/40 pb-3 flex items-center gap-2">
            <Users className="w-5 h-5 text-[#d4af37]" /> Step 3: Student Roster Entry
          </h3>
          <p className="text-[#e0d6c5] italic">
            Enter student names for each kingdom (one per line). Secret roles will be assigned automatically.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {kingdoms.map((k, kIdx) => (
              <div key={k.id || `k-${kIdx}`} className="p-4 bg-[#120e0c] rounded-2xl border border-[#8b7355] space-y-2">
                <label className="font-cinzel font-black text-[#d4af37] text-sm flex items-center gap-2">
                  <span>{k.bannerSymbol}</span> {k.name} ({k.members.length} Members)
                </label>
                <textarea
                  rows={4}
                  value={k.members.map((m) => m.name).join('\n')}
                  onChange={(e) => handleMemberTextChange(kIdx, e.target.value)}
                  className="w-full bg-[#1c1612] border border-[#8b7355] rounded-xl p-2.5 text-[#f3e5ab] text-xs focus:outline-none focus:border-[#d4af37]"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Step 4: 3-Column Desktop Layout (Column 2: Kingdom Setup Panel, Column 3: Active Kingdom Configuration Panel) */}
      {currentStep === 4 && (
        <div className="flex flex-col xl:flex-row gap-6 items-start font-serif text-xs">
          {/* COLUMN 2: Kingdom Setup Panel (400-450px) */}
          <div className="w-full xl:w-[420px] shrink-0 bg-[#1c1612] border-4 border-[#8b7355] rounded-3xl p-5 sm:p-6 shadow-2xl space-y-5">
            {/* Column 2 Header */}
            <div className="border-b-2 border-[#8b7355]/40 pb-4 space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#120e0c] border border-[#d4af37] text-[10px] font-black text-[#d4af37] uppercase tracking-widest">
                <Crown className="w-3.5 h-3.5 text-[#d4af37]" /> Step 4 of 6
              </div>
              <h3 className="text-lg font-black text-[#f3e5ab] font-cinzel uppercase tracking-wider">
                👑 Kingdom Role Assignment Wizard
              </h3>
              <p className="text-[11px] text-[#e0d6c5] italic leading-relaxed">
                Roles are assigned one kingdom at a time. Select a realm below to configure secret roles for each champion.
              </p>

              {/* Hide / Preview Roles Button */}
              <button
                type="button"
                onClick={() => setShowRolesPreview(!showRolesPreview)}
                className="w-full mt-2 py-2 bg-[#120e0c] hover:bg-[#2a1c13] text-[#f3e5ab] border border-[#8b7355] text-xs font-bold font-cinzel rounded-xl flex items-center justify-center gap-2 cursor-pointer shadow transition-all"
              >
                {showRolesPreview ? <EyeOff className="w-4 h-4 text-[#d4af37]" /> : <Eye className="w-4 h-4 text-[#d4af37]" />}
                {showRolesPreview ? 'Hide Roles (Secret)' : 'Preview Roles'}
              </button>
            </div>

            {/* Role Notice Banner */}
            {roleNotice && (
              <div className="p-3 bg-rose-950/80 border-2 border-rose-500 rounded-2xl text-rose-200 text-xs font-bold flex items-center gap-2 animate-in fade-in">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{roleNotice}</span>
              </div>
            )}

            {/* Role Assignment Setup Progress Card */}
            <div className="p-4 bg-[#120e0c] border-2 border-[#8b7355] rounded-2xl space-y-3 shadow-inner font-cinzel">
              <div className="flex items-center justify-between text-xs font-black">
                <span className="text-[#d4af37] flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-[#d4af37]" /> Setup Progress
                </span>
                <span className="text-[#f3e5ab]">
                  {confirmedKingdomIds.length} / {kingdoms.length} Confirmed ({Math.round((confirmedKingdomIds.length / kingdoms.length) * 100)}%)
                </span>
              </div>

              {/* Visual Progress Bar */}
              <div className="w-full bg-[#1c1612] h-3 rounded-full border border-[#8b7355]/60 overflow-hidden p-0.5">
                <div
                  className="bg-gradient-to-r from-[#8b7355] via-[#d4af37] to-[#f3e5ab] h-full rounded-full transition-all duration-500 shadow"
                  style={{ width: `${Math.round((confirmedKingdomIds.length / kingdoms.length) * 100)}%` }}
                />
              </div>
            </div>

            {/* Kingdom Selection List */}
            <div className="space-y-2.5 font-cinzel">
              <div className="text-xs font-black text-[#d4af37] uppercase tracking-wider flex items-center justify-between">
                <span>Kingdom Realms</span>
                <span className="text-[10px] text-[#e0d6c5] font-serif italic">Select to edit</span>
              </div>

              <div className="space-y-2">
                {kingdoms.map((k, kIdx) => {
                  const isConfirmed = confirmedKingdomIds.includes(k.id);
                  const isActive = kIdx === activeRoleKingdomIdx;
                  return (
                    <button
                      key={k.id || `k-${kIdx}`}
                      type="button"
                      onClick={() => {
                        setActiveRoleKingdomIdx(kIdx);
                        setRoleNotice(null);
                      }}
                      className={`w-full p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex items-center justify-between gap-3 shadow-lg ${
                        isActive
                          ? 'bg-gradient-to-r from-[#2a1c13] via-[#1c1612] to-[#120e0c] border-[#d4af37] ring-2 ring-[#d4af37]/50 shadow-2xl scale-[1.01]'
                          : isConfirmed
                          ? 'bg-emerald-950/40 hover:bg-emerald-900/60 border-emerald-600 text-emerald-200'
                          : 'bg-[#120e0c] hover:bg-[#2a1c13] border-[#8b7355]/50 text-[#8b7355]'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="text-2xl p-1.5 bg-[#1c1612] border border-[#8b7355]/40 rounded-xl shrink-0">
                          {k.bannerSymbol}
                        </span>
                        <div className="min-w-0">
                          <div className="font-black text-xs text-[#f3e5ab] truncate">
                            {k.name}
                          </div>
                          <div className="text-[10px] text-[#e0d6c5] font-serif italic">
                            {k.members.length} Warriors
                          </div>
                        </div>
                      </div>

                      <div className="shrink-0 text-right">
                        {isConfirmed ? (
                          <span className="px-2.5 py-1 bg-emerald-950 border border-emerald-500 text-emerald-300 font-bold text-[10px] rounded-lg flex items-center gap-1 shadow">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Confirmed
                          </span>
                        ) : isActive ? (
                          <span className="px-2.5 py-1 bg-[#2a1c13] border border-[#d4af37] text-[#d4af37] font-bold text-[10px] rounded-lg flex items-center gap-1 shadow">
                            <Crown className="w-3.5 h-3.5 text-[#d4af37] animate-bounce" /> Active
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 bg-[#1c1612] border border-[#8b7355]/40 text-[#8b7355] text-[10px] rounded-lg flex items-center gap-1">
                            <Lock className="w-3 h-3 text-[#8b7355]" /> Pending
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* COLUMN 3: Active Kingdom Configuration Panel (Remaining Width) */}
          <div className="flex-1 min-w-0 w-full bg-[#1c1612] border-4 border-[#8b7355] rounded-3xl p-5 sm:p-6 shadow-2xl space-y-5">
            {kingdoms[activeRoleKingdomIdx] && (() => {
              const currentK = kingdoms[activeRoleKingdomIdx];
              const kIdx = activeRoleKingdomIdx;
              const isConfirmed = confirmedKingdomIds.includes(currentK.id);
              const isAssigned = assignedKingdomIds.includes(currentK.id) || isConfirmed;
              const valResult = validateRoleDistribution(currentK.members);

              return (
                <div className="space-y-5">
                  {/* Kingdom Information Header & Active Configuration Badge */}
                  <div className="flex flex-wrap items-center justify-between border-b-2 border-[#8b7355]/40 pb-4 gap-3 bg-[#120e0c] p-4 rounded-2xl border border-[#8b7355]">
                    <div className="flex items-center gap-3">
                      <span className="text-4xl p-2.5 bg-[#1c1612] border-2 border-[#d4af37] rounded-2xl shadow-xl">
                        {currentK.bannerSymbol}
                      </span>
                      <div>
                        <div className="text-[10px] font-black text-[#d4af37] uppercase tracking-widest font-cinzel">
                          Kingdom {kIdx + 1} of {kingdoms.length}
                        </div>
                        <h4 className="text-xl font-black text-[#f3e5ab] font-cinzel uppercase tracking-wider">
                          {currentK.name}
                        </h4>
                        <p className="text-xs text-[#e0d6c5] italic font-serif">
                          ⚔️ {currentK.members.length} Warriors Registered
                        </p>
                      </div>
                    </div>

                    <div>
                      {isConfirmed ? (
                        <span className="px-3.5 py-1.5 bg-emerald-950 border border-emerald-500 text-emerald-300 font-cinzel font-bold text-xs rounded-xl flex items-center gap-1.5 shadow">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Kingdom Roles Confirmed & Locked
                        </span>
                      ) : (
                        <span className="px-3.5 py-1.5 bg-[#2a1c13] border border-[#d4af37] text-[#d4af37] font-cinzel font-bold text-xs rounded-xl flex items-center gap-1.5 shadow">
                          <Crown className="w-4 h-4 text-[#d4af37]" /> Active Configuration
                        </span>
                      )}
                    </div>
                  </div>

                  {!isAssigned ? (
                    /* Unassigned State Trigger */
                    <div className="p-8 bg-[#120e0c] border-2 border-dashed border-[#d4af37] rounded-2xl text-center space-y-4">
                      <div className="w-14 h-14 mx-auto rounded-2xl bg-[#1c1612] border border-[#d4af37] flex items-center justify-center text-3xl shadow-xl">
                        🎲
                      </div>
                      <div>
                        <h5 className="text-lg font-black text-[#f3e5ab] font-cinzel uppercase">
                          Kingdom Roles Unassigned
                        </h5>
                        <p className="text-xs text-[#e0d6c5] max-w-md mx-auto pt-1">
                          Automatically assign the 13 hidden roles (King, Queen, Princess, Prince, Knights, Workers, Jokers) and set remaining members as Citizens.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleAssignKingdomRoles(kIdx)}
                        className="px-6 py-3.5 bg-gradient-to-r from-[#d4af37] via-[#f3e5ab] to-[#d4af37] text-[#120e0c] font-black font-cinzel text-xs uppercase rounded-xl shadow-xl hover:scale-105 transition-all flex items-center gap-2 mx-auto cursor-pointer"
                      >
                        <Dices className="w-4 h-4 text-[#120e0c]" /> 🎲 Assign Kingdom Roles
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-5">
                      {/* Automated Role Distribution Validation Card */}
                      <div className="p-4 bg-[#120e0c] border-2 border-[#8b7355] rounded-2xl space-y-3">
                        <div className="flex flex-wrap items-center justify-between border-b border-[#8b7355]/40 pb-2 gap-2">
                          <span className="font-cinzel font-black text-xs text-[#d4af37] flex items-center gap-1.5 uppercase tracking-wide">
                            <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Automated Role Distribution Validation
                          </span>
                          <span className="text-xs font-mono font-bold text-[#f3e5ab] px-2.5 py-0.5 rounded-lg bg-[#1c1612] border border-[#8b7355]">
                            Total Hidden Roles: {valResult.king + valResult.queen + valResult.princess + valResult.prince + valResult.knight + valResult.worker + valResult.joker} / 13
                          </span>
                        </div>

                        {/* Role Counters Grid */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] font-mono pt-1">
                          <div className={`p-2 rounded-xl border flex items-center justify-between ${valResult.king === 1 ? 'bg-emerald-950/50 border-emerald-600 text-emerald-200' : 'bg-rose-950/50 border-rose-600 text-rose-200'}`}>
                            <span>👑 King</span>
                            <span className="font-bold">{valResult.king} / 1</span>
                          </div>
                          <div className={`p-2 rounded-xl border flex items-center justify-between ${valResult.queen === 1 ? 'bg-emerald-950/50 border-emerald-600 text-emerald-200' : 'bg-rose-950/50 border-rose-600 text-rose-200'}`}>
                            <span>👑 Queen</span>
                            <span className="font-bold">{valResult.queen} / 1</span>
                          </div>
                          <div className={`p-2 rounded-xl border flex items-center justify-between ${valResult.princess === 1 ? 'bg-emerald-950/50 border-emerald-600 text-emerald-200' : 'bg-rose-950/50 border-rose-600 text-rose-200'}`}>
                            <span>👸 Princess</span>
                            <span className="font-bold">{valResult.princess} / 1</span>
                          </div>
                          <div className={`p-2 rounded-xl border flex items-center justify-between ${valResult.prince === 1 ? 'bg-emerald-950/50 border-emerald-600 text-emerald-200' : 'bg-rose-950/50 border-rose-600 text-rose-200'}`}>
                            <span>🤴 Prince</span>
                            <span className="font-bold">{valResult.prince} / 1</span>
                          </div>
                          <div className={`p-2 rounded-xl border flex items-center justify-between ${valResult.knight <= 3 ? 'bg-emerald-950/50 border-emerald-600 text-emerald-200' : 'bg-rose-950/50 border-rose-600 text-rose-200'}`}>
                            <span>⚔️ Knight</span>
                            <span className="font-bold">{valResult.knight} / 3</span>
                          </div>
                          <div className={`p-2 rounded-xl border flex items-center justify-between ${valResult.worker <= 3 ? 'bg-emerald-950/50 border-emerald-600 text-emerald-200' : 'bg-rose-950/50 border-rose-600 text-rose-200'}`}>
                            <span>👷 Worker</span>
                            <span className="font-bold">{valResult.worker} / 3</span>
                          </div>
                          <div className={`p-2 rounded-xl border flex items-center justify-between ${valResult.joker <= 3 ? 'bg-emerald-950/50 border-emerald-600 text-emerald-200' : 'bg-rose-950/50 border-rose-600 text-rose-200'}`}>
                            <span>🎭 Joker</span>
                            <span className="font-bold">{valResult.joker} / 3</span>
                          </div>
                          <div className="p-2 rounded-xl border bg-[#120e0c] border-[#8b7355] text-[#e0d6c5] flex items-center justify-between">
                            <span>👤 Citizens</span>
                            <span className="font-bold">{valResult.citizen}</span>
                          </div>
                        </div>
                      </div>

                      {/* Champion Assignment List */}
                      <div className="space-y-2.5">
                        <div className="text-xs font-black text-[#d4af37] font-cinzel uppercase tracking-wider flex items-center justify-between">
                          <span>Champion Role Assignment ({currentK.members.length} Warriors)</span>
                          <span className="text-[10px] text-[#e0d6c5] font-serif italic">Dropdown to override</span>
                        </div>

                        <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
                          {currentK.members.map((m, mIdx) => {
                            const roleData = ROLE_DEFINITIONS[m.role] || ROLE_DEFINITIONS['citizen'];
                            return (
                              <div
                                key={m.id || `m-${kIdx}-${mIdx}`}
                                className="p-3 bg-[#120e0c] rounded-xl border border-[#8b7355]/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 hover:border-[#d4af37] transition-all"
                              >
                                <div className="flex items-center gap-3">
                                  <span className="text-xl p-1.5 bg-[#1c1612] rounded-lg border border-[#8b7355]/40 shrink-0">
                                    {roleData.icon}
                                  </span>
                                  <div>
                                    <div className="text-[#f3e5ab] font-bold font-cinzel text-xs">{m.name}</div>
                                    <div className="text-[10px] text-[#8b7355] italic">
                                      {roleData.title} ({roleData.points > 0 ? `+${roleData.points}` : roleData.points} pts)
                                    </div>
                                  </div>
                                </div>

                                <div className="flex items-center gap-2 w-full sm:w-auto">
                                  {showRolesPreview ? (
                                    <select
                                      value={m.role}
                                      onChange={(e) => handleRoleChange(kIdx, mIdx, e.target.value as RoleType)}
                                      className="w-full sm:w-auto bg-[#1c1612] border-2 border-[#d4af37] text-[#f3e5ab] font-bold text-xs rounded-lg px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-[#f3e5ab] cursor-pointer"
                                    >
                                      <option value="king">👑 King (+50 pts)</option>
                                      <option value="queen">👑 Queen (+30 pts)</option>
                                      <option value="princess">👸 Princess (+15 pts)</option>
                                      <option value="prince">🤴 Prince (+15 pts)</option>
                                      <option value="knight">⚔️ Knight (+5 pts)</option>
                                      <option value="worker">👷 Worker (+1 pt)</option>
                                      <option value="joker">🎭 Joker (-3 pts)</option>
                                      <option value="citizen">👤 Citizen (0 pts)</option>
                                    </select>
                                  ) : (
                                    <span className="px-3 py-1.5 bg-[#1c1612] border border-[#8b7355] text-[#d4af37] font-mono text-[10px] rounded-lg flex items-center gap-1">
                                      🔒 Secret Role Assigned
                                    </span>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Controls & Lock Button */}
                      <div className="p-4 bg-[#120e0c] rounded-2xl border border-[#8b7355] flex flex-col sm:flex-row items-center justify-between gap-3 font-cinzel">
                        <div className="text-[11px] text-[#8b7355] italic flex items-center gap-1.5">
                          <Lock className="w-3.5 h-3.5 text-[#d4af37]" /> Teacher-only view. Roles stay secret during battle.
                        </div>

                        <div className="flex items-center gap-2 w-full sm:w-auto">
                          <button
                            type="button"
                            onClick={() => handleAssignKingdomRoles(kIdx)}
                            className="px-3.5 py-2.5 bg-[#1c1612] hover:bg-[#2a1c13] border border-[#8b7355] text-[#d4af37] font-bold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer transition-all"
                          >
                            <Shuffle className="w-3.5 h-3.5" /> 🔄 Randomize
                          </button>

                          <button
                            type="button"
                            onClick={() => handleConfirmKingdomRoles(kIdx)}
                            className="px-5 py-2.5 bg-gradient-to-r from-emerald-600 via-teal-500 to-emerald-600 text-white font-black text-xs uppercase rounded-xl shadow-lg hover:scale-105 transition-all flex items-center gap-2 cursor-pointer shrink-0"
                          >
                            <CheckCircle2 className="w-4 h-4 text-white" /> ✅ Confirm Assignment
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })()}

            {/* Finish Setup Summary (When all kingdoms confirmed) */}
            {allKingdomsConfirmed && (
              <div className="p-6 bg-gradient-to-b from-[#2a1c13] via-[#1c1612] to-[#120e0c] border-4 border-[#d4af37] rounded-3xl shadow-2xl text-center space-y-4 animate-in fade-in">
                <div className="w-16 h-16 mx-auto rounded-full bg-[#120e0c] border-2 border-[#d4af37] flex items-center justify-center text-3xl shadow-2xl">
                  🎉
                </div>
                <div>
                  <h4 className="text-xl font-black text-[#f3e5ab] font-cinzel uppercase tracking-wider text-gold-engraved">
                    🎉 All Kingdom Roles Successfully Assigned
                  </h4>
                  <div className="flex justify-center gap-6 text-xs text-[#d4af37] font-mono py-2">
                    <span>Total Kingdoms: {kingdoms.length}</span>
                    <span>Total Members: {kingdoms.reduce((sum, k) => sum + k.members.length, 0)}</span>
                  </div>
                  <p className="text-xs text-[#e0d6c5] max-w-md mx-auto italic font-serif">
                    All hidden roles have been securely assigned. Students will only see member names during gameplay.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setRoleNotice(null);
                    setCurrentStep(5);
                  }}
                  className="px-8 py-3.5 bg-gradient-to-r from-[#d4af37] via-[#f3e5ab] to-[#d4af37] text-[#120e0c] font-black font-cinzel text-xs uppercase tracking-widest rounded-xl shadow-2xl hover:scale-105 transition-all cursor-pointer inline-flex items-center gap-2"
                >
                  <span>Proceed to Step 5: Question Scroll Archives</span>
                  <ArrowRight className="w-4 h-4 text-[#120e0c]" />
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Step 5: Question Scroll Archive Selection */}
      {currentStep === 5 && (
        <div className="bg-[#1c1612] border-4 border-[#8b7355] rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 font-serif text-xs text-[#e0d6c5]">
          {/* HEADER */}
          <div className="border-b-2 border-[#8b7355]/40 pb-4 space-y-1">
            <h3 className="text-xl font-black text-[#f3e5ab] font-cinzel flex items-center gap-2">
              <BookOpen className="w-6 h-6 text-[#d4af37]" /> Step 5: Question Scroll Archive Selection
            </h3>
            <p className="text-xs text-[#8b7355] italic font-serif">
              Choose a previously created Question Scroll Archive to load into the battle.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* LEFT COLUMN: ARCHIVE SELECTOR & SELECTION OPTIONS (Col 6/12) */}
            <div className="lg:col-span-6 space-y-5">
              {/* SELECT QUESTION ARCHIVE */}
              <div className="bg-[#120e0c] border-2 border-[#8b7355] rounded-2xl p-5 shadow-xl space-y-3">
                <label className="text-sm font-black text-[#d4af37] font-cinzel block uppercase tracking-wide">
                  Select Question Archive
                </label>
                <p className="text-xs text-[#8b7355] italic">
                  Selecting an archive immediately loads its question scrolls into the tournament setup.
                </p>

                <select
                  value={selectedArchiveKey}
                  onChange={(e) => {
                    const newKey = e.target.value;
                    setSelectedArchiveKey(newKey);
                    const qLen = (
                      availableQuestions[newKey] ||
                      PRESET_QUESTION_BANKS[newKey] ||
                      []
                    ).length;
                    setCustomQuestionCount(Math.min(20, qLen > 0 ? qLen : 20));
                  }}
                  className="w-full bg-[#1c1612] border-2 border-[#8b7355] focus:border-[#d4af37] rounded-xl p-3 text-[#f3e5ab] font-bold text-sm focus:outline-none cursor-pointer shadow-inner"
                >
                  {Object.keys(availableQuestions).map((cat) => (
                    <option key={cat} value={cat}>
                      📜 {cat} ({availableQuestions[cat]?.length || 0} Questions)
                    </option>
                  ))}
                  {Object.keys(PRESET_QUESTION_BANKS)
                    .filter((cat) => !availableQuestions[cat])
                    .map((cat) => (
                      <option key={cat} value={cat}>
                        📜 Preset: {cat} ({PRESET_QUESTION_BANKS[cat]?.length || 0} Questions)
                      </option>
                    ))}
                </select>
              </div>

              {/* DISPLAY ARCHIVE INFORMATION AFTER SELECTION */}
              <div className="bg-[#2a1c13] border-2 border-[#8b7355] rounded-2xl p-5 shadow-2xl space-y-3">
                <h4 className="text-xs font-black font-cinzel text-[#d4af37] border-b border-[#8b7355]/40 pb-2 uppercase tracking-wider flex items-center gap-2">
                  <Crown className="w-4 h-4 text-[#d4af37]" /> Archive Information
                </h4>

                {archiveMetadata.totalQuestions === 0 ? (
                  <div className="p-4 bg-rose-950/80 border-2 border-rose-600 rounded-xl text-rose-200 text-xs space-y-1">
                    <div className="font-bold font-cinzel flex items-center gap-2 text-rose-300">
                      <AlertCircle className="w-4 h-4 shrink-0" /> No questions found in this archive.
                    </div>
                    <p className="text-[11px] text-rose-200/90 italic">
                      Please select another Question Archive or add question scrolls in the Royal Question Library.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-serif">
                    <div className="bg-[#120e0c]/80 p-3 rounded-xl border border-[#8b7355]/40 space-y-1">
                      <span className="text-[10px] text-[#8b7355] block font-cinzel uppercase">
                        📚 Archive Name
                      </span>
                      <span className="font-bold text-[#f3e5ab] text-sm truncate block">
                        {selectedArchiveKey}
                      </span>
                    </div>

                    <div className="bg-[#120e0c]/80 p-3 rounded-xl border border-[#8b7355]/40 space-y-1">
                      <span className="text-[10px] text-[#8b7355] block font-cinzel uppercase">
                        📖 Subject
                      </span>
                      <span className="font-bold text-[#f3e5ab] text-sm">{archiveMetadata.subject}</span>
                    </div>

                    <div className="bg-[#120e0c]/80 p-3 rounded-xl border border-[#8b7355]/40 space-y-1">
                      <span className="text-[10px] text-[#8b7355] block font-cinzel uppercase">
                        🎓 Grade Level
                      </span>
                      <span className="font-bold text-[#f3e5ab] text-sm">{archiveMetadata.gradeLevel}</span>
                    </div>

                    <div className="bg-[#120e0c]/80 p-3 rounded-xl border border-[#8b7355]/40 space-y-1">
                      <span className="text-[10px] text-[#8b7355] block font-cinzel uppercase">
                        ⭐ Difficulty
                      </span>
                      <span className="font-bold text-amber-300 text-sm">{archiveMetadata.difficulty}</span>
                    </div>

                    <div className="bg-[#120e0c]/80 p-3 rounded-xl border border-[#8b7355]/40 space-y-1">
                      <span className="text-[10px] text-[#8b7355] block font-cinzel uppercase">
                        📜 Total in Archive
                      </span>
                      <span className="font-black text-emerald-400 font-mono text-base">
                        {archiveMetadata.totalQuestions}
                      </span>
                    </div>

                    <div className="bg-[#120e0c]/80 p-3 rounded-xl border border-[#d4af37]/60 space-y-1">
                      <span className="text-[10px] text-[#d4af37] block font-cinzel uppercase">
                        ⚔ Questions Loaded
                      </span>
                      <span className="font-black text-[#ffd700] font-mono text-base">
                        {archiveMetadata.questionsSelected}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* QUESTION SELECTION (NUMBER OF QUESTIONS TO LOAD) */}
              <div className="bg-[#120e0c] border-2 border-[#8b7355] rounded-2xl p-5 shadow-xl space-y-3">
                <h4 className="text-xs font-black font-cinzel text-[#d4af37] uppercase tracking-wide">
                  Question Selection
                </h4>
                <p className="text-xs text-[#8b7355] italic">
                  Choose how many questions to load into the tournament.
                </p>

                <div className="space-y-3 pt-1">
                  <label className="flex items-center gap-3 p-3 rounded-xl bg-[#1c1612] border border-[#8b7355]/60 hover:border-[#d4af37] cursor-pointer transition-all">
                    <input
                      type="radio"
                      name="loadMode"
                      checked={loadMode === 'all'}
                      onChange={() => setLoadMode('all')}
                      className="w-4 h-4 accent-[#d4af37] cursor-pointer"
                    />
                    <div>
                      <span className="font-bold text-[#f3e5ab] text-xs block font-cinzel">
                        Load All Questions
                      </span>
                      <span className="text-[11px] text-[#8b7355] italic">
                        Use all {archiveMetadata.totalQuestions} questions from this archive
                      </span>
                    </div>
                  </label>

                  <label className="flex items-start gap-3 p-3 rounded-xl bg-[#1c1612] border border-[#8b7355]/60 hover:border-[#d4af37] cursor-pointer transition-all">
                    <input
                      type="radio"
                      name="loadMode"
                      checked={loadMode === 'custom'}
                      onChange={() => setLoadMode('custom')}
                      className="w-4 h-4 accent-[#d4af37] cursor-pointer mt-0.5"
                    />
                    <div className="space-y-2 flex-1">
                      <div>
                        <span className="font-bold text-[#f3e5ab] text-xs block font-cinzel">
                          Custom Number (Random Sample)
                        </span>
                        <span className="text-[11px] text-[#8b7355] italic">
                          Loads specified number of random questions from archive
                        </span>
                      </div>

                      {loadMode === 'custom' && (
                        <div className="flex items-center gap-3 pt-1">
                          <label className="text-xs font-bold text-[#d4af37] font-cinzel">
                            Number of Questions:
                          </label>
                          <input
                            type="number"
                            min={1}
                            max={archiveMetadata.totalQuestions || 1}
                            value={customQuestionCount}
                            onChange={(e) => {
                              const val = parseInt(e.target.value) || 1;
                              setCustomQuestionCount(
                                Math.max(1, Math.min(val, archiveMetadata.totalQuestions || 1))
                              );
                            }}
                            className="w-24 bg-[#120e0c] border-2 border-[#8b7355] focus:border-[#d4af37] rounded-xl px-3 py-1.5 text-center font-mono font-bold text-sm text-[#f3e5ab] focus:outline-none"
                          />
                          <span className="text-[11px] text-[#8b7355] italic">
                            (Max {archiveMetadata.totalQuestions})
                          </span>
                        </div>
                      )}
                    </div>
                  </label>
                </div>
              </div>

              {/* QUESTION ORDER */}
              <div className="bg-[#120e0c] border-2 border-[#8b7355] rounded-2xl p-5 shadow-xl space-y-3">
                <h4 className="text-xs font-black font-cinzel text-[#d4af37] uppercase tracking-wide">
                  Question Order
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <label
                    className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                      orderMode === 'shuffle'
                        ? 'bg-[#2a1c13] border-[#d4af37]'
                        : 'bg-[#1c1612] border-[#8b7355]/60 hover:border-[#d4af37]'
                    }`}
                  >
                    <input
                      type="radio"
                      name="orderMode"
                      checked={orderMode === 'shuffle'}
                      onChange={() => setOrderMode('shuffle')}
                      className="w-4 h-4 accent-[#d4af37] cursor-pointer"
                    />
                    <div>
                      <span className="font-bold text-[#f3e5ab] text-xs block font-cinzel flex items-center gap-1.5">
                        <Shuffle className="w-3.5 h-3.5 text-[#d4af37]" /> Shuffle Questions
                      </span>
                      <span className="text-[10px] text-[#8b7355] italic">Randomize sequence</span>
                    </div>
                  </label>

                  <label
                    className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                      orderMode === 'original'
                        ? 'bg-[#2a1c13] border-[#d4af37]'
                        : 'bg-[#1c1612] border-[#8b7355]/60 hover:border-[#d4af37]'
                    }`}
                  >
                    <input
                      type="radio"
                      name="orderMode"
                      checked={orderMode === 'original'}
                      onChange={() => setOrderMode('original')}
                      className="w-4 h-4 accent-[#d4af37] cursor-pointer"
                    />
                    <div>
                      <span className="font-bold text-[#f3e5ab] text-xs block font-cinzel flex items-center gap-1.5">
                        <Layers className="w-3.5 h-3.5 text-[#d4af37]" /> Keep Original Order
                      </span>
                      <span className="text-[10px] text-[#8b7355] italic">Archive sequence</span>
                    </div>
                  </label>
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: BATTLE QUESTION SUMMARY CARD & GAME SCROLL PREVIEW (Col 6/12) */}
            <div className="lg:col-span-6 flex flex-col space-y-5">
              {/* SUMMARY CARD */}
              <div className="bg-gradient-to-b from-[#2a1c13] to-[#120e0c] border-4 border-[#8b7355] rounded-2xl p-5 shadow-2xl space-y-4">
                <div className="text-center space-y-1 border-b-2 border-[#8b7355]/40 pb-3">
                  <span className="text-[10px] font-black font-cinzel text-[#d4af37] tracking-widest uppercase">
                    BATTLE PREPARATION
                  </span>
                  <h4 className="text-base font-black font-cinzel text-[#f3e5ab] uppercase tracking-wide text-gold-engraved">
                    Battle Question Summary
                  </h4>
                </div>

                <div className="grid grid-cols-2 gap-3 font-serif text-xs">
                  <div className="p-2.5 bg-[#120e0c] rounded-xl border border-[#8b7355]/50">
                    <span className="text-[#8b7355] font-cinzel block text-[10px]">Archive</span>
                    <span className="font-bold text-[#f3e5ab] truncate block">
                      {selectedArchiveKey}
                    </span>
                  </div>

                  <div className="p-2.5 bg-[#120e0c] rounded-xl border border-[#8b7355]/50">
                    <span className="text-[#8b7355] font-cinzel block text-[10px]">Total Loaded</span>
                    <span className="font-black text-emerald-400 font-mono text-sm">
                      {archiveMetadata.questionsSelected} / {archiveMetadata.totalQuestions}
                    </span>
                  </div>

                  <div className="p-2.5 bg-[#120e0c] rounded-xl border border-[#8b7355]/50">
                    <span className="text-[#8b7355] font-cinzel block text-[10px]">Order Mode</span>
                    <span className="font-bold text-amber-300 text-xs capitalize">
                      {orderMode === 'shuffle' ? 'Shuffled' : 'Keep Original'}
                    </span>
                  </div>

                  <div className="p-2.5 bg-[#120e0c] rounded-xl border border-[#8b7355]/50">
                    <span className="text-[#8b7355] font-cinzel block text-[10px]">Status</span>
                    {finalQuestionsForBattle.length > 0 ? (
                      <span className="text-emerald-400 font-bold text-xs flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Ready
                      </span>
                    ) : (
                      <span className="text-rose-400 font-bold text-xs flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" /> Empty
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* GAME SCROLL PREVIEW */}
              <div className="bg-[#120e0c] border-2 border-[#8b7355] rounded-2xl p-5 shadow-2xl space-y-3 flex-1 flex flex-col min-h-[360px]">
                <div className="flex items-center justify-between border-b border-[#8b7355]/40 pb-2">
                  <h4 className="text-xs font-black font-cinzel text-[#d4af37] uppercase tracking-wider flex items-center gap-2">
                    <Scroll className="w-4 h-4 text-[#d4af37]" /> Game Scroll Preview ({finalQuestionsForBattle.length} Loaded)
                  </h4>
                  {finalQuestionsForBattle.length > 0 && (
                    <div className="relative w-44">
                      <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-[#8b7355]" />
                      <input
                        type="text"
                        value={previewSearch}
                        onChange={(e) => setPreviewSearch(e.target.value)}
                        placeholder="Filter preview..."
                        className="w-full bg-[#1c1612] border border-[#8b7355]/60 focus:border-[#d4af37] rounded-lg pl-8 pr-2 py-1 text-[11px] text-[#e0d6c5] focus:outline-none"
                      />
                    </div>
                  )}
                </div>

                {/* SCROLLABLE LIST OF PREVIEW QUESTIONS */}
                {archiveMetadata.totalQuestions === 0 || finalQuestionsForBattle.length === 0 ? (
                  <div className="p-8 text-center bg-[#1c1612]/90 rounded-2xl border-2 border-dashed border-rose-800/60 space-y-2 my-auto">
                    <p className="text-sm font-bold text-rose-300 font-cinzel">
                      No questions found in this archive.
                    </p>
                    <p className="text-xs text-[#8b7355] italic">
                      Please select another Question Archive or add question scrolls in the Royal Question Library.
                    </p>
                  </div>
                ) : previewQuestionsList.length === 0 ? (
                  <div className="p-6 text-center text-[#8b7355] italic my-auto">
                    No matching question scrolls found for "{previewSearch}".
                  </div>
                ) : (
                  <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
                    {previewQuestionsList.map((q, idx) => (
                      <div
                        key={q.id || idx}
                        className="p-3 bg-[#1c1612] border border-[#8b7355]/50 hover:border-[#d4af37]/80 rounded-xl space-y-2 transition-all"
                      >
                        <div className="flex items-center justify-between text-[10px]">
                          <span className="font-bold text-[#d4af37] font-cinzel">
                            📜 Scroll #{idx + 1}
                          </span>
                          <span className="px-2 py-0.5 rounded bg-[#2a1c13] text-amber-200 border border-[#8b7355]/40 font-mono">
                            {q.subject || q.category || 'General'}
                          </span>
                        </div>

                        <p className="font-bold text-xs text-[#f3e5ab] font-cinzel leading-relaxed">
                          {q.question}
                        </p>

                        <div className="grid grid-cols-2 gap-1.5 text-[11px] font-sans">
                          {q.options.map((opt, oIdx) => (
                            <div
                              key={oIdx}
                              className={`px-2.5 py-1 rounded-lg border flex items-center justify-between text-[11px] ${
                                oIdx === q.correctIndex
                                  ? 'bg-emerald-950/90 border-emerald-500 text-emerald-200 font-bold'
                                  : 'bg-[#120e0c] border-[#8b7355]/30 text-[#8b7355]'
                              }`}
                            >
                              <span className="truncate">{opt}</span>
                              {oIdx === q.correctIndex && (
                                <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0 ml-1" />
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Step 6: Battle Preview */}
      {currentStep === 6 && (
        <div className="bg-[#1c1612] border-4 border-[#8b7355] rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 font-serif text-xs text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-[#120e0c] border border-emerald-500 text-emerald-300 text-xs font-black uppercase">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Step 6: Final Battle Review
          </div>

          <h3 className="text-2xl font-black text-[#f3e5ab] font-cinzel uppercase text-gold-engraved">
            Ready to Commmence Tournament
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-left">
            <div className="p-3 bg-[#120e0c] rounded-2xl border border-[#8b7355]/60">
              <span className="text-[#8b7355] block">Active Kingdoms</span>
              <span className="text-xl font-mono font-black text-[#d4af37]">{kingdoms.length} Realms</span>
            </div>
            <div className="p-3 bg-[#120e0c] rounded-2xl border border-[#8b7355]/60">
              <span className="text-[#8b7355] block">Total Warriors</span>
              <span className="text-xl font-mono font-black text-[#d4af37]">
                {kingdoms.reduce((acc, k) => acc + k.members.length, 0)} Students
              </span>
            </div>
            <div className="p-3 bg-[#120e0c] rounded-2xl border border-[#8b7355]/60">
              <span className="text-[#8b7355] block">Question Bank</span>
              <span className="text-xl font-mono font-black text-[#d4af37]">{activeQuestionsList.length} Scrolls</span>
            </div>
            <div className="p-3 bg-[#120e0c] rounded-2xl border border-[#8b7355]/60">
              <span className="text-[#8b7355] block">Timer</span>
              <span className="text-xl font-mono font-black text-[#d4af37]">{timerDuration}s / Turn</span>
            </div>
          </div>

          <div className="pt-4 flex justify-center gap-4 font-cinzel">
            <button
              onClick={onCancel}
              className="px-6 py-4 bg-[#120e0c] hover:bg-[#2a1c13] text-[#8b7355] font-black text-xs uppercase rounded-2xl border border-[#8b7355] cursor-pointer"
            >
              Cancel Wizard
            </button>
            <button
              onClick={handleStartBattle}
              className="px-10 py-5 bg-gradient-to-r from-[#d4af37] via-[#f3e5ab] to-[#d4af37] text-[#120e0c] font-black text-sm uppercase tracking-widest rounded-2xl border-2 border-[#f3e5ab] shadow-2xl hover:scale-105 active:scale-95 transition-all cursor-pointer flex items-center gap-2"
            >
              <Play className="w-5 h-5 fill-[#120e0c]" /> Commence Kingdom Battle
            </button>
          </div>
        </div>
      )}

      {/* Bottom Navigation Buttons inside Main Workspace */}
      <div className="flex flex-wrap items-center justify-between font-cinzel pt-4 border-t border-[#8b7355]/40 gap-3">
        {currentStep > 1 ? (
          <button
            type="button"
            onClick={() => setCurrentStep(currentStep - 1)}
            className="px-5 py-2.5 bg-[#120e0c] hover:bg-[#2a1c13] text-[#f3e5ab] font-black text-xs uppercase rounded-xl border border-[#8b7355] flex items-center gap-2 cursor-pointer transition-all shadow"
          >
            <ArrowLeft className="w-4 h-4 text-[#d4af37]" />
            <span>Previous</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={onCancel}
            className="px-5 py-2.5 bg-[#120e0c] hover:bg-[#2a1c13] text-[#8b7355] hover:text-[#f3e5ab] font-black text-xs uppercase rounded-xl border border-[#8b7355]/40 cursor-pointer transition-all"
          >
            <span>Back to Dashboard</span>
          </button>
        )}

        <div className="flex items-center gap-3">
          {currentStep === 5 && onOpenQuestionArchive && (
            <button
              type="button"
              onClick={onOpenQuestionArchive}
              className="px-5 py-2.5 bg-[#1c1612] hover:bg-[#2a1c13] text-[#d4af37] border-2 border-[#8b7355] hover:border-[#d4af37] font-black text-xs uppercase rounded-xl flex items-center gap-2 cursor-pointer transition-all shadow-lg"
            >
              <BookOpen className="w-4 h-4 text-[#d4af37]" />
              <span>Open Question Archive</span>
            </button>
          )}

          {currentStep < 6 && (
            <div className="flex flex-col items-end gap-1">
              <button
                type="button"
                disabled={currentStep === 5 && finalQuestionsForBattle.length === 0}
                onClick={() => {
                  if (currentStep === 4 && !allKingdomsConfirmed) {
                    setRoleNotice(
                      '⚠️ Please complete and confirm role assignment for all kingdoms before proceeding!'
                    );
                    return;
                  }
                  if (currentStep === 5) {
                    if (finalQuestionsForBattle.length === 0) {
                      return;
                    }
                    setActiveQuestionsList(finalQuestionsForBattle);
                    setSelectedCategory(selectedArchiveKey);
                  }
                  setRoleNotice(null);
                  setCurrentStep(currentStep + 1);
                }}
                className={`px-6 py-2.5 bg-gradient-to-r from-[#d4af37] via-[#f3e5ab] to-[#d4af37] text-[#120e0c] font-black text-xs uppercase rounded-xl shadow-xl transition-all flex items-center gap-2 ${
                  currentStep === 5 && finalQuestionsForBattle.length === 0
                    ? 'opacity-40 cursor-not-allowed filter grayscale'
                    : 'hover:scale-105 cursor-pointer'
                }`}
              >
                <span>{currentStep === 5 ? 'Continue to Battle ⚔' : 'Next Step'}</span>
                <ArrowRight className="w-4 h-4 text-[#120e0c]" />
              </button>
              {currentStep === 5 && finalQuestionsForBattle.length === 0 && (
                <span className="text-[10px] font-bold text-rose-400 font-cinzel flex items-center gap-1">
                  <AlertCircle className="w-3 h-3 text-rose-400 shrink-0" /> Load at least 1 question scroll to proceed
                </span>
              )}
            </div>
          )}
        </div>
      </div>
        </main>
      </div>
    </div>
  );
};
