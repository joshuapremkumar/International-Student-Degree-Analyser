import rateLimit from 'express-rate-limit';

export const searchRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // limit each IP to 10 requests per windowMs
  message: {
    error: 'Too many search requests',
    message: 'Please try again later. Maximum 10 searches per 15 minutes.',
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    // Use IP address as key
    return req.ip || req.socket.remoteAddress || 'unknown';
  },
});

export const generalRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 60, // 60 requests per minute
  message: {
    error: 'Too many requests',
    message: 'Please slow down.',
  },
});
