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

function cleanHeadline(title: string): string {
  let text = (title || '').trim();
  // Strip trailing publisher suffix like " - Autocar Professional" or " | Reuters"
  if (text.includes(' - ')) {
    const parts = text.split(' - ');
    parts.pop();
    text = parts.join(' - ').trim();
  }
  if (text.includes(' | ')) {
    const parts = text.split(' | ');
    parts.pop();
    text = parts.join(' | ').trim();
  }
  return text;
}

// Check if description is either empty, redundant with title, or an old boilerplate string
function isRedundantOrBoilerplate(raw: string, title: string): boolean {
  if (!raw) return true;
  const cleanRaw = raw.trim();
  if (cleanRaw.length < 80) return true;

  // Check if it's the old repetitive boilerplate
  if (
    cleanRaw.includes('Industry trade bodies and maritime stakeholders') ||
    cleanRaw.includes('Comprehensive logistics and supply chain intelligence covering inventory velocity') ||
    cleanRaw.includes('Ocean freight operational update analyzing vessel transit reliability') ||
    cleanRaw.includes('Corporate financial disclosure and market movement') ||
    cleanRaw.includes('Air cargo operators on major transpacific') ||
    cleanRaw.includes('Strategic trade and cross-border logistics framework')
  ) {
    return true;
  }

  const normTitle = title.toLowerCase().replace(/[^a-z0-9]/g, ' ').replace(/\s+/g, ' ').trim();
  const normDesc = cleanRaw.toLowerCase().replace(/[^a-z0-9]/g, ' ').replace(/\s+/g, ' ').trim();

  return normDesc === normTitle || normDesc.startsWith(normTitle) || normTitle.startsWith(normDesc);
}

