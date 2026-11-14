import React, { useState } from 'react';
import { X, Send, CheckCircle2, AlertTriangle, RefreshCw } from 'lucide-react';
import { ContentType } from '../types/feed';
import { createFeedItem } from '../utils/api';

interface TestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const TestModal: React.FC<TestModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [source, setSource] = useState('FreightWaves');
  const [sourceUrl, setSourceUrl] = useState(`https://example.com/logistics/test-article-${Date.now()}`);
  const [imageUrl, setImageUrl] = useState('https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1200&q=80');
  const [category, setCategory] = useState('AI & Robotics');
  const [contentType, setContentType] = useState<ContentType>('ai_insight');

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    status: 'success' | 'error';
    message: string;
    data?: any;
  } | null>(null);

  if (!isOpen) return null;

  const handleFillSample = (sampleType: 'ai' | 'india' | 'warehouse') => {
    const timestamp = Date.now();
    if (sampleType === 'ai') {
      setTitle(`AI Vision Sorting Cuts Cross-Dock Sorting Errors by 45% (Test ${timestamp.toString().slice(-4)})`);
      setDescription('High-speed parcel imaging pipelines running neural networks on warehouse edge servers process 12,000 packages per hour with sub-millimeter tracking.');
      setCategory('AI & Robotics');
      setContentType('ai_insight');
      setSource('Robotics Quarterly');
      setSourceUrl(`https://example.com/robotics/ai-sorting-breakthrough-${timestamp}`);
      setImageUrl('https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80');
    } else if (sampleType === 'india') {
      setTitle(`India Fast-Tracks Unified Logistics Interface Platform (ULIP) Integration (Test ${timestamp.toString().slice(-4)})`);
      setDescription('Over 800 supply chain enterprises now track intermodal shipments across Indian railways, highways, and ports through a unified digital interface.');
      setCategory('India');
      setContentType('news');
      setSource('Economic Times Logistics');
      setSourceUrl(`https://example.com/india/ulip-platform-expansion-${timestamp}`);
      setImageUrl('https://images.unsplash.com/photo-1474487548417-781cb71495f3?auto=format&fit=crop&w=1200&q=80');
    } else {
      setTitle(`Automated High-Bay Storage Reaches 40-Meter Heights in Cold Facilities (Test ${timestamp.toString().slice(-4)})`);
      setDescription('Next-generation stacker cranes operating in sub-zero environments maximize volumetric density while slashing refrigeration energy costs.');
      setCategory('Warehousing');
      setContentType('trend');
      setSource('Modern Materials Handling');
      setSourceUrl(`https://example.com/warehousing/automated-high-bay-cold-storage-${timestamp}`);
      setImageUrl('https://images.unsplash.com/photo-1553413077-190dd305871c?auto=format&fit=crop&w=1200&q=80');
    }
    setResult(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    try {
      const response = await createFeedItem({
        title,
        description,
        source,
        source_url: sourceUrl,
        image_url: imageUrl,
        category,
        content_type: contentType,
        published_at: new Date().toISOString(),
      });

      setResult({
        status: 'success',
        message: 'Successfully inserted into Cloudflare D1!',
        data: response,
      });

      onSuccess();
    } catch (err: any) {
      setResult({
        status: 'error',
        message: err.message || 'Failed to insert feed item',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 my-8 animate-fade-in">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span>Test Ingestion API</span>
              <span className="px-2 py-0.5 text-[10px] font-mono font-semibold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 rounded">
                POST /api/feed
              </span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Simulate an incoming feed item from n8n into Cloudflare D1
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Sample Presets */}
        <div className="my-4">
          <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
            Quick Fill Sample:
          </label>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => handleFillSample('ai')}
              className="text-xs px-2.5 py-1 rounded-lg bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 hover:bg-purple-100 dark:hover:bg-purple-900/60"
            >
              ✨ AI & Robotics Sample
            </button>
            <button
              type="button"
              onClick={() => handleFillSample('india')}
              className="text-xs px-2.5 py-1 rounded-lg bg-orange-50 dark:bg-orange-950/60 text-orange-700 dark:text-orange-300 border border-orange-200 dark:border-orange-800 hover:bg-orange-100 dark:hover:bg-orange-900/60"
            >
              🇮🇳 India Logistics Sample
            </button>
            <button
              type="button"
              onClick={() => handleFillSample('warehouse')}
              className="text-xs px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 hover:bg-blue-100 dark:hover:bg-blue-900/60"
            >
              📦 Warehousing Trend
            </button>
          </div>
        </div>

        {/* Ingest Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Title <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Autonomous Fleet Cuts Middle-Mile Delivery Costs"
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Description
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief summary of the article..."
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              >
                <option value="AI & Robotics">AI & Robotics</option>
                <option value="Warehousing">Warehousing</option>
                <option value="Transportation">Transportation</option>
                <option value="Supply Chain">Supply Chain</option>
                <option value="Shipping">Shipping</option>
                <option value="India">India</option>
                <option value="Logistics">Logistics</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Content Type
              </label>
              <select
                value={contentType}
                onChange={(e) => setContentType(e.target.value as ContentType)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              >
                <option value="news">News</option>
                <option value="ai_insight">AI Insight</option>
                <option value="trend">Trend</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Source Name
              </label>
              <input
                type="text"
                value={source}
                onChange={(e) => setSource(e.target.value)}
                placeholder="e.g. Supply Chain Dive"
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Source URL <span className="text-rose-500">* (Unique)</span>
              </label>
              <input
                type="url"
                required
                value={sourceUrl}
                onChange={(e) => setSourceUrl(e.target.value)}
                placeholder="https://..."
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none font-mono text-xs"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Image URL (Optional)
            </label>
            <input
              type="url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://images.unsplash.com/..."
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none font-mono text-xs"
            />
          </div>

          {/* Result Alert Box */}
          {result && (
            <div
              className={`p-3 rounded-xl text-xs flex items-start gap-2 ${
                result.status === 'success'
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                  : 'bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
              }`}
            >
              {result.status === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
              )}
              <div className="flex-1">
                <p className="font-semibold">{result.message}</p>
                {result.data && (
                  <pre className="mt-1 text-[11px] overflow-x-auto p-1 bg-black/5 dark:bg-white/5 rounded font-mono">
                    {JSON.stringify(result.data, null, 2)}
                  </pre>
                )}
              </div>
            </div>
          )}

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Close
            </button>
            <button
              type="submit"
              disabled={loading || !title || !sourceUrl}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white shadow-sm transition-colors"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Inserting into D1...</span>
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>Send POST Request</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
