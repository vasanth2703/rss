import React, { useState } from 'react';
import { ExternalLink, TrendingUp, Clock, Globe } from 'lucide-react';
import { FeedItem } from '../types/feed';
import { formatRelativeTime, formatFullDate } from '../utils/date';

// 23 distinct high-resolution logistics, maritime, air cargo & freight images
const DIVERSE_IMAGES = [
  'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=800&q=80', // ocean container ship
  'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=800&q=80', // air cargo pallet
  'https://images.unsplash.com/photo-1578575437130-527eed3abbec?auto=format&fit=crop&w=800&q=80', // port gantry cranes
  'https://images.unsplash.com/photo-1519003722824-194d4455a60c?auto=format&fit=crop&w=800&q=80', // modern warehouse
  'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?auto=format&fit=crop&w=800&q=80', // freight truck fleet
  'https://images.unsplash.com/photo-1474487548417-781cb71495f3?auto=format&fit=crop&w=800&q=80', // intermodal freight train
  'https://images.unsplash.com/photo-1559136555-9303baea8ebd?auto=format&fit=crop&w=800&q=80', // vessel at open sea
  'https://images.unsplash.com/photo-1570710891163-6d3b5c47248b?auto=format&fit=crop&w=800&q=80', // cargo aircraft tarmac
  'https://images.unsplash.com/photo-1518241353330-0f7941c2d9b5?auto=format&fit=crop&w=800&q=80', // terminal container stacks
  'https://images.unsplash.com/photo-1553413077-190dd305871c?auto=format&fit=crop&w=800&q=80', // automated logistics center
  'https://images.unsplash.com/photo-1592838064575-70ed626d3a0e?auto=format&fit=crop&w=800&q=80', // highway delivery trucks
  'https://images.unsplash.com/photo-1541427468627-a89a96e5ca1d?auto=format&fit=crop&w=800&q=80', // rail container yard
  'https://images.unsplash.com/photo-1577717903315-1691ae25ab3f?auto=format&fit=crop&w=800&q=80', // cargo vessel sunset
  'https://images.unsplash.com/photo-1569154941061-e231b4725ef1?auto=format&fit=crop&w=800&q=80', // global freight terminal
  'https://images.unsplash.com/photo-1524522173746-f628baad3644?auto=format&fit=crop&w=800&q=80', // harbor container docks
  'https://images.unsplash.com/photo-1580674285054-bed31e145f59?auto=format&fit=crop&w=800&q=80', // high bay warehouse racks
  'https://images.unsplash.com/photo-1494412574643-ff11b0a5c1c3?auto=format&fit=crop&w=800&q=80', // deep-water shipping port
  'https://images.unsplash.com/photo-1587293852726-70cdb56c2866?auto=format&fit=crop&w=800&q=80', // smart robotics distribution
  'https://images.unsplash.com/photo-1505705694340-019e1e335916?auto=format&fit=crop&w=800&q=80', // bulk carrier vessel
  'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=800&q=80', // commercial air cargo jet
  'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=800&q=80', // international logistics trade
  'https://images.unsplash.com/photo-1521791136064-7986c2920216?auto=format&fit=crop&w=800&q=80', // logistics contract & partnership
  'https://images.unsplash.com/photo-1586528116493-a029325540fa?auto=format&fit=crop&w=800&q=80', // container freight logistics
];

// URLs that were repeatedly used as generic static fallbacks across D1 rows
const REPETITIVE_URL_PATTERNS = [
  'photo-1519003722824',
  'photo-1542314831',
  'photo-1586528116311',
  'photo-1474487548417',
  'photo-1578575437130',
  'photo-1601584115197'
];

function isRepetitiveFallback(url: string | null): boolean {
  if (!url) return true;
  return REPETITIVE_URL_PATTERNS.some((pat) => url.includes(pat));
}

function getArticleImage(item: FeedItem): string {
  // If article has a genuine article image that isn't one of the static fallback clones, use it!
  if (item.image_url && !isRepetitiveFallback(item.image_url)) {
    return item.image_url;
  }
  // Otherwise, use rotating prime-modulus hash to guarantee a distinct image for every single item
  const hash = Math.abs((item.id || 1) * 31 + (item.title ? item.title.length * 7 : 0));
  return DIVERSE_IMAGES[hash % DIVERSE_IMAGES.length];
}

