import React, { useState, useEffect } from 'react';
import { Question, RecycledQuestion } from '../types';
import { RoyalImportWizardModal } from './RoyalImportWizardModal';
import { sound } from '../lib/sound';
import {
  X,
  Plus,
  BookOpen,
  Search,
  Copy,
  Trash2,
  Edit,
  Eye,
  Download,
  Upload,
  Shuffle,
  CheckSquare,
  Square,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  Settings,
  Sword,
  BarChart2,
  Sparkles,
  RefreshCw,
  Save,
  ExternalLink,
} from 'lucide-react';

export const LOCAL_STORAGE_QUESTION_BANK_KEY = 'battle_of_kingdoms_royal_question_bank';

interface QuestionManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  questions: Question[];
  onAddQuestion: (q: Question) => void;
  onUpdateQuestion?: (q: Question) => void;
  onDeleteQuestion?: (id: string) => void;
  onDeleteQuestions?: (ids: string[]) => void;
  onSetQuestionsList?: (qs: Question[]) => void;
  onGenerateAIQuestions?: (topic: string) => Promise<Question[] | null>;
  onSelectCategory?: (category: string, newQuestions?: Question[]) => void;
  currentCategory: string;
  spreadsheetId?: string | null;
  spreadsheetUrl?: string | null;
  onSyncWithSheets?: () => void;
  onReloadFromSheets?: () => Promise<void>;
  recycledQuestions?: RecycledQuestion[];
  onRestoreRecycledQuestion?: (id: string) => void;
  onPermanentDeleteRecycled?: (ids: string[]) => void;
  onEmptyRecycleBin?: () => void;
}

