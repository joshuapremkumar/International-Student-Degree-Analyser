import { Request, Response, NextFunction } from 'express';
import { searchSchema } from '../utils/validators';
import { searchUniversities } from '../services/tavilyService';
import { getCachedResults, cacheResults } from '../services/cacheService';
import type { UniversityData } from '../types';

export async function searchDegrees(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    // Validate input
    const { degree } = searchSchema.parse(req.body);

    console.log(`Searching for degree: ${degree}`);

    // Check cache first
    const cachedResults = await getCachedResults(degree);
    
    if (cachedResults && cachedResults.length > 0) {
      console.log(`Cache hit for degree: ${degree}`);
      res.json({
        success: true,
        data: {
          queryId: 'cached',
          degree,
          results: cachedResults,
          cached: true,
        },
      });
      return;
    }

    console.log(`Cache miss for degree: ${degree}, fetching from Tavily...`);

    // Fetch from Tavily API
    const results = await searchUniversities(degree);

    // Cache the results
    await cacheResults(degree, results);

    res.json({
      success: true,
      data: {
        queryId: 'fresh',
        degree,
        results,
        cached: false,
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function getHealth(
  req: Request,
  res: Response
): Promise<void> {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
  });
}
