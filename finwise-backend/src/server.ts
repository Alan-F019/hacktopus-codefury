import { createApp } from './app.js';
import { connectDB, disconnectDB } from './config/db.js';
import { initFirebase } from './config/firebase.js';
import { env } from './config/env.js';

const startServer = async () => {
  try {
    // 1. Connect to Database
    await connectDB();

    // 2. Initialize Firebase Admin if credentials provided
    initFirebase();

    // 3. Initialize Express App
    const app = createApp();

    const server = app.listen(env.PORT, () => {
      console.log(`🚀 FinWise Backend running on port ${env.PORT} in ${env.NODE_ENV} mode`);
      console.log(`🌐 Base URL: http://localhost:${env.PORT}/api`);
      console.log(`🔑 Demo Sandbox token: ${env.DEMO_TOKEN}`);
    });

    // Graceful shutdown handling
    const shutdown = async (signal: string) => {
      console.log(`\n🛑 Received ${signal}. Shutting down gracefully...`);
      server.close(async () => {
        await disconnectDB();
        console.log('🏁 Server and DB connections closed.');
        process.exit(0);
      });
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
  } catch (error) {
    console.error('💥 Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
