'use client';

import { Lead } from '@/lib/types/lead';
import LeadScoreRing from './LeadScoreRing';
import {
  Globe,
  Phone,
  Mail,
  Star,
  ExternalLink,
  ArrowUpDown,
} from 'lucide-react';
import { useState } from 'react';

interface LeadTableProps {
  leads: Lead[];
  onViewDetails: (lead: Lead) => void;
}

type SortField = 'businessName' | 'leadScore' | 'rating' | 'reviewCount';
type SortDir = 'asc' | 'desc';

export default function LeadTable({ leads, onViewDetails }: LeadTableProps) {
  const [sortField, setSortField] = useState<SortField>('leadScore');
  const [sortDir, setSortDir] = useState<SortDir>('desc');

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDir('desc');
    }
  };

  const sorted = [...leads].sort((a, b) => {
    const aVal = a[sortField] ?? 0;
    const bVal = b[sortField] ?? 0;
    if (typeof aVal === 'string' && typeof bVal === 'string') {
      return sortDir === 'asc'
        ? aVal.localeCompare(bVal)
        : bVal.localeCompare(aVal);
    }
    return sortDir === 'asc'
      ? (aVal as number) - (bVal as number)
      : (bVal as number) - (aVal as number);
  });

  const SortHeader = ({
    field,
    children,
  }: {
    field: SortField;
    children: React.ReactNode;
  }) => (
    <th
      className="text-left px-4 py-3 text-xs font-semibold text-surface-400 uppercase tracking-wider cursor-pointer hover:text-surface-200 transition-colors select-none"
      onClick={() => toggleSort(field)}
    >
      <div className="flex items-center gap-1.5">
        {children}
        <ArrowUpDown
          className={`w-3 h-3 ${
            sortField === field ? 'text-primary-400' : 'text-surface-600'
          }`}
        />
      </div>
    </th>
  );

  return (
    <div className="overflow-x-auto rounded-2xl glass border border-surface-800/30">
      <table className="w-full lead-table">
        <thead>
          <tr className="border-b border-surface-800/50">
            <SortHeader field="businessName">Business</SortHeader>
            <th className="text-left px-4 py-3 text-xs font-semibold text-surface-400 uppercase tracking-wider">
              Contact
            </th>
            <SortHeader field="rating">Rating</SortHeader>
            <SortHeader field="reviewCount">Reviews</SortHeader>
            <SortHeader field="leadScore">Score</SortHeader>
            <th className="text-left px-4 py-3 text-xs font-semibold text-surface-400 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((lead, i) => (
            <tr
              key={lead.id}
              className="border-b border-surface-800/20 cursor-pointer animate-fade-in"
              style={{ animationDelay: `${i * 30}ms` }}
              onClick={() => onViewDetails(lead)}
            >
              <td className="px-4 py-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-600/20 to-accent-600/20 flex items-center justify-center text-primary-400 font-bold text-sm flex-shrink-0 border border-primary-500/10">
                    {lead.businessName.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-surface-200 truncate max-w-[200px]">
                      {lead.businessName}
                    </p>
                    <p className="text-xs text-surface-500 truncate max-w-[200px]">
                      {lead.address}
                    </p>
                  </div>
                </div>
              </td>
              <td className="px-4 py-3">
                <div className="flex items-center gap-2">
                  {lead.primaryPhone && (
                    <span className="w-6 h-6 rounded-md bg-accent-500/10 flex items-center justify-center" title={lead.primaryPhone}>
                      <Phone className="w-3 h-3 text-accent-500" />
                    </span>
                  )}
                  {lead.emails.length > 0 && (
                    <span className="w-6 h-6 rounded-md bg-accent-500/10 flex items-center justify-center" title={lead.emails[0]}>
                      <Mail className="w-3 h-3 text-accent-500" />
                    </span>
                  )}
                  {lead.website && (
                    <span className="w-6 h-6 rounded-md bg-primary-500/10 flex items-center justify-center" title={lead.website}>
                      <Globe className="w-3 h-3 text-primary-400" />
                    </span>
                  )}
                  {!lead.primaryPhone && lead.emails.length === 0 && !lead.website && (
                    <span className="text-xs text-surface-600">—</span>
                  )}
                </div>
              </td>
              <td className="px-4 py-3">
                {lead.rating ? (
                  <div className="flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 fill-warm-400 text-warm-400" />
                    <span className="text-sm font-medium text-surface-200">
                      {lead.rating}
                    </span>
                  </div>
                ) : (
                  <span className="text-xs text-surface-600">—</span>
                )}
              </td>
              <td className="px-4 py-3">
                <span className="text-sm text-surface-300">
                  {lead.reviewCount?.toLocaleString() ?? '—'}
                </span>
              </td>
              <td className="px-4 py-3">
                <LeadScoreRing
                  score={lead.leadScore}
                  size={40}
                  strokeWidth={3}
                  showLabel={false}
                />
              </td>
              <td className="px-4 py-3">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onViewDetails(lead);
                  }}
                  className="text-xs text-primary-400 hover:text-primary-300 font-medium flex items-center gap-1 transition-colors"
                >
                  <ExternalLink className="w-3 h-3" />
                  Details
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
