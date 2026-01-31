import dotenv from 'dotenv';

dotenv.config();

export const env = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT || '3000', 10),
  DATABASE_URL: process.env.DATABASE_URL || '',
  TAVILY_API_KEY: process.env.TAVILY_API_KEY || '',
  CACHE_TTL_HOURS: parseInt(process.env.CACHE_TTL_HOURS || '24', 10),
} as const;

// Validate required environment variables
export function validateEnv(): void {
  const required = ['DATABASE_URL', 'TAVILY_API_KEY'];
  
  for (const key of required) {
    if (!process.env[key]) {
      throw new Error(`Missing required environment variable: ${key}`);
    }
  }
}
