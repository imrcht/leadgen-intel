'use client';

import AppShell from '@/components/layout/AppShell';
import { useState, useEffect } from 'react';
import { SearchJob } from '@/lib/types/search';
import {
  History,
  Search,
  MapPin,
  Target,
  TrendingUp,
  Clock,
  CheckCircle2,
  XCircle,
  Loader2,
  ExternalLink,
  Download,
  RotateCcw,
} from 'lucide-react';
import Link from 'next/link';

export default function HistoryPage() {
  const [jobs, setJobs] = useState<SearchJob[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchJobs() {
      try {
        const res = await fetch('/api/searches');
        if (res.ok) {
          const data = await res.json();
          setJobs(data);
        }
      } catch (err) {
        console.error('Failed to fetch search history:', err);
      }
      setLoading(false);
    }
    fetchJobs();
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="w-4 h-4 text-accent-500" />;
      case 'failed':
        return <XCircle className="w-4 h-4 text-danger-500" />;
      case 'running':
        return <Loader2 className="w-4 h-4 text-primary-400 animate-spin" />;
      default:
        return <Clock className="w-4 h-4 text-surface-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      completed: 'bg-accent-500/10 text-accent-400 border-accent-500/20',
      failed: 'bg-danger-500/10 text-danger-400 border-danger-500/20',
      running: 'bg-primary-500/10 text-primary-400 border-primary-500/20',
      pending: 'bg-surface-600/10 text-surface-400 border-surface-600/20',
    };

    return (
      <span
        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium border ${styles[status] || styles.pending}`}
      >
        {getStatusIcon(status)}
        <span className="capitalize">{status}</span>
      </span>
    );
  };

  const formatTime = (iso: string) => {
    const d = new Date(iso);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  };

  return (
    <AppShell>
      <div className="flex items-center justify-between mb-8 animate-fade-in">
        <div>
          <h1 className="text-2xl font-bold text-surface-100 flex items-center gap-3">
            <History className="w-6 h-6 text-primary-400" />
            Search History
          </h1>
          <p className="text-sm text-surface-400 mt-1">
            View and manage your past lead searches
          </p>
        </div>
        <Link
          href="/search"
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-primary-600 to-primary-500 text-white text-sm font-semibold hover:from-primary-500 hover:to-primary-400 transition-all"
        >
          <Search className="w-4 h-4" />
          New Search
        </Link>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 text-primary-400 animate-spin" />
        </div>
      ) : jobs.length === 0 ? (
        <div className="text-center py-24 animate-fade-in">
          <History className="w-12 h-12 text-surface-600 mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-surface-300 mb-2">
            No Search History
          </h2>
          <p className="text-sm text-surface-500 mb-6">
            Start your first lead search to see results here.
          </p>
          <Link
            href="/search"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary-600 text-white text-sm font-medium hover:bg-primary-500 transition-all"
          >
            <Search className="w-4 h-4" />
            Start Searching
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {jobs.map((job, i) => {
            const avgScore =
              job.results.length > 0
                ? Math.round(
                    job.results.reduce((s, l) => s + l.leadScore, 0) /
                      job.results.length
                  )
                : 0;

            return (
              <Link
                href={`/results/${job.id}`}
                key={job.id}
                className="block glass rounded-2xl p-5 hover:border-primary-500/20 transition-all group cursor-pointer animate-fade-in"
                style={{ animationDelay: `${i * 60}ms` }}
              >
                <div className="flex items-center gap-4">
                  {/* Icon */}
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary-600/20 to-accent-600/20 flex items-center justify-center border border-primary-500/10 flex-shrink-0">
                    <MapPin className="w-5 h-5 text-primary-400" />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="text-sm font-semibold text-surface-200 truncate">
                        {job.params.category} in {job.params.location}
                      </h3>
                      {getStatusBadge(job.status)}
                    </div>
                    <p className="text-xs text-surface-500 flex items-center gap-3">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatTime(job.createdAt)}
                      </span>
                      <span>Radius: {job.params.radius} mi</span>
                    </p>
                  </div>

                  {/* Stats */}
                  <div className="hidden sm:flex items-center gap-6">
                    <div className="text-center">
                      <p className="text-lg font-bold text-surface-200">
                        {job.results.length}
                      </p>
                      <p className="text-[10px] text-surface-500">Leads</p>
                    </div>
                    {job.results.length > 0 && (
                      <div className="text-center">
                        <p className="text-lg font-bold text-primary-400">
                          {avgScore}
                        </p>
                        <p className="text-[10px] text-surface-500">
                          Avg Score
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Arrow */}
                  <ExternalLink className="w-4 h-4 text-surface-600 group-hover:text-primary-400 transition-colors flex-shrink-0" />
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </AppShell>
  );
}
