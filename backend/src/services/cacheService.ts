import { prisma } from '../config/database';
import type { UniversityData } from '../types';
import { env } from '../config/env';

export async function getCachedResults(degree: string): Promise<UniversityData[] | null> {
  try {
    const searchQuery = await prisma.searchQuery.findFirst({
      where: {
        degree: {
          equals: degree,
          mode: 'insensitive',
        },
      },
      include: {
        results: {
          where: {
            expiresAt: {
              gt: new Date(),
            },
          },
          orderBy: {
            ranking: 'asc',
          },
        },
      },
    });

    if (!searchQuery || searchQuery.results.length === 0) {
      return null;
    }

    // Map database results to UniversityData format
    return searchQuery.results.map((result: {
      id: string;
      universityName: string;
      country: string;
      ranking: number;
      pswDuration: string;
      pswDetails: string;
      industryMatch: string;
      majorEmployers: string[];
      employabilityRank: number | null;
      graduateEmploymentRate: string | null;
      avgStartingSalary: string | null;
      healthInsurance: string;
      visaFees: string;
      proofOfFunds: string;
      fullRideAvailable: boolean;
      fullRideDetails: string | null;
      tuitionWaiverAvailable: boolean;
      tuitionWaiverDetails: string | null;
      accreditationBodies: string[];
      accreditationDetails: string | null;
      sourceUrl: string | null;
      cachedAt: Date;
    }) => ({
      id: result.id,
      universityName: result.universityName,
      country: result.country,
      ranking: result.ranking,
      pswDuration: result.pswDuration,
      pswDetails: result.pswDetails,
      industryMatch: result.industryMatch,
      majorEmployers: result.majorEmployers,
      employabilityRank: result.employabilityRank ?? undefined,
      graduateEmploymentRate: result.graduateEmploymentRate ?? undefined,
      avgStartingSalary: result.avgStartingSalary ?? undefined,
      healthInsurance: result.healthInsurance,
      visaFees: result.visaFees,
      proofOfFunds: result.proofOfFunds,
      fullRideAvailable: result.fullRideAvailable,
      fullRideDetails: result.fullRideDetails ?? undefined,
      tuitionWaiverAvailable: result.tuitionWaiverAvailable,
      tuitionWaiverDetails: result.tuitionWaiverDetails ?? undefined,
      accreditationBodies: result.accreditationBodies,
      accreditationDetails: result.accreditationDetails ?? undefined,
      sourceUrl: result.sourceUrl ?? undefined,
      cachedAt: result.cachedAt.toISOString(),
    }));
  } catch (error) {
    console.error('Cache retrieval error:', error);
    return null;
  }
}

export async function cacheResults(
  degree: string,
  results: UniversityData[]
): Promise<void> {
  try {
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + env.CACHE_TTL_HOURS);

    // Create or update search query
    const searchQuery = await prisma.searchQuery.upsert({
      where: {
        id: (await prisma.searchQuery.findFirst({
          where: { degree: { equals: degree, mode: 'insensitive' } },
        }))?.id || '',
      },
      update: {
        updatedAt: new Date(),
      },
      create: {
        degree: degree,
      },
    });

    // Delete old results
    await prisma.searchResult.deleteMany({
      where: { searchQueryId: searchQuery.id },
    });

    // Insert new results
    await prisma.searchResult.createMany({
      data: results.map((result) => ({
        searchQueryId: searchQuery.id,
        universityName: result.universityName,
        country: result.country,
        ranking: result.ranking,
        pswDuration: result.pswDuration,
        pswDetails: result.pswDetails,
        industryMatch: result.industryMatch,
        majorEmployers: result.majorEmployers,
        employabilityRank: result.employabilityRank ?? null,
        graduateEmploymentRate: result.graduateEmploymentRate ?? null,
        avgStartingSalary: result.avgStartingSalary ?? null,
        healthInsurance: result.healthInsurance,
        visaFees: result.visaFees,
        proofOfFunds: result.proofOfFunds,
        fullRideAvailable: result.fullRideAvailable,
        fullRideDetails: result.fullRideDetails ?? null,
        tuitionWaiverAvailable: result.tuitionWaiverAvailable,
        tuitionWaiverDetails: result.tuitionWaiverDetails ?? null,
        accreditationBodies: result.accreditationBodies,
        accreditationDetails: result.accreditationDetails ?? null,
        sourceUrl: result.sourceUrl ?? null,
        expiresAt: expiresAt,
      })),
    });

    console.log(`Cached ${results.length} results for degree: ${degree}`);
  } catch (error) {
    console.error('Cache storage error:', error);
    // Don't throw - caching failure shouldn't break the request
  }
}

export async function clearExpiredCache(): Promise<number> {
  try {
    const result = await prisma.searchResult.deleteMany({
      where: {
        expiresAt: {
          lt: new Date(),
        },
      },
    });

    console.log(`Cleared ${result.count} expired cache entries`);
    return result.count;
  } catch (error) {
    console.error('Cache cleanup error:', error);
    return 0;
  }
}
