export interface Lead {
  id: string;
  businessName: string;
  category: string;
  placeId?: string;

  // Location
  address: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  latitude?: number;
  longitude?: number;
  googleMapsUrl?: string;

  // Contact
  primaryPhone?: string;
  secondaryPhone?: string;
  emails: string[];
  contactFormUrl?: string;

  // Online Presence
  website?: string;
  domain?: string;

  // Social Media
  socialProfiles: {
    facebook?: string;
    instagram?: string;
    linkedin?: string;
    twitter?: string;
    youtube?: string;
  };

  // Reputation
  rating?: number;
  reviewCount?: number;

  // Business Hours
  businessHours?: Record<string, string>;

  // Scoring
  leadScore: number;
  scoreBreakdown: ScoreBreakdown;

  // Metadata
  enrichmentStatus: EnrichmentStatus;
  dataSource: string;
  discoveredAt: string;
  enrichedAt?: string;
}

export type EnrichmentStatus = 'pending' | 'partial' | 'complete' | 'failed';

export interface ScoreBreakdown {
  websiteScore: number;
  emailScore: number;
  phoneScore: number;
  ratingScore: number;
  reviewScore: number;
  socialScore: number;
  totalScore: number;
  factors: ScoreFactor[];
}

export interface ScoreFactor {
  name: string;
  found: boolean;
  points: number;
  maxPoints: number;
  detail?: string;
}

export interface LeadExportOptions {
  format: 'csv' | 'excel' | 'json' | 'pdf';
  fields?: (keyof Lead)[];
  includeScoring?: boolean;
  includeSocial?: boolean;
}

export type LeadScoreCategory = 'hot' | 'warm' | 'cold';

export function getLeadCategory(score: number): LeadScoreCategory {
  if (score >= 70) return 'hot';
  if (score >= 40) return 'warm';
  return 'cold';
}

export function getLeadCategoryColor(category: LeadScoreCategory): string {
  switch (category) {
    case 'hot': return '#10b981';
    case 'warm': return '#f59e0b';
    case 'cold': return '#6b7280';
  }
}

export function getLeadCategoryLabel(category: LeadScoreCategory): string {
  switch (category) {
    case 'hot': return 'Hot Lead';
    case 'warm': return 'Warm Lead';
    case 'cold': return 'Cold Lead';
  }
}
