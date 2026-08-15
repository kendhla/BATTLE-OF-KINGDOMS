import React, { useState } from 'react';
import {
  X,
  Database,
  ExternalLink,
  RefreshCw,
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  LogIn,
  LogOut,
  Play,
  Clock,
  Shield,
  Trophy,
  History,
  Table,
  BookOpen,
  Edit,
  Trash2,
  Plus,
  Save,
  Search,
} from 'lucide-react';
import {
  TeacherUser,
  SyncStatus,
  SavedGameSummary,
  BattleLogEntry,
  Kingdom,
  GameSettings,
  Question,
  RecycledQuestion,
} from '../types';

interface TeacherDatabaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  teacherUser: TeacherUser | null;
  onSignIn: () => void;
  onSignOut: () => void;
  spreadsheetId: string | null;
  spreadsheetUrl: string | null;
  syncStatus: SyncStatus;
  gameCode: string;
  savedGames: SavedGameSummary[];
  onLoadGame: (game: SavedGameSummary) => void;
  onManualSync: () => void;
  battleLogs: BattleLogEntry[];
  questions?: Question[];
  onAddQuestion?: (q: Question) => void;
  onUpdateQuestion?: (q: Question) => void;
  onDeleteQuestion?: (id: string) => void;
  onReloadQuestionsFromSheets?: () => Promise<void>;
  onSyncQuestionsToSheets?: () => Promise<void>;
  recycledQuestions?: RecycledQuestion[];
  onRestoreRecycledQuestion?: (id: string) => void;
  onPermanentDeleteRecycled?: (ids: string[]) => void;
  onEmptyRecycleBin?: () => void;
}

