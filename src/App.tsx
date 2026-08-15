import React, { useState, useEffect } from 'react';
import {
  GamePhase,
  Kingdom,
  GameSettings,
  Question,
  RecycledQuestion,
  AttackResult,
  RoundHistoryItem,
  TeacherUser,
  SyncStatus,
  BattleLogEntry,
  SavedGameSummary,
} from './types';
import { PRESET_QUESTION_BANKS } from './data/presetData';
import { sound } from './lib/sound';
import { SplashScreen } from './components/SplashScreen';
import { TeacherLoginScreen } from './components/TeacherLoginScreen';
import { TeacherDashboard } from './components/TeacherDashboard';
import { CreateGameWizard } from './components/CreateGameWizard';
import { BattleScreen } from './components/BattleScreen';
import { BattleOpeningCeremony } from './components/BattleOpeningCeremony';
import { RuleGuideModal } from './components/RuleGuideModal';
import { QuestionManagerModal, LOCAL_STORAGE_QUESTION_BANK_KEY } from './components/QuestionManagerModal';
import { TeacherDatabaseModal } from './components/TeacherDatabaseModal';
import { MedievalSidebar, SidebarTab } from './components/MedievalSidebar';
import { Header } from './components/Header';
import { KingdomBackground, CastleSection } from './components/KingdomBackground';
import {
  initAuth,
  googleSignIn,
  logoutUser,
  getAccessToken,
  setCachedAccessToken,
} from './lib/firebaseAuth';
import {
  getOrCreateMasterSpreadsheet,
  backupGameToSheets,
  logBattleEventInSheets,
  fetchSavedGamesFromSheets,
  fetchQuestionsFromSheets,
  syncQuestionsToGoogleSheets,
} from './lib/googleSheets';

export type AppScreenMode = 'splash' | 'login' | 'dashboard' | 'wizard' | 'ceremony' | 'battle';

