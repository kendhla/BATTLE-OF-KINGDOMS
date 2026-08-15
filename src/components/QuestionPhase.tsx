import React, { useState, useEffect } from 'react';
import { Kingdom, Question } from '../types';
import { sound } from '../lib/sound';
import { CheckCircle2, XCircle, Sparkles, Scroll, AlertOctagon } from 'lucide-react';

interface QuestionPhaseProps {
  winningKingdom: Kingdom;
  question: Question;
  timerDuration: number;
  onQuestionAnswered: (isCorrect: boolean) => void;
}

export const QuestionPhase: React.FC<QuestionPhaseProps> = ({
  winningKingdom,
  question,
  timerDuration,
  onQuestionAnswered,
}) => {
  const [timeLeft, setTimeLeft] = useState<number>(timerDuration);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState<boolean>(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

  // Play scroll open sound on mount
  useEffect(() => {
    sound.playScrollOpen();
  }, []);

  // Timer Countdown
  useEffect(() => {
    if (isAnswered || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleTimeExpired();
          return 0;
        }
        if (prev <= 6 && prev > 1) {
          sound.playBellChime();
        } else if (prev <= 10) {
          sound.playTick();
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, isAnswered]);

  const handleTimeExpired = () => {
    if (isAnswered) return;
    setIsAnswered(true);
    setIsCorrect(false);
    sound.playChestUnlock(false);

    setTimeout(() => {
      onQuestionAnswered(false);
    }, 2800);
  };

  const handleOptionClick = (idx: number) => {
    if (isAnswered) return;
    setSelectedOption(idx);
    const correct = idx === question.correctIndex;
    setIsAnswered(true);
    setIsCorrect(correct);

    if (correct) {
      sound.playChestUnlock(true);
    } else {
      sound.playChestUnlock(false);
    }

    setTimeout(() => {
      onQuestionAnswered(correct);
    }, 2800);
  };

  const timerPercentage = (timeLeft / timerDuration) * 100;
  const isFinalFive = timeLeft > 0 && timeLeft <= 5 && !isAnswered;

  return (
    <div
      className={`fixed inset-0 z-50 bg-[#060403]/25 backdrop-blur-sm flex flex-col justify-between items-center p-2 sm:p-4 md:p-6 font-cinzel overflow-hidden select-none transition-all duration-300 ${
        isFinalFive ? 'animate-pulse' : ''
      }`}
    >
      {/* Background Atmosphere & Flickering Torches */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute inset-0 bg-radial from-[#2a1a10]/30 via-transparent to-[#080605]/40" />
        <div className={`absolute top-6 left-8 text-3xl sm:text-4xl ${isFinalFive ? 'animate-bounce filter drop-shadow-[0_0_25px_rgba(255,0,0,1)]' : 'animate-torch'}`}>🔥</div>
        <div className={`absolute top-6 right-8 text-3xl sm:text-4xl ${isFinalFive ? 'animate-bounce filter drop-shadow-[0_0_25px_rgba(255,0,0,1)]' : 'animate-torch'}`}>🔥</div>
        <div className="absolute bottom-10 left-12 text-sm text-amber-300/30 animate-particle">✨</div>
        <div className="absolute top-1/3 right-12 text-sm text-amber-300/30 animate-particle" style={{ animationDelay: '1.2s' }}>✨</div>
      </div>

      {/* TOP HEADER SECTION */}
      <div className="w-full max-w-6xl mx-auto text-center space-y-1.5 relative z-20 pt-1 shrink-0">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-[#f3e5ab] uppercase tracking-[0.25em] text-gold-engraved drop-shadow-[0_0_20px_rgba(255,215,0,0.8)]">
          📜 ROYAL QUESTION SCROLL
        </h1>
        
        {/* Goblet Champion Banner */}
        <div className="flex items-center justify-center gap-2 pt-0.5">
          <span className="text-xs font-bold text-[#8b7355] uppercase tracking-wider font-serif">Goblet Champion:</span>
          <div
            className={`px-4 py-1 rounded-full border-2 text-xs sm:text-sm font-black flex items-center gap-2 shadow-2xl bg-gradient-to-r ${winningKingdom.colorGradient} ${winningKingdom.borderColor} animate-pulse`}
          >
            <span className="text-lg sm:text-xl">{winningKingdom.bannerSymbol}</span>
            <span className="text-[#f3e5ab] font-cinzel tracking-wider">{winningKingdom.name}</span>
          </div>
        </div>
      </div>

      {/* GIANT ANCIENT PARCHMENT SCROLL (EXPANDED FOR MAXIMUM SCREEN IMPACT) */}
      <div className="relative w-full max-w-6xl mx-auto flex-1 my-3 bg-parchment text-amber-950 border-[6px] sm:border-8 border-[#5c4033] rounded-3xl p-5 sm:p-8 md:p-10 shadow-[0_25px_70px_rgba(0,0,0,0.95)] flex flex-col justify-between overflow-hidden animate-scroll-unfold z-20">
        {/* Burned Parchment Corners & Wax Seal */}
        <div className="absolute top-4 left-5 text-[#5c4033] opacity-40 font-medieval text-2xl">📜</div>
        <div className="absolute top-4 right-5 text-[#5c4033] opacity-40 font-medieval text-2xl">📜</div>

        {/* Feather Quill Accent */}
        <div className="absolute -top-2 right-16 text-4xl opacity-75 pointer-events-none rotate-12">
          🪶
        </div>

        {/* TOP SCROLL BAR: CATEGORY & EXPANDED MAGICAL HOURGLASS */}
        <div className="flex flex-wrap items-center justify-between border-b-2 border-[#5c4033]/30 pb-4 gap-4 shrink-0">
          <div className="flex items-center gap-2.5 text-[#5c4033] font-black">
            <Scroll className="w-6 h-6 text-[#8b0000]" />
            <span className="text-sm sm:text-base uppercase tracking-widest">{question.category}</span>
          </div>

          {/* Giant Hourglass Visual */}
          <div
            className={`flex items-center gap-4 px-6 py-2.5 rounded-2xl border-2 transition-all ${
              isFinalFive
                ? 'bg-rose-950 text-rose-200 border-rose-500 shadow-[0_0_35px_rgba(244,63,94,0.9)] animate-bounce'
                : 'bg-[#3d2a1d] text-[#f3e5ab] border-[#d4af37] shadow-xl'
            }`}
          >
            <div className="relative text-3xl sm:text-5xl flex items-center justify-center">
              <span>⌛</span>
              {/* Animated falling sand effect */}
              {timeLeft > 0 && !isAnswered && (
                <span className="absolute inset-0 flex items-center justify-center text-sm text-amber-300 animate-sand-fall pointer-events-none">
                  ⏳
                </span>
              )}
            </div>

            <div className="flex flex-col">
              <span className="text-xs font-bold uppercase tracking-widest opacity-90 font-serif">
                {isFinalFive ? '🔥 FINAL SECONDS!' : 'Magical Hourglass'}
              </span>
              <span className="font-mono text-3xl sm:text-4xl font-black text-[#f3e5ab]">
                {timeLeft <= 0 ? '0s' : `${timeLeft}s`}
              </span>
            </div>

            {/* Hourglass Sand Bar */}
            <div className="w-28 sm:w-44 h-4 bg-[#120e0c] rounded-full overflow-hidden border border-[#8b7355] ml-2 shadow-inner">
              <div
                className={`h-full transition-all duration-1000 ${
                  isFinalFive ? 'bg-rose-500 shadow-[0_0_15px_rgba(244,63,94,1)]' : 'bg-gradient-to-r from-amber-500 via-yellow-300 to-amber-500'
                }`}
                style={{ width: `${timerPercentage}%` }}
              />
            </div>
          </div>
        </div>

        {/* Time Expired Notice */}
        {timeLeft <= 0 && !selectedOption && (
          <div className="p-4 bg-rose-950 text-rose-200 border-2 border-rose-600 rounded-2xl text-center font-black animate-pulse flex items-center justify-center gap-2.5 my-2 shrink-0 text-base sm:text-lg">
            <AlertOctagon className="w-6 h-6 text-rose-400" />
            <span>⏳ Time Has Expired! The royal scroll closes.</span>
          </div>
        )}

        {/* QUESTION STATEMENT (CENTER FOCUS, EXPANDED SIZE) */}
        <div className="py-6 sm:py-8 flex-1 flex items-center justify-center">
          <h3 className="text-xl sm:text-3xl md:text-4xl font-black font-cinzel leading-relaxed text-[#2a1c13] text-center drop-shadow-sm italic max-w-5xl px-6">
            "{question.question}"
          </h3>
        </div>

        {/* CARVED MEDIEVAL WOODEN PLAQUE ANSWER CHOICES (EXPANDED & ROOMY) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 font-serif shrink-0 mb-2">
          {question.options.map((option, idx) => {
            const isSelected = selectedOption === idx;
            const isCorrectOption = idx === question.correctIndex;

            let plaqueStyle =
              'bg-gradient-to-r from-[#3d2a1d] via-[#2a1c13] to-[#3d2a1d] text-[#f3e5ab] border-[#d4af37] shadow-[0_8px_25px_rgba(0,0,0,0.6)]';

            if (isAnswered) {
              if (isCorrectOption) {
                plaqueStyle = 'bg-gradient-to-r from-emerald-900 via-emerald-800 to-emerald-900 text-white border-emerald-400 font-bold shadow-[0_0_35px_rgba(16,185,129,0.8)] scale-[1.02] ring-2 ring-emerald-300';
              } else if (isSelected && !isCorrectOption) {
                plaqueStyle = 'bg-gradient-to-r from-rose-950 via-rose-900 to-rose-950 text-rose-200 border-rose-600 font-bold shadow-[0_0_25px_rgba(244,63,94,0.6)]';
              } else {
                plaqueStyle = 'opacity-35 bg-[#1c120c] border-[#8b7355]/30 text-[#8b7355]';
              }
            }

            return (
              <button
                key={idx}
                onClick={() => handleOptionClick(idx)}
                disabled={isAnswered || timeLeft <= 0}
                className={`relative group p-5 sm:p-6 rounded-2xl border-2 text-left font-bold text-base sm:text-lg md:text-xl transition-all duration-300 flex items-center gap-4 sm:gap-5 overflow-hidden ${plaqueStyle} ${
                  !isAnswered && timeLeft > 0
                    ? 'hover:scale-[1.03] hover:-translate-y-1.5 hover:border-[#fff8dc] hover:shadow-[0_0_35px_rgba(255,215,0,0.7)] cursor-pointer'
                    : ''
                }`}
              >
                {/* Carved Wood Texture & Inner Golden Highlight */}
                <div className="absolute inset-0 bg-radial from-amber-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                
                {/* Hover Magical Sparkle */}
                {!isAnswered && timeLeft > 0 && (
                  <div className="absolute top-3 right-4 text-base opacity-0 group-hover:opacity-100 transition-all duration-300 transform group-hover:rotate-12 group-hover:scale-125 pointer-events-none text-amber-300">
                    ✨
                  </div>
                )}

                {/* Letter Emblem Badge */}
                <span className="w-10 sm:w-12 h-10 sm:h-12 rounded-full bg-[#120e0c] border-2 border-[#d4af37] flex items-center justify-center text-sm sm:text-base font-black font-cinzel shrink-0 text-[#ffd700] shadow-inner group-hover:scale-110 group-hover:bg-[#ffd700] group-hover:text-[#120e0c] transition-all">
                  {String.fromCharCode(65 + idx)}
                </span>
                
                <span className="flex-1 font-merriweather tracking-wide leading-snug py-1 relative z-10">
                  {option}
                </span>
              </button>
            );
          })}
        </div>

        {/* Explanation & Feedback Message */}
        {isAnswered && (
          <div
            className={`mt-4 p-4 sm:p-5 rounded-2xl border-2 text-center space-y-1.5 animate-in fade-in zoom-in duration-300 font-cinzel shrink-0 ${
              isCorrect
                ? 'bg-emerald-950/95 border-emerald-400 text-emerald-100 shadow-[0_0_40px_rgba(16,185,129,0.7)]'
                : 'bg-rose-950/95 border-rose-500 text-rose-100 shadow-[0_0_40px_rgba(244,63,94,0.7)]'
            }`}
          >
            <div className="flex items-center justify-center gap-2.5 font-black text-lg sm:text-xl">
              {isCorrect ? (
                <>
                  <CheckCircle2 className="w-7 h-7 text-emerald-400" />
                  CORRECT ANSWER! Prepare for Kingdom Conquest!
                </>
              ) : (
                <>
                  <XCircle className="w-7 h-7 text-rose-400" />
                  INCORRECT! Turn ends without an attack.
                </>
              )}
            </div>
            {question.explanation && (
              <p className="text-sm sm:text-base font-merriweather italic opacity-95">{question.explanation}</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

