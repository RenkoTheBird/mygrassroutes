# Deployment Guide - Opening Your Website for Testing

This guide shows you how to make your website accessible to others for testing.

## Your Network IP
Based on your system, your local IP address is: **192.168.1.118**

## 🚀 Quick Start (Local Network Testing)

### Option 1: Run Everything Together (Recommended)
```bash
npm run dev:full
```

This will start:
- Frontend on `http://localhost:5173` (accessible at `http://192.168.1.118:5173`)
- Backend on `http://localhost:3001` (accessible at `http://192.168.1.118:3001`)

### Option 2: Run Separately
**Terminal 1 (Backend):**
```bash
npm run server
```

**Terminal 2 (Frontend):**
```bash
npm run dev
```

## 🔗 Sharing with Others on Your Network

### For Testers:
1. Make sure they're on the same Wi-Fi network as you
2. Have them open: `http://192.168.1.118:5173`

### Note About Backend API
Currently, the API is hardcoded to `localhost:3001` in `src/database/database.js`. For testers to fully access the application, you need to update this file to use your local IP.

To make it work for network testers:
1. Edit `src/database/database.js`
2. Change line 4 from:
   ```js
   const API_BASE_URL = 'http://localhost:3001/api';
   ```
   To:
   ```js
   const API_BASE_URL = 'http://192.168.1.118:3001/api';
   ```

Or use an environment variable (see Advanced section below).

## 🌐 Public Access (Internet-Wide Testing)

### Option 1: Ngrok (Easiest - Free)
1. Sign up at https://ngrok.com (free tier available)
2. Download ngrok
3. Run:
   ```bash
   ngrok http 5173
   ```
4. Share the provided URL (e.g., `https://abc123.ngrok.io`)

**Important:** For the backend API, you'll also need:
```bash
ngrok http 3001
```
And update your API URLs accordingly.

### Option 2: Deploy to Cloud Services

#### Railway.app (Recommended)
1. Sign up at https://railway.app
2. Click "New Project" > "Deploy from GitHub repo"
3. Connect your GitHub repository
4. Add environment variables from `.env`
5. Railway will automatically deploy and give you a URL

#### Vercel (Frontend Only)
1. Install Vercel CLI: `npm i -g vercel`
2. Run: `vercel`
3. For full-stack apps, you'll need to deploy the backend separately

#### Netlify
1. Build your frontend: `npm run build`
2. Deploy `dist` folder to Netlify
3. Use Netlify Functions or deploy backend separately

## 🔧 Environment Variables

Create a `.env` file in the root directory with:
```bash
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key_here
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key_here
PORT=3001
VITE_API_URL=http://localhost:3001
```

For network access, change to:
```bash
VITE_API_URL=http://192.168.1.118:3001
```

## ⚠️ Important Notes

1. **Firewall:** Make sure Windows Firewall allows connections on ports 3001 and 5173
2. **Same Network:** Network testing only works if testers are on the same Wi-Fi
3. **Development vs Production:**
   - Development: Use test Stripe keys
   - Production: Use live Stripe keys
4. **Security:** Never commit `.env` files with real API keys

## 🎯 Quick Test Checklist

- [ ] Start the development server (`npm run dev:full`)
- [ ] Test on your machine: `http://localhost:5173`
- [ ] Test on another device: `http://192.168.1.118:5173`
- [ ] Check backend API is accessible
- [ ] Test Stripe integration with test cards
- [ ] Check database operations (lessons, questions)

## 🐛 Troubleshooting

### Can't access from other devices?
1. Check Windows Firewall settings
2. Verify you're on the same Wi-Fi network
3. Try using your computer's hostname instead of IP

### API calls failing?
1. Update API_BASE_URL in `src/database/database.js`
2. Check that backend server is running on port 3001
3. Verify CORS is enabled in server.js

### Stripe not working?
1. Verify Stripe keys in `.env` file
2. Check that you're using test keys (starts with `pk_test_` and `sk_test_`)
3. Clear browser cache and try again

