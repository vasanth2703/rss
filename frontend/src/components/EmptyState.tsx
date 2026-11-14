import React from 'react';
import { Newspaper, RotateCcw } from 'lucide-react';

interface EmptyStateProps {
  onReset: () => void;
  hasFilters: boolean;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ onReset, hasFilters }) => {
  return (
    <div className="text-center py-16 px-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
      <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
        <Newspaper className="w-7 h-7" />
      </div>
      <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white mb-1">
        {hasFilters ? 'No matching logistics articles' : 'No feed items available yet'}
      </h3>
      <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm mx-auto mb-6">
        {hasFilters
          ? 'Try adjusting your search terms, selecting a different category, or switching content types.'
          : 'Once your n8n workflow or manual test runs, new logistics intelligence will appear here automatically.'}
      </p>
      {hasFilters && (
        <button
          onClick={onReset}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Reset Filters</span>
        </button>
      )}
    </div>
  );
};

