import { Lead, EnrichmentStatus } from '../types/lead';

export interface PythonScraperResult {
  business_name: string;
  category: string;
  rating: string;
  reviews: string;
  address: string;
  website: string;
  phone_number: string;
}

export async function searchBusinessesPython(
  category: string,
  location: string
): Promise<Lead[]> {
  try {
    console.log(`[Python Scraper] Requesting data for ${category} in ${location}...`);
    
    // Call the Python Microservice running locally on port 5000
    const response = await fetch('http://localhost:5000/scrape', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        keyword: category,
        location: location
      }),
      // We might need a longer timeout if the scraper takes a while
      signal: AbortSignal.timeout(300000) // 5 minutes timeout
    });

    if (!response.ok) {
      throw new Error(`Python scraper failed with status ${response.status}`);
    }

    const data = await response.json();
    
    if (data.status !== 'success') {
      throw new Error(data.message || 'Unknown error from python scraper');
    }

    // Map Python scraper results to our standard Lead format
    const leads: Lead[] = data.results.map((result: PythonScraperResult, index: number) => {
      // Clean up the rating (e.g., "4.5" string to 4.5 number)
      let ratingScore = undefined;
      if (result.rating && result.rating !== 'N/A') {
        const parsed = parseFloat(result.rating);
        if (!isNaN(parsed)) ratingScore = parsed;
      }

      // Clean up reviews (e.g., "1,200" or "1200 reviews" to 1200 number)
      let reviewCount = undefined;
      if (result.reviews && result.reviews !== 'N/A') {
        const parsed = parseInt(result.reviews.replace(/[^0-9]/g, ''), 10);
        if (!isNaN(parsed)) reviewCount = parsed;
      }

      const website = result.website !== 'N/A' ? result.website : undefined;
      const phone = result.phone_number !== 'N/A' ? result.phone_number : undefined;
      const address = result.address !== 'N/A' ? result.address : 'Unknown Address';
      const name = result.business_name || `Unknown Business ${index}`;
      
      // Extract domain from website for standard format
      let domain;
      if (website) {
        try {
          const urlObj = new URL(website.startsWith('http') ? website : `https://${website}`);
          domain = urlObj.hostname.replace('www.', '');
        } catch (e) {
          // ignore parsing error
        }
      }

      return {
        id: `py_${Date.now()}_${index}`,
        businessName: name,
        category: result.category !== 'N/A' ? result.category : category,
        address: address,
        city: location,
        website: website,
        domain: domain,
        primaryPhone: phone,
        emails: [],
        socialProfiles: {},
        rating: ratingScore,
        reviewCount: reviewCount,
        enrichmentStatus: 'pending' as EnrichmentStatus,
        dataSource: 'selenium',
        discoveredAt: new Date().toISOString(),
        leadScore: 0
      };
    });

    console.log(`[Python Scraper] Found ${leads.length} leads.`);
    return leads;
  } catch (error) {
    console.error('[Python Scraper] Failed to fetch leads:', error);
    throw error;
  }
}
