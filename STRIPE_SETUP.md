# Stripe Payment Integration Setup

This guide will help you set up the Stripe payment integration for the mygrassroutes donation system.

## Prerequisites

1. A Stripe account (sign up at https://stripe.com)
2. Node.js installed on your system

## Setup Instructions

### 1. Get Your Stripe Keys

1. Log in to your Stripe Dashboard
2. Go to Developers > API Keys
3. Copy your **Publishable key** (starts with `pk_test_` for test mode)
4. Copy your **Secret key** (starts with `sk_test_` for test mode)

### 2. Environment Configuration

1. Create a `.env` file in the root directory:
```bash
# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key_here
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key_here

# Server Configuration
PORT=3001
```

2. Create a `.env` file in the `src` directory for the frontend:
```bash
# Stripe Configuration
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key_here
VITE_API_URL=http://localhost:3001
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Run the Application

#### Option 1: Run both frontend and backend together
```bash
npm run dev:full
```

#### Option 2: Run separately
Terminal 1 (Backend):
```bash
npm run server
```

Terminal 2 (Frontend):
```bash
npm run dev
```

### 5. Test the Integration

1. Navigate to http://localhost:5173/pathway
2. Scroll down to the "Support Our Mission" section
3. Try making a test donation:
   - Select a predefined amount or enter a custom amount (minimum $1.00)
   - Click "Donate"
   - You'll be redirected to Stripe Checkout
   - Use test card: `4242 4242 4242 4242` with any future date and CVC

## Features

- **Choose-your-own-payment**: Users can select predefined amounts ($5, $10, $25, $50, $100) or enter a custom amount
- **Minimum donation**: $1.00 minimum enforced
- **Secure payment**: Powered by Stripe Checkout
- **Responsive design**: Works on desktop and mobile
- **Error handling**: Clear error messages for validation and payment issues

## File Structure

```
├── server.js                 # Express backend server
├── src/
│   ├── components/
│   │   └── DonationForm.jsx  # Donation form component
│   ├── config/
│   │   └── stripe.js         # Stripe configuration
│   └── pages/
│       └── Pathway.jsx       # Updated with donation section
├── package.json              # Updated with new dependencies
└── env.example              # Environment variables template
```

## Security Notes

- Never commit your `.env` files to version control
- Use test keys during development
- Switch to live keys only when ready for production
- The secret key should only be used on the backend server

## Troubleshooting

1. **CORS errors**: Make sure the backend server is running on port 3001
2. **Stripe errors**: Verify your API keys are correct and in the right environment files
3. **Payment not working**: Check the browser console for error messages
4. **Environment variables not loading**: Restart the development server after adding new environment variables

## Production Deployment

When deploying to production:

1. Replace test keys with live keys
2. Update the API URL to your production backend
3. Set up proper CORS configuration for your domain
4. Consider using environment-specific configuration files
