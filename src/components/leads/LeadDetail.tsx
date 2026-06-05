'use client';

import { Lead } from '@/lib/types/lead';
import LeadScoreRing from './LeadScoreRing';
import {
  X,
  Globe,
  Phone,
  Mail,
  MapPin,
  Star,
  ExternalLink,
  Hash,
  Camera,
  Briefcase,
  AtSign,
  Video,
  Clock,
  CheckCircle2,
  XCircle,
  Copy,
  Check,
  Sparkles,
  Loader2,
} from 'lucide-react';
import { useState } from 'react';

interface LeadDetailProps {
  lead: Lead;
  onClose: () => void;
}

const socialIcons: Record<string, React.ElementType> = {
  facebook: Hash,
  instagram: Camera,
  linkedin: Briefcase,
  twitter: AtSign,
  youtube: Video,
};

export default function LeadDetail({ lead, onClose }: LeadDetailProps) {
  const [copied, setCopied] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisData, setAnalysisData] = useState<any>(null);
  const [analysisError, setAnalysisError] = useState<string | null>(null);

  const analyzeLead = async () => {
    setIsAnalyzing(true);
    setAnalysisError(null);
    try {
      const response = await fetch('/api/analyze-lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lead }),
      });
      if (response.ok) {
        const data = await response.json();
        setAnalysisData(data.analysis);
      } else {
        const errorData = await response.json();
        setAnalysisError(errorData.error || 'Failed to fetch analysis');
      }
    } catch (error) {
      console.error('Failed to analyze lead:', error);
      setAnalysisError('An unexpected error occurred while analyzing the lead');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopied(field);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl glass border border-surface-700/50 animate-slide-up">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-start justify-between gap-4 p-6 pb-4 glass border-b border-surface-800/50 rounded-t-2xl">
          <div className="flex-1">
            <h2 className="text-xl font-bold text-surface-100">
              {lead.businessName}
            </h2>
            <p className="text-sm text-surface-400 flex items-center gap-1 mt-1">
              <MapPin className="w-3.5 h-3.5" />
              {lead.address}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <LeadScoreRing score={lead.leadScore} size={64} strokeWidth={5} />
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg bg-surface-800/60 flex items-center justify-center text-surface-400 hover:text-surface-200 hover:bg-surface-700 transition-all"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Contact Information */}
          <section>
            <h3 className="text-sm font-semibold text-surface-300 uppercase tracking-wider mb-3">
              Contact Information
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {lead.primaryPhone && (
                <InfoRow
                  icon={<Phone className="w-4 h-4 text-accent-500" />}
                  label="Primary Phone"
                  value={lead.primaryPhone}
                  onCopy={() =>
                    copyToClipboard(lead.primaryPhone!, 'phone')
                  }
                  isCopied={copied === 'phone'}
                />
              )}
              {lead.secondaryPhone && (
                <InfoRow
                  icon={<Phone className="w-4 h-4 text-accent-400" />}
                  label="Secondary Phone"
                  value={lead.secondaryPhone}
                  onCopy={() =>
                    copyToClipboard(lead.secondaryPhone!, 'phone2')
                  }
                  isCopied={copied === 'phone2'}
                />
              )}
              {lead.emails.map((email, i) => (
                <InfoRow
                  key={email}
                  icon={<Mail className="w-4 h-4 text-accent-500" />}
                  label={i === 0 ? 'Email' : `Email ${i + 1}`}
                  value={email}
                  onCopy={() => copyToClipboard(email, `email_${i}`)}
                  isCopied={copied === `email_${i}`}
                />
              ))}
              {lead.website && (
                <InfoRow
                  icon={<Globe className="w-4 h-4 text-primary-400" />}
                  label="Website"
                  value={lead.domain || lead.website}
                  href={lead.website}
                />
              )}
              {lead.contactFormUrl && (
                <InfoRow
                  icon={<ExternalLink className="w-4 h-4 text-primary-400" />}
                  label="Contact Form"
                  value="Contact Page"
                  href={lead.contactFormUrl}
                />
              )}
            </div>
          </section>

          {/* Reputation */}
          <section>
            <h3 className="text-sm font-semibold text-surface-300 uppercase tracking-wider mb-3">
              Reputation
            </h3>
            <div className="flex items-center gap-6">
              {lead.rating !== undefined && (
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-4 h-4 ${
                          star <= Math.round(lead.rating || 0)
                            ? 'fill-warm-400 text-warm-400'
                            : 'text-surface-600'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-lg font-bold text-surface-200">
                    {lead.rating}
                  </span>
                </div>
              )}
              {lead.reviewCount !== undefined && (
                <div className="text-sm text-surface-400">
                  <span className="text-surface-200 font-semibold">
                    {lead.reviewCount.toLocaleString()}
                  </span>{' '}
                  reviews
                </div>
              )}
            </div>
          </section>

          {/* Social Profiles */}
          {lead.socialProfiles &&
            Object.values(lead.socialProfiles).some(Boolean) && (
              <section>
                <h3 className="text-sm font-semibold text-surface-300 uppercase tracking-wider mb-3">
                  Social Media
                </h3>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(lead.socialProfiles).map(
                    ([platform, url]) => {
                      if (!url) return null;
                      const Icon = socialIcons[platform];
                      if (!Icon) return null;
                      return (
                        <a
                          key={platform}
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 px-3 py-2 rounded-xl bg-surface-800/40 border border-surface-700/30 text-surface-300 hover:text-primary-400 hover:border-primary-500/30 transition-all text-sm"
                        >
                          <Icon className="w-4 h-4" />
                          <span className="capitalize">{platform}</span>
                        </a>
                      );
                    }
                  )}
                </div>
              </section>
            )}

          {/* Score Breakdown */}
          {lead.scoreBreakdown && (
            <section>
              <h3 className="text-sm font-semibold text-surface-300 uppercase tracking-wider mb-3">
                Agency Opportunity Score
              </h3>
              <div className="space-y-2">
                {lead.scoreBreakdown.factors.map((factor) => (
                  <div
                    key={factor.name}
                    className="flex items-center gap-3 p-3 rounded-xl bg-surface-800/30"
                  >
                    {factor.found ? (
                      <CheckCircle2 className="w-4 h-4 text-accent-500 flex-shrink-0" />
                    ) : (
                      <XCircle className="w-4 h-4 text-surface-600 flex-shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-surface-200">
                          {factor.name}
                        </span>
                        <span className="text-sm font-mono font-semibold text-surface-300">
                          {factor.points}/{factor.maxPoints}
                        </span>
                      </div>
                      <p className="text-xs text-surface-500 mt-0.5">
                        {factor.detail}
                      </p>
                    </div>
                    <div className="w-16 h-1.5 rounded-full bg-surface-700 overflow-hidden flex-shrink-0">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${(factor.points / factor.maxPoints) * 100}%`,
                          background: factor.found
                            ? 'linear-gradient(90deg, #6366f1, #10b981)'
                            : '#475569',
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Business Hours */}
          {lead.businessHours &&
            Object.keys(lead.businessHours).length > 0 && (
              <section>
                <h3 className="text-sm font-semibold text-surface-300 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Business Hours
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                  {Object.entries(lead.businessHours).map(([day, hours]) => (
                    <div
                      key={day}
                      className="flex items-center justify-between px-3 py-1.5 rounded-lg bg-surface-800/20 text-sm"
                    >
                      <span className="text-surface-400 font-medium">
                        {day}
                      </span>
                      <span
                        className={
                          hours === 'Closed'
                            ? 'text-danger-400'
                            : 'text-surface-300'
                        }
                      >
                        {hours}
                      </span>
                    </div>
                  ))}
                </div>
              </section>
            )}

          {/* AI Analysis Results */}
          {analysisError && (
            <div className="p-4 rounded-xl bg-danger-500/10 border border-danger-500/20 text-danger-400 text-sm">
              <p className="font-semibold mb-1">Analysis Failed</p>
              <p>{analysisError}</p>
              {analysisError.includes('OpenAI API key not configured') && (
                <p className="mt-2 text-xs opacity-80">Please add your full OPENAI_API_KEY to .env.local</p>
              )}
            </div>
          )}
          
          {analysisData && (
            <section className="animate-fade-in">
              <h3 className="text-sm font-semibold text-accent-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                AI Intelligence Report
              </h3>
              <div className="space-y-3">
                <div className="p-4 rounded-xl bg-gradient-to-br from-surface-800/50 to-surface-800/20 border border-surface-700/50">
                  <h4 className="text-sm font-medium text-surface-200 mb-1">Company Analysis</h4>
                  <p className="text-sm text-surface-400 leading-relaxed">{analysisData.companyAnalysis}</p>
                </div>
                <div className="p-4 rounded-xl bg-gradient-to-br from-surface-800/50 to-surface-800/20 border border-surface-700/50">
                  <h4 className="text-sm font-medium text-surface-200 mb-1">Website Rating & Quality</h4>
                  <p className="text-sm text-surface-400 leading-relaxed">{analysisData.websiteRating}</p>
                </div>
                <div className="p-4 rounded-xl bg-gradient-to-br from-surface-800/50 to-surface-800/20 border border-surface-700/50">
                  <h4 className="text-sm font-medium text-surface-200 mb-1">Opportunity for Agency</h4>
                  <p className="text-sm text-surface-400 leading-relaxed">{analysisData.opportunityAnalysis}</p>
                </div>
              </div>
            </section>
          )}

          {/* Actions */}
          <div className="flex flex-col gap-3 pt-4 border-t border-surface-800/50">
            <div className="flex items-center gap-3">
              {lead.googleMapsUrl && (
                <a
                  href={lead.googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-primary-600/20 text-primary-400 hover:bg-primary-600/30 border border-primary-500/20 transition-all text-sm font-medium"
                >
                  <MapPin className="w-4 h-4" />
                  Open in Maps
                </a>
              )}
              {lead.website && (
                <a
                  href={lead.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-surface-800/60 text-surface-300 hover:bg-surface-700 border border-surface-700/30 transition-all text-sm font-medium"
                >
                  <Globe className="w-4 h-4" />
                  Visit Website
                </a>
              )}
            </div>
            <button
              onClick={analyzeLead}
              disabled={isAnalyzing}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gradient-to-r from-accent-500 to-primary-500 text-white hover:from-accent-400 hover:to-primary-400 transition-all text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary-500/20"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Analyzing Lead...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  AI Intelligence Analysis
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoRow({
  icon,
  label,
  value,
  href,
  onCopy,
  isCopied,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  href?: string;
  onCopy?: () => void;
  isCopied?: boolean;
}) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-xl bg-surface-800/30 group">
      {icon}
      <div className="flex-1 min-w-0">
        <p className="text-[10px] text-surface-500 uppercase tracking-wider">
          {label}
        </p>
        {href ? (
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-primary-400 hover:text-primary-300 truncate block"
          >
            {value}
          </a>
        ) : (
          <p className="text-sm text-surface-200 truncate">{value}</p>
        )}
      </div>
      {onCopy && (
        <button
          onClick={onCopy}
          className="opacity-0 group-hover:opacity-100 transition-opacity w-7 h-7 rounded-lg bg-surface-700/50 flex items-center justify-center text-surface-400 hover:text-surface-200"
        >
          {isCopied ? (
            <Check className="w-3.5 h-3.5 text-accent-500" />
          ) : (
            <Copy className="w-3.5 h-3.5" />
          )}
        </button>
      )}
    </div>
  );
}
