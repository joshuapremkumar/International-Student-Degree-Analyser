# International Student Degree Analyser - Technical Plan

## Project Overview

A web application that helps international students find top colleges for their desired degrees worldwide. The platform provides comprehensive information including Post-Study Work Visas, Industry Hubs, Employability Rankings, Hidden Costs, Scholarship Realism, and Global Recognition for the top 30 universities globally for any given degree.

---

## How This Solution Works

### What Pattern Did I Use?

**Pattern: BFF (Backend-for-Frontend) + Cache-Aside with API Aggregation**

```mermaid
flowchart LR
    A[User] -->|1. Search Degree| B[React Frontend]
    B -->|2. HTTP Request| C[Express Backend]
    C -->|3. Check Cache| D[(PostgreSQL)]
    D -->|4. Cache Hit?| C
    C -->|5a. Yes: Return Cached| B
    C -->|5b. No: Call API| E[Tavily API]
    E -->|6. Raw Results| C
    C -->|7. Process & Store| D
    C -->|8. Structured Response| B
    B -->|9. Render Table| A
```

**Key Patterns Applied:**

1. **Backend-for-Frontend (BFF)**: The Express backend acts as a dedicated API layer that:
   - Hides the Tavily API key from the client
   - Aggregates multiple data points into a single structured response
   - Handles rate limiting and caching

2. **Cache-Aside Pattern**: The backend checks PostgreSQL cache before calling Tavily API:
   - Reduces API costs (Tavily charges per call)
   - Improves response time for repeated searches
   - Cache expires after 24 hours to keep data fresh

3. **API Aggregation**: Single search query returns all 6 data categories (PSW, Industry, Employability, Costs, Scholarships, Accreditation) in one response

---

### Why This Approach Over Alternatives?

| Alternative | Why Rejected | Why BFF + Cache Wins |
|-------------|--------------|---------------------|
| **Direct Tavily call from frontend** | Exposes API key in browser; no caching | Backend proxy protects keys; cache reduces costs |
| **Serverless functions only** | Cold start latency; harder to debug | Express server provides consistent performance |
| **NoSQL database (MongoDB)** | Complex relational data (universities ↔ searches) | PostgreSQL + Prisma handles relationships better |
| **GraphQL** | Overkill for single search endpoint | REST is simpler and sufficient |
| **Redis for caching** | Adds infrastructure complexity | PostgreSQL JSONB columns sufficient for MVP |
| **Next.js full-stack** | Vendor lock-in to Vercel | Separate frontend/backend allows flexible hosting |

**Key Decisions:**

1. **Separate Frontend/Backend**: Allows independent scaling and deployment. Frontend on Vercel (edge-cached), backend on Render (always-on).

2. **PostgreSQL for Cache**: Using JSONB columns to store cached Tavily responses avoids adding Redis complexity while still providing fast reads.

3. **Prisma ORM**: Type-safe database queries with automatic migration handling. Prevents SQL injection and provides IntelliSense.

4. **React Query**: Handles loading states, error retries, and background refetching automatically. Reduces boilerplate vs Redux/Context.

5. **shadcn/ui**: Pre-built accessible components that copy into your codebase (not a dependency). Full customization without fighting a design system.

---

### What Are The Tradeoffs?

| Aspect | Tradeoff | Mitigation |
|--------|----------|------------|
| **Cost vs Freshness** | 24-hour cache may serve stale data | Add "refresh" button to force new API call |
| **Complexity vs Security** | Backend adds deployment complexity | Render's free tier auto-deploys from Git |
| **Speed vs Accuracy** | Tavily AI may hallucinate university data | Add source URLs; display confidence scores |
| **Scalability vs Simplicity** | Single backend instance has limits | Stateless design allows horizontal scaling |
| **Features vs Time** | 30 universities × 6 categories = large payload | Implement pagination; lazy-load details |
| **Free Tier Limits** | Tavily 1,000 calls/month | Cache aggressively; add usage dashboard |

