import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { CategoryNav } from './components/CategoryNav';
import { ContentTypeFilter } from './components/ContentTypeFilter';
import { FeedCard } from './components/FeedCard';
import { SkeletonCard } from './components/SkeletonCard';
import { EmptyState } from './components/EmptyState';
import { ErrorState } from './components/ErrorState';
import { TestModal } from './components/TestModal';
import { LiveUpdateBanner } from './components/LiveUpdateBanner';
import { CategoryOption, FeedItem } from './types/feed';
import { fetchFeed } from './utils/api';
import { useLiveFeedSync } from './utils/useLiveFeedSync';
import { Database, Zap, ArrowDownCircle } from 'lucide-react';

const CATEGORIES: CategoryOption[] = [
  'All',
  'Logistics',
  'Supply Chain',
  'AI & Robotics',
  'Warehousing',
  'Transportation',
  'Shipping',
  'India',
];

export const App: React.FC = () => {
  // Theme state
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('logipulse_theme');
    if (saved) return saved === 'dark';
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  // Filter & Search states
  const [selectedCategory, setSelectedCategory] = useState<CategoryOption>('All');
  const [selectedContentType, setSelectedContentType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [debouncedSearch, setDebouncedSearch] = useState<string>('');

  // Feed Data & Loading states
  const [feedItems, setFeedItems] = useState<FeedItem[]>([]);
  const [totalItems, setTotalItems] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const limit = 20;
  const [offset, setOffset] = useState<number>(0);
  const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);

  // Highest ID currently loaded in the feed (for real-time live sync)
  const highestId = feedItems.length > 0 ? Math.max(...feedItems.map((item) => item.id)) : 0;

  // Real-time synchronization hook (WebSocket + smart fallback polling)
  const { hasNewItems, newCount, isConnected, lastCheckedTime, resetNewItems } = useLiveFeedSync(highestId);

  // Test Ingestion Modal state
  const [isTestModalOpen, setIsTestModalOpen] = useState<boolean>(false);

  // Sync dark mode class on root document
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('logipulse_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('logipulse_theme', 'light');
    }
  }, [darkMode]);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setOffset(0); // Reset pagination on new search
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Reset pagination when category or content type changes
  const handleSelectCategory = (cat: CategoryOption) => {
    setSelectedCategory(cat);
    setOffset(0);
  };

  const handleSelectContentType = (type: string) => {
    setSelectedContentType(type);
    setOffset(0);
  };

  // Main Feed fetch function
  const loadFeed = useCallback(
    async (isManualRefresh = false, append = false) => {
      if (isManualRefresh) setIsRefreshing(true);
      if (!append) setIsLoading(true);
      setError(null);

      try {
        const response = await fetchFeed({
          category: selectedCategory,
          contentType: selectedContentType,
          search: debouncedSearch,
          limit,
          offset: append ? offset : 0,
        });

        if (append) {
          setFeedItems((prev) => [...prev, ...response.data]);
        } else {
          setFeedItems(response.data);
        }
        setTotalItems(response.total);
      } catch (err: any) {
        console.error('Failed to load feed:', err);
        setError(err.message || 'Could not connect to the Cloudflare Worker API. Please check your network or D1 setup.');
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
        setIsLoadingMore(false);
      }
    },
    [selectedCategory, selectedContentType, debouncedSearch, limit, offset]
  );

  // Trigger load when filters change
  useEffect(() => {
    loadFeed(false, false);
  }, [selectedCategory, selectedContentType, debouncedSearch]);

  // Load more pagination handler
  const handleLoadMore = async () => {
    const nextOffset = offset + limit;
    setOffset(nextOffset);
    setIsLoadingMore(true);

    try {
      const response = await fetchFeed({
        category: selectedCategory,
        contentType: selectedContentType,
        search: debouncedSearch,
        limit,
        offset: nextOffset,
      });

      setFeedItems((prev) => [...prev, ...response.data]);
      setTotalItems(response.total);
    } catch (err: any) {
      console.error('Failed to load more items:', err);
    } finally {
      setIsLoadingMore(false);
    }
  };

  const hasFilters = selectedCategory !== 'All' || selectedContentType !== 'all' || !!searchQuery.trim();

  const handleResetFilters = () => {
    setSelectedCategory('All');
    setSelectedContentType('all');
    setSearchQuery('');
    setOffset(0);
  };

  const handleApplyLiveUpdates = async () => {
    resetNewItems();
    await loadFeed(true, false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const hasMore = feedItems.length < totalItems;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      {/* Sticky Header */}
      <Header
        darkMode={darkMode}
        onToggleDarkMode={() => setDarkMode(!darkMode)}
        onRefresh={() => loadFeed(true, false)}
        isRefreshing={isRefreshing}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onOpenTestModal={() => setIsTestModalOpen(true)}
        isConnected={isConnected}
        lastCheckedTime={lastCheckedTime}
      />

      {/* Category Navigation Bar */}
      <CategoryNav
        categories={CATEGORIES}
        selectedCategory={selectedCategory}
        onSelectCategory={handleSelectCategory}
      />

      {/* Main Feed Container */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Real-time floating new articles banner */}
        <LiveUpdateBanner
          newCount={hasNewItems ? newCount : 0}
          onApply={handleApplyLiveUpdates}
        />

        {/* Sub-bar: Content Type Filters & Status Counter */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <ContentTypeFilter
            selectedType={selectedContentType}
            onSelectType={handleSelectContentType}
          />

          <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 font-medium">
            {!isLoading && (
              <span>
                Showing <strong className="text-slate-700 dark:text-slate-200">{feedItems.length}</strong> of{' '}
                <strong className="text-slate-700 dark:text-slate-200">{totalItems}</strong> items
              </span>
            )}
            <div className="hidden sm:inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-[11px] text-slate-600 dark:text-slate-400">
              <Database className="w-3 h-3 text-emerald-500" />
              <span>D1 Synced</span>
            </div>
          </div>
        </div>

        {/* Feed Cards List / Loading / Error / Empty States */}
        {isLoading ? (
          <div className="space-y-4">
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>
        ) : error ? (
          <ErrorState message={error} onRetry={() => loadFeed(true, false)} />
        ) : feedItems.length === 0 ? (
          <EmptyState onReset={handleResetFilters} hasFilters={hasFilters} />
        ) : (
          <div className="space-y-4">
            {feedItems.map((item) => (
              <FeedCard key={item.id} item={item} />
            ))}

            {/* Load More Button */}
            {hasMore && (
              <div className="pt-6 pb-4 text-center">
                <button
                  onClick={handleLoadMore}
                  disabled={isLoadingMore}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 shadow-xs transition-all disabled:opacity-50"
                >
                  {isLoadingMore ? (
                    <>
                      <div className="w-4 h-4 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                      <span>Loading more intelligence...</span>
                    </>
                  ) : (
                    <>
                      <ArrowDownCircle className="w-4 h-4 text-emerald-500" />
                      <span>Load more articles ({totalItems - feedItems.length} remaining)</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200/80 dark:border-slate-800/80 bg-white/40 dark:bg-slate-900/40 py-8 mt-12 transition-colors">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 dark:text-slate-400">
          <div>
            <span className="font-semibold text-slate-700 dark:text-slate-300">LogiPulse Engine</span>
            <span className="mx-2">•</span>
            <span>Automated Logistics & Supply Chain Content Pipeline</span>
          </div>

          <div className="flex items-center gap-4">
            <span className="inline-flex items-center gap-1">
              <Zap className="w-3.5 h-3.5 text-amber-500" />
              <span>Cloudflare Workers + D1</span>
            </span>
            <button
              onClick={() => setIsTestModalOpen(true)}
              className="hover:text-emerald-500 underline underline-offset-2"
            >
              Test Ingest API
            </button>
          </div>
        </div>
      </footer>

      {/* Interactive POST /api/feed Ingestion Modal */}
      <TestModal
        isOpen={isTestModalOpen}
        onClose={() => setIsTestModalOpen(false)}
        onSuccess={() => loadFeed(true, false)}
      />
    </div>
  );
};