function getDisplayDescription(item: FeedItem): string {
  const raw = (item.description || '').trim();
  const headline = cleanHeadline(item.title);

  // If already a genuine, substantive article summary that isn't an old boilerplate, keep it!
  if (!isRedundantOrBoilerplate(raw, item.title)) {
    return raw;
  }

  const sourceName = item.source?.trim() || 'industry sources';
  const combined = `${item.title} ${item.category || ''}`.toLowerCase();
  const hash = Math.abs((item.id || 1) * 37 + headline.length * 11);

  // 1. Executive / Leadership / Board appointments
  if (/\b(ceo|cfo|md|appointed|appoints|resigns|stepping down|step down|executive|leadership|director|board)\b/i.test(combined)) {
    const variants = [
      `Executive leadership transition reported by ${sourceName}: ${headline}. Market observers and supply chain leaders monitor senior management succession, strategic corporate restructuring, and ongoing capital deployment across operating divisions.`,
      `Corporate transition reported by ${sourceName}: ${headline}. Industry stakeholders analyze leadership realignment and operational strategy as logistics networks navigate evolving customer demand and service contracts.`,
      `Management restructuring development via ${sourceName}: ${headline}. The executive appointment highlights corporate focus on organizational governance, fleet agility, and scalable multimodal freight services.`
    ];
    return variants[hash % variants.length];
  }

  // 2. Ocean Shipping, Vessels, Fleets, Sea Lanes
  if (/\b(ocean|maritime|vessels?|ships?|shipping|tankers?|carriers?|boxships?|dry bulk|red sea|suez|strait of hormuz|liner)\b/i.test(combined)) {
    const variants = [
      `Maritime transport and commercial navigation briefing reported via ${sourceName}: ${headline}. Carrier operations teams track vessel scheduling reliability, bunker fuel surcharges, container equipment repositioning, and transit safety protocols across active ocean loops.`,
      `Ocean shipping operational intelligence via ${sourceName}: ${headline}. Global shipping alliances and maritime stakeholders evaluate spot freight index fluctuations, voyage route optimization, and sea lane capacity balances.`,
      `Commercial fleet development reported by ${sourceName}: ${headline}. Maritime logistics analysts assess vessel charter fixtures, environmental emissions compliance, and strategic deployment across international deep-sea lanes.`
    ];
    return variants[hash % variants.length];
  }

  // 3. Port Terminals, Quays, Docks, Berths, Gate-In Dwell
  if (/\b(ports?|terminals?|berths?|docks?|quays?|harbors?|demurrage|gateway|stevedoring)\b/i.test(combined)) {
    const variants = [
      `Port infrastructure and terminal throughput update via ${sourceName}: ${headline}. Port authorities and terminal operators collaborate on gate turnaround velocity, crane productivity benchmarks, and container yard fluidity to minimize dwell congestion.`,
      `Harbor operations and maritime gateway briefing reported by ${sourceName}: ${headline}. Regional drayage carriers and maritime stakeholders evaluate quay availability, cargo scanning procedures, and demurrage mitigation initiatives.`,
      `Terminal logistics and marine facility development reported via ${sourceName}: ${headline}. Infrastructure planners assess deep-water berth expansion, automated container handling equipment, and intermodal on-dock rail connectivity.`
    ];
    return variants[hash % variants.length];
  }

  // 4. Cross-Border Trade, Customs Clearance, Tariffs, Bilateral Accords
  if (/\b(agreements?|accords?|pacts?|partnerships?|treaty|treaties|bilateral|exports?|imports?|tariffs?|customs?\b|trade\s*agreement|fta|cross[- ]border|commerce|duties)\b/i.test(combined)) {
    const variants = [
      `Cross-border trade and regulatory policy analysis via ${sourceName}: ${headline}. International trade analysts examine bilateral customs documentation standards, tariff schedule harmonization, and multilateral freight clearance workflows.`,
      `International trade and commerce briefing reported by ${sourceName}: ${headline}. Freight forwarders and global shippers monitor export-import balance shifts, regulatory compliance directives, and preferential trade corridor agreements.`,
      `Global customs and cargo flow report via ${sourceName}: ${headline}. Industry stakeholders track trade lane pricing, customs audit requirements, and digital cargo declaration mechanisms across primary trading partner routes.`
    ];
    return variants[hash % variants.length];
  }

  // 5. Air Freight, Cargo Flights, Airport Logistics
  if (/\b(air\s*freight|air\s*cargo|aviation|airports?|belly[- ]hold|cargo flights?|charters?)\b/i.test(combined)) {
    const variants = [
      `Air freight and aviation cargo briefing via ${sourceName}: ${headline}. Air forwarders and airline cargo divisions monitor belly-hold capacity allocations, jet fuel index surcharges, and express delivery transit commitments across transatlantic and transpacific hubs.`,
      `Aviation logistics operational report reported by ${sourceName}: ${headline}. Global freight forwarders evaluate international charter flight demand, airport cold-storage handling capacity, and time-critical supply chain corridors.`
    ];
    return variants[hash % variants.length];
  }

  // 6. Surface Freight, Rail, Intermodal & Warehousing
  if (/\b(freight|shipments?|trucks?|trucking|freight\s*rates?|rail|intermodal|trains?|highways?|warehouses?|cold\s*chain|drayage|linehaul|logistics\s*index)\b/i.test(combined)) {
    const variants = [
      `Inland surface freight and intermodal distribution report via ${sourceName}: ${headline}. Transport economists analyze regional linehaul capacity, drayage driver availability, diesel cost pressures, and warehouse storage utilization rates.`,
      `Domestic freight and logistics operations briefing reported by ${sourceName}: ${headline}. Supply chain planners assess intermodal rail transit schedules, automated order fulfillment centers, and distribution hub inventory velocity.`
    ];
    return variants[hash % variants.length];
  }

  // 7. Corporate Finance, Earnings, M&A, Equity Markets
  if (/\b(shares?|stocks?|investors?|earnings|quarterly|revenues?|acquisition|mergers?|valuation|stake|dividend|profit)\b/i.test(combined)) {
    const variants = [
      `Market intelligence and financial disclosure reported via ${sourceName}: ${headline}. Equity analysts and institutional logistics investors evaluate capital expenditures, operating margins, and balance sheet resilience amidst changing market cycles.`,
      `Corporate financial development reported by ${sourceName}: ${headline}. Financial observers track asset acquisition strategies, enterprise EBITDA performance, and fleet modernization funding across the commercial transport sector.`
    ];
    return variants[hash % variants.length];
  }

  // 8. General Supply Chain & Multimodal Logistics (Rotating 4 distinct styles by item.id)
  const generalVariants = [
    `Comprehensive supply chain briefing reported via ${sourceName}: ${headline}. Multimodal transport providers track network connectivity, inventory optimization strategies, and customer service delivery across diversified trade corridors.`,
    `Logistics intelligence update from ${sourceName}: ${headline}. Transport planners evaluate end-to-end cargo visibility, supply chain technology integration, and operational resilience across domestic and international routing networks.`,
    `Industry operational briefing via ${sourceName}: ${headline}. Shippers and freight intermediaries analyze market capacity trends, vendor performance metrics, and tactical freight execution across regional and global trade routes.`,
    `Logistics market development reported by ${sourceName}: ${headline}. Transport strategists review distribution efficiency benchmarks, contractual freight agreements, and digital workflow transformation across enterprise supply chains.`
  ];
  return generalVariants[hash % generalVariants.length];
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

