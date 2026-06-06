import { Lead } from '../types/lead';

const EMAIL_REGEX = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;

const SOCIAL_PATTERNS: Record<string, RegExp> = {
  facebook: /https?:\/\/(www\.)?facebook\.com\/[a-zA-Z0-9._-]+/g,
  instagram: /https?:\/\/(www\.)?instagram\.com\/[a-zA-Z0-9._-]+/g,
  linkedin: /https?:\/\/(www\.)?linkedin\.com\/(company|in)\/[a-zA-Z0-9._-]+/g,
  twitter: /https?:\/\/(www\.)?(twitter|x)\.com\/[a-zA-Z0-9._-]+/g,
  youtube: /https?:\/\/(www\.)?youtube\.com\/(channel|c|@)[\/a-zA-Z0-9._-]+/g,
};

const CONTACT_PATHS = ['/contact', '/contact-us', '/contactus'];
const ABOUT_PATHS = ['/about', '/about-us', '/aboutus'];

interface CrawlResult {
  emails: string[];
  socialProfiles: Record<string, string>;
  contactPageUrl?: string;
  aboutPageUrl?: string;
  additionalPhones: string[];
}

export async function crawlBusinessWebsite(url: string, timeoutMs: number = 10000): Promise<CrawlResult> {
  const result: CrawlResult = { emails: [], socialProfiles: {}, additionalPhones: [] };
  try {
    const response = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; LeadGenBot/1.0)' },
      signal: AbortSignal.timeout(timeoutMs),
    });
    if (!response.ok) return result;
    const html = await response.text();

    const emailMatches = html.match(EMAIL_REGEX) || [];
    result.emails = [...new Set(emailMatches)].filter(
      (e) => !e.includes('example.com') && !e.includes('wixpress')
    );

    for (const [platform, regex] of Object.entries(SOCIAL_PATTERNS)) {
      const matches = html.match(regex);
      if (matches?.[0]) result.socialProfiles[platform] = matches[0];
    }

    const baseUrl = new URL(url).origin;
    for (const path of CONTACT_PATHS) {
      if (html.toLowerCase().includes(`href="${path}"`)) {
        result.contactPageUrl = `${baseUrl}${path}`;
        break;
      }
    }
    for (const path of ABOUT_PATHS) {
      if (html.toLowerCase().includes(`href="${path}"`)) {
        result.aboutPageUrl = `${baseUrl}${path}`;
        break;
      }
    }

    const phoneRegex = /(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g;
    result.additionalPhones = [...new Set(html.match(phoneRegex) || [])].slice(0, 3);
  } catch (err) {
    console.error(`[Web Crawler] Error crawling ${url}:`, err);
  }
  return result;
}

export function enrichLeadWithCrawlData(lead: Partial<Lead>, crawlResult: CrawlResult): Partial<Lead> {
  const enriched = { ...lead };
  const existingEmails = new Set(enriched.emails || []);
  crawlResult.emails.forEach((e) => existingEmails.add(e));
  enriched.emails = [...existingEmails];
  enriched.socialProfiles = { ...enriched.socialProfiles, ...crawlResult.socialProfiles };
  if (crawlResult.contactPageUrl) enriched.contactFormUrl = crawlResult.contactPageUrl;
  if (!enriched.secondaryPhone && crawlResult.additionalPhones.length > 0) {
    const newPhone = crawlResult.additionalPhones.find((p) => p !== enriched.primaryPhone);
    if (newPhone) enriched.secondaryPhone = newPhone;
  }
  enriched.enrichmentStatus = 'complete';
  enriched.enrichedAt = new Date().toISOString();
  return enriched;
}
