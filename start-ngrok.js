#!/usr/bin/env node

/**
 * Helper script to start ngrok and update .env file automatically
 * Run: node start-ngrok.js
 */

import { spawn } from 'child_process';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ENV_PATH = path.join(__dirname, '.env');
const BACKEND_PORT = 3001;
const FRONTEND_PORT = 5178; // Update if your Vite uses a different port

console.log('\n🚀 Ngrok Setup Helper\n');
console.log('This script will help you set up ngrok tunnels.');
console.log('You\'ll need to manually copy the URLs after ngrok starts.\n');
console.log('Make sure your dev server is running first!\n');

// Check if .env exists
if (!existsSync(ENV_PATH)) {
  console.log('❌ .env file not found. Please create one first.');
  console.log('You can use env.example as a template.\n');
  process.exit(1);
}

console.log('Choose an option:');
console.log('1. Start backend tunnel (port 3001)');
console.log('2. Start frontend tunnel (port 5178)');
console.log('3. Start both tunnels (requires ngrok.yml)\n');

// Note: This is a simplified version. In a real scenario, you'd use readline
// For now, we'll just show the commands
console.log('📋 Manual Setup Instructions:\n');

console.log('Terminal 1 - Start backend tunnel:');
console.log(`  npm run ngrok:backend\n`);
console.log('Terminal 2 - Start frontend tunnel:');
console.log(`  npm run ngrok:frontend\n`);
console.log('After starting:');
console.log('1. Copy the backend ngrok URL (e.g., https://xyz789.ngrok-free.app)');
console.log('2. Update VITE_API_URL in .env:');
console.log('   VITE_API_URL=https://xyz789.ngrok-free.app');
console.log('3. Restart your dev server');
console.log('4. Share the frontend ngrok URL with testers\n');

console.log('💡 Tip: View both tunnels at http://127.0.0.1:4040\n');