**Specific Tradeoffs:**

1. **Cache Size**: Storing 30 universities × 6 data categories per search could bloat the database. **Solution**: Only cache top 10 results; fetch remaining on-demand.

2. **Tavily Dependency**: If Tavily API is down or changes pricing, the app breaks. **Solution**: Implement fallback to cached data with "last updated" timestamp.

3. **Cold Starts**: Render free tier spins down after inactivity (15s cold start). **Solution**: Add a ping endpoint called by a cron job every 10 minutes.

4. **Data Accuracy**: AI-generated data may be outdated or incorrect. **Solution**: Display source URLs; add user feedback mechanism; manual verification workflow.

---

### What Would Break This?

**Single Points of Failure:**

1. **Tavily API Outage**
   - **Impact**: No new search results
   - **Detection**: Health check endpoint fails
   - **Recovery**: Serve cached results; queue requests for retry

2. **Database Connection Loss**
   - **Impact**: Cannot read/write cache
   - **Detection**: Prisma connection errors
   - **Recovery**: Direct Tavily calls with increased rate limiting

3. **Rate Limiting Exhaustion**
   - **Impact**: 429 errors from Tavily
   - **Detection**: HTTP 429 responses
   - **Recovery**: Exponential backoff; user message "Try again later"

4. **Vercel/Render Service Suspension**
   - **Impact**: Complete downtime
   - **Detection**: Uptime monitoring (UptimeRobot)
   - **Recovery**: Deploy to alternative (Netlify + Railway)

**Security Vulnerabilities:**

1. **API Key Leak**: If `.env` file is committed to Git
   - **Prevention**: `.gitignore` + GitHub secret scanning

2. **DDoS Attack**: Flooding search endpoint
   - **Prevention**: Rate limiting + Cloudflare (free plan)

3. **SQL Injection**: Malicious degree input
   - **Prevention**: Prisma ORM (parameterized queries) + Zod validation

4. **CORS Misconfiguration**: Unauthorized domains calling API
   - **Prevention**: Strict origin whitelist + preflight checks

**Data Integrity Issues:**

1. **Tavily Schema Changes**: API response format changes
   - **Prevention**: Zod schema validation with fallback defaults

2. **Concurrent Updates**: Race condition on cache writes
   - **Prevention**: Database unique constraints + upsert operations

3. **Timezone Confusion**: Cache expiry in wrong timezone
   - **Prevention**: Store all timestamps in UTC; convert on display

**Scaling Bottlenecks:**

1. **Database Connection Pool**: Default 10 connections may exhaust
   - **Solution**: Connection pooling (PgBouncer) on paid tier

2. **Large Result Sets**: 30 universities × rich data = slow JSON serialization
   - **Solution**: Pagination (10 per page) + cursor-based pagination

3. **Memory Leaks**: Unclosed database connections
   - **Solution**: Proper cleanup in finally blocks; connection timeouts

---

## Technology Stack

| Component | Technology |
|-----------|------------|
| **Frontend** | React 18+ with TypeScript |
| **Styling** | Tailwind CSS |
| **UI Components** | shadcn/ui |
| **State Management** | React Query (TanStack Query) |
| **Routing** | React Router v6 |
| **Build Tool** | Vite |
| **Backend** | Node.js + Express |
| **Database** | PostgreSQL |
| **ORM** | Prisma |
| **Search API** | Tavily API |
| **Frontend Hosting** | Vercel |
| **Backend Hosting** | Render/Railway |

---

## Architecture Overview

