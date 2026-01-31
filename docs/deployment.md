# Deployment Guide

This guide covers deploying the International Student Degree Analyser to production.

## Prerequisites

- Tavily API key ([Get one here](https://tavily.com))
- PostgreSQL database (Supabase recommended for free tier)
- Git repository

## Backend Deployment (Render)

### 1. Create Render Account
- Sign up at [render.com](https://render.com)
- Connect your GitHub repository

### 2. Create Web Service
1. Click "New +" → "Web Service"
2. Select your repository
3. Configure:
   - **Name**: `degree-analyser-api`
   - **Environment**: `Node`
   - **Build Command**: `cd backend && npm install && npm run build`
   - **Start Command**: `cd backend && npm start`
   - **Plan**: Free

### 3. Environment Variables
Add these in Render dashboard:
```
NODE_ENV=production
DATABASE_URL=your_postgresql_connection_string
TAVILY_API_KEY=your_tavily_api_key
CACHE_TTL_HOURS=24
```

### 4. Database Setup (Supabase)
1. Create account at [supabase.com](https://supabase.com)
2. Create new project
3. Get connection string from Settings → Database
4. Run migrations:
   ```bash
   cd backend
   npx prisma migrate deploy
   ```

## Frontend Deployment (Vercel)

### 1. Create Vercel Account
- Sign up at [vercel.com](https://vercel.com)
- Import your GitHub repository

### 2. Configure Project
1. Select `frontend` as root directory
2. Framework preset: `Vite`
3. Build command: `npm run build`
4. Output directory: `dist`

### 3. Environment Variables
```
VITE_API_URL=https://your-render-app.onrender.com/api
```

### 4. Deploy
Click "Deploy" and Vercel will build and deploy automatically.

## Post-Deployment Checklist

- [ ] Test `/health` endpoint
- [ ] Test search functionality
- [ ] Verify CORS is working
- [ ] Check database connections
- [ ] Monitor rate limiting

## Troubleshooting

### Backend Issues
- Check Render logs for errors
- Verify environment variables are set
- Ensure database is accessible from Render

### Frontend Issues
- Check browser console for CORS errors
- Verify API URL is correct
- Check Vercel deployment logs

## Cost Estimation

| Service | Free Tier | Paid (if needed) |
|---------|-----------|------------------|
| Vercel | 100GB bandwidth | $20/mo Pro |
| Render | 750 hours/month | $7/mo Starter |
| Supabase | 500MB database | $25/mo Pro |
| Tavily | 1,000 calls/month | $0.025/call |

**Total Estimated Cost**: $0-50/month
