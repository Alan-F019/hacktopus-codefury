import admin from 'firebase-admin';
import { env } from './env.js';

let firebaseInitialized = false;

export const initFirebase = (): typeof admin | null => {
  if (firebaseInitialized) return admin;

  if (env.FIREBASE_PROJECT_ID && env.FIREBASE_CLIENT_EMAIL && env.FIREBASE_PRIVATE_KEY) {
    try {
      const privateKey = env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n');
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: env.FIREBASE_PROJECT_ID,
          clientEmail: env.FIREBASE_CLIENT_EMAIL,
          privateKey,
        }),
      });
      firebaseInitialized = true;
      console.log('✅ Firebase Admin SDK Initialized');
      return admin;
    } catch (err) {
      console.warn('⚠️ Failed to initialize Firebase Admin SDK:', err);
      return null;
    }
  } else {
    // Graceful fallback for local development & judging without live Firebase creds
    return null;
  }
};

export const getFirebaseAdmin = (): typeof admin | null => {
  if (!firebaseInitialized) {
    return initFirebase();
  }
  return admin;
};
