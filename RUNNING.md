# How to Run the International Student Degree Analyser

This guide will walk you through running the project locally on your machine.

## Prerequisites

Before you start, make sure you have:

1. **Node.js 18+** installed
   - Download from: https://nodejs.org/
   - Verify: `node --version`

2. **A Tavily API Key**
   - Sign up at: https://tavily.com
   - Get your API key from the dashboard

3. **PostgreSQL Database** (optional for testing)
   - Download from: https://www.postgresql.org/download/
   - Or use a cloud provider like Supabase (free tier available)

## Step 1: Clone the Repository

```bash
git clone https://github.com/joshuapremkumar/International-Student-Degree-Analyser.git
cd International-Student-Degree-Analyser
```

## Step 2: Set Up the Backend

### 2.1 Navigate to Backend Directory
```bash
cd backend
```

### 2.2 Install Dependencies
```bash
npm install
```

### 2.3 Set Up Environment Variables
```bash
# Copy the example environment file
cp .env.example .env

# Edit the .env file with your credentials
# You can use Notepad, VS Code, or any text editor
```

**Your `.env` file should look like this:**
```env
NODE_ENV=development
PORT=3000

# If you have PostgreSQL installed locally:
DATABASE_URL=postgresql://username:password@localhost:5432/degree_analyser

# If you don't have PostgreSQL, you can skip this for now
# The app will work without caching (mock data will be used)

# Required: Your Tavily API Key
TAVILY_API_KEY=tvly-your-actual-api-key-here

# Cache duration in hours
CACHE_TTL_HOURS=24
```

### 2.4 Set Up Database (Optional)
If you have PostgreSQL:
```bash
# Generate Prisma client
npx prisma generate

# Create database tables (if you have a database URL)
npx prisma migrate dev --name init
```

If you don't have PostgreSQL, the app will still work - it just won't cache results.

### 2.5 Start the Backend Server
```bash
npm run dev
```

You should see:
```
Server running on port 3000
Environment: development
Database connected successfully (or error if no DB)
```

**Keep this terminal window open!**

## Step 3: Set Up the Frontend

Open a **new terminal window** (don't close the backend one):

### 3.1 Navigate to Frontend Directory
```bash
cd frontend
```

### 3.2 Install Dependencies
```bash
npm install
```

### 3.3 Set Up Environment Variables
```bash
# Copy the example environment file
cp .env.example .env

# The default should work for local development
```

**Your `.env` file should look like this:**
```env
VITE_API_URL=http://localhost:3000/api
```

### 3.4 Start the Frontend Development Server
```bash
npm run dev
```

You should see:
```
VITE v7.3.1  ready in 334 ms

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
```

## Step 4: Open the Application

1. Open your web browser
2. Go to: http://localhost:5173
3. You should see the International Student Degree Analyser homepage

## Step 5: Test the Application

1. **Enter a degree** in the search box (e.g., "Computer Science")
2. **Click the "Search" button**
3. **View the results** - You should see a table with universities
4. **Click on a university row** to expand and see detailed information

## Troubleshooting

### Backend Won't Start

**Problem**: "Missing required environment variable: TAVILY_API_KEY"
- **Solution**: Make sure you created the `.env` file and added your Tavily API key

**Problem**: "Database connection failed"
- **Solution**: Either install PostgreSQL or remove the DATABASE_URL from .env (app will work without caching)

### Frontend Won't Start

**Problem**: "Cannot find module"
- **Solution**: Run `npm install` again in the frontend directory

**Problem**: "Failed to connect to backend"
- **Solution**: Make sure the backend is running on port 3000

### No Results Showing

**Problem**: Search returns empty results
- **Solution**: Check that your Tavily API key is correct and has available credits

## Development Mode Features

- **Hot Reload**: Changes to code automatically refresh the browser
- **Mock Data**: If Tavily API fails, mock data is displayed
- **Error Messages**: Clear error messages in the browser console

## Stopping the Servers

To stop the servers:
- Press `Ctrl + C` in each terminal window
- Or close the terminal windows

## Next Steps

Once everything is working locally, you can:
1. Deploy to production (see `docs/deployment.md`)
2. Customize the UI in `frontend/src/components/`
3. Add more features to the backend

## Need Help?

- Check the `plan.md` file for architecture details
- Review `docs/deployment.md` for deployment instructions
- Check the browser console (F12) for error messages
