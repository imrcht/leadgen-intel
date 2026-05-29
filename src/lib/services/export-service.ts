import { Lead } from '../types/lead';
import Papa from 'papaparse';

export function exportToCSV(leads: Lead[]): string {
  const rows = leads.map(flattenLead);
  return Papa.unparse(rows);
}

export function exportToJSON(leads: Lead[]): string {
  return JSON.stringify(leads, null, 2);
}

function flattenLead(lead: Lead): Record<string, string | number> {
  return {
    'Business Name': lead.businessName,
    'Category': lead.category,
    'Address': lead.address,
    'Phone': lead.primaryPhone || '',
    'Secondary Phone': lead.secondaryPhone || '',
    'Email(s)': lead.emails.join('; '),
    'Website': lead.website || '',
    'Domain': lead.domain || '',
    'Facebook': lead.socialProfiles?.facebook || '',
    'Instagram': lead.socialProfiles?.instagram || '',
    'LinkedIn': lead.socialProfiles?.linkedin || '',
    'Twitter': lead.socialProfiles?.twitter || '',
    'YouTube': lead.socialProfiles?.youtube || '',
    'Rating': lead.rating ?? '',
    'Reviews': lead.reviewCount ?? '',
    'Lead Score': lead.leadScore,
    'Google Maps URL': lead.googleMapsUrl || '',
    'Contact Form': lead.contactFormUrl || '',
    'Data Source': lead.dataSource,
  };
}
