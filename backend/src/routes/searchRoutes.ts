import { Router } from 'express';
import { searchDegrees, getHealth } from '../controllers/searchController';
import { searchRateLimiter, generalRateLimiter } from '../middleware/rateLimiter';

const router = Router();

// Health check endpoint
router.get('/health', generalRateLimiter, getHealth);

// Search endpoint with stricter rate limiting
router.post('/search', searchRateLimiter, searchDegrees);

export default router;
