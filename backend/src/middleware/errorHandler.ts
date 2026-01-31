import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';

export interface ApiError extends Error {
  statusCode?: number;
}

export const errorHandler = (
  err: ApiError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  console.error('Error:', err);

  // Handle Zod validation errors
  if (err instanceof ZodError) {
    res.status(400).json({
      error: 'Validation error',
      message: err.issues.map((issue) => `${String(issue.path)}: ${issue.message}`).join(', '),
    });
    return;
  }

  // Handle known API errors
  if (err.statusCode) {
    res.status(err.statusCode).json({
      error: err.name || 'Error',
      message: err.message,
    });
    return;
  }

  // Default error response
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  res.status(500).json({
    error: 'Internal server error',
    message: isDevelopment ? err.message : 'Something went wrong',
    ...(isDevelopment && { stack: err.stack }),
  });
};

export const notFoundHandler = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  res.status(404).json({
    error: 'Not found',
    message: `Route ${req.method} ${req.path} not found`,
  });
};
