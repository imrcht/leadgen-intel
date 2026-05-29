'use client';

import { Lead } from '@/lib/types/lead';
import LeadScoreRing from './LeadScoreRing';
import {
  Globe,
  Phone,
  Mail,
  MapPin,
  Star,
  MessageSquare,
  ExternalLink,
  Hash,
  Camera,
  Briefcase,
  AtSign,
  Video,
} from 'lucide-react';

interface LeadCardProps {
  lead: Lead;
  index: number;
  onViewDetails: (lead: Lead) => void;
}

const socialIcons: Record<string, React.ElementType> = {
  facebook: Hash,
  instagram: Camera,
  linkedin: Briefcase,
  twitter: AtSign,
  youtube: Video,
};

export default function LeadCard({ lead, index, onViewDetails }: LeadCardProps) {
  return (
    <div
      className="lead-card glass rounded-2xl p-5 cursor-pointer animate-fade-in"
      style={{ animationDelay: `${index * 50}ms` }}
      onClick={() => onViewDetails(lead)}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="flex-1 min-w-0">
          <h3 className="text-base font-semibold text-surface-100 truncate">
            {lead.businessName}
          </h3>
          <p className="text-xs text-surface-400 mt-0.5 flex items-center gap-1">
            <MapPin className="w-3 h-3" />
            <span className="truncate">{lead.address}</span>
          </p>
        </div>
        <LeadScoreRing score={lead.leadScore} size={48} />
      </div>

      {/* Category badge */}
      <div className="flex items-center gap-2 mb-4">
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-primary-500/10 text-primary-400 border border-primary-500/20">
          {lead.category}
        </span>
        {lead.rating && (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-warm-500/10 text-warm-400 border border-warm-500/20">
            <Star className="w-3 h-3 fill-warm-400" />
            {lead.rating}
            {lead.reviewCount && (
              <span className="text-surface-500 ml-0.5">
                ({lead.reviewCount})
              </span>
            )}
          </span>
        )}
      </div>

      {/* Contact Grid */}
      <div className="space-y-2 mb-4">
        {lead.primaryPhone && (
          <div className="flex items-center gap-2 text-xs text-surface-300">
            <Phone className="w-3.5 h-3.5 text-accent-500 flex-shrink-0" />
            <span className="truncate">{lead.primaryPhone}</span>
          </div>
        )}
        {lead.emails.length > 0 && (
          <div className="flex items-center gap-2 text-xs text-surface-300">
            <Mail className="w-3.5 h-3.5 text-accent-500 flex-shrink-0" />
            <span className="truncate">{lead.emails[0]}</span>
            {lead.emails.length > 1 && (
              <span className="text-surface-500">+{lead.emails.length - 1}</span>
            )}
          </div>
        )}
        {lead.website && (
          <div className="flex items-center gap-2 text-xs text-surface-300">
            <Globe className="w-3.5 h-3.5 text-primary-400 flex-shrink-0" />
            <span className="truncate">{lead.domain || lead.website}</span>
          </div>
        )}
      </div>

      {/* Social icons */}
      {lead.socialProfiles && Object.keys(lead.socialProfiles).length > 0 && (
        <div className="flex items-center gap-2 mb-4">
          {Object.entries(lead.socialProfiles).map(([platform, url]) => {
            if (!url) return null;
            const Icon = socialIcons[platform];
            if (!Icon) return null;
            return (
              <a
                key={platform}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="w-7 h-7 rounded-lg bg-surface-800/60 flex items-center justify-center text-surface-400 hover:text-primary-400 hover:bg-primary-500/10 transition-all"
              >
                <Icon className="w-3.5 h-3.5" />
              </a>
            );
          })}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-surface-800/50">
        <div className="flex items-center gap-3">
          {lead.googleMapsUrl && (
            <a
              href={lead.googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="text-[11px] text-surface-500 hover:text-primary-400 flex items-center gap-1 transition-colors"
            >
              <ExternalLink className="w-3 h-3" />
              Maps
            </a>
          )}
          {lead.reviewCount !== undefined && lead.reviewCount > 0 && (
            <span className="text-[11px] text-surface-500 flex items-center gap-1">
              <MessageSquare className="w-3 h-3" />
              {lead.reviewCount} reviews
            </span>
          )}
        </div>
        <span
          className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
            lead.enrichmentStatus === 'complete'
              ? 'bg-accent-500/10 text-accent-400'
              : lead.enrichmentStatus === 'partial'
                ? 'bg-warm-500/10 text-warm-400'
                : 'bg-surface-700 text-surface-400'
          }`}
        >
          {lead.enrichmentStatus === 'complete'
            ? 'Enriched'
            : lead.enrichmentStatus === 'partial'
              ? 'Partial'
              : 'Pending'}
        </span>
      </div>
    </div>
  );
}