export const TeacherDatabaseModal: React.FC<TeacherDatabaseModalProps> = ({
  isOpen,
  onClose,
  teacherUser,
  onSignIn,
  onSignOut,
  spreadsheetId,
  spreadsheetUrl,
  syncStatus,
  gameCode,
  savedGames,
  onLoadGame,
  onManualSync,
  battleLogs,
  questions = [],
  onAddQuestion,
  onUpdateQuestion,
  onDeleteQuestion,
  onReloadQuestionsFromSheets,
  onSyncQuestionsToSheets,
  recycledQuestions = [],
  onRestoreRecycledQuestion,
  onPermanentDeleteRecycled,
  onEmptyRecycleBin,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'saved' | 'logs' | 'questions' | 'recycle'>(
    'overview'
  );
  const [searchFilter, setSearchFilter] = useState<string>('');
  const [isReloadingQs, setIsReloadingQs] = useState<boolean>(false);
  const [isSyncingQs, setIsSyncingQs] = useState<boolean>(false);

  // Delete Confirmation State
  const [pendingDelete, setPendingDelete] = useState<Question | null>(null);

  // Toast Notification State
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 4000);
  };

  // Edit question state inside modal
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [editQText, setEditQText] = useState<string>('');
  const [editOptA, setEditOptA] = useState<string>('');
  const [editOptB, setEditOptB] = useState<string>('');
  const [editOptC, setEditOptC] = useState<string>('');
  const [editOptD, setEditOptD] = useState<string>('');
  const [editCorrectIdx, setEditCorrectIdx] = useState<number>(0);
  const [editSubject, setEditSubject] = useState<string>('General');
  const [editExplanation, setEditExplanation] = useState<string>('');
  const [isAddingNew, setIsAddingNew] = useState<boolean>(false);

  if (!isOpen) return null;

  const filteredQuestions = questions.filter((q) => {
    if (!searchFilter.trim()) return true;
    const term = searchFilter.toLowerCase();
    return (
      q.question.toLowerCase().includes(term) ||
      (q.subject && q.subject.toLowerCase().includes(term)) ||
      (q.category && q.category.toLowerCase().includes(term))
    );
  });

  const handleStartEdit = (q: Question) => {
    setEditingQuestion(q);
    setEditQText(q.question);
    setEditOptA(q.options[0] || '');
    setEditOptB(q.options[1] || '');
    setEditOptC(q.options[2] || '');
    setEditOptD(q.options[3] || '');
    setEditCorrectIdx(q.correctIndex || 0);
    setEditSubject(q.subject || q.category || 'General');
    setEditExplanation(q.explanation || '');
    setIsAddingNew(false);
  };

  const handleStartAdd = () => {
    setEditingQuestion(null);
    setEditQText('');
    setEditOptA('');
    setEditOptB('');
    setEditOptC('');
    setEditOptD('');
    setEditCorrectIdx(0);
    setEditSubject('General');
    setEditExplanation('');
    setIsAddingNew(true);
  };

  const handleSaveQuestionForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editQText.trim() || !editOptA.trim() || !editOptB.trim()) {
      alert('Please fill in the question text and at least 2 options.');
      return;
    }

    const qData: Question = {
      id: editingQuestion ? editingQuestion.id : `q-sheet-${Date.now()}`,
      question: editQText.trim(),
      options: [editOptA.trim(), editOptB.trim(), editOptC.trim() || 'Option C', editOptD.trim() || 'Option D'],
      correctIndex: editCorrectIdx,
      subject: editSubject.trim() || 'General',
      category: editSubject.trim() || 'General',
      gradeLevel: editingQuestion?.gradeLevel || 'Grade 11',
      difficulty: editingQuestion?.difficulty || 'Knight (Medium)',
      explanation: editExplanation.trim(),
    };

    if (editingQuestion && onUpdateQuestion) {
      onUpdateQuestion(qData);
    } else if (onAddQuestion) {
      onAddQuestion(qData);
    }

    setEditingQuestion(null);
    setIsAddingNew(false);
  };

  const handleDelete = (id: string) => {
    const q = questions.find((item) => item.id === id);
    if (q) setPendingDelete(q);
  };

  const confirmDelete = () => {
    if (!pendingDelete) return;
    if (onDeleteQuestion) onDeleteQuestion(pendingDelete.id);
    triggerToast('✅ Question Scroll Deleted Successfully.');
    setPendingDelete(null);
  };

  const handleReload = async () => {
    if (!onReloadQuestionsFromSheets) return;
    setIsReloadingQs(true);
    await onReloadQuestionsFromSheets();
    setIsReloadingQs(false);
  };

  const handleSync = async () => {
    if (!onSyncQuestionsToSheets) return;
    setIsSyncingQs(true);
    await onSyncQuestionsToSheets();
    setIsSyncingQs(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-300 font-serif">
      <div className="bg-[#1a1614] border-4 border-[#8b7355] rounded-2xl max-w-[1400px] w-full max-h-[88vh] overflow-y-auto p-6 space-y-6 shadow-[0_0_50px_rgba(0,0,0,0.8)] relative text-[#e0d6c5]">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full bg-[#2a2420] hover:bg-[#332b26] text-[#d4af37] border border-[#8b7355] transition-all cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 border-b-2 border-[#8b7355] pb-4">
          <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-[#d4af37] to-[#f3e5ab] border-2 border-[#5c4033] flex items-center justify-center text-[#2a2420] font-black shadow-md">
            <Database className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl font-black italic tracking-wider text-[#f3e5ab] uppercase">
              Teacher Control Database
            </h2>
            <p className="text-xs uppercase tracking-widest text-[#8b7355] font-sans">
              Google Sheets Master Persistence & Live Synchronization Engine
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap border-b border-[#8b7355]/40 gap-2 font-sans">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 text-xs font-bold uppercase tracking-wider transition-all border-b-2 ${
              activeTab === 'overview'
                ? 'border-[#d4af37] text-[#f3e5ab] bg-[#2a2420] rounded-t-lg'
                : 'border-transparent text-[#8b7355] hover:text-[#e0d6c5]'
            }`}
          >
            📊 Connection & Database Info
          </button>
          <button
            onClick={() => setActiveTab('questions')}
            className={`px-4 py-2 text-xs font-bold uppercase tracking-wider transition-all border-b-2 ${
              activeTab === 'questions'
                ? 'border-[#d4af37] text-[#f3e5ab] bg-[#2a2420] rounded-t-lg'
                : 'border-transparent text-[#8b7355] hover:text-[#e0d6c5]'
            }`}
          >
            📜 Google Sheet Questions ({questions.length})
          </button>
          <button
            onClick={() => setActiveTab('saved')}
            className={`px-4 py-2 text-xs font-bold uppercase tracking-wider transition-all border-b-2 ${
              activeTab === 'saved'
                ? 'border-[#d4af37] text-[#f3e5ab] bg-[#2a2420] rounded-t-lg'
                : 'border-transparent text-[#8b7355] hover:text-[#e0d6c5]'
            }`}
          >
            💾 Saved Games ({savedGames.length})
          </button>
          <button
            onClick={() => setActiveTab('logs')}
            className={`px-4 py-2 text-xs font-bold uppercase tracking-wider transition-all border-b-2 ${
              activeTab === 'logs'
                ? 'border-[#d4af37] text-[#f3e5ab] bg-[#2a2420] rounded-t-lg'
                : 'border-transparent text-[#8b7355] hover:text-[#e0d6c5]'
            }`}
          >
            📜 Live Battle Logs ({battleLogs.length})
          </button>
          <button
            onClick={() => setActiveTab('recycle')}
            className={`px-4 py-2 text-xs font-bold uppercase tracking-wider transition-all border-b-2 ${
              activeTab === 'recycle'
                ? 'border-[#d4af37] text-[#f3e5ab] bg-[#2a2420] rounded-t-lg'
                : 'border-transparent text-[#8b7355] hover:text-[#e0d6c5]'
            }`}
          >
            🗑 Royal Recycle Bin ({recycledQuestions.length})
          </button>
        </div>

        {/* TAB 1: OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="space-y-5 text-xs font-sans">
            {/* Account Info Box */}
            <div className="p-4 rounded-xl bg-[#2a2420] border-2 border-[#8b7355] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex items-center gap-3">
                {teacherUser?.photoURL ? (
                  <img
                    src={teacherUser.photoURL}
                    alt="Teacher Avatar"
                    className="w-10 h-10 rounded-full border-2 border-[#d4af37]"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-[#8b7355] text-[#2a2420] font-black flex items-center justify-center text-lg">
                    {teacherUser?.displayName?.[0] || 'T'}
                  </div>
                )}
                <div>
                  <div className="font-bold text-[#f3e5ab] text-sm">
                    {teacherUser ? teacherUser.displayName : 'Teacher Not Signed In'}
                  </div>
                  <div className="text-[11px] text-[#8b7355]">
                    {teacherUser ? teacherUser.email : 'Sign in with Google to enable master Sheets backup'}
                  </div>
                </div>
              </div>

              {teacherUser ? (
                <button
                  onClick={onSignOut}
                  className="px-4 py-2 bg-[#8b0000] hover:bg-[#a00000] text-white font-bold rounded-lg border border-[#5c4033] flex items-center gap-2 transition-all cursor-pointer"
                >
                  <LogOut className="w-4 h-4" /> Sign Out
                </button>
              ) : (
                <button
                  onClick={onSignIn}
                  className="gsi-material-button px-4 py-2.5 bg-white text-slate-800 font-bold rounded-lg border border-slate-300 hover:bg-slate-50 flex items-center gap-2 shadow-md transition-all cursor-pointer"
                >
                  <LogIn className="w-4 h-4 text-blue-600" />
                  <span>Sign in with Google</span>
                </button>
              )}
            </div>

            {/* Sync & Spreadsheet Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-[#2a2420] border border-[#8b7355]/60 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#f3e5ab] uppercase tracking-wider text-xs">
                    Current Game Code
                  </span>
                  <span className="font-mono font-black text-lg px-3 py-0.5 bg-[#1a1614] border border-[#d4af37] text-[#d4af37] rounded">
                    {gameCode}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#f3e5ab] text-xs">Sync Status:</span>
                  <span className="flex items-center gap-1.5 font-bold">
                    {syncStatus === 'synced' && (
                      <span className="text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4" /> Live Synced
                      </span>
                    )}
                    {syncStatus === 'syncing' && (
                      <span className="text-amber-400 flex items-center gap-1 animate-pulse">
                        <RefreshCw className="w-4 h-4 animate-spin" /> Syncing...
                      </span>
                    )}
                    {syncStatus === 'offline' && (
                      <span className="text-stone-400">Offline / Standalone</span>
                    )}
                    {syncStatus === 'error' && (
                      <span className="text-rose-400 flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" /> Sync Error
                      </span>
                    )}
                  </span>
                </div>

                <button
                  onClick={onManualSync}
                  className="w-full py-2 bg-[#d4af37] hover:bg-[#f3e5ab] text-[#2a2420] font-black rounded-lg uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <RefreshCw className="w-4 h-4" /> Sync Now to Google Sheets
                </button>
              </div>

              {/* Connected Spreadsheet Box */}
              <div className="p-4 rounded-xl bg-[#2a2420] border border-[#8b7355]/60 space-y-3">
                <div className="font-bold text-[#f3e5ab] uppercase tracking-wider text-xs flex items-center gap-2">
                  <FileSpreadsheet className="w-4 h-4 text-[#d4af37]" /> Connected Google Spreadsheet
                </div>

                {spreadsheetUrl ? (
                  <div className="space-y-2">
                    <p className="text-[11px] text-[#8b7355]">
                      Sheet ID: <span className="font-mono text-xs text-[#e0d6c5]">{spreadsheetId?.slice(0, 16)}...</span>
                    </p>
                    <a
                      href={spreadsheetUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-800 hover:bg-emerald-700 text-white font-bold rounded-lg border border-emerald-500 text-xs transition-all w-full justify-center"
                    >
                      <ExternalLink className="w-4 h-4" /> Open Spreadsheet in Google Sheets
                    </a>
                  </div>
                ) : (
                  <p className="text-xs text-[#8b7355] italic">
                    Spreadsheet will be automatically created on Google Drive upon teacher sign in.
                  </p>
                )}
              </div>
            </div>

            {/* Database Tables Summary */}
            <div className="p-4 rounded-xl bg-[#1a1614] border border-[#8b7355]/40 space-y-2">
              <h4 className="font-bold text-[#f3e5ab] uppercase tracking-wider text-xs flex items-center gap-2">
                <Table className="w-4 h-4 text-[#d4af37]" /> 11 Master Worksheet Tabs
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px] text-[#8b7355]">
                <div className="p-1.5 bg-[#2a2420] rounded border border-[#8b7355]/30">1. Teachers</div>
                <div className="p-1.5 bg-[#2a2420] rounded border border-[#8b7355]/30">2. Games</div>
                <div className="p-1.5 bg-[#2a2420] rounded border border-[#8b7355]/30">3. Kingdoms</div>
                <div className="p-1.5 bg-[#2a2420] rounded border border-[#8b7355]/30">4. Members</div>
                <div className="p-1.5 bg-[#2a2420] rounded border border-[#8b7355]/30">5. Question Bank</div>
                <div className="p-1.5 bg-[#2a2420] rounded border border-[#8b7355]/30">6. Goblet Results</div>
                <div className="p-1.5 bg-[#2a2420] rounded border border-[#8b7355]/30">7. Attack History</div>
                <div className="p-1.5 bg-[#2a2420] rounded border border-[#8b7355]/30">8. Battle Logs</div>
                <div className="p-1.5 bg-[#2a2420] rounded border border-[#8b7355]/30">9. Statistics</div>
                <div className="p-1.5 bg-[#2a2420] rounded border border-[#8b7355]/30">10. Awards</div>
                <div className="p-1.5 bg-[#2a2420] rounded border border-[#8b7355]/30">11. Settings</div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: SAVED GAMES BY GAME CODE */}
        {activeTab === 'saved' && (
          <div className="space-y-3 font-sans text-xs">
            {savedGames.length === 0 ? (
              <div className="p-6 text-center text-[#8b7355] italic bg-[#2a2420] rounded-xl border border-[#8b7355]/40">
                No saved game codes found in Google Sheets yet. Start a new game to automatically create a backup!
              </div>
            ) : (
              savedGames.map((g) => (
                <div
                  key={g.gameCode}
                  className="p-4 bg-[#2a2420] border-2 border-[#8b7355] rounded-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 hover:border-[#d4af37] transition-all"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-black text-sm px-2 py-0.5 bg-[#1a1614] border border-[#d4af37] text-[#d4af37] rounded">
                        {g.gameCode}
                      </span>
                      <span className="font-bold text-[#f3e5ab] text-sm">{g.gameName}</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-900/60 text-amber-200 border border-amber-500">
                        Round {g.currentRound}
                      </span>
                    </div>
                    <div className="text-[11px] text-[#8b7355]">
                      Created: {new Date(g.dateCreated).toLocaleString()} | Status: {g.gameStatus}
                    </div>
                  </div>

                  <button
                    onClick={() => onLoadGame(g)}
                    className="px-4 py-2 bg-[#8b0000] hover:bg-[#a00000] text-white font-black rounded-lg border border-[#5c4033] flex items-center gap-1.5 transition-all cursor-pointer shrink-0"
                  >
                    <Play className="w-4 h-4 text-[#f3e5ab]" /> Resume Game Code
                  </button>
                </div>
              ))
            )}
          </div>
        )}

        {/* TAB 2: GOOGLE SHEET QUESTIONS */}
        {activeTab === 'questions' && (
          <div className="space-y-4 font-sans text-xs">
            {/* Action Bar & Controls */}
            <div className="p-4 bg-[#2a2420] border-2 border-[#8b7355] rounded-xl flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-[#d4af37]" />
                <div>
                  <h3 className="font-bold text-[#f3e5ab] text-sm">
                    Google Sheets Master Question Bank
                  </h3>
                  <p className="text-[11px] text-[#8b7355]">
                    {questions.length} question scrolls linked to worksheet tab: <span className="font-mono text-[#d4af37]">Question Bank</span>
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {spreadsheetUrl && (
                  <a
                    href={spreadsheetUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 bg-emerald-800 hover:bg-emerald-700 text-white font-bold rounded-lg border border-emerald-500 flex items-center gap-1.5 text-xs transition-all cursor-pointer"
                    title="Open Google Sheet in new browser tab to bulk edit or format questions"
                  >
                    <ExternalLink className="w-3.5 h-3.5" /> Open Google Sheet to Edit
                  </a>
                )}

                <button
                  onClick={handleReload}
                  disabled={isReloadingQs}
                  className="px-3 py-1.5 bg-[#8b7355] hover:bg-[#a08766] text-[#120e0c] font-black rounded-lg border border-[#d4af37] flex items-center gap-1.5 text-xs transition-all cursor-pointer disabled:opacity-50"
                  title="Refetch latest rows from Google Sheets"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isReloadingQs ? 'animate-spin' : ''}`} />
                  {isReloadingQs ? 'Reloading...' : 'Reload from Sheet'}
                </button>

                <button
                  onClick={handleSync}
                  disabled={isSyncingQs}
                  className="px-3 py-1.5 bg-[#d4af37] hover:bg-[#f3e5ab] text-[#120e0c] font-black rounded-lg border border-[#ffd700] flex items-center gap-1.5 text-xs transition-all cursor-pointer disabled:opacity-50"
                  title="Overwrite Google Sheet with current app questions"
                >
                  <Save className="w-3.5 h-3.5" />
                  {isSyncingQs ? 'Syncing...' : 'Sync to Sheet'}
                </button>

                <button
                  onClick={handleStartAdd}
                  className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white font-black rounded-lg border border-amber-300 flex items-center gap-1.5 text-xs transition-all cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Question
                </button>
              </div>
            </div>

            {/* Search Filter */}
            <div className="relative">
              <Search className="w-4 h-4 text-[#8b7355] absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search questions by text or subject..."
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-[#1a1614] border border-[#8b7355] rounded-lg text-xs text-[#f3e5ab] placeholder-[#8b7355] focus:outline-none focus:border-[#d4af37]"
              />
            </div>

            {/* Question Add / Edit Form Modal inside DB Modal */}
            {(editingQuestion || isAddingNew) && (
              <form
                onSubmit={handleSaveQuestionForm}
                className="p-4 bg-[#231b16] border-2 border-[#d4af37] rounded-xl space-y-3 animate-in fade-in"
              >
                <div className="flex items-center justify-between border-b border-[#8b7355]/40 pb-2">
                  <span className="font-bold text-[#f3e5ab] text-sm uppercase tracking-wider">
                    {editingQuestion ? '✏️ Edit Question' : '➕ Add Question to Sheet'}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setEditingQuestion(null);
                      setIsAddingNew(false);
                    }}
                    className="text-xs text-[#8b7355] hover:text-[#f3e5ab]"
                  >
                    Cancel
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-[#8b7355] mb-1">
                      Subject / Category
                    </label>
                    <input
                      type="text"
                      value={editSubject}
                      onChange={(e) => setEditSubject(e.target.value)}
                      className="w-full px-3 py-1.5 bg-[#1a1614] border border-[#8b7355] rounded text-xs text-[#f3e5ab]"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-[#8b7355] mb-1">
                      Explanation (Optional)
                    </label>
                    <input
                      type="text"
                      value={editExplanation}
                      onChange={(e) => setEditExplanation(e.target.value)}
                      className="w-full px-3 py-1.5 bg-[#1a1614] border border-[#8b7355] rounded text-xs text-[#f3e5ab]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase text-[#8b7355] mb-1">
                    Question Text
                  </label>
                  <textarea
                    rows={2}
                    value={editQText}
                    onChange={(e) => setEditQText(e.target.value)}
                    className="w-full px-3 py-1.5 bg-[#1a1614] border border-[#8b7355] rounded text-xs text-[#f3e5ab]"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {[
                    { label: 'Option A', val: editOptA, set: setEditOptA, idx: 0 },
                    { label: 'Option B', val: editOptB, set: setEditOptB, idx: 1 },
                    { label: 'Option C', val: editOptC, set: setEditOptC, idx: 2 },
                    { label: 'Option D', val: editOptD, set: setEditOptD, idx: 3 },
                  ].map((opt) => (
                    <div
                      key={opt.idx}
                      className={`p-2 rounded border flex items-center gap-2 ${
                        editCorrectIdx === opt.idx
                          ? 'border-[#ffd700] bg-[#2a2420]'
                          : 'border-[#8b7355]/40 bg-[#1a1614]'
                      }`}
                    >
                      <input
                        type="radio"
                        name="correctIndex"
                        checked={editCorrectIdx === opt.idx}
                        onChange={() => setEditCorrectIdx(opt.idx)}
                        className="cursor-pointer"
                      />
                      <input
                        type="text"
                        value={opt.val}
                        onChange={(e) => opt.set(e.target.value)}
                        placeholder={opt.label}
                        className="w-full bg-transparent text-xs text-[#f3e5ab] focus:outline-none"
                        required={opt.idx < 2}
                      />
                      {editCorrectIdx === opt.idx && (
                        <span className="text-[10px] font-bold text-[#ffd700] uppercase">Correct</span>
                      )}
                    </div>
                  ))}
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="submit"
                    className="px-4 py-2 bg-[#d4af37] hover:bg-[#f3e5ab] text-[#120e0c] font-black rounded-lg text-xs uppercase"
                  >
                    Save & Sync Question
                  </button>
                </div>
              </form>
            )}

            {/* Questions Table / List */}
            {filteredQuestions.length === 0 ? (
              <div className="p-8 text-center text-[#8b7355] italic bg-[#2a2420] rounded-xl border border-[#8b7355]/40">
                No questions found in Google Sheets Bank. Click "Add Question" or "Sync to Sheet" to populate!
              </div>
            ) : (
              <div className="space-y-2 max-h-[48vh] overflow-y-auto pr-1">
                {filteredQuestions.map((q) => (
                  <div
                    key={q.id}
                    className="p-3 bg-[#2a2420] border border-[#8b7355]/60 hover:border-[#d4af37] rounded-xl space-y-2 transition-all"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#1a1614] text-[#d4af37] border border-[#8b7355]/50">
                            {q.id}
                          </span>
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-950 text-amber-200 border border-amber-800">
                            {q.subject || q.category || 'General'}
                          </span>
                        </div>
                        <p className="font-bold text-sm text-[#f3e5ab]">{q.question}</p>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          onClick={() => handleStartEdit(q)}
                          className="px-2.5 py-1 bg-[#1a1614] hover:bg-[#332b26] border border-[#8b7355] text-amber-300 font-bold rounded-lg text-[11px] flex items-center gap-1 transition-all cursor-pointer"
                          title="Edit Question"
                        >
                          <Edit className="w-3.5 h-3.5" /> Edit
                        </button>
                        <button
                          onClick={() => handleDelete(q.id)}
                          className="px-2.5 py-1 bg-rose-950/80 hover:bg-rose-900 border border-rose-600 text-rose-300 font-bold rounded-lg text-[11px] flex items-center gap-1 transition-all cursor-pointer"
                          title="Delete Question Scroll"
                        >
                          <Trash2 className="w-3.5 h-3.5" /> 🗑 Delete Scroll
                        </button>
                      </div>
                    </div>

                    {/* Options Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 text-xs font-sans">
                      {q.options.map((opt, oIdx) => {
                        const isCorrect = oIdx === q.correctIndex;
                        return (
                          <div
                            key={oIdx}
                            className={`p-1.5 rounded border text-[11px] ${
                              isCorrect
                                ? 'bg-[#1a1614] border-[#ffd700] text-[#ffd700] font-bold'
                                : 'bg-[#1a1614]/60 border-[#8b7355]/30 text-[#e0d6c5]/80'
                            }`}
                          >
                            <span className="mr-1">{String.fromCharCode(65 + oIdx)}:</span>
                            {opt}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        {activeTab === 'logs' && (
          <div className="space-y-2 font-mono text-xs max-h-[50vh] overflow-y-auto">
            {battleLogs.length === 0 ? (
              <p className="p-4 text-center text-[#8b7355] italic">No battle events logged yet in current session.</p>
            ) : (
              battleLogs.map((log) => (
                <div
                  key={log.id}
                  className="p-2.5 bg-[#2a2420] border border-[#8b7355]/40 rounded-lg flex items-center justify-between text-[11px]"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-[#8b7355] font-sans">[{log.timestamp}]</span>
                    <span className="text-[#d4af37] font-bold">R{log.round}:</span>
                    <span className="font-bold text-[#f3e5ab] font-sans">{log.action}</span>
                  </div>
                  <span className="text-[#e0d6c5]/80 font-sans">{log.details}</span>
                </div>
              ))
            )}
          </div>
        )}

        {/* TAB 5: ROYAL RECYCLE BIN */}
        {activeTab === 'recycle' && (
          <div className="space-y-4 font-sans text-xs">
            <div className="p-4 bg-[#2a2420] border border-[#8b7355] rounded-xl flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-rose-950/80 border border-rose-600 flex items-center justify-center text-xl text-rose-300">
                  🗑
                </div>
                <div>
                  <h3 className="font-bold font-cinzel text-[#f3e5ab] text-sm">
                    Royal Recycle Bin
                  </h3>
                  <p className="text-xs text-[#8b7355]">
                    {recycledQuestions.length} deleted question scrolls stored. Items can be restored back to Google Sheets & Local Bank.
                  </p>
                </div>
              </div>

              {recycledQuestions.length > 0 && onEmptyRecycleBin && (
                <button
                  onClick={() => {
                    if (confirm('Are you sure you want to permanently empty the Royal Recycle Bin?')) {
                      onEmptyRecycleBin();
                      triggerToast('🗑 Royal Recycle Bin Emptied.');
                    }
                  }}
                  className="px-3.5 py-1.5 bg-rose-950 hover:bg-rose-900 border border-rose-600 text-rose-200 font-bold rounded-xl text-xs flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Empty Recycle Bin
                </button>
              )}
            </div>

            {recycledQuestions.length === 0 ? (
              <div className="p-12 text-center bg-[#2a2420] rounded-xl border border-dashed border-[#8b7355]/40 space-y-2">
                <p className="text-sm font-bold text-[#f3e5ab]">The Recycle Bin is empty.</p>
                <p className="text-xs text-[#8b7355] italic">No deleted question scrolls currently stored.</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-[50vh] overflow-y-auto pr-1">
                {recycledQuestions.map((rq) => (
                  <div
                    key={rq.question.id}
                    className="p-3.5 bg-[#2a2420] border border-[#8b7355]/60 hover:border-[#d4af37] rounded-xl space-y-2 transition-all flex flex-wrap items-center justify-between gap-3"
                  >
                    <div className="space-y-1 max-w-2xl">
                      <div className="flex items-center gap-2 text-[10px]">
                        <span className="px-2 py-0.5 rounded bg-amber-950 border border-amber-800 text-amber-200 font-bold">
                          {rq.question.subject || rq.question.category || 'General'}
                        </span>
                        <span className="text-[#8b7355]">Deleted on {rq.deletedAt}</span>
                      </div>
                      <p className="font-bold text-sm text-[#f3e5ab] font-cinzel">{rq.question.question}</p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {onRestoreRecycledQuestion && (
                        <button
                          onClick={() => {
                            onRestoreRecycledQuestion(rq.question.id);
                            triggerToast('✅ Question Scroll Restored to Archive.');
                          }}
                          className="px-3 py-1.5 bg-emerald-950 hover:bg-emerald-900 border border-emerald-600 text-emerald-200 font-bold rounded-xl text-xs flex items-center gap-1.5 transition-all cursor-pointer"
                        >
                          <RefreshCw className="w-3.5 h-3.5" /> ♻️ Restore Scroll
                        </button>
                      )}
                      {onPermanentDeleteRecycled && (
                        <button
                          onClick={() => {
                            if (confirm('Permanently delete this question scroll from storage?')) {
                              onPermanentDeleteRecycled([rq.question.id]);
                              triggerToast('🗑 Scroll Permanently Deleted.');
                            }
                          }}
                          className="px-2.5 py-1.5 bg-rose-950 hover:bg-rose-900 border border-rose-600 text-rose-300 font-bold rounded-xl text-xs flex items-center gap-1 transition-all cursor-pointer"
                          title="Permanently Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" /> Permanent Delete
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* TOAST NOTIFICATION */}
      {toastMessage && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] bg-[#1a1614] border-2 border-[#ffd700] text-[#ffd700] px-5 py-2.5 rounded-2xl shadow-2xl font-bold font-cinzel text-xs animate-in slide-in-from-top-4 flex items-center gap-2">
          <span>{toastMessage}</span>
        </div>
      )}

      {/* DELETE CONFIRMATION DIALOG MODAL */}
      {pendingDelete && (
        <div className="fixed inset-0 z-[90] bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-[#1a1614] border-4 border-rose-600 rounded-3xl max-w-md w-full p-6 text-[#f3e5ab] space-y-4 shadow-[0_0_50px_rgba(225,29,72,0.3)] relative">
            <div className="flex items-center gap-3 border-b border-[#8b7355]/40 pb-3">
              <div className="w-10 h-10 rounded-xl bg-rose-950 border border-rose-600 flex items-center justify-center text-xl text-rose-300 shrink-0">
                🗑
              </div>
              <div>
                <h3 className="text-base font-black font-cinzel text-rose-200 uppercase tracking-wider">
                  🗑 Delete Question Scroll
                </h3>
                <p className="text-[11px] text-[#8b7355]">Confirmation Required</p>
              </div>
            </div>

            <div className="space-y-3 text-xs font-serif leading-relaxed">
              <p className="text-[#e0d6c5]">
                Are you sure you want to permanently delete this Question Scroll from the Royal Question Archive?
              </p>

              <div className="p-3 bg-[#2a2420] border border-[#8b7355]/50 rounded-xl space-y-1">
                <span className="text-[10px] font-bold text-[#d4af37] uppercase tracking-wider block">
                  Question Scroll
                </span>
                <p className="font-bold italic text-[#f3e5ab] font-cinzel">
                  "{pendingDelete.question}"
                </p>
              </div>

              <div className="p-3 bg-amber-950/40 border border-amber-600/60 rounded-xl text-amber-200 text-[11px] space-y-1">
                <div className="font-bold flex items-center gap-1 text-amber-300">
                  <span>⚠️ Active Configuration Warning</span>
                </div>
                <p>
                  Deleting questions will move them to the Royal Recycle Bin. Active battle configurations will automatically adapt.
                </p>
              </div>

              <p className="text-[11px] text-stone-400 italic">
                This action can be restored from the Royal Recycle Bin if needed.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-[#8b7355]/30">
              <button
                onClick={() => setPendingDelete(null)}
                className="px-4 py-2 bg-[#2a2420] hover:bg-[#332b26] border border-[#8b7355] text-[#f3e5ab] font-bold rounded-xl text-xs transition-all cursor-pointer"
              >
                Cancel
              </button>

              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-rose-700 hover:bg-rose-600 text-white font-black font-cinzel text-xs uppercase tracking-wider rounded-xl shadow-lg hover:scale-105 transition-all cursor-pointer border border-rose-400"
              >
                Delete Scroll
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
