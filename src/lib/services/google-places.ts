import { Lead } from '../types/lead';
import { SearchParams } from '../types/search';
import { calculateLeadScore } from './scoring-engine';

/**
 * Google Places Service
 * Discovers businesses using Google Places API
 * Falls back to demo data if API key is not configured
 */

interface PlacesConfig {
  apiKey?: string;
}

interface GooglePlaceResult {
  place_id: string;
  name: string;
  formatted_address: string;
  geometry: {
    location: { lat: number; lng: number };
  };
  rating?: number;
  user_ratings_total?: number;
  types?: string[];
  business_status?: string;
  opening_hours?: {
    open_now?: boolean;
    weekday_text?: string[];
  };
}

interface GooglePlaceDetail {
  name: string;
  formatted_address: string;
  formatted_phone_number?: string;
  international_phone_number?: string;
  website?: string;
  url?: string;
  rating?: number;
  user_ratings_total?: number;
  opening_hours?: {
    weekday_text?: string[];
  };
  business_status?: string;
}

function milesToMeters(miles: number): number {
  return miles * 1609.344;
}

export async function searchGooglePlaces(
  params: SearchParams,
  config?: PlacesConfig
): Promise<Partial<Lead>[]> {
  const apiKey = config?.apiKey || process.env.GOOGLE_PLACES_API_KEY;

  if (!apiKey) {
    console.log('[Google Places] No API key — using demo data');
    return generateDemoLeads(params);
  }

  try {
    // Step 1: Geocode the location
    const geoRes = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(params.location)}&key=${apiKey}`
    );
    const geoData = await geoRes.json();

    if (!geoData.results?.length) {
      throw new Error(`Could not geocode location: ${params.location}`);
    }

    const { lat, lng } = geoData.results[0].geometry.location;

    // Step 2: Text search for businesses
    const query = `${params.category} in ${params.location}`;
    const radius = milesToMeters(params.radius);

    let allResults: GooglePlaceResult[] = [];
    let nextPageToken: string | null = null;

    // Initial search
    const searchUrl = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(query)}&location=${lat},${lng}&radius=${radius}&key=${apiKey}`;
    const searchRes = await fetch(searchUrl);
    const searchData = await searchRes.json();

    allResults = searchData.results || [];
    nextPageToken = searchData.next_page_token || null;

    // Paginate
    while (nextPageToken) {
      await new Promise((r) => setTimeout(r, 2000)); // Google requires delay
      const pageRes = await fetch(
        `https://maps.googleapis.com/maps/api/place/textsearch/json?pagetoken=${nextPageToken}&key=${apiKey}`
      );
      const pageData = await pageRes.json();
      allResults.push(...(pageData.results || []));
      nextPageToken = pageData.next_page_token || null;
    }

    // Step 3: Get details for each place
    const leads: Partial<Lead>[] = [];

    for (const place of allResults) {
      try {
        const detailRes = await fetch(
          `https://maps.googleapis.com/maps/api/place/details/json?place_id=${place.place_id}&fields=name,formatted_address,formatted_phone_number,international_phone_number,website,url,rating,user_ratings_total,opening_hours,business_status&key=${apiKey}`
        );
        const detailData = await detailRes.json();
        const detail: GooglePlaceDetail = detailData.result;

        const phone =
          detail.international_phone_number ||
          detail.formatted_phone_number ||
          undefined;

        const businessHours: Record<string, string> = {};
        detail.opening_hours?.weekday_text?.forEach((text) => {
          const [day, ...timeParts] = text.split(': ');
          if (day) businessHours[day] = timeParts.join(': ');
        });

        const lead: Partial<Lead> = {
          id: place.place_id,
          businessName: detail.name || place.name,
          category: params.category,
          placeId: place.place_id,
          address: detail.formatted_address || place.formatted_address,
          latitude: place.geometry.location.lat,
          longitude: place.geometry.location.lng,
          googleMapsUrl: detail.url,
          primaryPhone: phone,
          website: detail.website,
          domain: detail.website
            ? new URL(detail.website).hostname
            : undefined,
          rating: detail.rating || place.rating,
          reviewCount:
            detail.user_ratings_total || place.user_ratings_total,
          businessHours:
            Object.keys(businessHours).length > 0
              ? businessHours
              : undefined,
          emails: [],
          socialProfiles: {},
          enrichmentStatus: 'pending',
          dataSource: 'google_places',
          discoveredAt: new Date().toISOString(),
        };

        leads.push(lead);
      } catch (err) {
        console.error(`[Google Places] Error fetching details for ${place.name}:`, err);
        // Still add with basic info
        leads.push({
          id: place.place_id,
          businessName: place.name,
          category: params.category,
          placeId: place.place_id,
          address: place.formatted_address,
          latitude: place.geometry.location.lat,
          longitude: place.geometry.location.lng,
          rating: place.rating,
          reviewCount: place.user_ratings_total,
          emails: [],
          socialProfiles: {},
          enrichmentStatus: 'failed',
          dataSource: 'google_places',
          discoveredAt: new Date().toISOString(),
        });
      }
    }

    return leads;
  } catch (err) {
    console.error('[Google Places] Search failed, falling back to demo data:', err);
    return generateDemoLeads(params);
  }
}