```mermaid
flowchart TB
    subgraph Client["Client Layer"]
        Browser["Browser"]
        ReactApp["React SPA
        - Search Form
        - Results Table
        - University Cards"]
    end

    subgraph Vercel["Vercel (Frontend Hosting)"]
        StaticAssets["Static Assets"]
        EdgeFunctions["Edge Functions (Optional)"]
    end

    subgraph Backend["Render/Railway (Backend)"]
        Express["Express.js API Server"]
        RateLimiter["Rate Limiter Middleware"]
        CacheLayer["Redis Cache Layer"]
    end

    subgraph External["External Services"]
        Tavily["Tavily Search API"]
    end

    subgraph Database["Database Layer"]
        Postgres[("PostgreSQL
        - Cached Results
        - Search History")]
    end

    Browser --> ReactApp
    ReactApp --> StaticAssets
    ReactApp --> Express
    Express --> RateLimiter
    Express --> CacheLayer
    Express --> Tavily
    Express --> Postgres
    CacheLayer --> Postgres
```

---

## Core Features

### 1. Degree Search
- Input: Degree name (e.g., "Computer Science", "MBA", "Mechanical Engineering")
- Output: Top 30 universities with detailed information

### 2. Data Points Per University

| Category | Information Provided |
|----------|---------------------|
| **Post-Study Work (PSW) Visa** | Duration allowed to stay after graduation, work permit details |
| **Industry Hubs** | How the degree matches the country's economy, major employers |
| **Employability Rankings** | Graduate employment rate, average starting salary |
| **Hidden Costs** | Health insurance, visa fees, proof of funds requirements |
| **Scholarship Realism** | Full-ride vs tuition waivers, availability statistics |
| **Global Recognition** | Accreditation bodies (AACSB, ABET, etc.) |

### 3. Results Display
- Sortable table with all 30 universities
- Expandable cards for detailed view
- Export to PDF/CSV option

---

## File Structure

```
international-student-degree-analyser/
├── frontend/                          # React Frontend
│   ├── public/
│   │   ├── favicon.ico
│   │   └── logo.svg
│   ├── src/
│   │   ├── components/               # Reusable UI Components
│   │   │   ├── ui/                   # shadcn/ui components
│   │   │   ├── SearchForm.tsx        # Main search input
│   │   │   ├── ResultsTable.tsx      # Data table display
│   │   │   ├── UniversityCard.tsx    # Individual university details
│   │   │   ├── LoadingSkeleton.tsx   # Loading states
│   │   │   └── ErrorBoundary.tsx     # Error handling
│   │   ├── hooks/                    # Custom React hooks
│   │   │   ├── useUniversitySearch.ts
│   │   │   └── useDebounce.ts
│   │   ├── services/                 # API calls
│   │   │   └── api.ts
│   │   ├── types/                    # TypeScript interfaces
│   │   │   └── university.ts
│   │   ├── utils/                    # Helper functions
│   │   │   └── formatters.ts
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   └── index.css
│   ├── index.html
│   ├── package.json
│   ├── tailwind.config.js
│   ├── tsconfig.json
│   └── vite.config.ts
│
├── backend/                           # Node.js Backend
│   ├── src/
│   │   ├── config/                   # Configuration
│   │   │   ├── database.ts
│   │   │   └── env.ts
│   │   ├── controllers/              # Route handlers
│   │   │   └── searchController.ts
│   │   ├── middleware/               # Express middleware
│   │   │   ├── rateLimiter.ts
│   │   │   ├── errorHandler.ts
│   │   │   └── cors.ts
│   │   ├── routes/                   # API routes
│   │   │   └── searchRoutes.ts
│   │   ├── services/                 # Business logic
│   │   │   ├── tavilyService.ts      # Tavily API integration
│   │   │   ├── cacheService.ts       # Redis caching
│   │   │   └── dataProcessor.ts      # Data transformation
│   │   ├── models/                   # Database models
│   │   │   └── SearchResult.ts
│   │   ├── utils/                    # Utilities
│   │   │   └── validators.ts
│   │   └── app.ts
│   ├── prisma/
│   │   └── schema.prisma             # Database schema
│   ├── package.json
│   ├── tsconfig.json
│   └── .env.example
│
├── shared/                            # Shared types/constants
│   └── types/
│       └── index.ts
│
├── docs/                              # Documentation
│   └── api-docs.md
│
├── .gitignore
├── README.md
└── docker-compose.yml                 # Local development
```

