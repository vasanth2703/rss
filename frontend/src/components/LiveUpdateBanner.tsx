import React from 'react';
import { ArrowUp, Sparkles } from 'lucide-react';

interface LiveUpdateBannerProps {
  newCount: number;
  onApply: () => void;
}

export const LiveUpdateBanner: React.FC<LiveUpdateBannerProps> = ({ newCount, onApply }) => {
  if (newCount <= 0) return null;

  return (
    <div className="sticky top-20 z-20 flex justify-center mb-4 pointer-events-none animate-fade-in">
      <button
        onClick={onApply}
        className="pointer-events-auto inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-semibold shadow-lg shadow-emerald-500/25 border border-emerald-400/40 hover:scale-105 active:scale-95 transition-all duration-150 backdrop-blur-sm"
      >
        <Sparkles className="w-3.5 h-3.5 text-emerald-200 animate-pulse" />
        <span>
          {newCount === 1 ? '1 new article arrived' : `${newCount} new articles arrived`}
        </span>
        <span className="opacity-75">•</span>
        <span className="underline underline-offset-2 flex items-center gap-1">
          <span>Click to view</span>
          <ArrowUp className="w-3 h-3" />
        </span>
      </button>
    </div>
  );
};

