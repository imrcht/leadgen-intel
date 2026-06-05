'use client';

import { useEffect, useState, useCallback, use } from 'react';
import AppShell from '@/components/layout/AppShell';
import LeadCard from '@/components/leads/LeadCard';
import LeadTable from '@/components/leads/LeadTable';
import LeadDetail from '@/components/leads/LeadDetail';
import LeadScoreRing from '@/components/leads/LeadScoreRing';
import { Lead } from '@/lib/types/lead';
import { SearchJob } from '@/lib/types/search';
import {
  LayoutGrid,
  List,
  Download,
  Filter,
  Search,
  Loader2,
  CheckCircle2,
  XCircle,
  ArrowLeft,
  FileJson,
  FileSpreadsheet,
  Target,
  TrendingUp,
  Mail,
  Phone,
  Globe,
  RefreshCw,
} from 'lucide-react';
import Link from 'next/link';

type ViewMode = 'grid' | 'table';

export default function ResultsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [job, setJob] = useState<SearchJob | null>(null);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [searchFilter, setSearchFilter] = useState('');
  const [scoreFilter, setScoreFilter] = useState<'all' | 'hot' | 'warm' | 'cold'>('all');
  const [isExporting, setIsExporting] = useState(false);

  const fetchJob = useCallback(async () => {
    try {
      const res = await fetch(`/api/searches/${id}`);
      if (res.ok) {
        const data = await res.json();
        setJob(data);
      }
    } catch (err) {
      console.error('Failed to fetch job:', err);
    }
  }, [id]);

  useEffect(() => {
    fetchJob();
    const interval = setInterval(() => {
      fetchJob();
    }, 2000);

    return () => clearInterval(interval);
  }, [fetchJob]);

  // Stop polling when completed
  useEffect(() => {
    if (job?.status === 'completed' || job?.status === 'failed') {
      // no-op, interval will keep running but job won't change
    }
  }, [job?.status]);

  const handleExport = async (format: 'csv' | 'json') => {
    setIsExporting(true);
    try {
      const res = await fetch(`/api/searches/${id}/export`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ format }),
      });

      if (res.ok) {
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `leads_${id}.${format}`;
        a.click();
        URL.revokeObjectURL(url);
      }
    } catch (err) {
      console.error('Export failed:', err);
    }
    setIsExporting(false);
  };

  if (!job) {
    return (
      <AppShell>
        <div className="flex items-center justify-center h-96">
          <Loader2 className="w-8 h-8 text-primary-400 animate-spin" />
        </div>
      </AppShell>
    );
  }

  // Filter leads
  const filteredLeads = job.results.filter((lead) => {
    const matchesSearch =
      !searchFilter ||
      lead.businessName.toLowerCase().includes(searchFilter.toLowerCase()) ||
      lead.address.toLowerCase().includes(searchFilter.toLowerCase());

    const matchesScore =
      scoreFilter === 'all' ||
      (scoreFilter === 'hot' && lead.leadScore >= 70) ||
      (scoreFilter === 'warm' && lead.leadScore >= 40 && lead.leadScore < 70) ||
      (scoreFilter === 'cold' && lead.leadScore < 40);

    return matchesSearch && matchesScore;
  });

  // Stats
  const totalLeads = job.results.length;
  const avgScore =
    totalLeads > 0
      ? Math.round(
          job.results.reduce((sum, l) => sum + l.leadScore, 0) / totalLeads
        )
      : 0;
  const withEmail = job.results.filter((l) => l.emails.length > 0).length;
  const withPhone = job.results.filter((l) => l.primaryPhone).length;
  const withWebsite = job.results.filter((l) => l.website).length;
  const hotLeads = job.results.filter((l) => l.leadScore >= 70).length;

  return (
    <AppShell>
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-6 animate-fade-in">
        <div>
          <Link
            href="/search"
            className="flex items-center gap-1 text-xs text-surface-500 hover:text-surface-300 transition-colors mb-2"
          >
            <ArrowLeft className="w-3 h-3" />
            Back to Search
          </Link>
          <h1 className="text-2xl font-bold text-surface-100">
            {job.params.category} in {job.params.location}
          </h1>
          <p className="text-sm text-surface-400 mt-1">
            {job.params.radius} mile radius •{' '}
            {job.status === 'completed'
              ? `${totalLeads} leads found`
              : 'In Progress...'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {job.status === 'completed' && (
            <>
              <button
                onClick={() => handleExport('csv')}
                disabled={isExporting}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-surface-800/60 border border-surface-700/30 text-surface-300 hover:bg-surface-700 transition-all text-sm"
              >
                <FileSpreadsheet className="w-4 h-4" />
                CSV
              </button>
              <button
                onClick={() => handleExport('json')}
                disabled={isExporting}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-surface-800/60 border border-surface-700/30 text-surface-300 hover:bg-surface-700 transition-all text-sm"
              >
                <FileJson className="w-4 h-4" />
                JSON
              </button>
            </>
          )}
        </div>
      </div>

      {/* Progress Bar (while running) */}
      {(job.status === 'pending' || job.status === 'running') && (
        <div className="glass rounded-2xl p-6 mb-6 animate-fade-in">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-primary-500/10 flex items-center justify-center">
              <Loader2 className="w-6 h-6 text-primary-400 animate-spin" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-surface-200">
                {job.progress.completionPercentage < 15
                  ? "Firing up the AI engines 🚀"
                  : job.progress.completionPercentage < 35
                  ? "Scouring the web for hidden gems 💎"
                  : job.progress.completionPercentage < 55
                  ? "Analyzing business metrics 📊"
                  : job.progress.completionPercentage < 75
                  ? "Evaluating lead quality ⭐"
                  : job.progress.completionPercentage < 90
                  ? "Cross-referencing contact data 🔍"
                  : "Polishing the final results ✨"}
              </p>
              <p className="text-xs text-surface-500">
                {job.progress.totalDiscovered > 0 &&
                  `${job.progress.totalProcessed}/${job.progress.totalDiscovered} leads processed`}
              </p>
            </div>
            <span className="text-2xl font-bold gradient-text-primary">
              {job.progress.completionPercentage}%
            </span>
          </div>
          <div className="h-2 rounded-full bg-surface-800 overflow-hidden">
            <div
              className="h-full rounded-full progress-bar-fill transition-all duration-500"
              style={{ width: `${job.progress.completionPercentage}%` }}
            />
          </div>
        </div>
      )}

      {/* Failed state */}
      {job.status === 'failed' && (
        <div className="glass rounded-2xl p-6 mb-6 border-danger-500/20 animate-fade-in">
          <div className="flex items-center gap-3">
            <XCircle className="w-6 h-6 text-danger-400" />
            <div>
              <p className="text-sm font-medium text-danger-400">
                Search Failed
              </p>
              <p className="text-xs text-surface-500">{job.error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Stats Summary */}
      {job.status === 'completed' && totalLeads > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
          {[
            { label: 'Total Leads', value: totalLeads, icon: Target, color: 'text-primary-400' },
            { label: 'Hot Leads', value: hotLeads, icon: TrendingUp, color: 'text-accent-400' },
            { label: 'Avg Score', value: avgScore, icon: CheckCircle2, color: 'text-primary-400' },
            { label: 'With Email', value: withEmail, icon: Mail, color: 'text-accent-400' },
            { label: 'With Phone', value: withPhone, icon: Phone, color: 'text-accent-400' },
            { label: 'With Website', value: withWebsite, icon: Globe, color: 'text-primary-400' },
          ].map((stat, i) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.label}
                className="glass rounded-xl p-3 text-center animate-fade-in"
                style={{ animationDelay: `${i * 50}ms` }}
              >
                <Icon className={`w-4 h-4 ${stat.color} mx-auto mb-1`} />
                <p className="text-lg font-bold text-surface-100">
                  {stat.value}
                </p>
                <p className="text-[10px] text-surface-500">{stat.label}</p>
              </div>
            );
          })}
        </div>
      )}

      {/* Toolbar */}
      {job.status === 'completed' && totalLeads > 0 && (
        <div className="flex items-center gap-3 mb-4 animate-fade-in">
          {/* Search */}
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-500" />
            <input
              type="text"
              placeholder="Filter leads..."
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-surface-800/60 border border-surface-700/50 text-surface-200 placeholder-surface-500 focus:outline-none focus:ring-2 focus:ring-primary-500/30 text-sm"
            />
          </div>

          {/* Score filter */}
          <div className="flex items-center gap-1">
            {(['all', 'hot', 'warm', 'cold'] as const).map((s) => (
              <button
                key={s}
                onClick={() => setScoreFilter(s)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all capitalize ${
                  scoreFilter === s
                    ? s === 'hot'
                      ? 'bg-accent-500/20 text-accent-400 border border-accent-500/30'
                      : s === 'warm'
                        ? 'bg-warm-500/20 text-warm-400 border border-warm-500/30'
                        : s === 'cold'
                          ? 'bg-surface-600/20 text-surface-400 border border-surface-600/30'
                          : 'bg-primary-500/20 text-primary-400 border border-primary-500/30'
                    : 'bg-surface-800/40 text-surface-500 border border-surface-700/30 hover:text-surface-300'
                }`}
              >
                {s === 'all' ? 'All' : s}
              </button>
            ))}
          </div>

          {/* View toggle */}
          <div className="flex items-center gap-1 bg-surface-800/40 rounded-xl p-1 border border-surface-700/30">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition-all ${
                viewMode === 'grid'
                  ? 'bg-primary-500/20 text-primary-400'
                  : 'text-surface-500 hover:text-surface-300'
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg transition-all ${
                viewMode === 'table'
                  ? 'bg-primary-500/20 text-primary-400'
                  : 'text-surface-500 hover:text-surface-300'
              }`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Results */}
      {job.status === 'completed' && totalLeads > 0 && (
        <>
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {filteredLeads.map((lead, i) => (
                <LeadCard
                  key={lead.id}
                  lead={lead}
                  index={i}
                  onViewDetails={setSelectedLead}
                />
              ))}
            </div>
          ) : (
            <LeadTable
              leads={filteredLeads}
              onViewDetails={setSelectedLead}
            />
          )}

          {filteredLeads.length === 0 && (
            <div className="text-center py-16">
              <Filter className="w-10 h-10 text-surface-600 mx-auto mb-3" />
              <p className="text-surface-400 text-sm">
                No leads match your filters
              </p>
            </div>
          )}
        </>
      )}

      {/* Empty state */}
      {job.status === 'completed' && totalLeads === 0 && (
        <div className="text-center py-24">
          <Search className="w-12 h-12 text-surface-600 mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-surface-300 mb-2">
            No Leads Found
          </h2>
          <p className="text-sm text-surface-500 mb-6 max-w-md mx-auto">
            Try broadening your search radius or adjusting the business
            category.
          </p>
          <Link
            href="/search"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary-600 text-white text-sm font-medium hover:bg-primary-500 transition-all"
          >
            <RefreshCw className="w-4 h-4" />
            Try Another Search
          </Link>
        </div>
      )}

      {/* Lead Detail Modal */}
      {selectedLead && (
        <LeadDetail
          lead={selectedLead}
          onClose={() => setSelectedLead(null)}
        />
      )}
    </AppShell>
  );
}