---

## Database Schema (Prisma)

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model SearchQuery {
  id          String   @id @default(uuid())
  degree      String
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  results     SearchResult[]
  
  @@index([degree])
  @@index([createdAt])
}

model SearchResult {
  id                    String   @id @default(uuid())
  searchQueryId         String
  searchQuery           SearchQuery @relation(fields: [searchQueryId], references: [id])
  
  // University Info
  universityName        String
  country               String
  ranking               Int
  
  // PSW Visa Info
  pswDuration           String   // e.g., "2 years", "3 years"
  pswDetails            String   @db.Text
  
  // Industry Hubs
  industryMatch         String   @db.Text
  majorEmployers        String[] // Array of company names
  
  // Employability
  employabilityRank     Int?
  graduateEmploymentRate String?
  avgStartingSalary     String?
  
  // Hidden Costs
  healthInsurance       String
  visaFees              String
  proofOfFunds          String
  
  // Scholarships
  fullRideAvailable     Boolean
  fullRideDetails       String?  @db.Text
  tuitionWaiverAvailable Boolean
  tuitionWaiverDetails  String?  @db.Text
  
  // Accreditation
  accreditationBodies   String[] // e.g., ["AACSB", "ABET"]
  accreditationDetails  String?  @db.Text
  
  // Metadata
  sourceUrl             String?
  cachedAt              DateTime @default(now())
  expiresAt             DateTime // Cache expiration
  
  @@index([searchQueryId])
  @@index([universityName])
  @@index([country])
}
```

---

## Security Considerations

### 1. API Key Protection
- **Issue**: Tavily API key exposed if called directly from frontend
- **Solution**: Backend proxy with environment variables

```typescript
// backend/src/services/tavilyService.ts
import { TavilyClient } from '@tavily/core';

const tavily = new TavilyClient({
  apiKey: process.env.TAVILY_API_KEY!, // Never exposed to client
});
```

### 2. Rate Limiting
Prevent API abuse and control costs:

```typescript
// backend/src/middleware/rateLimiter.ts
import rateLimit from 'express-rate-limit';

export const searchRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // limit each IP to 10 requests per windowMs
  message: 'Too many search requests, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});
```

### 3. Input Validation
Sanitize all user inputs:

```typescript
// backend/src/utils/validators.ts
import { z } from 'zod';

export const searchSchema = z.object({
  degree: z.string()
    .min(2, 'Degree name too short')
    .max(100, 'Degree name too long')
    .regex(/^[a-zA-Z0-9\s\-]+$/, 'Invalid characters in degree name'),
});
```

### 4. CORS Configuration
Restrict API access to known origins:

```typescript
// backend/src/middleware/cors.ts
import cors from 'cors';

const allowedOrigins = [
  'https://your-app.vercel.app',
  'http://localhost:5173', // Development
];

