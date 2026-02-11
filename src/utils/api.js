// API utility functions for making authenticated requests
import { auth } from '../firebase';

/**
 * Get the current user's Firebase ID token
 * @returns {Promise<string|null>} - ID token or null if not authenticated
 */
export async function getIdToken() {
  try {
    const user = auth.currentUser;
    if (!user) {
      return null;
    }
    return await user.getIdToken();
  } catch (error) {
    console.error('Error getting ID token:', error);
    return null;
  }
}

/**
 * Make an authenticated API request
 * @param {string} endpoint - API endpoint (e.g., '/api/global-counter/increment')
 * @param {RequestInit} options - Fetch options
 * @returns {Promise<Response>} - Fetch response
 */
export async function authenticatedFetch(endpoint, options = {}) {
  const token = await getIdToken();
  
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };
  
  // Add authorization header if token is available
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  // Determine API base URL
  const isLocalhost = typeof window !== 'undefined' && 
    (window.location.hostname === 'localhost' || 
     window.location.hostname === '127.0.0.1' || 
     window.location.hostname === '');
  
  const API_BASE_URL = isLocalhost
    ? '/api'  // Use proxy in development
    : (import.meta.env.VITE_API_URL 
        ? `${import.meta.env.VITE_API_URL}/api` 
        : '/api');
  
  const url = `${API_BASE_URL}${endpoint}`;
  
  return fetch(url, {
    ...options,
    headers,
  });
}

/**
 * Make a POST request with authentication
 * @param {string} endpoint - API endpoint
 * @param {object} data - Request body data
 * @returns {Promise<Response>} - Fetch response
 */
export async function authenticatedPost(endpoint, data) {
  return authenticatedFetch(endpoint, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

/**
 * Make a GET request with authentication
 * @param {string} endpoint - API endpoint
 * @returns {Promise<Response>} - Fetch response
 */
export async function authenticatedGet(endpoint) {
  return authenticatedFetch(endpoint, {
    method: 'GET',
  });
}

