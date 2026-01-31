import { tavily } from '@tavily/core';
import { env } from '../config/env';
import type { UniversityData } from '../types';

const client = tavily({
  apiKey: env.TAVILY_API_KEY,
});

function buildSearchQuery(degree: string): string {
  return `
Find the top 30 universities worldwide for ${degree} degree.
For each university, provide detailed information in a structured format:

1. University name and country
2. Post-Study Work visa duration and specific requirements for international students
3. Industry hub relevance - how ${degree} matches the country's economy and major employers
4. Graduate employability statistics - employment rate and average starting salary
5. Hidden costs - health insurance, visa fees, and proof of funds requirements
6. Scholarship availability - distinguish between full-ride scholarships (rare) and tuition waivers (common)
7. Accreditation bodies - list relevant global accreditation (e.g., AACSB for Business, ABET for Engineering)

Please provide specific, factual data with sources where possible.
`;
}

function parseTavilyResponse(rawResponse: string, degree: string): UniversityData[] {
  // This is a simplified parser - in production, you'd want more robust parsing
  // Tavily returns search results that need to be processed
  
  const results: UniversityData[] = [];
  const now = new Date();
  const expiresAt = new Date(now.getTime() + env.CACHE_TTL_HOURS * 60 * 60 * 1000);

  // Mock data structure for demonstration
  // In production, this would parse the actual Tavily response
  const mockUniversities = [
    {
      universityName: 'Massachusetts Institute of Technology',
      country: 'USA',
      ranking: 1,
      pswDuration: '3 years (STEM OPT extension)',
      pswDetails: 'Optional Practical Training (OPT) allows 12 months + 24 months STEM extension',
      industryMatch: 'Silicon Valley tech hub, Boston biotech corridor',
      majorEmployers: ['Google', 'Microsoft', 'Apple', 'Amazon', 'Meta'],
      employabilityRank: 1,
      graduateEmploymentRate: '95% within 6 months',
      avgStartingSalary: '$120,000 - $150,000',
      healthInsurance: '$3,000 - $4,000 per year',
      visaFees: '$510 (SEVIS $350 + Visa $160)',
      proofOfFunds: '$60,000 - $75,000',
      fullRideAvailable: false,
      fullRideDetails: 'Extremely rare, only for exceptional candidates',
      tuitionWaiverAvailable: true,
      tuitionWaiverDetails: 'TA/RA positions available covering tuition + stipend',
      accreditationBodies: ['ABET', 'NEASC'],
      accreditationDetails: 'ABET accredited engineering programs',
    },
    {
      universityName: 'Stanford University',
      country: 'USA',
      ranking: 2,
      pswDuration: '3 years (STEM OPT extension)',
      pswDetails: 'OPT 12 months + 24 months STEM extension available',
      industryMatch: 'Heart of Silicon Valley, venture capital hub',
      majorEmployers: ['Google', 'Apple', 'Netflix', 'Tesla', 'NVIDIA'],
      employabilityRank: 2,
      graduateEmploymentRate: '94% within 6 months',
      avgStartingSalary: '$125,000 - $160,000',
      healthInsurance: '$3,200 per year',
      visaFees: '$510',
      proofOfFunds: '$70,000 - $80,000',
      fullRideAvailable: false,
      fullRideDetails: 'Need-based aid available but full rides rare',
      tuitionWaiverAvailable: true,
      tuitionWaiverDetails: 'Graduate assistantships available',
      accreditationBodies: ['ABET', 'WASC'],
      accreditationDetails: 'WASC Senior College and University Commission',
    },
    {
      universityName: 'University of Cambridge',
      country: 'UK',
      ranking: 3,
      pswDuration: '2 years (Graduate Route)',
      pswDetails: 'Graduate Route visa allows 2 years work post-PhD, 2 years for Masters',
      industryMatch: 'London finance hub, Cambridge tech cluster',
      majorEmployers: ['HSBC', 'BP', 'GSK', 'Rolls-Royce', 'ARM'],
      employabilityRank: 3,
      graduateEmploymentRate: '92% within 6 months',
      avgStartingSalary: '£35,000 - £50,000',
      healthInsurance: 'NHS surcharge £470/year',
      visaFees: '£490 visa + £470 NHS/year',
      proofOfFunds: '£12,000 - £15,000',
      fullRideAvailable: true,
      fullRideDetails: 'Gates Cambridge, Commonwealth Scholarships available',
      tuitionWaiverAvailable: true,
      tuitionWaiverDetails: 'Various college-specific scholarships',
      accreditationBodies: ['QAA', 'Engineering Council'],
      accreditationDetails: 'UK QAA quality assured',
    },
  ];

  mockUniversities.forEach((uni, index) => {
    results.push({
      id: `uni-${index}`,
      ...uni,
      cachedAt: now.toISOString(),
    });
  });

  return results;
}

export async function searchUniversities(degree: string): Promise<UniversityData[]> {
  try {
    const query = buildSearchQuery(degree);
    
    const response = await client.search(query, {
      searchDepth: 'advanced',
      maxResults: 30,
      includeAnswer: true,
    });

    console.log('Tavily response received:', response.answer ? 'Has answer' : 'No answer');

    // Parse the response into structured data
    const universities = parseTavilyResponse(response.answer || '', degree);
    
    return universities;
  } catch (error) {
    console.error('Tavily search error:', error);
    throw new Error('Failed to fetch university data');
  }
}
