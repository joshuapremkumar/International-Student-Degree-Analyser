# International Student Degree Analyser

A web application that helps international students find top colleges for their desired degrees worldwide. The platform provides comprehensive information including Post-Study Work Visas, Industry Hubs, Employability Rankings, Hidden Costs, Scholarship Realism, and Global Recognition for the top 30 universities globally for any given degree.

## Features

- **Degree Search**: Find top 30 universities for any degree worldwide
- **Post-Study Work (PSW) Visas**: Check how long you can stay after graduation
- **Industry Hubs**: Match the degree to the country's economy
- **Employability Rankings**: Look at the university's "Graduate Employability" stats
- **Hidden Costs**: Include health insurance, visa fees, and "proof of funds" requirements
- **Scholarship Realism**: Distinguish between "full-ride" scholarships (rare) and "tuition waivers" (common)
- **Global Recognition**: Ensure the program is accredited by relevant global bodies (e.g., AACSB for Business, ABET for Engineering)

## Tech Stack

- **Frontend**: React + TypeScript + Vite + Tailwind CSS + shadcn/ui
- **Backend**: Node.js + Express + TypeScript
- **Database**: PostgreSQL + Prisma ORM
- **Search API**: Tavily API
- **Hosting**: Vercel (frontend) + Render (backend)

## Project Structure

```
.
├── backend/          # Node.js Express API
├── frontend/         # React SPA
├── shared/           # Shared TypeScript types
├── docs/             # Documentation
└── plan.md           # Technical plan
```

## Quick Start

### Prerequisites

- Node.js 18+
- PostgreSQL database (local or cloud)
- Tavily API key

### Backend Setup

```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your database URL and Tavily API key
npx prisma migrate dev
npm run dev
```

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

## Environment Variables

### Backend (.env)

```
NODE_ENV=development
PORT=3000
DATABASE_URL=postgresql://user:password@localhost:5432/degree_analyser
TAVILY_API_KEY=your_tavily_api_key
```

### Frontend (.env)

```
VITE_API_URL=http://localhost:3000/api
```

## Deployment

See [Deployment Guide](docs/deployment.md) for detailed instructions.

## License

MIT
