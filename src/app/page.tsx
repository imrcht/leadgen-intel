'use client';

import AppShell from '@/components/layout/AppShell';
import {
  Search,
  TrendingUp,
  Download,
  Target,
  Activity,
  ArrowRight,
  Zap,
  BarChart3,
} from 'lucide-react';
import Link from 'next/link';

const stats = [
  {
    label: 'Searches Today',
    value: '3',
    change: '+2 from yesterday',
    icon: Search,
    color: 'from-primary-500 to-primary-600',
    iconBg: 'bg-primary-500/10',
    iconColor: 'text-primary-400',
  },
  {
    label: 'Leads Generated',
    value: '36',
    change: '+12 this week',
    icon: Target,
    color: 'from-accent-500 to-accent-600',
    iconBg: 'bg-accent-500/10',
    iconColor: 'text-accent-400',
  },
  {
    label: 'Exports',
    value: '5',
    change: '2 CSV, 3 JSON',
    icon: Download,
    color: 'from-warm-500 to-warm-600',
    iconBg: 'bg-warm-500/10',
    iconColor: 'text-warm-400',
  },
  {
    label: 'Avg Lead Score',
    value: '72',
    change: '↑ 8 points',
    icon: TrendingUp,
    color: 'from-primary-400 to-accent-400',
    iconBg: 'bg-primary-500/10',
    iconColor: 'text-primary-400',
  },
];

const recentSearches = [
  {
    id: '1',
    category: 'Dentists',
    location: 'Mumbai',
    leads: 12,
    avgScore: 78,
    time: '2 hours ago',
    status: 'completed' as const,
  },
  {
    id: '2',
    category: 'Restaurants',
    location: 'New York',
    leads: 15,
    avgScore: 65,
    time: '5 hours ago',
    status: 'completed' as const,
  },
  {
    id: '3',
    category: 'Real Estate Agents',
    location: 'Dubai',
    leads: 9,
    avgScore: 82,
    time: 'Yesterday',
    status: 'completed' as const,
  },
];

export default function DashboardPage() {
  return (
    <AppShell>
      {/* Page Header */}
      <div className="flex items-center justify-between mb-8 animate-fade-in">
        <div>
          <h1 className="text-2xl font-bold text-surface-100">Dashboard</h1>
          <p className="text-sm text-surface-400 mt-1">
            Your lead generation overview
          </p>
        </div>
        <Link
          href="/search"
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-primary-600 to-primary-500 text-white text-sm font-semibold hover:from-primary-500 hover:to-primary-400 transition-all shadow-lg shadow-primary-500/20"
        >
          <Zap className="w-4 h-4" />
          New Search
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="glass rounded-2xl p-5 animate-fade-in group hover:border-primary-500/20 transition-all"
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <div className="flex items-start justify-between mb-3">
                <div
                  className={`w-10 h-10 rounded-xl ${stat.iconBg} flex items-center justify-center`}
                >
                  <Icon className={`w-5 h-5 ${stat.iconColor}`} />
                </div>
                <Activity className="w-4 h-4 text-surface-600 group-hover:text-surface-400 transition-colors" />
              </div>
              <p className="text-2xl font-bold text-surface-100 mb-1">
                {stat.value}
              </p>
              <p className="text-xs text-surface-500">{stat.label}</p>
              <p className="text-xs text-accent-400 mt-1">{stat.change}</p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Searches */}
        <div className="lg:col-span-2 glass rounded-2xl p-6 animate-slide-up">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-base font-semibold text-surface-200 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-primary-400" />
              Recent Searches
            </h2>
            <Link
              href="/history"
              className="text-xs text-primary-400 hover:text-primary-300 flex items-center gap-1 transition-colors"
            >
              View All <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="space-y-3">
            {recentSearches.map((search, i) => (
              <div
                key={search.id}
                className="flex items-center gap-4 p-4 rounded-xl bg-surface-800/30 hover:bg-surface-800/50 transition-all cursor-pointer group animate-fade-in"
                style={{ animationDelay: `${(i + 4) * 100}ms` }}
              >
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-600/20 to-accent-600/20 flex items-center justify-center text-lg border border-primary-500/10">
                  {search.category === 'Dentists'
                    ? '🦷'
                    : search.category === 'Restaurants'
                      ? '🍽️'
                      : '🏠'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-surface-200">
                    {search.category} in {search.location}
                  </p>
                  <p className="text-xs text-surface-500">{search.time}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-surface-200">
                    {search.leads} leads
                  </p>
                  <p className="text-xs text-surface-500">
                    Avg score: {search.avgScore}
                  </p>
                </div>
                <div className="w-2 h-2 rounded-full bg-accent-500" />
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions + Score Distribution */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <div
            className="glass rounded-2xl p-6 animate-slide-up"
            style={{ animationDelay: '200ms' }}
          >
            <h2 className="text-base font-semibold text-surface-200 mb-4">
              Quick Actions
            </h2>
            <div className="space-y-2">
              <Link
                href="/search"
                className="flex items-center gap-3 p-3 rounded-xl bg-primary-500/10 border border-primary-500/20 text-primary-400 hover:bg-primary-500/15 transition-all text-sm font-medium group"
              >
                <Search className="w-4 h-4" />
                Start New Lead Search
                <ArrowRight className="w-3 h-3 ml-auto group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/history"
                className="flex items-center gap-3 p-3 rounded-xl bg-surface-800/40 border border-surface-700/30 text-surface-300 hover:bg-surface-800/60 transition-all text-sm font-medium group"
              >
                <Download className="w-4 h-4" />
                Export Last Report
                <ArrowRight className="w-3 h-3 ml-auto group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>

          {/* Score Distribution */}
          <div
            className="glass rounded-2xl p-6 animate-slide-up"
            style={{ animationDelay: '300ms' }}
          >
            <h2 className="text-base font-semibold text-surface-200 mb-4">
              Lead Score Distribution
            </h2>
            <div className="space-y-3">
              {[
                { label: 'Hot Leads (70-100)', count: 18, pct: 50, color: 'bg-accent-500' },
                { label: 'Warm Leads (40-69)', count: 12, pct: 33, color: 'bg-warm-500' },
                { label: 'Cold Leads (0-39)', count: 6, pct: 17, color: 'bg-surface-500' },
              ].map((dist) => (
                <div key={dist.label}>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-surface-400">{dist.label}</span>
                    <span className="text-surface-300 font-medium">
                      {dist.count}
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-surface-800 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${dist.color} transition-all duration-1000`}
                      style={{ width: `${dist.pct}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
