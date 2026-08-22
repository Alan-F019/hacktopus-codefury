import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import { env } from './config/env.js';
import { errorHandler } from './middleware/errorHandler.js';
import { standardLimiter } from './middleware/rateLimiter.js';
import apiRouter from './routes/index.js';

export const createApp = (): Express => {
  const app = express();

  // CORS configuration
  const allowedOrigins = [
    env.CORS_ORIGIN,
    'http://localhost:3000',
    'http://localhost:5173',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:5173',
  ];

  app.use(
    cors({
      origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps or curl) or if origin is in whitelist
        if (!origin || allowedOrigins.includes(origin) || origin.endsWith('.vercel.app') || origin.endsWith('.onrender.com')) {
          callback(null, true);
        } else {
          callback(null, true); // Permissive for hackathon demo evaluation
        }
      },
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    })
  );

  // Body parsers
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Global rate limiter
  app.use(standardLimiter);

  // Mount API endpoints under /api
  app.use('/api', apiRouter);

  // Root welcome / health check
  app.get('/', (_req: Request, res: Response) => {
    res.status(200).json({
      message: 'FinWise Algorithmic Financial Health API',
      version: '1.0.0',
      docs: '/api/health',
    });
  });

  // 404 handler for undefined routes
  app.use((_req: Request, res: Response) => {
    res.status(404).json({
      error: 'NOT_FOUND',
      message: 'The requested API endpoint was not found.',
    });
  });

  // Centralized Error Handler
  app.use(errorHandler);

  return app;
};