export const corsOptions: cors.CorsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};
```

### 5. Environment Variables
```bash
# backend/.env
NODE_ENV=production
PORT=3000
DATABASE_URL=postgresql://user:pass@host:5432/dbname
TAVILY_API_KEY=tvly-xxxxxxxxxxxxxxxx
REDIS_URL=redis://localhost:6379
CACHE_TTL_HOURS=24
```

### 6. Error Handling
Never expose stack traces or internal details:

```typescript
// backend/src/middleware/errorHandler.ts
export const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
};
```

---

## Step-by-Step Implementation Checklist

### Phase 1: Project Setup

- [ ] **1.1 Initialize Repository**
  - Create GitHub repository
  - Set up branch protection rules
  - Add `.gitignore` for Node.js

- [ ] **1.2 Backend Setup**
  ```bash
  mkdir backend && cd backend
  npm init -y
  npm install express cors helmet morgan express-rate-limit
  npm install -D typescript @types/express @types/node ts-node nodemon
  npx tsc --init
  ```

- [ ] **1.3 Frontend Setup**
  ```bash
  npm create vite@latest frontend -- --template react-ts
  cd frontend
  npm install
  npm install -D tailwindcss postcss autoprefixer
  npx tailwindcss init -p
  npx shadcn-ui@latest init
  ```

- [ ] **1.4 Database Setup**
  - Set up PostgreSQL instance (Supabase free tier)
  - Initialize Prisma
  ```bash
  cd backend
  npm install prisma @prisma/client
  npx prisma init
  ```
  - Create schema and run migration

### Phase 2: Backend Development

- [ ] **2.1 Core Dependencies**
  ```bash
  npm install @tavily/core zod dotenv
  npm install -D @types/cors
  ```

- [ ] **2.2 Project Structure**
  - Create folder structure (`src/config`, `src/controllers`, etc.)
  - Set up TypeScript configuration

- [ ] **2.3 Database Models**
  - Define Prisma schema
  - Run `npx prisma migrate dev`
  - Generate Prisma client

- [ ] **2.4 Middleware Implementation**
  - [ ] CORS configuration
  - [ ] Rate limiting
  - [ ] Error handling
  - [ ] Request logging

- [ ] **2.5 Tavily Integration**
  - [ ] Create Tavily service
  - [ ] Implement search function with structured queries
  - [ ] Add response parsing and validation

- [ ] **2.6 Search Controller**
  - [ ] POST `/api/search` endpoint
  - [ ] Input validation with Zod
  - [ ] Cache checking logic
  - [ ] Response formatting

- [ ] **2.7 Caching Layer**
  - [ ] Set up Redis (or in-memory cache for MVP)
  - [ ] Cache search results for 24 hours
  - [ ] Cache hit/miss logic

- [ ] **2.8 Testing**
  - [ ] Unit tests for services
  - [ ] Integration tests for API endpoints
  - [ ] Test Tavily API integration

### Phase 3: Frontend Development

- [ ] **3.1 UI Dependencies**
  ```bash
  npm install @tanstack/react-query react-router-dom lucide-react
  npm install -D @types/react-router-dom
  ```

- [ ] **3.2 Project Structure**
  - Create component folders
  - Set up routing

- [ ] **3.3 shadcn/ui Components**
  ```bash
  npx shadcn-ui@latest add button input table card skeleton
  npx shadcn-ui@latest add select dialog badge
  ```

- [ ] **3.4 Core Components**
  - [ ] `SearchForm` - Degree input with validation
  - [ ] `ResultsTable` - Sortable data table
  - [ ] `UniversityCard` - Detailed view modal
  - [ ] `LoadingSkeleton` - Loading states
  - [ ] `ErrorBoundary` - Error handling

- [ ] **3.5 API Integration**
  - [ ] Create API service with axios/fetch
  - [ ] Set up React Query for state management
  - [ ] Implement error handling and retries

- [ ] **3.6 Styling**
  - [ ] Configure Tailwind theme
  - [ ] Create responsive layouts
  - [ ] Add dark mode support (optional)

- [ ] **3.7 Testing**
  - [ ] Component unit tests
  - [ ] Integration tests
  - [ ] E2E tests with Playwright

### Phase 4: Integration & Deployment

- [ ] **4.1 Environment Configuration**
  - [ ] Create `.env` files for all environments
  - [ ] Set up environment variable validation

- [ ] **4.2 Backend Deployment (Render)**
  - [ ] Create Render account
  - [ ] Set up Web Service
  - [ ] Configure environment variables
  - [ ] Deploy and test endpoints

- [ ] **4.3 Frontend Deployment (Vercel)**
  - [ ] Create Vercel account
  - [ ] Connect GitHub repository
  - [ ] Configure build settings
  - [ ] Set environment variables
  - [ ] Deploy

- [ ] **4.4 Database Migration**
  - [ ] Run production migrations
  - [ ] Verify schema

- [ ] **4.5 End-to-End Testing**
  - [ ] Test complete user flow
  - [ ] Verify API integration
  - [ ] Check error scenarios

### Phase 5: Optimization & Polish

- [ ] **5.1 Performance**
  - [ ] Implement pagination for results
  - [ ] Add image optimization
  - [ ] Configure CDN for static assets

- [ ] **5.2 SEO**
  - [ ] Add meta tags
  - [ ] Create sitemap
  - [ ] Add structured data

- [ ] **5.3 Analytics**
  - [ ] Add search analytics tracking
  - [ ] Monitor API usage

- [ ] **5.4 Documentation**
  - [ ] API documentation
  - [ ] User guide
  - [ ] Deployment guide

---

## API Endpoints

### POST /api/search
Search for universities by degree.

**Request:**
```json
{
  "degree": "Computer Science"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "queryId": "uuid",
    "degree": "Computer Science",
    "results": [
      {
        "id": "uuid",
        "universityName": "MIT",
        "country": "USA",
        "ranking": 1,
        "pswDuration": "3 years (STEM OPT)",
        "pswDetails": "...",
        "industryMatch": "Silicon Valley tech hub proximity",
        "majorEmployers": ["Google", "Microsoft", "Apple"],
        "employabilityRank": 1,
        "graduateEmploymentRate": "95%",
        "avgStartingSalary": "$120,000",
        "healthInsurance": "$3,000/year",
        "visaFees": "$510 (SEVIS + visa)",
        "proofOfFunds": "$60,000",
        "fullRideAvailable": false,
        "tuitionWaiverAvailable": true,
        "accreditationBodies": ["ABET"],
        "sourceUrl": "..."
      }
    ]
  }
}
```

### GET /api/health
Health check endpoint.

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2024-01-31T08:17:53Z"
}
```

