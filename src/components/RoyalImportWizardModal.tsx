import React, { useState, useEffect, useMemo } from 'react';
import { Question } from '../types';
import { sound } from '../lib/sound';
import {
  X,
  Upload,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Download,
  ArrowLeft,
  FileText,
  Sparkles,
  HelpCircle,
  BookOpen,
  Shield,
  Crown,
  RefreshCw,
  Info,
  Copy,
  Check,
} from 'lucide-react';

export interface RoyalImportWizardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportQuestions: (newQuestions: Question[]) => void;
  existingQuestions: Question[];
}

export interface ParsedQuestionItem {
  id: string;
  questionNumber: number;
  question: string;
  options: string[];
  correctIndex: number;
  correctAnswerText: string;
  explanation: string;
  subject: string;
  gradeLevel: string;
  difficulty: string;
  isValid: boolean;
  isDuplicate: boolean;
  missingAnswer: boolean;
  invalidFormat: boolean;
  issues: string[];
}

export const RoyalImportWizardModal: React.FC<RoyalImportWizardModalProps> = ({
  isOpen,
  onClose,
  onImportQuestions,
  existingQuestions,
}) => {
  // 1. Question Information State
  const [subject, setSubject] = useState<string>('Biology');
  const [gradeLevel, setGradeLevel] = useState<string>('Grade 11');
  const [difficulty, setDifficulty] = useState<string>('Knight (Medium)');

  // 2. Bulk Question Paste State
  const [rawScrollText, setRawScrollText] = useState<string>(
`Question: What is the powerhouse of the cell?

A. Nucleus
B. Mitochondria
C. Ribosome
D. Golgi Apparatus

Answer: B

Explanation: Mitochondria produce ATP.

-----

Question: Water boils at what temperature?

A. 50°C
B. 75°C
C. 100°C
D. 120°C

Answer: C

Explanation: Water boils at 100°C at sea level.

-----`
  );

  const [fileName, setFileName] = useState<string>('');
  const [isDragOver, setIsDragOver] = useState<boolean>(false);
  const [copiedFormat, setCopiedFormat] = useState<boolean>(false);

  // 3. Preview & Validation State
  const [parsedItems, setParsedItems] = useState<ParsedQuestionItem[]>([]);
  const [hasInspected, setHasInspected] = useState<boolean>(false);
  const [isInspecting, setIsInspecting] = useState<boolean>(false);
  const [previewFilter, setPreviewFilter] = useState<'all' | 'valid' | 'issues'>('all');

  // Success Modal State
  const [showSuccessModal, setShowSuccessModal] = useState<boolean>(false);
  const [importedCount, setImportedCount] = useState<number>(0);

  useEffect(() => {
    if (isOpen) {
      sound.playHarpFlourish();
    }
  }, [isOpen]);

  // Real-time simple delimiter detection count
  const detectedDelimiterCount = useMemo(() => {
    if (!rawScrollText.trim()) return 0;
    if (rawScrollText.includes('-----')) {
      return rawScrollText.split(/-----+/).filter((b) => b.trim().length > 0).length;
    }
    return rawScrollText.split(/\n\s*\n/).filter((b) => b.trim().length > 0).length;
  }, [rawScrollText]);

  if (!isOpen) return null;

  // Handle File Upload
  const handleFileUpload = (file: File) => {
    sound.playScoreTick(true);
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      if (content) {
        setRawScrollText(content);
        setHasInspected(false);
      }
    };
    reader.readAsText(file);
  };

  // Copy Format Helper
  const handleCopyFormatTemplate = () => {
    const template = `Question:

A.
B.
C.
D.

Answer:

Explanation:

Separate every question with:

-----`;
    navigator.clipboard.writeText(template);
    setCopiedFormat(true);
    sound.playScoreTick(true);
    setTimeout(() => setCopiedFormat(false), 2000);
  };

  // 4. Parse & Preview Questions Logic
  const handleParseAndPreview = () => {
    if (!rawScrollText.trim()) {
      alert('Please paste questions in the editor before parsing.');
      return;
    }

    if (!subject.trim()) {
      alert('Please enter a Subject (e.g., Biology, Mathematics) first.');
      return;
    }

    setIsInspecting(true);
    sound.playWarDrum();

    setTimeout(() => {
      const existingSet = new Set(
        existingQuestions.map((q) => q.question.trim().toLowerCase())
      );

      let blocks: string[] = [];
      const text = rawScrollText.trim();

      // Check if dashed delimiter is present
      if (text.includes('-----')) {
        blocks = text.split(/-----+/).map((b) => b.trim()).filter((b) => b.length > 0);
      } else {
        // Fallback split by double newlines
        blocks = text.split(/\n\s*\n/).map((b) => b.trim()).filter((b) => b.length > 0);
      }

      const results: ParsedQuestionItem[] = [];

      blocks.forEach((block, idx) => {
        const lines = block.split('\n').map((l) => l.trim()).filter((l) => l.length > 0);
        let qText = '';
        const opts: string[] = [];
        let ansKey = '';
        let expText = '';

        lines.forEach((line) => {
          if (/^(question|q\d*|item\d*):/i.test(line)) {
            qText = line.replace(/^(question|q\d*|item\d*):/i, '').trim();
          } else if (/^[a-e][\.\)]/i.test(line)) {
            opts.push(line.replace(/^[a-e][\.\)]/, '').trim());
          } else if (/^(answer|ans|correct answer|key):/i.test(line)) {
            ansKey = line.replace(/^(answer|ans|correct answer|key):/i, '').trim();
          } else if (/^(explanation|exp|note|commentary):/i.test(line)) {
            expText = line.replace(/^(explanation|exp|note|commentary):/i, '').trim();
          } else if (!qText) {
            qText = line;
          } else if (opts.length < 5 && !ansKey && !expText) {
            qText += ' ' + line;
          }
        });

        // Determine correct index from answer key
        let correctIdx = -1;
        const ansUpper = ansKey.trim().toUpperCase();
        if (ansUpper === 'A' || ansUpper === '1') correctIdx = 0;
        else if (ansUpper === 'B' || ansUpper === '2') correctIdx = 1;
        else if (ansUpper === 'C' || ansUpper === '3') correctIdx = 2;
        else if (ansUpper === 'D' || ansUpper === '4') correctIdx = 3;
        else if (ansUpper === 'E' || ansUpper === '5') correctIdx = 4;
        else if (ansKey) {
          const matchedIdx = opts.findIndex(
            (o) => o.toLowerCase() === ansKey.toLowerCase()
          );
          if (matchedIdx >= 0) correctIdx = matchedIdx;
        }

        const missingAnswer = !ansKey || correctIdx < 0 || correctIdx >= opts.length;
        const invalidFormat = !qText || qText.length < 3 || opts.length < 2;
        const isDuplicate = Boolean(qText && existingSet.has(qText.toLowerCase()));

        const issues: string[] = [];
        if (!qText || qText.length < 3) issues.push('Missing or incomplete question statement.');
        if (opts.length < 2) issues.push('Requires at least 2 choices (A, B, ...).');
        if (!ansKey) issues.push('Missing answer key (e.g., Answer: B).');
        else if (correctIdx < 0 || correctIdx >= opts.length)
          issues.push(`Answer key "${ansKey}" does not match options.`);
        if (isDuplicate) issues.push('Duplicate question already exists in archive.');

        const isValid = !missingAnswer && !invalidFormat;

        results.push({
          id: `parsed-${Date.now()}-${idx}`,
          questionNumber: idx + 1,
          question: qText || `Question #${idx + 1}`,
          options: opts.length > 0 ? opts : ['Option A', 'Option B'],
          correctIndex: correctIdx >= 0 ? correctIdx : 0,
          correctAnswerText: opts[correctIdx] || ansKey || 'Unresolved',
          explanation: expText,
          subject: subject.trim(),
          gradeLevel,
          difficulty,
          isValid,
          isDuplicate,
          missingAnswer,
          invalidFormat,
          issues,
        });
      });

      setParsedItems(results);
      setHasInspected(true);
      setIsInspecting(false);
      sound.playHarpFlourish();
    }, 300);
  };

  // Import into Royal Archive
  const handleImportToArchive = () => {
    const validQuestionsToImport = parsedItems.filter((i) => i.isValid);

    if (validQuestionsToImport.length === 0) {
      alert('No valid parsed questions ready to import.');
      return;
    }

    const newQuestions: Question[] = validQuestionsToImport.map((item, idx) => ({
      id: `q-royal-${Date.now()}-${idx}-${Math.random().toString(36).substring(2, 6)}`,
      category: 'Royal Archive',
      question: item.question,
      options: item.options,
      correctIndex: item.correctIndex,
      explanation: item.explanation || `Subject: ${subject} • ${gradeLevel} • ${difficulty}`,
      subject: item.subject || subject,
      gradeLevel: item.gradeLevel || gradeLevel,
      difficulty: item.difficulty || difficulty,
    }));

    onImportQuestions(newQuestions);
    setImportedCount(newQuestions.length);
    setShowSuccessModal(true);
    sound.playTheme('victory');
  };

  // Stats calculation
  const totalDetected = parsedItems.length;
  const validCount = parsedItems.filter((i) => i.isValid).length;
  const missingAnswersCount = parsedItems.filter((i) => i.missingAnswer).length;
  const invalidFormatCount = parsedItems.filter((i) => i.invalidFormat).length;
  const duplicateCount = parsedItems.filter((i) => i.isDuplicate).length;

  const filteredPreviewItems = parsedItems.filter((item) => {
    if (previewFilter === 'valid') return item.isValid;
    if (previewFilter === 'issues') return !item.isValid || item.isDuplicate;
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 font-serif">
      {/* Background Library Texture Overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-950/30 via-stone-950/80 to-black pointer-events-none" />

      <div className="bg-[#18120d] border-4 border-[#8b7355] rounded-3xl w-full max-w-[1550px] max-h-[96vh] flex flex-col shadow-[0_0_60px_rgba(0,0,0,0.95)] relative overflow-hidden text-[#e0d6c5] z-10">
        
        {/* HEADER */}
        <div className="px-6 py-4 bg-[#120e0c] border-b-2 border-[#8b7355] flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#d4af37] via-[#f3e5ab] to-[#8b7355] border-2 border-[#ffd700] flex items-center justify-center text-2xl text-[#120e0c] font-black shadow-xl shrink-0">
              📜
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black font-cinzel text-[#d4af37] tracking-widest uppercase px-2 py-0.5 rounded bg-[#1c1612] border border-[#8b7355]">
                  TEACHER WIZARD
                </span>
                <span className="text-[10px] font-bold text-amber-300 font-mono">
                  🏰 One Subject at a Time
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black font-cinzel text-transparent bg-clip-text bg-gradient-to-r from-[#ffffff] via-[#ffd700] to-[#f3e5ab] tracking-wider uppercase drop-shadow">
                ROYAL BULK QUESTION IMPORT WIZARD
              </h1>
              <p className="text-xs text-[#8b7355] font-serif italic">
                Effortless bulk import for teachers — Paste questions, format with <code className="text-[#f3e5ab]">-----</code>, parse & archive.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2.5 bg-[#1c1612] hover:bg-[#2a1c13] border border-[#8b7355] hover:border-[#d4af37] text-[#f3e5ab] rounded-2xl transition-all cursor-pointer shadow-lg"
            title="Cancel & Return"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* MAIN WIZARD BODY */}
        <div className="p-4 sm:p-5 flex-1 overflow-y-auto space-y-5">
          
          {/* STEP 1: QUESTION INFORMATION */}
          <div className="bg-[#120e0c]/90 border-2 border-[#8b7355] rounded-2xl p-4 shadow-xl space-y-3">
            <div className="flex items-center justify-between border-b border-[#8b7355]/40 pb-2">
              <h2 className="text-sm font-black font-cinzel text-[#f3e5ab] flex items-center gap-2 uppercase tracking-wide">
                <span className="w-6 h-6 rounded-full bg-[#d4af37] text-[#120e0c] font-black flex items-center justify-center text-xs">
                  1
                </span>
                Question Information
              </h2>
              <span className="text-[11px] text-[#8b7355] italic">
                Set common subject & level for this batch
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              {/* Subject (Text Input) */}
              <div className="space-y-1.5">
                <label className="font-bold font-cinzel text-[#d4af37] text-[11px] flex items-center justify-between">
                  <span>Subject <span className="text-rose-400">*</span></span>
                  <span className="text-[10px] text-[#8b7355] font-normal">(Typed manually)</span>
                </label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => {
                    setSubject(e.target.value);
                    setHasInspected(false);
                  }}
                  placeholder="e.g. Biology, Chemistry, Physics, Mathematics"
                  className="w-full bg-[#1c1612] border-2 border-[#8b7355] focus:border-[#d4af37] rounded-xl p-2.5 text-[#f3e5ab] font-bold text-xs focus:outline-none shadow-inner"
                />
              </div>

              {/* Grade Level (Dropdown) */}
              <div className="space-y-1.5">
                <label className="font-bold font-cinzel text-[#d4af37] text-[11px] block">
                  Grade Level
                </label>
                <select
                  value={gradeLevel}
                  onChange={(e) => {
                    setGradeLevel(e.target.value);
                    setHasInspected(false);
                  }}
                  className="w-full bg-[#1c1612] border-2 border-[#8b7355] focus:border-[#d4af37] rounded-xl p-2.5 text-[#f3e5ab] font-bold text-xs focus:outline-none cursor-pointer"
                >
                  <option value="Grade 7">Grade 7</option>
                  <option value="Grade 8">Grade 8</option>
                  <option value="Grade 9">Grade 9</option>
                  <option value="Grade 10">Grade 10</option>
                  <option value="Grade 11">Grade 11</option>
                  <option value="Grade 12">Grade 12</option>
                  <option value="Middle School">Middle School</option>
                  <option value="High School">High School</option>
                  <option value="College / University">College / University</option>
                </select>
              </div>

              {/* Difficulty (Dropdown) */}
              <div className="space-y-1.5">
                <label className="font-bold font-cinzel text-[#d4af37] text-[11px] block">
                  Difficulty
                </label>
                <select
                  value={difficulty}
                  onChange={(e) => {
                    setDifficulty(e.target.value);
                    setHasInspected(false);
                  }}
                  className="w-full bg-[#1c1612] border-2 border-[#8b7355] focus:border-[#d4af37] rounded-xl p-2.5 text-[#f3e5ab] font-bold text-xs focus:outline-none cursor-pointer"
                >
                  <option value="Apprentice (Easy)">Apprentice (Easy)</option>
                  <option value="Knight (Medium)">Knight (Medium)</option>
                  <option value="Master (Hard)">Master (Hard)</option>
                </select>
              </div>
            </div>
          </div>

          {/* TWO COLUMN GRID FOR STEP 2 (EDITOR) & STEP 3 (FORMAT GUIDE) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            
            {/* STEP 2: BULK QUESTION PASTE EDITOR (Col 7/12) */}
            <div className="lg:col-span-7 bg-[#2a1c13] border-4 border-[#8b7355] rounded-2xl p-4 shadow-2xl flex flex-col justify-between space-y-3">
              <div className="flex flex-wrap items-center justify-between border-b border-[#8b7355]/40 pb-2 gap-2">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-[#d4af37] text-[#120e0c] font-black flex items-center justify-center text-xs">
                    2
                  </span>
                  <h2 className="text-sm font-black font-cinzel text-[#f3e5ab] uppercase tracking-wide">
                    Bulk Question Paste
                  </h2>
                </div>

                <label className="px-3 py-1 bg-[#120e0c] hover:bg-[#1c1612] border border-[#8b7355] hover:border-[#d4af37] text-[#d4af37] font-bold font-cinzel text-[10px] rounded-xl cursor-pointer transition-all flex items-center gap-1.5">
                  <Upload className="w-3.5 h-3.5 text-[#d4af37]" />
                  <span>{fileName ? fileName : 'Upload Text File'}</span>
                  <input
                    type="file"
                    accept=".txt,.csv,.json"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        handleFileUpload(e.target.files[0]);
                      }
                    }}
                    className="hidden"
                  />
                </label>
              </div>

              {/* Parchment Textarea */}
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragOver(true);
                }}
                onDragLeave={() => setIsDragOver(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setIsDragOver(false);
                  if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                    handleFileUpload(e.dataTransfer.files[0]);
                  }
                }}
                className={`relative rounded-xl border-2 transition-all p-1 ${
                  isDragOver ? 'border-[#d4af37] bg-amber-950/40' : 'border-[#8b7355] bg-[#fdf6e2]'
                }`}
              >
                <textarea
                  value={rawScrollText}
                  onChange={(e) => {
                    setRawScrollText(e.target.value);
                    setHasInspected(false);
                  }}
                  rows={13}
                  placeholder="Paste questions here... Separate each question using -----"
                  className="w-full bg-[#fdf6e2] text-[#2b1f1d] font-mono text-xs p-3.5 focus:outline-none rounded-lg resize-y leading-relaxed shadow-inner"
                  style={{
                    backgroundImage: 'linear-gradient(rgba(139,115,85,0.08) 1px, transparent 1px)',
                    backgroundSize: '100% 1.5rem',
                  }}
                />
              </div>

              {/* Live Scanner Bar */}
              <div className="p-2.5 bg-[#120e0c] border border-[#8b7355] rounded-xl flex items-center justify-between text-xs font-mono text-[#d4af37]">
                <span className="text-[11px] font-bold">
                  Estimated Questions Detected: <strong className="text-emerald-400">{detectedDelimiterCount}</strong>
                </span>
                <span className="text-[10px] text-[#8b7355] italic">
                  Separated by <code className="bg-[#1c1612] px-1 py-0.5 rounded text-[#f3e5ab]">-----</code>
                </span>
              </div>
            </div>

            {/* STEP 3: FORMAT GUIDE (Col 5/12) */}
            <div className="lg:col-span-5 bg-[#120e0c]/90 border-2 border-[#8b7355] rounded-2xl p-4 shadow-xl flex flex-col justify-between space-y-3">
              <div className="flex items-center justify-between border-b border-[#8b7355]/40 pb-2">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-[#d4af37] text-[#120e0c] font-black flex items-center justify-center text-xs">
                    3
                  </span>
                  <h2 className="text-sm font-black font-cinzel text-[#f3e5ab] uppercase tracking-wide">
                    Format Guide
                  </h2>
                </div>

                <button
                  onClick={handleCopyFormatTemplate}
                  className="px-2.5 py-1 bg-[#1c1612] hover:bg-[#2a1c13] border border-[#8b7355] text-[#d4af37] rounded-lg text-[10px] font-mono flex items-center gap-1 transition-all cursor-pointer"
                >
                  {copiedFormat ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedFormat ? 'Copied Template!' : 'Copy Template'}</span>
                </button>
              </div>

              {/* Required Format Box */}
              <div className="bg-[#f8eed6] p-3.5 rounded-xl border-2 border-[#8b7355] text-[#2b1f1d] font-mono text-xs leading-relaxed space-y-2 shadow-inner">
                <p className="font-bold text-[#8b0000] border-b border-[#8b7355]/30 pb-1 font-serif">
                  📜 Required Format Pattern
                </p>

                <div className="bg-[#fffdf7] p-2.5 rounded-lg border border-[#8b7355]/40 text-[11px] space-y-1">
                  <p className="font-bold text-[#8b0000]">Question:</p>
                  <p className="pl-2">A.</p>
                  <p className="pl-2">B.</p>
                  <p className="pl-2">C.</p>
                  <p className="pl-2">D.</p>
                  <p className="font-bold text-[#059669]">Answer:</p>
                  <p className="italic text-[#4a3b32]">Explanation:</p>
                  <p className="pt-1 text-[#8b0000] font-bold">Separate every question with:</p>
                  <p className="font-bold text-[#b45309] bg-amber-100 px-2 py-0.5 rounded text-center">-----</p>
                </div>
              </div>

              {/* Quick Format Checklist */}
              <div className="p-3 bg-[#1c1612] border border-[#8b7355]/40 rounded-xl space-y-1.5 text-[11px] text-[#e0d6c5]">
                <div className="flex items-center gap-2 text-amber-300 font-bold">
                  <Info className="w-3.5 h-3.5 shrink-0" />
                  <span>Format Checklist Tips:</span>
                </div>
                <ul className="list-disc list-inside space-y-1 text-[#8b7355] italic pl-1">
                  <li>Options can start with A., B., C., D. or 1., 2., 3.</li>
                  <li>Answer key can be letter (e.g. B) or exact text.</li>
                  <li>Explanation is optional but recommended.</li>
                  <li>Always put <code className="text-[#f3e5ab]">-----</code> between questions.</li>
                </ul>
              </div>
            </div>
          </div>

          {/* STEP 4: PREVIEW & VALIDATION */}
          <div className="bg-[#120e0c]/90 border-2 border-[#8b7355] rounded-2xl p-4 shadow-xl space-y-3">
            <div className="flex flex-wrap items-center justify-between border-b border-[#8b7355]/40 pb-2.5 gap-2">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-[#d4af37] text-[#120e0c] font-black flex items-center justify-center text-xs">
                  4
                </span>
                <h2 className="text-sm font-black font-cinzel text-[#f3e5ab] uppercase tracking-wide">
                  Preview & Validation Audit
                </h2>
              </div>

              {hasInspected && (
                <div className="flex items-center gap-1 bg-[#1c1612] p-1 rounded-xl border border-[#8b7355]/40 text-[10px]">
                  <button
                    onClick={() => setPreviewFilter('all')}
                    className={`px-2.5 py-1 rounded-lg font-bold ${
                      previewFilter === 'all'
                        ? 'bg-[#d4af37] text-[#120e0c]'
                        : 'text-[#8b7355] hover:text-[#f3e5ab]'
                    }`}
                  >
                    All ({parsedItems.length})
                  </button>
                  <button
                    onClick={() => setPreviewFilter('valid')}
                    className={`px-2.5 py-1 rounded-lg font-bold ${
                      previewFilter === 'valid'
                        ? 'bg-emerald-600 text-white'
                        : 'text-[#8b7355] hover:text-emerald-300'
                    }`}
                  >
                    Valid ({validCount})
                  </button>
                  <button
                    onClick={() => setPreviewFilter('issues')}
                    className={`px-2.5 py-1 rounded-lg font-bold ${
                      previewFilter === 'issues'
                        ? 'bg-rose-600 text-white'
                        : 'text-[#8b7355] hover:text-rose-300'
                    }`}
                  >
                    Issues ({missingAnswersCount + invalidFormatCount + duplicateCount})
                  </button>
                </div>
              )}
            </div>

            {/* Validation Audit Metrics Dashboard */}
            {hasInspected ? (
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 text-xs font-mono">
                {/* Total Detected */}
                <div className="p-2.5 bg-[#1c1612] border border-[#8b7355] rounded-xl flex flex-col items-center justify-center text-center">
                  <span className="text-[10px] text-[#8b7355] uppercase font-bold">Detected</span>
                  <span className="text-lg font-black text-[#f3e5ab]">{totalDetected}</span>
                </div>

                {/* Valid Questions */}
                <div className="p-2.5 bg-emerald-950/60 border border-emerald-600/80 rounded-xl flex flex-col items-center justify-center text-center">
                  <span className="text-[10px] text-emerald-400 uppercase font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Valid
                  </span>
                  <span className="text-lg font-black text-emerald-300">{validCount}</span>
                </div>

                {/* Missing Answers */}
                <div className="p-2.5 bg-amber-950/60 border border-amber-600/80 rounded-xl flex flex-col items-center justify-center text-center">
                  <span className="text-[10px] text-amber-400 uppercase font-bold flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" /> Missing Ans
                  </span>
                  <span className="text-lg font-black text-amber-300">{missingAnswersCount}</span>
                </div>

                {/* Invalid Formatting */}
                <div className="p-2.5 bg-rose-950/60 border border-rose-600/80 rounded-xl flex flex-col items-center justify-center text-center">
                  <span className="text-[10px] text-rose-400 uppercase font-bold flex items-center gap-1">
                    <XCircle className="w-3 h-3" /> Invalid Format
                  </span>
                  <span className="text-lg font-black text-rose-300">{invalidFormatCount}</span>
                </div>

                {/* Duplicate Questions */}
                <div className="p-2.5 bg-purple-950/60 border border-purple-600/80 rounded-xl flex flex-col items-center justify-center text-center col-span-2 sm:col-span-1">
                  <span className="text-[10px] text-purple-300 uppercase font-bold flex items-center gap-1">
                    ⚠ Duplicate
                  </span>
                  <span className="text-lg font-black text-purple-200">{duplicateCount}</span>
                </div>
              </div>
            ) : (
              <div className="p-4 bg-[#1c1612] border border-[#8b7355]/40 rounded-xl text-center text-xs text-[#8b7355] italic">
                Click <strong>Parse & Preview Questions</strong> to run the validation audit and inspect detected questions.
              </div>
            )}

            {/* Scrollable Questions Preview Cards */}
            <div className="max-h-[260px] overflow-y-auto space-y-2.5 pr-1">
              {!hasInspected ? (
                <div className="border-2 border-dashed border-[#8b7355]/30 rounded-xl p-8 text-center space-y-2">
                  <BookOpen className="w-8 h-8 text-[#8b7355] mx-auto opacity-60" />
                  <p className="text-xs font-bold text-[#f3e5ab] font-cinzel">
                    Questions Preview Will Appear Here
                  </p>
                  <p className="text-[11px] text-[#8b7355] italic max-w-md mx-auto">
                    Fill in the subject, paste questions separated by <code className="text-[#f3e5ab]">-----</code>, then click Parse & Preview Questions.
                  </p>
                </div>
              ) : filteredPreviewItems.length === 0 ? (
                <div className="p-6 text-center text-xs text-[#8b7355] italic">
                  No parsed questions match the active filter criteria.
                </div>
              ) : (
                filteredPreviewItems.map((item) => (
                  <div
                    key={item.id}
                    className={`p-3.5 rounded-xl border transition-all text-xs space-y-2 ${
                      !item.isValid
                        ? 'bg-rose-950/40 border-rose-600/80 text-rose-100'
                        : item.isDuplicate
                        ? 'bg-amber-950/40 border-amber-600/80 text-amber-100'
                        : 'bg-parchment text-[#2b1f1d] border-[#8b7355]'
                    }`}
                  >
                    <div className="flex items-center justify-between border-b border-[#8b7355]/30 pb-1.5">
                      <div className="flex items-center gap-2">
                        <span className="font-black font-cinzel text-xs text-[#8b0000]">
                          Question #{item.questionNumber}
                        </span>
                        <span className="px-2 py-0.5 rounded bg-[#120e0c] text-[#f3e5ab] border border-[#8b7355] text-[9px] font-mono">
                          Subject: {item.subject}
                        </span>
                      </div>

                      {item.isValid && !item.isDuplicate ? (
                        <span className="px-2.5 py-0.5 rounded-full bg-emerald-800 text-emerald-100 text-[9px] font-bold flex items-center gap-1">
                          ✓ Valid
                        </span>
                      ) : item.isDuplicate ? (
                        <span className="px-2.5 py-0.5 rounded-full bg-amber-800 text-amber-100 text-[9px] font-bold flex items-center gap-1">
                          ⚠ Duplicate
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 rounded-full bg-rose-800 text-rose-100 text-[9px] font-bold flex items-center gap-1">
                          ✕ Invalid Format
                        </span>
                      )}
                    </div>

                    <p className="font-bold text-xs leading-relaxed">{item.question}</p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-[11px]">
                      {item.options.map((opt, oIdx) => {
                        const isCorrect = oIdx === item.correctIndex;
                        return (
                          <div
                            key={oIdx}
                            className={`p-1.5 rounded-lg border text-[10px] font-medium flex items-center justify-between ${
                              isCorrect
                                ? 'bg-emerald-900 text-emerald-100 border-emerald-500 font-bold'
                                : 'bg-[#120e0c]/10 border-[#8b7355]/40 text-[#3a281c]'
                            }`}
                          >
                            <span>
                              {String.fromCharCode(65 + oIdx)}. {opt}
                            </span>
                            {isCorrect && <span className="text-[9px] font-bold">✓ Correct</span>}
                          </div>
                        );
                      })}
                    </div>

                    {item.explanation && (
                      <p className="text-[10px] italic text-[#4a3b32] border-t border-[#8b7355]/30 pt-1">
                        💡 Explanation: {item.explanation}
                      </p>
                    )}

                    {item.issues.length > 0 && (
                      <div className="text-[10px] text-rose-300 font-bold space-y-0.5 border-t border-rose-500/30 pt-1">
                        {item.issues.map((iss, iIdx) => (
                          <p key={iIdx}>⚠ {iss}</p>
                        ))}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* BOTTOM BUTTONS BAR */}
        <div className="px-6 py-4 bg-[#120e0c] border-t-2 border-[#8b7355] flex flex-wrap items-center justify-between gap-3">
          {/* Cancel Button */}
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 bg-[#1c1612] hover:bg-[#2a1c13] text-[#e0d6c5] border border-[#8b7355] hover:border-[#d4af37] rounded-xl font-cinzel text-xs font-bold flex items-center gap-2 cursor-pointer transition-all shadow"
          >
            <ArrowLeft className="w-4 h-4 text-[#d4af37]" />
            <span>Cancel</span>
          </button>

          <div className="flex items-center gap-3">
            {/* Parse & Preview Questions Button */}
            <button
              type="button"
              onClick={handleParseAndPreview}
              disabled={isInspecting || !rawScrollText.trim() || !subject.trim()}
              className="px-6 py-2.5 bg-gradient-to-r from-[#8b7355] via-[#a0825c] to-[#8b7355] hover:from-[#d4af37] hover:to-[#f3e5ab] text-[#120e0c] font-black font-cinzel text-xs rounded-xl shadow-lg hover:scale-105 transition-all flex items-center gap-2 uppercase tracking-wider cursor-pointer disabled:opacity-50"
            >
              {isInspecting ? (
                <RefreshCw className="w-4 h-4 animate-spin text-[#120e0c]" />
              ) : (
                <Shield className="w-4 h-4 text-[#120e0c]" />
              )}
              <span>Parse & Preview Questions</span>
            </button>

            {/* Import into Royal Archive Button */}
            <button
              type="button"
              onClick={handleImportToArchive}
              disabled={!hasInspected || validCount === 0 || (invalidFormatCount > 0 || missingAnswersCount > 0)}
              className="px-6 py-2.5 bg-gradient-to-r from-[#d4af37] via-[#f3e5ab] to-[#d4af37] text-[#120e0c] font-black font-cinzel text-xs rounded-xl shadow-xl hover:scale-105 transition-all flex items-center gap-2 uppercase tracking-wider cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              title={
                !hasInspected
                  ? 'Click Parse & Preview Questions first'
                  : invalidFormatCount > 0 || missingAnswersCount > 0
                  ? 'Fix invalid formats or missing answers before importing'
                  : 'Import parsed questions into Royal Archive'
              }
            >
              <BookOpen className="w-4 h-4 text-[#120e0c]" />
              <span>Import into Royal Archive ({validCount})</span>
            </button>
          </div>
        </div>
      </div>

      {/* SUCCESS MODAL OVERLAY */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-[#1c1612] border-4 border-[#ffd700] rounded-3xl max-w-md w-full p-6 text-center space-y-4 relative shadow-[0_0_80px_rgba(212,175,55,0.8)] text-[#f3e5ab] font-serif">
            <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-tr from-[#d4af37] via-[#ffd700] to-[#f3e5ab] border-2 border-[#ffffff] flex items-center justify-center text-4xl shadow-2xl animate-bounce">
              🎺
            </div>

            <div className="space-y-1">
              <span className="text-[10px] font-black font-cinzel text-[#d4af37] tracking-widest uppercase">
                ROYAL DECREE
              </span>
              <h2 className="text-xl font-black font-cinzel text-transparent bg-clip-text bg-gradient-to-b from-[#ffffff] to-[#ffd700] uppercase tracking-wider">
                Questions Imported Successfully!
              </h2>
            </div>

            <p className="text-xs text-[#e0d6c5] italic leading-relaxed">
              <strong>{importedCount} questions</strong> for <strong>{subject}</strong> ({gradeLevel} • {difficulty}) have been successfully cataloged and archived into the Royal Question Archive!
            </p>

            <button
              onClick={() => {
                setShowSuccessModal(false);
                onClose();
              }}
              className="w-full py-3 bg-gradient-to-r from-[#d4af37] via-[#f3e5ab] to-[#d4af37] text-[#120e0c] font-black font-cinzel text-xs uppercase tracking-widest rounded-2xl shadow-xl hover:scale-105 transition-all cursor-pointer"
            >
              Return to Kingdom
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
