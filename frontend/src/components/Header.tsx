import React, { useState, useRef, useEffect } from 'react';
import { Search, RefreshCw, Sun, Moon, X, Bell, Clock, ArrowUp, ArrowUpRight } from 'lucide-react';
import { FeedItem } from '../types/feed';
import { formatRelativeTime } from '../utils/date';

interface HeaderProps {
  darkMode: boolean;
  onToggleDarkMode: () => void;
  onRefresh: () => void;
  isRefreshing: boolean;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  isConnected?: boolean;
  lastCheckedTime?: string;
  newArticles?: FeedItem[];
  newCount?: number;
  onViewNewArticles?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  darkMode,
  onToggleDarkMode,
  onRefresh,
  isRefreshing,
  searchQuery,
  onSearchChange,
  isConnected = true,
  lastCheckedTime,
  newArticles = [],
  newCount = 0,
  onViewNewArticles,
}) => {
  const [showSearchInput, setShowSearchInput] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const notificationRef = useRef<HTMLDivElement>(null);

  // Close notification popover on outside click or Escape key
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setIsNotificationOpen(false);
      }
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsNotificationOpen(false);
      }
    }

    if (isNotificationOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isNotificationOpen]);

  return (
    <header className="sticky top-0 z-30 bg-white/85 dark:bg-slate-900/85 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 transition-colors">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-3">
          {/* Brand Logo & Subtitle */}
          <div className="flex items-center gap-3 min-w-0">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-slate-900 to-slate-700 dark:from-emerald-500 dark:to-teal-400 flex items-center justify-center shadow-sm flex-shrink-0 text-white dark:text-slate-950 font-bold">
              <span className="text-xl tracking-tighter">LN</span>
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                  Live News <span className="text-emerald-600 dark:text-emerald-400">Testing</span>
                </span>
                <span
                  title={lastCheckedTime ? `Real-time sync active (Last checked: ${lastCheckedTime})` : 'Real-time D1 Sync Active'}
                  className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-semibold border ${
                    isConnected
                      ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border-emerald-200/50 dark:border-emerald-800/40'
                      : 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border-amber-200/50 dark:border-amber-800/40'
                  }`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`}></span>
                  <span>{isConnected ? 'LIVE SYNC' : 'OFFLINE'}</span>
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate font-medium">
                Freight Forwarding • Shipping • Logistics • Import &amp; Export
              </p>
            </div>
          </div>

          {/* Desktop Search Bar */}
          <div className="hidden md:flex flex-1 max-w-sm mx-4">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search freight, shipping, customs, tariffs..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full pl-9 pr-8 py-1.5 text-sm rounded-lg bg-slate-100 dark:bg-slate-800/80 border border-transparent focus:border-emerald-500 focus:bg-white dark:focus:bg-slate-900 text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => onSearchChange('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Mobile Search Toggle */}
            <button
              onClick={() => setShowSearchInput(!showSearchInput)}
              className="md:hidden p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              aria-label="Toggle search"
            >
              <Search className="w-4 h-4" />
            </button>

            {/* Notification Bell Icon Section */}
            <div className="relative" ref={notificationRef}>
              <button
                onClick={() => setIsNotificationOpen((prev) => !prev)}
                className={`relative p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors ${
                  isNotificationOpen ? 'bg-slate-100 dark:bg-slate-800 text-emerald-600 dark:text-emerald-400' : ''
                }`}
                title="Notifications: newly added news from n8n"
                aria-label="Notifications"
              >
                <Bell className={`w-4 h-4 ${newCount > 0 ? 'text-emerald-600 dark:text-emerald-400' : ''}`} />
                {newCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-[16px] items-center justify-center px-1 rounded-full bg-emerald-500 text-[10px] font-bold text-white shadow-sm ring-2 ring-white dark:ring-slate-900 animate-pulse">
                    {newCount > 99 ? '99+' : newCount}
                  </span>
                )}
              </button>

              {/* Notification Popover Dropdown */}
              {isNotificationOpen && (
                <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-900/10 z-50 overflow-hidden animate-fade-in">
                  {/* Dropdown Header */}
                  <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40">
                    <div className="flex items-center gap-2">
                      <Bell className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                        Live News Notifications
                      </span>
                      {newCount > 0 && (
                        <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300">
                          {newCount} new
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => setIsNotificationOpen(false)}
                      className="p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-700/50"
                      aria-label="Close notifications"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Dropdown Content */}
                  <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/50">
                    {newArticles && newArticles.length > 0 ? (
                      newArticles.slice(0, 10).map((article) => (
                        <div
                          key={article.id}
                          onClick={() => {
                            if (onViewNewArticles) onViewNewArticles();
                            setIsNotificationOpen(false);
                          }}
                          className="p-3.5 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors cursor-pointer group"
                        >
                          <div className="flex items-center justify-between gap-2 mb-1.5">
                            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                              {article.category || 'News'}
                            </span>
                            <span className="text-[11px] text-slate-400 flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              <span>{formatRelativeTime(article.published_at)}</span>
                            </span>
                          </div>
                          <h4 className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors line-clamp-2 leading-snug">
                            {article.title}
                          </h4>
                          <div className="flex items-center justify-between mt-2 text-[11px] text-slate-400">
                            <span className="truncate max-w-[180px]">{article.source || 'n8n pipeline'}</span>
                            <span className="text-emerald-600 dark:text-emerald-400 font-medium inline-flex items-center gap-0.5">
                              <span>Show in feed</span>
                              <ArrowUpRight className="w-3 h-3" />
                            </span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="py-8 px-4 text-center">
                        <div className="w-10 h-10 mx-auto rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 mb-2">
                          <Bell className="w-5 h-5" />
                        </div>
                        <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">All caught up!</p>
                        <p className="text-[11px] text-slate-400 mt-1 max-w-[200px] mx-auto">
                          Newly ingested news from the n8n pipeline will appear here in real-time.
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Dropdown Footer */}
                  {newArticles && newArticles.length > 0 && (
                    <div className="p-2.5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
                      <button
                        onClick={() => {
                          if (onViewNewArticles) onViewNewArticles();
                          setIsNotificationOpen(false);
                        }}
                        className="w-full py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-xs cursor-pointer"
                      >
                        <span>Display all {newCount} new {newCount === 1 ? 'article' : 'articles'} at top</span>
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Refresh Button */}
            <button
              onClick={onRefresh}
              disabled={isRefreshing}
              className={`p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors ${
                isRefreshing ? 'opacity-70' : ''
              }`}
              title="Refresh feed"
              aria-label="Refresh feed"
            >
              <RefreshCw
                className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-emerald-600 dark:text-emerald-400' : ''}`}
              />
            </button>

            {/* Dark/Light Mode Toggle */}
            <button
              onClick={onToggleDarkMode}
              className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              aria-label="Toggle theme"
            >
              {darkMode ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-slate-600" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Search Input Expanded */}
        {showSearchInput && (
          <div className="md:hidden pb-3 pt-1">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                autoFocus
                placeholder="Search freight, shipping, customs, tariffs..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full pl-9 pr-8 py-2 text-sm rounded-lg bg-slate-100 dark:bg-slate-800 border border-transparent focus:border-emerald-500 focus:bg-white dark:focus:bg-slate-900 text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none"
              />
              {searchQuery && (
                <button
                  onClick={() => onSearchChange('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
