// Script to check and log environment variables during build
// This helps debug if Railway is passing VITE_* variables to the build

console.log('[BUILD] Checking Vite environment variables...');
const viteVars = [
  'VITE_FIREBASE_API_KEY',
  'VITE_FIREBASE_AUTH_DOMAIN',
  'VITE_FIREBASE_PROJECT_ID',
  'VITE_FIREBASE_STORAGE_BUCKET',
  'VITE_FIREBASE_MESSAGING_SENDER_ID',
  'VITE_FIREBASE_APP_ID',
  'VITE_FIREBASE_MEASUREMENT_ID',
];

viteVars.forEach(varName => {
  const value = process.env[varName];
  if (value) {
    console.log(`[BUILD] ✓ ${varName} is set (length: ${value.length})`);
  } else {
    console.error(`[BUILD] ✗ ${varName} is NOT set`);
  }
});

// Check required vars but don't fail the build - let Vite handle it
// This allows us to see what Railway is passing
const required = ['VITE_FIREBASE_API_KEY', 'VITE_FIREBASE_AUTH_DOMAIN', 'VITE_FIREBASE_PROJECT_ID'];
const missing = required.filter(v => !process.env[v]);

if (missing.length > 0) {
  console.warn('[BUILD] WARNING: Missing required environment variables:', missing);
  console.warn('[BUILD] The build will continue, but Firebase may not work correctly.');
  console.warn('[BUILD] Make sure these are set in Railway Variables before building.');
  console.warn('[BUILD] Railway may need these set as "Build-time" variables.');
} else {
  console.log('[BUILD] ✓ All required environment variables are set');
}

