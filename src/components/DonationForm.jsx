import { useState } from 'react';
import { STRIPE_CONFIG } from '../config/stripe';

const DonationForm = () => {
  const [amount, setAmount] = useState('');
  const [customAmount, setCustomAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const predefinedAmounts = [5, 10, 25, 50, 100];

  const handleAmountSelect = (selectedAmount) => {
    setAmount(selectedAmount.toString());
    setCustomAmount('');
    setError('');
  };

  const handleCustomAmountChange = (e) => {
    const value = e.target.value;
    setCustomAmount(value);
    setAmount(value);
    setError('');
  };

  const handleDonate = async () => {
    if (!amount || parseFloat(amount) < 1) {
      setError('Please enter an amount of at least $1.00');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // Convert to cents for Stripe
      const amountInCents = Math.round(parseFloat(amount) * 100);

      // Determine API URL - use relative path in production (same domain), or use Vite proxy in development
      const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
      const apiUrl = isLocalhost 
        ? '/create-checkout-session' 
        : (STRIPE_CONFIG.apiUrl && STRIPE_CONFIG.apiUrl !== 'http://localhost:3001'
          ? `${STRIPE_CONFIG.apiUrl}/create-checkout-session`
          : '/create-checkout-session'); // Use relative path if no API URL is configured (production on same domain)

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: amountInCents,
          currency: 'usd',
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: `HTTP ${response.status}: ${response.statusText}` }));
        throw new Error(errorData.error || `Server error: ${response.status}`);
      }

      const session = await response.json();

      if (session.error) {
        throw new Error(session.error);
      }

      // Check if we have a URL to redirect to
      if (!session.url) {
        throw new Error('No checkout URL received from server');
      }

      // Redirect to Stripe Checkout using the session URL
      window.location.href = session.url;
    } catch (err) {
      console.error('Error:', err);
      // Provide more helpful error messages
      if (err.message.includes('Failed to fetch') || err.message.includes('NetworkError')) {
        setError('Unable to connect to the server. Please make sure the backend server is running on port 3001.');
      } else {
        setError(err.message || 'Something went wrong. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-4 md:p-6 max-w-md mx-auto">
      <div className="text-center mb-6">
        <h3 className="text-xl md:text-2xl font-bold text-gray-800 mb-2">
          Support mygrassroutes
        </h3>
        <p className="text-sm md:text-base text-gray-600">
          Help us continue building tools for civic engagement
        </p>
      </div>

      {/* Predefined Amount Buttons */}
      <div className="mb-6">
        <p className="text-sm font-medium text-gray-700 mb-3">Choose an amount:</p>
        <div className="grid grid-cols-3 gap-1 md:gap-2">
          {predefinedAmounts.map((predefinedAmount) => (
            <button
              key={predefinedAmount}
              onClick={() => handleAmountSelect(predefinedAmount)}
              className={`p-3 rounded-lg border-2 transition-colors ${
                amount === predefinedAmount.toString()
                  ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                  : 'border-gray-200 hover:border-emerald-300 hover:bg-emerald-50'
              }`}
            >
              ${predefinedAmount}
            </button>
          ))}
        </div>
      </div>

      {/* Custom Amount Input */}
      <div className="mb-6">
        <label htmlFor="customAmount" className="block text-sm font-medium text-gray-700 mb-2">
          Or enter a custom amount:
        </label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
          <input
            type="number"
            id="customAmount"
            value={customAmount}
            onChange={handleCustomAmountChange}
            placeholder="0.00"
            min="1"
            step="0.01"
            className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
          />
        </div>
        <p className="text-xs text-gray-500 mt-1">Minimum donation: $1.00</p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}

      {/* Donate Button */}
      <button
        onClick={handleDonate}
        disabled={isLoading || !amount || parseFloat(amount) < 1}
        className="w-full bg-emerald-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-emerald-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
      >
        {isLoading ? (
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
            Processing...
          </div>
        ) : (
          `Donate $${amount || '0.00'}`
        )}
      </button>

      {/* Security Notice */}
      <p className="text-xs text-gray-500 text-center mt-4">
        🔒 Secure payment powered by Stripe
      </p>
    </div>
  );
};

export default DonationForm;