// ─── Demo Data Generator ─────────────────────────────────────────────────────

const DEMO_BUSINESSES: Record<string, Array<{ name: string; domain: string; rating: number; reviews: number }>> = {
  dentist: [
    { name: 'SmileCraft Dental Studio', domain: 'smilecraft.com', rating: 4.8, reviews: 423 },
    { name: 'Pearl Dental Clinic', domain: 'pearldentalclinic.com', rating: 4.6, reviews: 287 },
    { name: 'Dr. Mehta\'s Advanced Dentistry', domain: 'mehtadental.in', rating: 4.9, reviews: 612 },
    { name: 'BrightSmile Orthodontics', domain: 'brightsmileortho.com', rating: 4.3, reviews: 156 },
    { name: 'City Dental Care', domain: 'citydentalcare.com', rating: 4.1, reviews: 89 },
    { name: 'Dentos Multispecialty Clinic', domain: 'dentosclinic.com', rating: 4.7, reviews: 345 },
    { name: 'Perfect Teeth Dental', domain: 'perfectteeth.co', rating: 3.9, reviews: 67 },
    { name: 'Royal Dental Hospital', domain: 'royaldentalhospital.com', rating: 4.5, reviews: 234 },
    { name: 'Healthy Gums Periodontics', domain: '', rating: 4.2, reviews: 45 },
    { name: 'KidSmile Pediatric Dental', domain: 'kidsmiledental.com', rating: 4.8, reviews: 178 },
    { name: 'OrthoZone Braces Center', domain: 'orthozone.in', rating: 4.4, reviews: 112 },
    { name: 'DentaLux Premium Care', domain: 'dentalux.com', rating: 4.6, reviews: 290 },
  ],
  restaurant: [
    { name: 'The Spice Route', domain: 'thespiceroute.com', rating: 4.7, reviews: 1230 },
    { name: 'Bistro 42', domain: 'bistro42.com', rating: 4.4, reviews: 567 },
    { name: 'Golden Dragon Chinese', domain: 'goldendragonrestaurant.com', rating: 4.2, reviews: 389 },
    { name: 'Mama\'s Kitchen', domain: 'mamaskitchen.co', rating: 4.8, reviews: 890 },
    { name: 'Urban Plate Café', domain: 'urbanplate.com', rating: 4.1, reviews: 234 },
    { name: 'Saffron Fine Dining', domain: 'saffronfinedining.com', rating: 4.9, reviews: 456 },
    { name: 'The Burger Joint', domain: 'theburgerjoint.co', rating: 4.3, reviews: 678 },
    { name: 'Jade Garden Asian Fusion', domain: 'jadegarden.com', rating: 4.0, reviews: 145 },
    { name: 'Pizzeria Napoli', domain: 'pizzerianapoli.com', rating: 4.6, reviews: 789 },
    { name: 'Coastal Seafood Grill', domain: 'coastalseafoodgrill.com', rating: 4.5, reviews: 345 },
    { name: 'Chai & Chaat Corner', domain: '', rating: 4.7, reviews: 567 },
    { name: 'La Maison French Bistro', domain: 'lamaisonbistro.com', rating: 4.8, reviews: 234 },
  ],
  'real estate': [
    { name: 'Prime Properties Group', domain: 'primepropertiesgroup.com', rating: 4.5, reviews: 234 },
    { name: 'Skyline Real Estate', domain: 'skylinerealestate.com', rating: 4.7, reviews: 189 },
    { name: 'HomeFirst Realty', domain: 'homefirstrealty.com', rating: 4.3, reviews: 145 },
    { name: 'Golden Key Properties', domain: 'goldenkeyproperties.com', rating: 4.1, reviews: 78 },
    { name: 'Urban Living Estates', domain: 'urbanlivingestates.com', rating: 4.8, reviews: 312 },
    { name: 'DreamHome Realtors', domain: 'dreamhomerealtors.co', rating: 4.2, reviews: 167 },
    { name: 'Metro Realty Associates', domain: 'metrorealty.com', rating: 4.6, reviews: 256 },
    { name: 'PropertyHub India', domain: 'propertyhub.in', rating: 4.0, reviews: 89 },
    { name: 'Elite Housing Solutions', domain: 'elitehousing.com', rating: 4.4, reviews: 123 },
    { name: 'Castle Real Estate', domain: 'castlerealestate.com', rating: 4.9, reviews: 456 },
  ],
  accountant: [
    { name: 'TaxPro Advisory', domain: 'taxproadvisory.com', rating: 4.6, reviews: 178 },
    { name: 'FinanceFirst CPA', domain: 'financefirstcpa.com', rating: 4.8, reviews: 234 },
    { name: 'Clear Books Accounting', domain: 'clearbooksaccounting.com', rating: 4.3, reviews: 89 },
    { name: 'Precision Tax Services', domain: 'precisiontax.com', rating: 4.5, reviews: 156 },
    { name: 'Elite Financial Partners', domain: 'elitefinancial.com', rating: 4.7, reviews: 267 },
    { name: 'QuickCount Bookkeeping', domain: 'quickcount.co', rating: 4.1, reviews: 45 },
    { name: 'Balance Sheet Advisors', domain: 'balancesheetadvisors.com', rating: 4.4, reviews: 134 },
    { name: 'Apex Chartered Accountants', domain: 'apexca.com', rating: 4.9, reviews: 312 },
    { name: 'NumberCrunch Services', domain: '', rating: 3.8, reviews: 23 },
    { name: 'Strategic Tax Planning', domain: 'strategictax.co', rating: 4.2, reviews: 67 },
  ],
  'interior designer': [
    { name: 'Luxe Interiors Studio', domain: 'luxeinteriors.com', rating: 4.7, reviews: 189 },
    { name: 'Design Palette Co.', domain: 'designpalette.co', rating: 4.9, reviews: 345 },
    { name: 'HomeCraft Design Studio', domain: 'homecraftdesign.com', rating: 4.4, reviews: 123 },
    { name: 'Urban Nest Interiors', domain: 'urbannest.com', rating: 4.6, reviews: 234 },
    { name: 'Elegant Spaces', domain: 'elegantspaces.in', rating: 4.2, reviews: 78 },
    { name: 'Modern Living Designs', domain: 'modernlivingdesigns.com', rating: 4.8, reviews: 267 },
    { name: 'Creative Corners Studio', domain: 'creativecorners.co', rating: 4.3, reviews: 89 },
    { name: 'Dream Space Architects', domain: 'dreamspace.com', rating: 4.5, reviews: 156 },
    { name: 'The Design Lab', domain: 'thedesignlab.com', rating: 4.1, reviews: 45 },
    { name: 'Palette & Stone Interiors', domain: 'paletteandstone.com', rating: 4.7, reviews: 201 },
  ],
};