export default function App() {
  const [appScreen, setAppScreen] = useState<AppScreenMode>('splash');
  const [currentPhase, setCurrentPhase] = useState<GamePhase>('setup');
  const [kingdoms, setKingdoms] = useState<Kingdom[]>([]);
  const [settings, setSettings] = useState<GameSettings>({
    questionTimerDuration: 30,
    soundEnabled: true,
    category: 'World History',
    autoRevealGoblets: false,
  });

  const [availableQuestionsMap, setAvailableQuestionsMap] = useState<
    Record<string, Question[]>
  >(PRESET_QUESTION_BANKS);

  const [activeQuestions, setActiveQuestions] = useState<Question[]>(
    PRESET_QUESTION_BANKS['World History']
  );
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState<number>(0);
  const [roundNumber, setRoundNumber] = useState<number>(1);
  const [roundHistory, setRoundHistory] = useState<RoundHistoryItem[]>([]);

  // Unique Game Code
  const [gameCode, setGameCode] = useState<string>(
    `BK-${Math.floor(1000 + Math.random() * 9000)}`
  );

  // Round specific states
  const [gobletWinnerId, setGobletWinnerId] = useState<string | null>(null);
  const [tiedKingdomIds, setTiedKingdomIds] = useState<string[]>([]);

  // Sidebar & Navigation states
  const [sidebarTab, setSidebarTab] = useState<SidebarTab>('dashboard');
  const [isSidebarMobileOpen, setIsSidebarMobileOpen] = useState<boolean>(false);

  // Teacher & Google Sheets Connection state
  const [teacherUser, setTeacherUser] = useState<TeacherUser | null>(null);
  const [spreadsheetId, setSpreadsheetId] = useState<string | null>(null);
  const [spreadsheetUrl, setSpreadsheetUrl] = useState<string | null>(null);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('offline');
  const [savedGamesList, setSavedGamesList] = useState<SavedGameSummary[]>([]);
  const [battleLogs, setBattleLogs] = useState<BattleLogEntry[]>([]);

  // Modal toggles
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [isRulesOpen, setIsRulesOpen] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isTeacherDbOpen, setIsTeacherDbOpen] = useState<boolean>(false);

  // Royal Recycle Bin state
  const LOCAL_STORAGE_RECYCLE_BIN_KEY = 'battle_of_kingdoms_recycle_bin';
  const [recycledQuestions, setRecycledQuestions] = useState<RecycledQuestion[]>(() => {
    try {
      const stored = localStorage.getItem('battle_of_kingdoms_recycle_bin');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const saveRecycleBin = (items: RecycledQuestion[]) => {
    setRecycledQuestions(items);
    try {
      localStorage.setItem(LOCAL_STORAGE_RECYCLE_BIN_KEY, JSON.stringify(items));
    } catch (e) {
      console.error('Failed to save recycle bin:', e);
    }
  };

  const handleSoftDeleteQuestions = (ids: string[]) => {
    const idsSet = new Set(ids);
    const toDelete = activeQuestions.filter((q) => idsSet.has(q.id));
    const remaining = activeQuestions.filter((q) => !idsSet.has(q.id));

    const nowStr = new Date().toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });

    const newlyRecycled: RecycledQuestion[] = toDelete.map((q) => ({
      question: q,
      deletedAt: nowStr,
    }));

    const updatedRecycleBin = [...newlyRecycled, ...recycledQuestions];
    saveRecycleBin(updatedRecycleBin);

    setActiveQuestions(remaining);
    saveQuestionsToLocalStorage(remaining);
  };

  const handleRestoreRecycledQuestion = (id: string) => {
    const itemToRestore = recycledQuestions.find((r) => r.question.id === id);
    if (!itemToRestore) return;

    const updatedRecycleBin = recycledQuestions.filter((r) => r.question.id !== id);
    saveRecycleBin(updatedRecycleBin);

    const updatedActive = [itemToRestore.question, ...activeQuestions];
    setActiveQuestions(updatedActive);
    saveQuestionsToLocalStorage(updatedActive);
  };

  const handlePermanentDeleteRecycled = (ids: string[]) => {
    const idsSet = new Set(ids);
    const updatedRecycleBin = recycledQuestions.filter((r) => !idsSet.has(r.question.id));
    saveRecycleBin(updatedRecycleBin);
  };

  const handleEmptyRecycleBin = () => {
    saveRecycleBin([]);
  };

  // Load question bank from LocalStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_QUESTION_BANK_KEY);
      if (stored) {
        const parsed: Question[] = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setActiveQuestions(parsed);
          setAvailableQuestionsMap((prev) => ({
            ...prev,
            'Royal Master Archive': parsed,
          }));
        }
      }
    } catch (err) {
      console.error('Error loading stored question bank:', err);
    }
  }, []);

  // Save active questions to LocalStorage and sync to Google Sheets
  const saveQuestionsToLocalStorage = (qs: Question[]) => {
    try {
      localStorage.setItem(LOCAL_STORAGE_QUESTION_BANK_KEY, JSON.stringify(qs));
      setAvailableQuestionsMap((prev) => ({
        ...prev,
        'Royal Master Archive': qs,
      }));
      const token = getAccessToken();
      if (token && spreadsheetId) {
        syncQuestionsToGoogleSheets(token, spreadsheetId, qs);
      }
    } catch (err) {
      console.error('Error saving question bank:', err);
    }
  };

  const handleReloadQuestionsFromSheets = async () => {
    const token = getAccessToken();
    if (!token || !spreadsheetId) {
      alert('Please sign in with Google to connect to Google Sheets.');
      return;
    }
    setSyncStatus('syncing');
    try {
      const sheetQs = await fetchQuestionsFromSheets(token, spreadsheetId);
      if (sheetQs && sheetQs.length > 0) {
        setActiveQuestions(sheetQs);
        setAvailableQuestionsMap((prev) => ({
          ...prev,
          'Google Sheets Bank': sheetQs,
          'Royal Master Archive': sheetQs,
        }));
        localStorage.setItem(LOCAL_STORAGE_QUESTION_BANK_KEY, JSON.stringify(sheetQs));
        setSyncStatus('synced');
        alert(`Loaded ${sheetQs.length} questions directly from Google Sheets!`);
      } else {
        setSyncStatus('synced');
        alert('No questions found in Google Sheets. You can sync current questions to Sheets.');
      }
    } catch (err) {
      console.error('Failed to reload questions from sheets:', err);
      setSyncStatus('error');
      alert('Failed to reload questions from Google Sheets.');
    }
  };

  const handleSyncQuestionsToSheets = async () => {
    const token = getAccessToken();
    if (!token || !spreadsheetId) {
      alert('Please sign in with Google to sync questions to Google Sheets.');
      return;
    }
    setSyncStatus('syncing');
    const success = await syncQuestionsToGoogleSheets(token, spreadsheetId, activeQuestions);
    if (success) {
      setSyncStatus('synced');
      alert(`Successfully synced ${activeQuestions.length} questions to Google Sheets!`);
    } else {
      setSyncStatus('error');
      alert('Failed to sync questions to Google Sheets.');
    }
  };

  // Initialize Firebase Auth & cached access token on load
  useEffect(() => {
    const unsubscribe = initAuth(
      async (user, token) => {
        setTeacherUser({
          uid: user.uid,
          displayName: user.displayName,
          email: user.email,
          photoURL: user.photoURL,
        });

        if (token) {
          setCachedAccessToken(token);
          setSyncStatus('syncing');
          try {
            const sheetInfo = await getOrCreateMasterSpreadsheet(
              token,
              user.email || 'teacher@school.edu',
              user.displayName || 'Master Teacher'
            );
            setSpreadsheetId(sheetInfo.id);
            setSpreadsheetUrl(sheetInfo.url);
            setSyncStatus('synced');

            const saved = await fetchSavedGamesFromSheets(token, sheetInfo.id);
            setSavedGamesList(saved);

            const sheetQs = await fetchQuestionsFromSheets(token, sheetInfo.id);
            if (sheetQs.length > 0) {
              setActiveQuestions(sheetQs);
              setAvailableQuestionsMap((prev) => ({
                ...prev,
                'Google Sheets Bank': sheetQs,
                'Royal Master Archive': sheetQs,
              }));
            } else {
              syncQuestionsToGoogleSheets(token, sheetInfo.id, activeQuestions);
            }
          } catch (err) {
            console.error('Spreadsheet initialization failed:', err);
            setSyncStatus('error');
          }
        }
      },
      () => {
        setTeacherUser(null);
        setSyncStatus('offline');
      }
    );

    return () => unsubscribe();
  }, []);

  // Handle Splash Screen Completion -> Login or Dashboard
  const handleSplashComplete = () => {
    if (teacherUser) {
      setAppScreen('dashboard');
    } else {
      setAppScreen('login');
    }
  };

  // Google Sign In Handler
  const handleTeacherSignIn = async () => {
    try {
      setSyncStatus('syncing');
      const res = await googleSignIn();
      if (res && res.accessToken) {
        setTeacherUser({
          uid: res.user.uid,
          displayName: res.user.displayName,
          email: res.user.email,
          photoURL: res.user.photoURL,
        });

        const sheetInfo = await getOrCreateMasterSpreadsheet(
          res.accessToken,
          res.user.email || 'teacher@school.edu',
          res.user.displayName || 'Master Teacher'
        );
        setSpreadsheetId(sheetInfo.id);
        setSpreadsheetUrl(sheetInfo.url);
        setSyncStatus('synced');

        const saved = await fetchSavedGamesFromSheets(res.accessToken, sheetInfo.id);
        setSavedGamesList(saved);
        setAppScreen('dashboard');
      }
    } catch (err) {
      console.error('Sign in error:', err);
      setSyncStatus('error');
    }
  };

  // Custom Email Login
  const handleEmailLogin = (email: string, name: string) => {
    setTeacherUser({
      uid: `local-${Date.now()}`,
      displayName: name,
      email: email,
      photoURL: null,
    });
    setAppScreen('dashboard');
  };

  // Guest bypass
  const handleContinueAsGuest = () => {
    setTeacherUser({
      uid: 'guest-101',
      displayName: 'Guest Educator',
      email: 'guest@classroom.edu',
      photoURL: null,
    });
    setAppScreen('dashboard');
  };

  // Google Sign Out Handler
  const handleTeacherSignOut = async () => {
    await logoutUser();
    setTeacherUser(null);
    setSpreadsheetId(null);
    setSpreadsheetUrl(null);
    setSyncStatus('offline');
    setAppScreen('login');
  };

  // Log battle action locally and push to Google Sheets
  const addBattleLog = async (action: string, details: string) => {
    const timestamp = new Date().toLocaleTimeString();
    const newLog: BattleLogEntry = {
      id: `LOG-${Date.now()}`,
      gameCode,
      timestamp,
      teacher: teacherUser?.displayName || 'Master Teacher',
      round: roundNumber,
      action,
      details,
    };

    setBattleLogs((prev) => [newLog, ...prev]);

    const token = getAccessToken();
    if (token && spreadsheetId) {
      logBattleEventInSheets(
        token,
        spreadsheetId,
        gameCode,
        teacherUser?.displayName || 'Master Teacher',
        roundNumber,
        action,
        details
      );
    }
  };

  // Trigger continuous automatic save to Google Sheets
  const triggerSheetsAutoBackup = async (
    currentKingdoms = kingdoms,
    currentRound = roundNumber,
    phase = currentPhase
  ) => {
    const token = getAccessToken();
    if (!token || !spreadsheetId) return;

    setSyncStatus('syncing');
    try {
      await backupGameToSheets(
        token,
        spreadsheetId,
        gameCode,
        `Kingdom War (${gameCode})`,
        teacherUser?.email || 'teacher@school.edu',
        currentRound,
        phase,
        currentKingdoms,
        settings
      );
      setSyncStatus('synced');
    } catch (err) {
      console.error('Sheets auto backup failed:', err);
      setSyncStatus('error');
    }
  };

  // Toggle Sound
  const handleToggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    sound.enabled = next;
  };

  // Generate Questions via Gemini API
  const handleGenerateAIQuestions = async (topic: string): Promise<Question[] | null> => {
    try {
      const response = await fetch('/api/generate-questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic }),
      });
      const data = await response.json();
      if (data.success && Array.isArray(data.questions)) {
        const formatted: Question[] = data.questions.map((q: any, idx: number) => ({
          id: `ai-${Date.now()}-${idx}`,
          category: `AI: ${topic}`,
          question: q.question,
          options: q.options,
          correctIndex: q.correctIndex,
          explanation: q.explanation,
        }));

        setAvailableQuestionsMap((prev) => ({
          ...prev,
          [`AI: ${topic}`]: formatted,
        }));
        return formatted;
      }
    } catch (err) {
      console.error('Error fetching AI questions:', err);
    }
    return null;
  };

  // Start Game from Wizard
  const handleStartGame = (
    newKingdoms: Kingdom[],
    newSettings: GameSettings,
    questions: Question[]
  ) => {
    const newCode = `BK-${Math.floor(1000 + Math.random() * 9000)}`;
    setGameCode(newCode);
    setKingdoms(newKingdoms);
    setSettings(newSettings);
    setActiveQuestions(questions);
    setCurrentQuestionIdx(0);
    setRoundNumber(1);
    setRoundHistory([]);
    setGobletWinnerId(null);
    setTiedKingdomIds([]);
    setCurrentPhase('goblet');
    setAppScreen('ceremony');

    addBattleLog('Game Started', `New game created with Code ${newCode}. ${newKingdoms.length} Kingdoms active.`);
    triggerSheetsAutoBackup(newKingdoms, 1, 'goblet');
  };

  // Restart / Reset to Dashboard
  const handleRestartGame = () => {
    setAppScreen('dashboard');
    setCurrentPhase('setup');
    setKingdoms([]);
    setRoundNumber(1);
    setGobletWinnerId(null);
    setTiedKingdomIds([]);
    setRoundHistory([]);
    addBattleLog('Game Reset', 'Battle reset by teacher to Dashboard.');
  };

  // Load Saved Game from Google Sheets
  const handleLoadSavedGame = (savedGame: SavedGameSummary) => {
    setGameCode(savedGame.gameCode);
    setRoundNumber(savedGame.currentRound);
    setCurrentPhase(savedGame.currentPhase || 'goblet');
    if (savedGame.kingdoms && savedGame.kingdoms.length > 0) {
      setKingdoms(savedGame.kingdoms);
    }
    setAppScreen('battle');
    setIsTeacherDbOpen(false);
    addBattleLog('Saved Game Loaded', `Loaded Game Code ${savedGame.gameCode} from Google Sheets.`);
  };

  // Phase 1 Complete
  const handleGobletChallengeComplete = (
    winningKingdomId: string,
    winningNumber: number
  ) => {
    if (!winningKingdomId) {
      const activeOnly = kingdoms.filter((k) => k.status !== 'defeated');
      setTiedKingdomIds(activeOnly.map((k) => k.id));
      setCurrentPhase('tiebreaker');
      addBattleLog('Goblet Challenge Tie', 'All goblets revealed in a tie. Starting tie-breaker!');
    } else {
      setGobletWinnerId(winningKingdomId);
      setCurrentPhase('question');
      const kName = kingdoms.find((k) => k.id === winningKingdomId)?.name || winningKingdomId;
      addBattleLog('Goblet Selected', `${kName} selected Goblet #${winningNumber} and won the challenge!`);
      triggerSheetsAutoBackup(kingdoms, roundNumber, 'question');
    }
  };

  // Phase 2 Complete
  const handleQuestionAnswered = (isCorrect: boolean) => {
    const kName = kingdoms.find((k) => k.id === gobletWinnerId)?.name || 'Kingdom';
    if (isCorrect && gobletWinnerId) {
      setCurrentPhase('attack');
      addBattleLog('Question Answered', `${kName} answered correctly! Advancing to Attack Phase.`);
    } else {
      if (gobletWinnerId) {
        setRoundHistory((prev) => [
          ...prev,
          {
            round: roundNumber,
            gobletWinnerId,
            winningNumber: 0,
            questionAnswered: false,
          },
        ]);
      }
      setCurrentQuestionIdx((prev) => (prev + 1) % activeQuestions.length);
      setCurrentPhase('leaderboard');
      addBattleLog('Question Answered', `${kName} failed question or time expired. Skipped attack phase.`);
    }
    triggerSheetsAutoBackup(kingdoms, roundNumber, isCorrect ? 'attack' : 'leaderboard');
  };

  // Phase 3 Complete
  const handleAttackComplete = (attackResult: AttackResult) => {
    const updatedKingdoms = kingdoms.map((k) => {
      if (k.id === attackResult.attackerKingdomId) {
        const newScore = Math.max(0, k.score + attackResult.pointsDelta);
        return { ...k, score: newScore, gobletWins: (k.gobletWins || 0) + 1 };
      }

      if (k.id === attackResult.defenderKingdomId) {
        const updatedMembers = k.members.map((m) =>
          m.id === attackResult.memberId
            ? {
                ...m,
                isCaptured: true,
                capturedByKingdomId: attackResult.attackerKingdomId,
                capturedInRound: roundNumber,
              }
            : m
        );

        const uncapturedCount = updatedMembers.filter((m) => !m.isCaptured).length;
        let newStatus = k.status;
        if (uncapturedCount === 0) {
          newStatus = 'defeated' as const;
        } else if (uncapturedCount <= 3) {
          newStatus = 'endangered' as const;
        }

        return {
          ...k,
          members: updatedMembers,
          status: newStatus,
        };
      }

      return k;
    });

    setKingdoms(updatedKingdoms);

    if (gobletWinnerId) {
      setRoundHistory((prev) => [
        ...prev,
        {
          round: roundNumber,
          gobletWinnerId,
          winningNumber: 0,
          questionAnswered: true,
          attackResult,
        },
      ]);
    }

    addBattleLog(
      'Member Captured',
      `Captured ${attackResult.memberName} (${(attackResult.role || 'citizen').toUpperCase()}). Earned +${
        attackResult.pointsDelta
      } pts.`
    );

    const activeKingdomsLeft = updatedKingdoms.filter((k) => k.status !== 'defeated');
    if (activeKingdomsLeft.length <= 1) {
      setTimeout(() => {
        setCurrentPhase('victory');
        addBattleLog('Game Completed', `Victory claimed! Final scores updated in Google Sheets.`);
      }, 500);
      triggerSheetsAutoBackup(updatedKingdoms, roundNumber, 'victory');
    } else {
      setCurrentQuestionIdx((prev) => (prev + 1) % activeQuestions.length);
      setCurrentPhase('leaderboard');
      triggerSheetsAutoBackup(updatedKingdoms, roundNumber, 'leaderboard');
    }
  };

  // Phase 4 Next Round
  const handleNextRound = () => {
    const nextRound = roundNumber + 1;
    setRoundNumber(nextRound);
    setGobletWinnerId(null);
    setTiedKingdomIds([]);
    setCurrentPhase('goblet');
    addBattleLog('Round Started', `Advanced to Round ${nextRound}.`);
    triggerSheetsAutoBackup(kingdoms, nextRound, 'goblet');
  };

  // Compute active castle background section
  const activeSection: CastleSection = (() => {
    if (appScreen === 'splash') return 'splash';
    if (appScreen === 'login') return 'login';
    if (appScreen === 'wizard') return 'wizard'; // Royal War Room
    if (appScreen === 'ceremony') return 'ceremony'; // Grand Castle Hall

    if (isSettingsOpen) return 'settings'; // Royal Command Office
    if (isTeacherDbOpen) return 'reports'; // Royal Archives
    if (isRulesOpen) return 'question_bank'; // Grand Royal Library

    if (appScreen === 'dashboard') {
      if (sidebarTab === 'dashboard') return 'dashboard'; // Outside the Kingdom
      if (sidebarTab === 'kingdoms') return 'kingdom_setup'; // Throne Room
      if (sidebarTab === 'members') return 'barracks'; // Knights' Barracks
      if (sidebarTab === 'roles') return 'council'; // Royal Council Chamber
      if (sidebarTab === 'questions') return 'question_bank'; // Grand Royal Library
      if (sidebarTab === 'logs') return 'game_logs'; // Scribe's Chamber
      if (sidebarTab === 'reports') return 'reports'; // Royal Archives
      if (sidebarTab === 'leaderboard') return 'champions'; // Grand Hall of Champions
      if (sidebarTab === 'settings') return 'settings'; // Royal Command Office
    }

    if (appScreen === 'battle') {
      if (currentPhase === 'goblet' || currentPhase === 'tiebreaker') return 'goblet'; // Cup Challenge: Tournament Arena
      if (currentPhase === 'question') return 'question'; // Question Screen: Ancient Scroll Chamber
      if (currentPhase === 'attack') return 'attack'; // Attack Screen: Castle Courtyard
      if (currentPhase === 'leaderboard') return 'champions'; // Hall of Champions: Grand Hall of Champions
      if (currentPhase === 'victory') return 'victory'; // Victory Screen: Celebration Courtyard
    }

    return 'dashboard'; // Grand Castle Hall
  })();

  // Background Music Theme Trigger according to active interface
  useEffect(() => {
    sound.setMusicEnabled(soundEnabled);
    sound.setSfxEnabled(soundEnabled);

    if (soundEnabled) {
      let themeKey: any = 'dashboard';
      if (activeSection === 'splash' || activeSection === 'login') themeKey = 'login';
      else if (activeSection === 'wizard') themeKey = 'wizard';
      else if (activeSection === 'ceremony') themeKey = 'ceremony';
      else if (activeSection === 'settings') themeKey = 'settings';
      else if (activeSection === 'reports') themeKey = 'reports';
      else if (activeSection === 'question_bank') themeKey = 'question_bank';
      else if (activeSection === 'kingdom_setup') themeKey = 'kingdom_setup';
      else if (activeSection === 'barracks') themeKey = 'barracks';
      else if (activeSection === 'council') themeKey = 'council';
      else if (activeSection === 'game_logs') themeKey = 'game_logs';
      else if (activeSection === 'champions') themeKey = 'champions';
      else if (activeSection === 'goblet') themeKey = 'goblet';
      else if (activeSection === 'question') themeKey = 'question';
      else if (activeSection === 'attack') themeKey = 'attack';
      else if (activeSection === 'victory') themeKey = 'victory';
      else themeKey = 'dashboard';

      sound.playTheme(themeKey);
    } else {
      sound.stopTheme();
    }
  }, [activeSection, soundEnabled]);

  return (
    <KingdomBackground section={activeSection}>
      <div className="h-screen w-screen max-h-screen max-w-vw overflow-hidden text-[#e0d6c5] font-sans antialiased flex flex-col selection:bg-[#d4af37] selection:text-[#1a1614]">
        {/* Screen 1: Splash Screen */}
        {appScreen === 'splash' && (
          <SplashScreen
            syncStatus={syncStatus}
            onComplete={handleSplashComplete}
          />
        )}

        {/* Screen 2: Teacher Login */}
        {appScreen === 'login' && (
          <TeacherLoginScreen
            teacherUser={teacherUser}
            syncStatus={syncStatus}
            onGoogleSignIn={handleTeacherSignIn}
            onEmailLogin={handleEmailLogin}
            onContinueAsGuest={handleContinueAsGuest}
          />
        )}

        {/* Screen 3: Teacher Dashboard */}
        {appScreen === 'dashboard' && (
          <TeacherDashboard
            teacherUser={teacherUser}
            syncStatus={syncStatus}
            savedGames={savedGamesList}
            battleLogs={battleLogs}
            spreadsheetUrl={spreadsheetUrl}
            onOpenCreateWizard={() => setAppScreen('wizard')}
            onOpenQuestionBank={() => setIsSettingsOpen(true)}
            onOpenKingdomManager={() => setIsTeacherDbOpen(true)}
            onOpenStats={() => setIsTeacherDbOpen(true)}
            onOpenHistory={() => setIsTeacherDbOpen(true)}
            onOpenLeaderboards={() => setIsTeacherDbOpen(true)}
            onOpenSettings={() => setIsTeacherDbOpen(true)}
            onLoadSavedGame={handleLoadSavedGame}
            onLogout={handleTeacherSignOut}
            onManualSync={() => triggerSheetsAutoBackup()}
          />
        )}

        {/* Screen 4: Create Game Wizard */}
        {appScreen === 'wizard' && (
          <CreateGameWizard
            onStartGame={handleStartGame}
            availableQuestions={availableQuestionsMap}
            onOpenQuestionArchive={() => setIsSettingsOpen(true)}
            onGenerateAIQuestions={handleGenerateAIQuestions}
            onCancel={() => setAppScreen('dashboard')}
          />
        )}

        {/* Screen 4.5: Battle Opening Ceremony */}
        {appScreen === 'ceremony' && (
          <BattleOpeningCeremony
            kingdoms={kingdoms}
            onComplete={() => setAppScreen('battle')}
          />
        )}

        {/* Screen 5: Active Battle Screen */}
        {appScreen === 'battle' && (
          <BattleScreen
            currentPhase={currentPhase}
            kingdoms={kingdoms}
            roundNumber={roundNumber}
            gameCode={gameCode}
            soundEnabled={soundEnabled}
            syncStatus={syncStatus}
            teacherUser={teacherUser}
            settings={settings}
            activeQuestions={activeQuestions}
            currentQuestionIdx={currentQuestionIdx}
            gobletWinnerId={gobletWinnerId}
            tiedKingdomIds={tiedKingdomIds}
            roundHistory={roundHistory}
            battleLogs={battleLogs}
            onToggleSound={handleToggleSound}
            onOpenRules={() => setIsRulesOpen(true)}
            onOpenSettings={() => setIsSettingsOpen(true)}
            onOpenTeacherDb={() => setIsTeacherDbOpen(true)}
            onRestartGame={handleRestartGame}
            onGobletChallengeComplete={handleGobletChallengeComplete}
            onQuestionAnswered={handleQuestionAnswered}
            onAttackComplete={handleAttackComplete}
            onNextRound={handleNextRound}
          />
        )}

        {/* Modals */}
        <RuleGuideModal isOpen={isRulesOpen} onClose={() => setIsRulesOpen(false)} />
        <QuestionManagerModal
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
          questions={activeQuestions}
          onAddQuestion={(q) => {
            setActiveQuestions((prev) => {
              const updated = [q, ...prev];
              saveQuestionsToLocalStorage(updated);
              return updated;
            });
          }}
          onUpdateQuestion={(q) => {
            setActiveQuestions((prev) => {
              const updated = prev.map((item) => (item.id === q.id ? q : item));
              saveQuestionsToLocalStorage(updated);
              return updated;
            });
          }}
          onDeleteQuestion={(id) => handleSoftDeleteQuestions([id])}
          onDeleteQuestions={(ids) => handleSoftDeleteQuestions(ids)}
          onSetQuestionsList={(qs) => {
            setActiveQuestions(qs);
            saveQuestionsToLocalStorage(qs);
          }}
          onGenerateAIQuestions={handleGenerateAIQuestions}
          onSelectCategory={(cat, newQs) => {
            if (newQs) {
              setActiveQuestions(newQs);
              saveQuestionsToLocalStorage(newQs);
            }
          }}
          currentCategory={settings.category}
          spreadsheetId={spreadsheetId}
          spreadsheetUrl={spreadsheetUrl}
          onSyncWithSheets={handleSyncQuestionsToSheets}
          onReloadFromSheets={handleReloadQuestionsFromSheets}
          recycledQuestions={recycledQuestions}
          onRestoreRecycledQuestion={handleRestoreRecycledQuestion}
          onPermanentDeleteRecycled={handlePermanentDeleteRecycled}
          onEmptyRecycleBin={handleEmptyRecycleBin}
        />
        <TeacherDatabaseModal
          isOpen={isTeacherDbOpen}
          onClose={() => setIsTeacherDbOpen(false)}
          teacherUser={teacherUser}
          onSignIn={handleTeacherSignIn}
          onSignOut={handleTeacherSignOut}
          spreadsheetId={spreadsheetId}
          spreadsheetUrl={spreadsheetUrl}
          syncStatus={syncStatus}
          gameCode={gameCode}
          savedGames={savedGamesList}
          onLoadGame={handleLoadSavedGame}
          onManualSync={() => triggerSheetsAutoBackup()}
          battleLogs={battleLogs}
          questions={activeQuestions}
          onAddQuestion={(q) => {
            setActiveQuestions((prev) => {
              const updated = [q, ...prev];
              saveQuestionsToLocalStorage(updated);
              return updated;
            });
          }}
          onUpdateQuestion={(q) => {
            setActiveQuestions((prev) => {
              const updated = prev.map((item) => (item.id === q.id ? q : item));
              saveQuestionsToLocalStorage(updated);
              return updated;
            });
          }}
          onDeleteQuestion={(id) => handleSoftDeleteQuestions([id])}
          onDeleteQuestions={(ids) => handleSoftDeleteQuestions(ids)}
          onReloadQuestionsFromSheets={handleReloadQuestionsFromSheets}
          onSyncQuestionsToSheets={handleSyncQuestionsToSheets}
          recycledQuestions={recycledQuestions}
          onRestoreRecycledQuestion={handleRestoreRecycledQuestion}
          onPermanentDeleteRecycled={handlePermanentDeleteRecycled}
          onEmptyRecycleBin={handleEmptyRecycleBin}
        />
      </div>
    </KingdomBackground>
  );
}
