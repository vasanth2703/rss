import React from 'react';
import { CategoryOption } from '../types/feed';

interface CategoryNavProps {
  categories: CategoryOption[];
  selectedCategory: CategoryOption;
  onSelectCategory: (category: CategoryOption) => void;
  counts?: Record<string, number>;
}

export const CategoryNav: React.FC<CategoryNavProps> = ({
  categories,
  selectedCategory,
  onSelectCategory,
}) => {
  return (
    <div className="w-full border-b border-slate-200/80 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav
          className="flex space-x-2 py-3 overflow-x-auto no-scrollbar scroll-smooth"
          aria-label="Categories"
        >
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => onSelectCategory(cat)}
                className={`flex-shrink-0 px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-semibold transition-all duration-150 select-none ${
                  isSelected
                    ? 'bg-slate-900 text-white dark:bg-emerald-500 dark:text-slate-950 shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700/80'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
};

