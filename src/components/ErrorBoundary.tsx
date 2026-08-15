import React, { useState, useEffect } from 'react';

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

export const ErrorBoundary: React.FC<ErrorBoundaryProps> = ({ children }) => {
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      console.error('Captured window error:', event.error || event.message);
      setHasError(true);
      setErrorMessage(event.error?.message || event.message || 'An unexpected error occurred.');
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      console.error('Unhandled rejection:', event.reason);
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);

  if (hasError) {
    return (
      <div className="min-h-screen bg-[#120e0c] text-[#e0d6c5] flex flex-col items-center justify-center p-6 text-center font-serif">
        <div className="max-w-md p-6 rounded-2xl bg-[#1c140f] border-2 border-[#d4af37] shadow-[0_0_30px_rgba(212,175,55,0.4)] space-y-4">
          <div className="text-4xl">👑</div>
          <h1 className="text-2xl font-black font-cinzel text-[#ffd700] tracking-wide">
            The Kingdom Stumbled
          </h1>
          <p className="text-sm text-[#c8b79b]">
            A mystical disruption occurred while summoning the realm.
          </p>
          {errorMessage && (
            <pre className="p-3 bg-[#0d0907] border border-[#8b7355]/40 rounded text-left text-xs text-rose-300 font-mono overflow-x-auto max-h-32">
              {errorMessage}
            </pre>
          )}
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2 rounded-xl bg-gradient-to-r from-[#ffd700] via-[#fff8dc] to-[#ffd700] text-[#120e0c] font-black font-cinzel text-sm uppercase tracking-wider hover:scale-105 transition-transform cursor-pointer"
          >
            Re-enter Realm
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