export const QuestionManagerModal: React.FC<QuestionManagerModalProps> = ({
  isOpen,
  onClose,
  questions,
  onAddQuestion,
  onUpdateQuestion,
  onDeleteQuestion,
  onDeleteQuestions,
  onSetQuestionsList,
  currentCategory,
  spreadsheetId,
  spreadsheetUrl,
  onSyncWithSheets,
  onReloadFromSheets,
  recycledQuestions = [],
  onRestoreRecycledQuestion,
  onPermanentDeleteRecycled,
  onEmptyRecycleBin,
}) => {
  // Navigation State: 'bank' | 'add' | 'recycle'
  const [activeTab, setActiveTab] = useState<'bank' | 'add' | 'recycle'>('bank');
  const [isToolsOpen, setIsToolsOpen] = useState<boolean>(false);
  const [isImportWizardOpen, setIsImportWizardOpen] = useState<boolean>(false);

  // Delete Confirmation Dialog state
  const [pendingDelete, setPendingDelete] = useState<{
    type: 'single' | 'bulk';
    question?: Question;
    questions?: Question[];
  } | null>(null);

  // Toast notification state
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 4000);
  };

  // Search, Filters & Sorting
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [subjectFilter, setSubjectFilter] = useState<string>('All');
  const [gradeFilter, setGradeFilter] = useState<string>('All');
  const [difficultyFilter, setDifficultyFilter] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'default' | 'az' | 'subject'>('default');

  // Selection state for current active game or bulk operations
  const [selectedQuestionIds, setSelectedQuestionIds] = useState<Set<string>>(new Set());

  // Pagination state
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 8;

  // Expanded explanations toggle set
  const [expandedExplanations, setExpandedExplanations] = useState<Set<string>>(new Set());

  // Editing Question state
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);

  // Preview Modal state
  const [previewQuestion, setPreviewQuestion] = useState<Question | null>(null);

  // Form state
  const [formCategory, setFormCategory] = useState<string>('Custom Set');
  const [formQuestion, setFormQuestion] = useState<string>('');
  const [formOptions, setFormOptions] = useState<string[]>(['', '', '', '']);
  const [formCorrectIdx, setFormCorrectIdx] = useState<number>(0);
  const [formExplanation, setFormExplanation] = useState<string>('');
  const [formSubject, setFormSubject] = useState<string>('General Knowledge');
  const [formGrade, setFormGrade] = useState<string>('Middle School');
  const [formDifficulty, setFormDifficulty] = useState<string>('Knight (Medium)');

  // Sync selected IDs when questions array changes
  useEffect(() => {
    setSelectedQuestionIds(new Set(questions.map((q) => q.id)));
  }, [questions]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, subjectFilter, gradeFilter, difficultyFilter, sortBy]);

  if (!isOpen) return null;

  // Filter & Sort Questions
  const filteredQuestions = questions
    .filter((q) => {
      const matchesSearch =
        q.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        q.options.some((opt) => opt.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (q.category && q.category.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (q.subject && q.subject.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesSubject = subjectFilter === 'All' || q.subject === subjectFilter;
      const matchesGrade = gradeFilter === 'All' || q.gradeLevel === gradeFilter;
      const matchesDifficulty = difficultyFilter === 'All' || q.difficulty === difficultyFilter;

      return matchesSearch && matchesSubject && matchesGrade && matchesDifficulty;
    })
    .sort((a, b) => {
      if (sortBy === 'az') return a.question.localeCompare(b.question);
      if (sortBy === 'subject') return (a.subject || '').localeCompare(b.subject || '');
      return 0; // default order
    });

  // Pagination calculation
  const totalPages = Math.ceil(filteredQuestions.length / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedQuestions = filteredQuestions.slice(startIndex, startIndex + itemsPerPage);

  // Explanation toggle
  const toggleExplanation = (id: string) => {
    const next = new Set(expandedExplanations);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setExpandedExplanations(next);
  };

  // Selection handlers
  const toggleSelect = (id: string) => {
    const next = new Set(selectedQuestionIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedQuestionIds(next);
  };

  const handleSelectAllShown = () => {
    if (selectedQuestionIds.size === filteredQuestions.length) {
      setSelectedQuestionIds(new Set());
    } else {
      setSelectedQuestionIds(new Set(filteredQuestions.map((q) => q.id)));
    }
  };

  // Actions
  const handleApplySelectedToGame = () => {
    const selectedList = questions.filter((q) => selectedQuestionIds.has(q.id));
    if (selectedList.length === 0) {
      alert('Please select at least 1 question scroll for battle.');
      return;
    }
    if (onSetQuestionsList) {
      sound.playHarpFlourish();
      onSetQuestionsList(selectedList);
      alert(`Loaded ${selectedList.length} question scrolls into active battle deck!`);
      onClose();
    }
  };

  const handleDuplicateSelected = () => {
    const selectedList = questions.filter((q) => selectedQuestionIds.has(q.id));
    if (selectedList.length === 0) return;
    sound.playScoreTick(true);
    selectedList.forEach((q) => {
      const dup: Question = {
        ...q,
        id: `q-dup-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        question: `${q.question} (Copy)`,
      };
      onAddQuestion(dup);
    });
    alert(`Duplicated ${selectedList.length} question scrolls!`);
  };

  const handleDeleteSelected = () => {
    const selectedList = questions.filter((q) => selectedQuestionIds.has(q.id));
    if (selectedList.length === 0) return;
    sound.playScoreTick(true);
    setPendingDelete({
      type: 'bulk',
      questions: selectedList,
    });
  };

  const handleDeleteSingle = (id: string) => {
    const targetQ = questions.find((q) => q.id === id);
    if (!targetQ) return;
    sound.playScoreTick(true);
    setPendingDelete({
      type: 'single',
      question: targetQ,
    });
  };

  const confirmPendingDelete = () => {
    if (!pendingDelete) return;
    sound.playSwordSlash();

    if (pendingDelete.type === 'single' && pendingDelete.question) {
      if (onDeleteQuestion) onDeleteQuestion(pendingDelete.question.id);
      triggerToast('✅ Question Scroll Deleted Successfully.');
    } else if (pendingDelete.type === 'bulk' && pendingDelete.questions) {
      const ids = pendingDelete.questions.map((q) => q.id);
      if (onDeleteQuestions) {
        onDeleteQuestions(ids);
      } else if (onDeleteQuestion) {
        ids.forEach((id) => onDeleteQuestion(id));
      }
      setSelectedQuestionIds(new Set());
      triggerToast(`✅ ${ids.length} Question Scrolls Deleted Successfully.`);
    }

    setPendingDelete(null);
  };

  const handleStartEdit = (q: Question) => {
    sound.playScoreTick(true);
    setEditingQuestion(q);
    setFormQuestion(q.question);
    setFormOptions([...q.options]);
    setFormCorrectIdx(q.correctIndex);
    setFormExplanation(q.explanation || '');
    setFormCategory(q.category || 'Custom Set');
    setFormSubject(q.subject || 'General Knowledge');
    setFormGrade(q.gradeLevel || 'Middle School');
    setFormDifficulty(q.difficulty || 'Knight (Medium)');
    setActiveTab('add');
  };

  const handleDuplicateSingle = (q: Question) => {
    sound.playScoreTick(true);
    const dup: Question = {
      ...q,
      id: `q-dup-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      question: `${q.question} (Copy)`,
    };
    onAddQuestion(dup);
  };

  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formQuestion.trim() || formOptions.some((o) => !o.trim())) return;

    sound.playScoreTick(true);
    const qData: Question = {
      id: editingQuestion ? editingQuestion.id : `q-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      category: formCategory.trim() || 'Custom Bank',
      question: formQuestion.trim(),
      options: formOptions.map((o) => o.trim()),
      correctIndex: formCorrectIdx,
      explanation: formExplanation.trim() || undefined,
      subject: formSubject,
      gradeLevel: formGrade,
      difficulty: formDifficulty,
    };

    if (editingQuestion && onUpdateQuestion) {
      onUpdateQuestion(qData);
    } else {
      onAddQuestion(qData);
    }

    resetForm();
    setActiveTab('bank');
  };

  const resetForm = () => {
    setEditingQuestion(null);
    setFormQuestion('');
    setFormOptions(['', '', '', '']);
    setFormCorrectIdx(0);
    setFormExplanation('');
    setFormCategory('Custom Set');
    setFormSubject('General Knowledge');
    setFormGrade('Middle School');
    setFormDifficulty('Knight (Medium)');
  };

  // Export handlers
  const handleExportJSON = () => {
    sound.playScoreTick(true);
    const jsonStr = JSON.stringify(questions, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `royal_question_archive_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setIsToolsOpen(false);
  };

  const handleExportCSV = () => {
    sound.playScoreTick(true);
    let csv = 'Question,OptionA,OptionB,OptionC,OptionD,CorrectIndex,Category,Subject,GradeLevel,Difficulty,Explanation\n';
    questions.forEach((q) => {
      const escape = (str: string = '') => `"${str.replace(/"/g, '""')}"`;
      csv += `${escape(q.question)},${escape(q.options[0])},${escape(q.options[1])},${escape(q.options[2])},${escape(q.options[3])},${q.correctIndex},${escape(q.category)},${escape(q.subject)},${escape(q.gradeLevel)},${escape(q.difficulty)},${escape(q.explanation)}\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `royal_question_archive_${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    setIsToolsOpen(false);
  };

  const handleShuffleDeck = () => {
    sound.playScoreTick(true);
    if (onSetQuestionsList) {
      const shuffled = [...questions].sort(() => Math.random() - 0.5);
      onSetQuestionsList(shuffled);
      alert('Question scrolls shuffled successfully!');
    }
    setIsToolsOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#0c0908]/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-5 animate-in fade-in duration-200 font-serif">
      
      {/* Royal Library Backdrop Overlay - Visible through semi-transparent panels */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-950/25 via-stone-950/75 to-black pointer-events-none" />

      {/* Main Royal Modal Panel */}
      <div className="bg-[#1a130e]/90 border-4 border-[#8b7355] rounded-3xl max-w-[1500px] w-full max-h-[92vh] flex flex-col shadow-[0_0_60px_rgba(0,0,0,0.95)] relative text-[#f3e5ab] overflow-hidden z-10 backdrop-blur-sm">
        
        {/* HEADER: CLEAN & SIMPLE */}
        <div className="px-6 py-4 bg-[#120e0c]/85 border-b-2 border-[#8b7355] flex items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-[#d4af37] via-[#f3e5ab] to-[#8b7355] border-2 border-[#ffd700] flex items-center justify-center text-2xl text-[#120e0c] font-black shadow-xl shrink-0">
              📚
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black font-cinzel text-transparent bg-clip-text bg-gradient-to-r from-[#ffffff] via-[#ffd700] to-[#f3e5ab] tracking-wider uppercase drop-shadow">
                Royal Question Archive
              </h1>
              <p className="text-xs text-[#8b7355] font-serif italic">
                Manage and organize the kingdom's question scrolls.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2.5 rounded-2xl bg-[#120e0c] hover:bg-[#2a1c13] border border-[#8b7355] hover:border-[#d4af37] text-[#f3e5ab] transition-all cursor-pointer shadow"
            title="Return to Main Command"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* THREE PRIMARY TABS & TOOLBAR */}
        <div className="px-6 pt-3 bg-[#17110c]/80 border-b border-[#8b7355]/40 flex flex-wrap items-center justify-between gap-2 relative">
          <div className="flex items-center gap-2">
            {/* 📜 Question Scrolls Tab */}
            <button
              onClick={() => {
                setActiveTab('bank');
                resetForm();
              }}
              className={`px-4 py-2.5 text-xs font-black font-cinzel uppercase tracking-wider transition-all border-b-2 cursor-pointer flex items-center gap-2 ${
                activeTab === 'bank'
                  ? 'border-[#d4af37] text-[#f3e5ab] bg-[#120e0c]/90 rounded-t-xl'
                  : 'border-transparent text-[#8b7355] hover:text-[#f3e5ab]'
              }`}
            >
              <BookOpen className="w-4 h-4 text-[#d4af37]" />
              <span>📜 Question Scrolls ({filteredQuestions.length})</span>
            </button>

            {/* ✍️ Add Question Tab */}
            <button
              onClick={() => {
                setActiveTab('add');
                if (!editingQuestion) resetForm();
              }}
              className={`px-4 py-2.5 text-xs font-black font-cinzel uppercase tracking-wider transition-all border-b-2 cursor-pointer flex items-center gap-2 ${
                activeTab === 'add'
                  ? 'border-[#d4af37] text-[#f3e5ab] bg-[#120e0c]/90 rounded-t-xl'
                  : 'border-transparent text-[#8b7355] hover:text-[#f3e5ab]'
              }`}
            >
              <Plus className="w-4 h-4 text-[#d4af37]" />
              <span>✍️ {editingQuestion ? 'Edit Question' : 'Add Question'}</span>
            </button>

            {/* 🗑 Royal Recycle Bin Tab */}
            <button
              onClick={() => setActiveTab('recycle')}
              className={`px-4 py-2.5 text-xs font-black font-cinzel uppercase tracking-wider transition-all border-b-2 cursor-pointer flex items-center gap-2 ${
                activeTab === 'recycle'
                  ? 'border-[#d4af37] text-[#f3e5ab] bg-[#120e0c]/90 rounded-t-xl'
                  : 'border-transparent text-[#8b7355] hover:text-[#f3e5ab]'
              }`}
            >
              <Trash2 className="w-4 h-4 text-rose-400" />
              <span>🗑 Royal Recycle Bin ({recycledQuestions.length})</span>
            </button>

            {/* 📥 Import Questions Tab (Direct Modal Launcher) */}
            <button
              onClick={() => setIsImportWizardOpen(true)}
              className="px-4 py-2.5 text-xs font-black font-cinzel uppercase tracking-wider text-[#d4af37] hover:text-[#f3e5ab] hover:bg-[#120e0c]/90 rounded-t-xl transition-all cursor-pointer flex items-center gap-2"
            >
              <Upload className="w-4 h-4 text-[#d4af37]" />
              <span>📥 Import Questions</span>
            </button>
          </div>

          {/* Quick Action Tools & Google Sheets Controls */}
          <div className="flex items-center gap-2 pb-1">
            {onReloadFromSheets && (
              <button
                onClick={onReloadFromSheets}
                className="px-3 py-1.5 bg-[#8b7355]/30 hover:bg-[#8b7355]/60 border border-[#8b7355] text-xs font-bold text-[#f3e5ab] rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
                title="Reload questions from Google Sheets"
              >
                <RefreshCw className="w-3.5 h-3.5 text-[#d4af37]" />
                <span className="hidden sm:inline">Reload from Sheet</span>
              </button>
            )}

            {onSyncWithSheets && (
              <button
                onClick={onSyncWithSheets}
                className="px-3 py-1.5 bg-[#d4af37]/20 hover:bg-[#d4af37]/40 border border-[#d4af37] text-xs font-bold text-[#ffd700] rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
                title="Sync current questions to Google Sheets"
              >
                <Save className="w-3.5 h-3.5 text-[#ffd700]" />
                <span className="hidden sm:inline">Sync to Sheet</span>
              </button>
            )}

            {spreadsheetUrl && (
              <a
                href={spreadsheetUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 bg-emerald-950/60 hover:bg-emerald-900 border border-emerald-600 text-xs font-bold text-emerald-300 rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
                title="Open Google Sheet in new browser tab to edit questions directly"
              >
                <ExternalLink className="w-3.5 h-3.5 text-emerald-400" />
                <span className="hidden sm:inline">Edit in Sheet</span>
              </a>
            )}

            <button
              onClick={() => setIsToolsOpen(!isToolsOpen)}
              className="px-3.5 py-1.5 bg-[#120e0c] border border-[#8b7355] hover:border-[#d4af37] text-xs font-black font-cinzel text-[#d4af37] rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Settings className="w-4 h-4 text-[#d4af37]" />
              <span>⚙ Tools</span>
              <ChevronDown className="w-3.5 h-3.5" />
            </button>

            {isToolsOpen && (
              <div className="absolute top-full right-0 mt-1 w-52 bg-[#120e0c] border-2 border-[#8b7355] rounded-2xl shadow-2xl z-50 p-2 space-y-1 text-xs">
                <button
                  onClick={handleExportJSON}
                  className="w-full text-left px-3 py-2 hover:bg-[#2a1c13] rounded-xl text-[#f3e5ab] flex items-center gap-2 transition-all cursor-pointer font-serif"
                >
                  <Download className="w-4 h-4 text-[#d4af37]" /> Export JSON File
                </button>
                <button
                  onClick={handleExportCSV}
                  className="w-full text-left px-3 py-2 hover:bg-[#2a1c13] rounded-xl text-[#f3e5ab] flex items-center gap-2 transition-all cursor-pointer font-serif"
                >
                  <Download className="w-4 h-4 text-emerald-400" /> Export CSV File
                </button>
                <button
                  onClick={handleShuffleDeck}
                  className="w-full text-left px-3 py-2 hover:bg-[#2a1c13] rounded-xl text-[#f3e5ab] flex items-center gap-2 transition-all cursor-pointer font-serif"
                >
                  <Shuffle className="w-4 h-4 text-sky-400" /> Shuffle Scroll Order
                </button>
              </div>
            )}
          </div>
        </div>

        {/* WORKSPACE AREA */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          
          {/* TAB 1: 📜 QUESTION SCROLLS */}
          {activeTab === 'bank' && (
            <div className="space-y-3.5">
              
              {/* TOOLBAR: SEARCH & FILTER CONTROLS */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5 bg-[#120e0c]/85 p-3 rounded-2xl border border-[#8b7355]/60 text-xs shadow-inner">
                {/* 🔍 Search */}
                <div className="relative lg:col-span-1">
                  <Search className="w-4 h-4 text-[#8b7355] absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search Questions..."
                    className="w-full bg-[#1c1612] border border-[#8b7355] rounded-xl pl-9 pr-3 py-2 text-[#f3e5ab] focus:outline-none focus:border-[#d4af37]"
                  />
                </div>

                {/* Subject Dropdown */}
                <div>
                  <select
                    value={subjectFilter}
                    onChange={(e) => setSubjectFilter(e.target.value)}
                    className="w-full bg-[#1c1612] border border-[#8b7355] rounded-xl p-2 text-[#f3e5ab] focus:outline-none focus:border-[#d4af37]"
                  >
                    <option value="All">Subject ▼ (All)</option>
                    <option value="Biology">Biology</option>
                    <option value="Physics">Physics</option>
                    <option value="Chemistry">Chemistry</option>
                    <option value="Science">General Science</option>
                    <option value="Mathematics">Mathematics</option>
                    <option value="World History">World History</option>
                    <option value="Literature">Literature & Myth</option>
                    <option value="Geography">Geography</option>
                    <option value="General Knowledge">General Knowledge</option>
                  </select>
                </div>

                {/* Grade Dropdown */}
                <div>
                  <select
                    value={gradeFilter}
                    onChange={(e) => setGradeFilter(e.target.value)}
                    className="w-full bg-[#1c1612] border border-[#8b7355] rounded-xl p-2 text-[#f3e5ab] focus:outline-none focus:border-[#d4af37]"
                  >
                    <option value="All">Grade Level ▼ (All)</option>
                    <option value="Elementary">Elementary School</option>
                    <option value="Middle School">Middle School</option>
                    <option value="High School">High School</option>
                    <option value="Grade 7">Grade 7</option>
                    <option value="Grade 8">Grade 8</option>
                    <option value="Grade 9">Grade 9</option>
                    <option value="Grade 10">Grade 10</option>
                    <option value="Grade 11">Grade 11</option>
                    <option value="Grade 12">Grade 12</option>
                  </select>
                </div>

                {/* Difficulty Dropdown */}
                <div>
                  <select
                    value={difficultyFilter}
                    onChange={(e) => setDifficultyFilter(e.target.value)}
                    className="w-full bg-[#1c1612] border border-[#8b7355] rounded-xl p-2 text-[#f3e5ab] focus:outline-none focus:border-[#d4af37]"
                  >
                    <option value="All">Difficulty ▼ (All)</option>
                    <option value="Novice (Easy)">Novice (Easy)</option>
                    <option value="Apprentice (Medium)">Apprentice (Medium)</option>
                    <option value="Knight (Medium)">Knight (Medium)</option>
                    <option value="Master (Hard)">Master (Hard)</option>
                  </select>
                </div>

                {/* Sort Dropdown */}
                <div>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="w-full bg-[#1c1612] border border-[#8b7355] rounded-xl p-2 text-[#f3e5ab] focus:outline-none focus:border-[#d4af37]"
                  >
                    <option value="default">Sort ▼ (Default)</option>
                    <option value="az">Sort A–Z</option>
                    <option value="subject">Sort by Subject</option>
                  </select>
                </div>
              </div>

              {/* BULK ACTION BAR - ONLY DISPLAYED WHEN 1 OR MORE QUESTIONS ARE SELECTED */}
              {selectedQuestionIds.size > 0 && (
                <div className="flex flex-wrap items-center justify-between bg-[#120e0c]/90 p-2.5 rounded-xl border border-[#d4af37]/60 text-xs shadow-lg animate-in fade-in duration-150">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={handleSelectAllShown}
                      className="flex items-center gap-1.5 text-[#f3e5ab] hover:text-[#d4af37] font-bold cursor-pointer"
                    >
                      {selectedQuestionIds.size === filteredQuestions.length && filteredQuestions.length > 0 ? (
                        <CheckSquare className="w-4 h-4 text-[#d4af37]" />
                      ) : (
                        <Square className="w-4 h-4 text-[#8b7355]" />
                      )}
                      <span>Select All ({filteredQuestions.length})</span>
                    </button>
                    <span className="text-[#8b7355]">|</span>
                    <span className="text-[#d4af37] font-mono font-bold">
                      {selectedQuestionIds.size} Selected
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleApplySelectedToGame}
                      className="px-3.5 py-1.5 bg-gradient-to-r from-[#d4af37] via-[#f3e5ab] to-[#d4af37] text-[#120e0c] font-black font-cinzel text-xs uppercase tracking-wider rounded-xl shadow-lg hover:scale-105 cursor-pointer flex items-center gap-1.5"
                    >
                      <Sword className="w-3.5 h-3.5 text-[#120e0c]" /> ⚔️ Load into Battle
                    </button>

                    <button
                      onClick={handleExportCSV}
                      className="px-3 py-1.5 bg-[#1c1612] hover:bg-[#2a1c13] border border-[#8b7355] text-emerald-300 font-bold rounded-xl flex items-center gap-1 cursor-pointer transition-all text-[11px]"
                    >
                      <Download className="w-3.5 h-3.5" /> 📤 Export
                    </button>

                    <button
                      onClick={handleDuplicateSelected}
                      className="px-3 py-1.5 bg-[#1c1612] hover:bg-[#2a1c13] border border-[#8b7355] text-sky-300 font-bold rounded-xl flex items-center gap-1 cursor-pointer transition-all text-[11px]"
                    >
                      <Copy className="w-3.5 h-3.5" /> 📋 Duplicate
                    </button>

                    <button
                      onClick={handleDeleteSelected}
                      className="px-3 py-1.5 bg-rose-950/80 hover:bg-rose-900 border border-rose-600 text-rose-300 font-bold rounded-xl flex items-center gap-1 cursor-pointer transition-all text-[11px]"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> 🗑 Delete Selected
                    </button>
                  </div>
                </div>
              )}

              {/* COMPACT QUESTION CARDS LIST */}
              {paginatedQuestions.length === 0 ? (
                /* EMPTY STATE */
                <div className="p-10 text-center bg-[#120e0c]/85 rounded-2xl border-2 border-dashed border-[#8b7355]/40 space-y-4 max-w-lg mx-auto my-6">
                  <div className="w-16 h-16 mx-auto rounded-full bg-[#1c1612] border border-[#8b7355] flex items-center justify-center text-3xl text-[#d4af37] shadow-xl">
                    📜
                  </div>
                  <div className="space-y-1.5">
                    <h3 className="text-lg font-black font-cinzel text-[#f3e5ab]">
                      The Royal Library is Empty
                    </h3>
                    <p className="text-xs text-[#8b7355] italic leading-relaxed">
                      Create a new Question Scroll or import an existing collection to begin building your archive.
                    </p>
                  </div>
                  <div className="flex items-center justify-center gap-3 pt-2">
                    <button
                      onClick={() => setActiveTab('add')}
                      className="px-4 py-2 bg-gradient-to-r from-[#d4af37] to-[#f3e5ab] text-[#120e0c] font-black font-cinzel text-xs rounded-xl shadow hover:scale-105 transition-all cursor-pointer uppercase flex items-center gap-1.5"
                    >
                      <Plus className="w-4 h-4 text-[#120e0c]" /> ✍️ Add Question
                    </button>
                    <button
                      onClick={() => setIsImportWizardOpen(true)}
                      className="px-4 py-2 bg-[#1c1612] border border-[#8b7355] hover:border-[#d4af37] text-[#f3e5ab] font-black font-cinzel text-xs rounded-xl hover:scale-105 transition-all cursor-pointer uppercase flex items-center gap-1.5"
                    >
                      <Upload className="w-4 h-4 text-[#d4af37]" /> 📥 Import Questions
                    </button>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-2.5">
                  {paginatedQuestions.map((q, pIdx) => {
                    const globalIdx = startIndex + pIdx + 1;
                    const isSelected = selectedQuestionIds.has(q.id);
                    const isExplanationExpanded = expandedExplanations.has(q.id);

                    return (
                      <div
                        key={q.id || pIdx}
                        className={`p-3 rounded-2xl border transition-all space-y-2 ${
                          isSelected
                            ? 'bg-[#120e0c]/90 border-[#d4af37] shadow-[0_0_12px_rgba(212,175,55,0.12)]'
                            : 'bg-[#150f0b]/85 border-[#8b7355]/40 hover:border-[#8b7355]'
                        }`}
                      >
                        {/* Top Bar: Checkbox, Scroll #, 3 Badges, and Compact Icon Buttons */}
                        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#8b7355]/25 pb-1.5">
                          <div className="flex flex-wrap items-center gap-2">
                            <button
                              onClick={() => toggleSelect(q.id)}
                              className="text-[#d4af37] cursor-pointer"
                            >
                              {isSelected ? (
                                <CheckSquare className="w-4 h-4 text-[#d4af37]" />
                              ) : (
                                <Square className="w-4 h-4 text-[#8b7355]" />
                              )}
                            </button>

                            <span className="font-mono text-xs font-bold text-[#d4af37]">
                              📜 Scroll #{String(globalIdx).padStart(3, '0')}
                            </span>

                            {/* 3 Clean Metadata Badges */}
                            {q.subject && (
                              <span className="px-2 py-0.5 rounded bg-[#1c1612] border border-[#8b7355]/50 text-[10px] text-amber-300 font-bold">
                                📘 {q.subject}
                              </span>
                            )}
                            {q.gradeLevel && (
                              <span className="px-2 py-0.5 rounded bg-[#1c1612] border border-[#8b7355]/50 text-[10px] text-sky-300 font-bold">
                                🎓 {q.gradeLevel}
                              </span>
                            )}
                            {q.difficulty && (
                              <span className="px-2 py-0.5 rounded bg-[#1c1612] border border-[#8b7355]/50 text-[10px] text-emerald-300 font-bold">
                                ⭐ {q.difficulty.replace(/\s*\(.*\)/, '')}
                              </span>
                            )}
                          </div>

                          {/* Compact Action Buttons with icons and labels */}
                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              onClick={() => setPreviewQuestion(q)}
                              className="px-2 py-1 rounded-lg bg-[#1c1612] hover:bg-[#2a1c13] border border-[#8b7355] text-[#d4af37] text-[10px] font-bold cursor-pointer transition-all flex items-center gap-1"
                              title="Preview Question"
                            >
                              <Eye className="w-3.5 h-3.5" /> 👁 Preview
                            </button>
                            <button
                              onClick={() => handleStartEdit(q)}
                              className="px-2 py-1 rounded-lg bg-[#1c1612] hover:bg-[#2a1c13] border border-[#8b7355] text-amber-300 text-[10px] font-bold cursor-pointer transition-all flex items-center gap-1"
                              title="Edit Question"
                            >
                              <Edit className="w-3.5 h-3.5" /> ✏️ Edit
                            </button>
                            <button
                              onClick={() => handleDuplicateSingle(q)}
                              className="px-2 py-1 rounded-lg bg-[#1c1612] hover:bg-[#2a1c13] border border-[#8b7355] text-sky-300 text-[10px] font-bold cursor-pointer transition-all flex items-center gap-1"
                              title="Duplicate Question"
                            >
                              <Copy className="w-3.5 h-3.5" /> 📋 Duplicate
                            </button>
                            <button
                              onClick={() => handleDeleteSingle(q.id)}
                              className="px-2 py-1 rounded-lg bg-rose-950/80 hover:bg-rose-900 border border-rose-600 text-rose-300 text-[10px] font-bold cursor-pointer transition-all flex items-center gap-1"
                              title="Delete Question Scroll"
                            >
                              <Trash2 className="w-3.5 h-3.5" /> 🗑 Delete Scroll
                            </button>
                          </div>
                        </div>

                        {/* Question Text */}
                        <p className="font-bold text-xs sm:text-sm text-[#f3e5ab] font-cinzel leading-snug">
                          {q.question}
                        </p>

                        {/* Choices Grid - Clean Radio style with Gold Outline for Correct */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-xs font-serif">
                          {q.options.map((opt, oIdx) => {
                            const isCorrect = oIdx === q.correctIndex;
                            return (
                              <div
                                key={oIdx}
                                className={`px-2.5 py-1 rounded-xl border text-[11px] flex items-center justify-between ${
                                  isCorrect
                                    ? 'bg-[#1c1612] border-[#ffd700] text-[#ffd700] font-bold shadow-sm'
                                    : 'bg-[#1c1612]/50 border-[#8b7355]/30 text-[#e0d6c5]'
                                }`}
                              >
                                <span>
                                  <span className="mr-1.5 font-bold">
                                    {isCorrect ? '●' : '○'}
                                  </span>
                                  {opt}
                                </span>
                                {isCorrect && (
                                  <span className="text-[10px] font-mono text-[#ffd700] font-bold">
                                    ✓ Correct
                                  </span>
                                )}
                              </div>
                            );
                          })}
                        </div>

                        {/* Collapsible Explanation */}
                        {q.explanation && (
                          <div className="pt-0.5">
                            <button
                              onClick={() => toggleExplanation(q.id)}
                              className="text-[10px] text-[#8b7355] hover:text-[#d4af37] font-bold flex items-center gap-1 cursor-pointer"
                            >
                              {isExplanationExpanded ? (
                                <ChevronUp className="w-3 h-3 text-[#d4af37]" />
                              ) : (
                                <ChevronDown className="w-3 h-3 text-[#8b7355]" />
                              )}
                              <span>
                                {isExplanationExpanded ? '▲ Hide Explanation' : '▼ Show Explanation'}
                              </span>
                            </button>

                            {isExplanationExpanded && (
                              <div className="mt-1 p-2 bg-[#120e0c] rounded-xl border border-[#8b7355]/30 text-[11px] text-[#e0d6c5] italic">
                                <strong className="text-[#d4af37] not-italic">Explanation:</strong>{' '}
                                {q.explanation}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* PAGINATION CONTROLS */}
              {filteredQuestions.length > 0 && (
                <div className="pt-2 border-t border-[#8b7355]/30 flex flex-wrap items-center justify-between gap-3 text-xs font-serif">
                  <span className="text-[#8b7355]">
                    Showing <strong>{startIndex + 1}–{Math.min(startIndex + itemsPerPage, filteredQuestions.length)}</strong> of <strong>{filteredQuestions.length}</strong> Question Scrolls
                  </span>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="px-3 py-1 bg-[#120e0c] border border-[#8b7355] text-[#f3e5ab] rounded-xl hover:border-[#d4af37] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center gap-1 text-xs"
                    >
                      <ChevronLeft className="w-3.5 h-3.5" /> Previous
                    </button>

                    <div className="flex items-center gap-1 px-1 font-mono font-bold text-[#d4af37]">
                      {Array.from({ length: totalPages }).map((_, pageIdx) => {
                        const pageNum = pageIdx + 1;
                        if (
                          pageNum === 1 ||
                          pageNum === totalPages ||
                          (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)
                        ) {
                          return (
                            <button
                              key={pageNum}
                              onClick={() => setCurrentPage(pageNum)}
                              className={`w-6 h-6 rounded-lg border flex items-center justify-center text-[11px] cursor-pointer ${
                                currentPage === pageNum
                                  ? 'bg-[#d4af37] text-[#120e0c] font-black border-[#ffd700]'
                                  : 'bg-[#1c1612] border-[#8b7355] text-[#f3e5ab] hover:border-[#d4af37]'
                              }`}
                            >
                              {pageNum}
                            </button>
                          );
                        } else if (
                          pageNum === currentPage - 2 ||
                          pageNum === currentPage + 2
                        ) {
                          return (
                            <span key={pageNum} className="text-[#8b7355]">
                              ..
                            </span>
                          );
                        }
                        return null;
                      })}
                    </div>

                    <button
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className="px-3 py-1 bg-[#120e0c] border border-[#8b7355] text-[#f3e5ab] rounded-xl hover:border-[#d4af37] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center gap-1 text-xs"
                    >
                      Next <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: ✍ ADD / EDIT QUESTION FORM */}
          {activeTab === 'add' && (
            <form onSubmit={handleSaveForm} className="space-y-4 text-xs font-serif">
              <div className="p-5 bg-[#120e0c]/85 rounded-2xl border-2 border-[#d4af37] space-y-4 shadow-xl">
                <div className="flex items-center justify-between border-b border-[#8b7355]/40 pb-2">
                  <h3 className="font-black text-[#f3e5ab] font-cinzel text-sm uppercase">
                    {editingQuestion ? 'Edit Question Scroll' : 'Inscribe New Question Scroll'}
                  </h3>
                  {editingQuestion && (
                    <button
                      type="button"
                      onClick={resetForm}
                      className="text-xs text-[#d4af37] underline cursor-pointer"
                    >
                      Cancel Edit & Create New
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="font-bold text-[#d4af37] block mb-1">Subject Area:</label>
                    <select
                      value={formSubject}
                      onChange={(e) => setFormSubject(e.target.value)}
                      className="w-full bg-[#1c1612] border border-[#8b7355] rounded-xl p-2 text-[#f3e5ab]"
                    >
                      <option value="Biology">Biology</option>
                      <option value="Physics">Physics</option>
                      <option value="Chemistry">Chemistry</option>
                      <option value="Science">General Science</option>
                      <option value="Mathematics">Mathematics</option>
                      <option value="World History">World History</option>
                      <option value="Literature">Literature & Myth</option>
                      <option value="Geography">Geography</option>
                      <option value="General Knowledge">General Knowledge</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-bold text-[#d4af37] block mb-1">Grade Level:</label>
                    <select
                      value={formGrade}
                      onChange={(e) => setFormGrade(e.target.value)}
                      className="w-full bg-[#1c1612] border border-[#8b7355] rounded-xl p-2 text-[#f3e5ab]"
                    >
                      <option value="Elementary">Elementary School</option>
                      <option value="Middle School">Middle School</option>
                      <option value="High School">High School</option>
                      <option value="Grade 7">Grade 7</option>
                      <option value="Grade 8">Grade 8</option>
                      <option value="Grade 9">Grade 9</option>
                      <option value="Grade 10">Grade 10</option>
                      <option value="Grade 11">Grade 11</option>
                      <option value="Grade 12">Grade 12</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-bold text-[#d4af37] block mb-1">Difficulty:</label>
                    <select
                      value={formDifficulty}
                      onChange={(e) => setFormDifficulty(e.target.value)}
                      className="w-full bg-[#1c1612] border border-[#8b7355] rounded-xl p-2 text-[#f3e5ab]"
                    >
                      <option value="Novice (Easy)">Novice (Easy)</option>
                      <option value="Knight (Medium)">Knight (Medium)</option>
                      <option value="Master (Hard)">Master (Hard)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="font-bold text-[#d4af37] block mb-1">Question Statement:</label>
                  <textarea
                    value={formQuestion}
                    onChange={(e) => setFormQuestion(e.target.value)}
                    required
                    rows={2}
                    placeholder="Enter question statement here..."
                    className="w-full bg-[#1c1612] border border-[#8b7355] rounded-xl p-3 text-[#f3e5ab] focus:outline-none focus:border-[#d4af37]"
                  />
                </div>

                <div className="space-y-2">
                  <label className="font-bold text-[#d4af37] block">
                    Four Choices (Select radio button for the correct choice):
                  </label>
                  {formOptions.map((opt, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="correctIdxRadio"
                        checked={formCorrectIdx === idx}
                        onChange={() => setFormCorrectIdx(idx)}
                        className="accent-[#d4af37] w-4 h-4 cursor-pointer"
                      />
                      <span className="font-mono font-bold text-[#d4af37] w-6">
                        {String.fromCharCode(65 + idx)}.
                      </span>
                      <input
                        type="text"
                        value={opt}
                        onChange={(e) => {
                          const updated = [...formOptions];
                          updated[idx] = e.target.value;
                          setFormOptions(updated);
                        }}
                        required
                        placeholder={`Option ${String.fromCharCode(65 + idx)}`}
                        className="flex-1 bg-[#1c1612] border border-[#8b7355] rounded-xl p-2 text-[#f3e5ab] focus:outline-none focus:border-[#d4af37]"
                      />
                    </div>
                  ))}
                </div>

                <div>
                  <label className="font-bold text-[#d4af37] block mb-1">
                    Explanation / Commentary (Optional):
                  </label>
                  <input
                    type="text"
                    value={formExplanation}
                    onChange={(e) => setFormExplanation(e.target.value)}
                    placeholder="Educational background shown after student answers..."
                    className="w-full bg-[#1c1612] border border-[#8b7355] rounded-xl p-2.5 text-[#f3e5ab] focus:outline-none focus:border-[#d4af37]"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-gradient-to-r from-[#d4af37] via-[#f3e5ab] to-[#d4af37] text-[#120e0c] font-black rounded-xl text-xs font-cinzel tracking-widest uppercase transition-all hover:scale-[1.02] cursor-pointer shadow-xl"
                >
                  {editingQuestion ? 'Update Question Scroll' : 'Inscribe into Royal Archive'}
                </button>
              </div>
            </form>
          )}

          {/* TAB 3: ROYAL RECYCLE BIN */}
          {activeTab === 'recycle' && (
            <div className="space-y-4 max-w-5xl mx-auto my-4 font-sans text-xs">
              <div className="p-4 bg-[#120e0c]/90 border border-[#8b7355] rounded-2xl flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-rose-950/80 border border-rose-600 flex items-center justify-center text-xl text-rose-300">
                    🗑
                  </div>
                  <div>
                    <h3 className="font-bold font-cinzel text-[#f3e5ab] text-sm">
                      Royal Recycle Bin
                    </h3>
                    <p className="text-xs text-[#8b7355]">
                      {recycledQuestions.length} deleted question scrolls stored in temporary vault. Items can be restored anytime.
                    </p>
                  </div>
                </div>

                {recycledQuestions.length > 0 && onEmptyRecycleBin && (
                  <button
                    onClick={() => {
                      if (confirm('Are you sure you want to permanently empty the Royal Recycle Bin?')) {
                        sound.playSwordSlash();
                        onEmptyRecycleBin();
                        triggerToast('🗑 Royal Recycle Bin Emptied.');
                      }
                    }}
                    className="px-3.5 py-1.5 bg-rose-950/90 hover:bg-rose-900 border border-rose-600 text-rose-200 font-bold rounded-xl text-xs flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Empty Recycle Bin
                  </button>
                )}
              </div>

              {recycledQuestions.length === 0 ? (
                <div className="p-12 text-center bg-[#120e0c]/85 rounded-2xl border-2 border-dashed border-[#8b7355]/40 space-y-2">
                  <p className="text-sm font-bold text-[#f3e5ab]">The Recycle Bin is empty.</p>
                  <p className="text-xs text-[#8b7355] italic">No deleted question scrolls currently stored.</p>
                </div>
              ) : (
                <div className="space-y-2.5 max-h-[55vh] overflow-y-auto pr-1">
                  {recycledQuestions.map((rq) => (
                    <div
                      key={rq.question.id}
                      className="p-3.5 bg-[#150f0b]/90 border border-[#8b7355]/60 hover:border-[#d4af37] rounded-2xl space-y-2 transition-all flex flex-wrap items-center justify-between gap-3"
                    >
                      <div className="space-y-1 max-w-3xl">
                        <div className="flex items-center gap-2 text-[10px]">
                          <span className="px-2 py-0.5 rounded bg-amber-950/60 border border-amber-800 text-amber-300 font-bold">
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
                              sound.playScoreTick(true);
                              onRestoreRecycledQuestion(rq.question.id);
                              triggerToast('✅ Question Scroll Restored to Archive.');
                            }}
                            className="px-3 py-1.5 bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-600 text-emerald-200 font-bold rounded-xl text-xs flex items-center gap-1.5 transition-all cursor-pointer"
                          >
                            <RefreshCw className="w-3.5 h-3.5" /> ♻️ Restore Scroll
                          </button>
                        )}
                        {onPermanentDeleteRecycled && (
                          <button
                            onClick={() => {
                              if (confirm('Permanently delete this question scroll from storage?')) {
                                sound.playSwordSlash();
                                onPermanentDeleteRecycled([rq.question.id]);
                                triggerToast('🗑 Scroll Permanently Deleted.');
                              }
                            }}
                            className="px-2.5 py-1.5 bg-rose-950/60 hover:bg-rose-900 border border-rose-600 text-rose-300 font-bold rounded-xl text-xs flex items-center gap-1 transition-all cursor-pointer"
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
      </div>

      {/* SUCCESS TOAST NOTIFICATION */}
      {toastMessage && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] bg-[#120e0c] border-2 border-[#ffd700] text-[#ffd700] px-5 py-2.5 rounded-2xl shadow-2xl font-bold font-cinzel text-xs animate-in slide-in-from-top-4 flex items-center gap-2">
          <span>{toastMessage}</span>
        </div>
      )}

      {/* DELETE CONFIRMATION DIALOG MODAL */}
      {pendingDelete && (
        <div className="fixed inset-0 z-[90] bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-[#1a130e] border-4 border-rose-600 rounded-3xl max-w-md w-full p-6 text-[#f3e5ab] space-y-4 shadow-[0_0_50px_rgba(225,29,72,0.3)] relative">
            
            {/* Modal Header */}
            <div className="flex items-center gap-3 border-b border-[#8b7355]/40 pb-3">
              <div className="w-10 h-10 rounded-xl bg-rose-950 border border-rose-600 flex items-center justify-center text-xl text-rose-300 shrink-0">
                🗑
              </div>
              <div>
                <h3 className="text-base font-black font-cinzel text-rose-200 uppercase tracking-wider">
                  {pendingDelete.type === 'single'
                    ? '🗑 Delete Question Scroll'
                    : `Delete ${pendingDelete.questions?.length} Question Scrolls?`}
                </h3>
                <p className="text-[11px] text-[#8b7355]">Confirmation Required</p>
              </div>
            </div>

            {/* Description / Content */}
            <div className="space-y-3 text-xs font-serif leading-relaxed">
              {pendingDelete.type === 'single' ? (
                <>
                  <p className="text-[#e0d6c5]">
                    Are you sure you want to permanently delete this Question Scroll from the Royal Question Archive?
                  </p>
                  
                  <div className="p-3 bg-[#120e0c] border border-[#8b7355]/50 rounded-xl space-y-1">
                    <span className="text-[10px] font-bold text-[#d4af37] uppercase tracking-wider block">
                      Question Scroll
                    </span>
                    <p className="font-bold italic text-[#f3e5ab] font-cinzel">
                      "{pendingDelete.question?.question}"
                    </p>
                  </div>
                </>
              ) : (
                <p className="text-[#e0d6c5]">
                  You are about to permanently delete <strong className="text-rose-300 font-bold">{pendingDelete.questions?.length} Question Scrolls</strong> from the Royal Question Archive.
                </p>
              )}

              {/* Warning if linked to battle */}
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

            {/* Dialog Action Buttons */}
            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-[#8b7355]/30">
              <button
                onClick={() => setPendingDelete(null)}
                className="px-4 py-2 bg-[#120e0c] hover:bg-[#2a1c13] border border-[#8b7355] text-[#f3e5ab] font-bold rounded-xl text-xs transition-all cursor-pointer"
              >
                Cancel
              </button>

              <button
                onClick={confirmPendingDelete}
                className="px-4 py-2 bg-rose-700 hover:bg-rose-600 text-white font-black font-cinzel text-xs uppercase tracking-wider rounded-xl shadow-lg hover:scale-105 transition-all cursor-pointer border border-rose-400"
              >
                {pendingDelete.type === 'single' ? 'Delete Scroll' : 'Delete All'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PREVIEW QUESTION MODAL */}
      {previewQuestion && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-[#1c1612] border-4 border-[#ffd700] rounded-3xl max-w-lg w-full p-6 text-[#f3e5ab] space-y-4 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-[#8b7355] pb-2">
              <span className="text-xs font-mono font-bold text-[#d4af37]">
                📜 Question Scroll Preview
              </span>
              <button
                onClick={() => setPreviewQuestion(null)}
                className="text-[#8b7355] hover:text-[#f3e5ab]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex gap-2 text-[10px] font-bold">
              <span className="px-2 py-0.5 rounded bg-[#120e0c] border border-[#8b7355] text-amber-300">
                📘 {previewQuestion.subject || 'General Knowledge'}
              </span>
              <span className="px-2 py-0.5 rounded bg-[#120e0c] border border-[#8b7355] text-sky-300">
                🎓 {previewQuestion.gradeLevel || 'Middle School'}
              </span>
              <span className="px-2 py-0.5 rounded bg-[#120e0c] border border-[#8b7355] text-emerald-300">
                ⭐ {previewQuestion.difficulty || 'Knight (Medium)'}
              </span>
            </div>

            <h3 className="text-sm font-black font-cinzel text-[#ffffff]">
              {previewQuestion.question}
            </h3>

            <div className="space-y-1.5 text-xs font-serif">
              {previewQuestion.options.map((opt, oIdx) => {
                const isCorrect = oIdx === previewQuestion.correctIndex;
                return (
                  <div
                    key={oIdx}
                    className={`p-2 rounded-xl border flex items-center justify-between ${
                      isCorrect
                        ? 'bg-[#120e0c] border-[#ffd700] text-[#ffd700] font-bold'
                        : 'bg-[#120e0c]/40 border-[#8b7355]/30 text-[#e0d6c5]'
                    }`}
                  >
                    <span>
                      {String.fromCharCode(65 + oIdx)}. {opt}
                    </span>
                    {isCorrect && <span>✓ Correct</span>}
                  </div>
                );
              })}
            </div>

            {previewQuestion.explanation && (
              <div className="p-3 bg-[#120e0c] rounded-xl border border-[#8b7355]/40 text-xs italic text-[#e0d6c5]">
                <strong>Explanation:</strong> {previewQuestion.explanation}
              </div>
            )}

            <button
              onClick={() => setPreviewQuestion(null)}
              className="w-full py-2 bg-[#d4af37] text-[#120e0c] font-black font-cinzel text-xs uppercase tracking-wider rounded-xl cursor-pointer"
            >
              Close Preview
            </button>
          </div>
        </div>
      )}

      {/* ROYAL BULK IMPORT WIZARD MODAL */}
      <RoyalImportWizardModal
        isOpen={isImportWizardOpen}
        onClose={() => setIsImportWizardOpen(false)}
        onImportQuestions={(newQs) => {
          newQs.forEach((q) => onAddQuestion(q));
          setIsImportWizardOpen(false);
        }}
        existingQuestions={questions}
      />
    </div>
  );
};