---

## Tavily API Integration Strategy

### Search Query Structure

```typescript
// Structured prompt for Tavily to get consistent results
const buildSearchQuery = (degree: string): string => {
  return `
Find the top 30 universities worldwide for ${degree} degree.
For each university, provide:
1. University name and country
2. Post-Study Work visa duration and requirements
3. Industry hub relevance for ${degree}
4. Graduate employability statistics
5. Hidden costs: health insurance, visa fees, proof of funds
6. Scholarship availability (full-ride vs tuition waiver)
7. Accreditation bodies (AACSB, ABET, etc.)

Format as structured data.
`;
};
```

### Response Processing

```typescript
// Parse Tavily response into structured format
const processTavilyResponse = (rawResponse: any): UniversityData[] => {
  // Extract and validate data
  // Map to database schema
  // Return structured array
};
```

---

## Cost Estimation

| Service | Free Tier | Paid (if needed) |
|---------|-----------|------------------|
| Vercel | 100GB bandwidth | $20/mo Pro |
| Render | 750 hours/month | $7/mo Starter |
| Supabase | 500MB database | $25/mo Pro |
| Tavily API | 1,000 calls/month | $0.025/call |
| Redis | Upstash free tier | $10/mo |

**Estimated Monthly Cost (with moderate usage):** $0-50

---

## Future Enhancements

1. **User Accounts**: Save favorite universities and searches
2. **Comparison Tool**: Side-by-side university comparison
3. **Application Tracker**: Track application deadlines and status
4. **Community Reviews**: Student testimonials and ratings
5. **AI Chatbot**: Interactive Q&A about universities
6. **Mobile App**: React Native version
7. **Multi-language Support**: i18n for international students

---

## Success Metrics

- Search response time < 3 seconds
- 99% uptime
- Support for 100+ degree types
- Accurate data for top 30 universities
- Mobile-responsive design
- WCAG 2.1 AA accessibility compliance

---

## Notes

- All API keys must be stored in environment variables
- Implement proper error handling for Tavily API failures
- Cache results aggressively to minimize API costs
- Monitor Tavily API usage to stay within free tier
- Consider implementing a fallback data source
