// Stripe configuration
export const STRIPE_CONFIG = {
  publishableKey: import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY,
  // In production, if VITE_API_URL is not set, use relative paths (same domain)
  // In development, use localhost:3001 or the Vite proxy
  apiUrl: import.meta.env.VITE_API_URL || (import.meta.env.PROD ? '' : 'http://localhost:3001'),
};
