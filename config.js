// Server configuration
export const PORT = process.env.PORT || 3001;
export const SERVER_URL = process.env.SERVER_URL || `http://localhost:${PORT}`;
export const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:3000';

// Session configuration
export const SESSION_SECRET = process.env.SESSION_SECRET || 'fallback_secret_key';

// Google OAuth configuration
export const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
export const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
export const GOOGLE_CALLBACK_URL = `${SERVER_URL}/api/auth/google/callback`;

// Stripe configuration
export const STRIPE_SECRET = process.env.STRIPE_SECRET;
export const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;

// OpenAI configuration
export const OPENAI_KEY = process.env.OPENAI_KEY;

// Database configuration
export const DATABASE_PATH = process.env.DATABASE_PATH || './db.sqlite';