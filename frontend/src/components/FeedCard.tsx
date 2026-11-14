import React, { useState } from 'react';
import { ExternalLink, Sparkles, TrendingUp, Clock, Globe } from 'lucide-react';
import { FeedItem } from '../types/feed';
import { formatRelativeTime, formatFullDate } from '../utils/date';

interface FeedCardProps {
  item: FeedItem;
}

export const FeedCard: React.FC<FeedCardProps> = ({ item }) => {
  const [imageError, setImageError] = useState(false);
  const isAiInsight = item.content_type === 'ai_insight';
  const isTrend = item.content_type === 'trend';

  // Category badge color mapping
  const getCategoryColor = (category: string | null) => {
    const cat = (category || '').toLowerCase();
    if (cat.includes('ai') || cat.includes('robot')) {
      return 'bg-violet-100 text-violet-800 dark:bg-violet-950/70 dark:text-violet-300 border-violet-200 dark:border-violet-800/50';
    }
    if (cat.includes('warehouse')) {
      return 'bg-blue-100 text-blue-800 dark:bg-blue-950/70 dark:text-blue-300 border-blue-200 dark:border-blue-800/50';
    }
    if (cat.includes('ship') || cat.includes('ocean') || cat.includes('maritime')) {
      return 'bg-cyan-100 text-cyan-800 dark:bg-cyan-950/70 dark:text-cyan-300 border-cyan-200 dark:border-cyan-800/50';
    }
    if (cat.includes('india')) {
      return 'bg-orange-100 text-orange-800 dark:bg-orange-950/70 dark:text-orange-300 border-orange-200 dark:border-orange-800/50';
    }
    if (cat.includes('transport') || cat.includes('fleet') || cat.includes('freight')) {
      return 'bg-amber-100 text-amber-800 dark:bg-amber-950/70 dark:text-amber-300 border-amber-200 dark:border-amber-800/50';
    }
    return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/50';
  };

  return (
    <article
      className={`group relative rounded-2xl p-5 sm:p-6 transition-all duration-200 bg-white dark:bg-slate-900 border ${
        isAiInsight
          ? 'border-purple-200/90 dark:border-purple-800/60 shadow-sm hover:shadow-md hover:border-purple-300 dark:hover:border-purple-700'
          : isTrend
          ? 'border-amber-200/70 dark:border-amber-800/50 shadow-sm hover:shadow-md hover:border-amber-300 dark:hover:border-amber-700'
          : 'border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700'
      }`}
    >
      {/* Top Meta Bar: Category + AI Insight / Trend badges */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          {/* Category Badge */}
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wider uppercase border ${getCategoryColor(
              item.category
            )}`}
          >
            {item.category || 'Logistics'}
          </span>

          {/* AI Insight Visual Accent Badge */}
          {isAiInsight && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow-xs">
              <Sparkles className="w-3 h-3" />
              <span>AI Insight</span>
            </span>
          )}

          {/* Trend Badge */}
          {isTrend && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-500 text-white shadow-xs">
              <TrendingUp className="w-3 h-3" />
              <span>Market Trend</span>
            </span>
          )}
        </div>

        {/* Relative Publication Time */}
        <div
          className="flex items-center text-xs text-slate-500 dark:text-slate-400 gap-1 font-medium"
          title={formatFullDate(item.published_at)}
        >
          <Clock className="w-3.5 h-3.5 text-slate-400" />
          <span>{formatRelativeTime(item.published_at)}</span>
        </div>
      </div>

      {/* Main Content Layout (Flex: Text + Optional Image) */}
      <div className="flex flex-col sm:flex-row gap-4 items-start">
        <div className="flex-1 min-w-0">
          {/* Headline */}
          <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white leading-snug tracking-tight mb-2 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
            <a
              href={item.source_url}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:underline focus:outline-none focus:ring-2 focus:ring-emerald-500 rounded"
            >
              {item.title}
            </a>
          </h2>

          {/* Short Description */}
          {item.description && (
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed line-clamp-3 mb-4 font-normal">
              {item.description}
            </p>
          )}

          {/* Footer Metadata & Read Source Button */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100 dark:border-slate-800/80">
            {/* Source Information */}
            <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 font-medium">
              <Globe className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
              <span className="truncate max-w-[200px]">{item.source || 'Industry Source'}</span>
            </div>

            {/* Read Source Button with subtle external link icon */}
            <a
              href={item.source_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 group/btn transition-colors"
            >
              <span>Read source</span>
              <ExternalLink className="w-3.5 h-3.5 transition-transform group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5" />
            </a>
          </div>
        </div>

        {/* Optional Article Image */}
        {item.image_url && !imageError && (
          <div className="w-full sm:w-44 h-40 sm:h-32 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 flex-shrink-0 relative">
            <img
              src={item.image_url}
              alt={item.title}
              onError={() => setImageError(true)}
              loading="lazy"
              className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
            />
          </div>
        )}
      </div>
    </article>
  );
};

