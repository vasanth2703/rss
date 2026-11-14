import React from 'react';
import { Newspaper, TrendingUp, Layers } from 'lucide-react';

interface ContentTypeFilterProps {
  selectedType: string;
  onSelectType: (type: string) => void;
  counts?: {
    total: number;
    news: number;
    trend: number;
  };
}

export const ContentTypeFilter: React.FC<ContentTypeFilterProps> = ({
  selectedType,
  onSelectType,
}) => {
  const options = [
    { id: 'all', label: 'All Items', icon: Layers },
    { id: 'news', label: 'News', icon: Newspaper },
    { id: 'trend', label: 'Trends', icon: TrendingUp },
  ];

  return (
    <div className="flex items-center gap-2 overflow-x-auto py-2 no-scrollbar">
      {options.map((opt) => {
        const Icon = opt.icon;
        const isActive = selectedType === opt.id;

        return (
          <button
            key={opt.id}
            onClick={() => onSelectType(opt.id)}
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium transition-all ${
              isActive
                ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 border border-transparent'
            }`}
          >
            <Icon className="w-3.5 h-3.5" />
            <span>{opt.label}</span>
          </button>
        );
      })}
    </div>
  );
};
