import { Lead } from './lead';

export interface SearchParams {
  category: string;
  location: string;
  radius: number; // in miles
  filters?: SearchFilters;
}

export interface SearchFilters {
  minRating?: number;
  minReviews?: number;
  hasWebsite?: boolean;
  hasEmail?: boolean;
  hasPhone?: boolean;
  openNow?: boolean;
}

export type SearchStatus = 'pending' | 'running' | 'completed' | 'failed';

export interface SearchJob {
  id: string;
  params: SearchParams;
  status: SearchStatus;
  progress: SearchProgress;
  results: Lead[];
  createdAt: string;
  completedAt?: string;
  error?: string;
}

export interface SearchProgress {
  totalDiscovered: number;
  totalProcessed: number;
  totalEnriched: number;
  completionPercentage: number;
  currentStep: string;
}

export interface SearchHistoryItem {
  id: string;
  category: string;
  location: string;
  radius: number;
  status: SearchStatus;
  leadsFound: number;
  avgLeadScore: number;
  createdAt: string;
  completedAt?: string;
}

export interface DashboardStats {
  searchesToday: number;
  totalLeads: number;
  exportCount: number;
  avgLeadScore: number;
  searchSuccessRate: number;
  recentSearches: SearchHistoryItem[];
  leadsOverTime: { date: string; count: number }[];
  scoreDistribution: { range: string; count: number }[];
}
