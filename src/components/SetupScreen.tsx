import React, { useState } from 'react';
import { Kingdom, GameSettings, Question } from '../types';
import { PRESET_KINGDOMS, PRESET_QUESTION_BANKS, assignSecretRoles } from '../data/presetData';
import { sound } from '../lib/sound';
import {
  Shield,
  Users,
  Clock,
  Sparkles,
  Play,
  Wand2,
  RefreshCw,
  Database,
  Crown,
  BookOpen,
  Trophy,
  Scroll,
  Settings,
  Swords,
  Flame,
} from 'lucide-react';

interface SetupScreenProps {
  onStartGame: (kingdoms: Kingdom[], settings: GameSettings, questions: Question[]) => void;
  availableQuestions: Record<string, Question[]>;
  onGenerateAIQuestions?: (topic: string) => Promise<Question[] | null>;
  onOpenTeacherDb?: () => void;
  onOpenRules?: () => void;
  onOpenSettings?: () => void;
}

export const SetupScreen: React.FC<SetupScreenProps> = ({
  onStartGame,
  availableQuestions,
  onGenerateAIQuestions,
  onOpenTeacherDb,
  onOpenRules,
  onOpenSettings,
}) => {
  const [numKingdoms, setNumKingdoms] = useState<number>(4);
  const [timerDuration, setTimerDuration] = useState<number>(30);
  const [selectedCategory, setSelectedCategory] = useState<string>('World History');
  const [aiTopicInput, setAiTopicInput] = useState<string>('');
  const [isGeneratingAi, setIsGeneratingAi] = useState<boolean>(false);
  const [customQuestionsList, setCustomQuestionsList] = useState<Question[]>([]);

  // Local state for kingdom editor configurations
  const [kingdomConfigs, setKingdomConfigs] = useState(
    PRESET_KINGDOMS.slice(0, 4).map((pk, idx) => ({
      id: `k-${idx + 1}`,
      name: pk.name,
      bannerSymbol: pk.bannerSymbol,
      colorName: pk.colorName,
      colorGradient: pk.colorGradient,
      borderColor: pk.borderColor,
      textColor: pk.textColor,
      castleStyle: pk.castleStyle,
      element: pk.element,
      primaryColors: pk.primaryColors,
      coatOfArms: pk.coatOfArms,
      identity: pk.identity,
      bannerColor: pk.bannerColor,
      studentNamesText: pk.members.join('\n'),
    }))
  );

  // Update kingdom count
  const handleCountChange = (count: number) => {
    sound.playGobletSelect();
    setNumKingdoms(count);
    if (count > kingdomConfigs.length) {
      const newConfigs = [...kingdomConfigs];
      for (let i = kingdomConfigs.length; i < count; i++) {
        const pk = PRESET_KINGDOMS[i % PRESET_KINGDOMS.length];
        newConfigs.push({
          id: `k-${i + 1}`,
          name: pk.name,
          bannerSymbol: pk.bannerSymbol,
          colorName: pk.colorName,
          colorGradient: pk.colorGradient,
          borderColor: pk.borderColor,
          textColor: pk.textColor,
          castleStyle: pk.castleStyle,
          element: pk.element,
          primaryColors: pk.primaryColors,
          coatOfArms: pk.coatOfArms,
          identity: pk.identity,
          bannerColor: pk.bannerColor,
          studentNamesText: pk.members.join('\n'),
        });
      }
      setKingdomConfigs(newConfigs);
    } else {
      setKingdomConfigs(kingdomConfigs.slice(0, count));
    }
  };

  // Quick Preset setup
  const applyPresetConfig = () => {
    sound.playGobletSelect();
    const selected = PRESET_KINGDOMS.slice(0, numKingdoms).map((pk, idx) => ({
      id: `k-${idx + 1}`,
      name: pk.name,
      bannerSymbol: pk.bannerSymbol,
      colorName: pk.colorName,
      colorGradient: pk.colorGradient,
      borderColor: pk.borderColor,
      textColor: pk.textColor,
      castleStyle: pk.castleStyle,
      element: pk.element,
      primaryColors: pk.primaryColors,
      coatOfArms: pk.coatOfArms,
      identity: pk.identity,
      bannerColor: pk.bannerColor,
      studentNamesText: pk.members.join('\n'),
    }));
    setKingdomConfigs(selected);
  };

  // Generate AI Questions via Gemini
  const handleGenerateAi = async () => {
    if (!aiTopicInput.trim() || !onGenerateAIQuestions) return;
    setIsGeneratingAi(true);
    sound.playGobletSelect();
    try {
      const generated = await onGenerateAIQuestions(aiTopicInput.trim());
      if (generated && generated.length > 0) {
        setCustomQuestionsList(generated);
        setSelectedCategory(`AI: ${aiTopicInput.trim()}`);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsGeneratingAi(false);
    }
  };

  // Start Battle
  const handleLaunchBattle = () => {
    sound.playGobletReveal();
    const finalizedKingdoms: Kingdom[] = kingdomConfigs.slice(0, numKingdoms).map((kc) => {
      const rawNames = kc.studentNamesText
        .split(/[\n,]+/)
        .map((n) => n.trim())
        .filter((n) => n.length > 0);

      const finalNames = [...rawNames];
      while (finalNames.length < 13) {
        finalNames.push(`Scholar ${finalNames.length + 1}`);
      }

      const assigned = assignSecretRoles(finalNames);

      const members = assigned.map((a, idx) => ({
        id: `${kc.id}-m-${idx + 1}`,
        name: a.name,
        role: a.role,
        isCaptured: false,
        capturedByKingdomId: null,
        capturedInRound: null,
      }));

      return {
        id: kc.id,
        name: kc.name,
        bannerSymbol: kc.bannerSymbol,
        colorName: kc.colorName,
        colorGradient: kc.colorGradient,
        borderColor: kc.borderColor,
        textColor: kc.textColor,
        castleStyle: kc.castleStyle,
        element: kc.element,
        primaryColors: kc.primaryColors,
        coatOfArms: kc.coatOfArms,
        identity: kc.identity,
        bannerColor: kc.bannerColor,
        score: 0,
        members,
        status: 'active',
      };
    });

    let questionsToUse: Question[] = [];
    if (selectedCategory.startsWith('AI:') && customQuestionsList.length > 0) {
      questionsToUse = customQuestionsList;
    } else if (availableQuestions[selectedCategory]) {
      questionsToUse = availableQuestions[selectedCategory];
    } else {
      questionsToUse = availableQuestions['World History'] || PRESET_QUESTION_BANKS['World History'];
    }

    const settings: GameSettings = {
      questionTimerDuration: timerDuration,
      soundEnabled: true,
      category: selectedCategory,
      autoRevealGoblets: false,
    };

    onStartGame(finalizedKingdoms, settings, questionsToUse);
  };

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 space-y-8 animate-in fade-in duration-500 font-cinzel">
      {/* Main Menu – Grand Castle Hall Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-royal-throne border-4 border-[#8b7355] p-6 sm:p-10 shadow-[0_20px_50px_rgba(0,0,0,0.9)] text-center">
        {/* Animated Torches on left & right */}
        <div className="absolute top-6 left-6 text-2xl sm:text-3xl animate-torch pointer-events-none">
          🔥
        </div>
        <div className="absolute top-6 right-6 text-2xl sm:text-3xl animate-torch pointer-events-none">
          🔥
        </div>

        {/* Floating dust particles */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-500/10 via-transparent to-transparent pointer-events-none" />

        <div className="relative z-10 space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#120e0c]/90 border border-[#d4af37] text-[#f3e5ab] text-xs font-bold tracking-widest uppercase font-serif shadow-lg">
            <Crown className="w-4 h-4 text-[#d4af37]" /> Royal Tournament Hall
          </div>

          <h2 className="text-3xl sm:text-6xl font-black font-cinzel text-[#f3e5ab] tracking-widest uppercase italic drop-shadow-[0_4px_12px_rgba(0,0,0,0.9)] text-gold-engraved">
            KINGDOM TOURNAMENT
          </h2>

          <p className="max-w-2xl mx-auto text-[#e0d6c5] text-xs sm:text-sm font-merriweather italic leading-relaxed">
            Welcome, Royal Teachers & Scholars! Command your armies, manage secret royal roles, and battle for the supreme crown inside the King’s Grand Castle.
          </p>

          {/* Large Wooden Navigation Signboards */}
          <div className="pt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 font-cinzel">
            <button
              onClick={handleLaunchBattle}
              onMouseEnter={() => sound.playGobletSelect()}
              className="p-3 bg-oak-wood hover:border-[#d4af37] text-[#f3e5ab] border-2 border-[#8b7355] rounded-xl text-xs font-bold flex flex-col items-center gap-1.5 transition-all shadow-xl hover:scale-105 cursor-pointer group"
            >
              <Swords className="w-5 h-5 text-amber-400 group-hover:rotate-12 transition-transform" />
              <span>⚔️ Begin Battle</span>
            </button>

            <button
              onClick={applyPresetConfig}
              onMouseEnter={() => sound.playGobletSelect()}
              className="p-3 bg-oak-wood hover:border-[#d4af37] text-[#f3e5ab] border-2 border-[#8b7355] rounded-xl text-xs font-bold flex flex-col items-center gap-1.5 transition-all shadow-xl hover:scale-105 cursor-pointer group"
            >
              <Crown className="w-5 h-5 text-yellow-400 group-hover:scale-110 transition-transform" />
              <span>👑 Kingdom Setup</span>
            </button>

            <button
              onClick={onOpenSettings}
              onMouseEnter={() => sound.playGobletSelect()}
              className="p-3 bg-oak-wood hover:border-[#d4af37] text-[#f3e5ab] border-2 border-[#8b7355] rounded-xl text-xs font-bold flex flex-col items-center gap-1.5 transition-all shadow-xl hover:scale-105 cursor-pointer group"
            >
              <BookOpen className="w-5 h-5 text-emerald-400 group-hover:scale-110 transition-transform" />
              <span>📚 Royal Question Library</span>
            </button>

            <button
              onClick={onOpenRules}
              onMouseEnter={() => sound.playGobletSelect()}
              className="p-3 bg-oak-wood hover:border-[#d4af37] text-[#f3e5ab] border-2 border-[#8b7355] rounded-xl text-xs font-bold flex flex-col items-center gap-1.5 transition-all shadow-xl hover:scale-105 cursor-pointer group"
            >
              <Trophy className="w-5 h-5 text-amber-300 group-hover:scale-110 transition-transform" />
              <span>🏆 Rulebook</span>
            </button>

            {onOpenTeacherDb && (
              <button
                onClick={onOpenTeacherDb}
                onMouseEnter={() => sound.playGobletSelect()}
                className="p-3 bg-oak-wood hover:border-[#d4af37] text-[#f3e5ab] border-2 border-[#8b7355] rounded-xl text-xs font-bold flex flex-col items-center gap-1.5 transition-all shadow-xl hover:scale-105 cursor-pointer group"
              >
                <Scroll className="w-5 h-5 text-cyan-400 group-hover:scale-110 transition-transform" />
                <span>📜 Battle Records</span>
              </button>
            )}

            <button
              onClick={onOpenSettings}
              onMouseEnter={() => sound.playGobletSelect()}
              className="p-3 bg-oak-wood hover:border-[#d4af37] text-[#f3e5ab] border-2 border-[#8b7355] rounded-xl text-xs font-bold flex flex-col items-center gap-1.5 transition-all shadow-xl hover:scale-105 cursor-pointer group"
            >
              <Settings className="w-5 h-5 text-purple-400 group-hover:rotate-45 transition-transform" />
              <span>⚙️ Royal Settings</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Configuration Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 font-serif">
        {/* Left 2 Columns: Kingdom Banners Setup */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-[#1c1612] border-4 border-[#8b7355] rounded-2xl p-5 sm:p-6 shadow-2xl space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b-2 border-[#8b7355]/40 pb-3">
              <div className="flex items-center gap-2">
                <Shield className="w-6 h-6 text-[#d4af37]" />
                <h3 className="text-xl font-black text-[#f3e5ab] font-cinzel uppercase tracking-wider">
                  Participating Kingdoms
                </h3>
              </div>
              <div className="flex items-center gap-1.5 bg-[#120e0c] p-1.5 rounded-xl border border-[#8b7355]">
                {[3, 4, 5].map((count) => (
                  <button
                    key={count}
                    onClick={() => handleCountChange(count)}
                    className={`px-4 py-1.5 rounded-lg text-xs font-bold font-cinzel transition-all cursor-pointer ${
                      numKingdoms === count
                        ? 'bg-[#d4af37] text-[#1a120b] font-black shadow-md border border-[#f3e5ab]'
                        : 'text-[#e0d6c5] hover:bg-[#2a2420]'
                    }`}
                  >
                    {count} Kingdoms
                  </button>
                ))}
              </div>
            </div>

            {/* Illuminated Medieval Kingdom Banners */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              {kingdomConfigs.slice(0, numKingdoms).map((kc, idx) => {
                const namesList = kc.studentNamesText
                  .split(/[\n,]+/)
                  .map((n) => n.trim())
                  .filter((n) => n.length > 0);
                const count = namesList.length;

                return (
                  <div
                    key={kc.id}
                    className="rounded-2xl border-2 border-[#8b7355] p-4 bg-gradient-to-b from-[#2a221b] to-[#120e0c] shadow-2xl space-y-3 relative group transition-all hover:border-[#d4af37]"
                  >
                    {/* Top Kingdom Banner Ribbon */}
                    <div className="flex items-center justify-between gap-2 border-b border-[#8b7355]/30 pb-2">
                      <span className="text-3xl filter drop-shadow-md">{kc.bannerSymbol}</span>
                      <input
                        type="text"
                        value={kc.name}
                        onChange={(e) => {
                          const updated = [...kingdomConfigs];
                          updated[idx].name = e.target.value;
                          setKingdomConfigs(updated);
                        }}
                        className="bg-[#120e0c] border border-[#8b7355] rounded px-3 py-1.5 text-sm font-black text-[#f3e5ab] font-cinzel w-full focus:outline-none focus:border-[#d4af37]"
                        placeholder="Kingdom Name"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs font-bold font-cinzel">
                        <label className="text-[#e0d6c5] flex items-center gap-1.5">
                          <Users className="w-4 h-4 text-[#d4af37]" /> Roster ({count} Scholars)
                        </label>
                        <span className="text-[10px] text-[#d4af37] font-mono">
                          {count >= 13 ? `13 Roles + ${count - 13} Citizens` : `Pads to 13`}
                        </span>
                      </div>
                      <textarea
                        value={kc.studentNamesText}
                        onChange={(e) => {
                          const updated = [...kingdomConfigs];
                          updated[idx].studentNamesText = e.target.value;
                          setKingdomConfigs(updated);
                        }}
                        rows={4}
                        placeholder="Type student names (one per line)"
                        className="w-full bg-[#120e0c] border border-[#8b7355]/60 rounded-xl p-2.5 text-xs font-mono text-[#e0d6c5] focus:outline-none focus:border-[#d4af37] resize-y"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Settings & Question Scroll Setup */}
        <div className="space-y-6 font-cinzel">
          <div className="bg-[#1c1612] border-4 border-[#8b7355] rounded-2xl p-5 shadow-2xl space-y-5">
            <div className="border-b-2 border-[#8b7355]/40 pb-3 flex items-center gap-2">
              <Clock className="w-6 h-6 text-[#d4af37]" />
              <h3 className="text-xl font-black text-[#f3e5ab] uppercase tracking-wider">
                Tournament Controls
              </h3>
            </div>

            {/* Timer Selector */}
            <div className="space-y-2">
              <label className="text-xs font-black text-[#d4af37] uppercase tracking-wider block">
                Hourglass Countdown Speed
              </label>
              <div className="grid grid-cols-5 gap-1.5">
                {[10, 20, 30, 45, 60].map((seconds) => (
                  <button
                    key={seconds}
                    onClick={() => {
                      sound.playGobletSelect();
                      setTimerDuration(seconds);
                    }}
                    className={`py-2 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                      timerDuration === seconds
                        ? 'bg-[#d4af37] text-[#1a120b] border-[#f3e5ab] font-black shadow-md'
                        : 'bg-[#120e0c] text-[#e0d6c5] border-[#8b7355]/50 hover:bg-[#2a2420]'
                    }`}
                  >
                    {seconds}s
                  </button>
                ))}
              </div>
            </div>

            {/* Subject Question Selection */}
            <div className="space-y-2 pt-1">
              <label className="text-xs font-black text-[#d4af37] uppercase tracking-wider block">
                Royal Question Scroll Topic
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => {
                  sound.playGobletSelect();
                  setSelectedCategory(e.target.value);
                }}
                className="w-full bg-[#120e0c] border-2 border-[#8b7355] rounded-xl p-3 text-xs font-bold text-[#f3e5ab] focus:outline-none focus:border-[#d4af37]"
              >
                {Object.keys(availableQuestions).map((cat) => (
                  <option key={cat} value={cat}>
                    📜 {cat} ({availableQuestions[cat]?.length || 0} Questions)
                  </option>
                ))}
                {customQuestionsList.length > 0 && (
                  <option value={`AI: ${aiTopicInput}`}>
                    ✨ AI Scroll: {aiTopicInput} ({customQuestionsList.length} Questions)
                  </option>
                )}
              </select>
            </div>

            {/* AI Question Generator Box */}
            <div className="p-4 bg-[#120e0c] border-2 border-[#8b7355]/60 rounded-xl space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-[#f3e5ab]">
                <Wand2 className="w-4 h-4 text-[#d4af37]" />
                Conjure Subject Scroll via Gemini AI
              </div>
              <p className="text-[11px] text-[#8b7355] font-serif">
                Enter any educational topic to generate custom questions:
              </p>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={aiTopicInput}
                  onChange={(e) => setAiTopicInput(e.target.value)}
                  placeholder="e.g. World Geography"
                  className="bg-[#1c1612] border border-[#8b7355] rounded-lg px-3 py-2 text-xs text-[#e0d6c5] w-full focus:outline-none focus:border-[#d4af37]"
                />
                <button
                  onClick={handleGenerateAi}
                  disabled={isGeneratingAi || !aiTopicInput.trim()}
                  className="px-3 py-2 bg-[#d4af37] hover:bg-[#f3e5ab] disabled:opacity-50 text-[#1a120b] rounded-lg text-xs font-black whitespace-nowrap flex items-center gap-1 transition-all shadow-md cursor-pointer"
                >
                  {isGeneratingAi ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Sparkles className="w-4 h-4" />
                  )}
                  Conjure
                </button>
              </div>
            </div>

            {/* Start Game Button */}
            <button
              onClick={handleLaunchBattle}
              onMouseEnter={() => sound.playGobletSelect()}
              className="w-full py-4 bg-gradient-to-r from-[#8b0000] via-[#a00000] to-[#8b0000] hover:from-[#a00000] hover:to-[#8b0000] text-[#f3e5ab] font-black font-cinzel text-lg tracking-widest uppercase rounded-xl shadow-[0_10px_25px_rgba(139,0,0,0.6)] border-2 border-[#d4af37] transition-all flex items-center justify-center gap-2 cursor-pointer hover:scale-105"
            >
              <Swords className="w-6 h-6 text-[#d4af37]" />
              BEGIN KINGDOM TOURNAMENT
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
