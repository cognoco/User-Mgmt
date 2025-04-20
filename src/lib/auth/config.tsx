/**
 * Central configuration file for backend (Next.js) services
 */

// Supabase Configuration
export const supabaseConfig = {
  url: process.env.NEXT_PUBLIC_SUPABASE_URL,
  anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  serviceKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
};

// Redis Configuration
export const redisConfig = {
  url: process.env.REDIS_URL || '',
  token: process.env.REDIS_TOKEN || '',
  enabled: Boolean(process.env.REDIS_URL && process.env.REDIS_TOKEN),
};

// Environment detection
export const isProduction = process.env.NODE_ENV === 'production';
export const isDevelopment = process.env.NODE_ENV === 'development';
export const isTest = process.env.NODE_ENV === 'test';

// API Configuration
export const apiConfig = {
  baseUrl: process.env.NEXT_PUBLIC_API_URL || (isProduction ? 'https://api.example.com' : 'http://localhost:3000/api'),
  timeout: parseInt(process.env.API_TIMEOUT || '10000', 10),
};

// Auth Configuration
export const authConfig = {
  tokenExpiryDays: parseInt(process.env.TOKEN_EXPIRY_DAYS || '7', 10),
  sessionCookieName: process.env.SESSION_COOKIE_NAME || 'user-management-session',
};

// Rate Limiting Configuration
export const rateLimitConfig = {
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || (15 * 60 * 1000).toString(), 10), // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX || '100', 10), // limit each IP to 100 requests per windowMs
};

// Environment validation - check required variables
export function validateConfig() {
  const requiredVariables = [
    { name: 'NEXT_PUBLIC_SUPABASE_URL', value: supabaseConfig.url },
    { name: 'NEXT_PUBLIC_SUPABASE_ANON_KEY', value: supabaseConfig.anonKey },
  ];

  const missingVariables = requiredVariables
    .filter(v => !v.value)
    .map(v => v.name);

  if (missingVariables.length > 0) {
    throw new Error(`Missing required environment variables: ${missingVariables.join(', ')}`);
  }

  return true;
}

// Validate config immediately if not in test environment
if (!isTest) {
  validateConfig();
} 