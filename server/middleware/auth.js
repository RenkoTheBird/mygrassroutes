// Firebase Admin authentication middleware
import admin from 'firebase-admin';
import dotenv from 'dotenv';

dotenv.config();

// Initialize Firebase Admin if not already initialized
if (!admin.apps.length) {
  try {
    // Use service account from environment variable or initialize with config
    if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
      const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
    } else if (process.env.FIREBASE_PROJECT_ID) {
      // Initialize with project ID (for environments where service account is not available)
      admin.initializeApp({
        projectId: process.env.FIREBASE_PROJECT_ID,
      });
    } else {
      console.warn('[AUTH] Firebase Admin not fully configured. Token verification will be limited.');
    }
  } catch (error) {
    console.error('[AUTH] Failed to initialize Firebase Admin:', error.message);
  }
}

/**
 * Middleware to verify Firebase ID token
 * @param {boolean} required - Whether authentication is required (default: true)
 * @returns {Function} Express middleware function
 */
export const verifyFirebaseToken = (required = true) => {
  return async (req, res, next) => {
    try {
      // Get token from Authorization header
      const authHeader = req.headers.authorization;
      
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        if (required) {
          return res.status(401).json({
            error: 'Unauthorized',
            message: 'No authentication token provided',
          });
        }
        // If not required, continue without user
        req.user = null;
        return next();
      }
      
      const idToken = authHeader.split('Bearer ')[1];
      
      if (!idToken) {
        if (required) {
          return res.status(401).json({
            error: 'Unauthorized',
            message: 'Invalid token format',
          });
        }
        req.user = null;
        return next();
      }
      
      // Verify the token
      try {
        const decodedToken = await admin.auth().verifyIdToken(idToken);
        req.user = {
          uid: decodedToken.uid,
          email: decodedToken.email,
          emailVerified: decodedToken.email_verified,
        };
        next();
      } catch (error) {
        console.error('[AUTH] Token verification failed:', error.message);
        if (required) {
          return res.status(401).json({
            error: 'Unauthorized',
            message: 'Invalid or expired token',
          });
        }
        req.user = null;
        next();
      }
    } catch (error) {
      console.error('[AUTH] Authentication middleware error:', error);
      if (required) {
        return res.status(500).json({
          error: 'Internal server error',
          message: 'Authentication service error',
        });
      }
      req.user = null;
      next();
    }
  };
};

/**
 * Middleware to check if user email is verified
 */
export const requireEmailVerification = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Authentication required',
    });
  }
  
  if (!req.user.emailVerified) {
    return res.status(403).json({
      error: 'Forbidden',
      message: 'Email verification required',
    });
  }
  
  next();
};

