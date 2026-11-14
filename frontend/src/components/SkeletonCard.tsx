import React from 'react';

export const SkeletonCard: React.FC = () => {
  return (
    <div className="rounded-2xl p-5 sm:p-6 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 animate-pulse">
      {/* Category & Time pill */}
      <div className="flex items-center justify-between mb-4">
        <div className="h-5 w-24 bg-slate-200 dark:bg-slate-800 rounded-full" />
        <div className="h-4 w-16 bg-slate-200 dark:bg-slate-800 rounded" />
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-start">
        <div className="flex-1 w-full">
          {/* Headline skeleton */}
          <div className="h-6 w-5/6 bg-slate-200 dark:bg-slate-800 rounded mb-2" />
          <div className="h-6 w-2/3 bg-slate-200 dark:bg-slate-800 rounded mb-4" />

          {/* Description lines */}
          <div className="space-y-2 mb-4">
            <div className="h-4 w-full bg-slate-200 dark:bg-slate-800 rounded" />
            <div className="h-4 w-11/12 bg-slate-200 dark:bg-slate-800 rounded" />
            <div className="h-4 w-4/5 bg-slate-200 dark:bg-slate-800 rounded" />
          </div>

          {/* Footer info */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800/80">
            <div className="h-4 w-28 bg-slate-200 dark:bg-slate-800 rounded" />
            <div className="h-4 w-20 bg-slate-200 dark:bg-slate-800 rounded" />
          </div>
        </div>

        {/* Thumbnail skeleton */}
        <div className="w-full sm:w-44 h-40 sm:h-32 rounded-xl bg-slate-200 dark:bg-slate-800 flex-shrink-0" />
      </div>
    </div>
  );
};