const SOCIAL_PLATFORMS = ['facebook', 'instagram', 'linkedin', 'twitter', 'youtube'] as const;

const DEMO_STREETS = [
  'MG Road', 'Park Street', 'Main Street', 'Broadway', 'Station Road',
  'Church Street', 'Market Road', 'Hill Road', 'Lake Road', 'Ring Road',
  'Gandhi Nagar', 'Nehru Place', 'Commercial Street', 'Queens Road',
];

function generateDemoLeads(params: SearchParams): Partial<Lead>[] {
  const categoryKey = params.category.toLowerCase();
  const matchedKey = Object.keys(DEMO_BUSINESSES).find(
    (key) => categoryKey.includes(key) || key.includes(categoryKey)
  );

  const businesses = matchedKey
    ? DEMO_BUSINESSES[matchedKey]
    : generateGenericBusinesses(params.category, 12);

  return businesses.map((biz, index) => {
    const hasWebsite = !!biz.domain;
    const hasEmail = Math.random() > 0.3;
    const hasPhone = Math.random() > 0.15;
    const hasSecondaryPhone = hasPhone && Math.random() > 0.6;

    // Generate social profiles randomly
    const socialProfiles: Record<string, string> = {};
    SOCIAL_PLATFORMS.forEach((platform) => {
      if (Math.random() > 0.5) {
        socialProfiles[platform] = `https://${platform}.com/${biz.domain?.replace(/\.\w+$/, '') || biz.name.toLowerCase().replace(/\s+/g, '')}`;
      }
    });

    const emails: string[] = [];
    if (hasEmail) {
      emails.push(`info@${biz.domain || 'example.com'}`);
      if (Math.random() > 0.6) {
        emails.push(`contact@${biz.domain || 'example.com'}`);
      }
    }

    const street = DEMO_STREETS[index % DEMO_STREETS.length];
    const buildingNum = Math.floor(Math.random() * 500) + 1;

    const lead: Partial<Lead> = {
      id: `demo_${Date.now()}_${index}`,
      businessName: biz.name,
      category: params.category,
      placeId: `ChIJ_demo_${index}`,
      address: `${buildingNum}, ${street}, ${params.location}`,
      city: params.location,
      latitude: 19.076 + (Math.random() - 0.5) * 0.1,
      longitude: 72.8777 + (Math.random() - 0.5) * 0.1,
      googleMapsUrl: `https://maps.google.com/?q=${encodeURIComponent(biz.name + ' ' + params.location)}`,
      primaryPhone: hasPhone
        ? `+91 ${Math.floor(Math.random() * 9000000000 + 1000000000)}`
        : undefined,
      secondaryPhone: hasSecondaryPhone
        ? `+91 ${Math.floor(Math.random() * 9000000000 + 1000000000)}`
        : undefined,
      emails,
      contactFormUrl: hasWebsite ? `https://${biz.domain}/contact` : undefined,
      website: hasWebsite ? `https://${biz.domain}` : undefined,
      domain: biz.domain || undefined,
      socialProfiles,
      rating: biz.rating,
      reviewCount: biz.reviews,
      businessHours: {
        Monday: '9:00 AM – 6:00 PM',
        Tuesday: '9:00 AM – 6:00 PM',
        Wednesday: '9:00 AM – 6:00 PM',
        Thursday: '9:00 AM – 6:00 PM',
        Friday: '9:00 AM – 6:00 PM',
        Saturday: '10:00 AM – 4:00 PM',
        Sunday: 'Closed',
      },
      enrichmentStatus: 'complete',
      dataSource: 'demo',
      discoveredAt: new Date().toISOString(),
      enrichedAt: new Date().toISOString(),
    };

    // Calculate score
    const scoreBreakdown = calculateLeadScore(lead);
    lead.leadScore = scoreBreakdown.totalScore;
    lead.scoreBreakdown = scoreBreakdown;

    return lead;
  });
}

function generateGenericBusinesses(
  category: string,
  count: number
): Array<{ name: string; domain: string; rating: number; reviews: number }> {
  const adjectives = [
    'Premium', 'Elite', 'Pro', 'Master', 'Expert', 'Royal',
    'Golden', 'Star', 'Prime', 'Apex', 'Swift', 'Bright',
  ];
  const suffixes = [
    'Services', 'Solutions', 'Hub', 'Center', 'Studio',
    'Associates', 'Partners', 'Group', 'Corp', 'Agency',
    'Experts', 'Professionals',
  ];

  return Array.from({ length: count }, (_, i) => {
    const adj = adjectives[i % adjectives.length];
    const suf = suffixes[i % suffixes.length];
    const name = `${adj} ${category} ${suf}`;
    const domain = Math.random() > 0.2
      ? `${adj.toLowerCase()}${category.toLowerCase().replace(/\s/g, '')}${suf.toLowerCase()}.com`
      : '';

    return {
      name,
      domain,
      rating: Math.round((3.5 + Math.random() * 1.5) * 10) / 10,
      reviews: Math.floor(Math.random() * 500) + 10,
    };
  });
}
