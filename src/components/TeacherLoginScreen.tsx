import React, { useState } from 'react';
import { TeacherUser, SyncStatus } from '../types';
import { Lock, Mail, Shield, Sparkles, CheckCircle2, AlertCircle, ArrowRight, Key, Globe } from 'lucide-react';

interface TeacherLoginScreenProps {
  teacherUser: TeacherUser | null;
  syncStatus: SyncStatus;
  onGoogleSignIn: () => void;
  onEmailLogin: (email: string, name: string) => void;
  onContinueAsGuest: () => void;
}

export const TeacherLoginScreen: React.FC<TeacherLoginScreenProps> = ({
  teacherUser,
  syncStatus,
  onGoogleSignIn,
  onEmailLogin,
  onContinueAsGuest,
}) => {
  const [email, setEmail] = useState('teacher@school.edu');
  const [password, setPassword] = useState('••••••••');
  const [teacherName, setTeacherName] = useState('Master Teacher');
  const [rememberMe, setRememberMe] = useState(true);
  const [forgotModal, setForgotModal] = useState(false);
  const [resetEmailSent, setResetEmailSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    onEmailLogin(email, teacherName || 'Royal Educator');
  };

  return (
    <div className="min-h-screen text-[#f3e5ab] font-cinzel flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Decor Torches */}
      <div className="absolute top-6 left-6 text-3xl animate-torch hidden sm:block">🔥</div>
      <div className="absolute top-6 right-6 text-3xl animate-torch hidden sm:block">🔥</div>

      <div className="relative z-10 max-w-md w-full bg-[#16100c]/80 backdrop-blur-md border-4 border-[#8b7355] rounded-3xl p-6 sm:p-8 shadow-[0_0_60px_rgba(212,175,55,0.4)] space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#120e0c] border border-[#d4af37] text-xs font-black text-[#d4af37] uppercase tracking-widest shadow-lg">
            <Lock className="w-3.5 h-3.5 text-[#d4af37]" /> Authenticated Educator Portal
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-[#f3e5ab] uppercase tracking-wider text-gold-engraved">
            Royal Teacher Login
          </h2>
          <p className="text-xs text-[#e0d6c5] font-serif italic">
            Access saved kingdom games, classroom question banks, and live battle logs.
          </p>
        </div>

        {/* Sync Status Badge */}
        <div className="p-3 bg-[#120e0c] rounded-2xl border border-[#8b7355]/60 flex items-center justify-between text-xs font-serif">
          <span className="text-[#8b7355] font-bold">Sheets Central Sync:</span>
          {syncStatus === 'synced' && (
            <span className="text-emerald-400 font-bold flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4" /> Connected & Synced
            </span>
          )}
          {syncStatus === 'syncing' && (
            <span className="text-amber-300 font-bold flex items-center gap-1 animate-pulse">
              <Globe className="w-4 h-4 animate-spin text-[#d4af37]" /> Syncing...
            </span>
          )}
          {(syncStatus === 'offline' || syncStatus === 'error') && (
            <span className="text-amber-400 font-bold flex items-center gap-1">
              <AlertCircle className="w-4 h-4 text-amber-400" /> Offline Mode Available
            </span>
          )}
        </div>

        {/* Email Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4 font-serif text-xs">
          <div className="space-y-1">
            <label className="font-bold text-[#d4af37] flex items-center gap-1.5 font-cinzel">
              <Mail className="w-3.5 h-3.5 text-[#d4af37]" /> Teacher Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full bg-[#120e0c] border border-[#8b7355] rounded-xl p-3 text-[#f3e5ab] focus:outline-none focus:border-[#d4af37]"
              placeholder="e.g. teacher@school.edu"
            />
          </div>

          <div className="space-y-1">
            <label className="font-bold text-[#d4af37] flex items-center gap-1.5 font-cinzel">
              <Shield className="w-3.5 h-3.5 text-[#d4af37]" /> Educator Display Name
            </label>
            <input
              type="text"
              value={teacherName}
              onChange={(e) => setTeacherName(e.target.value)}
              required
              className="w-full bg-[#120e0c] border border-[#8b7355] rounded-xl p-3 text-[#f3e5ab] focus:outline-none focus:border-[#d4af37]"
              placeholder="e.g. Professor Arthur"
            />
          </div>

          <div className="space-y-1">
            <label className="font-bold text-[#d4af37] flex items-center gap-1.5 font-cinzel">
              <Key className="w-3.5 h-3.5 text-[#d4af37]" /> Security Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full bg-[#120e0c] border border-[#8b7355] rounded-xl p-3 text-[#f3e5ab] focus:outline-none focus:border-[#d4af37]"
            />
          </div>

          <div className="flex items-center justify-between pt-1">
            <label className="flex items-center gap-2 cursor-pointer text-[#e0d6c5]">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="accent-[#d4af37] cursor-pointer"
              />
              <span>Remember Educator Session</span>
            </label>

            <button
              type="button"
              onClick={() => setForgotModal(true)}
              className="text-[#d4af37] hover:underline font-bold"
            >
              Forgot Password?
            </button>
          </div>

          <button
            type="submit"
            className="w-full py-3.5 bg-gradient-to-r from-[#d4af37] via-[#f3e5ab] to-[#d4af37] text-[#120e0c] font-black text-xs font-cinzel uppercase tracking-widest rounded-2xl border-2 border-[#f3e5ab] shadow-xl hover:scale-105 active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            Authenticate & Open Dashboard <ArrowRight className="w-4 h-4 text-[#120e0c]" />
          </button>
        </form>

        {/* Divider */}
        <div className="relative flex items-center justify-center my-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-[#8b7355]/40" />
          </div>
          <span className="relative px-3 bg-[#16100c] text-[10px] font-bold text-[#8b7355] uppercase font-serif">
            OR CONNECT VIA
          </span>
        </div>

        {/* Google Sign-In & Guest options */}
        <div className="space-y-2 font-cinzel">
          <button
            onClick={onGoogleSignIn}
            className="w-full py-3 bg-[#120e0c] hover:bg-[#1f1713] text-[#f3e5ab] font-bold text-xs rounded-2xl border border-[#d4af37] shadow-lg flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <span className="text-lg">🌐</span> Login with Google Account
          </button>

          <button
            onClick={onContinueAsGuest}
            className="w-full py-2.5 bg-transparent hover:bg-[#120e0c] text-[#8b7355] hover:text-[#f3e5ab] font-serif font-bold text-xs rounded-xl transition-all cursor-pointer"
          >
            Enter as Guest Educator (Local Sandbox Mode)
          </button>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {forgotModal && (
        <div className="fixed inset-0 z-50 bg-[#0c0908]/90 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#16100c] border-4 border-[#8b7355] rounded-3xl p-6 max-w-sm w-full space-y-4 text-center font-cinzel shadow-2xl">
            <div className="w-12 h-12 rounded-full bg-[#120e0c] border border-[#d4af37] mx-auto flex items-center justify-center text-2xl">
              🔑
            </div>
            <h3 className="text-lg font-black text-[#f3e5ab]">Reset Royal Password</h3>
            <p className="text-xs text-[#e0d6c5] font-serif">
              Enter your registered educator email address to receive password reset instructions.
            </p>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-[#120e0c] border border-[#8b7355] rounded-xl p-2.5 text-xs text-[#f3e5ab] font-serif"
            />
            {resetEmailSent ? (
              <p className="text-xs text-emerald-400 font-bold font-serif">
                ✨ Password reset link sent to {email}!
              </p>
            ) : (
              <button
                onClick={() => setResetEmailSent(true)}
                className="w-full py-2.5 bg-[#d4af37] text-[#120e0c] font-black rounded-xl text-xs uppercase"
              >
                Send Reset Link
              </button>
            )}
            <button
              onClick={() => {
                setForgotModal(false);
                setResetEmailSent(false);
              }}
              className="text-xs text-[#8b7355] underline font-serif block mx-auto"
            >
              Close Window
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