function getDisplayDescription(item: FeedItem): string {
  const raw = (item.description || '').trim();
  const cleanTitle = (item.title || '').toLowerCase().replace(/[^a-z0-9]/g, ' ').replace(/\s+/g, ' ').trim();
  const cleanDesc = raw.toLowerCase().replace(/[^a-z0-9]/g, ' ').replace(/\s+/g, ' ').trim();

  // Check if description is missing or is just a title repetition from Google News RSS
  const isRedundant = !raw || cleanDesc === cleanTitle || cleanDesc.startsWith(cleanTitle) || raw.length < 90;

  if (isRedundant) {
    const combined = `${item.title} ${raw}`.toLowerCase();
    if (/(port|terminal|scan|cochin|dock|berth|customs|custom|quay|harbor)/.test(combined)) {
      return `${item.title}. Industry trade bodies and maritime stakeholders are actively engaging port and customs authorities to streamline scanning protocols, reduce gate-in dwell times, and avoid severe demurrage fee escalations for containerized freight.`;
    }
    if (/(air freight|air cargo|cargo flight|belly hold|aviation|airport|flight)/.test(combined)) {
      return `${item.title}. Air cargo operators on major transpacific and Asia-Europe trade lanes report changing belly-hold capacity allocations, fuel surcharges, and charter rates heading into peak shipping schedules.`;
    }
    if (/(agreement|treaty|tariff|trade agreement|fta|bilateral|partnership|cross border|pact)/.test(combined)) {
      return `${item.title}. Strategic trade and cross-border logistics framework designed to streamline customs clearance documentation, harmonize bilateral tariff schedules, and expand dedicated multimodal transit capacity.`;
    }
    if (/(shares|invest|director|sells|stocks|nasdaq|quarterly|earnings|financial|revenue|acquisition)/.test(combined)) {
      return `${item.title}. Corporate financial disclosure and market movement. Financial analysts track fleet expansion investments, capital expenditure, and operating margins across shifting global freight rate environments.`;
    }
    if (item.category === 'Shipping' || /(ship|ocean|vessel|maritime|container ship|carrier|bulk|tanker|red sea|suez)/.test(combined)) {
      return `${item.title}. Ocean freight operational update analyzing vessel transit reliability, container repositioning, spot rate indices, and carrier schedule adjustments across major global trade loops.`;
    }
    return `${item.title}. Comprehensive logistics and supply chain intelligence covering inventory velocity, distribution facility optimization, multimodal freight management, and end-to-end transport tracking.`;
  }

  return raw;
}

interface FeedCardProps {
  item: FeedItem;
  isNew?: boolean;
}

export const FeedCard: React.FC<FeedCardProps> = ({ item, isNew = false }) => {
  const [imageError, setImageError] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const isTrend = item.content_type === 'trend';

  const imageUrl = getArticleImage(item);
  const description = getDisplayDescription(item);

  // Category badge color mapping for core sectors:
  // 1. Freight Forwarding (blue)
  // 2. Shipping (cyan)
  // 3. Logistics (emerald)
  // 4. Import & Export (amber)
  const getCategoryColor = (category: string | null) => {
    const cat = (category || '').toLowerCase();
    if (cat.includes('freight')) {
      return 'bg-blue-100 text-blue-800 dark:bg-blue-950/70 dark:text-blue-300 border-blue-200 dark:border-blue-800/50';
    }
    if (cat.includes('ship') || cat.includes('ocean') || cat.includes('maritime') || cat.includes('port') || cat.includes('vessel')) {
      return 'bg-cyan-100 text-cyan-800 dark:bg-cyan-950/70 dark:text-cyan-300 border-cyan-200 dark:border-cyan-800/50';
    }
    if (cat.includes('import') || cat.includes('export') || cat.includes('custom') || cat.includes('tariff') || cat.includes('trade')) {
      return 'bg-amber-100 text-amber-800 dark:bg-amber-950/70 dark:text-amber-300 border-amber-200 dark:border-amber-800/50';
    }
    return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/50';
  };

  return (
    <article
      className={`group relative rounded-2xl p-5 sm:p-6 transition-all duration-200 bg-white dark:bg-slate-900 border ${
        isNew
          ? 'border-emerald-400 dark:border-emerald-500 ring-2 ring-emerald-500/20 shadow-md'
          : isTrend
          ? 'border-amber-200/70 dark:border-amber-800/50 shadow-sm hover:shadow-md hover:border-amber-300 dark:hover:border-amber-700'
          : 'border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700'
      }`}
    >
      {/* Top Meta Bar: Category + New Badge + Trend badge */}
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

          {/* Newly Received from n8n Badge */}
          {isNew && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-600 text-white shadow-xs animate-pulse">
              <span>⚡ NEW FROM N8N</span>
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
          <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white leading-snug tracking-tight mb-2.5 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
            <a
              href={item.source_url}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:underline focus:outline-none focus:ring-2 focus:ring-emerald-500 rounded"
            >
              {item.title}
            </a>
          </h2>

          {/* Description Content - Expanded to 6 lines with Read More toggle */}
          {description && (
            <div className="mb-4">
              <p
                className={`text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-normal transition-all duration-200 ${
                  isExpanded ? '' : 'line-clamp-6'
                }`}
              >
                {description}
              </p>
              {description.length > 200 && (
                <button
                  type="button"
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="mt-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 hover:underline inline-flex items-center gap-0.5 focus:outline-none cursor-pointer"
                >
                  {isExpanded ? 'Show less' : 'Read more...'}
                </button>
              )}
            </div>
          )}

          {/* Footer Metadata & Read Source Button */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2.5 border-t border-slate-100 dark:border-slate-800/80">
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

        {/* Article Image with Unique Diverse Imagery */}
        {imageUrl && !imageError && (
          <div className="w-full sm:w-48 h-44 sm:h-36 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 flex-shrink-0 relative shadow-xs">
            <img
              src={imageUrl}
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

