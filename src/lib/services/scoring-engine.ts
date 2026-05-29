import { Lead, ScoreBreakdown, ScoreFactor } from '../types/lead';

/**
 * AI Lead Scoring Engine
 * Calculates a lead score between 0-100 based on multiple factors
 */
export function calculateLeadScore(lead: Partial<Lead>): ScoreBreakdown {
  const factors: ScoreFactor[] = [];

  // Website Opportunity Score (20 points)
  // For web agencies, NOT having a website is a HIGH value opportunity
  const hasWebsite = !!lead.website && lead.website !== 'NA';
  factors.push({
    name: 'Website Opportunity',
    found: !hasWebsite,
    points: hasWebsite ? 0 : 20,
    maxPoints: 20,
    detail: hasWebsite 
      ? 'Already has a website (Lower Opportunity)' 
      : 'No website found (High Opportunity!)',
  });

  // Email Score (25 points)
  const hasEmail = (lead.emails?.length ?? 0) > 0;
  const emailCount = lead.emails?.length ?? 0;
  const emailPoints = hasEmail ? Math.min(25, 15 + emailCount * 5) : 0;
  factors.push({
    name: 'Contact Email Found',
    found: hasEmail,
    points: emailPoints,
    maxPoints: 25,
    detail: hasEmail ? `${emailCount} email(s) found` : 'No email addresses found',
  });

  // Phone Score (15 points)
  const hasPhone = !!lead.primaryPhone && lead.primaryPhone !== 'NA';
  const hasSecondaryPhone = !!lead.secondaryPhone;
  const phonePoints = hasPhone ? (hasSecondaryPhone ? 15 : 12) : 0;
  factors.push({
    name: 'Phone Number Available',
    found: hasPhone,
    points: phonePoints,
    maxPoints: 15,
    detail: hasPhone
      ? hasSecondaryPhone
        ? 'Primary & secondary phone found'
        : 'Primary phone found'
      : 'No phone number found',
  });

  // Rating Score (15 points)
  const rating = lead.rating ?? 0;
  const hasRating = rating > 0;
  let ratingPoints = 0;
  if (rating >= 4.5) ratingPoints = 15;
  else if (rating >= 4.0) ratingPoints = 12;
  else if (rating >= 3.5) ratingPoints = 9;
  else if (rating >= 3.0) ratingPoints = 6;
  else if (rating > 0) ratingPoints = 3;
  factors.push({
    name: 'Google Rating',
    found: hasRating,
    points: ratingPoints,
    maxPoints: 15,
    detail: hasRating ? `${rating} star rating` : 'No rating available',
  });

  // Review Score (15 points)
  const reviewCount = lead.reviewCount ?? 0;
  const hasReviews = reviewCount > 0;
  let reviewPoints = 0;
  if (reviewCount >= 500) reviewPoints = 15;
  else if (reviewCount >= 200) reviewPoints = 12;
  else if (reviewCount >= 50) reviewPoints = 10;
  else if (reviewCount >= 10) reviewPoints = 7;
  else if (reviewCount > 0) reviewPoints = 4;
  factors.push({
    name: 'Review Volume',
    found: hasReviews,
    points: reviewPoints,
    maxPoints: 15,
    detail: hasReviews ? `${reviewCount} reviews` : 'No reviews',
  });

  // Social Score (10 points)
  const socialProfiles = lead.socialProfiles ?? {};
  const socialCount = Object.values(socialProfiles).filter(Boolean).length;
  const hasSocial = socialCount > 0;
  const socialPoints = Math.min(10, socialCount * 2.5);
  factors.push({
    name: 'Social Media Presence',
    found: hasSocial,
    points: Math.round(socialPoints),
    maxPoints: 10,
    detail: hasSocial
      ? `${socialCount} social profile(s) found`
      : 'No social media profiles found',
  });

  const totalScore = factors.reduce((sum, f) => sum + f.points, 0);

  return {
    websiteScore: factors[0].points,
    emailScore: factors[1].points,
    phoneScore: factors[2].points,
    ratingScore: factors[3].points,
    reviewScore: factors[4].points,
    socialScore: factors[5].points,
    totalScore: Math.round(totalScore),
    factors,
  };
}
