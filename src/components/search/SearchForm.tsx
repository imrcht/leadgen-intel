'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  Search,
  MapPin,
  Compass,
  Sliders,
  Star,
  MessageSquare,
  Globe,
  Mail,
  Phone,
  Loader2,
  Sparkles,
  ArrowRight,
} from 'lucide-react';

const POPULAR_SEARCHES = [
  { category: 'Dentists', location: 'Mumbai', icon: '🦷' },
  { category: 'Restaurants', location: 'New York', icon: '🍽️' },
  { category: 'Real Estate Agents', location: 'Dubai', icon: '🏠' },
  { category: 'Accountants', location: 'London', icon: '📊' },
  { category: 'Interior Designers', location: 'Bangalore', icon: '🎨' },
  { category: 'Plumbers', location: 'Paris', icon: '🔧' },
];

const RADIUS_OPTIONS = [1, 2, 5, 10, 15, 25, 50];

export default function SearchForm() {
  const router = useRouter();
  const [category, setCategory] = useState('');
  const [location, setLocation] = useState('');
  const [radius, setRadius] = useState(5);
  const [showFilters, setShowFilters] = useState(false);
  const [minRating, setMinRating] = useState(0);
  const [minReviews, setMinReviews] = useState(0);
  const [hasWebsite, setHasWebsite] = useState(false);
  const [hasEmail, setHasEmail] = useState(false);
  const [hasPhone, setHasPhone] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = useCallback(
    async (e?: React.FormEvent) => {
      e?.preventDefault();
      if (!category.trim() || !location.trim()) return;

      setIsSubmitting(true);

      try {
        const res = await fetch('/api/searches', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            category: category.trim(),
            location: location.trim(),
            radius,
            filters: {
              ...(minRating > 0 && { minRating }),
              ...(minReviews > 0 && { minReviews }),
              ...(hasWebsite && { hasWebsite }),
              ...(hasEmail && { hasEmail }),
              ...(hasPhone && { hasPhone }),
            },
          }),
        });

        const data = await res.json();
        
        // Save to localStorage for serverless/Netlify persistence fallback
        if (typeof window !== 'undefined') {
          try {
            localStorage.setItem(`job_${data.id}`, JSON.stringify(data));
            const existingIds = JSON.parse(localStorage.getItem('search_job_ids') || '[]');
            if (!existingIds.includes(data.id)) {
              localStorage.setItem('search_job_ids', JSON.stringify([data.id, ...existingIds]));
            }
          } catch (e) {
            console.warn('Failed to save job to localStorage:', e);
          }
        }

        router.push(`/results/${data.id}`);
      } catch (err) {
        console.error('Search failed:', err);
        setIsSubmitting(false);
      }
    },
    [category, location, radius, minRating, minReviews, hasWebsite, hasEmail, hasPhone, router]
  );

  const quickSearch = (cat: string, loc: string) => {
    setCategory(cat);
    setLocation(loc);
  };

  return (
    <div className="max-w-3xl mx-auto">
      {/* Hero */}
      <div className="text-center mb-10 animate-fade-in">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary-500/10 border border-primary-500/20 text-primary-400 text-xs font-medium mb-4">
          <Sparkles className="w-3.5 h-3.5" />
          AI-Powered Lead Discovery
        </div>
        <h1 className="text-4xl md:text-5xl font-bold mb-3">
          <span className="gradient-text">Discover Leads</span>
          <br />
          <span className="text-surface-200">Anywhere in the World</span>
        </h1>
        <p className="text-surface-400 text-base max-w-lg mx-auto">
          Enter a business category and location to discover leads with
          enriched contact data, AI scoring, and exportable reports.
        </p>
      </div>

      {/* Search Form */}
      <form
        onSubmit={handleSubmit}
        className="glass rounded-2xl p-6 space-y-4 animate-slide-up"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Category */}
          <div>
            <label className="text-xs font-medium text-surface-400 uppercase tracking-wider mb-1.5 block">
              Business Category
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-500" />
              <input
                type="text"
                placeholder="e.g. Dentists, Restaurants, Accountants..."
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-surface-800/60 border border-surface-700/50 text-surface-200 placeholder-surface-500 focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500/50 transition-all text-sm"
                required
              />
            </div>
          </div>

          {/* Location */}
          <div>
            <label className="text-xs font-medium text-surface-400 uppercase tracking-wider mb-1.5 block">
              Location
            </label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-500" />
              <input
                type="text"
                placeholder="e.g. Mumbai, New York, London..."
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-surface-800/60 border border-surface-700/50 text-surface-200 placeholder-surface-500 focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500/50 transition-all text-sm"
                required
              />
            </div>
          </div>
        </div>

        {/* Radius */}
        <div>
          <label className="text-xs font-medium text-surface-400 uppercase tracking-wider mb-1.5 flex items-center gap-2">
            <Compass className="w-3.5 h-3.5" />
            Search Radius: {radius} miles
          </label>
          <div className="flex items-center gap-2">
            {RADIUS_OPTIONS.map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRadius(r)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  radius === r
                    ? 'bg-primary-500/20 text-primary-400 border border-primary-500/30'
                    : 'bg-surface-800/40 text-surface-400 border border-surface-700/30 hover:bg-surface-800 hover:text-surface-300'
                }`}
              >
                {r} mi
              </button>
            ))}
          </div>
        </div>

        {/* Filter Toggle */}
        <button
          type="button"
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2 text-xs text-surface-400 hover:text-surface-300 transition-colors"
        >
          <Sliders className="w-3.5 h-3.5" />
          {showFilters ? 'Hide Filters' : 'Show Advanced Filters'}
        </button>

        {/* Filters */}
        {showFilters && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 p-4 rounded-xl bg-surface-800/30 border border-surface-700/20 animate-fade-in">
            <div>
              <label className="text-xs text-surface-500 mb-1 flex items-center gap-1">
                <Star className="w-3 h-3" /> Min Rating
              </label>
              <select
                value={minRating}
                onChange={(e) => setMinRating(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-lg bg-surface-800/60 border border-surface-700/50 text-surface-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/30"
              >
                <option value={0}>Any</option>
                <option value={3}>3+ Stars</option>
                <option value={3.5}>3.5+ Stars</option>
                <option value={4}>4+ Stars</option>
                <option value={4.5}>4.5+ Stars</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-surface-500 mb-1 flex items-center gap-1">
                <MessageSquare className="w-3 h-3" /> Min Reviews
              </label>
              <select
                value={minReviews}
                onChange={(e) => setMinReviews(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-lg bg-surface-800/60 border border-surface-700/50 text-surface-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/30"
              >
                <option value={0}>Any</option>
                <option value={10}>10+</option>
                <option value={50}>50+</option>
                <option value={100}>100+</option>
                <option value={500}>500+</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-xs text-surface-500 block">
                Must Have
              </label>
              {[
                { label: 'Website', icon: Globe, value: hasWebsite, setter: setHasWebsite },
                { label: 'Email', icon: Mail, value: hasEmail, setter: setHasEmail },
                { label: 'Phone', icon: Phone, value: hasPhone, setter: setHasPhone },
              ].map((f) => (
                <label
                  key={f.label}
                  className="flex items-center gap-2 cursor-pointer text-xs text-surface-300"
                >
                  <input
                    type="checkbox"
                    checked={f.value}
                    onChange={(e) => f.setter(e.target.checked)}
                    className="rounded border-surface-600 bg-surface-800 text-primary-500 focus:ring-primary-500/30 w-3.5 h-3.5"
                  />
                  <f.icon className="w-3 h-3 text-surface-500" />
                  {f.label}
                </label>
              ))}
            </div>
          </div>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={isSubmitting || !category.trim() || !location.trim()}
          className="w-full py-3.5 rounded-xl bg-gradient-to-r from-primary-600 to-primary-500 text-white font-semibold text-sm flex items-center justify-center gap-2 hover:from-primary-500 hover:to-primary-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all animate-pulse-glow"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Launching Search...
            </>
          ) : (
            <>
              <Search className="w-4 h-4" />
              Discover Leads
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      {/* Popular Searches */}
      <div className="mt-8 animate-fade-in" style={{ animationDelay: '200ms' }}>
        <p className="text-xs text-surface-500 uppercase tracking-wider font-medium mb-3 text-center">
          Popular Searches
        </p>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {POPULAR_SEARCHES.map((ps) => (
            <button
              key={`${ps.category}-${ps.location}`}
              onClick={() => quickSearch(ps.category, ps.location)}
              className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl glass-light text-sm text-surface-300 hover:text-surface-100 hover:border-primary-500/20 transition-all group"
            >
              <span className="text-lg">{ps.icon}</span>
              <span className="truncate">
                {ps.category} in {ps.location}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
