import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import cors from './middleware/cors';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import searchRoutes from './routes/searchRoutes';
import { connectDatabase } from './config/database';
import { env, validateEnv } from './config/env';

const app = express();

// Validate environment variables
validateEnv();

// Security middleware
app.use(helmet());
app.use(cors);

// Logging
app.use(morgan('combined'));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// API routes
app.use('/api', searchRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 404 handler
app.use(notFoundHandler);

// Error handler
app.use(errorHandler);

// Start server
async function startServer() {
  try {
    // Connect to database
    await connectDatabase();

    app.listen(env.PORT, () => {
      console.log(`Server running on port ${env.PORT}`);
      console.log(`Environment: ${env.NODE_ENV}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();

export default app;
