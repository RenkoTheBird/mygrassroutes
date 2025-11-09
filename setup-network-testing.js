#!/usr/bin/env node

/**
 * Setup script to enable network testing
 * Run: node setup-network-testing.js
 */

import { networkInterfaces } from 'os';
import { existsSync, writeFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function getLocalIP() {
  for (const name of Object.keys(networkInterfaces())) {
    for (const iface of networkInterfaces()[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return 'localhost';
}

function getEnvExampleContent() {
  const ip = getLocalIP();
  return `# Backend Server Configuration
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key_here
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key_here
PORT=3001

# Frontend Configuration (for Vite)
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key_here
VITE_API_URL=http://${ip}:3001
`;
}

function main() {
  const localIP = getLocalIP();
  const envPath = path.join(__dirname, '.env');
  
  console.log('\n🌐 Network Testing Setup\n');
  console.log('Your local IP address:', localIP);
  console.log('');
  
  if (!existsSync(envPath)) {
    const content = getEnvExampleContent();
    writeFileSync(envPath, content);
    console.log('✅ Created .env file with network configuration');
    console.log('⚠️  Please update with your actual Stripe keys!\n');
  } else {
    console.log('ℹ️  .env file already exists');
    console.log('You may need to update VITE_API_URL to:', `http://${localIP}:3001\n`);
  }
  
  console.log('📋 Next Steps:');
  console.log('1. Update .env with your Stripe keys (get them from https://dashboard.stripe.com)');
  console.log('2. Run: npm run dev:full');
  console.log('3. Access on your machine: http://localhost:5173');
  console.log(`4. Share with testers: http://${localIP}:5173\n`);
}

main();

