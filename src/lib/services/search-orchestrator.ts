import { Lead } from '../types/lead';
import { SearchParams, SearchJob, SearchProgress } from '../types/search';
import { searchGooglePlaces } from './google-places';
import { searchBusinessesPython } from './python-scraper';
import { crawlBusinessWebsite, enrichLeadWithCrawlData } from './web-crawler';
import { calculateLeadScore } from './scoring-engine';

/**
 * Search Orchestrator
 * Coordinates the full lead discovery pipeline:
 * 1. Python Selenium discovery
 * 2. Website crawling & enrichment
 * 3. Lead scoring
 */

let searchJobs: Map<string, SearchJob> = new Map();

function generateId(): string {
  return `search_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export function getSearchJob(id: string): SearchJob | undefined {
  return searchJobs.get(id);
}

export function getAllSearchJobs(): SearchJob[] {
  return Array.from(searchJobs.values()).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export async function createSearchJob(params: SearchParams, sync: boolean = false): Promise<SearchJob> {
  const id = generateId();
  const job: SearchJob = {
    id,
    params,
    status: 'pending',
    progress: {
      totalDiscovered: 0,
      totalProcessed: 0,
      totalEnriched: 0,
      completionPercentage: 0,
      currentStep: 'Initializing search...',
    },
    results: [],
    createdAt: new Date().toISOString(),
  };

  searchJobs.set(id, job);

  const isServerless = !!(process.env.NETLIFY || process.env.VERCEL || process.env.LAMBDA_TASK_ROOT);

  if (sync || isServerless) {
    // Run the pipeline synchronously to prevent serverless function termination
    try {
      await runSearchPipeline(job);
    } catch (err) {
      job.status = 'failed';
      job.error = err instanceof Error ? err.message : String(err);
    }
  } else {
    // Run the pipeline (non-blocking)
    runSearchPipeline(job).catch((err) => {
      job.status = 'failed';
      job.error = err.message;
    });
  }

  return job;
}

async function runSearchPipeline(job: SearchJob): Promise<void> {
  try {
    job.status = 'running';
    job.progress.currentStep = 'Discovering businesses via Python Scraper...';

    // Step 1: Python Scraper Discovery (fallback to Google Places Demo if it fails)
    let rawLeads: Partial<Lead>[] = [];
    try {
      rawLeads = await searchBusinessesPython(job.params.category, job.params.location);
    } catch (err) {
      console.warn('Python scraper failed or is not running. Falling back to Google Places API / Demo Data.', err);
      job.progress.currentStep = 'Python scraper unavailable. Falling back to Google Places...';
      rawLeads = await searchGooglePlaces(job.params);
    }
    
    job.progress.totalDiscovered = rawLeads.length;
    job.progress.completionPercentage = 20;
    job.progress.currentStep = `Found ${rawLeads.length} businesses. Processing...`;

    // Step 2: Enrich each lead in parallel
    const isServerless = !!(process.env.NETLIFY || process.env.VERCEL || process.env.LAMBDA_TASK_ROOT);
    
    // Limit crawling in serverless environments to prevent timeouts
    let crawlCount = 0;
    const maxCrawls = isServerless ? 8 : 20;
    const timeoutMs = isServerless ? 3000 : 10000;

    const enrichmentPromises = rawLeads.map(async (rawLead) => {
      let lead = { ...rawLead };
      const shouldCrawl = lead.website && lead.dataSource !== 'demo' && crawlCount < maxCrawls;
      
      if (shouldCrawl) {
        crawlCount++;
        try {
          const crawlResult = await crawlBusinessWebsite(lead.website!, timeoutMs);
          lead = enrichLeadWithCrawlData(lead, crawlResult);
          job.progress.totalEnriched++;
        } catch {
          lead.enrichmentStatus = 'partial';
        }
      } else if (lead.dataSource === 'demo') {
        // Demo leads are already enriched
        job.progress.totalEnriched++;
      } else if (lead.website) {
        // Skipped crawling due to serverless limits
        lead.enrichmentStatus = 'partial';
      }

      // Step 2b: Calculate lead score
      const scoreBreakdown = calculateLeadScore(lead);
      lead.leadScore = scoreBreakdown.totalScore;
      lead.scoreBreakdown = scoreBreakdown;

      job.progress.totalProcessed++;
      job.progress.completionPercentage = 20 + Math.round((job.progress.totalProcessed / rawLeads.length) * 60);

      return lead as Lead;
    });

    const enrichedLeads = await Promise.all(enrichmentPromises);

    // Step 3: Sort by lead score (descending)
    enrichedLeads.sort((a, b) => b.leadScore - a.leadScore);

    // Apply filters
    let filteredLeads = enrichedLeads;
    if (job.params.filters) {
      const f = job.params.filters;
      filteredLeads = enrichedLeads.filter((lead) => {
        if (f.minRating && (lead.rating ?? 0) < f.minRating) return false;
        if (f.minReviews && (lead.reviewCount ?? 0) < f.minReviews) return false;
        if (f.hasWebsite && !lead.website) return false;
        if (f.hasEmail && lead.emails.length === 0) return false;
        if (f.hasPhone && !lead.primaryPhone) return false;
        return true;
      });
    }

    job.results = filteredLeads;
    job.status = 'completed';
    job.completedAt = new Date().toISOString();
    job.progress.completionPercentage = 100;
    job.progress.currentStep = 'Search complete!';

  } catch (err) {
    job.status = 'failed';
    job.error = err instanceof Error ? err.message : 'Unknown error';
    job.progress.currentStep = 'Search failed';
  }
}
