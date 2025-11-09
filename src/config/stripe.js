// Stripe configuration
export const STRIPE_CONFIG = {
  publishableKey: import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY,
  apiUrl: import.meta.env.VITE_API_URL || 'http://localhost:3001',
};
